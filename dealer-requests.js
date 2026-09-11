(function(){
  if(typeof document==='undefined')return;
  const run=()=>{
    if((location.pathname.split('/').pop()||'').toLowerCase()!=='dealer.html')return;
    if(document.getElementById('dealerAddonRequestBlock'))return;
    const operations=document.getElementById('operations');if(!operations)return;
    const rebuyStatus=document.getElementById('rebuyStatus');
    const anchor=rebuyStatus?.parentElement||rebuyStatus;
    const addon=document.createElement('div');addon.id='dealerAddonRequestBlock';addon.innerHTML=`<div class="section">SOLICITAR ADD-ON</div><div><div class="label">JOGADOR DA MESA</div><select id="addonPlayer"></select></div><div class="rebuyActions"><button id="requestAddonI" type="button">ADD-ON I</button><button id="requestAddonII" type="button">ADD-ON II</button></div><div id="addonStatus" class="actionStatus"></div>`;
    if(anchor?.parentNode)anchor.parentNode.insertBefore(addon,anchor.nextSibling);else operations.appendChild(addon);
    const floor=document.createElement('div');floor.id='dealerFloorCallBlock';floor.innerHTML=`<div class="section">SUPORTE</div><button id="callFloor" type="button">CHAMAR FLOOR</button><div id="floorCallStatus" class="actionStatus"></div>`;operations.appendChild(floor);
    const byId=id=>document.getElementById(id);
    function workSession(){return window.StackupAuth?.activeDealerWorkSession?.()||null}
    function staff(){return window.StackupAuth?.staffForSession?.()||null}
    function players(){const w=workSession();if(!w)return[];return(state.players||[]).filter(p=>p.status==='active'&&+p.table===+w.table)}
    function refreshPlayers(){const sel=byId('addonPlayer'),keep=sel.value,list=players();sel.innerHTML='<option value="">SELECIONE O JOGADOR</option>'+list.map(p=>`<option value="${p.id}">A${p.seat??''} • ${String(p.name||'').replace(/[<>]/g,'')}</option>`).join('');if(list.some(p=>String(p.id)===String(keep)))sel.value=keep}
    function requestAddon(kind){
      const w=workSession(),s=staff(),p=(state.players||[]).find(x=>String(x.id)===String(byId('addonPlayer').value));
      if(!w){byId('addonStatus').textContent='FAÇA O CHECK IN DO DEALER ANTES DE SOLICITAR.';return}
      if(!p){byId('addonStatus').textContent='SELECIONE O JOGADOR.';return}
      const item=kind==='II'?'ADDON_II':'ADDON_I';
      const body=`${state.clubName||'POKER CLUB'}\n${state.tournamentName||'TORNEIO'}\n\nSOLICITAÇÃO ${kind==='II'?'ADD-ON II':'ADD-ON I'}\nJOGADOR: ${p.name}\nMESA ${w.table} • ASSENTO ${p.seat??''}\nDEALER: ${s?.name||'DEALER'}\n\nPENDENTE DE ATENDIMENTO NO APP.`;
      const r=window.StackupRequests?.create?.({type:item,title:`SOLICITAÇÃO ${kind==='II'?'ADD-ON II':'ADD-ON I'}`,body,roles:['TD','FLOOR','CASHIER','GESTOR','OWNER'],table:+w.table,playerId:p.id,playerName:p.name,dealer:s,meta:{itemCode:item,transactionType:'ADDON'}});
      byId('addonStatus').textContent=r?.ok?`${kind==='II'?'ADD-ON II':'ADD-ON I'} SOLICITADO • AVISO ENVIADO NO APP E WHATSAPP.`:'NÃO FOI POSSÍVEL ENVIAR A SOLICITAÇÃO.';
    }
    function callFloor(){
      const w=workSession(),s=staff();if(!w){byId('floorCallStatus').textContent='FAÇA O CHECK IN DO DEALER ANTES DE CHAMAR O FLOOR.';return}
      const body=`${state.clubName||'POKER CLUB'}\n${state.tournamentName||'TORNEIO'}\n\n⚠ CHAMADO DE FLOOR\nMESA ${w.table}\nDEALER: ${s?.name||'DEALER'}\n\nO DEALER SOLICITOU A PRESENÇA DO FLOOR NA MESA.`;
      const r=window.StackupRequests?.create?.({type:'FLOOR_CALL',title:'CHAMAR FLOOR',body,roles:['FLOOR','TD','GESTOR','OWNER'],table:+w.table,dealer:s,meta:{priority:'HIGH'}});
      byId('floorCallStatus').textContent=r?.ok?'FLOOR CHAMADO • ALERTA ENVIADO NO APP E WHATSAPP.':'NÃO FOI POSSÍVEL CHAMAR O FLOOR.';
    }
    byId('requestAddonI').onclick=()=>requestAddon('I');byId('requestAddonII').onclick=()=>requestAddon('II');byId('callFloor').onclick=callFloor;
    const old=window.onPokerStateChange;window.onPokerStateChange=function(s){if(typeof old==='function')old(s);refreshPlayers()};
    refreshPlayers();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();