const fs=require('fs');
const failures=[];
const read=f=>fs.readFileSync(f,'utf8');
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
const usesDirectory=src=>/StackupPlayerProfile(?:\?\.)?\.directory(?:\?\.)?\(/.test(src)||/StackupPlayerProfile\?\.directory\?\.\(/.test(src)||src.includes('StackupPlayerProfile.directory()');

const shared=read('shared.js'),ops=read('operations.js'),engine=read('tournament-engine.js');
ok('JOGADORES: estado operacional possui escopo de torneio',shared.includes('currentTournamentPlayers()')&&shared.includes('playerEventId'));
ok('JOGADORES: ativos são do evento atual',/function activeTournamentPlayers\(\)\{return currentTournamentPlayers\(\)\.filter/.test(shared));
ok('OPERAÇÕES: resolução de jogador exige evento atual',ops.includes('function belongsToCurrentEvent')&&ops.includes('p.id===id&&belongsToCurrentEvent(p)'));
ok('OPERAÇÕES: conflito de assento ignora outros eventos',ops.includes('x.id!==p.id&&belongsToCurrentEvent(x)'));
ok('OPERAÇÕES: movimentos pendentes respeitam eventId',ops.includes("m.eventId===state.eventId&&m.playerId===p.id"));
ok('OPERAÇÕES: plano de balancing filtra evento',ops.includes("filter(m=>!m.eventId||String(m.eventId)===String(state.eventId||''))"));
ok('FINANCEIRO: transações operacionais recebem eventId',ops.includes('eventId:state.eventId'));
ok('MOTOR: sem operador LOCAL sintético',!engine.includes("||'LOCAL'"));

const history=read('tournament-history.js'),manager=read('tournament-manager.html'),managerAudit=read('tournament-manager-audit-v1.js'),ready=read('ready-tournaments.js'),center=read('tournament-center.html');
ok('TORNEIO: cadastro salva em savedTournaments',history.includes('state.savedTournaments'));
ok('TORNEIO: snapshot inclui mesa final',history.includes('finalTableStructureMode')&&history.includes('finalTableHandsPerLevel'));
ok('TORNEIO: manager lê savedTournaments',manager.includes('state.savedTournaments'));
ok('TORNEIO: manager entende data aninhado',manager.includes('definitionData'));
ok('TORNEIO: auditoria lê a definição, não o estado global por engano',managerAudit.includes('sourceData(t)')&&managerAudit.includes('cfg(t)'));
ok('TORNEIO: ativação aplica configuração auditada',managerAudit.includes('applyConfig(t)'));
ok('TORNEIO: validado guarda data completo',managerAudit.includes('data,structure:clone(s.structure'));
ok('TORNEIO: lista validada não cria novo evento',!ready.includes("state.eventId='event-'")&&!ready.includes('eventArrays.forEach'));
ok('TORNEIO: lista validada retorna ao mesmo id',ready.includes('tournament-manager.html?id='));
ok('TORNEIO: central reúne salvos',center.includes('state.savedTournaments'));
ok('TORNEIO: central reúne fechamentos',center.includes('state.eventClosures'));

const preReset=read('setup-preinit-reset-v1.js'),postReset=read('setup-new-tournament-reset-v1.js');
for(const token of ['fee','reentryValue','rebuyValue','doubleRebuyValue','addonValue','specialAddonValue','bountyValue','structure','finalTableStructureMode','selectedTournamentId'])ok(`NOVO TORNEIO: limpa ${token}`,preReset.includes(token)&&postReset.includes(token));

const recognition=read('recognition.html'),checkin=read('checkin.html'),crm=read('crm.html'),comm=read('communications.html'),wallet=read('wallet.html');
ok('RECONHECIMENTO: usa diretório geral',usesDirectory(recognition));
ok('RECONHECIMENTO: entrega ID esperado pelo check-in',recognition.includes('stackup-checkin-selected-player'));
ok('CHECK-IN: usa diretório geral',checkin.includes("DIRECTORY_KEY='stackup-player-directory-v1'"));
ok('CRM: usa cadastro geral',usesDirectory(crm));
ok('CRM: consentimento é persistido no diretório',crm.includes('persistDirectory(arr)'));
ok('COMUNICAÇÃO: usa somente evento atual',comm.includes('currentPlayers()')&&comm.includes('validationEventId'));
ok('COMUNICAÇÃO: edição de telefone volta ao diretório',comm.includes('syncDirectoryPhone'));
ok('WALLET: usa sessão autenticada',wallet.includes('WALLET_STAFF=StackupAuth.staffForSession()'));
ok('WALLET: procura jogador apenas no torneio atual',wallet.includes('currentTournamentPlayers()')&&wallet.includes('tournamentPlayer(p)'));
ok('WALLET: sem GESTOR sintético',!wallet.includes("id:'WALLET'")&&!wallet.includes("role:'GESTOR'"));
ok('WALLET: operações exigem torneio ativado',wallet.includes('!state.eventId||!state.prepared'));

const finance=read('finance-config.js'),financeUi=read('finance-settings.html');
ok('FINANCEIRO: UI declara taxa fixa US$ 1',financeUi.includes('TAXA FIXA DE US$ 1 POR OPERAÇÃO'));
ok('FINANCEIRO: motor usa processingUsd=1',finance.includes('processingUsd:1'));
ok('FINANCEIRO: motor não mantém 5% PIX / 9% cartão',!finance.includes('pixPct:5')&&!finance.includes('cardPct:9'));
ok('FINANCEIRO: falta de cotação USD retorna bloqueio',finance.includes("missingRate:'USD'"));
ok('FINANCEIRO: configurações exigem autenticação',financeUi.includes('auth-engine.js')&&financeUi.includes('StackupAuth.guard()'));

const close=read('tournament-close.html'),rankT=read('ranking-tournament.html'),rankG=read('ranking-general.html'),rankRules=read('ranking-rules.html'),rankEngine=read('ranking-engine.js'),rankSnapshot=read('ranking-snapshot-v1.js');
ok('FECHAMENTO: usa jogadores do evento atual',close.includes('currentActive()')&&close.includes('currentPlayers()'));
ok('FECHAMENTO: não fecha duas vezes o mesmo evento',close.includes('alreadyClosed'));
ok('FECHAMENTO: desativa operação após encerrar',close.includes("state.prepared=false"));
ok('RANKING: motor usa eventId/validationEventId',rankEngine.includes('validationEventId')&&rankEngine.includes('eventOf'));
ok('RANKING: por torneios respeita clube/liga -> torneio -> etapa',rankT.includes('id="environment"')&&rankT.includes('id="tournament"')&&rankT.includes('id="stage"')&&rankT.includes('StackupRanking.aggregate'));
ok('RANKING: por ligas limita ambiente a LIGA',rankG.includes("filter(x=>x.type==='LEAGUE')")&&rankG.includes('StackupRanking.stages()'));
ok('RANKING: por ligas filtra ano e semestre',rankG.includes("periodEl.value==='YEAR'")&&rankG.includes("periodEl.value==='SEMESTER'"));
ok('RANKING: critérios são persistentes e configuráveis',rankRules.includes('StackupRanking.saveRule')&&rankEngine.includes('rankingRules'));
ok('RANKING: snapshot preserva identidade do diretório',rankSnapshot.includes('directoryId')&&rankSnapshot.includes('directoryCpf'));
ok('RANKING: snapshot preserva torneio e etapa',rankSnapshot.includes('rankingTournamentId')&&rankSnapshot.includes('stageId')&&rankSnapshot.includes('stageName'));

const auth=read('auth-engine.js');
ok('AUTH: CASHIER definido',/CASHIER:\s*\[/.test(auth));
ok('AUTH: VIEWER definido',/VIEWER:\s*\[/.test(auth));
ok('AUTH: CASHIER tem allowlist',auth.includes('CASHIER_PAGES'));
ok('AUTH: VIEWER tem allowlist',auth.includes('VIEWER_PAGES'));
ok('AUTH: wallet exige permissão WALLET',auth.includes("'wallet.html':'WALLET'"));
ok('AUTH: financeiro exige FINANCE',auth.includes("'finance.html':'FINANCE'")&&auth.includes("'finance-settings.html':'FINANCE'"));
ok('AUTH: TD possui permissão BROADCAST',/TD:\s*\[[^\]]*'BROADCAST'/.test(auth));
ok('AUTH: transmissão mapeia BROADCAST',auth.includes("'screen-settings.html':'BROADCAST'")&&auth.includes("'screen-alerts-operation.html':'BROADCAST'")&&auth.includes("'transmission-room.html':'BROADCAST'"));

const confirmation=read('confirmation-standard.js'),dataEntry=read('data-entry-standard.js'),lists=read('in-app-lists.js');
ok('UI: camada global não auto-confirma confirmação nativa',!confirmation.includes('window.confirm='));
ok('UI: camada global não injeta CADASTRAR NOVO',!confirmation.includes('CADASTRAR NOVO'));
ok('UI: data-entry não injeta controles funcionais',!dataEntry.includes('directoryHub()')&&!dataEntry.includes('confirmRankingFilter')&&!dataEntry.includes('confirmRecognitionSearch'));
ok('UI: select sintético só é opt-in',lists.includes("hasAttribute('data-stackup-inline-list')"));

if(failures.length){console.error(`CROSS-SECTOR INTEGRATION AUDIT FAILED: ${failures.length}`);failures.forEach(f=>console.error('- '+f));process.exit(1)}
console.log('CROSS-SECTOR INTEGRATION AUDIT PASS');