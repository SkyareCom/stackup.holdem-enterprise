const fs=require('fs');

const failures=[];
const htmlFiles=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const hasUiRuntime=html=>html.includes('shared.js')||html.includes('data-entry-standard.js')||html.includes('ui-standard.js')||html.includes('app-theme.js');
const hasDrawerRuntime=html=>html.includes('shared.js')||html.includes('data-entry-standard.js')||html.includes('in-app-lists.js');
const standaloneUiPages=new Set(['tv-connect.html']);

for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8');
  const hasOptInSelect=/<select\b[^>]*\bdata-stackup-inline-list\b/i.test(html);
  const hasDialog=/<dialog\b|\.showModal\s*\(/i.test(html);
  const opensWindow=/\bwindow\.open\s*\(/i.test(html);
  const interactive=/<button\b|<select\b|type=["'](?:button|submit|reset)["']|role=["']button["']/i.test(html);
  if(interactive&&!hasUiRuntime(html)&&!standaloneUiPages.has(file))failures.push(`${file}: tela interativa sem runtime global de botões/fonte`);
  if(hasOptInSelect&&!hasDrawerRuntime(html))failures.push(`${file}: SELECT opt-in sem runtime de lista inline`);
  if(hasDialog)failures.push(`${file}: usa DIALOG/modal nativo; deve ser gaveta inline`);
  if(opensWindow)failures.push(`${file}: abre janela externa com window.open`);
}

const listSource=fs.readFileSync('in-app-lists.js','utf8');
for(const required of ['stackup-select-trigger','stackup-select-list','MutationObserver','data-stackup-drawer',"font-family:'Caacupe One'",'border:0!important','background:transparent!important','border-bottom:1px solid #27342D!important',"hasAttribute('data-stackup-inline-list')","select[data-stackup-inline-list]"]){
  if(!listSource.includes(required))failures.push(`in-app-lists.js: falta padrão obrigatório ${required}`);
}
if(/querySelectorAll\?\.\(['"]select['"]\)/.test(listSource)||/querySelectorAll\(['"]select['"]\)/.test(listSource))failures.push('in-app-lists.js: não pode converter todos os SELECTs em botões; somente opt-in explícito');
const fontDecls=[...listSource.matchAll(/font-family\s*:\s*([^;`}]*)/gi)].map(m=>m[1]);
if(fontDecls.some(v=>!/Caacupe One/i.test(v)))failures.push('in-app-lists.js: contém font-family fora do padrão CAACUPE ONE');
if(/\.stackup-select-option[^}]*border:1px solid/si.test(listSource))failures.push('in-app-lists.js: opções opt-in ainda parecem novos cards em vez de lista no controle atual');

const uiSource=fs.readFileSync('ui-standard.js','utf8');
for(const required of ["font-family:'Caacupe One'",'min-height:44px!important','border:1px solid #8DFC3B!important','border-radius:9px!important','justify-content:center!important']){
  if(!uiSource.includes(required))failures.push(`ui-standard.js: falta padrão global ${required}`);
}
const uiFontDecls=[...uiSource.matchAll(/font-family\s*:\s*([^;`}]*)/gi)].map(m=>m[1]);
if(uiFontDecls.some(v=>!/Caacupe One/i.test(v)))failures.push('ui-standard.js: contém font-family fora do padrão CAACUPE ONE');

const entrySource=fs.readFileSync('data-entry-standard.js','utf8');
if(!entrySource.includes('in-app-lists.js'))failures.push('data-entry-standard.js: não disponibiliza componente opt-in de listas/gavetas');
if(!entrySource.includes('ui-standard.js'))failures.push('data-entry-standard.js: não carrega padrão global de botões/fontes');
for(const obsolete of ['directoryHub();','communications();','simpleFilter();'])if(entrySource.includes(obsolete))failures.push(`data-entry-standard.js: runtime ainda injeta controles sintéticos obsoletos (${obsolete})`);

if(failures.length){failures.forEach(f=>console.error('FAIL:',f));process.exit(1)}
console.log(`UI STANDARD + NATIVE SELECT AUDIT PASS: ${htmlFiles.length} páginas verificadas.`);
