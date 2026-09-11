(()=>{
  const SUPABASE_URL='https://kohymgajxhkxjojgjetv.supabase.co';
  const SUPABASE_KEY='sb_publishable_IttIfQBG7J_NmAi2P_JSng_mG_qciMT';
  const ROOM_KEY='stackup-cast-room-v1';
  const DEVICE_KEY='stackup-cast-device-v1';

  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  const applyGlobalFont=()=>{
    if(document.querySelector('link[data-stackup-global-font]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='font-global.css?v=typography-20260904';
    link.dataset.stackupGlobalFont='1';
    (document.head||document.documentElement).appendChild(link);
  };
  applyGlobalFont();

  const applyGlobalTypography=()=>{
    if(document.querySelector('link[data-stackup-global-typography]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=page.startsWith('cast-')?'cast-scale.css?v=20260904-1':'typography-global.css?v=20260904-1';
    link.dataset.stackupGlobalTypography='1';
    (document.head||document.documentElement).appendChild(link);
  };
  applyGlobalTypography();

  const applyOperationalUiStandard=()=>{
    const excluded=page==='index.html'||page==='login.html'||page==='players.html'||page.startsWith('cast-');
    if(excluded||document.querySelector('link[data-stackup-ui-standard]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='ui-standard.css?v=c3942be';
    link.dataset.stackupUiStandard='1';
    (document.head||document.documentElement).appendChild(link);
  };
  applyOperationalUiStandard();

  const params=new URLSearchParams(location.search);
  const cleanRoom=v=>String(v||'').replace(/\D/g,'').slice(0,6);
  const randomRoom=()=>String(100000+Math.floor(Math.random()*900000));
  const deviceId=localStorage.getItem(DEVICE_KEY)||('dev-'+Math.random().toString(36).slice(2,10));
  localStorage.setItem(DEVICE_KEY,deviceId);
  let room=cleanRoom(params.get('room')||localStorage.getItem(ROOM_KEY));
  const isViewer=params.get('role')==='viewer';
  if(!room&&!isViewer){room=randomRoom();localStorage.setItem(ROOM_KEY,room)}
  if(room)localStorage.setItem(ROOM_KEY,room);
  let channel=null,client=null,connected=false,heartbeat=0,patched=false;

  const publicState=()=>{
    if(typeof state==='undefined')return null;
    const s=JSON.parse(JSON.stringify(state));
    ['staffUsers','staffContacts','staffAlerts','auditLog','messageQueue','messageLog','botCommands','paymentIntents','walletTransactions','validationLog','rankings','loyaltyAccounts','campaigns','playerCommunications','cashTables','cashSessions','cashTransactions','authPeople','authClubs','authMemberships'].forEach(k=>delete s[k]);
    s.players=(s.players||[]).map(p=>({id:p.id,name:p.name,status:p.status,seatedAt:p.seatedAt,table:p.table,seat:p.seat}));
    s.transactions=(s.transactions||[]).map(t=>({eventId:t.eventId,type:t.type,status:t.status,itemCode:t.itemCode,breakdown:t.breakdown?{prize:t.breakdown.prize}:undefined,value:t.value}));
    s.seatCheckins=(s.seatCheckins||[]).map(x=>({eventId:x.eventId,playerId:x.playerId,status:x.status}));
    return s;
  };

  const emitStatus=(status,detail='')=>{
    connected=status==='connected';
    window.dispatchEvent(new CustomEvent('stackup-remote-status',{detail:{status,detail,room,role:isViewer?'viewer':'manager'}}));
  };

  const send=async(event,payload={})=>{
    if(!channel||!connected)return false;
    try{await channel.send({type:'broadcast',event,payload:{...payload,room,source:deviceId,sentAt:Date.now()}});return true}catch(_){return false}
  };

  const publish=()=>{
    if(isViewer||!room)return;
    const snapshot=publicState();
    if(snapshot)send('state_snapshot',{state:snapshot});
  };

  const applyRemote=payload=>{
    if(!isViewer||!payload?.state||payload.source===deviceId)return;
    try{
      if(typeof state!=='undefined')state={...state,...payload.state};
      if(typeof STORAGE_KEY!=='undefined')localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      if(typeof bc!=='undefined'&&bc)bc.postMessage(state);
      if(typeof window.onPokerStateChange==='function')window.onPokerStateChange(state);
    }catch(e){console.error('STACKUP REMOTE APPLY',e)}
  };

  const patchSave=()=>{
    if(patched||isViewer||typeof saveState!=='function')return;
    patched=true;
    const original=saveState;
    saveState=function(){const out=original.apply(this,arguments);publish();return out};
  };

  const loadClient=()=>new Promise((resolve,reject)=>{
    if(window.supabase?.createClient)return resolve();
    const existing=document.querySelector('script[data-stackup-supabase]');
    if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.async=true;
    s.dataset.stackupSupabase='1';
    s.onload=resolve;
    s.onerror=reject;
    (document.head||document.documentElement).appendChild(s);
  });

  async function connect(){
    if(!room){emitStatus('waiting','ROOM_REQUIRED');return}
    emitStatus('connecting');
    try{
      await loadClient();
      client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:20}}});
      channel=client.channel('stackup-tournament-'+room,{config:{broadcast:{self:false,ack:true}}});
      channel.on('broadcast',{event:'state_snapshot'},({payload})=>applyRemote(payload));
      channel.on('broadcast',{event:'request_state'},()=>{if(!isViewer)publish()});
      channel.subscribe(status=>{
        if(status==='SUBSCRIBED'){
          emitStatus('connected');
          patchSave();
          if(isViewer)send('request_state',{});else publish();
          clearInterval(heartbeat);
          heartbeat=setInterval(()=>{if(isViewer)send('request_state',{});else publish()},3000);
        }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED')emitStatus('disconnected',status);
      });
    }catch(e){console.error('STACKUP REMOTE CONNECT',e);emitStatus('error',String(e?.message||e))}
  }

  function newRoom(){const next=randomRoom();localStorage.setItem(ROOM_KEY,next);return next}
  function viewerUrl(file='cast-10px.html'){const base=new URL(file,location.href);base.searchParams.set('room',room);base.searchParams.set('role','viewer');return base.toString()}
  window.StackupRemoteSync={room:()=>room,role:()=>isViewer?'viewer':'manager',connected:()=>connected,publish,newRoom,viewerUrl,reconnect:connect};
  patchSave();
  connect();
})();