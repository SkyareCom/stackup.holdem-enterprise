const fs=require('fs');
const cash=fs.readFileSync('cash.html','utf8');
const failures=[];
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
ok('CASH exige autenticação financeira',cash.includes('auth-engine.js')&&cash.includes("StackupAuth.guard('financial-hub.html')"));
ok('CASH atribui operador à sessão autenticada',cash.includes('const CASH_STAFF=StackupAuth.staffForSession()'));
ok('CASH exige ambiente ativo',cash.includes("function environmentId(){return String(state.activeEnvironmentId||state.clubId||StackupAuth.current()?.clubId||'')}")&&cash.includes("if(!env)return alert('SELECIONE UM AMBIENTE.')"));
ok('CASH filtra mesas por ambiente exato',cash.includes("state.cashTables.filter(t=>String(t.environmentId||'')===env)"));
ok('CASH filtra sessões por ambiente exato',cash.includes("state.cashSessions.filter(s=>String(s.environmentId||'')===env)"));
ok('CASH filtra transações por ambiente exato',cash.includes("state.cashTransactions.filter(t=>String(t.environmentId||'')===env)"));
ok('Novas mesas recebem environmentId',cash.includes("environmentId:env,name,game:game.value"));
ok('Novas sessões recebem environmentId',cash.includes("environmentId:env,cashTableId:table.id"));
ok('Novas transações recebem environmentId',cash.includes("environmentId:env,cashTableId:session.cashTableId"));
ok('Fechamento usa somente mesas do ambiente',cash.includes("function closeTable(id){const t=scopedTables().find"));
ok('Resumo e ledger usam coleções filtradas',cash.includes('allTables=scopedTables(),allSessions=scopedSessions(),allTx=scopedTransactions()'));
if(failures.length){console.error(`CASH SECURITY AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('CASH SECURITY AUDIT PASS');