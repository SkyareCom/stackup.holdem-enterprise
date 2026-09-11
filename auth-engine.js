(function(){
  const loadLanguageStack=()=>{
    if(typeof document==='undefined')return;
    const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    if(['cast-10px.html','cast-ft-live.html'].includes(page)||page==='language-settings.html')return;
    const has=name=>[...document.scripts].some(s=>(s.getAttribute('src')||'').split('?')[0].endsWith(name));
    const load=(src,next)=>{if(has(src)){next?.();return}const s=document.createElement('script');s.src=src;s.onload=()=>next?.();document.head.appendChild(s)};
    load('app-language.js?v=9864a67',()=>load('app-language-extra.js?v=2b08a68',()=>load('app-language-final.js?v=9fbc2cd',()=>load('app-language-spanish-clean-v1.js?v=c0f7a78'))));
  };
  loadLanguageStack();

  const SESSION_KEY='stackup-auth-session-v1',LOGIN_KEY='stackup-auth-login-v1',DEVICE_KEY='stackup-auth-device-v1';
  const OPEN_TEST_MODE=true;
  const ROLE_ACCESS={
    DEALER:['DEALER_STATION','CHIP_COUNT','REPORT_ELIMINATION','REPORT_ACTION'],
    FLOOR:['TOURNAMENTS','TOURNAMENT_MANAGER','DEALER_STATION','FINAL_TABLE_ACCESS','PLAYERS','BALANCING','CHECKIN','CONTROL','MESSAGING','SMART_REGISTRATION','CHIP_COUNT','READ_ONLY'],
    TD:['TOURNAMENTS','TOURNAMENT_MANAGER','DEALER_STATION','FINAL_TABLE_ACCESS','PLAYERS','BALANCING','CHECKIN','CONTROL','RESULTS','SETUP','READINESS','MESSAGING','SMART_REGISTRATION','CHIP_COUNT','BROADCAST','READ_ONLY'],
    CASHIER:['FINANCE','WALLET','PAYMENTS','CHECKIN','PLAYERS','READ_ONLY'],
    VIEWER:['READ_ONLY'],
    GESTOR:['*'],OWNER:['*']
  };
  const permissionsFor=(role,explicit=[])=>{const base=ROLE_ACCESS[role]||[],extra=Array.isArray(explicit)?explicit:[];if(base.includes('*')||extra.includes('*'))return['*'];return[...new Set([...base,...extra])]};
  const DEALER_PAGES=new Set(['dealer.html','chip-count-ai.html']);
  const FLOOR_PAGES=new Set(['index.html','tournaments.html','tournament-manager.html','tournament-center.html','dealer.html','final-table-access.html','players.html','players-hub.html','players-directory.html','player-register.html','players-registered.html','checkin.html','checkin-players.html','pre-registration.html','presence.html','balancing.html','control.html','tournament-players.html','smart-registration.html','chip-count-ai.html','ranking-tournament.html','communication-hub.html','communications.html']);
  const TD_PAGES=new Set([...FLOOR_PAGES,'tournament-settings.html','setup.html','ready-tournaments.html','tournament-readiness.html','tournament-close.html','bounty.html','screen.html','broadcast.html','transmission-room.html','screen-settings.html','screen-alerts.html','screen-alerts-operation.html','structure-import.html','recognition.html','ai-link.html','ranking.html','ranking-general.html']);
  const CASHIER_PAGES=new Set(['index.html','financial-hub.html','finance.html','finance-settings.html','wallet.html','checkin.html','checkin-players.html','pre-registration.html','players-hub.html','players-directory.html','player-register.html','players-registered.html','tournament-players.html']);
  const VIEWER_PAGES=new Set(['index.html','tournament-center.html','ready-tournaments.html','ranking.html','ranking-tournament.html','ranking-general.html']);

  function digits(v){return String(v||'').replace(/\D/g,'')}
  function slug(v){return String(v||'CLUBE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'clube'}
  function deviceId(){let id='';try{id=localStorage.getItem(DEVICE_KEY)||''}catch(e){}if(!id){id='device-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);try{localStorage.setItem(DEVICE_KEY,id)}catch(e){}}return id}
  function save(){if(typeof saveState==='function')saveState()}
  function syncActiveEnvironment(clubId,club){if(!clubId)return;state.activeEnvironmentId=clubId;state.activeEnvironmentName=club?.name||'';state.activeEnvironmentType=club?.type||'';state.clubId=clubId;state.clubName=club?.name||state.clubName||''}

  function ensure(){
    if(!Array.isArray(state.authPeople))state.authPeople=[];
    if(!Array.isArray(state.authClubs))state.authClubs=[];
    if(!Array.isArray(state.authMemberships))state.authMemberships=[];
    if(!Array.isArray(state.dealerWorkSessions))state.dealerWorkSessions=[];
    const configuredName=String(state.clubName||'').trim(),staffClubId=(state.staffUsers||[]).find(s=>s.clubId)?.clubId||'',clubId=state.clubId||staffClubId||(configuredName?('club-'+slug(configuredName)):'');
    state.clubId=clubId||'';
    let club=clubId?state.authClubs.find(c=>c.id===clubId):null;
    if(clubId&&!club){club={id:clubId,name:configuredName||'AMBIENTE',type:'CLUB',active:true,createdAt:Date.now()};state.authClubs.push(club)}
    (state.staffUsers||[]).forEach(s=>{
      const cpf=digits(s.cpf);if(!cpf)return;
      let person=state.authPeople.find(p=>digits(p.cpf)===cpf);
      if(!person){person={id:s.personId||('person-'+s.id),cpf,name:s.name||'',birth:s.birth||'',phone:s.phone||'',whatsapp:s.whatsapp||'',email:s.email||'',instagram:s.instagram||'',pin:s.pin||'',active:s.active!==false,createdAt:s.createdAt||Date.now()};state.authPeople.push(person)}
      else{person.name=s.name||person.name;person.birth=s.birth||person.birth;person.phone=s.phone||person.phone;person.whatsapp=s.whatsapp||person.whatsapp;person.email=s.email||person.email;person.instagram=s.instagram||person.instagram;person.pin=s.pin||person.pin;person.active=s.active!==false}
      const membershipClubId=s.clubId||clubId;if(!membershipClubId)return;
      s.personId=person.id;s.clubId=membershipClubId;s.permissions=permissionsFor(s.role,s.permissions);
      let memberClub=state.authClubs.find(c=>c.id===membershipClubId);
      if(!memberClub){memberClub={id:membershipClubId,name:configuredName||'AMBIENTE',type:'CLUB',active:true,createdAt:Date.now()};state.authClubs.push(memberClub)}
      let m=state.authMemberships.find(x=>x.personId===person.id&&x.clubId===membershipClubId);
      if(!m){m={id:'membership-'+s.id,personId:person.id,clubId:membershipClubId,staffId:s.id,role:s.role||'DEALER',permissions:permissionsFor(s.role,s.permissions),active:s.active!==false,createdAt:s.createdAt||Date.now()};state.authMemberships.push(m)}
      else{m.staffId=s.id;m.role=s.role||m.role;m.permissions=permissionsFor(m.role,s.permissions||m.permissions);m.active=s.active!==false}
    });
    return{clubId,club};
  }

  function getLogin(){try{return JSON.parse(localStorage.getItem(LOGIN_KEY)||'null')}catch(e){return null}}
  function setLogin(v){try{v?localStorage.setItem(LOGIN_KEY,JSON.stringify(v)):localStorage.removeItem(LOGIN_KEY)}catch(e){}}
  function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){return null}}
  function setSession(v){try{v?localStorage.setItem(SESSION_KEY,JSON.stringify(v)):localStorage.removeItem(SESSION_KEY)}catch(e){}}

  function login(cpf,pin){
    ensure();
    if(OPEN_TEST_MODE){
      const fallback=current();
      return{ok:true,person:fallback?.person||null,memberships:fallback?.membership?[fallback.membership]:[] ,testOpenAccess:true};
    }
    const d=digits(cpf),person=state.authPeople.find(p=>p.active!==false&&digits(p.cpf)===d);
    if(!person)return{ok:false,error:'CPF NÃO CADASTRADO.'};
    if(String(person.pin||'')!==String(pin||''))return{ok:false,error:'PIN INVÁLIDO.'};
    const memberships=state.authMemberships.filter(m=>m.active!==false&&m.personId===person.id).map(m=>({...m,permissions:permissionsFor(m.role,m.permissions),club:state.authClubs.find(c=>c.id===m.clubId),person}));
    if(!memberships.length)return{ok:false,error:'NENHUM VÍNCULO ATIVO PARA ESTE USUÁRIO.'};
    setLogin({personId:person.id,authenticatedAt:Date.now()});return{ok:true,person,memberships};
  }

  function environments(){
    ensure();
    if(OPEN_TEST_MODE)return[];
    const l=getLogin();if(!l)return[];
    const person=state.authPeople.find(p=>p.id===l.personId);if(!person)return[];
    return state.authMemberships.filter(m=>m.active!==false&&m.personId===person.id).map(m=>({...m,permissions:permissionsFor(m.role,m.permissions),club:state.authClubs.find(c=>c.id===m.clubId),person}));
  }

  function selectEnvironment(membershipId){
    ensure();
    if(OPEN_TEST_MODE){const s=current();return{ok:true,session:s,testOpenAccess:true}}
    const l=getLogin();if(!l)return{ok:false,error:'FAÇA O LOGIN.'};
    const m=state.authMemberships.find(x=>x.id===membershipId&&x.personId===l.personId&&x.active!==false);if(!m)return{ok:false,error:'AMBIENTE INVÁLIDO.'};
    const person=state.authPeople.find(p=>p.id===m.personId),club=state.authClubs.find(c=>c.id===m.clubId),permissions=permissionsFor(m.role,m.permissions);m.permissions=permissions;syncActiveEnvironment(m.clubId,club);
    const session={id:'session-'+Date.now(),personId:person.id,personName:person.name,clubId:m.clubId,clubName:club?.name||'',membershipId:m.id,staffId:m.staffId||'',role:m.role,permissions:[...permissions],deviceId:deviceId(),startedAt:Date.now()};
    setSession(session);save();return{ok:true,session};
  }

  function logout(){setSession(null);setLogin(null)}
  function switchEnvironment(){setSession(null);state.activeEnvironmentId='';state.activeEnvironmentName='';state.activeEnvironmentType='';save()}

  function openTestSession(){
    const stored=getSession();
    const membership=stored?state.authMemberships.find(x=>x.id===stored.membershipId&&x.active!==false):null;
    const activeClub=state.authClubs.find(c=>c.active!==false&&String(c.id)===String(state.activeEnvironmentId||''))||state.authClubs.find(c=>c.active!==false&&String(c.id)===String(stored?.clubId||''))||state.authClubs.find(c=>c.active!==false)||null;
    const person=stored?state.authPeople.find(p=>p.id===stored.personId)||null:null;
    const actualRole=String(membership?.role||stored?.role||'OWNER').toUpperCase();
    return{
      ...(stored||{}),
      id:stored?.id||'test-open-session',
      personId:stored?.personId||person?.id||'test-open',
      personName:stored?.personName||person?.name||'TESTE ABERTO',
      clubId:activeClub?.id||stored?.clubId||state.clubId||'',
      clubName:activeClub?.name||stored?.clubName||state.clubName||'',
      membershipId:stored?.membershipId||membership?.id||'test-open',
      staffId:stored?.staffId||membership?.staffId||'test-open',
      role:'OWNER',
      authRole:actualRole,
      permissions:['*'],
      deviceId:stored?.deviceId||deviceId(),
      startedAt:stored?.startedAt||Date.now(),
      membership:membership?{...membership,permissions:['*']}:{id:'test-open',role:'OWNER',permissions:['*'],active:true},
      person,
      club:activeClub,
      workingEnvironment:activeClub,
      testOpenAccess:true
    };
  }

  function current(){
    ensure();
    if(OPEN_TEST_MODE)return openTestSession();
    const s=getSession();if(!s)return null;
    const m=state.authMemberships.find(x=>x.id===s.membershipId&&x.active!==false);if(!m)return null;
    const club=state.authClubs.find(c=>c.id===s.clubId),permissions=permissionsFor(m.role,m.permissions),role=String(m.role||s.role||'').toUpperCase(),working=state.authClubs.find(c=>c.active!==false&&String(c.id)===String(state.activeEnvironmentId||'')),canKeepWorking=['GESTOR','OWNER'].includes(role)&&!!working;
    if(canKeepWorking){state.activeEnvironmentName=working.name||'';state.activeEnvironmentType=working.type||''}else if(String(state.activeEnvironmentId||'')!==String(s.clubId||'')){syncActiveEnvironment(s.clubId,club);save()}
    return{...s,permissions,membership:{...m,permissions},person:state.authPeople.find(p=>p.id===s.personId),club,workingEnvironment:canKeepWorking?working:club};
  }

  function staffForSession(){const s=current();if(!s)return null;return(state.staffUsers||[]).find(x=>String(x.id)===String(s.staffId))||{id:s.staffId||s.personId,name:s.personName,role:s.authRole||s.role,cpf:s.person?.cpf||'',active:true}}
  function can(permission){if(OPEN_TEST_MODE)return true;const s=current();if(!s)return false;if(s.permissions?.includes('*')||['GESTOR','OWNER'].includes(s.role))return true;return(s.permissions||ROLE_ACCESS[s.role]||[]).includes(permission)}
  function landing(s=current()){if(OPEN_TEST_MODE)return'index.html';if(!s)return'login.html';if(s.role==='DEALER')return'dealer.html';if(s.role==='CASHIER')return'financial-hub.html';return'index.html'}

  function pagePermission(path){
    const p=(path||location.pathname).split('/').pop().split('?')[0]||'index.html';
    const map={'dealer.html':'DEALER_STATION','chip-count-ai.html':'CHIP_COUNT','smart-registration.html':'SMART_REGISTRATION','final-table-access.html':'FINAL_TABLE_ACCESS','tournaments.html':'TOURNAMENTS','tournament-manager.html':'TOURNAMENT_MANAGER','tournament-settings.html':'SETUP','setup.html':'SETUP','players.html':'PLAYERS','players-hub.html':'PLAYERS','players-directory.html':'PLAYERS','player-register.html':'PLAYERS','players-registered.html':'PLAYERS','checkin.html':'CHECKIN','pre-registration.html':'CHECKIN','control.html':'CONTROL','balancing.html':'BALANCING','tournament-readiness.html':'READINESS','tournament-close.html':'RESULTS','bounty.html':'RESULTS','screen.html':'BROADCAST','broadcast.html':'BROADCAST','transmission-room.html':'BROADCAST','screen-settings.html':'BROADCAST','screen-alerts.html':'BROADCAST','screen-alerts-operation.html':'BROADCAST','financial-hub.html':'FINANCE','finance.html':'FINANCE','finance-settings.html':'FINANCE','wallet.html':'WALLET','communication-hub.html':'MESSAGING','communications.html':'MESSAGING','marketing.html':'MARKETING','crm.html':'MARKETING','staff-hub.html':'STAFF_ADMIN','staff.html':'STAFF_ADMIN','environments-hub.html':'ENVIRONMENT_ADMIN','environment-register.html':'ENVIRONMENT_ADMIN','environment-registered.html':'ENVIRONMENT_ADMIN'};
    return map[p]||null;
  }

  function guard(path){
    ensure();
    if(OPEN_TEST_MODE)return true;
    const p=(path||location.pathname).split('/').pop().split('?')[0]||'index.html';
    if(p==='login.html')return true;
    if(!state.authMemberships.length)return true;
    const s=current();if(!s){location.replace('login.html');return false}
    if(['GESTOR','OWNER'].includes(s.role))return true;
    const allowed=s.role==='DEALER'?DEALER_PAGES:s.role==='FLOOR'?FLOOR_PAGES:s.role==='TD'?TD_PAGES:s.role==='CASHIER'?CASHIER_PAGES:s.role==='VIEWER'?VIEWER_PAGES:null;
    if(!allowed||!allowed.has(p)){location.replace(landing(s));return false}
    const req=pagePermission(p);if(req&&!can(req)){location.replace(landing(s));return false}
    return true;
  }

  function actualRole(s=current()){return String(s?.authRole||s?.role||'').toUpperCase()}
  function activeDealerWorkSession(){const s=current();if(!s||actualRole(s)!=='DEALER')return null;return state.dealerWorkSessions.find(w=>w.status==='ACTIVE'&&w.eventId===state.eventId&&w.membershipId===(getSession()?.membershipId||s.membershipId)&&w.deviceId===deviceId())||null}
  function dealerCheckIn(table){
    ensure();const s=current();if(!s||actualRole(s)!=='DEALER')return{ok:false,error:'ENTRE NO AMBIENTE COMO DEALER.'};
    const t=Math.max(1,Math.floor(+table||0));if(!t)return{ok:false,error:'INFORME A MESA.'};
    const mine=activeDealerWorkSession();if(mine)return{ok:false,error:`FAÇA CHECK OUT DA MESA ${mine.table} ANTES DE TROCAR DE MESA.`};
    const stored=getSession(),membershipId=stored?.membershipId||s.membershipId,clubId=stored?.clubId||s.clubId;
    const occupied=state.dealerWorkSessions.find(w=>w.status==='ACTIVE'&&w.eventId===state.eventId&&w.clubId===clubId&&+w.table===t);if(occupied)return{ok:false,error:'ESTA MESA JÁ POSSUI UM DEALER ATIVO.'};
    const staff=staffForSession(),now=Date.now(),row={id:'dealer-work-'+now+'-'+Math.random().toString(36).slice(2,7),eventId:state.eventId,clubId,membershipId,personId:stored?.personId||s.personId,staffId:staff?.id||stored?.staffId||s.staffId,dealerName:stored?.personName||s.personName,table:t,deviceId:deviceId(),status:'ACTIVE',checkedInAt:now,checkedOutAt:null};
    state.dealerWorkSessions.unshift(row);if(typeof auditEvent==='function')auditEvent('DEALER_TABLE_CHECKIN',{source:'DEALER_STATION',dealerId:row.staffId,dealerName:row.dealerName,table:t,deviceId:row.deviceId,clubId});save();return{ok:true,session:row};
  }
  function dealerCheckOut(){const row=activeDealerWorkSession();if(!row)return{ok:false,error:'NÃO HÁ CHECK IN DE DEALER ATIVO NESTE APARELHO.'};row.status='CLOSED';row.checkedOutAt=Date.now();if(typeof auditEvent==='function')auditEvent('DEALER_TABLE_CHECKOUT',{source:'DEALER_STATION',dealerId:row.staffId,dealerName:row.dealerName,table:row.table,deviceId:row.deviceId,clubId:row.clubId});save();return{ok:true,session:row}}
  function dealerCanOperate(){return !!activeDealerWorkSession()}

  window.StackupAuth={ensure,login,environments,selectEnvironment,logout,switchEnvironment,current,staffForSession,can,guard,landing,deviceId,activeDealerWorkSession,dealerCheckIn,dealerCheckOut,dealerCanOperate,ROLE_ACCESS,OPEN_TEST_MODE};
  ensure();
})();
