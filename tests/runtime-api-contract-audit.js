const fs=require('fs');
const path=require('path');
const failures=[];
const root=process.cwd();
const contracts={
  StackupWallet:new Set(['KEY','CREDIT_FEES_KEY','load','save','loadFees','saveFees','accountKey','ensureAccount','account','move','deposit','purchase','prize','bounty','withdraw','feeQuote','processExpiredCredits','dayKey']),
  StackupFinance:new Set(['KEY','CURRENCIES','BANKS','FEE_CODES','defaults','load','save','convert','format','playerKey','playerRule','feeWaived','paymentFee','processingFee','paymentRecord']),
  PokerOperations:new Set(['ensure','activePlayer','playerById','currentSeatCheckin','nextSeat','bountyEnabled','defaultTransactionValue','transactionBreakdown','hasInitialEntry','addTournamentTransaction','registerTransaction','awardBounty','createValidationCode','registerTournamentPlayer','confirmSeat','eliminatePlayer','reenterPlayer','applyBalancePlan','currentBountyValue','syncFinalTableGate']),
  StackupAuth:new Set(['ensure','login','environments','selectEnvironment','logout','switchEnvironment','current','staffForSession','can','guard','landing','deviceId','activeDealerWorkSession','dealerCheckIn','dealerCheckOut','dealerCanOperate','ROLE_ACCESS']),
  StackupPlayerProfile:new Set(['DIRECTORY_KEY','directory','directoryForPlayer','tournamentPlayersForDirectory','transactionsForPlayers','checkinsForPlayers','latestSeatForPlayer','latestSeatForDirectory','currentSeatCheckin','metricsFromTransactions','tournamentProfile','eventHistoryForDirectory','careerProfile','creditPlayerForDirectory','creditPlayerForPlayer'])
};
const files=fs.readdirSync(root).filter(f=>/\.(?:html|js)$/.test(f)&&!f.startsWith('tests'));
for(const file of files){
  const src=fs.readFileSync(path.join(root,file),'utf8');
  for(const [ns,allowed] of Object.entries(contracts)){
    const rx=new RegExp(`\\b${ns}(?:\\?\\.|\\.)([A-Za-z_$][\\w$]*)`,'g');
    for(const m of src.matchAll(rx)){
      const method=m[1];
      if(!allowed.has(method))failures.push(`${file}: ${ns}.${method} não existe no contrato exportado`);
    }
  }
}
const duplicate=[...new Set(failures)];
if(duplicate.length){console.error(`RUNTIME API CONTRACT AUDIT FAILED: ${duplicate.length}`);duplicate.forEach(x=>console.error('- '+x));process.exit(1)}
console.log(`RUNTIME API CONTRACT AUDIT PASS: ${files.length} arquivos verificados, incluindo acesso normal e optional chaining.`);