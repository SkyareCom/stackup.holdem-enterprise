const {chromium}=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
const failures=[];let checks=0;
function assert(name,ok,detail=''){checks++;if(ok)console.log('PASS:',name);else{const msg=name+(detail?` • ${detail}`:'');failures.push(msg);console.error('FAIL:',msg)}}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:412,height:915}});
 const now=Date.now();
 const state={setupTitleFirstV1:true,eventId:'',tournamentName:'QA SETUP',clubId:'club-a',clubName:'CLUBE A',activeEnvironmentId:'club-a',activeEnvironmentName:'CLUBE A',activeEnvironmentType:'CLUB',prepared:false,status:'',tournamentStatus:'',gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,buyinChips:30000,startingStack:30000,fee:50,structure:[],savedStructures:[],authClubs:[{id:'club-a',name:'CLUBE A',type:'CLUB',active:true}],authPeople:[{id:'person-owner',cpf:'11111111111',name:'OWNER QA',active:true}],staffUsers:[{id:'owner',personId:'person-owner',clubId:'club-a',name:'OWNER QA',role:'OWNER',active:true}],authMemberships:[{id:'m-owner',personId:'person-owner',clubId:'club-a',staffId:'owner',role:'OWNER',permissions:['*'],active:true}],players:[],transactions:[],auditLog:[],messageQueue:[],messageLog:[]};
 const session={id:'session-owner',personId:'person-owner',personName:'OWNER QA',clubId:'club-a',clubName:'CLUBE A',membershipId:'m-owner',staffId:'owner',role:'OWNER',permissions:['*'],deviceId:'qa-device',startedAt:now};
 await context.addInitScript(({state,session,marker})=>{if(localStorage.getItem(marker)==='1')return;localStorage.setItem('stackup-production-reset-version','2026-09-04-professional-v1');localStorage.setItem('poker-club-state-v4',JSON.stringify(state));localStorage.setItem('stackup-auth-session-v1',JSON.stringify(session));localStorage.setItem('stackup-auth-login-v1',JSON.stringify({personId:session.personId,authenticatedAt:Date.now()}));localStorage.setItem('stackup-active-environment-v1','club-a');localStorage.setItem(marker,'1');},{state,session,marker:'stackup-e2e-setup-seeded-v1'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
   await page.goto(`${BASE}/setup.html`,{waitUntil:'domcontentloaded',timeout:15000});
   await page.locator('#newStructure').waitFor({state:'visible',timeout:5000});
   await page.waitForTimeout(250);
   await page.locator('#newStructure').click();
   assert('NOVA ESTRUTURA abre o editor',await page.locator('#structureEditor').isVisible());
   assert('NOVA ESTRUTURA entrega ao menos um nível',(await page.locator('#levels .levelRow').count())>=1);
   assert('Nível novo possui identificador funcional',(await page.locator('#levels [data-identifier-toggle]').count())>=1);
   await page.locator('#timeButtons [data-time="20"]').click();
   await page.waitForTimeout(100);
   assert('Selecionar tempo preserva o identificador do nível',(await page.locator('#levels [data-identifier-toggle]').count())>=1);
   const row=page.locator('#levels .levelRow').first();
   const sb=row.locator('input[aria-label="SB"]'),bb=row.locator('input[aria-label="BB"]'),ante=row.locator('input[aria-label="ANTE"]');
   await sb.fill('100');await sb.blur();await bb.fill('200');await bb.blur();await ante.fill('200');await ante.blur();
   await row.locator('[data-row-action="ok"],button').filter({hasText:'OK'}).first().click();
   await page.locator('#saveStructure').click();
   assert('SALVAR abre nome da estrutura',await page.locator('#saveNameRow').isVisible());
   await page.locator('#structureName').fill('ESTRUTURA QA DINÂMICA');
   await page.locator('#confirmSaveStructure').click();
   let snap=await page.evaluate(()=>({saved:state.savedStructures,structure:state.structure}));
   assert('Estrutura é persistida ao confirmar',snap.saved.some(x=>x.name==='ESTRUTURA QA DINÂMICA'),JSON.stringify(snap.saved));
   const saved=snap.saved.find(x=>x.name==='ESTRUTURA QA DINÂMICA');
   assert('Estrutura salva preserva tempo e blinds',saved&&saved.rows?.[0]&&Number(saved.rows[0].time)===20&&Number(saved.rows[0].sb)===100&&Number(saved.rows[0].bb)===200,JSON.stringify(saved));
   await page.locator('#historyStructure').click();
   const item=page.locator('#historyList .historyItem').filter({hasText:'ESTRUTURA QA DINÂMICA'});
   assert('HISTÓRICO mostra estrutura salva',await item.isVisible());
   const useAction=item.locator('.historyActions button').first();
   await useAction.waitFor({state:'visible',timeout:5000});
   await useAction.click();
   await page.waitForTimeout(100);
   snap=await page.evaluate(()=>({structure:state.structure}));
   assert('USAR restaura a estrutura no estado',snap.structure?.length>0&&Number(snap.structure[0].duration)===1200&&Number(snap.structure[0].sb)===100&&Number(snap.structure[0].bb)===200,JSON.stringify(snap.structure));
   assert('USAR preserva editor com identificadores',(await page.locator('#levels [data-identifier-toggle]').count())>=1);
   assert('Fluxo de estrutura sem exceções JavaScript',errors.length===0,errors.join(' | '));
 }catch(e){assert('Fluxo Chromium SETUP conclui',false,e.stack||e.message)}finally{await context.close();await browser.close()}
 if(failures.length){console.error(`BROWSER SETUP DYNAMIC E2E FAILED: ${failures.length} falha(s).`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
 console.log(`BROWSER SETUP DYNAMIC E2E PASS: ${checks} verificações reais de edição, persistência e histórico.`);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
