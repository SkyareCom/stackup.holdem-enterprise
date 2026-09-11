(function(){
  function ensure(){
    if(typeof ensureOperationalState==='function')ensureOperationalState();
    if(!Array.isArray(state.operationalRequests))state.operationalRequests=[];
    if(!Array.isArray(state.staffAlerts))state.staffAlerts=[];
  }
  function phoneOf(s){return String(s?.whatsapp||s?.phone||'').replace(/\D/g,'')}
  function recipientsForRoles(roles=[]){
    const wanted=new Set(roles.map(x=>String(x||'').toUpperCase()));
    return (state.staffUsers||[]).filter(s=>s.active!==false&&wanted.has(String(s.role||'').toUpperCase())&&phoneOf(s));
  }
  function notifyWhatsApp({roles=[],body,kind='OPERATIONAL_REQUEST',source='REQUEST_CENTER',dedupeKey=''}){
    const rows=recipientsForRoles(roles),sent=[];
    rows.forEach(s=>{
      const phone=phoneOf(s);if(!phone)return;
      const q=typeof enqueueMessage==='function'?enqueueMessage({channel:'WHATSAPP',kind,body,recipient:phone,source,dedupeKey:dedupeKey?`${dedupeKey}-${s.id}`:'',category:'OPERATIONAL'}):null;
      sent.push({staffId:s.id,name:s.name||'',phone,queued:!!q});
    });
    return sent;
  }
  function create({type,title='',body='',roles=['TD','FLOOR'],table=null,playerId=null,playerName='',dealer=null,meta={}}={}){
    ensure();const now=Date.now();
    const row={id:'request-'+now+'-'+Math.random().toString(36).slice(2,7),eventId:state.eventId,type:String(type||'REQUEST'),title:String(title||type||'SOLICITAÇÃO'),body:String(body||''),roles:[...roles],table,playerId,playerName,dealerId:dealer?.id||'',dealerName:dealer?.name||'',status:'PENDING',createdAt:now,meta:{...meta}};
    state.operationalRequests.unshift(row);
    state.staffAlerts.unshift({id:'alert-'+now+'-'+Math.random().toString(36).slice(2,6),eventId:state.eventId,type:row.type,text:row.body,status:'pending',source:'REQUEST_CENTER',requestId:row.id,createdAt:now});
    row.whatsapp=notifyWhatsApp({roles:row.roles,body:row.body,kind:row.type,source:'REQUEST_CENTER',dedupeKey:row.id});
    if(typeof auditEvent==='function')auditEvent('OPERATIONAL_REQUEST_CREATED',{source:'REQUEST_CENTER',requestId:row.id,requestType:row.type,table:row.table,playerId:row.playerId,dealerId:row.dealerId,roles:row.roles});
    if(typeof saveState==='function')saveState();
    return{ok:true,request:row};
  }
  window.StackupRequests={ensure,create,notifyWhatsApp,recipientsForRoles};
  ensure();
})();