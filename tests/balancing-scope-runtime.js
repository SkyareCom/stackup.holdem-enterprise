const fs=require('fs');
const vm=require('vm');
const storage=new Map();
const sandbox={console,location:{pathname:'/balancing.html'},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},BroadcastChannel:class{constructor(){}postMessage(){}close(){}},setTimeout,clearTimeout,setInterval,clearInterval};
sandbox.window=sandbox;sandbox.window.addEventListener=()=>{};
vm.createContext(sandbox);
for(const file of ['shared.js','operations.js','balancing-scope-guard-v1.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
const code=`(()=>{
const assert=(n,c)=>{if(!c)throw new Error('FAIL: '+n);console.log('PASS:',n)};
state={...clone(DEFAULT_STATE),eventId:'event-A',tournamentName:'EVENTO A',clubId:'club-A',activeEnvironmentId:'club-A',players:[
{id:'a1',name:'A1',validationEventId:'event-A',status:'active',table:1,seat:1},
{id:'a2',name:'A2',validationEventId:'event-A',status:'active',table:1,seat:2}
],staffUsers:[
{id:'td-a',name:'TD A',role:'TD',clubId:'club-A',active:true,phone:'5511999991111'},
{id:'floor-a',name:'FLOOR A',role:'FLOOR',clubId:'club-A',active:true,phone:'5511999992222'},
{id:'td-b',name:'TD B',role:'TD',clubId:'club-B',active:true,phone:'5511999993333'}
],transactions:[],auditLog:[],messageQueue:[],messageLog:[],staffAlerts:[{id:'foreign',type:'BALANCING',eventId:'event-B',environmentId:'club-B',fingerprint:'event-B|same',status:'pending'}],balancePlan:[{eventId:'event-A',environmentId:'club-A',playerId:'a1',playerName:'A1',fromTable:1,fromSeat:1,toTable:2,toSeat:1,reason:'QA'}]};
ensureOperationalState();
const alert=queueBalancingStaffAlerts('QA_SCOPE');
assert('ALERTA É CRIADO PARA O EVENTO ATUAL',alert&&alert.eventId==='event-A'&&alert.environmentId==='club-A');
const recipients=state.messageQueue.filter(m=>m.kind==='BALANCING_ALERT').map(m=>m.recipient).sort();
assert('SÓ STAFF DO AMBIENTE ATUAL RECEBE ALERTA',recipients.length===2&&recipients.includes('5511999991111')&&recipients.includes('5511999992222')&&!recipients.includes('5511999993333'));
assert('ALERTA DE OUTRO EVENTO PERMANECE PENDENTE',state.staffAlerts.find(a=>a.id==='foreign')?.status==='pending');
const before=state.staffAlerts.length;queueBalancingStaffAlerts('QA_SCOPE');
assert('DUPLICATA DO MESMO EVENTO É BLOQUEADA',state.staffAlerts.length===before);
state.balancePlan=[{eventId:'event-B',environmentId:'club-B',playerId:'b1',fromTable:1,fromSeat:1,toTable:2,toSeat:1}];
assert('PLANO DE OUTRO EVENTO NÃO É RETAGUEADO',queueBalancingStaffAlerts('QA_STALE')===null&&state.balancePlan[0].eventId==='event-B');
console.log('BALANCING SCOPE RUNTIME PASS');
})();`;
try{vm.runInContext(code,sandbox,{filename:'balancing-scope-runtime-inline.js'})}catch(e){console.error(e.stack||e);process.exit(1)}