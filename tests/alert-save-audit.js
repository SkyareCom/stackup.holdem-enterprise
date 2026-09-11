const fs=require('fs');
const src=fs.readFileSync('screen-alert-structure.js','utf8');
const failures=[];
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
ok('Alertas possuem SALVAR explícito',src.includes('id="saveAlertConfig">SALVAR'));
ok('Preset é rascunho e preview antes de salvar',src.includes('draft={...draft,preset:btn.dataset.preset}')&&src.includes('A.play(draft)')&&!src.includes('next.preset=btn.dataset.preset;A.save(next)'));
ok('Pitch não persiste durante arraste',src.includes('draft={...draft,pitch:')&&!src.includes('next.pitch=clamp(+pitch.value||0,-24,24);A.save(next)'));
ok('Velocidade não persiste durante arraste',src.includes('draft={...draft,speed:')&&!src.includes('next.speed=clamp(+speedInput.value||1,.5,4);A.save(next)'));
ok('Repetições não persistem antes de SALVAR',src.includes('draft={...draft,repeats:')&&!src.includes('next.repeats=clamp(+repeats.value||1,1,8);A.save(next)'));
ok('SALVAR persiste configuração de áudio',src.includes('save.onclick=()=>{A.save(draft)'));
ok('Ativar/desativar alerta continua ação imediata',src.includes('setAlertEnabled(!alertEnabled())'));
if(failures.length){console.error(`ALERT SAVE AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('ALERT SAVE AUDIT PASS');