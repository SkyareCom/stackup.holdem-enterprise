const fs=require('fs');
const vm=require('vm');

const storage=new Map();
const sandbox={
  console,
  location:{pathname:'/index.html'},
  localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
  BroadcastChannel:class{constructor(){} postMessage(){} close(){}},
  setTimeout,clearTimeout,setInterval,clearInterval
};
sandbox.window=sandbox;
sandbox.window.addEventListener=()=>{};
vm.createContext(sandbox);
for(const file of ['shared.js','validation.js','operations.js','tournament-engine.js','timer-engine.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
}

const testCode=`
(function(){
  const TD={id:'qa-td',name:'QA TD',role:'TD',active:true};
  const DEALER={id:'qa-dealer',name:'QA DEALER',role:'DEALER',active:true};
  let passed=0,total=0;
  function ok(name,condition){total++;if(!condition)throw new Error('FAIL: '+name);passed++;console.log('PASS:',name)}
  function fresh(extra={}){state={...clone(DEFAULT_STATE),eventId:'qa-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),tournamentName:'QA TOURNAMENT',clubName:'QA CLUB',staffUsers:[TD,DEALER],players:[],transactions:[],auditLog:[],messageQueue:[],messageLog:[],staffAlerts:[],botCommands:[],balancePlan:[],tableMovements:[],seatCheckins:[],validationLog:[],...extra};ensureOperationalState();ValidationCodes.ensureValidationState();PokerOperations.ensure();TournamentTimer.ensure();}
  function register(name){const r=PokerOperations.registerTournamentPlayer({name,transactionalConsent:false,marketingConsent:false,staff:TD,source:'QA'});if(!r.ok)throw new Error('REGISTER '+name+': '+r.error);return r.player}

  fresh({tournamentFormat:'REGULAR',buyin:500,fee:50,seatsPerTable:9});
  const r1=register('ALFA');
  ok('REGISTRO + BUY-IN',state.players.length===1&&state.transactions.filter(t=>t.type==='ENTRY').length===1);
  ok('LEDGER CLASSIFICADO',state.transactions[0].breakdown.classification==='CLASSIFIED'&&state.transactions[0].value===550);
  const dup=PokerOperations.addTournamentTransaction({playerId:r1.id,type:'ENTRY',staff:TD,source:'QA'});
  ok('BUY-IN DUPLICADO BLOQUEADO',dup.ok===false&&dup.code==='DUPLICATE_ENTRY');

  fresh({tournamentFormat:'PKO',bountyValue:100,bountyOnReentry:true,pkoCashPercent:50,buyin:500,fee:50,reentryValue:500,seatsPerTable:9});
  const a=register('ALFA'),b=register('BRAVO'),c=register('CHARLIE');
  PokerOperations.confirmSeat({playerId:a.id,staff:DEALER,source:'QA'});PokerOperations.confirmSeat({playerId:b.id,staff:DEALER,source:'QA'});PokerOperations.confirmSeat({playerId:c.id,staff:DEALER,source:'QA'});
  ok('PRESENÇA SEATED',state.seatCheckins.filter(x=>x.status==='SEATED').length===3);
  const ko1=PokerOperations.eliminatePlayer({playerId:b.id,killerId:a.id,staff:DEALER,source:'QA'});
  ok('PKO KNOCKOUT',ko1.ok&&!!ko1.bounty&&b.status==='eliminated');
  ok('PKO 50/50',Math.abs(ko1.bounty.paid-50)<.01&&Math.abs(ko1.bounty.carry-50)<.01);
  ok('BOUNTY DO KILLER PROGRIDE',Math.abs(a.currentBounty-150)<.01);
  ok('BOUNTY DA VÍTIMA ZERA',b.currentBounty===0);
  const duplicate=PokerOperations.awardBounty({winnerId:a.id,eliminatedId:b.id,staff:DEALER,source:'QA'});
  ok('BOUNTY DUPLICADO BLOQUEADO',duplicate.ok===false&&duplicate.code==='DUPLICATE_BOUNTY');
  const re1=PokerOperations.reenterPlayer({playerId:b.id,staff:TD,source:'QA'});
  ok('REENTRADA COM BOUNTY',re1.ok&&b.currentBounty===100&&re1.transaction.value===600);
  PokerOperations.confirmSeat({playerId:b.id,staff:DEALER,source:'QA'});
  const ko2=PokerOperations.eliminatePlayer({playerId:b.id,killerId:a.id,staff:DEALER,source:'QA'});
  ok('SEGUNDO KO APÓS REENTRADA',ko2.ok&&state.transactions.filter(t=>t.type==='BOUNTY_PAYOUT'&&t.eliminatedPlayerId===b.id).length===2);
  state.bountyOnReentry=false;
  const re2=PokerOperations.reenterPlayer({playerId:b.id,staff:TD,source:'QA'});
  ok('REENTRADA SEM BOUNTY',re2.ok&&b.currentBounty===0&&re2.transaction.value===500);
  PokerOperations.confirmSeat({playerId:b.id,staff:DEALER,source:'QA'});
  const noBountyKo=PokerOperations.eliminatePlayer({playerId:b.id,staff:DEALER,source:'QA'});
  ok('KO SEM KILLER COM BOUNTY ZERO',noBountyKo.ok&&!noBountyKo.bounty);

  fresh({tournamentFormat:'REGULAR',seatsPerTable:6});
  for(let i=1;i<=7;i++)register('P'+i);
  const plan=recomputeBalancePlan();
  ok('BALANCING GERADO',plan.length>0);
  const applied=PokerOperations.applyBalancePlan({source:'QA'});
  ok('BALANCING APLICADO',applied.ok&&applied.count>0);
  ok('DESTINO EXIGE NOVO CHECK-IN',state.tableMovements.some(m=>m.status==='AWAITING_DESTINATION_CHECKIN'));

  fresh({structure:[{type:'level',label:'NÍVEL 1',duration:60,sb:100,bb:200,ante:200},{type:'break',label:'BREAK',duration:30},{type:'level',label:'NÍVEL 2',duration:60,sb:200,bb:400,ante:400}],remaining:60,elapsed:0,levelIndex:0,running:false});
  TournamentTimer.ensure();TournamentTimer.setRunning(true);
  const advanced=TournamentTimer.advanceIfNeeded(Date.now()+95000);
  ok('TIMER RECUPERA NÍVEL + BREAK',advanced.levelIndex===2&&advanced.remaining===55);
  ok('TIMER ELAPSED COERENTE',advanced.elapsed>=95);

  fresh({tournamentFormat:'BOUNTY',bountyValue:100,bountyOnReentry:false});
  const x=register('X'),y=register('Y');PokerOperations.confirmSeat({playerId:x.id,staff:DEALER,source:'QA'});PokerOperations.confirmSeat({playerId:y.id,staff:DEALER,source:'QA'});
  const missingKiller=PokerOperations.eliminatePlayer({playerId:y.id,staff:DEALER,source:'QA'});
  ok('BOUNTY ATIVO EXIGE KILLER',missingKiller.ok===false&&missingKiller.code==='KILLER_REQUIRED');

  console.log('SMOKE TEST:',passed+'/'+total,'PASS');
})();`;

try{vm.runInContext(testCode,sandbox,{filename:'tournament-smoke-inline.js'});}catch(err){console.error(err.stack||err);process.exit(1);}
