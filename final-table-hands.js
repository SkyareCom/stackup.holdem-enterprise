(function(){
  const DEVICE_KEY='stackup-final-table-device-v1';
  function emptyAccess(s=state){return{status:'IDLE',active:false,eventId:s.eventId||'',sessionId:'',requestId:'',table:null,dealerId:'',dealerName:'',dealerRole:'',dealerCpf:'',deviceId:'',requestedAt:null,checkedInAt:null,approvedAt:null,approvedById:'',approvedByName:'',rejectedAt:null,rejectedById:'',releasedAt:null,lastActionAt:null}}
  function activeCount(s=state){return(s.players||[]).filter(p=>p.status==='active').length}
  function ftCapacity(s=state){return Math.max(2,Math.floor(+s.seatsPerTable||9))}
  function totalTournamentPlayers(s=state){return(s.players||[]).filter(p=>p.eventId===undefined||p.eventId===s.eventId).length}
  function freezeForFinalTable(s=state){
    const now=Date.now();
    const timer=window.TournamentTimer?.displayed?.();
    const remaining=Math.max(0,+timer?.remaining||+s.remaining||0);
    const elapsed=Math.max(0,+timer?.elapsed||+s.elapsed||0);
    const wasRunning=!!s.running;
    s.timerBaseRemaining=remaining;s.remaining=remaining;s.elapsedBase=elapsed;s.elapsed=elapsed;
    s.running=false;s.timerStartedAt=null;s.elapsedStartedAt=null;
    return{remaining,elapsed,wasRunning,now};
  }
  function ensureGate(s=state){
    const cap=ftCapacity(s),active=activeCount(s),total=totalTournamentPlayers(s);
    if(active!==cap||total<=cap)return s.finalTableGate||null;
    if(s.finalTableStartedAt||s.finalTableGate?.eventId===s.eventId)return s.finalTableGate||null;
    const f=freezeForFinalTable(s);
    s.finalTableGate={eventId:s.eventId||'',status:'LOCKED',detectedAt:f.now,activePlayers:active,capacity:cap,levelIndex:+s.levelIndex||0,timerRemaining:f.remaining,timerElapsed:f.elapsed,timerWasRunning:f.wasRunning,mode:null,authorizedAt:null,authorizedById:'',authorizedByName:''};
    s.finalTableManualActive=false;s.finalTableMode='TIMER';
    if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_BUBBLE_CONFIRMED',{source:'FINAL_TABLE_GATE',activePlayers:active,capacity:cap,levelIndex:+s.levelIndex||0,timerRemaining:f.remaining});
    return s.finalTableGate;
  }
  function ensure(s=state){
    if(!s.finalTableHands||typeof s.finalTableHands!=='object')s.finalTableHands={};
    if(!Array.isArray(s.finalTableAuthorizedDealers))s.finalTableAuthorizedDealers=[];
    const h=s.finalTableHands;
    const idx=+s.levelIndex||0;
    const structureMode=['TIMER','MANUAL'].includes(s.finalTableStructureMode)?s.finalTableStructureMode:'TIMER';
    s.finalTableStructureMode=structureMode;
    if(!Number.isFinite(+s.finalTableHandsPerLevel)||+s.finalTableHandsPerLevel<=0)s.finalTableHandsPerLevel=10;
    s.finalTableHandsPerLevel=Math.max(1,Math.floor(+s.finalTableHandsPerLevel||10));
    if(structureMode!=='MANUAL')s.finalTableManualActive=false;
    s.finalTableMode=(structureMode==='MANUAL'&&s.finalTableManualActive)?'HANDS':'TIMER';
    if(!Number.isFinite(+h.target)||+h.target<=0)h.target=s.finalTableHandsPerLevel;
    if(!Number.isFinite(+h.completed)||+h.completed<0)h.completed=0;
    if(!Number.isFinite(+h.levelIndex))h.levelIndex=idx;
    if(+h.levelIndex!==idx){h.levelIndex=idx;h.completed=0;h.updatedAt=Date.now()}
    h.target=Math.max(1,Math.floor(+s.finalTableHandsPerLevel||+h.target||10));
    h.completed=Math.max(0,Math.min(h.target,Math.floor(+h.completed||0)));
    if(s.finalTableMode==='TIMER'&&h.completed!==0){h.completed=0;h.levelIndex=idx;h.updatedAt=Date.now()}
    if(!s.finalTableAccess||typeof s.finalTableAccess!=='object')s.finalTableAccess=emptyAccess(s);
    const a=s.finalTableAccess;
    if(!a.status)a.status=a.active?'APPROVED':'IDLE';
    if(typeof a.active!=='boolean')a.active=a.status==='APPROVED';
    if(!('requestedAt' in a))a.requestedAt=a.checkedInAt||null;
    if(!('approvedAt' in a))a.approvedAt=a.active?a.checkedInAt||null:null;
    if(!('approvedById' in a))a.approvedById='';
    if(!('approvedByName' in a))a.approvedByName='';
    if(!('dealerCpf' in a))a.dealerCpf='';
    if(!('requestId' in a))a.requestId='';
    ensureGate(s);
    return h;
  }
  function isManualMode(s=state){ensure(s);return s.finalTableStructureMode==='MANUAL'&&s.finalTableManualActive===true}
  function deviceId(){let id='';try{id=localStorage.getItem(DEVICE_KEY)||''}catch(e){}if(!id){id='ft-device-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);try{localStorage.setItem(DEVICE_KEY,id)}catch(e){}}return id}
  function access(s=state){ensure(s);return s.finalTableAccess}
  function snapshot(s=state){const h=ensure(s),target=h.target,completed=h.completed,remaining=Math.max(0,target-completed);return{target,completed,remaining,progress:target?completed/target:0,levelIndex:+s.levelIndex||0,mode:s.finalTableMode,configuredMode:s.finalTableStructureMode,manualActive:!!s.finalTableManualActive,gate:s.finalTableGate||null,authorizedDealers:[...(s.finalTableAuthorizedDealers||[])],access:{...access(s)},deviceId:deviceId()}}
  function save(){if(typeof saveState==='function')saveState();if(typeof window.onPokerStateChange==='function')window.onPokerStateChange(state)}
  function isPrivileged(staff){return !!staff&&['OWNER','TD','FLOOR','GESTOR'].includes(staff.role)}
  function digits(v){return String(v||'').replace(/\D/g,'')}
  function staffRecord(id){return(state.staffUsers||[]).find(x=>String(x.id)===String(id))||null}
  function managerCredential({staff,cpf,pin}){
    if(!isPrivileged(staff))return{ok:false,error:'SOMENTE TD, FLOOR OU GESTOR PODE AUTORIZAR A FINAL TABLE.'};
    const row=staffRecord(staff.id)||staff;
    const cpfOk=digits(row.cpf||staff.cpf)===digits(cpf);
    const pinOk=String(row.pin||'')===String(pin||'');
    if(!cpfOk||!pinOk)return{ok:false,error:'CPF OU CÓDIGO DE CONFIRMAÇÃO DO TD / FLOOR INVÁLIDO.'};
    return{ok:true,staff:row}
  }
  function resolveDealerCredential(value){
    const raw=String(value||'').trim(),d=digits(raw);
    if(!raw)return null;
    return(state.staffUsers||[]).find(x=>x.active!==false&&x.role==='DEALER'&&(digits(x.cpf)===d||String(x.id)===raw||String(x.pin||'')===raw))||null
  }
  function resumeTimer(g){
    if(!g?.timerWasRunning)return;
    const now=Date.now();state.running=true;state.timerBaseRemaining=Math.max(0,+g.timerRemaining||+state.remaining||0);state.remaining=state.timerBaseRemaining;state.timerStartedAt=now;state.elapsedBase=Math.max(0,+g.timerElapsed||+state.elapsed||0);state.elapsed=state.elapsedBase;state.elapsedStartedAt=now
  }
  function authorizeFinalTable({staff,mode,managerCpf,managerPin,dealerCredentials=[]}={}){
    ensure();const g=state.finalTableGate;
    if(!g||g.eventId!==state.eventId||g.status!=='LOCKED')return{ok:false,error:'A FINAL TABLE AINDA NÃO ESTÁ AGUARDANDO LIBERAÇÃO.'};
    const auth=managerCredential({staff,cpf:managerCpf,pin:managerPin});if(!auth.ok)return auth;
    const chosen=String(mode||'').toUpperCase();if(!['TIMER','MANUAL'].includes(chosen))return{ok:false,error:'SELECIONE O MODO FINAL TABLE.'};
    const now=Date.now();g.mode=chosen;g.authorizedAt=now;g.authorizedById=staff.id;g.authorizedByName=staff.name||staff.role||'';
    state.finalTableStructureMode=chosen;state.finalTableManualActive=false;state.finalTableMode='TIMER';
    if(chosen==='TIMER'){
      state.finalTableAuthorizedDealers=[];g.status='RELEASED_TIMER';resumeTimer(g);
      if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_MODE_AUTHORIZED',{source:'FINAL_TABLE_GATE',mode:'TIMER',levelIndex:+state.levelIndex||0,authorizedBy:staff.id,authorizedByName:staff.name||''});
      save();return{ok:true,mode:'TIMER',gate:{...g},dealers:[]}
    }
    const dealers=[];
    for(const credential of dealerCredentials){const d=resolveDealerCredential(credential);if(d&&!dealers.some(x=>String(x.id)===String(d.id)))dealers.push({id:d.id,name:d.name||'DEALER',cpf:d.cpf||''})}
    if(!dealers.length)return{ok:false,error:'AUTORIZE PELO MENOS UM DEALER PARA O SISTEMA MANUAL.'};
    if(dealers.length>3)return{ok:false,error:'É POSSÍVEL AUTORIZAR NO MÁXIMO 3 DEALERS PARA A FINAL TABLE.'};
    state.finalTableAuthorizedDealers=dealers;g.status='AUTHORIZED_MANUAL';
    if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_MODE_AUTHORIZED',{source:'FINAL_TABLE_GATE',mode:'MANUAL',levelIndex:+state.levelIndex||0,authorizedBy:staff.id,authorizedByName:staff.name||'',dealers:dealers.map(x=>x.id)});
    save();return{ok:true,mode:'MANUAL',gate:{...g},dealers:[...dealers]}
  }
  function canControl(s=state){const a=access(s);return !!(a.status==='APPROVED'&&a.active&&a.eventId===s.eventId&&a.deviceId===deviceId())}
  function activateManualTransition(staff,a,now){
    if(state.finalTableStructureMode!=='MANUAL')return;
    const first=!state.finalTableStartedAt;
    state.finalTableManualActive=true;state.finalTableMode='HANDS';state.finalTableStartedAt=state.finalTableStartedAt||now;
    state.finalTableTransition=state.finalTableTransition||{eventId:state.eventId||'',activatedAt:now,levelIndex:+state.levelIndex||0,timerRemaining:Math.max(0,+state.finalTableGate?.timerRemaining||+state.remaining||0),structureId:state.selectedStructureId||null,structureName:state.selectedStructureName||'',dealerId:a.dealerId,dealerName:a.dealerName,table:a.table,approvedById:state.finalTableGate?.authorizedById||staff?.id||'',approvedByName:state.finalTableGate?.authorizedByName||staff?.name||staff?.role||''};
    const h=ensure();h.levelIndex=+state.levelIndex||0;h.target=Math.max(1,+state.finalTableHandsPerLevel||10);h.completed=0;h.updatedAt=now;
    if(first&&typeof auditEvent==='function')auditEvent('FINAL_TABLE_STARTED',{source:'FINAL_TABLE_DEALER_CHECKIN',mode:'HANDS',levelIndex:+state.levelIndex||0,timerRemaining:state.finalTableTransition.timerRemaining,target:h.target,table:a.table,dealerId:a.dealerId,dealerName:a.dealerName});
    else if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_DEALER_ASSUMED',{source:'FINAL_TABLE_DEALER_CHECKIN',table:a.table,dealerId:a.dealerId,dealerName:a.dealerName})
  }
  function requestCheckIn({staff,table}={}){
    ensure();
    if(state.finalTableStructureMode!=='MANUAL')return{ok:false,error:'MESA FINAL CONFIGURADA COM TEMPORIZADOR. CHECK IN ESPECÍFICO DA FT NÃO É NECESSÁRIO.'};
    const g=state.finalTableGate;if(!g||g.status!=='AUTHORIZED_MANUAL')return{ok:false,error:'AGUARDANDO AUTORIZAÇÃO DO TD / FLOOR PARA O SISTEMA MANUAL.'};
    if(!staff?.id||staff.role!=='DEALER')return{ok:false,error:'INFORME O CPF DE UM DEALER ATIVO.'};
    const authorized=(state.finalTableAuthorizedDealers||[]).find(x=>String(x.id)===String(staff.id));if(!authorized)return{ok:false,error:'ESTE DEALER NÃO ESTÁ NA LISTA AUTORIZADA PARA A FINAL TABLE.'};
    const t=Math.max(1,Math.floor(+table||0));if(!t)return{ok:false,error:'INFORME A MESA DA FINAL TABLE.'};
    const current=access();if(current.eventId===state.eventId&&current.status==='APPROVED'&&current.active&&current.deviceId!==deviceId())return{ok:false,error:'JÁ EXISTE UM APARELHO AUTORIZADO PARA A FINAL TABLE.',active:{...current}};
    const now=Date.now();state.finalTableAccess={...emptyAccess(),status:'APPROVED',active:true,eventId:state.eventId,sessionId:'ft-session-'+now+'-'+Math.random().toString(36).slice(2,7),requestId:'',table:t,dealerId:staff.id,dealerName:staff.name||authorized.name||'DEALER',dealerRole:'DEALER',dealerCpf:staff.cpf||authorized.cpf||'',deviceId:deviceId(),requestedAt:now,checkedInAt:now,approvedAt:now,approvedById:g.authorizedById||'',approvedByName:g.authorizedByName||'',lastActionAt:now};
    activateManualTransition(staff,state.finalTableAccess,now);
    if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_DEALER_CHECKIN',{source:'DEALER_STATION',table:t,dealerId:staff.id,dealerName:staff.name||'',deviceId:deviceId(),preAuthorized:true});
    save();return{ok:true,approved:true,access:{...state.finalTableAccess},transition:state.finalTableTransition||null}
  }
  function approve({staff}={}){ensure();const a=access();if(!isPrivileged(staff))return{ok:false,error:'SOMENTE TD, FLOOR OU GESTOR PODE LIBERAR O ACESSO À FT.'};if(a.status!=='PENDING')return{ok:false,error:'NÃO HÁ SOLICITAÇÃO PENDENTE PARA LIBERAR.'};const now=Date.now();a.status='APPROVED';a.active=true;a.sessionId='ft-session-'+now+'-'+Math.random().toString(36).slice(2,7);a.approvedAt=now;a.approvedById=staff.id;a.approvedByName=staff.name||staff.role||'GESTOR';a.rejectedAt=null;a.rejectedById='';a.releasedAt=null;a.lastActionAt=now;activateManualTransition(staff,a,now);if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_ACCESS_APPROVED',{source:'FINAL_TABLE_ACCESS',table:a.table,dealerId:a.dealerId,dealerName:a.dealerName,deviceId:a.deviceId,approvedBy:staff.id,approvedByName:staff.name||'',levelIndex:+state.levelIndex||0,mode:state.finalTableMode});save();return{ok:true,access:{...a},transition:state.finalTableTransition||null}}
  function reject({staff}={}){ensure();const a=access();if(!isPrivileged(staff))return{ok:false,error:'SOMENTE TD, FLOOR OU GESTOR PODE RECUSAR O ACESSO À FT.'};if(a.status!=='PENDING')return{ok:false,error:'NÃO HÁ SOLICITAÇÃO PENDENTE PARA RECUSAR.'};const now=Date.now();a.status='REJECTED';a.active=false;a.rejectedAt=now;a.rejectedById=staff.id;a.approvedAt=null;a.approvedById='';a.approvedByName='';a.lastActionAt=now;if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_ACCESS_REJECTED',{source:'FINAL_TABLE_ACCESS',table:a.table,dealerId:a.dealerId,dealerName:a.dealerName,deviceId:a.deviceId,rejectedBy:staff.id,rejectedByName:staff.name||''});save();return{ok:true,access:{...a}}}
  function checkIn(opts={}){return requestCheckIn(opts)}
  function checkOut({staff}={}){ensure();const a=access();if(a.status==='IDLE')return{ok:true};const privileged=isPrivileged(staff),mine=a.deviceId===deviceId();if(!mine&&!privileged)return{ok:false,error:'ESTE APARELHO NÃO É O CONTROLADOR ATIVO.'};if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_DEALER_CHECKOUT',{source:'DEALER_STATION',table:a.table,dealerId:a.dealerId,dealerName:a.dealerName,deviceId:a.deviceId,releasedBy:staff?.id||''});a.status='RELEASED';a.active=false;a.releasedAt=Date.now();a.lastActionAt=Date.now();save();return{ok:true}}
  function setTarget(value){const h=ensure();const n=Math.max(1,Math.floor(+value||10));state.finalTableHandsPerLevel=n;h.target=n;h.completed=Math.min(h.completed,h.target);h.updatedAt=Date.now();save();return snapshot()}
  function setCompleted(value){const h=ensure();h.completed=Math.max(0,Math.min(h.target,Math.floor(+value||0)));h.updatedAt=Date.now();save();return snapshot()}
  function nextHand(){const h=ensure();if(!isManualMode())return snapshot();if(h.completed<h.target)h.completed+=1;h.updatedAt=Date.now();access().lastActionAt=Date.now();if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_HAND_COMPLETED',{levelIndex:+state.levelIndex||0,completed:h.completed,target:h.target,source:'FINAL_TABLE_HANDS',dealerId:access().dealerId,deviceId:deviceId()});save();return snapshot()}
  function prevHand(){const h=ensure();if(!isManualMode())return snapshot();h.completed=Math.max(0,h.completed-1);h.updatedAt=Date.now();access().lastActionAt=Date.now();if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_HAND_REMOVED',{levelIndex:+state.levelIndex||0,completed:h.completed,target:h.target,source:'FINAL_TABLE_HANDS',dealerId:access().dealerId,deviceId:deviceId()});save();return snapshot()}
  function authorizedNextHand(){if(!isManualMode())return{ok:false,error:state.finalTableStructureMode==='MANUAL'?'AGUARDANDO DEALER AUTORIZADO ASSUMIR A MESA FINAL.':'MESA FINAL CONFIGURADA COM TEMPORIZADOR.'};if(!canControl())return{ok:false,error:'O APARELHO AINDA NÃO FOI LIBERADO PARA A FINAL TABLE.'};return{ok:true,snapshot:nextHand()}}
  function authorizedPrevHand(){if(!isManualMode())return{ok:false,error:state.finalTableStructureMode==='MANUAL'?'AGUARDANDO DEALER AUTORIZADO ASSUMIR A MESA FINAL.':'MESA FINAL CONFIGURADA COM TEMPORIZADOR.'};if(!canControl())return{ok:false,error:'O APARELHO AINDA NÃO FOI LIBERADO PARA A FINAL TABLE.'};return{ok:true,snapshot:prevHand()}}
  function reset(){const h=ensure();h.completed=0;h.updatedAt=Date.now();save();return snapshot()}
  window.FinalTableHands={ensure,ensureGate,snapshot,setTarget,setCompleted,nextHand,prevHand,authorizedNextHand,authorizedPrevHand,reset,deviceId,access,canControl,checkIn,requestCheckIn,approve,reject,checkOut,isPrivileged,isManualMode,authorizeFinalTable,resolveDealerCredential};
  ensure();
})();