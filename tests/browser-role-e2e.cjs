const { chromium } = require('playwright');

const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
const failures=[];
const pass=name=>console.log('PASS:',name);
const fail=(name,detail='')=>{failures.push(`${name}${detail?' • '+detail:''}`);console.error('FAIL:',name,detail)};
const expect=async(name,fn)=>{try{const ok=await fn();if(!ok)throw new Error('condição não satisfeita');pass(name)}catch(e){fail(name,e.message)}};

const roleConfig={
 TD:{personId:'person-td',staffId:'td1',membershipId:'m-td',name:'QA TD'},
 FLOOR:{personId:'person-floor',staffId:'floor1',membershipId:'m-floor',name:'QA FLOOR'},
 CASHIER:{personId:'person-cashier',staffId:'cashier1',membershipId:'m-cashier',name:'QA CASHIER'},
 VIEWER:{personId:'person-viewer',staffId:'viewer1',membershipId:'m-viewer',name:'QA VIEWER'}
};
function seed(role){
 const cfg=roleConfig[role],now=Date.now();
 const staff=[
  {id:'td1',personId:'person-td',clubId:'club-a',name:'QA TD',role:'TD',active:true,phone:'551199990001'},
  {id:'floor1',personId:'person-floor',clubId:'club-a',name:'QA FLOOR',role:'FLOOR',active:true,phone:'551199990002'},
  {id:'cashier1',personId:'person-cashier',clubId:'club-a',name:'QA CASHIER',role:'CASHIER',active:true,phone:'551199990003'},
  {id:'viewer1',personId:'person-viewer',clubId:'club-a',name:'QA VIEWER',role:'VIEWER',active:true,phone:'551199990004'},
  {id:'dealer1',personId:'person-dealer',clubId:'club-a',name:'QA DEALER',role:'DEALER',active:true,phone:'551199990005'},
  {id:'foreign-dealer',personId:'person-foreign',clubId:'club-b',name:'FOREIGN DEALER',role:'DEALER',active:true,phone:'551199990006'}
 ];
 const people=staff.map(s=>({id:s.personId,cpf:'00000000000',name:s.name,pin:'1234',active:true}));
 const memberships=staff.map(s=>({id:s.id===cfg.staffId?cfg.membershipId:`m-${s.id}`,personId:s.personId,clubId:s.clubId,staffId:s.id,role:s.role,permissions:[],active:true,createdAt:now}));
 const state={
  eventId:'event-e2e',tournamentName:'E2E MAIN',clubId:'club-a',clubName:'QA CLUB A',activeEnvironmentId:'club-a',activeEnvironmentName:'QA CLUB A',activeEnvironmentType:'CLUB',prepared:true,tournamentStatus:'VALIDATED',status:'VALIDADO',
  gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,buyinChips:30000,startingStack:30000,fee:50,guaranteed:10000,paidPlaces:3,lateRegLevel:4,
  running:false,levelIndex:0,remaining:1200,elapsed:0,playersLeft:2,field:2,prizePool:1000,structure:[{type:'level',label:'NÍVEL 1',duration:1200,sb:100,bb:200,ante:200},{type:'level',label:'NÍVEL 2',duration:1200,sb:200,bb:400,ante:400}],
  staffUsers:staff,authPeople:people,authClubs:[{id:'club-a',name:'QA CLUB A',type:'CLUB',active:true},{id:'club-b',name:'QA CLUB B',type:'CLUB',active:true}],authMemberships:memberships,dealerWorkSessions:[],
  players:[{id:'p1',name:'ALFA',validationEventId:'event-e2e',status:'active',table:1,seat:1,seatStatus:'ASSIGNED',validationCode:'ABC123',validationCodeStatus:'ACTIVE',createdAt:now},{id:'p2',name:'BRAVO',validationEventId:'event-e2e',status:'active',table:1,seat:2,seatStatus:'ASSIGNED',validationCode:'DEF456',validationCodeStatus:'ACTIVE',createdAt:now},{id:'foreign-player',name:'OUTRO EVENTO',validationEventId:'event-other',status:'active',table:1,seat:1,validationCode:'ZZZ999',validationCodeStatus:'ACTIVE'}],
  transactions:[{id:'tx1',eventId:'event-e2e',playerId:'p1',playerName:'ALFA',type:'ENTRY',value:550,breakdown:{classification:'CLASSIFIED',prize:500,fee:50}},{id:'foreign-tx',eventId:'event-other',playerId:'foreign-player',type:'REBUY',value:999}],
  seatCheckins:[],tableMovements:[],balancePlan:[],staffAlerts:[],botCommands:[],auditLog:[],messageQueue:[],messageLog:[],paymentIntents:[],walletTransactions:[],validationLog:[],rankings:[],loyaltyAccounts:[],campaigns:[],playerCommunications:[],cashTables:[],cashSessions:[],cashTransactions:[],
  savedTournaments:[{id:'event-e2e',name:'E2E MAIN',status:'VALIDATED',data:{tournamentName:'E2E MAIN',clubId:'club-a',clubName:'QA CLUB A',gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,buyinChips:30000,startingStack:30000,structure:[{type:'level',label:'NÍVEL 1',duration:1200,sb:100,bb:200,ante:200},{type:'level',label:'NÍVEL 2',duration:1200,sb:200,bb:400,ante:400}],finalTableStructureMode:'TIMER',finalTableHandsPerLevel:10}}]
 };
 const session={id:`session-${role}`,personId:cfg.personId,personName:cfg.name,clubId:'club-a',clubName:'QA CLUB A',membershipId:cfg.membershipId,staffId:cfg.staffId,role,permissions:[],deviceId:`device-${role}`,startedAt:now};
 const ready=[{id:'event-e2e',name:'E2E MAIN',status:'VALIDATED',validatedAt:now,dealerIds:['dealer1'],data:{clubId:'club-a',clubName:'QA CLUB A',gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,buyinChips:30000,structure:state.structure}}];
 return {role,state,session,ready};
}
async function newRoleContext(browser,role){
 const context=await browser.newContext({viewport:{width:412,height:915}});
 const data=seed(role);
 await context.addInitScript(({role,state,session,ready})=>{
   const marker=`stackup-e2e-${role}`;
   if(sessionStorage.getItem(marker)==='1')return;
   localStorage.setItem('stackup-production-reset-version','2026-09-04-professional-v1');
   localStorage.setItem('poker-club-state-v4',JSON.stringify(state));
   localStorage.setItem('stackup-auth-session-v1',JSON.stringify(session));
   localStorage.setItem('stackup-auth-login-v1',JSON.stringify({personId:session.personId,authenticatedAt:Date.now()}));
   localStorage.setItem('stackup-ready-tournaments-v1',JSON.stringify(ready));
   localStorage.setItem('stackup-active-environment-v1','club-a');
   sessionStorage.setItem(marker,'1');
 },data);
 return context;
}
async function pageWithErrors(context){
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
 return {page,errors};
}
async function visible(page,selector){return page.locator(selector).isVisible().catch(()=>false)}
async function hrefVisible(page,href){return visible(page,`a[href^="${href}"]`)}
async function goto(page,path){await page.goto(`${BASE}/${path}`,{waitUntil:'domcontentloaded'});await page.waitForTimeout(250)}

