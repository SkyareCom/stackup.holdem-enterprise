const fs=require('fs');
const failures=[];
const read=f=>fs.readFileSync(f,'utf8');
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};

const staff=read('staff.html');
ok('STAFF: não duplica cadastro de ambientes',!staff.includes('id="newClubName"')&&!staff.includes('id="newClubType"')&&!staff.includes('id="createClub"'));
ok('STAFF: seleciona ambiente existente',staff.includes('id="club"')&&staff.includes('CADASTRE UM AMBIENTE PRIMEIRO'));
ok('STAFF: bloqueia cadastro sem ambiente',staff.includes('NENHUM AMBIENTE CADASTRADO. USE O MÓDULO AMBIENTES'));
ok('STAFF: possui PIN real no formulário',staff.includes('id="pin"')&&staff.includes('PIN DE ACESSO'));
ok('STAFF: oferece CASHIER e VIEWER',staff.includes("BASE_ROLES=['DEALER','FLOOR','TD','CASHIER','VIEWER','GESTOR']"));
ok('STAFF: permissões vêm do contrato de autenticação',staff.includes('StackupAuth.ROLE_ACCESS'));
ok('STAFF: não converte cargos em GESTOR ao renderizar',!staff.includes("['OWNER','CASHIER','VIEWER'].includes(s.role)?'GESTOR'"));
ok('STAFF: render não regrava a lista de staff',!staff.includes('state.staffUsers=(state.staffUsers||[]).map(normalize)'));
ok('STAFF: OWNER só é oferecido em contexto autorizado',staff.includes('canAssignOwner'));
ok('STAFF: edição de PIN não expõe PIN existente',staff.includes('NOVO PIN • OPCIONAL')&&!/value=["']\$\{esc\(s\.pin/.test(staff));

const roleFix=read('staff-role-list-fix.js');
ok('STAFF helper: não mantém catálogo paralelo de cargos',!roleFix.includes('const ROLES='));
ok('STAFF helper: deriva opções do select real',roleFix.includes('[...select.options]'));
ok('STAFF helper: não executa reconstrução infinita',!roleFix.includes('setInterval('));
ok('STAFF helper: remove seletor duplicado legado',roleFix.includes("document.getElementById('staffRoleSelector')?.remove()"));

const register=read('staff-register.html'),registered=read('staff-registered.html');
ok('STAFF terciária cadastro: wrapper não injeta campos/botões',!register.includes('contentDocument')&&!register.includes('createElement(')&&register.includes('staff.html?view=register'));
ok('STAFF terciária cadastrados: wrapper não reescreve DOM',!registered.includes('contentDocument')&&!registered.includes('querySelector(')&&registered.includes('staff.html?view=registered'));

if(failures.length){console.error(`STAFF INTEGRITY AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('STAFF INTEGRITY AUDIT PASS');