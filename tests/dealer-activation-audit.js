const fs=require('fs');
const page=fs.readFileSync('dealer-activation.html','utf8');
const control=fs.readFileSync('control-dealer-activation-button-v1.js','utf8');
const failures=[];
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
ok('Ativação de dealer exige autoridade equivalente a SETUP',page.includes("StackupAuth.guard('tournament-settings.html')"));
ok('Ativação resolve ambiente autenticado',page.includes("state.activeEnvironmentId||state.clubId||StackupAuth.current()?.clubId"));
ok('Lista de dealers exige clubId exato',page.includes("String(s.clubId||'')===env")&&!page.includes('!s.clubId||String(s.clubId)'));
ok('Liberação exige torneio validado/preparado',page.includes("if(!state.eventId||!state.prepared)"));
ok('Grant preserva clubId do ambiente',page.includes('clubId:env'));
ok('Dealer autorizado de mesa final preserva clubId',page.includes('clubId:p.clubId'));
ok('Botão ATIVAR DEALER some sem SETUP',control.includes("StackupAuth?.can?.('SETUP')===true")&&control.includes("team.style.display='none'"));
ok('Botão ATIVAR DEALER só aponta para página autorizada após validação',control.includes("team.href='dealer-activation.html'"));
if(failures.length){console.error(`DEALER ACTIVATION AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('DEALER ACTIVATION AUDIT PASS');