(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  {
   const ctx=await newRoleContext(browser,'TD'),{page,errors}=await pageWithErrors(ctx);
   await goto(page,'index.html');
   await expect('TD: TORNEIOS visível',()=>hrefVisible(page,'tournaments.html'));
   await expect('TD: TRANSMISSÃO visível',()=>hrefVisible(page,'screen.html'));
   await expect('TD: FINANCEIRO oculto',async()=>!(await hrefVisible(page,'financial-hub.html')));
   await page.locator('a[href="tournaments.html"]').click();await page.waitForURL(/tournaments\.html/);
   await expect('TD: CONFIGURAÇÕES DE TORNEIO clicável',()=>hrefVisible(page,'tournament-settings.html'));
   await expect('TD: GESTÃO DE TORNEIOS clicável',()=>hrefVisible(page,'control.html'));
   await goto(page,'tournament-manager.html?id=event-e2e');
   await expect('TD: OPERAÇÃO DO TORNEIO não desapareceu',()=>visible(page,'#ops'));
   await goto(page,'final-table-settings.html');
   await expect('TD: MESA FINAL abre sem redirecionar',async()=>/final-table-settings\.html/.test(page.url())&&await visible(page,'#saveBtn'));
   await goto(page,'dealer-activation.html');
   await expect('TD: ATIVAÇÃO DE DEALER abre',async()=>/dealer-activation\.html/.test(page.url())&&await visible(page,'#releaseBtn'));
   await goto(page,'bot.html');
   await expect('TD: BOT usa operador autenticado',async()=>await page.locator('#sender').isDisabled()&&/QA TD/.test(await page.locator('#sender').textContent()));
   await expect('TD: jornada sem exceções JS',async()=>errors.length===0);
   if(errors.length)console.error(errors.join('\n'));
   await ctx.close();
  }
  {
   const ctx=await newRoleContext(browser,'FLOOR'),{page,errors}=await pageWithErrors(ctx);
   await goto(page,'index.html');
   await expect('FLOOR: TORNEIOS visível',()=>hrefVisible(page,'tournaments.html'));
   await expect('FLOOR: TRANSMISSÃO oculta',async()=>!(await hrefVisible(page,'screen.html')));
   await goto(page,'tournaments.html');
   await expect('FLOOR: CONFIGURAÇÕES ocultas',async()=>!(await hrefVisible(page,'tournament-settings.html')));
   await expect('FLOOR: TORNEIOS VALIDADOS ocultos',async()=>!(await hrefVisible(page,'ready-tournaments.html')));
   await expect('FLOOR: MANAGER visível',()=>hrefVisible(page,'tournament-manager.html'));
   await goto(page,'control.html');
   await page.waitForTimeout(400);
   await expect('FLOOR: ATIVAR DEALER administrativo oculto',async()=>!(await page.getByText('ATIVAR DEALER',{exact:true}).isVisible().catch(()=>false)));
   await expect('FLOOR: jornada sem exceções JS',async()=>errors.length===0);
   if(errors.length)console.error(errors.join('\n'));
   await ctx.close();
  }
  {
   const ctx=await newRoleContext(browser,'CASHIER'),{page,errors}=await pageWithErrors(ctx);
   await goto(page,'index.html');
   await expect('CASHIER: FINANCEIRO visível',()=>hrefVisible(page,'financial-hub.html'));
   await expect('CASHIER: TORNEIOS oculto',async()=>!(await hrefVisible(page,'tournaments.html')));
   await page.locator('a[href="financial-hub.html"]').click();await page.waitForURL(/financial-hub\.html/);
   await expect('CASHIER: CAIXA visível',()=>hrefVisible(page,'finance.html'));
   await expect('CASHIER: CARTEIRA visível',()=>hrefVisible(page,'wallet.html'));
   await expect('CASHIER: BOUNTY oculto sem RESULTS',async()=>!(await hrefVisible(page,'bounty.html')));
   await goto(page,'cash.html');
   await expect('CASHIER: CASH abre autenticado',async()=>/cash\.html/.test(page.url())&&await visible(page,'#openTable'));
   await expect('CASHIER: jornada sem exceções JS',async()=>errors.length===0);
   if(errors.length)console.error(errors.join('\n'));
   await ctx.close();
  }
  {
   const ctx=await newRoleContext(browser,'VIEWER'),{page,errors}=await pageWithErrors(ctx);
   await goto(page,'index.html');
   await expect('VIEWER: apenas RANKING principal disponível',async()=>await hrefVisible(page,'ranking.html')&&!(await hrefVisible(page,'tournaments.html'))&&!(await hrefVisible(page,'financial-hub.html')));
   await goto(page,'ranking.html');
   await expect('VIEWER: regras administrativas ocultas',async()=>!(await hrefVisible(page,'ranking-rules.html')));
   await goto(page,'ready-tournaments.html');
   await expect('VIEWER: torneio validado é somente leitura',async()=>await visible(page,'.templateCard.readOnly')&&await page.locator('[data-ready-index]').count()===0);
   await goto(page,'player-live.html');
   await page.waitForTimeout(200);
   await expect('VIEWER: PLAYER LIVE protegido',async()=>!/player-live\.html/.test(page.url()));
   await expect('VIEWER: jornada sem exceções JS',async()=>errors.length===0);
   if(errors.length)console.error(errors.join('\n'));
   await ctx.close();
  }
  {
   const ctx=await newRoleContext(browser,'TD'),{page,errors}=await pageWithErrors(ctx);
   await goto(page,'cash.html');await page.waitForTimeout(200);
   await expect('TD: CASH financeiro direto é bloqueado',async()=>!/cash\.html/.test(page.url()));
   await goto(page,'ai-link.html');
   await expect('TD: relatório financeiro IA oculto',async()=>!(await hrefVisible(page,'financial-hub.html')));
   await expect('TD: ASSISTENTE IA continua visível',()=>hrefVisible(page,'bot.html'));
   await expect('TD: verificação adicional sem exceções JS',async()=>errors.length===0);
   if(errors.length)console.error(errors.join('\n'));
   await ctx.close();
  }
 }finally{await browser.close()}
 if(failures.length){console.error(`BROWSER ROLE E2E FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
 console.log('BROWSER ROLE E2E PASS: Chromium real validou navegação e permissões TD/FLOOR/CASHIER/VIEWER.');
})().catch(e=>{console.error(e.stack||e);process.exit(1)});