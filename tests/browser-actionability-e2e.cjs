const { chromium }=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';

const sectors=[
  'cadastrar','cadastrados','configuracoes','operacao','controle','resultados',
  'ai','stations','financeiro','comunicacoes','transmissao','relatorios'
];

(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:412,height:915}});
  const page=await context.newPage();
  const errors=[];
  const dialogs=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('dialog',async d=>{dialogs.push(`${d.type()}: ${d.message()}`);await d.dismiss().catch(()=>{})});

  await page.goto(`${BASE}/index.html`,{waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForTimeout(250);
  const cards=page.locator('.sector-grid > a.sector-card:visible');
  const cardCount=await cards.count();
  if(cardCount!==12)throw new Error(`HOME ENTERPRISE: esperado 12 setores, encontrado ${cardCount}`);

  const hrefs=[];
  for(let i=0;i<cardCount;i++){
    const card=cards.nth(i);
    const href=await card.getAttribute('href');
    hrefs.push(href||'');
    await card.scrollIntoViewIfNeeded();
    await card.click({trial:true,timeout:2000});
  }
  for(const key of sectors){
    if(!hrefs.some(h=>h===`sector.html?s=${key}`))throw new Error(`HOME ENTERPRISE: setor ausente -> ${key}`);
  }

  let checkedOptions=0;
  for(const key of sectors){
    await page.goto(`${BASE}/sector.html?s=${key}`,{waitUntil:'domcontentloaded',timeout:15000});
    await page.waitForTimeout(120);
    if(/login\.html/.test(page.url()))throw new Error(`SETOR ${key}: redirecionou para login`);
    const title=(await page.locator('#sectorTitle').textContent().catch(()=>''))?.trim();
    if(!title)throw new Error(`SETOR ${key}: título ausente`);
    const options=page.locator('.sector-options > a.sector-option:visible');
    const count=await options.count();
    if(count<1)throw new Error(`SETOR ${key}: nenhuma opção funcional`);
    const sample=Math.min(count,3);
    for(let i=0;i<sample;i++){
      const option=options.nth(i);
      const href=await option.getAttribute('href');
      if(!href||!href.endsWith('.html'))throw new Error(`SETOR ${key}: opção sem rota local válida`);
      await option.scrollIntoViewIfNeeded();
      await option.click({trial:true,timeout:2000});
      checkedOptions++;
    }
  }

  if(dialogs.length)throw new Error(`POP-UP NATIVO DETECTADO: ${dialogs.join(' | ')}`);
  if(errors.length)throw new Error(`ERROS DE RUNTIME: ${errors.join(' | ')}`);

  await context.close();
  await browser.close();
  console.log(`BROWSER ACTIONABILITY E2E PASS: 12 setores da HOME + ${checkedOptions} opções dos hubs passaram hit-test real em Chromium.`);
})().catch(async e=>{console.error(e.stack||e);process.exit(1)});
