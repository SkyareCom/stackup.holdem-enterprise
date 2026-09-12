const {chromium}=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
const failures=[];let checks=0;
function check(name,ok,detail=''){checks++;if(ok)console.log('PASS:',name);else{const msg=name+(detail?` • ${detail}`:'');failures.push(msg);console.error('FAIL:',msg)}}
(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:412,height:915}});
  const state={activeEnvironmentId:'club-a',activeEnvironmentName:'CLUBE A',activeEnvironmentType:'CLUB',clubId:'club-a',clubName:'CLUBE A',prepared:false,authClubs:[{id:'club-a',name:'CLUBE A',type:'CLUB',active:true},{id:'league-b',name:'LIGA B',type:'LEAGUE',active:true}],authMemberships:[{id:'member-b',clubId:'league-b',staffId:'staff-b',role:'FLOOR',active:true}],authPeople:[],staffUsers:[],players:[],transactions:[],auditLog:[],messageQueue:[],messageLog:[]};
  await context.addInitScript(({seed,marker})=>{if(localStorage.getItem(marker)==='1')return;localStorage.setItem('stackup-production-reset-version','2026-09-04-professional-v1');localStorage.setItem('poker-club-state-v4',JSON.stringify(seed));localStorage.setItem('stackup-active-environment-v1','club-a');localStorage.setItem(marker,'1')},{seed:state,marker:'stackup-e2e-environment-seeded-v1'});
  const page=await context.newPage(),errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('dialog',async d=>{dialogs.push(`${d.type()}:${d.message()}`);await d.dismiss().catch(()=>{})});
  const openDirectory=async()=>{const t=page.locator('#stackup-environment-directory-toggle');await t.waitFor({state:'visible',timeout:6000});const panel=page.locator('#stackup-environment-directory-panel');if(!(await panel.isVisible()))await t.click();await panel.waitFor({state:'visible',timeout:3000});return panel};
  const chooseAction=async(action,id)=>{const panel=await openDirectory();await panel.locator(`[data-stackup-action="${action}"]`).click();const row=panel.locator(`[data-environment-row="${id}"]`);await row.waitFor({state:'visible',timeout:3000});check(`Quadrado aparece para ${action}`,await row.locator('.stackup-directory-pick').isVisible());await row.click();check(`Quadrado registra seleção para ${action}`,(await row.locator('.stackup-directory-pick').getAttribute('data-picked'))==='1');await panel.locator('[data-stackup-action="confirm"]').click()};
  try{
    await page.goto(`${BASE}/environment-registered.html`,{waitUntil:'domcontentloaded',timeout:15000});
    check('Ambiente ativo inicial aparece',(await page.locator('#activeEnvironmentName').innerText()).includes('CLUBE A'));
    const panel=await openDirectory();
    check('Card de quantidade mostra 2',(await panel.locator('.stackup-list-count strong').innerText()).trim()==='2');
    const names=await panel.locator('[data-environment-row] .stackup-compact-name').allInnerTexts();
    check('Lista está em ordem alfabética',names[0].includes('CLUBE A')&&names[1].includes('LIGA B'),names.join(' | '));
    check('Lista está enumerada',(await panel.locator('[data-environment-row]').nth(0).getAttribute('data-stackup-list-index'))==='01 •'&&(await panel.locator('[data-environment-row]').nth(1).getAttribute('data-stackup-list-index'))==='02 •');
    check('Ações padrão estão presentes',await panel.locator('[data-stackup-action="edit"]').isVisible()&&await panel.locator('[data-stackup-action="delete"]').isVisible()&&await panel.locator('[data-stackup-action="use"]').isVisible()&&await panel.locator('[data-stackup-action="confirm"]').isVisible());

    await chooseAction('use','league-b');
    let snap=await page.evaluate(()=>({id:state.activeEnvironmentId,name:state.activeEnvironmentName,type:state.activeEnvironmentType}));
    check('USAR troca ambiente sem popup',snap.id==='league-b'&&snap.name==='LIGA B'&&snap.type==='LEAGUE',JSON.stringify(snap));
    check('Cabeçalho acompanha USAR',(await page.locator('#activeEnvironmentName').innerText()).includes('LIGA B'));

    await chooseAction('edit','league-b');
    await page.waitForURL(/environment-register\.html\?edit=league-b/,{timeout:5000});
    await page.locator('#newClubName').waitFor({state:'visible',timeout:5000});
    check('EDITAR abre cadastro de origem',(await page.locator('.title').innerText()).includes('EDITAR AMBIENTE'));
    check('Cadastro vem preenchido',(await page.locator('#newClubName').inputValue())==='LIGA B');
    await page.locator('#newClubName').fill('LIGA B EDITADA');await page.locator('#createClub').click();await page.waitForURL(/environment-registered\.html/,{timeout:5000});
    snap=await page.evaluate(()=>({club:state.authClubs.find(x=>x.id==='league-b'),activeName:state.activeEnvironmentName}));
    check('CONFIRMAR persiste edição',snap.club?.name==='LIGA B EDITADA'&&snap.activeName==='LIGA B EDITADA',JSON.stringify(snap));

    await chooseAction('delete','league-b');
    const inlineConfirm=page.locator('.stackup-inline-drawer');await inlineConfirm.waitFor({state:'visible',timeout:4000});
    check('APAGAR abre confirmação inline',await inlineConfirm.locator('[data-stackup-confirm]').isVisible());
    check('Confirmação oferece CANCELAR',await inlineConfirm.locator('[data-stackup-cancel]').isVisible());
    check('Nenhum diálogo nativo apareceu',dialogs.length===0,dialogs.join(' | '));
    await inlineConfirm.locator('[data-stackup-confirm]').click();await page.waitForTimeout(400);
    snap=await page.evaluate(()=>({club:state.authClubs.find(x=>x.id==='league-b'),active:state.activeEnvironmentId,membership:state.authMemberships.find(x=>x.id==='member-b')}));
    check('APAGAR desativa ambiente',snap.club?.active===false,JSON.stringify(snap));
    check('APAGAR limpa ambiente ativo',snap.active==='',JSON.stringify(snap));
    check('APAGAR desativa vínculo',snap.membership?.active===false,JSON.stringify(snap));
    check('Fluxo sem popups nativos',dialogs.length===0,dialogs.join(' | '));
    check('Fluxo sem exceções JavaScript',errors.length===0,errors.join(' | '));
  }catch(e){check('Fluxo Chromium de ambientes conclui',false,e.stack||e.message)}
  await context.close();await browser.close();if(failures.length){console.error(`BROWSER ENVIRONMENT DIRECTORY E2E FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}console.log(`BROWSER ENVIRONMENT DIRECTORY E2E PASS: ${checks} verificações de lista, seleção, ações e zero popups.`)
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
