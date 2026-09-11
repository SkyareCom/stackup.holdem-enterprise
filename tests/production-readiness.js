const fs=require('fs');
const vm=require('vm');
const failures=[];
const assert=(name,cond)=>{if(!cond)failures.push(name);else console.log('PASS:',name)};
const read=f=>fs.readFileSync(f,'utf8');

for(const file of ['index.html','login.html']){
  const html=read(file),prod=html.indexOf('production-init.js'),shared=html.indexOf('shared.js'),auth=html.indexOf('auth-engine.js'),cleanup=html.indexOf('production-auth-cleanup.js');
  assert(`${file}: production-init antes de shared`,prod>=0&&shared>=0&&prod<shared);
  assert(`${file}: limpeza auth após engine`,auth>=0&&cleanup>auth);
}

for(const file of ['checkin.html','players.html','players-directory.html','staff.html','dealer.html','tournament-close.html','tournament-manager.html','tournament-settings.html','wallet.html','crm.html','communications.html','ranking.html','ranking-tournament.html','ranking-general.html','ranking-rules.html']){
  const html=read(file);
  assert(`${file}: carrega auth-engine`,html.includes('auth-engine.js'));
  assert(`${file}: aplica guard de autenticação`,html.includes('StackupAuth.guard()'));
}

const confirmation=read('confirmation-standard.js');
assert('confirmation standard é somente apresentação',confirmation.includes('window.StackupNotice'));
assert('confirmation standard não substitui alert',!confirmation.includes('window.alert='));
assert('confirmation standard não substitui confirm',!confirmation.includes('window.confirm='));
assert('confirmation standard não substitui prompt',!confirmation.includes('window.prompt='));
assert('confirmation standard não injeta CADASTRAR NOVO',!confirmation.includes("textContent='CADASTRAR NOVO'"));
assert('confirmation standard não força CONFIRMADO',!confirmation.includes("button.textContent='CONFIRMADO'"));

const entry=read('data-entry-standard.js');
assert('data entry não injeta hub sintético',!entry.includes('directoryHub();'));
assert('data entry não injeta confirmação de comunicação',!entry.includes('data-confirm-phone'));
assert('data entry não injeta confirmação de ranking',!entry.includes('confirmRankingFilter'));
assert('data entry não injeta confirmação de reconhecimento',!entry.includes('confirmRecognitionSearch'));
const lists=read('in-app-lists.js');
assert('listas sintéticas são opt-in',lists.includes("hasAttribute('data-stackup-inline-list')")&&lists.includes('select[data-stackup-inline-list]'));

