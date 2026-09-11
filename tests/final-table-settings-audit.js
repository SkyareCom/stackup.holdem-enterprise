const fs=require('fs');
const src=fs.readFileSync('final-table-settings.html','utf8');
const failures=[];
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
ok('Mesa final possui SALVAR explícito',src.includes('id="saveBtn"')&&src.includes('>SALVAR<'));
ok('Mesa final só persiste configuração no SALVAR',src.includes('saveBtn.onclick=()=>')&&src.includes('saveState();saveBtn.textContent=\'SALVO\''));
ok('Dealers são limitados ao ambiente atual',src.includes("environmentId=String(state.activeEnvironmentId||state.clubId||'')")&&src.includes("String(x.clubId||'')===environmentId"));
ok('IDs autorizados obsoletos são removidos antes de renderizar',src.includes('authorized=authorized.filter(id=>allDealers.some'));
ok('Dealer salvo preserva vínculo de ambiente',src.includes('clubId:d.clubId||environmentId'));
ok('Personalizar mãos ignora valor vazio/inválido',src.includes('if(!Number.isFinite(raw)||raw<1)return'));
ok('Personalizar mãos limita a 1..999',src.includes('Math.max(1,Math.min(999,Math.floor(raw)))'));
ok('Botões internos declaram type=button',src.includes('id="timerMode" type="button"')&&src.includes('id="handsMode" type="button"')&&src.includes('id="applyCustom" type="button"')&&src.includes('id="saveBtn">SALVAR'));
if(failures.length){console.error(`FINAL TABLE SETTINGS AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('FINAL TABLE SETTINGS AUDIT PASS');