(function(){
  if(typeof window==='undefined'||typeof document==='undefined')return;
  const pad=v=>String(Math.max(0,Math.floor(+v||0))).padStart(2,'0');
  function nextLevelIndex(){const a=Array.isArray(state?.structure)?state.structure:[];for(let i=(+state.levelIndex||0)+1;i<a.length;i++)if(a[i]?.type==='level')return i;return-1}
  function autoAuthorizeGate(snap){
    if(!state?.finalTableAutoConfigured||snap?.configuredMode!=='MANUAL')return;
    const g=snap.gate;
    if(!g||g.eventId!==state.eventId||g.status!=='LOCKED')return;
    const dealers=Array.isArray(state.finalTableAuthorizedDealers)?state.finalTableAuthorizedDealers:[];
    if(!dealers.length)return;
    g.mode='MANUAL';g.status='AUTHORIZED_MANUAL';g.authorizedAt=g.authorizedAt||Date.now();g.authorizedById=g.authorizedById||'TOURNAMENT_CONFIG';g.authorizedByName=g.authorizedByName||'CONFIGURAÇÃO DO TORNEIO';
    state.finalTableStructureMode='MANUAL';state.finalTableManualActive=false;state.finalTableMode='TIMER';
    if(typeof saveState==='function')saveState();
  }
  function handModeSnapshot(){
    if(!window.FinalTableHands||!state)return null;
    const snap=FinalTableHands.snapshot(state);autoAuthorizeGate(snap);
    const fresh=FinalTableHands.snapshot(state),g=fresh.gate;
    if(fresh.configuredMode!=='MANUAL'||!g||g.eventId!==state.eventId)return null;
    if(!['AUTHORIZED_MANUAL','LOCKED'].includes(String(g.status||'')))return null;
    return fresh;
  }
  function advanceLevelIfComplete(snap){
    if(!snap?.manualActive||(+snap.completed||0)<(+snap.target||0)||!snap.target)return;
    const next=nextLevelIndex();if(next<0)return;
    if(window.TournamentTimer?.setIndex)TournamentTimer.setIndex(next);else{state.levelIndex=next;if(typeof saveState==='function')saveState()}
  }
  function apply(){
    const snap=handModeSnapshot();if(!snap)return;
    const time=document.getElementById('time'),fill=document.getElementById('fill');
    if(time)time.textContent=`${pad(snap.completed)} / ${pad(snap.target)}`;
    if(fill)fill.style.width=Math.max(0,Math.min(100,(+snap.completed||0)/(+snap.target||1)*100))+'%';
    document.documentElement.dataset.castMode=snap.manualActive?'hands':'hands-waiting-dealer';
    advanceLevelIfComplete(snap);
  }
  window.StackupUnifiedFinalTable={apply,read:handModeSnapshot};
  apply();setInterval(apply,80);
  window.addEventListener('storage',apply);window.addEventListener('focus',apply);document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
})();