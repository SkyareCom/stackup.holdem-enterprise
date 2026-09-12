(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='players-directory.html')return;
  const view=new URLSearchParams(location.search).get('view')||'';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=v=>typeof fmtCurrency==='function'?fmtCurrency(v):new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(+v||0);
  const dt=ts=>ts?new Date(ts).toLocaleString('pt-BR'):'—';

  function applyView(){
    const app=document.querySelector('.app'),title=app?.querySelector('h1'),save=document.getElementById('save'),form=save?.closest('.card'),section=form?.previousElementSibling?.classList?.contains('section')?form.previousElementSibling:null,historyBtn=document.getElementById('historyBtn'),history=document.getElementById('playerHistory');
    if(view==='register'){
      if(title)title.textContent='CADASTRAR JOGADOR';
      historyBtn?.remove();history?.remove();return;
    }
    if(view==='registered'){
      if(title)title.textContent='JOGADORES CADASTRADOS';
      section?.remove();form?.remove();historyBtn?.remove();
      if(history){history.classList.remove('hidden');history.style.display='block'}
    }
  }

  function installRegisterSave(){
    if(view!=='register')return;
    const save=document.getElementById('save');
    if(!save||typeof persist!=='function'||typeof players==='undefined')return;
    let notice=document.getElementById('playerRegisterNotice');
    if(!notice){notice=document.createElement('div');notice.id='playerRegisterNotice';notice.className='meta';notice.style.marginTop='8px';notice.setAttribute('role','status');save.insertAdjacentElement('afterend',notice)}
    const val=id=>String(document.getElementById(id)?.value||'').trim();
    save.onclick=()=>{
      const name=val('playerNameInput'),birth=val('birth'),cpf=val('cpf'),cleanCpf=cpf.replace(/\D/g,'');
      if(!name){notice.textContent='INFORME O NOME.';document.getElementById('playerNameInput')?.focus();return}
      if(birth&&typeof validBirth==='function'&&!validBirth(birth)){notice.textContent='INFORME A DATA DE NASCIMENTO NO FORMATO DD / MM / AAAA.';document.getElementById('birth')?.focus();return}
      if(cleanCpf&&players.some(p=>String(p.cpf||'').replace(/\D/g,'')===cleanCpf)){notice.textContent='JOGADOR JÁ CADASTRADO COM ESTE CPF.';document.getElementById('cpf')?.focus();return}
      players.push({id:'player-'+Date.now(),name,cpf,birth,phone:val('phone'),whatsapp:val('whatsapp'),email:val('email'),instagram:val('instagram'),type:document.getElementById('type')?.value||'PRO',team:val('team'),info:[document.getElementById('infoWhats')?.checked?'WHATSAPP':'',document.getElementById('infoSms')?.checked?'SMS':'',document.getElementById('infoEmail')?.checked?'EMAIL':''].filter(Boolean),createdAt:Date.now()});
      persist();if(typeof clearForm==='function')clearForm();notice.textContent='JOGADOR CADASTRADO.';
    };
  }

  function metricsHtml(m,account,code='',seat=null){return`<div class="phMetrics"><div><span>CÓDIGO</span><b>${esc(code||'—')}</b></div><div><span>MESA</span><b>${esc(seat?.table??'—')}</b></div><div><span>POSIÇÃO</span><b>${esc(seat?.seat??'—')}</b></div><div><span>BUY IN</span><b>${m.buyin}</b></div><div><span>EARLY BONUS</span><b>${m.early}</b></div><div><span>REBUY I</span><b>${m.rebuy1}</b></div><div><span>REBUY II</span><b>${m.rebuy2}</b></div><div><span>RE-ENTRIES</span><b>${m.reentry}</b></div><div><span>ADD ON I</span><b>${m.addon1}</b></div><div><span>ADD ON II</span><b>${m.addon2}</b></div><div><span>BONUS ADD ON</span><b>${m.addonBonus}</b></div><div><span>BOUNTIES</span><b>${m.bounties} • ${money(m.bountyValue)}</b></div><div><span>VALOR GASTO</span><b>${money(m.spent)}</b></div><div><span>CRÉDITO</span><b>${money(m.credit)}</b></div><div><span>CREDIT PLAYER</span><b>${money(account||0)}</b></div></div>`}
  function txTable(tx){if(!tx.length)return'<div class="phEmpty">NENHUMA TRANSAÇÃO REGISTRADA.</div>';return`<div class="phTx">${tx.slice().sort((a,b)=>(+b.createdAt||0)-(+a.createdAt||0)).map(t=>`<div class="phTxRow"><span>${esc(String(t.type||'TRANSAÇÃO').toUpperCase())}${t.itemCode?` • ${esc(t.itemCode)}`:''}</span><b>${money(t.value||0)}</b><small>${dt(t.createdAt)}${t.payment?.method?` • ${esc(t.payment.method)}`:''}</small></div>`).join('')}</div>`}
  function detailHtml(d){const c=StackupPlayerProfile.careerProfile(d),m=c.metrics,rank=c.ranking;return`<div class="phIdentity"><div><span>NOME</span><b>${esc(d.name||'—')}</b></div><div><span>DATA DE NASCIMENTO</span><b>${esc(d.birth||'—')}</b></div><div><span>CPF</span><b>${esc(d.cpf||'—')}</b></div><div><span>WHATSAPP</span><b>${esc(d.whatsapp||'—')}</b></div><div><span>INSTAGRAM</span><b>${esc(d.instagram||'—')}</b></div><div><span>E-MAIL</span><b>${esc(d.email||'—')}</b></div></div><div class="phSummary"><div><span>TORNEIOS JOGADOS</span><b>${c.tournamentsPlayed}</b></div><div><span>PREMIAÇÕES</span><b>${money(c.prizes)}</b></div><div><span>RESULTADO LÍQUIDO</span><b>${money(c.result)}</b></div>${rank?`<div><span>RANKING</span><b>${rank.position?`${rank.position}º`:''}${rank.points?` • ${rank.points} PTS`:''}</b></div>`:''}</div>${metricsHtml(m,c.creditPlayer,c.code,c.latestSeat)}<div class="phSection">HISTÓRICO DE TORNEIOS</div>${c.events.length?c.events.map(e=>{const em=e.metrics,finish=e.classification?`${e.classification}º`:(e.player?.status==='active'?'ATIVO':'—');return`<div class="phEvent"><b>${esc(e.name)}</b><div class="phMeta">CLASSIFICAÇÃO: ${finish} • PREMIAÇÃO: ${money(em.prizes)} • RESULTADO LÍQUIDO: ${money(em.prizes+em.bountyValue-em.spent)}</div><div class="phMeta">CÓDIGO: ${esc(e.code||'—')} • MESA: ${esc(e.seat?.table??'—')} • POSIÇÃO: ${esc(e.seat?.seat??'—')}</div>${metricsHtml(em,0,e.code,e.seat).replace(/<div><span>CREDIT PLAYER<\/span><b>.*?<\/b><\/div>/,'')}${txTable(e.transactions)}</div>`}).join(''):'<div class="phEmpty">NENHUM TORNEIO REGISTRADO PARA ESTE JOGADOR.</div>'}<div class="phSection">CREDIT PLAYER</div><div class="phMeta">SALDO ATUAL: ${money(c.creditPlayer)}</div>${c.creditPlayerAccount?.movements?.length?`<div class="phTx">${c.creditPlayerAccount.movements.map(x=>`<div class="phTxRow"><span>${esc(x.kind||'MOVIMENTO')} • ${esc(x.reference||'')}</span><b>${money(x.valueBRL||0)}</b><small>${dt(x.createdAt)}</small></div>`).join('')}</div>`:'<div class="phEmpty">SEM MOVIMENTAÇÕES DE CREDIT PLAYER.</div>'}`}

  function addStyle(){
    if(document.getElementById('player-history-style'))return;
    const s=document.createElement('style');s.id='player-history-style';s.textContent=`
.phBtn{margin-top:8px;max-width:220px}.phDetail{display:none;margin-top:10px;padding-top:8px;border-top:1px solid #27342D}.phDetail.open{display:block}.phIdentity,.phSummary,.phMetrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:8px 0}.phIdentity>div,.phSummary>div,.phMetrics>div{min-height:44px;padding:9px 10px;border:1px solid #27342D;border-radius:9px;background:#060907}.phIdentity span,.phSummary span,.phMetrics span,.phMeta,.phTxRow small,.phEmpty{display:block;color:#AEB8B1;font-size:11px}.phIdentity b,.phMetrics b{display:block;margin-top:4px;font-size:12px}.phSummary b{display:block;margin-top:4px;font-size:15px}.phSection{color:#8DFC3B;letter-spacing:.12em;font-size:11px;font-weight:700;margin:14px 0 6px}.phEvent{padding:10px 0;border-bottom:1px solid #27342D}.phTx{margin-top:7px}.phTxRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;padding:6px 0;border-top:1px solid #182019}.phTxRow small{grid-column:1/-1}.phMeta{line-height:1.6;margin-top:3px}
#playerHistory.playerRegisteredStandard{display:block!important;width:100%!important;margin-top:8px!important}
#playerHistory.playerRegisteredStandard>.historyActions{display:none!important}
#playerRegisteredActions{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important;margin:0 0 8px!important}
#playerRegisteredActions button{width:100%!important;min-height:44px!important;margin:0!important}
#playerRegisteredActions button.active{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}
#playerRegisteredCount{display:flex!important;align-items:center!important;justify-content:space-between!important;width:100%!important;min-height:44px!important;margin:0 0 8px!important;padding:10px 12px!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important;color:#AEB8B1!important}
#playerRegisteredCount strong{color:#8DFC3B!important}
#playerHistory.playerRegisteredStandard #list{display:block!important;width:100%!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important}
#playerHistory.playerRegisteredStandard .historyRow{position:relative!important;display:block!important;width:100%!important;min-height:44px!important;height:auto!important;margin:0!important;padding:10px 2px 10px 42px!important;border:0!important;border-bottom:1px solid #27342D!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#fff!important}
#playerHistory.playerRegisteredStandard .historyRow::before{content:attr(data-player-list-index);position:absolute!important;left:2px!important;top:14px!important;min-width:30px!important;color:#8DFC3B!important}
#playerHistory.playerRegisteredStandard .historyRow:last-child{border-bottom:0!important}
#playerHistory.playerRegisteredStandard .historyInfo{display:block!important;width:100%!important;min-width:0!important}
#playerHistory.playerRegisteredStandard .historyInfo>b{display:block!important;width:100%!important;color:#fff!important;padding:0!important;margin:0!important;text-align:left!important}
#playerHistory.playerRegisteredStandard .historyInfo>.badge,#playerHistory.playerRegisteredStandard .historyInfo>.meta,#playerHistory.playerRegisteredStandard .phBtn,#playerHistory.playerRegisteredStandard .stackup-row-actions{display:none!important}
#playerHistory.playerRegisteredStandard .pick{display:none!important;position:absolute!important;left:2px!important;top:13px!important;width:18px!important;height:18px!important;min-width:18px!important;min-height:18px!important;margin:0!important;padding:0!important;appearance:none!important;-webkit-appearance:none!important;border:1px solid #8DFC3B!important;border-radius:4px!important;background:#060907!important;z-index:3!important}
#playerHistory.playerRegisteredStandard[data-player-action-mode] .pick{display:block!important}
#playerHistory.playerRegisteredStandard[data-player-action-mode] .historyRow{padding-left:68px!important;cursor:pointer!important}
#playerHistory.playerRegisteredStandard[data-player-action-mode] .historyRow::before{left:30px!important}
#playerHistory.playerRegisteredStandard .pick:checked{background:#8DFC3B!important;box-shadow:inset 0 0 0 4px #060907!important}
#playerHistory.playerRegisteredStandard .historyRow.player-detail-open{padding-left:42px!important}
#playerHistory.playerRegisteredStandard .historyRow.player-detail-open .phDetail{display:block!important;margin-top:10px!important;padding-top:8px!important}
#playerHistory.playerRegisteredStandard .historyRow:has(.inlineEditor){padding-left:2px!important}
#playerHistory.playerRegisteredStandard .historyRow:has(.inlineEditor)::before{display:none!important}
#playerHistory.playerRegisteredStandard .historyRow:has(.inlineEditor) .inlineEditor,#playerHistory.playerRegisteredStandard .historyRow:has(.inlineEditor) .inlineEditor .meta{display:block!important}
#playerRegisteredNotice{margin:8px 0!important;padding:10px 0!important;color:#AEB8B1!important;border-top:1px solid #27342D!important;border-bottom:1px solid #27342D!important}
@media(max-width:700px){.phIdentity,.phSummary,.phMetrics{grid-template-columns:1fr 1fr}#playerRegisteredActions{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:390px){#playerRegisteredActions{grid-template-columns:1fr!important}}
`;
    document.head.appendChild(s);
  }

  function registeredNotice(message){
    let n=document.getElementById('playerRegisteredNotice');
    const root=document.getElementById('playerHistory');
    if(!n){n=document.createElement('div');n.id='playerRegisteredNotice';n.setAttribute('role','status');root?.insertAdjacentElement('afterbegin',n)}
    n.textContent=message||'';
  }
  function registeredRows(){return [...document.querySelectorAll('#playerHistory #list > .historyRow')].filter(r=>!r.querySelector('.inlineEditor'))}
  function selectedRegisteredIds(){return [...document.querySelectorAll('#playerHistory #list > .historyRow .pick:checked')].map(x=>String(x.dataset.pick||'')) .filter(Boolean)}
  function clearRegisteredSelection(){document.querySelectorAll('#playerHistory .pick').forEach(x=>x.checked=false)}
  function setRegisteredMode(mode){
    const root=document.getElementById('playerHistory'),bar=document.getElementById('playerRegisteredActions');if(!root||!bar)return;
    root.dataset.playerActionMode=mode;clearRegisteredSelection();registeredNotice('');
    bar.querySelectorAll('[data-player-action]').forEach(b=>b.classList.toggle('active',b.dataset.playerAction===mode));
  }
  function resetRegisteredMode(){
    const root=document.getElementById('playerHistory'),bar=document.getElementById('playerRegisteredActions');
    if(root)delete root.dataset.playerActionMode;clearRegisteredSelection();bar?.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  }
  function openRegisteredHistory(id){
    const p=players.find(x=>String(x.id)===String(id)),row=document.querySelector(`#playerHistory [data-row="${CSS.escape(String(id))}"]`);if(!p||!row)return;
    document.querySelectorAll('#playerHistory .historyRow.player-detail-open').forEach(r=>{if(r!==row){r.classList.remove('player-detail-open');r.querySelector('.phDetail')?.classList.remove('open')}});
    let detail=row.querySelector('.phDetail');if(!detail){detail=document.createElement('div');detail.className='phDetail';row.querySelector('.historyInfo')?.appendChild(detail)}
    detail.innerHTML=detailHtml(p);detail.classList.add('open');row.classList.add('player-detail-open');
  }
  function executeRegisteredAction(){
    const root=document.getElementById('playerHistory'),mode=root?.dataset.playerActionMode||'',ids=selectedRegisteredIds();
    if(!mode){registeredNotice('SELECIONE EDITAR, APAGAR OU USAR PRIMEIRO.');return}
    if((mode==='edit'||mode==='use')&&ids.length!==1){registeredNotice('SELECIONE APENAS UM JOGADOR.');return}
    if(mode==='delete'&&!ids.length){registeredNotice('SELECIONE AO MENOS UM JOGADOR.');return}
    if(mode==='edit'){
      inlineEditingId=ids[0];resetRegisteredMode();render();document.querySelector(`[data-row="${CSS.escape(String(inlineEditingId))}"] [data-f="name"]`)?.focus();return;
    }
    if(mode==='delete'){
      players=players.filter(p=>!ids.includes(String(p.id)));if(ids.includes(String(inlineEditingId)))inlineEditingId='';persist();resetRegisteredMode();render();return;
    }
    if(mode==='use'){
      const id=ids[0];resetRegisteredMode();openRegisteredHistory(id);return;
    }
  }
  function bindRegisteredRows(){
    registeredRows().forEach((row,i)=>{
      row.dataset.playerListIndex=(i+1)+'.';
      const pick=row.querySelector('.pick');if(!pick)return;
      if(row.dataset.playerStandardBound==='1')return;row.dataset.playerStandardBound='1';
      row.addEventListener('click',e=>{
        const root=document.getElementById('playerHistory');if(!root?.dataset.playerActionMode||e.target.closest('button,input,select,a,.phDetail'))return;
        e.preventDefault();pick.checked=!pick.checked;
      });
      pick.addEventListener('click',e=>e.stopPropagation());
    });
  }
  function refreshRegisteredStandard(){
    const root=document.getElementById('playerHistory'),list=document.getElementById('list');if(!root||!list)return;
    const rows=[...list.children].filter(x=>x.classList?.contains('historyRow'));
    const sorted=rows.slice().sort((a,b)=>String(a.querySelector('.historyInfo>b')?.textContent||'').localeCompare(String(b.querySelector('.historyInfo>b')?.textContent||''),'pt-BR',{sensitivity:'base'}));
    if(sorted.some((r,i)=>r!==rows[i]))sorted.forEach(r=>list.appendChild(r));
    sorted.forEach((r,i)=>r.dataset.playerListIndex=(i+1)+'.');
    const count=document.querySelector('#playerRegisteredCount strong');if(count)count.textContent=String(sorted.length);
    document.querySelectorAll('#playerHistory .phBtn').forEach(b=>b.remove());
    bindRegisteredRows();
  }
  function installRegisteredStandard(){
    if(view!=='registered')return;
    addStyle();
    const root=document.getElementById('playerHistory'),list=document.getElementById('list');if(!root||!list)return;
    root.classList.add('playerRegisteredStandard');root.dataset.stackupDirectoryStandard='1';
    let bar=document.getElementById('playerRegisteredActions');
    if(!bar){
      bar=document.createElement('div');bar.id='playerRegisteredActions';bar.innerHTML='<button type="button" data-player-action="edit">EDITAR</button><button type="button" data-player-action="delete">APAGAR</button><button type="button" data-player-action="use">USAR</button><button type="button" data-player-action="confirm">CONFIRMAR</button>';
      root.insertBefore(bar,list);
      bar.querySelector('[data-player-action="edit"]').onclick=()=>setRegisteredMode('edit');
      bar.querySelector('[data-player-action="delete"]').onclick=()=>setRegisteredMode('delete');
      bar.querySelector('[data-player-action="use"]').onclick=()=>setRegisteredMode('use');
      bar.querySelector('[data-player-action="confirm"]').onclick=executeRegisteredAction;
    }
    let count=document.getElementById('playerRegisteredCount');
    if(!count){count=document.createElement('div');count.id='playerRegisteredCount';count.innerHTML='<span>QUANTIDADE DE JOGADORES</span><strong>0</strong>';bar.insertAdjacentElement('afterend',count)}
    document.querySelectorAll('#playerHistory .phBtn').forEach(b=>b.remove());
    refreshRegisteredStandard();
  }

  function enhance(){
    addStyle();
    if(view==='registered'){installRegisteredStandard();return}
    document.querySelectorAll('.historyRow [data-pick]').forEach(input=>{
      const row=input.closest('.historyRow'),info=row?.querySelector('.historyInfo'),d=players.find(p=>String(p.id)===String(input.dataset.pick));
      if(!info||!d||info.querySelector('.phBtn'))return;
      const btn=document.createElement('button');btn.type='button';btn.className='phBtn';btn.textContent='HISTÓRICO COMPLETO';
      const detail=document.createElement('div');detail.className='phDetail';
      btn.onclick=e=>{e.preventDefault();e.stopPropagation();detail.classList.toggle('open');if(detail.classList.contains('open'))detail.innerHTML=detailHtml(d)};
      info.append(btn,detail);
    });
  }
  function boot(){
    applyView();installRegisterSave();if(view==='register')return;
    if(typeof render!=='function'||typeof players==='undefined'||typeof state==='undefined'||typeof StackupWallet==='undefined'||typeof StackupPlayerProfile==='undefined')return setTimeout(boot,80);
    if(window.__stackupPlayerHistoryWrapped)return enhance();
    window.__stackupPlayerHistoryWrapped=true;
    const original=render;render=function(){original();enhance()};render();
  }
  boot();
})();