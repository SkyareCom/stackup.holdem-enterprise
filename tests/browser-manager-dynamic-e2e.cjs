const {chromium}=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
const failures=[];let checks=0;
function assert(name,ok,detail=''){checks++;if(ok)console.log('PASS:',name);else{const msg=name+(detail?` • ${detail}`:'');failures.push(msg);console.error('FAIL:',msg)}}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:412,height:915}});
 const now=Date.now();
 const structureA=[{type:'level',label:'NÍVEL 1',duration:1200,sb:100,bb:200,ante:200},{type:'level',label:'NÍVEL 2',duration:1200,sb:200,bb:400,ante:400}];
 const structureB=[{type:'level',label:'NÍVEL 1',duration:900,sb:200,bb:400,ante:400},{type:'level',label:'NÍVEL 2',duration:900,sb:400,bb:800,ante:800}];
 const baseTournament={clubId:'club-a',clubName:'CLUBE A',tournamentFormat:'REGULAR',seatsPerTable:9,buyinChips:30000,startingStack:30000,finalTableStructureMode:'TIMER',finalTableHandsPerLevel:10,announcements:{LEVEL_UP:'ATIVO'}};
 const state={eventId:'event-a',tournamentName:'EVENTO A',clubId:'club-a',clubName:'CLUBE A',activeEnvironmentId:'club-a',activeEnvironmentName:'CLUBE A',activeEnvironmentType:'CLUB',prepared:true,status:'VALIDADO',tournamentStatus:'VALIDATED',gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,buyinChips:30000,startingStack:30000,structure:structureA,finalTableStructureMode:'TIMER',finalTableHandsPerLevel:10,announcements:{LEVEL_UP:'ATIVO'},
  authClubs:[{id:'club-a',name:'CLUBE A',type:'CLUB',active:true}],authPeople:[{id:'person-owner',cpf:'11111111111',name:'OWNER QA',pin:'1234',active:true}],staffUsers:[{id:'owner',personId:'person-owner',clubId:'club-a',name:'OWNER QA',role:'OWNER',active:true}],authMemberships:[{id:'m-owner',personId:'person-owner',clubId:'club-a',staffId:'owner',role:'OWNER',permissions:['*'],active:true}],
  savedTournaments:[{id:'event-a',name:'EVENTO A',status:'VALIDATED',data:{...baseTournament,tournamentName:'EVENTO A',gameType:'NLH',buyin:500,structure:structureA}},{id:'event-b',name:'EVENTO B',status:'VALIDATED',data:{...baseTournament,tournamentName:'EVENTO B',gameType:'PLO4',tournamentFormat:'TURBO',seatsPerTable:8,buyin:777,buyinChips:25000,startingStack:25000,structure:structureB}}],
  players:[{id:'pa',name:'ALFA',eventId:'event-a',validationEventId:'event-a',status:'active',table:1,seat:1},{id:'pb',name:'BRAVO',eventId:'event-b',validationEventId:'event-b',status:'active',table:2,seat:1}],transactions:[{id:'txa',eventId:'event-a',playerId:'pa',type:'ENTRY',value:500},{id:'txb',eventId:'event-b',playerId:'pb',type:'ENTRY',value:777}],auditLog:[],messageQueue:[],messageLog:[]};
 const session={id:'session-owner',personId:'person-owner',personName:'OWNER QA',clubId:'club-a',clubName:'CLUBE A',membershipId:'m-owner',staffId:'owner',role:'OWNER',permissions:['*'],deviceId:'qa-device',startedAt:now};
 await context.addInitScript(({state,session,marker})=>{if(localStorage.getItem(marker)==='1')return;localStorage.setItem('stackup-production-reset-version','2026-09-04-professional-v1');localStorage.setItem('poker-club-state-v4',JSON.stringify(state));localStorage.setItem('stackup-auth-session-v1',JSON.stringify(session));localStorage.setItem('stackup-auth-login-v1',JSON.stringify({personId:session.personId,authenticatedAt:Date.now()}));localStorage.setItem('stackup-active-environment-v1','club-a');localStorage.setItem(marker,'1');}, {state,session,marker:'stackup-e2e-manager-seeded-v1'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
   await page.goto(`${BASE}/tournament-manager.html`,{waitUntil:'domcontentloaded',timeout:15000});
   await page.locator('#chooseTournament').waitFor({state:'visible',timeout:5000});
   assert('Torneio ativo inicial aparece',(await page.locator('#current').innerText()).includes('EVENTO A'));
   await page.locator('#chooseTournament').click();
   const choice=page.locator('#tournamentList [data-id="event-b"]');await choice.waitFor({state:'visible',timeout:3000});await choice.click();
   assert('EVENTO B pode ser selecionado',(await page.locator('#selected').innerText()).includes('EVENTO B'));
   await page.locator('#selectedActions [data-action="activate"]').click();
   assert('ATIVAR exige confirmação explícita',(await page.locator('#pending').innerText()).includes('ATIVAR TORNEIO'));
   await page.locator('#confirmAction').click();
   let snap=await page.evaluate(()=>({eventId:state.eventId,name:state.tournamentName,buyin:state.buyin,gameType:state.gameType,prepared:state.prepared,players:state.players.map(x=>({id:x.id,eventId:x.eventId,status:x.status}))}));
   assert('ATIVAR aplica a definição exata do EVENTO B',snap.eventId==='event-b'&&snap.name==='EVENTO B'&&snap.buyin===777&&snap.gameType==='PLO4'&&snap.prepared===true,JSON.stringify(snap));
   assert('Dados operacionais de outros eventos não são apagados',snap.players.some(x=>x.id==='pa'&&x.eventId==='event-a'&&x.status==='active'),JSON.stringify(snap.players));
   assert('Operação é liberada após ativação',!(await page.locator('#ops').evaluate(el=>el.classList.contains('disabled'))));
   await page.locator('#selectedActions [data-action="deactivate"]').click();
   await page.locator('#confirmAction').click();
   snap=await page.evaluate(()=>({eventId:state.eventId,prepared:state.prepared,status:state.tournamentStatus}));
   assert('DESATIVAR encerra operação sem trocar o ID selecionado',snap.eventId==='event-b'&&snap.prepared===false&&snap.status==='INACTIVE',JSON.stringify(snap));
   assert('Operação fica bloqueada após desativação',await page.locator('#ops').evaluate(el=>el.classList.contains('disabled')));
   assert('Fluxo do manager sem exceções JavaScript',errors.length===0,errors.join(' | '));
 }catch(e){assert('Fluxo Chromium TOURNAMENT MANAGER conclui',false,e.stack||e.message)}finally{await context.close();await browser.close()}
 if(failures.length){console.error(`BROWSER MANAGER DYNAMIC E2E FAILED: ${failures.length} falha(s).`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
 console.log(`BROWSER MANAGER DYNAMIC E2E PASS: ${checks} verificações reais de seleção, ativação e desativação.`);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
