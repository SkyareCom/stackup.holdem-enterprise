const fs=require('fs');
const path=require('path');

const root=process.cwd();
const deploy=process.env.STACKUP_DEPLOY_ARTIFACT==='1';
const failures=[];
const warnings=[];
const infos=[];
const htmlFiles=fs.readdirSync(root).filter(f=>f.endsWith('.html')).sort();
const allFiles=new Set(fs.readdirSync(root));
const protectedFiles=new Set(['cast-10px.html','cast-v2.html','cast-ft-live.html','cast-connect.html','tv.html','tv-connect.html','dealer-access.html']);
let buttonCount=0,nestedInteractive=0,normalizableNested=0,protectedNested=0,overlayCandidates=0;
const nestedByFile=new Map(),protectedNestedByFile=new Map(),overlayByFile=new Map();

const stripQuery=s=>String(s||'').split('#')[0].split('?')[0];
const external=s=>/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(String(s||''));
const cleanMarkup=html=>html.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'');
const textOf=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ').trim();
const countTag=(html,src)=>[...html.matchAll(new RegExp(`<script\\b[^>]*\\bsrc=["'][^"']*${src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[^"']*["'][^>]*><\\/script>`,'gi'))].length;

function insideTag(markup,index,tag){
  const before=markup.slice(0,index);
  return before.lastIndexOf(`<${tag}`)>before.lastIndexOf(`</${tag}>`);
}

function checkLocalTarget(file,kind,target){
  const raw=String(target||'').trim();
  if(!raw||external(raw))return;
  const local=path.basename(stripQuery(raw));
  if(local&&!allFiles.has(local))failures.push(`${file}: ${kind} LOCAL AUSENTE -> ${raw}`);
}

