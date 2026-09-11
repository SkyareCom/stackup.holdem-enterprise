(function(){
  if(!window.PokerOperations)return;
  const base=window.PokerOperations;
  function ensure(){base.ensure();state.pkoCashPercent=Number.isFinite(+state.pkoCashPercent)?Math.max(0,Math.min(100,+state.pkoCashPercent)):50}
  function syncFinalTableGate(){try{window.FinalTableHands?.ensure?.();return window.FinalTableHands?.snapshot?.()||null}catch(_){return null}}
  function lastReentryAt(playerId){return (state.transactions||[]).filter(t=>t.eventId===state.eventId&&t.playerId===playerId&&t.type==='REENTRY').reduce((m,t)=>Math.max(m,+t.createdAt||0),0)}
  function occurrence(player){return `${player.id}:${+player.eliminatedAt||0}`}
  function allowedBountyStaff(staff){return !!staff?.id&&['OWNER','GESTOR','TD','FLOOR','CASHIER','DEALER'].includes(staff.role)}
  function currentBountyValue(player){if(!player)return 0;if(Number.isFinite(+player.currentBounty))return Math.max(0,+player.currentBounty);return base.bountyEnabled()?Math.max(0,+state.bountyValue||0):0}
  function awardBounty({winnerId,eliminatedId,value=null,staff=null,source='TOURNAMENT_ENGINE'}){
    ensure();
    if(!base.bountyEnabled())return{ok:false,error:'ESTE TORNEIO NÃO POSSUI BOUNTY ATIVO.'};
    if(!allowedBountyStaff(staff))return{ok:false,error:'RESPONSÁVEL SEM PERMISSÃO PARA REGISTRAR BOUNTY.',code:'FORBIDDEN'};
    const winner=base.playerById(winnerId),eliminated=base.playerById(eliminatedId);
    if(!winner||!eliminated)return{ok:false,error:'JOGADOR VENCEDOR OU ELIMINADO NÃO ENCONTRADO.'};
    if(winner.id===eliminated.id)return{ok:false,error:'JOGADORES INVÁLIDOS PARA BOUNTY.'};
    if(winner.status!=='active')return{ok:false,error:'O VENCEDOR DO BOUNTY PRECISA ESTAR ATIVO.'};
    if(eliminated.status!=='eliminated'||!eliminated.eliminatedAt)return{ok:false,error:'O JOGADOR ALVO PRECISA ESTAR ELIMINADO NA OCORRÊNCIA ATUAL.'};
    const occ=occurrence(eliminated),reentryAt=lastReentryAt(eliminated.id);
    const duplicate=(state.transactions||[]).find(t=>t.eventId===state.eventId&&t.type==='BOUNTY_PAYOUT'&&(t.eliminationOccurrence===occ||(!t.eliminationOccurrence&&t.eliminatedPlayerId===eliminated.id&&(+t.createdAt||0)>reentryAt)));
    if(duplicate)return{ok:false,error:'BOUNTY DESTA ELIMINAÇÃO JÁ REGISTRADO.',code:'DUPLICATE_BOUNTY'};
    const victimBounty=currentBountyValue(eliminated),baseValue=value===null?victimBounty:Math.max(0,+value||0);
    if(baseValue<=0)return{ok:false,error:'ESTA OCORRÊNCIA NÃO POSSUI BOUNTY ATIVO.',code:'NO_ACTIVE_BOUNTY'};
    const pct=state.tournamentFormat==='PKO'?state.pkoCashPercent:100,paid=baseValue*(pct/100),carry=baseValue-paid;
    if(state.tournamentFormat==='PKO')winner.currentBounty=currentBountyValue(winner)+carry;
    eliminated.currentBounty=0;
    const now=Date.now(),tx={id:'tx-'+now+'-'+Math.random().toString(36).slice(2,7),eventId:state.eventId,operator:staff.id,playerId:winner.id,playerName:winner.name,type:'BOUNTY_PAYOUT',value:paid,breakdown:base.transactionBreakdown('BOUNTY_PAYOUT',paid),eliminatedPlayerId:eliminated.id,eliminatedPlayerName:eliminated.name,eliminationOccurrence:occ,eliminatedAt:+eliminated.eliminatedAt||0,pkCarry:carry,pkoCashPercent:pct,createdAt:now,source};
    state.transactions.unshift(tx);winner.bountiesWon=(+winner.bountiesWon||0)+1;winner.bountyWinnings=(+winner.bountyWinnings||0)+paid;
    auditEvent('BOUNTY_AWARDED',{source,operator:staff.id,winnerId:winner.id,eliminatedId:eliminated.id,eliminationOccurrence:occ,value:paid,pkCarry:carry,pkoCashPercent:pct,format:state.tournamentFormat});
    if(state.tournamentFormat==='PKO')auditEvent('PKO_BOUNTY_UPDATED',{source,operator:staff.id,playerId:winner.id,currentBounty:winner.currentBounty});
    auditEvent('PLAYER_BOUNTY_CHANGED',{source,operator:staff.id,playerId:eliminated.id,currentBounty:0});
    saveState();return{ok:true,transaction:tx,winner,eliminated,paid,carry,occurrence:occ,baseValue,pkoCashPercent:pct};
  }
  function eliminatePlayer(args){
    ensure();const {playerId,staff,source='TOURNAMENT_ENGINE',killerId=null,skipBounty=false}=args||{},p=base.activePlayer(playerId);if(!p)return{ok:false,error:'JOGADOR ATIVO NÃO ENCONTRADO.'};
    const activeBounty=base.bountyEnabled()?currentBountyValue(p):0,bountyRequired=activeBounty>0&&!skipBounty&&!['PRESENCE_NO_SHOW','ADMIN_NO_SHOW','TOURNAMENT_CLOSE'].includes(source);
    if(bountyRequired&&!allowedBountyStaff(staff))return{ok:false,error:'RESPONSÁVEL SEM PERMISSÃO PARA REGISTRAR O BOUNTY DESTA ELIMINAÇÃO.',code:'FORBIDDEN'};
    if(bountyRequired&&!killerId)return{ok:false,error:'SELECIONE QUEM ELIMINOU O JOGADOR ANTES DE CONFIRMAR.',code:'KILLER_REQUIRED'};
    if(killerId){const killer=base.activePlayer(killerId);if(!killer||killer.id===p.id)return{ok:false,error:'KILLER INVÁLIDO.',code:'INVALID_KILLER'};if(+killer.table!==+p.table)return{ok:false,error:'O KILLER PRECISA ESTAR NA MESMA MESA DA ELIMINAÇÃO.',code:'KILLER_TABLE_MISMATCH'}}
    const out=base.eliminatePlayer({playerId,staff,source});if(!out.ok)return out;
    if(activeBounty>0&&killerId){const b=awardBounty({winnerId:killerId,eliminatedId:playerId,value:activeBounty,staff,source});if(!b.ok)return{...out,bountyError:b.error,bountyCode:b.code,ok:false,error:`ELIMINAÇÃO REGISTRADA, MAS O BOUNTY FALHOU: ${b.error}`};out.bounty=b}
    out.finalTable=syncFinalTableGate();return out;
  }
  const originalReenter=base.reenterPlayer;
  function reenterPlayer(args){
    ensure();const p=base.playerById(args?.playerId);if(!p)return{ok:false,error:'JOGADOR NÃO ENCONTRADO.'};
    const out=originalReenter(args);if(!out.ok)return out;
    if(base.bountyEnabled())p.currentBounty=state.bountyOnReentry?(+state.bountyValue||0):0;
    const authenticated=window.StackupAuth?.staffForSession?.(),operator=args?.staff?.id||authenticated?.id||state.operator||'';
    auditEvent('PLAYER_BOUNTY_CHANGED',{source:args?.source||'TOURNAMENT_ENGINE',operator,playerId:p.id,currentBounty:+p.currentBounty||0,reason:'REENTRY'});
    saveState();syncFinalTableGate();return out;
  }
  window.PokerOperations={...base,awardBounty,eliminatePlayer,reenterPlayer,currentBountyValue,syncFinalTableGate};
})();

