const fs=require('fs');
const vm=require('vm');
const storage=new Map();
const sandbox={console,location:{pathname:'/control.html'},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},BroadcastChannel:class{constructor(){}postMessage(){}close(){}},setTimeout,clearTimeout,setInterval,clearInterval};
sandbox.window=sandbox;sandbox.window.addEventListener=()=>{};
vm.createContext(sandbox);
for(const file of ['shared.js','operations.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
const code=`(()=>{
const staff={id:'td-a',name:'TD A',role:'TD'};
state={...clone(DEFAULT_STATE),eventId:'event-A',tournamentName:'EVENTO A',seatsPerTable:9,players:[
{id:'a1',name:'A1',validationEventId:'event-A',status:'active',table:1,seat:1,seatStatus:'ASSIGNED'},
{id:'b1',name:'B1',validationEventId:'event-B',status:'active',table:1,seat:1,seatStatus:'SEATED'},
{id:'legacy',name:'SEM EVENTO',status:'active',table:1,seat:1,seatStatus:'SEATED'}
],transactions:[{id:'btx',eventId:'event-B',playerId:'b1',type:'REBUY',value:100}],seatCheckins:[],tableMovements:[],staffAlerts:[],auditLog:[],messageQueue:[],messageLog:[],balancePlan:[]};
ensureOperationalState();PokerOperations.ensure();
const assert=(n,c)=>{if(!c)throw new Error('FAIL: '+n);console.log('PASS:',n)};
assert('LISTA DO TORNEIO EXCLUI OUTRO EVENTO E LEGADO SEM EVENTO',currentTournamentPlayers().length===1&&currentTournamentPlayers()[0].id==='a1');
assert('LISTA ATIVA EXCLUI OUTRO EVENTO',activeTournamentPlayers().length===1&&activeTournamentPlayers()[0].id==='a1');
assert('PLAYER BY ID NÃO ATRAVESSA EVENTOS',PokerOperations.playerById('b1')===null);
const before=state.transactions.length,foreign=PokerOperations.addTournamentTransaction({playerId:'b1',type:'REBUY',value:100,staff,source:'QA_ISOLATION'});
assert('TRANSAÇÃO EM JOGADOR DE OUTRO EVENTO É BLOQUEADA',foreign.ok===false&&state.transactions.length===before);
const seated=PokerOperations.confirmSeat({playerId:'a1',staff,source:'QA_ISOLATION'});
assert('ASSENTO IGUAL EM OUTRO EVENTO NÃO BLOQUEIA O ATUAL',seated.ok===true&&state.seatCheckins.length===1);
syncTournamentCounts();
assert('CONTADORES IGNORAM TRANSAÇÕES DE OUTRO EVENTO',state.field===1&&state.playersLeft===1&&state.rebuys===0);
state.eventId='';syncTournamentCounts();
assert('SEM TORNEIO ATIVO NÃO HÁ JOGADORES OPERACIONAIS',currentTournamentPlayers().length===0&&state.field===0&&state.playersLeft===0);
console.log('TOURNAMENT ISOLATION RUNTIME PASS');
})();`;
try{vm.runInContext(code,sandbox,{filename:'tournament-isolation-runtime-inline.js'})}catch(e){console.error(e.stack||e);process.exit(1)}