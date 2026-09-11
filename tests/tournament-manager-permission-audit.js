const fs=require('fs');
const manager=fs.readFileSync('tournament-manager-audit-v1.js','utf8');
const finalTable=fs.readFileSync('final-table-settings.html','utf8');
const failures=[];
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
ok('Auditoria não remove OPERAÇÃO DO TORNEIO',!manager.includes("document.getElementById('ops')?.remove()")&&!manager.includes('getElementById("ops")?.remove()'));
ok('EDITAR/APAGAR exigem SETUP',manager.includes("['edit','delete'].includes(action)?can('SETUP')"));
ok('ATIVAR/DESATIVAR exigem TOURNAMENT_MANAGER',manager.includes("can('TOURNAMENT_MANAGER')"));
ok('Links operacionais possuem mapa de permissão',manager.includes("'screen.html':'BROADCAST'")&&manager.includes("'tournament-close.html':'RESULTS'")&&manager.includes("'control.html':'CONTROL'"));
ok('Links operacionais são escondidos sem permissão',manager.includes('function filterOps()')&&manager.includes('a.hidden=!can(permission)'));
ok('Edições de STAFF/ALERTAS/SETUP respeitam permissão',manager.includes("key==='STAFF'?can('STAFF_ADMIN')")&&manager.includes("key==='ALERTAS E AVISOS'?can('BROADCAST')")&&manager.includes("can('SETUP')"));
ok('Staff da auditoria exige ambiente exato',manager.includes("String(x.clubId||'')===club")&&!manager.includes('!x.clubId||String(x.clubId)===club'));
ok('Editar MESA FINAL abre configuração dedicada',manager.includes("target==='MESA FINAL'")&&manager.includes("location.href='final-table-settings.html'"));
ok('Configuração de mesa final usa guarda equivalente a SETUP',finalTable.includes("StackupAuth.guard('tournament-settings.html')"));
if(failures.length){console.error(`TOURNAMENT MANAGER PERMISSION AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('TOURNAMENT MANAGER PERMISSION AUDIT PASS');