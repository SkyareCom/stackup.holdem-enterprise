const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=process.cwd();
const htmlFiles=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const allFiles=new Set(fs.readdirSync(root));
const failures=[];
const warnings=[];
let buttonCount=0, linkCount=0, inlineScriptCount=0;

const stripQuery=s=>String(s||'').split('#')[0].split('?')[0];
const isExternal=s=>/^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(String(s||''));
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const camel=s=>s.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());

function localScripts(html,file){
  const out=[];
  for(const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)){
    const src=stripQuery(m[1]);
    if(!src||isExternal(src))continue;
    const local=path.basename(src);
    if(allFiles.has(local))out.push(fs.readFileSync(path.join(root,local),'utf8'));
    else failures.push(`${file}: SCRIPT AUSENTE -> ${local}`);
  }
  let i=0;
  for(const m of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)){
    const code=m[1]||'';
    out.push(code);
    if(code.trim()){
      inlineScriptCount++;
      try{new vm.Script(code,{filename:`${file}#inline-${i}`})}catch(e){failures.push(`${file}: ERRO DE SINTAXE NO SCRIPT INLINE ${i} -> ${String(e.message||e).split('\n')[0]}`)}
    }
    i++;
  }
  return out.join('\n');
}

function genericButtonDelegation(code){
  return /addEventListener\(\s*['"](?:click|pointerdown|pointerup|touchstart|touchend|mousedown|mouseup)['"][\s\S]{0,5000}?closest\(\s*['"]button['"]\s*\)/.test(code);
}

function directIdBinding(id,code){
  const e=esc(id);
  const direct=[
    new RegExp(`\\b${e}\\s*\\.\\s*(?:onclick|onchange|onpointerdown|onpointerup|ontouchstart|ontouchend|onmousedown|onmouseup|addEventListener)\\b`),
    new RegExp(`\\$\\(\\s*['\"]${e}['\"]\\s*\\)\\s*\\.\\s*(?:onclick|onchange|addEventListener)\\b`),
    new RegExp(`\\bbyId\\(\\s*['\"]${e}['\"]\\s*\\)\\s*\\.\\s*(?:onclick|onchange|addEventListener)\\b`),
    new RegExp(`getElementById\\(\\s*['\"]${e}['\"]\\s*\\)\\s*\\.\\s*(?:onclick|onchange|addEventListener)\\b`),
    new RegExp(`querySelector\\(\\s*['\"]#${e}['\"]\\s*\\)\\s*\\.\\s*(?:onclick|onchange|addEventListener)\\b`)
  ];
  if(direct.some(r=>r.test(code)))return true;

  const aliases=[
    new RegExp(`(?:const|let|var)?\\s*([A-Za-z_$][\\w$]*)\\s*=\\s*document\\.getElementById\\(\\s*['\"]${e}['\"]\\s*\\)`,'g'),
    new RegExp(`(?:const|let|var)?\\s*([A-Za-z_$][\\w$]*)\\s*=\\s*document\\.querySelector\\(\\s*['\"]#${e}['\"]\\s*\\)`,'g'),
    new RegExp(`(?:const|let|var)?\\s*([A-Za-z_$][\\w$]*)\\s*=\\s*\\$\\(\\s*['\"]${e}['\"]\\s*\\)`,'g'),
    new RegExp(`(?:const|let|var)?\\s*([A-Za-z_$][\\w$]*)\\s*=\\s*byId\\(\\s*['\"]${e}['\"]\\s*\\)`,'g')
  ];
  for(const rx of aliases){
    for(const m of code.matchAll(rx)){
      const a=esc(m[1]);
      if(new RegExp(`\\b${a}\\s*\\.\\s*(?:onclick|onchange|onpointerdown|onpointerup|ontouchstart|ontouchend|onmousedown|onmouseup|addEventListener)\\b`).test(code))return true;
    }
  }

  if(genericButtonDelegation(code)){
    const idChecks=[
      new RegExp(`\\.id\\s*={2,3}\\s*['\"]${e}['\"]`),
      new RegExp(`['\"]${e}['\"]\\s*={2,3}\\s*[^;\\n]{0,120}\\.id`)
    ];
    if(idChecks.some(r=>r.test(code)))return true;
  }
  return false;
}

function delegatedBinding(selectorFragment,code){
  const s=esc(selectorFragment);
  const selector=`['\"][^'\"]*${s}[^'\"]*['\"]`;
  const clickDelegation=[
    new RegExp(`(?:document|window|[A-Za-z_$][\\w$]*)\\s*\\.\\s*addEventListener\\(\\s*['\"](?:click|change|pointerdown|pointerup|touchstart|touchend|mousedown|mouseup)['\"][\\s\\S]{0,4000}?(?:closest|matches)\\(\\s*${selector}\\s*\\)`),
    new RegExp(`(?:document|window|[A-Za-z_$][\\w$]*)\\s*\\.\\s*(?:onclick|onchange|onpointerdown|onpointerup|ontouchstart|ontouchend|onmousedown|onmouseup)\\s*=[\\s\\S]{0,4000}?(?:closest|matches)\\(\\s*${selector}\\s*\\)`)
  ];
  return clickDelegation.some(r=>r.test(code));
}

function selectorCollectionBinding(selectorFragment,code){
  const s=esc(selectorFragment);
  const selector=`['\"][^'\"]*${s}[^'\"]*['\"]`;
  const scope=`(?:document|[A-Za-z_$][\\w$]*)`;
  const patterns=[
    new RegExp(`${scope}\\.querySelectorAll\\(\\s*${selector}\\s*\\)[\\s\\S]{0,1800}?(?:forEach|for\\s*\\()[\\s\\S]{0,1200}?(?:\\.onclick\\s*=|\\.onchange\\s*=|\\.onpointerdown\\s*=|\\.onpointerup\\s*=|\\.ontouchstart\\s*=|\\.ontouchend\\s*=|\\.onmousedown\\s*=|\\.onmouseup\\s*=|\\.addEventListener\\(\\s*['\"](?:click|change|pointerdown|pointerup|touchstart|touchend|mousedown|mouseup)['\"])`),
    new RegExp(`${scope}\\.querySelector\\(\\s*${selector}\\s*\\)[\\s\\S]{0,600}?(?:\\.onclick\\s*=|\\.onchange\\s*=|\\.onpointerdown\\s*=|\\.onpointerup\\s*=|\\.ontouchstart\\s*=|\\.ontouchend\\s*=|\\.onmousedown\\s*=|\\.onmouseup\\s*=|\\.addEventListener\\(\\s*['\"](?:click|change|pointerdown|pointerup|touchstart|touchend|mousedown|mouseup)['\"])`)
  ];
  if(patterns.some(r=>r.test(code)))return true;

  const aliasRx=new RegExp(`(?:const|let|var)?\\s*([A-Za-z_$][\\w$]*)\\s*=\\s*${scope}\\.querySelector\\(\\s*${selector}\\s*\\)`,'g');
  for(const m of code.matchAll(aliasRx)){
    const a=esc(m[1]);
    if(new RegExp(`\\b${a}\\s*\\.\\s*(?:onclick|onchange|onpointerdown|onpointerup|ontouchstart|ontouchend|onmousedown|onmouseup|addEventListener)\\b`).test(code))return true;
  }
  return false;
}

function likelyBound(attrs, code){
  if(/\bonclick\s*=|\bonchange\s*=|\bonpointer(?:down|up)\s*=|\bontouch(?:start|end)\s*=|\bonmouse(?:down|up)\s*=/i.test(attrs))return true;
  const id=(attrs.match(/\bid=["']([^"']+)["']/i)||[])[1];
  const cls=(attrs.match(/\bclass=["']([^"']+)["']/i)||[])[1]||'';
  const dataAttrs=[...attrs.matchAll(/\bdata-([\w-]+)=/gi)].map(m=>m[1]);

  if(id&&directIdBinding(id,code))return true;

  for(const c of cls.split(/\s+/).filter(Boolean)){
    const fragment=`.${c}`;
    if(selectorCollectionBinding(fragment,code)||delegatedBinding(fragment,code))return true;
  }

  for(const d of dataAttrs){
    const fragment=`[data-${d}`;
    if(selectorCollectionBinding(fragment,code)||delegatedBinding(fragment,code))return true;
    const prop=esc(camel(d));
    if(genericButtonDelegation(code)){
      if(new RegExp(`\\.dataset\\.${prop}\\b`).test(code)||new RegExp(`\\.dataset\\[['\"]${esc(d)}['\"]\\]`).test(code))return true;
    }
  }
  return false;
}

function insideAnchor(html,index){
  const before=html.slice(0,index);
  return before.lastIndexOf('<a')>before.lastIndexOf('</a>');
}

for(const file of htmlFiles){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const code=localScripts(html,file);

  for(const m of html.matchAll(/<a\b([^>]*?)\bhref=["']([^"']+)["'][^>]*>/gi)){
    linkCount++;
    const href=m[2];
    if(!href||isExternal(href))continue;
    const target=stripQuery(href);
    if(target&&!allFiles.has(path.basename(target)))failures.push(`${file}: LINK LOCAL AUSENTE -> ${href}`);
  }

  for(const m of html.matchAll(/<button\b([^>]*)>/gi)){
    buttonCount++;
    const attrs=m[1]||'';
    if(/\bdisabled\b/i.test(attrs))continue;
    if(/\baria-disabled=["']true["']/i.test(attrs))continue;
    if(insideAnchor(html,m.index||0))continue;
    const type=(attrs.match(/\btype=["']([^"']+)["']/i)||[])[1]||'submit';
    if(type.toLowerCase()==='submit'&&/<form\b/i.test(html))continue;
    if(!likelyBound(attrs,code)){
      const id=(attrs.match(/\bid=["']([^"']+)["']/i)||[])[1]||'(sem id)';
      const label=((html.slice((m.index||0)+m[0].length).match(/^\s*([^<]{1,80})</)||[])[1]||'').trim();
      warnings.push(`${file}: BOTÃO SEM VÍNCULO DE CLIQUE EVIDENTE -> ${id}${label?` [${label}]`:''}`);
    }
  }
}

const theme=fs.readFileSync(path.join(root,'app-theme.js'),'utf8');
if(!/id=\"stackup-home\">MENU PRINCIPAL<\/button>/.test(theme))failures.push('NAVEGAÇÃO GLOBAL: MENU PRINCIPAL PRECISA SER BOTÃO REAL.');
if(!/grid-template-columns:minmax\(0,1fr\)!important/.test(theme)||!/#stackup-global-nav #stackup-back[\s\S]*width:100%!important/.test(theme))failures.push('NAVEGAÇÃO GLOBAL: ANTERIOR E MENU PRINCIPAL PRECISAM OCUPAR A LINHA INTEIRA.');
if(!/document\.getElementById\('stackup-home'\)\.onclick=/.test(theme))failures.push('NAVEGAÇÃO GLOBAL: MENU PRINCIPAL SEM AÇÃO EXPLÍCITA.');
if(!/isProtectedDisplay\(\)/.test(theme)||!/cast-10px\.html/.test(theme)||!/dealer-access\.html/.test(theme))failures.push('NAVEGAÇÃO GLOBAL: TELAS PROTEGIDAS/EXCEÇÕES NÃO ESTÃO PRESERVADAS.');

const buttonStandard=fs.readFileSync(path.join(root,'app-button-layout-standard-v1.js'),'utf8');
if(!/\.stackup-page-actions\{display:grid!important;grid-template-columns:minmax\(0,1fr\)!important/.test(buttonStandard)||!/\.stackup-page-action\{height:44px!important;min-height:44px!important;max-height:44px!important\}/.test(buttonStandard))failures.push('PADRÃO DE BOTÕES: AÇÕES PRINCIPAIS PRECISAM OCUPAR LINHA INTEIRA E ALTURA PADRÃO.');
if(!/pointer-events:auto!important/.test(buttonStandard)||!/touch-action:manipulation!important/.test(buttonStandard))failures.push('INTERAÇÃO DE BOTÕES: CONTROLES HABILITADOS PRECISAM RECEBER CLIQUE/TOQUE EXPLICITAMENTE.');
if(!/button:disabled[\s\S]*pointer-events:none!important/.test(buttonStandard))failures.push('INTERAÇÃO DE BOTÕES: CONTROLES DESABILITADOS DEVEM CONTINUAR SEM CLIQUE.');
for(const required of ['.timeGrid','.blindModeRow','.editorActions','.payGrid','.dealerGrid','.dealerActions','.finalTableActions','.roundControls','.tabs','.pagination','.keypad','.keyboard']){
  if(!buttonStandard.includes(required))failures.push(`PADRÃO DE BOTÕES: EXCEÇÃO INTERNA AUSENTE -> ${required}`);
}

const environments=fs.readFileSync(path.join(root,'environment-registered.html'),'utf8');
if(!/CADASTRAR AMBIENTE/.test(environments)||!/location\.href='environment-register\.html'/.test(environments))failures.push('AMBIENTES CADASTRADOS: ESTADO VAZIO DEVE LEVAR AO CADASTRO, NÃO TER BOTÃO SEM EFEITO.');

console.log(`UI AUDIT: ${htmlFiles.length} páginas, ${buttonCount} botões, ${linkCount} links, ${inlineScriptCount} scripts inline verificados.`);
for(const w of warnings)console.log('WARN:',w);
if(failures.length){for(const f of failures)console.error('FAIL:',f);process.exit(1)}
if(warnings.length){for(const w of warnings)console.error('FAIL:',w);process.exit(1)}
console.log('UI AUDIT PASS: botões têm vínculo explícito/delegado real, scripts inline compilam, alvos locais existem, exceções internas são preservadas e a navegação global segue o padrão.');