(function(){
  if(typeof document==='undefined')return;
  function qs(id){return document.getElementById(id)}
  function allowed(){const role=String(window.StackupAuth?.staffForSession?.()?.role||'').toUpperCase();return ['OWNER','TD','FLOOR','GESTOR'].includes(role)}
  function ensureUI(){
    if(!allowed())return;
    const main=document.querySelector('main.app');if(!main)return;
    if(!qs('floorTournamentControl')){
      const block=document.createElement('div');block.id='floorTournamentControl';block.innerHTML=`<div class="section">CONTROLE DO TORNEIO</div><div class="approvalCard"><div class="infoCard"><span class="infoLabel">STATUS</span><span id="floorTimerStatus" class="infoValue"></span></div><div class="infoCard"><span class="infoLabel">NÍVEL</span><span id="floorTimerLevel" class="infoValue"></span></div><div class="infoCard"><span class="infoLabel">TEMPO</span><span id="floorTimerValue" class="infoValue activeText"></span></div><div class="infoCard"><span class="infoLabel">BLINDS</span><span id="floorTimerBlinds" class="infoValue"></span></div></div><div class="actions"><button id="floorMinus" type="button">MENOS 1 MIN</button><button id="floorPlay" class="primary" type="button">INICIAR</button><button id="floorPlus" type="button">MAIS 1 MIN</button><button id="floorPrev" type="button">NÍVEL ANTERIOR</button><button id="floorReset" type="button">REINICIAR NÍVEL</button><button id="floorNext" type="button">PRÓXIMO NÍVEL</button></div><div class="actions"><a href="control.html"><button type="button">ABRIR CONTROLE COMPLETO</button></a><button id="floorSync" type="button">RECALCULAR CONTADORES</button></div>`;
      const requests=qs('requestList');const requestSection=requests?.previousElementSibling;
      (requestSection?.parentNode||main).insertBefore(block,requestSection||main.firstChild);
      qs('floorMinus').onclick=()=>{TournamentTimer.adjust(-60);renderControl()};
      qs('floorPlus').onclick=()=>{TournamentTimer.adjust(60);renderControl()};
      qs('floorPlay').onclick=()=>{TournamentTimer.toggle();renderControl()};
      qs('floorPrev').onclick=()=>{TournamentTimer.prev();renderControl()};
      qs('floorNext').onclick=()=>{TournamentTimer.next();renderControl()};
      qs('floorReset').onclick=()=>{TournamentTimer.resetLevel();renderControl()};
      qs('floorSync').onclick=()=>{if(typeof syncTournamentCounts==='function')syncTournamentCounts();if(typeof auditEvent==='function')auditEvent('TOURNAMENT_COUNTS_SYNCED',{source:'TD_FLOOR_STATION'});if(typeof saveState==='function')saveState();renderControl()};
    }
    if(!qs('floorQuickConfirm')){
      const block=document.createElement('div');block.id='floorQuickConfirm';block.innerHTML=`<div class="section">ATALHOS DE CONFIRMAÇÃO</div><div class="hint">CONFIRME OU CONCLUA SOLICITAÇÕES OPERACIONAIS SEM SAIR DA TD / FLOOR STATION.</div><div id="floorQuickList" class="requestList"></div>`;
      const requests=qs('requestList');requests?.parentNode?.insertBefore(block,requests.nextSibling);
    }
    renderControl();renderQuick();
  }
  function renderControl(){
    if(!qs('floorTournamentControl')||!window.TournamentTimer)return;
    const s=TournamentTimer.displayed(),cur=typeof currentItem==='function'?currentItem():null;
    qs('floorTimerStatus').textContent=s.running?'AO VIVO':'PAUSADO';
    qs('floorTimerLevel').textContent=cur?.label||`NÍVEL ${(+state.levelIndex||0)+1}`;
    qs('floorTimerValue').textContent=typeof fmtTime==='function'?fmtTime(s.remaining):String(s.remaining||0);
    qs('floorTimerBlinds').textContent=cur?.type==='level'?`SB ${fmtNumber(cur.sb)} • BB ${fmtNumber(cur.bb)} • ANTE ${fmtNumber(cur.ante)}`:'INTERVALO';
    qs('floorPlay').textContent=s.running?'PAUSAR':'INICIAR';
  }
  function pendingRows(){
    const staff=window.StackupAuth?.staffForSession?.(),role=String(staff?.role||'').toUpperCase();
    return (state.operationalRequests||[]).filter(r=>r.eventId===state.eventId&&r.status==='PENDING'&&((r.roles||[]).map(x=>String(x).toUpperCase()).includes(role)||['OWNER','GESTOR'].includes(role))).slice(0,12)
  }
  function confirmRequest(id,status){
    const r=(state.operationalRequests||[]).find(x=>String(x.id)===String(id));if(!r)return;
    const staff=window.StackupAuth?.staffForSession?.();r.status=status;r.confirmedAt=Date.now();r.confirmedBy=staff?.id||'';r.confirmedByName=staff?.name||'';
    const a=(state.staffAlerts||[]).find(x=>x.requestId===r.id&&x.status!=='resolved');if(a)a.status=status==='RESOLVED'?'resolved':'confirmed';
    if(typeof auditEvent==='function')auditEvent(status==='RESOLVED'?'OPERATIONAL_REQUEST_RESOLVED':'OPERATIONAL_REQUEST_CONFIRMED',{source:'TD_FLOOR_STATION',requestId:r.id,requestType:r.type,operator:staff?.id||state.operator||'LOCAL'});
    if(typeof saveState==='function')saveState();
    if(typeof window.render==='function')window.render();renderQuick();
  }
  function esc(v){return String(v||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function renderQuick(){
    const box=qs('floorQuickList');if(!box)return;const rows=pendingRows();
    box.innerHTML=rows.length?rows.map(r=>`<div class="requestRow"><b>${esc(r.title||r.type)}</b><div class="requestMeta">${r.table?`MESA ${r.table} • `:''}${esc(r.playerName||'')}${r.dealerName?` • DEALER ${esc(r.dealerName)}`:''}</div><div class="actions"><button type="button" data-confirm="${esc(r.id)}">CONFIRMAR</button><button class="primary" type="button" data-resolve="${esc(r.id)}">CONCLUIR</button></div></div>`).join(''):'<div class="empty">NENHUMA SOLICITAÇÃO PENDENTE.</div>';
    box.querySelectorAll('[data-confirm]').forEach(b=>b.onclick=()=>confirmRequest(b.dataset.confirm,'CONFIRMED'));
    box.querySelectorAll('[data-resolve]').forEach(b=>b.onclick=()=>confirmRequest(b.dataset.resolve,'RESOLVED'));
  }
  function boot(){ensureUI();setInterval(renderControl,500);const old=window.onPokerStateChange;window.onPokerStateChange=function(s){if(typeof old==='function')old(s);ensureUI();renderQuick()}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();