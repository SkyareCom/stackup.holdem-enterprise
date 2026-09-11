(()=>{
'use strict';
if(window.__stackupBalancingScopeGuard)return;
window.__stackupBalancingScopeGuard=true;
const envId=()=>String(state?.activeEnvironmentId||state?.clubId||window.StackupAuth?.current?.()?.clubId||'');
const eventId=()=>String(state?.eventId||'');
const currentPlan=()=>{const event=eventId();return(event&&Array.isArray(state?.balancePlan))?state.balancePlan.filter(m=>String(m?.eventId||'')===event):[]};
const stampGeneratedPlan=()=>{const event=eventId(),environment=envId();if(!event||!Array.isArray(state?.balancePlan))return[];state.balancePlan=state.balancePlan.map(m=>({...m,eventId:event,environmentId:environment}));return currentPlan()};
const originalRecompute=window.recomputeBalancePlan;
if(typeof originalRecompute==='function')window.recomputeBalancePlan=function(...args){originalRecompute.apply(this,args);return stampGeneratedPlan()};
window.queueBalancingStaffAlerts=function(source='SYSTEM'){
  if(typeof ensureOperationalState==='function')ensureOperationalState();
  const event=eventId(),environment=envId();
  if(!event||!environment)return null;
  const plan=currentPlan();
  if(!plan.length)return null;
  const fingerprint=`${event}|${plan.map(m=>`${m.playerId}:${m.fromTable}:${m.fromSeat}:${m.toTable}:${m.toSeat}`).join('|')}`;
  if((state.staffAlerts||[]).some(a=>String(a.eventId||'')===event&&a.fingerprint===fingerprint&&a.status!=='resolved'))return null;
  const text=typeof balancingAlertText==='function'?balancingAlertText(plan):'';
  const alert={id:'alert-'+Date.now(),type:'BALANCING',eventId:event,environmentId:environment,text,fingerprint,createdAt:Date.now(),status:'pending',source};
  state.staffAlerts.unshift(alert);
  const recipients=(state.staffUsers||[]).filter(s=>s&&s.active!==false&&String(s.clubId||'')===environment&&['OWNER','TD','FLOOR'].includes(String(s.role||'').toUpperCase())&&s.phone);
  recipients.forEach(s=>enqueueMessage({channel:'WHATSAPP',kind:'BALANCING_ALERT',body:text,recipient:s.phone,source,dedupeKey:`bal-${event}-${fingerprint}-${s.id}`,category:'OPERATIONAL'}));
  if(typeof auditEvent==='function')auditEvent('BALANCING_REQUIRED',{source,count:plan.length,fingerprint,eventId:event,environmentId:environment});
  if(typeof saveState==='function')saveState();
  return alert;
};
const wrapOperations=()=>{
  const api=window.PokerOperations;
  if(!api||api.__stackupScopedBalancing)return false;
  api.__stackupScopedBalancing=true;
  const original=api.applyBalancePlan;
  if(typeof original==='function')api.applyBalancePlan=function(args={}){
    const event=eventId();
    if(!event)return{ok:false,error:'NO_ACTIVE_TOURNAMENT'};
    state.balancePlan=currentPlan();
    if(!state.balancePlan.length)return{ok:true,count:0,moves:[]};
    const foreign=(state.staffAlerts||[]).filter(a=>a.type==='BALANCING'&&String(a.eventId||'')!==event).map(a=>({a,status:a.status,resolvedAt:a.resolvedAt}));
    const result=original.call(this,args);
    foreign.forEach(x=>{x.a.status=x.status;if(x.resolvedAt===undefined)delete x.a.resolvedAt;else x.a.resolvedAt=x.resolvedAt});
    if(result?.ok&&typeof saveState==='function')saveState();
    return result;
  };
  return true;
};
if(!wrapOperations()){
  let tries=0;
  const timer=setInterval(()=>{tries++;if(wrapOperations()||tries>=80)clearInterval(timer)},50);
}
})();