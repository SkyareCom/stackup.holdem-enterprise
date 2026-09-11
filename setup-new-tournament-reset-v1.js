(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='setup.html')return;
const params=new URLSearchParams(location.search);
const isNew=params.get('new')==='1';
const zero=['buyin','buyinChips','earlyBonusValue','earlyBonusChips','rebuyValue','rebuyChips','doubleRebuyValue','doubleRebuyChips','reentryValue','reentryChips','addonValue','addonChips','specialAddonValue','specialAddonChips','addonBonusValue','addonBonusChips','bountyValue','fee','guaranteed','paidPlaces','lateRegLevel','startingStack','prizePool'];
const blank=['eventId','tournamentName','gameType','tournamentFormat','seatsPerTable','selectedTournamentId','selectedTournamentName','selectedStructureId','selectedStructureName','readyTemplateId','readyTemplateSource'];
const resetState=()=>{
  if(!window.state||!isNew)return;
  zero.forEach(k=>state[k]=0);
  blank.forEach(k=>state[k]='');
  Object.assign(state,{bountyRecurring:false,bountyDoubleSecond:false,bountyOnReentry:false,prepared:false,running:false,tournamentStatus:'DRAFT',status:'DRAFT',levelIndex:0,remaining:0,elapsed:0,startedAt:null,lastTickAt:null,transition:null,structure:[{type:'level',label:'NÍVEL 1',duration:0,sb:0,bb:0,ante:0,identifier:'',levelIdentifier:''}],structureBbAnte:false,structureBbMode:0,structureNoAnte:false,finalTableStructureMode:'TIMER',finalTableHandsPerLevel:10,finalTableManualActive:false,finalTableMode:'TIMER'});
  if(typeof saveState==='function')saveState();
};
const apply=()=>{
  if(!window.state)return false;
  resetState();
  const name=document.getElementById('tournamentName'),buy=document.getElementById('buyin');
  if(name){name.placeholder='NOME DO TORNEIO';if(isNew)name.value=''}
  if(buy){buy.placeholder='VALOR';if(isNew)buy.value=''}
  if(isNew){try{if(typeof renderSummary==='function')renderSummary()}catch(_){}}
  return !!(name&&buy);
};
const finish=()=>{if(!isNew)return;const u=new URL(location.href);u.searchParams.delete('new');history.replaceState(null,'',u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():'')+u.hash)};
const boot=()=>{let tries=0;const run=()=>{tries++;if(apply()||tries>=20){finish();return}setTimeout(run,50)};run()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();