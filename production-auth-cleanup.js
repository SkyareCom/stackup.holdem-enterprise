(()=>{
  try{
    if(typeof state==='undefined')return;
    const noConfiguredClub=!String(state.clubName||'').trim();
    const noStaff=!Array.isArray(state.staffUsers)||state.staffUsers.length===0;
    const clubs=Array.isArray(state.authClubs)?state.authClubs:[];
    const onlyLegacy=clubs.length===1&&String(clubs[0]?.name||'').trim().toUpperCase()==='POKER CLUB';
    if(noConfiguredClub&&noStaff&&onlyLegacy){
      state.authClubs=[];
      state.authMemberships=[];
      state.authPeople=[];
      state.clubId='';
      if(typeof saveState==='function')saveState();
    }
  }catch(e){console.error('STACKUP AUTH CLEANUP',e)}
})();
