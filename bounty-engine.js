(function(){
  if(!window.PokerOperations)return;
  const base=window.PokerOperations;
  function currentOccurrence(player){return `${player.id}:${+player.eliminatedAt||0}`}
  function lastReentryAt(playerId){return (state.transactions||[]).filter(t=>t.eventId===state.eventId&&t.playerId===playerId&&t.type==='REENTRY').reduce((m,t)=>Math.max(m,+t.createdAt||0),0)}
  function awardBounty({winnerId,eliminatedId,value=null,staff=null,source='BOUNTY_CONTROL'}){
    base.ensure();
    if(!base.bountyEnabled())return{ok:false,error:'Este torneio não possui bounty ativo.'};
    const winner=base.playerById(winnerId),eliminated=base.playerById(eliminatedId);
    if(!winner||!eliminated)return{ok:false,error:'Jogador vencedor ou eliminado não encontrado.'};
    if(winner.id===eliminated.id)return{ok:false,error:'Jogadores inválidos para bounty.'};
    if(eliminated.status!=='eliminated'||!eliminated.eliminatedAt)return{ok:false,error:'O jogador alvo precisa estar eliminado na ocorrência atual.'};
    const occurrence=currentOccurrence(eliminated),reentryAt=lastReentryAt(eliminated.id);
    const duplicate=(state.transactions||[]).find(t=>t.eventId===state.eventId&&t.type==='BOUNTY_PAYOUT'&&(
      t.eliminationOccurrence===occurrence ||
      (!t.eliminationOccurrence&&t.eliminatedPlayerId===eliminated.id&&(+t.createdAt||0)>reentryAt)
    ));
    if(duplicate)return{ok:false,error:'Bounty desta eliminação já registrado.',code:'DUPLICATE_BOUNTY'};
    const baseValue=value===null?(+state.bountyValue||0):(+value||0);
    if(baseValue<=0)return{ok:false,error:'Valor de bounty inválido.'};
    let paid=baseValue,carry=0;
    if(state.tournamentFormat==='PKO'){
      paid=baseValue/2;carry=baseValue-paid;
      winner.currentBounty=(+winner.currentBounty||+state.bountyValue||0)+carry;
    }
    const now=Date.now(),tx={id:'tx-'+now+'-'+Math.random().toString(36).slice(2,7),eventId:state.eventId,operator:staff?.id||state.operator||'LOCAL',playerId:winner.id,playerName:winner.name,type:'BOUNTY_PAYOUT',value:paid,breakdown:base.transactionBreakdown('BOUNTY_PAYOUT',paid),eliminatedPlayerId:eliminated.id,eliminatedPlayerName:eliminated.name,eliminationOccurrence:occurrence,eliminatedAt:+eliminated.eliminatedAt||0,pkCarry:carry,createdAt:now,source};
    state.transactions.unshift(tx);winner.bountiesWon=(+winner.bountiesWon||0)+1;winner.bountyWinnings=(+winner.bountyWinnings||0)+paid;
    auditEvent('BOUNTY_AWARDED',{source,operator:staff?.id||state.operator||'LOCAL',winnerId:winner.id,eliminatedId:eliminated.id,eliminationOccurrence:occurrence,value:paid,pkCarry:carry,format:state.tournamentFormat});
    saveState();return{ok:true,transaction:tx,winner,eliminated,paid,carry,occurrence};
  }
  window.PokerOperations={...base,awardBounty};
})();