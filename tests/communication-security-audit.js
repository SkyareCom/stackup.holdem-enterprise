const fs=require('fs');
const bot=fs.readFileSync('bot.html','utf8');
const live=fs.readFileSync('player-live.html','utf8');
const failures=[];
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
ok('BOT carrega autenticação',bot.includes('auth-engine.js')&&bot.includes("StackupAuth.guard('communication-hub.html')"));
ok('BOT usa operador da sessão autenticada',bot.includes('StackupAuth.staffForSession()')&&!bot.includes('function staffList()'));
ok('BOT não permite escolher outro staff',bot.includes('id="sender" disabled'));
ok('BOT localiza jogadores só no torneio atual',bot.includes('currentTournamentPlayers()'));
ok('BOT confirma jogador via motor isolado',bot.includes('PokerOperations.playerById(r.player.id)'));
ok('BOT registra eventId e environmentId no comando',bot.includes('eventId:state.eventId,environmentId'));
ok('BOT filtra alertas pelo evento',bot.includes("String(a.eventId||'')===event"));
ok('BOT filtra log pelo evento',bot.includes("filter(c=>String(c.eventId||'')===event)"));
ok('PLAYER LIVE não fica público sem acesso específico',live.includes('auth-engine.js')&&live.includes("StackupAuth.guard('communication-hub.html')"));
ok('PLAYER LIVE lista só jogadores do torneio atual',live.includes('function livePlayers(){return currentTournamentPlayers()}')&&!live.includes('playerSelect.innerHTML=state.players.map'));
ok('PLAYER LIVE movimento exige eventId atual',live.includes("String(m.eventId||'')===event&&m.playerId===p.id"));
if(failures.length){console.error(`COMMUNICATION SECURITY AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('COMMUNICATION SECURITY AUDIT PASS');