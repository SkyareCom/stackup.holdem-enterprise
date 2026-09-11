(function(){
  const n=v=>Math.max(0,+v||0);
  const qty=v=>{v=n(v);if(v>=1000000)return(v/1000000).toLocaleString('pt-BR',{maximumFractionDigits:2})+' M';if(v>=100000)return Math.round(v/1000)+' K';return v.toLocaleString('pt-BR')};
  const money=v=>'R$ '+n(v).toLocaleString('pt-BR');
  const currentTx=s=>(s.transactions||[]).filter(t=>t.eventId===s.eventId&&t.status!=='cancelled'&&t.status!=='void');
  const item=(t,code)=>String(t.itemCode||t.payment?.reference||'').toUpperCase()===code;
  function metrics(s){
    const tx=currentTx(s);
    const buy=tx.filter(t=>t.type==='ENTRY').length;
    const r1=tx.filter(t=>item(t,'REBUY_I')||(!t.itemCode&&!t.payment?.reference&&t.type==='REBUY')).length;
    const r2=tx.filter(t=>item(t,'REBUY_II')||(!t.itemCode&&!t.payment?.reference&&t.type==='DOUBLE_REBUY')).length;
    const re=tx.filter(t=>t.type==='REENTRY').length;
    const a1=tx.filter(t=>item(t,'ADDON_I')).length;
    const a2=tx.filter(t=>item(t,'ADDON_II')).length;
    const early=tx.filter(t=>t.type==='BONUS'&&item(t,'EARLY_BONUS')).length;
    const addonBonus=tx.filter(t=>t.type==='BONUS'&&item(t,'ADDON_BONUS')).length;
    return{tx,buy,r1,r2,re,a1,a2,early,addonBonus};
  }
  function activePlayers(s){return(s.players||[]).filter(p=>p.status==='active'&&!!p.seatedAt)}
  function alternatePlayers(s){return(s.players||[]).filter(p=>['alternate','waiting','alternate_waiting'].includes(String(p.status||'').toLowerCase()))}
  function tableCount(s,active){const explicit=n(s.activeTables||s.tableCount||s.tablesOpen);if(explicit)return explicit;const ids=new Set((active||activePlayers(s)).map(p=>String(p.table||'').trim()).filter(Boolean));return ids.size}
  function fieldCount(s,m){const ids=new Set((s.seatCheckins||[]).filter(x=>x.eventId===s.eventId&&['SEATED','ELIMINATED'].includes(x.status)).map(x=>String(x.playerId)));return ids.size+m.re}
  function totalChips(s,m){return m.buy*n(s.buyinChips||s.startingStack)+m.re*n(s.reentryChips||s.buyinChips||s.startingStack)+m.r1*n(s.rebuyChips)+m.r2*n(s.doubleRebuyChips)+m.a1*n(s.addonChips)+m.a2*n(s.specialAddonChips)+m.early*n(s.earlyBonusChips)+m.addonBonus*n(s.addonBonusChips)}
  function prizePool(s,m){let total=0;for(const t of m.tx){if(['PAYOUT','BOUNTY_PAYOUT','BONUS'].includes(t.type))continue;if(Number.isFinite(+t.breakdown?.prize)){total+=n(t.breakdown.prize);continue}if(t.type==='ENTRY')total+=n(s.buyin);else if(t.type==='REENTRY')total+=n(s.reentryValue||s.buyin);else if(item(t,'REBUY_I'))total+=n(s.rebuyValue);else if(item(t,'REBUY_II'))total+=n(s.doubleRebuyValue);else if(item(t,'ADDON_I'))total+=n(s.addonValue);else if(item(t,'ADDON_II'))total+=n(s.specialAddonValue);else if(t.type==='REBUY')total+=n(s.rebuyValue);else if(t.type==='DOUBLE_REBUY')total+=n(s.doubleRebuyValue);else if(t.type==='ADDON')total+=n(s.addonValue)}return total||n(s.prizePool)}
  function elapsedSeconds(s,snap){return s.startedAt?Math.max(0,Math.floor((Date.now()-+s.startedAt)/1000)):Math.max(0,+snap?.elapsed||+s.elapsed||0)}
  function snapshot(s=state){const m=metrics(s),active=activePlayers(s),alternates=alternatePlayers(s),field=fieldCount(s,m),chips=totalChips(s,m),snap=window.TournamentTimer?.displayed?.()||s;return{m,active,alternates,left:active.length,field,chips,avg:active.length?chips/active.length:0,tables:tableCount(s,active),alternate:alternates.length,prize:prizePool(s,m),elapsed:elapsedSeconds(s,snap),snap}}
  window.StackupCastLive={qty,money,metrics,activePlayers,alternatePlayers,tableCount,fieldCount,totalChips,prizePool,elapsedSeconds,snapshot};
})();
(function(){if(typeof document==='undefined'||document.querySelector('script[data-stackup-cast-ticker]'))return;const s=document.createElement('script');s.src='cast-ticker-engine.js?v=b4cd5c8';s.dataset.stackupCastTicker='1';document.head.appendChild(s)})();
(function(){
  if(typeof document==='undefined'||document.querySelector('script[data-stackup-screen-messages]'))return;
  const load=(src,attr,done)=>{if(document.querySelector(`script[${attr}]`)){done?.();return}const s=document.createElement('script');s.src=src;s.setAttribute(attr,'1');s.onload=()=>done?.();document.head.appendChild(s)};
  load('screen-alert-audio.js?v=72491ef','data-stackup-alert-audio',()=>load('screen-message-engine.js?v=fc8b611','data-stackup-screen-messages'));
})();
(function(){
  if(typeof document==='undefined'||document.documentElement.hasAttribute('data-stackup-ft'))return;
  const load=(src,attr,done)=>{if(document.querySelector(`script[${attr}]`)){done?.();return}const s=document.createElement('script');s.src=src;s.setAttribute(attr,'1');s.onload=()=>done?.();document.head.appendChild(s)};
  load('final-table-hands.js?v=0debf408','data-stackup-final-table-hands',()=>load('cast-unified-ft.js?v=1d35d86b','data-stackup-unified-ft'));
})();