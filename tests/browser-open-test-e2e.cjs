const { chromium }=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:412,height:915}});
  const errors=[];
  const dialogs=[];
  const check=async(path,fn)=>{
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(`${path}: ${e.message}`));
    page.on('console',m=>{if(m.type()==='error')errors.push(`${path}: ${m.text()}`)});
    page.on('dialog',async d=>{dialogs.push(`${path}: ${d.type()} • ${d.message()}`);await d.dismiss().catch(()=>{})});
    try{
      await page.goto(`${BASE}/${path}`,{waitUntil:'domcontentloaded',timeout:15000});
      await page.waitForTimeout(250);
      if(!(await fn(page)))throw new Error(`Falha em ${path}`);
    }finally{await page.close().catch(()=>{})}
  };
  await check('index.html',async page=>await page.evaluate(()=>window.StackupAuth?.OPEN_TEST_MODE===true)&&await page.locator('.sector-grid > a.sector-card:visible').count()===10);
  await check('sector.html?s=operacao',async page=>!/login\.html/.test(page.url())&&await page.locator('.sector-options > a.sector-option:visible').count()>=5);
  for(const path of ['setup.html','staff-hub.html','environments-hub.html','financial-hub.html','ranking-rules.html','screen.html','ai-link.html']){
    await check(path,async page=>!/login\.html/.test(page.url()));
  }
  await check('login.html',async page=>{await page.waitForTimeout(250);return /index\.html/.test(page.url())});
  if(dialogs.length)throw new Error(`POP-UP NATIVO DETECTADO: ${dialogs.join(' | ')}`);
  if(errors.length)throw new Error(errors.join(' | '));
  await context.close();
  await browser.close();
  console.log('BROWSER OPEN TEST ACCESS E2E PASS: home setorizada, hub operacional e rotas carregam sem diálogo nativo.');
})().catch(async e=>{console.error(e.stack||e);process.exit(1)});