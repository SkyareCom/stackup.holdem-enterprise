const STORAGE_KEY="poker-club-state-v4";
const CHANNEL_NAME="poker-club-state-v4";

const DEFAULT_STATE={
  eventId:"",operator:"",tournamentName:"",clubName:"",gameType:"",tournamentFormat:"",bountyValue:0,bountyOnReentry:false,
  running:false,prepared:false,levelIndex:0,remaining:0,elapsed:0,playersLeft:0,field:0,rebuys:0,doubleRebuys:0,reentries:0,addons:0,
  prizePool:0,guaranteed:0,paidPlaces:0,lateRegLevel:0,avgStack:0,chipLeader:0,startingStack:0,buyin:0,fee:0,
  reentryValue:0,rebuyValue:0,doubleRebuyValue:0,addonValue:0,earlyBonusValue:0,earlyBonusChips:0,addonBonusValue:0,addonBonusChips:0,seatsPerTable:"",language:"pt",soundOn:false,autoVoice:false,currentAnnouncement:"",transition:null,startedAt:null,lastTickAt:null,
  players:[],staffUsers:[],tables:[],transactions:[],auditLog:[],messageQueue:[],messageLog:[],staffContacts:{floor:"",td:""},staffAlerts:[],botCommands:[],balancePlan:[],tableMovements:[],tableButtons:{},seatCheckins:[],paymentIntents:[],walletTransactions:[],validationLog:[],
  rankings:[],loyaltyAccounts:[],campaigns:[],playerCommunications:[],cashTables:[],cashSessions:[],cashTransactions:[],
  structure:[{type:"level",label:"NÍVEL 1",duration:0,sb:0,bb:0,ante:0}],
  announcements:{fiveMin:true,oneMin:true,tenSec:true,levelChange:true,breakStart:true,breakEnd:true,lateRegClose:true}
};
function clone(o){return JSON.parse(JSON.stringify(o))}
function loadState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");if(!saved)return clone(DEFAULT_STATE);return {...clone(DEFAULT_STATE),...saved,staffContacts:{...DEFAULT_STATE.staffContacts,...(saved.staffContacts||{})},announcements:{...DEFAULT_STATE.announcements,...(saved.announcements||{})}}}catch(e){return clone(DEFAULT_STATE)}}
let state=loadState();
const bc=("BroadcastChannel" in window)?new BroadcastChannel(CHANNEL_NAME):null;
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));if(bc)bc.postMessage(state)}
if(bc)bc.onmessage=e=>{state={...state,...e.data};if(window.onPokerStateChange)window.onPokerStateChange(state)};
window.addEventListener("storage",e=>{if(e.key===STORAGE_KEY){state=loadState();if(window.onPokerStateChange)window.onPokerStateChange(state)}});
function ensureOperationalState(){for(const k of ['players','staffUsers','tables','transactions','auditLog','messageQueue','messageLog','staffAlerts','botCommands','balancePlan','tableMovements','seatCheckins','paymentIntents','walletTransactions','validationLog','rankings','loyaltyAccounts','campaigns','playerCommunications','cashTables','cashSessions','cashTransactions'])if(!Array.isArray(state[k]))state[k]=[];state.staffContacts=state.staffContacts||{floor:'',td:''};state.tableButtons=state.tableButtons||{};if(!state.eventId&&(state.prepared||state.tournamentName||state.selectedTournamentId))state.eventId='event-'+Date.now();state.operator=state.operator||'';state.tournamentFormat=state.tournamentFormat||'';state.bountyValue=+state.bountyValue||0;state.bountyOnReentry=!!state.bountyOnReentry;state.earlyBonusValue=+state.earlyBonusValue||0;state.earlyBonusChips=+state.earlyBonusChips||0;state.addonBonusValue=+state.addonBonusValue||0;state.addonBonusChips=+state.addonBonusChips||0}
const STAFF_ROLES={OWNER:{label:'OWNER',permissions:['*']},TD:{label:'TOURNAMENT DIRECTOR',permissions:['TOURNAMENT','PLAYERS','BALANCING','MESSAGING','RESULTS']},FLOOR:{label:'FLOOR',permissions:['PLAYERS','BALANCING','MESSAGING']},CASHIER:{label:'CASHIER',permissions:['FINANCE','WALLET','PAYMENTS']},DEALER:{label:'DEALER',permissions:['REPORT_ELIMINATION','REPORT_ACTION']},VIEWER:{label:'VIEWER',permissions:['READ_ONLY']}};
function auditEvent(type,payload={}){ensureOperationalState();const row={id:'audit-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),eventId:state.eventId,operator:payload.operator||state.operator||'',type,source:payload.source||'APP',createdAt:Date.now(),...payload};state.auditLog.unshift(row);return row}
function enqueueMessage({playerId=null,channel='WHATSAPP',kind='INFO',body='',recipient='',source='SYSTEM',dedupeKey='',category='TRANSACTIONAL'}){ensureOperationalState();if(dedupeKey&&state.messageQueue.some(m=>m.dedupeKey===dedupeKey&&['queued','opened','sent','delivered'].includes(m.status)))return null;const m={id:'mq-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),eventId:state.eventId,playerId,channel,kind,body,recipient,source,dedupeKey,category,createdAt:Date.now(),status:'queued'};state.messageQueue.unshift(m);return m}
function ensurePlayerCRM(player){if(!player)return null;if(typeof player.marketingConsent!=='boolean')player.marketingConsent=false;if(typeof player.transactionalConsent!=='boolean')player.transactionalConsent=true;if(!player.preferredChannel)player.preferredChannel='WHATSAPP';if(!player.crmStatus)player.crmStatus='ACTIVE';let loyalty=state.loyaltyAccounts.find(x=>x.playerId===player.id);if(!loyalty){loyalty={playerId:player.id,points:0,tier:'BASE',updatedAt:Date.now()};state.loyaltyAccounts.push(loyalty)}return loyalty}
function playerPerformance(playerId){const tx=state.transactions.filter(t=>t.playerId===playerId),invested=tx.filter(t=>t.type!=='PAYOUT').reduce((a,t)=>a+(+t.value||0),0),payout=tx.filter(t=>t.type==='PAYOUT').reduce((a,t)=>a+(+t.value||0),0),profit=payout-invested,entries=tx.filter(t=>['ENTRY','REENTRY'].includes(t.type)).length;const rank=state.rankings.find(r=>r.playerId===playerId)||{};return{invested,payout,profit,roi:invested?profit/invested*100:0,entries,rankingPoints:+rank.points||0,rankingPosition:+rank.position||0}}
function playerEventId(p){return String(p?.eventId||p?.validationEventId||'')}
function currentTournamentPlayers(){const event=String(state.eventId||'');if(!event)return[];return state.players.filter(p=>playerEventId(p)===event)}
function activeTournamentPlayers(){return currentTournamentPlayers().filter(p=>p.status==='active')}
function tournamentTableGroups(players=activeTournamentPlayers()){const g={};players.forEach(p=>(g[p.table]??=[]).push(p));return g}
function syncTournamentCounts(){const event=String(state.eventId||''),players=currentTournamentPlayers(),tx=event?state.transactions.filter(t=>String(t.eventId||'')===event):[];state.field=players.length;state.playersLeft=players.filter(p=>p.status==='active').length;state.rebuys=tx.filter(t=>t.type==='REBUY').length;state.doubleRebuys=tx.filter(t=>t.type==='DOUBLE_REBUY').length;state.reentries=tx.filter(t=>t.type==='REENTRY').length;state.addons=tx.filter(t=>t.type==='ADDON').length}
function tableButtonSeat(table,sim){const arr=(sim[table]||[]).slice().sort((a,b)=>+a.seat-+b.seat);if(!arr.length)return 1;return +state.tableButtons[table]||+arr[0].seat}
function seatPosition(table,seat,sim){const arr=(sim[table]||[]).slice().sort((a,b)=>+a.seat-+b.seat),seats=arr.map(p=>+p.seat),btn=tableButtonSeat(table,sim);if(!seats.length)return'';const after=seats.filter(s=>s>btn).concat(seats.filter(s=>s<=btn)),sb=after[0],bb=after[1]??after[0];return +seat===btn?'BTN':+seat===sb?'SB':+seat===bb?'BB':''}
function nextBigBlindPlayerShared(table,sim){const arr=(sim[table]||[]).slice().sort((a,b)=>+a.seat-+b.seat);if(!arr.length)return null;const btn=tableButtonSeat(table,sim),seats=arr.map(p=>+p.seat),after=seats.filter(s=>s>btn).concat(seats.filter(s=>s<=btn)),bb=after[1]??after[0];return arr.find(p=>+p.seat===bb)||arr[0]}
function worstAvailableSeatShared(table,sim){const cap=+state.seatsPerTable||9,occupied=new Set((sim[table]||[]).map(p=>+p.seat)),btn=tableButtonSeat(table,sim),available=[];for(let s=1;s<=cap;s++)if(!occupied.has(s))available.push(s);if(!available.length)return null;const dist=s=>((s-btn+cap)%cap)||cap,sbCandidate=[...available].sort((a,b)=>dist(a)-dist(b))[0],valid=available.filter(s=>s!==sbCandidate);if(!valid.length)return null;return valid.sort((a,b)=>dist(a)-dist(b))[0]}
function recomputeBalancePlan(){ensureOperationalState();const cap=+state.seatsPerTable||9,players=activeTournamentPlayers();if(players.length<=1){state.balancePlan=[];return[]}const current=tournamentTableGroups(players),sim={};Object.keys(current).forEach(t=>sim[t]=current[t].map(p=>({...p})));const required=Math.max(1,Math.ceil(players.length/cap)),plan=[];while(Object.keys(sim).filter(t=>sim[t].length>0).length>required){const live=Object.keys(sim).map(Number).filter(t=>sim[t].length>0).sort((a,b)=>sim[a].length-sim[b].length||b-a),close=live[0],movers=sim[close].slice();for(const p of movers){const targets=Object.keys(sim).map(Number).filter(t=>t!==close&&sim[t].length<cap).sort((a,b)=>sim[a].length-sim[b].length||a-b);if(!targets.length)break;const target=targets[0],seat=worstAvailableSeatShared(target,sim);if(!seat)break;plan.push({playerId:p.id,playerName:p.name,fromTable:close,fromSeat:p.seat,toTable:target,toSeat:seat,reason:'QUEBRA DE MESA',sourcePosition:seatPosition(close,p.seat,sim),targetPosition:seatPosition(target,seat,{...sim,[target]:[...sim[target],{...p,seat}]})});sim[close]=sim[close].filter(x=>x.id!==p.id);sim[target].push({...p,table:target,seat})}}let safety=50;while(safety--){const live=Object.keys(sim).map(Number).filter(t=>sim[t].length>0).sort((a,b)=>sim[b].length-sim[a].length||a-b);if(live.length<2)break;const high=live[0],low=live[live.length-1];if(sim[high].length-sim[low].length<2)break;const preferred=nextBigBlindPlayerShared(high,sim),candidates=sim[high].slice().sort((a,b)=>{if(a.id===preferred?.id)return-1;if(b.id===preferred?.id)return 1;return(a.lastMovedAt||0)-(b.lastMovedAt||0)}),p=candidates[0],seat=worstAvailableSeatShared(low,sim);if(!p||!seat)break;plan.push({playerId:p.id,playerName:p.name,fromTable:high,fromSeat:p.seat,toTable:low,toSeat:seat,reason:'BALANCEAMENTO TDA',sourcePosition:seatPosition(high,p.seat,sim),targetPosition:seatPosition(low,seat,{...sim,[low]:[...sim[low],{...p,seat}]})});sim[high]=sim[high].filter(x=>x.id!==p.id);sim[low].push({...p,table:low,seat})}state.balancePlan=plan;return plan}
function balancingAlertText(plan=state.balancePlan){if(!plan?.length)return'';return `⚠ BALANCING NECESSÁRIO\n${state.tournamentName||'TORNEIO'}\n\n${plan.map(m=>`${m.playerName}: Mesa ${m.fromTable}/${m.fromSeat} → Mesa ${m.toTable}/${m.toSeat}${m.reason?` • ${m.reason}`:''}`).join('\n')}\n\nConfirmar movimentações no sistema.`}
function queueBalancingStaffAlerts(source='SYSTEM'){const plan=state.balancePlan||[];if(!plan.length)return null;const fingerprint=plan.map(m=>`${m.playerId}:${m.fromTable}:${m.fromSeat}:${m.toTable}:${m.toSeat}`).join('|');if(state.staffAlerts.some(a=>a.fingerprint===fingerprint&&a.status!=='resolved'))return null;const text=balancingAlertText(plan),alert={id:'alert-'+Date.now(),type:'BALANCING',text,fingerprint,createdAt:Date.now(),status:'pending',source};state.staffAlerts.unshift(alert);const recipients=(state.staffUsers||[]).filter(s=>s.active!==false&&['OWNER','TD','FLOOR'].includes(s.role)&&s.phone);recipients.forEach(s=>enqueueMessage({channel:'WHATSAPP',kind:'BALANCING_ALERT',body:text,recipient:s.phone,source,dedupeKey:`bal-${fingerprint}-${s.id}`,category:'OPERATIONAL'}));auditEvent('BALANCING_REQUIRED',{source,count:plan.length,fingerprint});return alert}
function invalidateSeatCheckin(playerId,reason='POSITION_CHANGED'){const row=state.seatCheckins.find(x=>x.playerId===playerId&&x.eventId===state.eventId&&x.status==='SEATED');if(row){row.status='STALE';row.staleAt=Date.now();row.staleReason=reason}}
function fmtNumber(n){return new Intl.NumberFormat("pt-BR").format(Number(n)||0)}
function fmtCurrency(n){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(Number(n)||0)}
function fmtTime(s,long=false){s=Math.max(0,Math.floor(Number(s)||0));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;if(long)return[h,m,sec].map(v=>String(v).padStart(2,"0")).join(":");return[Math.floor(s/60),sec].map(v=>String(v).padStart(2,"0")).join(":")}
function currentItem(){return state.structure[state.levelIndex]||state.structure[0]}
function nextItem(){return state.structure[Math.min(state.levelIndex+1,state.structure.length-1)]||currentItem()}
function nextLevelItem(){for(let i=state.levelIndex+1;i<state.structure.length;i++)if(state.structure[i].type==="level")return state.structure[i];return currentItem()}
function followingLevels(limit=3){const out=[];for(let i=state.levelIndex+1;i<state.structure.length&&out.length<limit;i++)if(state.structure[i].type==="level")out.push(state.structure[i]);return out}
function calcNextBreak(){let secs=state.remaining;for(let i=state.levelIndex+1;i<state.structure.length;i++){if(state.structure[i].type==="break")return{secs,label:state.structure[i].label,index:i};secs+=state.structure[i].duration}return null}
function currentLevelNumber(){const c=currentItem();if(c.type!=="level")return null;return parseInt((c.label.match(/\d+/)||["0"])[0],10)||0}
const I18N={pt:{live:"TORNEIO AO VIVO",remaining:"TEMPO RESTANTE DO NÍVEL",breakRemaining:"INTERVALO",next:"PRÓXIMO NÍVEL",players:"PLAYERS LEFT",elapsed:"TEMPO DECORRIDO",nextBreak:"PRÓXIMO BREAK",paused:"PAUSADO",running:"EM ANDAMENTO",returning:"RETORNO EM",upcoming:"PRÓXIMOS NÍVEIS"},en:{live:"LIVE TOURNAMENT",remaining:"TIME REMAINING IN LEVEL",breakRemaining:"BREAK",next:"NEXT LEVEL",players:"PLAYERS LEFT",elapsed:"ELAPSED TIME",nextBreak:"NEXT BREAK",paused:"PAUSADO",running:"RUNNING",returning:"RETURN IN",upcoming:"UPCOMING LEVELS"},es:{live:"TORNEO EN VIVO",remaining:"TIEMPO RESTANTE DEL NIVEL",breakRemaining:"DESCANSO",next:"PRÓXIMO NIVEL",players:"JUGADORES",elapsed:"TIEMPO TRANSCURRIDO",nextBreak:"PRÓXIMO DESCANSO",paused:"PAUSADO",running:"EN CURSO",returning:"REGRESO EM",upcoming:"PRÓXIMOS NÍVEIS"}};
function tr(k){return(I18N[state.language]||I18N.pt)[k]||k}

(function ensureStackupGlobalTheme(){
  if(typeof document==='undefined')return;
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(page==='index.html'||page==='')return;
  const load=()=>{
    const existing=[...document.scripts].find(s=>(s.getAttribute('src')||'').split('?')[0].endsWith('app-theme.js'));
    if(existing||document.getElementById('stackup-global-nav'))return;
    const script=document.createElement('script');
    script.src='app-theme.js?v=publication0914';
    script.defer=true;
    script.dataset.stackupThemeLoader='1';
    (document.head||document.documentElement).appendChild(script);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();

(function ensureDataEntryStandard(){
  if(typeof document==='undefined')return;
  if(document.querySelector('script[data-stackup-data-entry]'))return;
  const script=document.createElement('script');
  script.src='data-entry-standard.js?v=publication0914';
  script.defer=true;
  script.dataset.stackupDataEntry='1';
  (document.head||document.documentElement).appendChild(script);
})();

(function ensureInlineInteractions(){
  if(typeof document==='undefined')return;
  if(document.querySelector('script[data-stackup-inline-interactions]'))return;
  const script=document.createElement('script');
  script.src='inline-interactions-v1.js?v=9e739887';
  script.defer=true;
  script.dataset.stackupInlineInteractions='1';
  (document.head||document.documentElement).appendChild(script);
})();

(function ensureInputMasks(){
  if(typeof document==='undefined')return;
  if(document.querySelector('script[data-stackup-input-masks]'))return;
  const script=document.createElement('script');
  script.src='input-masks.js?v=d5167fb8';
  script.defer=true;
  script.dataset.stackupInputMasks='1';
  (document.head||document.documentElement).appendChild(script);
})();