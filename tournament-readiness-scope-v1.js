(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='tournament-readiness.html'||window.__stackupReadinessScope)return;
window.__stackupReadinessScope=true;
function install(){
  if(typeof window.buildAudit!=='function'||typeof window.render!=='function')return false;
  const original=window.buildAudit;
  if(original.__stackupScoped)return true;
  function scopedBuildAudit(){
    const event=String(state.eventId||''),environment=String(state.activeEnvironmentId||state.clubId||window.StackupAuth?.current?.()?.clubId||'');
    const backup={players:state.players,balancePlan:state.balancePlan,staffUsers:state.staffUsers,authMemberships:state.authMemberships,authPeople:state.authPeople};
    const memberships=Array.isArray(backup.authMemberships)?backup.authMemberships.filter(m=>!environment||String(m.clubId||'')===environment):[];
    const peopleIds=new Set(memberships.map(m=>String(m.personId||'')));
    try{
      state.players=event&&typeof currentTournamentPlayers==='function'?currentTournamentPlayers():[];
      state.balancePlan=event&&Array.isArray(backup.balancePlan)?backup.balancePlan.filter(m=>String(m.eventId||'')===event):[];
      state.staffUsers=Array.isArray(backup.staffUsers)?backup.staffUsers.filter(s=>!environment||String(s.clubId||'')===environment):[];
      state.authMemberships=memberships;
      state.authPeople=Array.isArray(backup.authPeople)?backup.authPeople.filter(p=>peopleIds.has(String(p.id||''))):[];
      return original();
    }finally{
      state.players=backup.players;state.balancePlan=backup.balancePlan;state.staffUsers=backup.staffUsers;state.authMemberships=backup.authMemberships;state.authPeople=backup.authPeople;
    }
  }
  scopedBuildAudit.__stackupScoped=true;
  window.buildAudit=scopedBuildAudit;
  window.render();
  return true;
}
if(!install()){
  let tries=0;
  const timer=setInterval(()=>{tries++;if(install()||tries>=80)clearInterval(timer)},50);
}
})();