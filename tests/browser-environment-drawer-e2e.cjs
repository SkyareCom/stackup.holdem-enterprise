const {chromium}=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
const failures=[];let checks=0;
function check(name,ok,detail=''){checks++;if(ok)console.log('PASS:',name);else{const msg=name+(detail?` • ${detail}`:'');failures.push(msg);console.error('FAIL:',msg)}}
(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:412,height:915}});
  const state={
    activeEnvironmentId:'club-a',activeEnvironmentName:'CLUBE A',activeEnvironmentType:'CLUB',clubId:'club-a',clubName:'CLUBE A',prepared:false,
    authClubs:[{id:'club-a',name:'CLUBE A',type:'CLUB',active:true},{id:'league-b',name:'LIGA B',type:'LEAGUE',active:true}],
    authMemberships:[{id:'member-b',clubId:'league-b',staffId:'staff-b',role:'FLOOR',active:true}],
    authPeople:[],staffUsers:[],players:[],transactions:[],auditLog:[],messageQueue:[],messageLog:[]
  };
  await context.addInitScript(({seed,marker})=>{
    if(localStorage.getItem(marker)==='1')return;
    localStorage.setItem('stackup-production-reset-version','2026-09-04-professional-v1');
    localStorage.setItem('poker-club-state-v4',JSON.stringify(seed));
    localStorage.setItem('stackup-active-environment-v1','club-a');
    localStorage.setItem(marker,'1');
  },{seed:state,marker:'stackup-e2e-environment-seeded-v1'});
  const page=await context.newPage(),errors=[],dialogs=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('dialog',async d=>{dialogs.push(`${d.type()}:${d.message()}`);await d.dismiss().catch(()=>{})});
  try{
    await page.goto(`${BASE}/environment-registered.html`,{waitUntil:'domcontentloaded',timeout:15000});
    check('Ambiente ativo inicial aparece',(await page.locator('#activeEnvironmentName').innerText()).includes('CLUBE A'));
    const row=page.locator('[data-environment-row="league-b"]');
    const name=row.locator('.stackup-compact-name');
    await name.waitFor({state:'visible',timeout:6000});
    check('Linha recolhida mostra LIGA B',(await name.innerText()).trim()==='LIGA B');
    check('Ações ficam recolhidas antes do clique',!(await row.locator('.stackup-row-actions').isVisible().catch(()=>false)));
    await name.click();
    check('Clique no nome abre gaveta inline',await row.locator('.stackup-row-actions').isVisible());
    check('Gaveta possui FIXAR',await row.locator('[data-stackup-fix="league-b"]').isVisible());
    check('Gaveta possui EDITAR',await row.locator('[data-stackup-edit="league-b"]').isVisible());
    check('Gaveta possui APAGAR',await row.locator('[data-stackup-delete="league-b"]').isVisible());

    await row.locator('[data-stackup-fix="league-b"]').click();
    let snap=await page.evaluate(()=>({id:state.activeEnvironmentId,name:state.activeEnvironmentName,type:state.activeEnvironmentType}));
    check('FIXAR troca ambiente sem popup',snap.id==='league-b'&&snap.name==='LIGA B'&&snap.type==='LEAGUE',JSON.stringify(snap));
    check('Cabeçalho acompanha FIXAR',(await page.locator('#activeEnvironmentName').innerText()).includes('LIGA B'));

    await row.locator('[data-stackup-edit="league-b"]').click();
    await page.waitForURL(/environment-register\.html\?edit=league-b/,{timeout:5000});
    await page.locator('#newClubName').waitFor({state:'visible',timeout:5000});
    check('EDITAR abre cadastro de origem',(await page.locator('.title').innerText()).includes('EDITAR AMBIENTE'));
    check('Cadastro de origem vem preenchido',(await page.locator('#newClubName').inputValue())==='LIGA B');
    check('Edição usa botão CONFIRMAR',(await page.locator('#createClub').innerText()).trim()==='CONFIRMAR');
    await page.locator('#newClubName').fill('LIGA B EDITADA');
    await page.locator('#createClub').click();
    await page.waitForURL(/environment-registered\.html/,{timeout:5000});
    snap=await page.evaluate(()=>({club:state.authClubs.find(x=>x.id==='league-b'),activeName:state.activeEnvironmentName}));
    check('CONFIRMAR persiste edição',snap.club?.name==='LIGA B EDITADA'&&snap.activeName==='LIGA B EDITADA',JSON.stringify(snap));

    const edited=page.locator('[data-environment-row="league-b"]');
    await edited.locator('.stackup-compact-name').waitFor({state:'visible',timeout:6000});
    await edited.locator('.stackup-compact-name').click();
    await edited.locator('[data-stackup-delete="league-b"]').click();
    const confirm=page.locator('.stackup-inline-drawer');
    await confirm.waitFor({state:'visible',timeout:4000});
    check('APAGAR abre confirmação abaixo da seção',await confirm.locator('[data-stackup-confirm]').isVisible());
    check('Confirmação oferece CANCELAR',await confirm.locator('[data-stackup-cancel]').isVisible());
    check('Nenhum dialog nativo apareceu antes de confirmar',dialogs.length===0,dialogs.join(' | '));
    await confirm.locator('[data-stackup-confirm]').click();
    await page.waitForTimeout(500);
    snap=await page.evaluate(()=>({club:state.authClubs.find(x=>x.id==='league-b'),active:state.activeEnvironmentId,membership:state.authMemberships.find(x=>x.id==='member-b')}));
    check('APAGAR desativa ambiente',snap.club?.active===false,JSON.stringify(snap));
    check('APAGAR limpa ambiente ativo',snap.active==='',JSON.stringify(snap));
    check('APAGAR desativa vínculo',snap.membership?.active===false,JSON.stringify(snap));
    check('Fluxo não abre popup nativo',dialogs.length===0,dialogs.join(' | '));
    check('Fluxo sem exceções JavaScript',errors.length===0,errors.join(' | '));
  }catch(e){check('Fluxo Chromium de ambientes conclui',false,e.stack||e.message)}
  await context.close();await browser.close();
  if(failures.length){console.error(`BROWSER ENVIRONMENT DRAWER E2E FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
  console.log(`BROWSER ENVIRONMENT DRAWER E2E PASS: ${checks} verificações de gaveta, edição, exclusão e zero popups.`);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
