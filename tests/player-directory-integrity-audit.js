const fs=require('fs');
const failures=[];
const read=f=>fs.readFileSync(f,'utf8');
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};

const hub=read('players-hub.html');
ok('JOGADORES hub: cadastro abre tela nativa',hub.includes('players-directory.html?view=register')&&!hub.includes('href="player-register.html"'));
ok('JOGADORES hub: cadastrados abre tela nativa',hub.includes('players-directory.html?view=registered')&&!hub.includes('href="players-registered.html"'));

const history=read('player-directory-history.js');
ok('JOGADORES: view register remove somente histórico',history.includes("view==='register'")&&history.includes("historyBtn?.remove();history?.remove()"));
ok('JOGADORES: view registered remove somente cadastro',history.includes("view==='registered'")&&history.includes('section?.remove();form?.remove()'));
ok('JOGADORES: cadastro valida CPF duplicado',history.includes('JOGADOR JÁ CADASTRADO COM ESTE CPF.'));
ok('JOGADORES: cadastro não cria botões extras',!history.includes('CADASTRAR NOVO'));

const reg=read('player-register.html'),listed=read('players-registered.html');
ok('JOGADORES compat cadastro: wrapper não reescreve DOM',!reg.includes('contentDocument')&&!reg.includes('createElement(')&&reg.includes('players-directory.html?view=register'));
ok('JOGADORES compat cadastrados: wrapper não reescreve DOM',!listed.includes('contentDocument')&&!listed.includes('createElement(')&&listed.includes('players-directory.html?view=registered'));

const base=read('players-directory.html');
ok('JOGADORES: existe um único cadastro por documento IA',((base.match(/CADASTRAR POR DOCUMENTO/g)||[]).length===1));
ok('JOGADORES: histórico principal tem EDITAR e APAGAR',base.includes('id="editSelected"')&&base.includes('id="deleteSelected"'));

if(failures.length){console.error(`PLAYER DIRECTORY INTEGRITY AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('PLAYER DIRECTORY INTEGRITY AUDIT PASS');