for(const file of htmlFiles){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const markup=cleanMarkup(html);

  const ids=new Map();
  for(const m of markup.matchAll(/\bid=["']([^"']+)["']/gi))ids.set(m[1],(ids.get(m[1])||0)+1);
  for(const [id,n] of ids)if(n>1)failures.push(`${file}: ID DUPLICADO NO MARKUP -> ${id} (${n}x)`);

  for(const m of markup.matchAll(/<a\b[^>]*\bhref=["']([^"']*)["'][^>]*>/gi))checkLocalTarget(file,'LINK',m[1]);
  for(const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi))checkLocalTarget(file,'SCRIPT',m[1]);
  for(const m of markup.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi))checkLocalTarget(file,'RECURSO',m[1]);

  for(const m of markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)){
    buttonCount++;
    const attrs=m[1]||'',label=textOf(m[2]);
    const accessible=/\baria-label=["'][^"']+["']/i.test(attrs)||/\btitle=["'][^"']+["']/i.test(attrs);
    if(!label&&!accessible)failures.push(`${file}: BOTÃO SEM RÓTULO ACESSÍVEL -> ${(attrs.match(/\bid=["']([^"']+)["']/i)||[])[1]||'(sem id)'}`);
    if(insideTag(markup,m.index||0,'a')){
      nestedInteractive++;
      if(protectedFiles.has(file)){
        protectedNested++;
        protectedNestedByFile.set(file,(protectedNestedByFile.get(file)||0)+1);
      }else{
        normalizableNested++;
        nestedByFile.set(file,(nestedByFile.get(file)||0)+1);
        if(/\bon\w+\s*=|\bdisabled\b|aria-disabled=["']true/i.test(attrs))failures.push(`${file}: BOTÃO ANINHADO POSSUI COMPORTAMENTO PRÓPRIO E NÃO PODE SER NORMALIZADO COM SEGURANÇA -> ${label||'(sem rótulo)'}`);
      }
    }
    if(/\bstyle=["'][^"']*pointer-events\s*:\s*none/i.test(attrs)&&!/\bdisabled\b|aria-disabled=["']true/i.test(attrs))failures.push(`${file}: BOTÃO HABILITADO COM POINTER-EVENTS NONE -> ${label||'(sem rótulo)'}`);
  }

  for(const m of markup.matchAll(/\bonclick=["']([^"']+)["']/gi)){
    const code=m[1];
    for(const n of code.matchAll(/(?:location(?:\.href)?\s*=|location\.assign\(|location\.replace\()\s*['"]([^'"]+\.html(?:[^'"]*)?)['"]/gi))checkLocalTarget(file,'NAVEGAÇÃO ONCLICK',n[1]);
  }

  if((markup.match(/\bid=["']stackup-global-nav["']/gi)||[]).length>1)failures.push(`${file}: NAVEGAÇÃO GLOBAL DUPLICADA NO MARKUP.`);

  if(deploy){
    const themeCount=countTag(html,'app-theme.js');
    const buttonStandardCount=countTag(html,'app-button-layout-standard-v1.js');
    if(protectedFiles.has(file)){
      if(themeCount)failures.push(`${file}: EXCEÇÃO PROTEGIDA RECEBEU APP-THEME.JS (${themeCount}x).`);
      if(buttonStandardCount)failures.push(`${file}: EXCEÇÃO PROTEGIDA RECEBEU PADRÃO GLOBAL DE BOTÕES (${buttonStandardCount}x).`);
    }else{
      if(themeCount!==1)failures.push(`${file}: ARTEFATO PUBLICADO DEVE TER APP-THEME.JS EXATAMENTE 1x; ENCONTRADO ${themeCount}.`);
      if(buttonStandardCount!==1)failures.push(`${file}: ARTEFATO PUBLICADO DEVE TER APP-BUTTON-LAYOUT-STANDARD-V1.JS EXATAMENTE 1x; ENCONTRADO ${buttonStandardCount}.`);
      if(themeCount===1&&buttonStandardCount===1&&html.indexOf('app-theme.js')>html.indexOf('app-button-layout-standard-v1.js'))failures.push(`${file}: ORDEM DE CAMADAS INCORRETA; THEME DEVE CARREGAR ANTES DO PADRÃO DE BOTÕES.`);
    }
  }
}

const textFiles=fs.readdirSync(root).filter(f=>/\.(?:css|js|html)$/i.test(f));
for(const file of textFiles){
  const src=fs.readFileSync(path.join(root,file),'utf8');
  for(const m of src.matchAll(/pointer-events\s*:\s*none\s*!?important?/gi)){
    const start=Math.max(0,m.index-260),ctx=src.slice(start,m.index+80),open=ctx.lastIndexOf('{'),selector=open>=0?ctx.slice(0,open).split('}').pop():ctx;
    const broad=/(^|,|\s)(?:html\s+body\s+)?(?:button|\.btn\b|\.button\b|\[role=["']?button)/i.test(selector);
    const safe=/:disabled|\[disabled\]|aria-disabled|\.disabled\b|\.hidden\b/i.test(selector);
    if(broad&&!safe)failures.push(`${file}: REGRA GENÉRICA PODE BLOQUEAR BOTÃO HABILITADO -> ${selector.replace(/\s+/g,' ').trim().slice(-160)}`);
  }
  for(const m of src.matchAll(/position\s*:\s*fixed/gi)){
    const ctx=src.slice(m.index,Math.min(src.length,m.index+500));
    if(/(?:inset\s*:\s*0|top\s*:\s*0)[\s\S]{0,300}z-index\s*:\s*\d+/i.test(ctx)){overlayCandidates++;overlayByFile.set(file,(overlayByFile.get(file)||0)+1)}
  }
}

const theme=fs.readFileSync(path.join(root,'app-theme.js'),'utf8');
for(const required of [
  'id="stackup-back"','id="stackup-home"',
  "document.getElementById('stackup-back').onclick=",
  "document.getElementById('stackup-home').onclick=",
  'grid-template-columns:minmax(0,1fr)!important',
  '#stackup-global-nav #stackup-back,html body #stackup-global-nav #stackup-home{width:100%!important'
])if(!theme.includes(required))failures.push(`app-theme.js: NAVEGAÇÃO GLOBAL FORA DO PADRÃO -> ${required}`);

const standard=fs.readFileSync(path.join(root,'app-button-layout-standard-v1.js'),'utf8');
for(const required of [
  'pointer-events:auto!important','touch-action:manipulation!important',
  'button:disabled','pointer-events:none!important',
  '.stackup-page-actions{display:grid!important;grid-template-columns:minmax(0,1fr)!important',
  '.stackup-page-action{height:44px!important;min-height:44px!important;max-height:44px!important',
  'function normalizeNestedAnchorButtons()','a[href] > button:only-child','stackup-normalized-anchor-button','a.innerHTML=btn.innerHTML',"a.dataset.stackupNestedNormalized='1'"
])if(!standard.includes(required))failures.push(`app-button-layout-standard-v1.js: GARANTIA GLOBAL AUSENTE -> ${required}`);
for(const required of ['.timeGrid','.blindModeRow','.editorActions','.payGrid','.dealerGrid','.dealerActions','.finalTableActions','.roundControls','.tabs','.pagination','.keypad','.keyboard','[data-internal-controls]'])if(!standard.includes(required))failures.push(`app-button-layout-standard-v1.js: EXCEÇÃO INTERNA AUSENTE -> ${required}`);

const pages=fs.readFileSync(path.join(root,'.github/workflows/pages.yml'),'utf8');
for(const required of ['app-theme.js?v=navfull0913','app-button-layout-standard-v1.js?v=fullrow0912',"['tv.html','tv-connect.html','dealer-access.html']",'isOfficialCast','isLegacyCast'])if(!pages.includes(required))failures.push(`pages.yml: REGRA DE PUBLICAÇÃO AUSENTE -> ${required}`);

if(normalizableNested){infos.push(`NORMALIZAÇÃO DE COMPATIBILIDADE: ${normalizableNested} navegação(ões) legada(s) <a><button> serão convertidas em link-botão único antes da interação.`);for(const [file,n] of nestedByFile)infos.push(`NORMALIZADO EM RUNTIME: ${file} -> ${n}`)}
if(protectedNested){warnings.push(`EXCEÇÕES PROTEGIDAS: ${protectedNested} aninhamento(s) interativo(s) mantido(s) sem alteração.`);for(const [file,n] of protectedNestedByFile)warnings.push(`ANINHAMENTO PROTEGIDO: ${file} -> ${n}`)}
if(overlayCandidates){infos.push(`OVERLAYS MAPEADOS: ${overlayCandidates} ocorrência(s); nenhuma regra genérica de bloqueio de botão foi detectada.`);for(const [file,n] of overlayByFile)infos.push(`OVERLAY MAPEADO: ${file} -> ${n}`)}

console.log(`FINAL INTERACTION AUDIT: modo=${deploy?'ARTEFATO PUBLICADO':'FONTE'}, ${htmlFiles.length} páginas, ${buttonCount} botões estáticos.`);
for(const i of infos)console.log('INFO:',i);
for(const w of warnings)console.log('WARN:',w);
if(failures.length){for(const f of failures)console.error('FAIL:',f);process.exit(1)}
console.log('FINAL INTERACTION AUDIT PASS: estrutura, clique/toque global, rotas locais, IDs, rótulos, exceções, normalização de compatibilidade e camadas de publicação verificados.');
