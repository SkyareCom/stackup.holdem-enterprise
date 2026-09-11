(()=>{
  const RESET_VERSION='2026-09-04-professional-v1';
  const MARKER_KEY='stackup-production-reset-version';
  const STATE_KEY='poker-club-state-v4';
  let current='';
  try{current=localStorage.getItem(MARKER_KEY)||''}catch(_){return}
  if(current===RESET_VERSION)return;

  const cleanState={
    eventId:'',operator:'',tournamentName:'',clubName:'',gameType:'',tournamentFormat:'',tournamentStatus:'',
    bountyValue:0,bountyOnReentry:false,bountyRecurring:false,bountyDoubleSecond:false,pkoCashPercent:50,
    running:false,prepared:false,levelIndex:0,remaining:0,elapsed:0,timerBaseRemaining:0,elapsedBase:0,
    timerStartedAt:null,elapsedStartedAt:null,startedAt:null,lastTickAt:null,transition:null,
    playersLeft:0,field:0,rebuys:0,doubleRebuys:0,reentries:0,addons:0,prizePool:0,guaranteed:0,paidPlaces:0,
    lateRegLevel:0,avgStack:0,chipLeader:0,startingStack:0,buyin:0,buyinChips:0,fee:0,reentryValue:0,reentryChips:0,
    rebuyValue:0,rebuyChips:0,doubleRebuyValue:0,doubleRebuyChips:0,addonValue:0,addonChips:0,
    specialAddonValue:0,specialAddonChips:0,earlyBonusValue:0,earlyBonusChips:0,addonBonusValue:0,addonBonusChips:0,
    seatsPerTable:'',language:'pt',soundOn:false,autoVoice:false,currentAnnouncement:'',
    selectedTournamentId:'',selectedTournamentName:'',selectedStructureId:'',selectedStructureName:'',
    players:[],staffUsers:[],tables:[],transactions:[],auditLog:[],messageQueue:[],messageLog:[],staffAlerts:[],botCommands:[],
    balancePlan:[],tableMovements:[],tableButtons:{},seatCheckins:[],paymentIntents:[],walletTransactions:[],validationLog:[],
    rankings:[],loyaltyAccounts:[],campaigns:[],playerCommunications:[],cashTables:[],cashSessions:[],cashTransactions:[],
    authPeople:[],authClubs:[],authMemberships:[],dealerWorkSessions:[],rebuyRequests:[],eventClosures:[],savedTournaments:[],savedStructures:[],
    staffContacts:{floor:'',td:''},finalTableHands:null,finalTableMode:null,
    structure:[{type:'level',label:'NÍVEL 1',duration:0,sb:0,bb:0,ante:0}],
    announcements:{fiveMin:true,oneMin:true,tenSec:true,levelChange:true,breakStart:true,breakEnd:true,lateRegClose:true}
  };

  try{
    const keys=[];
    for(let i=0;i<localStorage.length;i++)keys.push(localStorage.key(i));
    keys.filter(Boolean).forEach(k=>{
      if(k===MARKER_KEY)return;
      if(k===STATE_KEY||k.startsWith('stackup-')||k.startsWith('poker-club-'))localStorage.removeItem(k);
    });
    localStorage.setItem(STATE_KEY,JSON.stringify(cleanState));
    localStorage.setItem(MARKER_KEY,RESET_VERSION);
  }catch(e){console.error('STACKUP PRODUCTION RESET',e)}
})();
