const { chromium }=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:412,height:915}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const check=async(path,fn)=>{await page.goto(`${BASE}/${path}`,{waitUntil:'domcontentloaded'});await page.waitForTimeout(200);if(!(await fn()))throw new Error(`Falha em ${path}`)};
  await check('index.html',async()=>await page.evaluate(()=>window.StackupAuth?.OPEN_TEST_MODE===true)&&await page.locator('.grid > a.card:visible').count()===11);
  for(const path of ['setup.html','staff-hub.html','environments-hub.html','financial-hub.html','ranking-rules.html','screen.html','ai-link.html']){
    await check(path,async()=>!/login\.html/.test(page.url()));
  }
  await check('login.html',async()=>{await page.waitForTimeout(250);return /index\.html/.test(page.url())});
  if(errors.length)throw new Error(errors.join(' | '));
  await browser.close();
  console.log('BROWSER OPEN TEST ACCESS E2E PASS: app liberado e login/senha em standby durante a fase de testes.');
})().catch(async e=>{console.error(e.stack||e);process.exit(1)});