const auth=read('auth-engine.js');
assert('auth define CASHIER',/CASHIER:\s*\[/.test(auth));
assert('auth define VIEWER',/VIEWER:\s*\[/.test(auth));
assert('auth limita CASHIER por páginas',auth.includes('CASHIER_PAGES'));
assert('auth limita VIEWER por páginas',auth.includes('VIEWER_PAGES'));
assert('auth mapeia FINANCE',auth.includes("'finance.html':'FINANCE'"));
assert('auth mapeia WALLET',auth.includes("'wallet.html':'WALLET'"));
assert('auth não recria POKER CLUB legado',!auth.includes("state.clubName||'POKER CLUB'"));

const wallet=read('wallet.html');
assert('wallet usa staff autenticado',wallet.includes('WALLET_STAFF=StackupAuth.staffForSession()'));
assert('wallet exige torneio atual nas compras',wallet.includes('currentTournamentPlayers()')&&wallet.includes('eventOf(p)'));
assert('wallet não usa operador GESTOR sintético',!wallet.includes("id:'WALLET'")&&!wallet.includes("role:'GESTOR'"));
assert('wallet usa links únicos sem a>button',!/<a\b[^>]*>\s*<button\b/i.test(wallet));

const recognition=read('recognition.html');
assert('reconhecimento usa cadastro geral',/StackupPlayerProfile(?:\?\.)?\.directory(?:\?\.)?\(/.test(recognition)||recognition.includes('StackupPlayerProfile.directory()'));
assert('reconhecimento entrega seleção ao check-in',recognition.includes('stackup-checkin-selected-player'));
const crm=read('crm.html');
assert('CRM usa cadastro geral',/StackupPlayerProfile(?:\?\.)?\.directory(?:\?\.)?\(/.test(crm)||/StackupPlayerProfile\?\.directory\?\.\(/.test(crm)||crm.includes('StackupPlayerProfile.directory'));
assert('CRM possui autenticação explícita',crm.includes('StackupAuth.guard()'));
const comm=read('communications.html');
assert('comunicação limita jogadores ao evento',comm.includes('currentPlayers()')&&comm.includes('validationEventId'));
assert('comunicação sincroniza telefone no cadastro geral',comm.includes('syncDirectoryPhone'));

const manager=read('tournament-manager.html'),managerAudit=read('tournament-manager-audit-v1.js'),history=read('tournament-history.js'),ready=read('ready-tournaments.js');
assert('configuração salva catálogo canônico',history.includes('state.savedTournaments'));
assert('manager usa savedTournaments',manager.includes('state.savedTournaments'));
assert('manager aplica definição aninhada',manager.includes('definitionData')&&manager.includes('applyDefinition'));
assert('auditoria lê definição salva',managerAudit.includes('sourceData(t)')&&managerAudit.includes('applyConfig(t)'));
assert('validado preserva configuração completa',managerAudit.includes('data,structure:clone(s.structure'));
assert('lista validada não zera financeiro',!ready.includes('financialKeys.forEach')&&!ready.includes('eventArrays.forEach'));
assert('lista validada abre registro exato',ready.includes('tournament-manager.html?id='));

const shared=read('shared.js');
assert('shared filtra jogadores por evento',shared.includes('function currentTournamentPlayers()')&&shared.includes('validationEventId'));
assert('contadores filtram transações por evento',shared.includes("String(t.eventId||'')===event"));
const close=read('tournament-close.html');
assert('fechamento usa jogadores do evento',close.includes('currentActive()')&&close.includes('currentPlayers()'));
assert('fechamento bloqueia encerramento duplicado',close.includes('alreadyClosed'));
const rankT=read('ranking-tournament.html'),rankG=read('ranking-general.html'),rankE=read('ranking-engine.js'),rankRules=read('ranking-rules.html');
assert('ranking usa validationEventId no motor compartilhado',rankE.includes('validationEventId')&&rankE.includes('eventOf'));
assert('ranking por torneios usa hierarquia ambiente/torneio/etapa',rankT.includes('id="environment"')&&rankT.includes('id="tournament"')&&rankT.includes('id="stage"')&&rankT.includes('StackupRanking.aggregate'));
assert('ranking por ligas filtra ambiente do tipo LEAGUE',rankG.includes("filter(x=>x.type==='LEAGUE')")&&rankG.includes('StackupRanking.stages()'));
assert('ranking por ligas filtra período real',rankG.includes("periodEl.value==='YEAR'")&&rankG.includes("periodEl.value==='SEMESTER'"));
assert('ranking possui critérios configuráveis',rankRules.includes('SALVAR CRITÉRIOS E REGRAS')&&rankE.includes('saveRule'));

const preReset=read('setup-preinit-reset-v1.js'),postReset=read('setup-new-tournament-reset-v1.js');
for(const token of ['reentryValue','rebuyValue','addonValue','bountyValue','fee','structure','finalTableStructureMode']){
  assert(`novo torneio limpa ${token}`,preReset.includes(token)&&postReset.includes(token));
}
const tEngine=read('tournament-engine.js');
assert('motor de torneio não usa operador LOCAL sintético',!tEngine.includes("||'LOCAL'"));

const sharedSource=shared;
for(const legacy of ['MAIN EVENT - ETAPA 4','event-main-4','clubName:"POKER CLUB"','guaranteed:150000','startingStack:30000','buyin:500,fee:50'])assert(`shared sem dado demonstrativo: ${legacy}`,!sharedSource.includes(legacy));
assert('shared inicia relógio zerado',/remaining:0,elapsed:0/.test(sharedSource));
assert('shared inicia operação sem torneio',/eventId:"",operator:"",tournamentName:"",clubName:""/.test(sharedSource));

const storage=new Map([
  ['poker-club-state-v4',JSON.stringify({tournamentName:'MAIN EVENT - ETAPA 4',remaining:1200,elapsed:777,players:[{id:'test'}],transactions:[{id:'tx-test'}]})],
  ['stackup-player-directory-v1',JSON.stringify([{id:'player-test'}])],
  ['stackup-auth-session-v1',JSON.stringify({id:'session-test'})],
  ['stackup-ready-tournaments-v1',JSON.stringify([{id:'ready-test'}])]
]);
const localStorage={get length(){return storage.size},key:i=>[...storage.keys()][i]??null,getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const sandbox={console,localStorage};sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(read('production-init.js'),sandbox,{filename:'production-init.js'});const state=JSON.parse(storage.get('poker-club-state-v4'));
assert('nome de torneio zerado',state.tournamentName==='');assert('clube zerado',state.clubName==='');assert('timer zerado',state.remaining===0&&state.elapsed===0&&state.timerBaseRemaining===0&&state.elapsedBase===0);assert('timer parado',state.running===false&&state.timerStartedAt===null&&state.elapsedStartedAt===null);assert('dados operacionais limpos',state.players.length===0&&state.transactions.length===0&&state.auditLog.length===0&&state.seatCheckins.length===0);assert('cadastro de teste removido',!storage.has('stackup-player-directory-v1'));assert('sessão de teste removida',!storage.has('stackup-auth-session-v1'));assert('torneio validado de teste removido',!storage.has('stackup-ready-tournaments-v1'));assert('marcador de baseline gravado',storage.get('stackup-production-reset-version')==='2026-09-04-professional-v1');
vm.runInContext(read('production-init.js'),sandbox,{filename:'production-init-second-run.js'});assert('reset é executado uma única vez',JSON.parse(storage.get('poker-club-state-v4')).tournamentName==='');

if(failures.length){failures.forEach(f=>console.error('FAIL:',f));process.exit(1)}
console.log('PRODUCTION READINESS PASS');