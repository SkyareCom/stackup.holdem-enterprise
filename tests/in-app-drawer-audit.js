const fs=require('fs');

const failures=[];
const htmlFiles=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const hasUiRuntime=html=>html.includes('shared.js')||html.includes('data-entry-standard.js')||html.includes('ui-standard.js')||html.includes('app-theme.js');
const standaloneUiPages=new Set(['tv-connect.html']);

for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8');
  const hasDialog=/<dialog\b|\.showModal\s*\(/i.test(html);
  const opensWindow=/\bwindow\.open\s*\(/i.test(html);
  const interactive=/<button\b|<select\b|type=["'](?:button|submit|reset)["']|role=["']button["']/i.test(html);
  if(interactive&&!hasUiRuntime(html)&&!standaloneUiPages.has(file))failures.push(`${file}: tela interativa sem runtime global de botões/fontes`);
  if(hasDialog)failures.push(`${file}: usa DIALOG/modal nativo; opções e avisos devem ficar no plano da página`);
  if(opensWindow)failures.push(`${file}: abre janela externa com window.open`);
}

const listSource=fs.readFileSync('in-app-lists.js','utf8');
for(const required of ['select.stackup-open-list','data-stackup-options-open','setAttribute(\'size\'','MutationObserver','data-stackup-drawer','data-stackup-drawer-trigger','data-stackup-drawer-panel',"querySelectorAll?.('select')",'display:block!important','position:relative!important']){
  if(!listSource.includes(required))failures.push(`in-app-lists.js: falta padrão obrigatório ${required}`);
}
for(const forbidden of ['stackup-select-trigger','stackup-select-list',"content:'ABRIR'","content:'FECHAR'","hasAttribute('data-stackup-inline-list')"]){
  if(listSource.includes(forbidden))failures.push(`in-app-lists.js: ainda contém seletor recolhido/intermediário ${forbidden}`);
}
if(!/\[data-stackup-drawer\] > \[data-stackup-drawer-trigger\]\{display:none!important\}/.test(listSource))failures.push('in-app-lists.js: gatilho de gaveta ainda pode aparecer');
if(!/\[data-stackup-drawer\] > \[data-stackup-drawer-panel\][\s\S]*display:block!important/.test(listSource))failures.push('in-app-lists.js: painel de opções não fica aberto no fluxo');
const fontDecls=[...listSource.matchAll(/font-family\s*:\s*([^;`}]*)/gi)].map(m=>m[1]);
if(fontDecls.some(v=>!/Caacupe One/i.test(v)))failures.push('in-app-lists.js: contém font-family fora do padrão CAACUPE ONE');

const directSource=fs.readFileSync('clickable-list-drawer-v1.js','utf8');
for(const forbidden of ['preventDefault()','stopImmediatePropagation()','openDrawer(','data-stackup-list-run'])if(directSource.includes(forbidden))failures.push(`clickable-list-drawer-v1.js: ainda intercepta o primeiro clique (${forbidden})`);
if(!directSource.includes('Nenhuma gaveta intermediária'))failures.push('clickable-list-drawer-v1.js: não declara modo de ação direta');

const theme=fs.readFileSync('app-theme.js','utf8');
if(!theme.includes("loadScript('in-app-lists.js"))failures.push('app-theme.js: não carrega listas abertas globalmente');
if(!theme.includes("loadScript('inline-interactions-v1.js"))failures.push('app-theme.js: não carrega avisos/decisões inline');

const entrySource=fs.readFileSync('data-entry-standard.js','utf8');
if(!entrySource.includes('in-app-lists.js'))failures.push('data-entry-standard.js: não disponibiliza listas abertas inline');
if(!entrySource.includes('ui-standard.js'))failures.push('data-entry-standard.js: não carrega padrão global de botões/fontes');

if(failures.length){failures.forEach(f=>console.error('FAIL:',f));process.exit(1)}
console.log(`OPEN INLINE LIST AUDIT PASS: ${htmlFiles.length} páginas verificadas; opções sem dropdown/gaveta intermediária.`);
