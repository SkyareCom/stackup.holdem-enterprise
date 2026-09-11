const fs=require('fs');
const path=require('path');

const root=process.cwd();
const enforce=process.argv.includes('--enforce');
const deployArtifact=process.env.STACKUP_DEPLOY_ARTIFACT==='1';
const ignoreDirs=new Set(['.git','node_modules','tests','.github']);
const exts=new Set(['.js','.html','.css']);
const protectedDisplays=new Set(['cast-10px.html','cast-v2.html','cast-ft-live.html','tv.html','tv-connect.html']);
const failures=[];
const notes=[];
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const fail=m=>failures.push(m);

const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ignoreDirs.has(ent.name))continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())walk(p);
    else if(exts.has(path.extname(ent.name).toLowerCase()))files.push(p);
  }
}
walk(root);

const nativeCall=/\b(?:window\.|globalThis\.)?(alert|confirm|prompt)\s*\(/g;
let coveredLegacyCalls=0;
for(const abs of files){
  const rel=path.relative(root,abs).replace(/\\/g,'/');
  const base=path.basename(rel).toLowerCase();
  const text=fs.readFileSync(abs,'utf8');
  if(/\bwindow\.open\s*\(/.test(text))fail(`${rel}: usa window.open; abertura externa/pop-up proibida`);
  if(/\.showModal\s*\(/.test(text))fail(`${rel}: usa showModal; diálogo modal proibido`);
  if(/<dialog\b/i.test(text))fail(`${rel}: contém <dialog>; diálogo modal proibido`);
  if(!protectedDisplays.has(base)&&/position\s*:\s*fixed/i.test(text)&&/(?:modal|overlay|popup)/i.test(text))fail(`${rel}: contém camada fixa modal/overlay/popup fora das telas de transmissão`);

  nativeCall.lastIndex=0;
  let m;
  while((m=nativeCall.exec(text))){
    const prefix=text.slice(Math.max(0,m.index-30),m.index);
    if(/function\s+$/.test(prefix))continue;
    if(rel==='inline-interactions-v1.js')continue;
    coveredLegacyCalls++;
    if(protectedDisplays.has(base))fail(`${rel}: chama ${m[1]}() em tela protegida que não recebe adaptador inline`);
  }
}

const inline=read('inline-interactions-v1.js');
for(const token of ['window.alert=function','window.confirm=function','window.prompt=function','stackup-inline-notice','stackup-inline-confirmation','position:relative!important','aria-live']){
  if(!inline.includes(token))fail(`inline-interactions-v1.js: falta proteção inline obrigatória ${token}`);
}
for(const forbidden of ['position:fixed','showModal','<dialog','stackup-inline-drawer']){
  if(inline.includes(forbidden))fail(`inline-interactions-v1.js: ainda contém UI de popup/modal ${forbidden}`);
}
if(!inline.includes('return false')||!inline.includes('approved={trigger'))fail('inline-interactions-v1.js: confirmação destrutiva não preserva confirmação explícita do usuário');

const lists=read('in-app-lists.js');
for(const token of ["querySelectorAll?.('select')","setAttribute('size'",'data-stackup-options-open','aria-expanded','[data-stackup-drawer] > [data-stackup-drawer-trigger]{display:none!important','[data-stackup-drawer] > [data-stackup-drawer-panel]']){
  if(!lists.includes(token))fail(`in-app-lists.js: falta regra de lista sempre aberta ${token}`);
}
for(const forbidden of ['stackup-select-trigger','stackup-select-list',"content:'ABRIR'","content:'FECHAR'","hasAttribute('data-stackup-inline-list')"]){
  if(lists.includes(forbidden))fail(`in-app-lists.js: ainda contém controle recolhido ${forbidden}`);
}

const clickLayer=read('clickable-list-drawer-v1.js');
for(const forbidden of ['preventDefault()','stopImmediatePropagation()','openDrawer(','data-stackup-list-run']){
  if(clickLayer.includes(forbidden))fail(`clickable-list-drawer-v1.js: ainda exige etapa intermediária ${forbidden}`);
}

const theme=read('app-theme.js');
for(const token of ["loadScript('in-app-lists.js","loadScript('inline-interactions-v1.js","loadScript('clickable-list-drawer-v1.js",'s.async=false']){
  if(!theme.includes(token))fail(`app-theme.js: falta carregamento determinístico ${token}`);
}

const setupOwner=read('setup-structure-owner-v1.js');
if(/identifierModal|position\s*:\s*fixed/i.test(setupOwner))fail('setup-structure-owner-v1.js: seletor de identificador ainda usa modal');
const dealerLock=read('dealer-device-lock-v1.js');
if(/position\s*:\s*fixed|inset\s*:\s*0/i.test(dealerLock))fail('dealer-device-lock-v1.js: aviso de bloqueio ainda usa overlay');
const dealerSync=read('dealer-device-sync-v1.js');
if(/position\s*:\s*fixed|dealerSyncOverlay/i.test(dealerSync))fail('dealer-device-sync-v1.js: aviso de sincronização ainda usa overlay');

const pagesWorkflow=read('.github/workflows/pages.yml');
if(!pagesWorkflow.includes("canonicalize(s,'app-theme.js'"))fail('pages.yml: publicação não garante app-theme nas telas operacionais');

if(deployArtifact){
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
    if(protectedDisplays.has(file.toLowerCase()))continue;
    const html=read(file);
    const direct=nativeCall.test(html);nativeCall.lastIndex=0;
    if(direct&&!html.includes('app-theme.js')&&!html.includes('inline-interactions-v1.js'))fail(`${file}: artefato publicado contém alerta/confirmação sem adaptador inline`);
  }
}

notes.push(`POPUP/OPTION AUDIT: ${files.length} arquivos de aplicação verificados.`);
notes.push(`POPUP/OPTION AUDIT: ${coveredLegacyCalls} chamada(s) legada(s) alert/confirm/prompt cobertas pelo adaptador inline global.`);
notes.push('POPUP/OPTION AUDIT: selects sempre abertos, gavetas de opção expandidas e avisos/decisões no fluxo da página.');
notes.forEach(x=>console.log(x));
if(failures.length){failures.forEach(x=>console.error('FAIL:',x));if(enforce)process.exit(1);else console.error(`POPUP/OPTION AUDIT: ${failures.length} falha(s) detectada(s).`)}else console.log('POPUP/OPTION AUDIT PASS: nenhuma superfície modal de opção/aviso detectada.');
