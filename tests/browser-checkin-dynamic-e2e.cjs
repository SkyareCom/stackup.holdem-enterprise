const {chromium}=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
const failures=[];let checks=0;
function assert(name,ok,detail=''){checks++;if(ok)console.log('PASS:',name);else{const msg=name+(detail?` • ${detail}`:'');failures.push(msg);console.error('FAIL:',msg)}}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:412,height:915}});
 const now=Date.now();
 const state={eventId:'event-checkin',tournamentName:'CHECKIN QA',clubId:'club-a',clubName:'CLUBE A',activeEnvironmentId:'club-a',activeEnvironmentName:'CLUBE A',activeEnvironmentType:'CLUB',prepared:true,status:'ATIVO',tournamentStatus:'ACTIVE',gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,fee:50,buyinChips:30000,startingStack:30000,structure:[{type:'level',label:'NÍVEL 1',duration:1200,sb:100,bb:200,ante:200}],
  authClubs:[{id:'club-a',name:'CLUBE A',type:'CLUB',active:true}],authPeople:[{id:'person-cash',cpf:'11111111111',name:'CAIXA QA',pin:'1234',active:true}],staffUsers:[{id:'cash',personId:'person-cash',clubId:'club-a',name:'CAIXA QA',role:'CASHIER',active:true}],authMemberships:[{id:'m-cash',personId:'person-cash',clubId:'club-a',staffId:'cash',role:'CASHIER',permissions:['FINANCE','WALLET','PAYMENTS','CHECKIN','PLAYERS','READ_ONLY'],active:true}],
  players:[{id:'foreign-player',name:'ALFA ANTIGO',directoryId:'dir-alfa',eventId:'event-old',validationEventId:'event-old',status:'active',table:5,seat:5}],transactions:[{id:'foreign-entry',eventId:'event-old',playerId:'foreign-player',type:'ENTRY',value:550,status:'completed'}],seatCheckins:[],auditLog:[],messageQueue:[],messageLog:[],savedTournaments:[]};
 const session={id:'session-cash',personId:'person-cash',personName:'CAIXA QA',clubId:'club-a',clubName:'CLUBE A',membershipId:'m-cash',staffId:'cash',role:'CASHIER',permissions:['FINANCE','WALLET','PAYMENTS','CHECKIN','PLAYERS','READ_ONLY'],deviceId:'qa-device',startedAt:now};
 const directory=[{id:'dir-alfa',name:'ALFA TESTE',cpf:'12345678900',phone:'5511999999999',whatsapp:'5511999999999',info:['WHATSAPP'],active:true}];
 await context.addInitScript(({state,session,directory})=>{
   localStorage.setItem('stackup-production-reset-version','2026-09-04-professional-v1');
   localStorage.setItem('poker-club-state-v4',JSON.stringify(state));
   localStorage.setItem('stackup-auth-session-v1',JSON.stringify(session));
   localStorage.setItem('stackup-auth-login-v1',JSON.stringify({personId:session.personId,authenticatedAt:Date.now()}));
   localStorage.setItem('stackup-active-environment-v1','club-a');
   localStorage.setItem('stackup-player-directory-v1',JSON.stringify(directory));
   localStorage.setItem('stackup-checkin-selected-player','dir-alfa');
   localStorage.setItem('stackup-validated-tournaments-v1',JSON.stringify({'event-checkin':{id:'event-checkin',status:'VALIDATED'}}));
 },{state,session,directory});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
   await page.goto(`${BASE}/checkin.html`,{waitUntil:'domcontentloaded',timeout:15000});
   await page.locator('#confirmBuyin').waitFor({state:'visible',timeout:5000});
   assert('Jogador do diretório é carregado',(await page.locator('#selectedSummary').innerText()).includes('ALFA TESTE'));
   assert('Entrada antiga de outro torneio não bloqueia o atual',!(await page.locator('#selectedSummary').innerText()).includes('REALIZADO'));
   await page.locator('#paymentMethod').selectOption('CASH');
   assert('BUY-IN em dinheiro habilita confirmação',await page.locator('#confirmBuyin').isEnabled());
   await page.locator('#confirmBuyin').click();
   const result=await page.locator('#result').innerText();
   assert('Clique real confirma pagamento e inscrição',result.includes('PAGAMENTO E INSCRIÇÃO')&&result.includes('ALFA TESTE'),result);
   assert('Resultado informa mesa e assento',/MESA\s+\d+\s+•\s+ASSENTO\s+\d+/.test(result),result);
   const snap=await page.evaluate(()=>({players:state.players.map(p=>({id:p.id,name:p.name,directoryId:p.directoryId,eventId:p.eventId,validationEventId:p.validationEventId,table:p.table,seat:p.seat})),transactions:state.transactions.map(t=>({id:t.id,eventId:t.eventId,playerId:t.playerId,type:t.type,operator:t.operator,payment:t.payment}))}));
   const created=snap.players.find(p=>p.directoryId==='dir-alfa'&&p.validationEventId==='event-checkin');
   assert('Novo jogador fica vinculado somente ao torneio atual',!!created&&created.name==='ALFA TESTE',JSON.stringify(snap.players));
   const entry=created&&snap.transactions.find(t=>t.eventId==='event-checkin'&&t.playerId===created.id&&t.type==='ENTRY');
   assert('Ledger registra ENTRY no torneio atual',!!entry,JSON.stringify(snap.transactions));
   assert('Ledger atribui operador autenticado',entry?.operator==='cash',JSON.stringify(entry));
   assert('Pagamento gravado é dinheiro',entry?.payment?.method==='CASH'&&entry?.payment?.currency==='BRL',JSON.stringify(entry?.payment));
   assert('Transação estrangeira permanece intacta',snap.transactions.some(t=>t.id==='foreign-entry'&&t.eventId==='event-old'));
   assert('Após inscrição o botão fica bloqueado contra duplicidade',!(await page.locator('#confirmBuyin').isEnabled()));
   assert('Resumo passa a indicar check-in realizado',(await page.locator('#selectedSummary').innerText()).includes('REALIZADO'));
   assert('Fluxo CHECK-IN sem exceções JavaScript',errors.length===0,errors.join(' | '));
 }catch(e){assert('Fluxo Chromium CHECK-IN conclui',false,e.stack||e.message)}finally{await context.close();await browser.close()}
 if(failures.length){console.error(`BROWSER CHECKIN DYNAMIC E2E FAILED: ${failures.length} falha(s).`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
 console.log(`BROWSER CHECKIN DYNAMIC E2E PASS: ${checks} verificações reais de seleção, pagamento, inscrição e isolamento.`);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
