const {chromium}=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
const fail=[];let checks=0;
function assert(name,ok,detail=''){checks++;if(ok)console.log('PASS:',name);else{const x=name+(detail?` • ${detail}`:'');fail.push(x);console.error('FAIL:',x)}}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:412,height:915}});
 const now=Date.now(),structure=[{type:'level',label:'NÍVEL 1',duration:1200,sb:100,bb:200,ante:200},{type:'level',label:'NÍVEL 2',duration:1200,sb:200,bb:400,ante:400}];
 const state={eventId:'event-A',tournamentName:'EVENTO A',clubId:'club-A',clubName:'CLUBE A',activeEnvironmentId:'club-A',prepared:true,status:'VALIDADO',tournamentStatus:'VALIDATED',gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,buyinChips:30000,startingStack:30000,rebuyValue:250,structure,running:false,levelIndex:0,remaining:1200,elapsed:0,playersLeft:2,staffUsers:[{id:'owner',personId:'person-owner',clubId:'club-A',name:'OWNER QA',role:'OWNER',active:true}],authPeople:[{id:'person-owner',cpf:'11111111111',name:'OWNER QA',pin:'1234',active:true}],authClubs:[{id:'club-A',name:'CLUBE A',type:'CLUB',active:true}],authMemberships:[{id:'m-owner',personId:'person-owner',clubId:'club-A',staffId:'owner',role:'OWNER',permissions:['*'],active:true}],players:[{id:'a',name:'ALFA',eventId:'event-A',validationEventId:'event-A',status:'active',table:1,seat:1,seatedAt:now,validationCode:'AAA111',validationCodeStatus:'ACTIVE'},{id:'b',name:'BRAVO',eventId:'event-A',validationEventId:'event-A',status:'active',table:1,seat:2,seatedAt:now,validationCode:'BBB222',validationCodeStatus:'ACTIVE'},{id:'foreign',name:'OUTRO EVENTO',eventId:'event-B',validationEventId:'event-B',status:'active',table:1,seat:3,seatedAt:now,validationCode:'ZZZ999',validationCodeStatus:'ACTIVE'}],transactions:[{id:'tx-a',eventId:'event-A',playerId:'a',type:'ENTRY',value:500,status:'completed',breakdown:{classification:'CLASSIFIED'}},{id:'tx-b',eventId:'event-B',playerId:'foreign',type:'REBUY',value:999,status:'completed',breakdown:{classification:'CLASSIFIED'}}],seatCheckins:[],balancePlan:[{id:'m-a',eventId:'event-A',playerId:'b',playerName:'BRAVO',fromTable:1,fromSeat:2,toTable:2,toSeat:1},{id:'m-b',eventId:'event-B',playerId:'foreign',playerName:'OUTRO EVENTO',fromTable:1,fromSeat:3,toTable:9,toSeat:9}],tableMovements:[],staffAlerts:[],botCommands:[],auditLog:[],messageQueue:[],messageLog:[],validationLog:[],savedTournaments:[]};
 const session={id:'session-owner',personId:'person-owner',personName:'OWNER QA',clubId:'club-A',clubName:'CLUBE A',membershipId:'m-owner',staffId:'owner',role:'OWNER',permissions:['*'],deviceId:'qa-device',startedAt:now};
 await context.addInitScript(({state,session})=>{localStorage.setItem('stackup-production-reset-version','2026-09-04-professional-v1');localStorage.setItem('poker-club-state-v4',JSON.stringify(state));localStorage.setItem('stackup-auth-session-v1',JSON.stringify(session));localStorage.setItem('stackup-auth-login-v1',JSON.stringify({personId:session.personId,authenticatedAt:Date.now()}));}, {state,session});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
   await page.goto(`${BASE}/control.html`,{waitUntil:'domcontentloaded',timeout:15000});
   const action=page.locator('[data-action="CHECKIN"]');await action.waitFor({state:'visible',timeout:5000});await action.click();
   assert('Painel CHECK IN abre por clique real',await page.locator('#hubActionPanel').isVisible());
   const resultText=await page.locator('#hubSearchResults').innerText();
   assert('Busca dinâmica mostra evento atual',resultText.includes('ALFA')&&resultText.includes('BRAVO'),resultText);
   assert('Busca dinâmica não vaza outro evento',!resultText.includes('OUTRO EVENTO'),resultText);
   assert('Resumo ignora jogador de outro torneio',(await page.locator('#miniPlayers').innerText()).trim()==='2 / 2',await page.locator('#miniPlayers').innerText());
   assert('Balancing ignora plano de outro torneio',(await page.locator('#hubBalancingCount').innerText()).trim()==='1',await page.locator('#hubBalancingCount').innerText());
   await page.locator('#hubSearchResults [data-player="a"]').click({trial:true});await page.locator('#hubSearchResults [data-player="a"]').click();
   assert('Jogador dinâmico é selecionável',(await page.locator('#hubSelectedPlayer').innerText()).includes('ALFA'));
   await page.locator('#hubConfirm').click();
   assert('CHECK IN é confirmado',(await page.locator('#hubConfirmStatus').innerText()).includes('CONFIRMADO'));
   const snap=await page.evaluate(()=>({checks:(state.seatCheckins||[]).map(x=>({eventId:x.eventId,playerId:x.playerId})),foreign:state.players.find(x=>x.id==='foreign')?.status}));
   assert('Check-in foi gravado no evento A',snap.checks.some(x=>x.eventId==='event-A'&&x.playerId==='a'),JSON.stringify(snap.checks));
   assert('Nenhum check-in foi criado no evento B',!snap.checks.some(x=>x.eventId==='event-B'),JSON.stringify(snap.checks));
   assert('Jogador de outro evento permaneceu intacto',snap.foreign==='active',snap.foreign);
   assert('Fluxo sem exceções JavaScript',errors.length===0,errors.join(' | '));
 }catch(e){assert('Fluxo Chromium CONTROL conclui',false,e.stack||e.message)}finally{await context.close();await browser.close()}
 if(fail.length){console.error(`BROWSER CONTROL DYNAMIC E2E FAILED: ${fail.length} falha(s).`);fail.forEach(x=>console.error('- '+x));process.exit(1)}
 console.log(`BROWSER CONTROL DYNAMIC E2E PASS: ${checks} verificações reais de estado dinâmico e isolamento.`);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