(function(){
  if(typeof document==='undefined'||typeof location==='undefined')return;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const loadScript=(src,key,onload)=>{if(document.querySelector(`script[data-stackup-loader="${key}"]`)){onload?.();return}const existing=[...document.scripts].find(s=>(s.getAttribute('src')||'').split('?')[0].endsWith(src.split('?')[0]));if(existing){if(onload)existing.addEventListener('load',onload,{once:true});return}const s=document.createElement('script');s.src=src;s.dataset.stackupLoader=key;if(onload)s.onload=onload;document.head.appendChild(s)};
  const loadDealerRequests=()=>{if(page==='dealer.html')loadScript('dealer-requests.js?v=9ada5b8','dealer-requests')};
  const loadDealerUi=()=>{if(page!=='dealer.html')return;loadScript('final-table-dealer.js?v=1f97ba648605b50d58805397732b73332d18f2ee','final-table-dealer-ui')};
  loadScript('request-center.js?v=cbfa36a','request-center',loadDealerRequests);
  if(window.FinalTableHands){window.FinalTableHands.ensure?.();loadDealerUi();return}
  loadScript('final-table-hands.js?v=3e03cb3333f16dbdb5735343fb47edd2c2853454','final-table-hands',()=>{window.FinalTableHands?.ensure?.();loadDealerUi()});
})();