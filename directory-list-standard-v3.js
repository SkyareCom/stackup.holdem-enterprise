(()=>{
'use strict';
if(typeof document==='undefined'||window.__stackupDirectoryListStandardV3)return;
window.__stackupDirectoryListStandardV3=true;
const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const $=id=>document.getElementById(id);
const text=v=>String(v||'').replace(/\s+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function notice(message,trigger){
  if(window.StackupInlineFeedback?.show)return window.StackupInlineFeedback.show(message,{error:true,trigger});
  let n=document.querySelector('[data-stackup-directory-notice]');
  if(!n){n=document.createElement('div');n.dataset.stackupDirectoryNotice='1';(trigger?.closest?.('main')||document.querySelector('main')||document.body).appendChild(n)}
  n.textContent=message;
}
function style(){
  if($('stackup-directory-list-standard-v3'))return;
  const s=document.createElement('style');s.id='stackup-directory-list-standard-v3';s.textContent=`
:root{--stackup-line-gap:8px;--stackup-card-gap:12px;--stackup-section-gap:20px;--stackup-line-height:1.45}
html body{line-height:var(--stackup-line-height)!important}
html body :is(p,li,.meta,.desc,.description,.muted,.sub,.summary,.notice,.pending,.selectedInfo,.current){line-height:var(--stackup-line-height)!important}
html body :is(.grid,.grid2,.grid3,.filters,.checks,.actions,.cards,.items,.payGrid,.idGrid,.tables,.button-row,.btn-row,.controls,.toolbar,.structureMenu,.editorActions,.historyActions,.blindModeRow,.timeButtons,.valueGrid,.singleGrid){gap:8px!important}
html body :is(.section,.section-title,.itemTitle){margin-top:var(--stackup-section-gap)!important;margin-bottom:var(--stackup-line-gap)!important}
html body :is(.card,.panel,.module-card,.templateCard,.summary-card,.count-card)+:is(.card,.panel,.module-card,.templateCard,.summary-card,.count-card){margin-top:var(--stackup-card-gap)!important}
html body [data-stackup-directory-standard="1"]{width:100%!important;margin-top:8px!important}
html body .stackup-directory-toggle{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;min-height:44px!important;margin:8px 0 0!important}
html body .stackup-directory-panel{display:block!important;width:100%!important;margin-top:8px!important}
html body .stackup-directory-panel[hidden]{display:none!important}
html body .stackup-list-actions{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important;margin:0 0 8px!important}
html body .stackup-list-actions button{width:100%!important;min-height:44px!important;margin:0!important}
html body .stackup-list-actions button.active{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}
html body .stackup-list-count{display:flex!important;align-items:center!important;justify-content:space-between!important;width:100%!important;min-height:44px!important;margin:0 0 8px!important;padding:10px 12px!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important;color:#AEB8B1!important}
html body .stackup-list-count strong{color:#8DFC3B!important}
html body .stackup-simple-list{display:block!important;width:100%!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;gap:0!important}
html body .stackup-simple-list>:is(.historyRow,.listRow,.row,.templateCard,.tournamentChoice,.stackup-stage-choice,.historyItem){position:relative!important;display:block!important;width:100%!important;min-height:44px!important;height:auto!important;max-height:none!important;margin:0!important;padding:10px 2px 10px 42px!important;border:0!important;border-bottom:1px solid #27342D!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#fff!important;text-align:left!important}
html body .stackup-simple-list>:is(.historyRow,.listRow,.row,.templateCard,.tournamentChoice,.stackup-stage-choice,.historyItem)::before{content:attr(data-stackup-list-index);position:absolute!important;left:2px!important;top:50%!important;transform:translateY(-50%)!important;min-width:32px!important;color:#8DFC3B!important}
html body .stackup-simple-list>:last-child{border-bottom:0!important}
html body .stackup-simple-list .stackup-details,html body .stackup-simple-list .historyInfo>.meta,html body .stackup-simple-list .historyInfo>.badge,html body .stackup-simple-list .rowContent>.meta,html body .stackup-simple-list>.listRow>.meta,html body .stackup-simple-list .stackup-row-actions{display:none!important}
html body .stackup-simple-list .inlineEditor,html body .stackup-simple-list .inlineEditor .meta{display:block!important}
html body .stackup-simple-list .historyInfo,html body .stackup-simple-list .rowContent{min-width:0!important;width:100%!important}
html body .stackup-simple-list .stackup-compact-name{display:block!important;width:100%!important;padding:0!important;color:#fff!important;cursor:default!important}
html body .stackup-list-kind{color:#AEB8B1!important;margin-left:6px!important}
html body .stackup-directory-pick,html body [data-stackup-directory-standard="1"] .pick{display:none!important;position:absolute!important;left:2px!important;top:50%!important;transform:translateY(-50%)!important;width:18px!important;height:18px!important;min-width:18px!important;max-width:18px!important;min-height:18px!important;margin:0!important;padding:0!important;border:1px solid #8DFC3B!important;border-radius:4px!important;background:#060907!important;box-shadow:none!important;z-index:2!important}
html body [data-stackup-selection-mode] .stackup-directory-pick,html body [data-stackup-selection-mode] .pick{display:block!important}
html body [data-stackup-selection-mode] .stackup-simple-list>:is(.historyRow,.listRow,.row,.tournamentChoice,.stackup-stage-choice,.historyItem){padding-left:68px!important}
html body [data-stackup-selection-mode] .stackup-simple-list>:is(.historyRow,.listRow,.row,.tournamentChoice,.stackup-stage-choice,.historyItem)::before{left:30px!important}
html body [data-stackup-selection-mode] .stackup-directory-pick[data-picked="1"],html body [data-stackup-selection-mode] .pick:checked{background:#8DFC3B!important;box-shadow:inset 0 0 0 4px #060907!important}
html body #selectedActions[data-stackup-hidden-actions="1"]{display:none!important}
html body [data-stackup-directory-notice]{margin:8px 0!important;padding:10px 0!important;border-top:1px solid #27342D!important;border-bottom:1px solid #27342D!important;color:#AEB8B1!important}
@media(max-width:700px){html body .stackup-list-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:390px){html body .stackup-list-actions{grid-template-columns:minmax(0,1fr)!important}}
`;document.head.appendChild(s);
}
function directChildren(c,sel){return [...(c?.children||[])].filter(x=>x.matches?.(sel))}
function rowName(row){
  const el=row.querySelector?.('.historyInfo>b,.rowContent>b,.stackup-compact-name,.historyName,.name,b')||row;
  return text(el.textContent||row.textContent).replace(/^\d+\s*[.•-]\s*/,'');
}
function normalizeList(list,sel){
  if(!list)return[];
  const current=directChildren(list,sel);
  const rows=current.slice().sort((a,b)=>rowName(a).localeCompare(rowName(b),'pt-BR',{sensitivity:'base'}));
  rows.forEach((r,i)=>r.dataset.stackupListIndex=(i+1)+'.');
  if(rows.some((r,i)=>r!==current[i]))rows.forEach(r=>list.appendChild(r));
  return rows;
}
function countCard(panel,list,label,sel){
  let card=panel.querySelector(':scope > .stackup-list-count');
  if(!card){card=document.createElement('div');card.className='stackup-list-count';card.innerHTML=`<span>${label}</span><strong>0</strong>`;list.insertAdjacentElement('beforebegin',card)}
  const update=()=>{card.querySelector('strong').textContent=String(directChildren(list,sel).length)};update();return{card,update};
}
function clearSelection(root){
  root.querySelectorAll('.pick').forEach(x=>x.checked=false);
  root.querySelectorAll('.stackup-directory-pick').forEach(x=>{delete x.dataset.picked;x.setAttribute('aria-checked','false')});
}
function actionKey(b){return b?.dataset.stackupAction||b?.dataset.stackupDirAction||''}
function setMode(root,mode,buttons){root.dataset.stackupSelectionMode=mode;clearSelection(root);buttons.forEach(b=>b.classList.toggle('active',actionKey(b)===mode))}
function resetMode(root,buttons){delete root.dataset.stackupSelectionMode;clearSelection(root);buttons.forEach(b=>b.classList.remove('active'))}
function selectedIds(root){
  const ids=[...root.querySelectorAll('.pick:checked')].map(x=>x.dataset.pick||x.closest('[data-row]')?.dataset.row).filter(Boolean);
  root.querySelectorAll('.stackup-directory-pick[data-picked="1"]').forEach(x=>{const row=x.closest('[data-environment-row],[data-id],[data-row]');const id=x.dataset.id||row?.dataset.environmentRow||row?.dataset.id||row?.dataset.row;if(id)ids.push(id)});
  return [...new Set(ids.map(String))];
}
function square(row,id){
  let p=row.querySelector(':scope > .stackup-directory-pick');if(p)return p;
  p=document.createElement('span');p.className='stackup-directory-pick';p.dataset.id=String(id||'');p.setAttribute('role','checkbox');p.setAttribute('aria-checked','false');row.insertBefore(p,row.firstChild);return p;
}
function toggleSquare(p){const on=p.dataset.picked!=='1';if(on)p.dataset.picked='1';else delete p.dataset.picked;p.setAttribute('aria-checked',on?'true':'false')}
function panelToggle(button,panel,label){button.classList.add('stackup-directory-toggle');if(label)button.textContent=label;panel.classList.add('stackup-directory-panel');panel.hidden=true;button.onclick=e=>{e.preventDefault();e.stopPropagation();panel.hidden=!panel.hidden;button.classList.toggle('active',!panel.hidden)}}
function existingHistory(root,list,toolbar,toggle,label,buttonLabel){
  if(!root||!list||!toolbar||!toggle)return;
  root.dataset.stackupDirectoryStandard='1';root.classList.add('stackup-directory-panel');list.classList.add('stackup-simple-list');toolbar.classList.add('stackup-list-actions');
  toggle.classList.add('stackup-directory-toggle');if(buttonLabel)toggle.textContent=buttonLabel;
  if(!root.classList.contains('hidden'))root.classList.add('hidden');
  toggle.onclick=e=>{e.preventDefault();root.classList.toggle('hidden');toggle.classList.toggle('active',!root.classList.contains('hidden'))};
  if(toolbar.parentElement===root)root.insertBefore(toolbar,list);
  let confirm=toolbar.querySelector('[data-stackup-confirm-selection]');if(!confirm){confirm=document.createElement('button');confirm.type='button';confirm.textContent='CONFIRMAR';confirm.dataset.stackupConfirmSelection='1';toolbar.appendChild(confirm)}
  const edit=toolbar.querySelector('#editSelected,[data-edit-selected]'),del=toolbar.querySelector('#deleteSelected,[data-delete-selected]'),actions=[edit,del].filter(Boolean);actions.forEach(b=>{b.dataset.stackupDirAction=b===edit?'edit':'delete';b.addEventListener('click',e=>{if(b.dataset.stackupBypass==='1')return;e.preventDefault();e.stopImmediatePropagation();setMode(root,b.dataset.stackupDirAction,actions)},true)});
  confirm.onclick=e=>{e.preventDefault();const mode=root.dataset.stackupSelectionMode,ids=selectedIds(root);if(!mode)return notice('SELECIONE EDITAR OU APAGAR PRIMEIRO.',confirm);if(mode==='edit'&&ids.length!==1)return notice('SELECIONE APENAS UM REGISTRO PARA EDITAR.',confirm);if(mode==='delete'&&!ids.length)return notice('SELECIONE AO MENOS UM REGISTRO.',confirm);const target=mode==='edit'?edit:del;target.dataset.stackupBypass='1';target.click();delete target.dataset.stackupBypass;setTimeout(()=>resetMode(root,actions),0)};
  const counter=countCard(root,list,label,'.historyRow,.listRow,.row');
  const refresh=()=>{normalizeList(list,'.historyRow,.listRow,.row');counter.update()};refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true});
}
function players(){existingHistory($('playerHistory'),$('list'),$('playerHistory')?.querySelector('.historyActions'),$('historyBtn'),'QUANTIDADE DE JOGADORES','JOGADORES CADASTRADOS')}
function staff(){
  const root=$('staffHistory'),list=$('list'),bar=root?.querySelector('.historyActions');if(!root||!list||!bar)return;
  let toggle=$('stackup-staff-directory-toggle');if(!toggle){toggle=document.createElement('button');toggle.id='stackup-staff-directory-toggle';toggle.type='button';root.insertAdjacentElement('beforebegin',toggle)}
  existingHistory(root,list,bar,toggle,'QUANTIDADE DE STAFF','STAFF CADASTRADOS');
}
function environments(){
  const list=$('environmentList');if(!list)return;
  let panel=$('stackup-environment-directory-panel');if(!panel){panel=document.createElement('div');panel.id='stackup-environment-directory-panel';panel.dataset.stackupDirectoryStandard='1';list.insertAdjacentElement('beforebegin',panel);panel.appendChild(list)}
  list.classList.add('stackup-simple-list');
  let toggle=$('stackup-environment-directory-toggle');if(!toggle){toggle=document.createElement('button');toggle.id='stackup-environment-directory-toggle';toggle.type='button';panel.insertAdjacentElement('beforebegin',toggle)}panelToggle(toggle,panel,'AMBIENTES');
  let bar=panel.querySelector(':scope > .stackup-list-actions');if(!bar){bar=document.createElement('div');bar.className='stackup-list-actions';bar.innerHTML='<button type="button" data-stackup-action="edit">EDITAR</button><button type="button" data-stackup-action="delete">APAGAR</button><button type="button" data-stackup-action="use">USAR</button><button type="button" data-stackup-action="confirm">CONFIRMAR</button>';panel.insertBefore(bar,list)}
  const buttons=[...bar.querySelectorAll('[data-stackup-action]')];buttons.filter(b=>actionKey(b)!=='confirm').forEach(b=>b.onclick=()=>setMode(panel,actionKey(b),buttons));
  bar.querySelector('[data-stackup-action="confirm"]').onclick=()=>{const mode=panel.dataset.stackupSelectionMode,ids=selectedIds(panel);if(!mode)return notice('SELECIONE EDITAR, APAGAR OU USAR PRIMEIRO.',bar);if(ids.length!==1)return notice('SELECIONE APENAS UM AMBIENTE.',bar);const row=list.querySelector(`[data-environment-row="${CSS.escape(ids[0])}"]`);const target=mode==='edit'?row?.querySelector('[data-stackup-edit]'):mode==='delete'?row?.querySelector('[data-stackup-delete]'):row?.querySelector('[data-stackup-fix]');resetMode(panel,buttons);target?.click()};
  list.addEventListener('click',e=>{if(!panel.dataset.stackupSelectionMode)return;const row=e.target.closest('[data-environment-row]');if(!row)return;e.preventDefault();e.stopImmediatePropagation();toggleSquare(square(row,row.dataset.environmentRow))},true);
  const counter=countCard(panel,list,'QUANTIDADE DE AMBIENTES','[data-environment-row]');
  const refresh=()=>{const rows=normalizeList(list,'[data-environment-row]');rows.forEach(row=>{square(row,row.dataset.environmentRow);const n=row.querySelector('.stackup-compact-name');const m=row.querySelector('.stackup-details .meta');if(n&&m&&!n.querySelector('.stackup-list-kind')){const k=document.createElement('span');k.className='stackup-list-kind';k.textContent='• '+text(m.textContent);n.appendChild(k)}});counter.update()};refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true});
}
function stageData(){
  try{return(state.savedTournaments||[]).map(t=>{const d=t?.data||{};return{id:String(t.id||t.eventId||''),stage:String(d.stageName||t.stageName||'ETAPA ÚNICA'),tournament:String(t.name||t.tournamentName||d.tournamentName||'TORNEIO')}}).filter(x=>x.id).sort((a,b)=>a.stage.localeCompare(b.stage,'pt-BR',{sensitivity:'base'})||a.tournament.localeCompare(b.tournament,'pt-BR',{sensitivity:'base'}))}catch(_){return[]}
}
function tournaments(){
  const list=$('tournamentList'),toggle=$('chooseTournament'),nativeActions=$('selectedActions'),nativeConfirm=$('confirmAction');if(!list||!toggle||!nativeActions||!nativeConfirm)return;
  nativeActions.dataset.stackupHiddenActions='1';const root=list.closest('.selectorRow')||list.parentElement;root.dataset.stackupDirectoryStandard='1';
  let panel=$('stackup-tournament-directory-panel');if(!panel){panel=document.createElement('div');panel.id='stackup-tournament-directory-panel';panel.dataset.stackupDirectoryStandard='1';list.insertAdjacentElement('beforebegin',panel);panel.appendChild(list)}
  list.classList.add('stackup-simple-list');panelToggle(toggle,panel,'TORNEIOS');
  let bar=panel.querySelector(':scope > .stackup-list-actions');if(!bar){bar=document.createElement('div');bar.className='stackup-list-actions';bar.innerHTML='<button type="button" data-stackup-action="edit">EDITAR</button><button type="button" data-stackup-action="delete">APAGAR</button><button type="button" data-stackup-action="use">USAR</button><button type="button" data-stackup-action="confirm">CONFIRMAR</button>';panel.insertBefore(bar,list)}
  const buttons=[...bar.querySelectorAll('[data-stackup-action]')],counter=countCard(panel,list,'QUANTIDADE DE TORNEIOS','.tournamentChoice');buttons.filter(b=>actionKey(b)!=='confirm').forEach(b=>b.onclick=()=>setMode(panel,actionKey(b),buttons));
  let bypass=false;list.addEventListener('click',e=>{const row=e.target.closest('.tournamentChoice');if(!row||bypass||!panel.dataset.stackupSelectionMode)return;e.preventDefault();e.stopImmediatePropagation();toggleSquare(square(row,row.dataset.id))},true);
  const run=(id,mode)=>{const row=list.querySelector(`.tournamentChoice[data-id="${CSS.escape(String(id))}"]`);const map={edit:'edit',delete:'delete',use:'activate'};const native=nativeActions.querySelector(`[data-action="${map[mode]}"]`);if(!row||!native)return;resetMode(panel,buttons);bypass=true;row.click();bypass=false;setTimeout(()=>{native.click();setTimeout(()=>nativeConfirm.click(),0)},0)};
  bar.querySelector('[data-stackup-action="confirm"]').onclick=()=>{const mode=panel.dataset.stackupSelectionMode,ids=selectedIds(panel);if(!mode)return notice('SELECIONE EDITAR, APAGAR OU USAR PRIMEIRO.',bar);if(ids.length!==1)return notice('SELECIONE APENAS UM TORNEIO.',bar);run(ids[0],mode)};
  const refresh=()=>{const rows=normalizeList(list,'.tournamentChoice');rows.forEach(r=>square(r,r.dataset.id));counter.update()};refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true});
  let stageToggle=$('stackup-stage-directory-toggle');if(!stageToggle){stageToggle=document.createElement('button');stageToggle.id='stackup-stage-directory-toggle';stageToggle.type='button';root.appendChild(stageToggle)}
  let stagePanel=$('stackup-stage-directory-panel');if(!stagePanel){stagePanel=document.createElement('div');stagePanel.id='stackup-stage-directory-panel';stagePanel.dataset.stackupDirectoryStandard='1';stagePanel.innerHTML='<div class="stackup-list-actions"><button type="button" data-stackup-action="edit">EDITAR</button><button type="button" data-stackup-action="delete">APAGAR</button><button type="button" data-stackup-action="use">USAR</button><button type="button" data-stackup-action="confirm">CONFIRMAR</button></div><div class="stackup-list-count"><span>QUANTIDADE DE ETAPAS</span><strong>0</strong></div><div class="stackup-stage-list stackup-simple-list"></div>';root.appendChild(stagePanel)}panelToggle(stageToggle,stagePanel,'ETAPAS');
  const stageButtons=[...stagePanel.querySelectorAll('[data-stackup-action]')],host=stagePanel.querySelector('.stackup-stage-list');stageButtons.filter(b=>actionKey(b)!=='confirm').forEach(b=>b.onclick=()=>setMode(stagePanel,actionKey(b),stageButtons));
  host.addEventListener('click',e=>{if(!stagePanel.dataset.stackupSelectionMode)return;const row=e.target.closest('.stackup-stage-choice');if(!row)return;toggleSquare(square(row,row.dataset.id))});
  stageButtons.find(b=>actionKey(b)==='confirm').onclick=()=>{const mode=stagePanel.dataset.stackupSelectionMode,ids=selectedIds(stagePanel);if(!mode)return notice('SELECIONE EDITAR, APAGAR OU USAR PRIMEIRO.',stagePanel);if(ids.length!==1)return notice('SELECIONE APENAS UMA ETAPA.',stagePanel);resetMode(stagePanel,stageButtons);run(ids[0],mode)};
  const renderStages=()=>{const arr=stageData();host.innerHTML=arr.map((x,i)=>`<div class="stackup-stage-choice" data-id="${esc(x.id)}" data-stackup-list-index="${i+1}."><span>${esc(x.stage)} • ${esc(x.tournament)}</span></div>`).join('');[...host.children].forEach(r=>square(r,r.dataset.id));stagePanel.querySelector('.stackup-list-count strong').textContent=String(arr.length)};
  const old=stageToggle.onclick;stageToggle.onclick=e=>{old?.call(stageToggle,e);if(!stagePanel.hidden)renderStages()};
}
function ready(){
  const list=$('readyList');if(!list)return;list.dataset.stackupDirectoryStandard='1';list.classList.add('stackup-simple-list');let card=list.previousElementSibling?.classList?.contains('stackup-list-count')?list.previousElementSibling:null;if(!card){card=document.createElement('div');card.className='stackup-list-count';card.innerHTML='<span>QUANTIDADE DE TORNEIOS</span><strong>0</strong>';list.insertAdjacentElement('beforebegin',card)}const refresh=()=>{const rows=normalizeList(list,'.templateCard');card.querySelector('strong').textContent=String(rows.length)};refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true});
}
function structures(){
  if(page!=='setup.html')return;const list=$('historyList'),root=$('structureHistory');if(!list||!root)return;root.dataset.stackupDirectoryStandard='1';list.classList.add('stackup-simple-list');const c=countCard(root,list,'QUANTIDADE DE ESTRUTURAS','.historyItem');const refresh=()=>{normalizeList(list,'.historyItem');c.update()};refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true});
}
function boot(){style();if(page==='players-directory.html')players();if(page==='staff.html')staff();if(page==='environment-registered.html')environments();if(page==='tournament-manager.html')tournaments();if(page==='ready-tournaments.html')ready();if(page==='setup.html')structures()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();