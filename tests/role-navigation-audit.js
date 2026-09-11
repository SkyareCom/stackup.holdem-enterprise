const fs=require('fs');
const read=f=>fs.readFileSync(f,'utf8');
const index=read('index.html'),tournaments=read('tournaments.html'),finance=read('financial-hub.html'),ranking=read('ranking.html'),ai=read('ai-link.html'),readyHtml=read('ready-tournaments.html'),ready=read('ready-tournaments.js');
const failures=[];
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
ok('Menu principal filtra módulos por função autenticada',index.includes("const role=String(session.role||'').toUpperCase()")&&index.includes('card.hidden=!allowed.has(href)'));
ok('TORNEIOS esconde cards sem a permissão real',tournaments.includes('data-permission="SETUP"')&&tournaments.includes('data-permission="READINESS"')&&tournaments.includes('card.hidden=!StackupAuth.can(card.dataset.permission)'));
ok('FINANCEIRO não oferece bounty para CASHIER sem RESULTS',finance.includes('href="bounty.html" data-permission="RESULTS"')&&finance.includes('card.hidden=!StackupAuth.can(card.dataset.permission)'));
ok('RANKING mantém critérios/regras apenas para administração',ranking.includes('data-ranking-admin="1"')&&ranking.includes("!['OWNER','GESTOR'].includes(role)"));
ok('IA só mostra relatório financeiro a quem tem FINANCE',ai.includes('href="financial-hub.html" data-permission="FINANCE"'));
ok('IA protege importação e automação por permissões reais',ai.includes('href="structure-import.html" data-permission="SETUP"')&&ai.includes('href="communication-hub.html" data-permission="MESSAGING"')&&ai.includes('href="bot.html" data-permission="MESSAGING"'));
ok('Hubs com filtro preservam CSS de hidden',tournaments.includes('.card[hidden]{display:none!important}')&&finance.includes('.card[hidden]{display:none!important}')&&ranking.includes('.card[hidden]{display:none!important}')&&ai.includes('.card[hidden]{display:none!important}'));
ok('TORNEIOS VALIDADOS autentica também no fonte',readyHtml.includes('auth-engine.js')&&readyHtml.includes('StackupAuth.guard()'));
ok('VIEWER não recebe botão morto para tournament-manager',ready.includes("StackupAuth?.can?.('TOURNAMENT_MANAGER')===true")&&ready.includes('<div class="templateCard readOnly"')&&ready.includes('if(!canManage()||!ensureDefinition(t))return'));
ok('VIEWER não altera savedTournaments ao consultar lista',ready.includes('function ensureDefinition(t){if(!canManage())return false;'));
if(failures.length){console.error(`ROLE NAVIGATION AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('ROLE NAVIGATION AUDIT PASS');