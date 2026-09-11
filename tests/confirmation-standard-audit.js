const fs=require('fs');
const failures=[];
const assert=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
const standard=fs.readFileSync('confirmation-standard.js','utf8');
const ui=fs.readFileSync('ui-standard.js','utf8');

assert('padrão expõe avisos inline',standard.includes('window.StackupNotice')&&standard.includes('showNotice'));
assert('aviso inline possui aria-live',standard.includes("aria-live','polite"));
assert('padrão não substitui alert nativo',!standard.includes('window.alert='));
assert('padrão não substitui confirm nativo',!standard.includes('window.confirm='));
assert('padrão não substitui prompt nativo',!standard.includes('window.prompt='));
assert('padrão não auto-confirma ações destrutivas',!standard.includes('return true')||!standard.includes('window.confirm'));
assert('padrão não injeta CADASTRAR NOVO',!standard.includes("textContent='CADASTRAR NOVO'"));
assert('padrão não altera botão de negócio para CONFIRMADO',!standard.includes("button.textContent='CONFIRMADO'"));
assert('padrão não desabilita botão de negócio automaticamente',!standard.includes("button.disabled=true"));
assert('ui-standard carrega confirmation-standard',ui.includes('confirmation-standard.js?v='));

for(const file of ['environment-register.html','staff.html','players-directory.html','setup.html','finance-settings.html']){
  const html=fs.readFileSync(file,'utf8');
  assert(`${file}: alcança padrão global`,html.includes('shared.js')||html.includes('ui-standard.js')||html.includes('finance-config.js'));
}

if(failures.length){failures.forEach(f=>console.error('FAIL:',f));process.exit(1)}
console.log('CONFIRMATION SAFETY AUDIT PASS');
