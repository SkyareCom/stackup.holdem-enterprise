(function(){
  const DIRECTORY_KEY='stackup-player-directory-v1';
  const clean=v=>String(v??'');
  const type=t=>clean(t?.type).toUpperCase();
  const itemCode=t=>clean(t?.itemCode||t?.payment?.reference).toUpperCase();
  const valid=t=>!['CANCELLED','VOID'].includes(clean(t?.status).toUpperCase());
  const eventId=()=>clean(window.state?.eventId);
  function directory(){try{const a=JSON.parse(localStorage.getItem(DIRECTORY_KEY)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
  function directoryForPlayer(p){if(!p)return null;const list=directory(),cpf=clean(p.directoryCpf).replace(/\D/g,'');return list.find(d=>clean(d.id)===clean(p.directoryId))||list.find(d=>cpf&&clean(d.cpf).replace(/\D/g,'')===cpf)||null}
  function tournamentPlayersForDirectory(d){if(!d)return[];const cpf=clean(d.cpf).replace(/\D/g,'');return(window.state?.players||[]).filter(p=>clean(p.directoryId)===clean(d.id)||(cpf&&clean(p.directoryCpf).replace(/\D/g,'')===cpf))}
  function transactionsForPlayers(players,event=null){const ids=new Set((players||[]).map(p=>clean(p.id)));return(window.state?.transactions||[]).filter(t=>ids.has(clean(t.playerId))&&valid(t)&&(event===null||clean(t.eventId)===clean(event)))}
  function checkinsForPlayers(players,event=null){const ids=new Set((players||[]).map(p=>clean(p.id)));return(window.state?.seatCheckins||[]).filter(c=>ids.has(clean(c.playerId))&&(event===null||clean(c.eventId)===clean(event)))}
  function latestSeatForPlayer(p,event=eventId()){if(!p)return null;return(window.state?.seatCheckins||[]).filter(c=>clean(c.playerId)===clean(p.id)&&clean(c.eventId)===clean(event)&&c.table!=null&&c.seat!=null).slice().sort((a,b)=>(+b.createdAt||0)-(+a.createdAt||0))[0]||null}
  function latestSeatForDirectory(d){const tp=tournamentPlayersForDirectory(d),checks=checkinsForPlayers(tp);return checks.filter(c=>c.table!=null&&c.seat!=null).slice().sort((a,b)=>(+b.createdAt||0)-(+a.createdAt||0))[0]||null}
  function creditPlayerForDirectory(d){if(!d)return null;try{return window.StackupWallet?.account?.({id:d.id,directoryId:d.id,name:d.name})||null}catch(_){return null}}
  function creditPlayerForPlayer(p){const d=directoryForPlayer(p);if(d)return creditPlayerForDirectory(d);try{return window.StackupWallet?.account?.({id:p?.directoryId||p?.id,directoryId:p?.directoryId||'',name:p?.name})||null}catch(_){return null}}
  function metricsFromTransactions(tx){const bountyTx=tx.filter(t=>type(t)==='BOUNTY_PAYOUT'),cardCredit=tx.filter(t=>['CARD','CREDIT_CARD','CREDITO','CRÉDITO'].includes(clean(t.payment?.method).toUpperCase())).reduce((a,t)=>a+(+(t.payment?.totalAmount??t.payment?.amount??t.value)||0),0),isPrize=t=>['PAYOUT','BOUNTY_PAYOUT'].includes(type(t)),isSpend=t=>valid(t)&&!isPrize(t)&&!['REFUND','ADJUSTMENT_CREDIT','BONUS'].includes(type(t))&&(+t.value||0)>0;return{
    buyin:tx.filter(t=>type(t)==='ENTRY').length,
    early:tx.filter(t=>type(t)==='BONUS'&&itemCode(t)==='EARLY_BONUS').length,
    rebuy1:tx.filter(t=>itemCode(t)==='REBUY_I'||(!itemCode(t)&&type(t)==='REBUY')).length,
    rebuy2:tx.filter(t=>itemCode(t)==='REBUY_II'||(!itemCode(t)&&type(t)==='DOUBLE_REBUY')).length,
    reentry:tx.filter(t=>type(t)==='REENTRY').length,
    addon1:tx.filter(t=>itemCode(t)==='ADDON_I').length,
    addon2:tx.filter(t=>itemCode(t)==='ADDON_II').length,
    addonBonus:tx.filter(t=>type(t)==='BONUS'&&itemCode(t)==='ADDON_BONUS').length,
    bounties:bountyTx.length,
    bountyValue:bountyTx.reduce((a,t)=>a+(+t.value||0),0),
    spent:tx.filter(isSpend).reduce((a,t)=>a+(+t.value||0),0),
    prizes:tx.filter(isPrize).reduce((a,t)=>a+(+t.value||0),0),
    credit:cardCredit
  }}
  function tournamentProfile(p,event=eventId()){if(!p)return null;const d=directoryForPlayer(p),tx=transactionsForPlayers([p],event),seat=latestSeatForPlayer(p,event),m=metricsFromTransactions(tx),creditPlayer=creditPlayerForPlayer(p);return{player:p,directory:d,eventId:event,identity:{name:p.name||d?.name||'',cpf:d?.cpf||p.directoryCpf||'',birth:d?.birth||p.directoryBirth||'',phone:d?.phone||p.phone||'',whatsapp:d?.whatsapp||p.directoryWhatsapp||p.phone||'',email:d?.email||p.directoryEmail||'',instagram:d?.instagram||p.directoryInstagram||''},code:p.validationCode||'',seat,metrics:m,creditPlayer:creditPlayer?.balanceBRL||0}}
  function eventHistoryForDirectory(d){const tp=tournamentPlayersForDirectory(d),tx=transactionsForPlayers(tp),checks=checkinsForPlayers(tp),map=new Map(),ensure=e=>{const k=clean(e);if(!map.has(k))map.set(k,{eventId:k,players:[],transactions:[],checkins:[]});return map.get(k)};tp.forEach(p=>ensure(p.validationEventId||eventId()).players.push(p));tx.forEach(t=>ensure(t.eventId).transactions.push(t));checks.forEach(c=>ensure(c.eventId).checkins.push(c));return[...map.values()].map(g=>{const p=g.players.slice().sort((a,b)=>(+b.createdAt||0)-(+a.createdAt||0))[0]||null,seat=g.checkins.filter(c=>c.table!=null&&c.seat!=null).slice().sort((a,b)=>(+b.createdAt||0)-(+a.createdAt||0))[0]||null,m=metricsFromTransactions(g.transactions);return{...g,player:p,seat,metrics:m,code:p?.validationCode||'',classification:p?.finishPosition||null,name:clean(g.eventId)===eventId()?(window.state?.tournamentName||'TORNEIO ATUAL'):(p?.tournamentName||p?.eventName||g.eventId||'TORNEIO')}}).sort((a,b)=>Math.max(...b.transactions.map(t=>+t.createdAt||0),...b.players.map(p=>+p.createdAt||0),0)-Math.max(...a.transactions.map(t=>+t.createdAt||0),...a.players.map(p=>+p.createdAt||0),0))}
  function careerProfile(d){const tp=tournamentPlayersForDirectory(d),tx=transactionsForPlayers(tp),m=metricsFromTransactions(tx),events=eventHistoryForDirectory(d),seat=latestSeatForDirectory(d),latest=tp.slice().sort((a,b)=>(+b.createdAt||0)-(+a.createdAt||0))[0]||null,creditPlayer=creditPlayerForDirectory(d),rankings=(window.state?.rankings||[]).filter(r=>tp.some(p=>clean(r.playerId)===clean(p.id))||clean(r.directoryId)===clean(d?.id)).sort((a,b)=>(+a.position||999999)-(+b.position||999999));return{directory:d,players:tp,events,latestPlayer:latest,latestSeat:seat,code:latest?.validationCode||'',metrics:m,tournamentsPlayed:events.filter(e=>e.metrics.buyin>0).length,prizes:m.prizes,result:m.prizes+m.bountyValue-m.spent,creditPlayer:creditPlayer?.balanceBRL||0,creditPlayerAccount:creditPlayer,ranking:rankings[0]||null}}
  function currentSeatCheckin(p,event=eventId()){const seat=latestSeatForPlayer(p,event);return seat&&clean(seat.status)==='SEATED'?seat:null}
  window.StackupPlayerProfile={DIRECTORY_KEY,directory,directoryForPlayer,tournamentPlayersForDirectory,transactionsForPlayers,checkinsForPlayers,latestSeatForPlayer,latestSeatForDirectory,currentSeatCheckin,metricsFromTransactions,tournamentProfile,eventHistoryForDirectory,careerProfile,creditPlayerForDirectory,creditPlayerForPlayer};
})();