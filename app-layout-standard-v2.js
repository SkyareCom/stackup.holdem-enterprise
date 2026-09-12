(()=>{
'use strict';
if(typeof document==='undefined'||window.__stackupLayoutStandardV2)return;
window.__stackupLayoutStandardV2=true;

const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const protectedPages=new Set(['index.html','login.html','cast-10px.html','cast-v2.html','cast-ft-live.html','tv.html','tv-connect.html','dealer-access.html']);
if(protectedPages.has(page))return;

const $=id=>document.getElementById(id);
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleUpperCase('pt-BR');
const text=v=>String(v||'').replace(/\s+/g,' ').trim();
const feedback=(message,trigger,error=true)=>{
  if(window.StackupInlineFeedback?.show)return window.StackupInlineFeedback.show(message,{error,trigger});
  let box=document.querySelector('[data-stackup-layout-notice]');
  if(!box){box=document.createElement('div');box.dataset.stackupLayoutNotice='1';(trigger?.closest?.('main')||document.querySelector('main')||document.body).appendChild(box)}
  box.textContent=message;
};

function installStyle(){
  if($('stackup-layout-standard-v2'))return;
  const style=document.createElement('style');
  style.id='stackup-layout-standard-v2';
  style.textContent=`
:root{--stackup-line-gap:8px;--stackup-control-gap:8px;--stackup-card-gap:12px;--stackup-section-gap:20px;--stackup-line-height:1.45}
html body{line-height:var(--stackup-line-height)!important}
html body :is(p,li,.meta,.desc,.description,.muted,.sub,.summary,.notice,.pending,.selectedInfo,.current){line-height:var(--stackup-line-height)!important}
html body :is(.grid,.grid2,.grid3,.filters,.checks,.actions,.cards,.items,.payGrid,.idGrid,.tables,.button-row,.btn-row,.controls,.toolbar,.structureMenu,.editorActions,.historyActions,.blindModeRow,.timeButtons,.valueGrid,.singleGrid){gap:var(--stackup-control-gap)!important}
html body :is(.section,.section-title,.itemTitle){margin-top:var(--stackup-section-gap)!important;margin-bottom:var(--stackup-line-gap)!important}
html body :is(.card,.panel,.module-card,.templateCard,.summary-card,.count-card)+:is(.card,.panel,.module-card,.templateCard,.summary-card,.count-card){margin-top:var(--stackup-card-gap)!important}
html body :is(h1,.page-title,.hero-title,.display-title){line-height:1.18!important;margin-bottom:12px!important}
html body :is(h2,.title,.card-title){line-height:1.22!important}
html body :is(h3,.section,.section-title,.subtitle){line-height:1.3!important}
html body [data-stackup-layout-notice]{margin:8px 0!important;padding:10px 0!important;color:#AEB8B1!important;border-top:1px solid #27342D!important;border-bottom:1px solid #27342D!important}

html body [data-stackup-directory-standard="1"]{width:100%!important;margin-top:8px!important}
html body .stackup-directory-toggle{width:100%!important;margin:8px 0 0!important}
html body .stackup-directory-panel[hidden]{display:none!important}
html body .stackup-directory-panel{width:100%!important;margin-top:8px!important}
html body .stackup-list-actions{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important;margin:0 0 8px!important}
html body .stackup-list-actions button{width:100%!important;margin:0!important}
html body .stackup-list-actions button.active{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}
html body .stackup-list-count{display:flex!important;align-items:center!important;justify-content:space-between!important;width:100%!important;min-height:44px!important;margin:0 0 8px!important;padding:10px 12px!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important;color:#AEB8B1!important}
html body .stackup-list-count strong{color:#8DFC3B!important}
html body .stackup-simple-list{display:block!important;width:100%!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important}
html body .stackup-simple-list>.historyRow,
html body .stackup-simple-list>.listRow,
html body .stackup-simple-list>.row,
html body .stackup-simple-list>.templateCard,
html body .stackup-simple-list>.tournamentChoice,
html body .stackup-simple-list>.stackup-stage-choice{position:relative!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;align-items:center!important;width:100%!important;min-height:44px!important;height:auto!important;max-height:none!important;margin:0!important;padding:10px 2px!important;border:0!important;border-bottom:1px solid #27342D!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#fff!important;text-align:left!important}
html body .stackup-simple-list>:last-child{border-bottom:0!important}
html body .stackup-simple-list .stackup-list-label{display:flex!important;align-items:center!important;gap:8px!important;min-width:0!important;color:#fff!important}
html body .stackup-list-number{flex:0 0 auto!important;min-width:28px!important;color:#8DFC3B!important}
html body .stackup-simple-list .stackup-details,
html body .stackup-simple-list .historyInfo>.meta,
html body .stackup-simple-list .historyInfo>.badge,
html body .stackup-simple-list .rowContent>.meta,
html body .stackup-simple-list>.listRow>.meta,
html body .stackup-simple-list .stackup-row-actions{display:none!important}
html body .stackup-simple-list .inlineEditor,
html body .stackup-simple-list .inlineEditor .meta{display:block!important}
html body .stackup-simple-list .historyInfo,
html body .stackup-simple-list .rowContent{min-width:0!important;width:100%!important}
html body .stackup-simple-list .stackup-compact-name{padding:0!important;color:#fff!important;cursor:default!important}
html body .stackup-directory-pick,
html body [data-stackup-directory-standard="1"] .pick{display:none!important;appearance:none!important;-webkit-appearance:none!important;width:18px!important;height:18px!important;min-width:18px!important;max-width:18px!important;margin:0!important;padding:0!important;border:1px solid #8DFC3B!important;border-radius:4px!important;background:#060907!important;box-shadow:none!important}
html body [data-stackup-selection-mode] .stackup-directory-pick,
html body [data-stackup-selection-mode] .pick{display:block!important}
html body [data-stackup-selection-mode] .stackup-simple-list>.historyRow,
html body [data-stackup-selection-mode] .stackup-simple-list>.listRow,
html body [data-stackup-selection-mode] .stackup-simple-list>.row,
html body [data-stackup-selection-mode] .stackup-simple-list>.tournamentChoice,
html body [data-stackup-selection-mode] .stackup-simple-list>.stackup-stage-choice{grid-template-columns:22px minmax(0,1fr)!important;gap:8px!important}
html body [data-stackup-selection-mode] :is(.stackup-directory-pick,.pick):checked{background:#8DFC3B!important;box-shadow:inset 0 0 0 4px #060907!important}
html body .stackup-stage-list{display:block!important;margin-top:8px!important}
html body .stackup-stage-choice{cursor:pointer!important}
@media(max-width:700px){html body .stackup-list-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:390px){html body .stackup-list-actions{grid-template-columns:minmax(0,1fr)!important}}
`;
  (document.head||document.documentElement).appendChild(style);
}

function directChildren(container,selector){return [...(container?.children||[])].filter(el=>el.matches?.(selector))}
function rawName(row){
  if(row.dataset.stackupSortName)return row.dataset.stackupSortName;
  const el=row.querySelector?.('.historyInfo>b,.rowContent>b,.stackup-compact-name,.name,b')||row;
  const value=text(el?.textContent||row.textContent).replace(/^\d+\s*[.•-]\s*/,'');
  row.dataset.stackupSortName=value;
  return value;
}
function labelElement(row){return row.querySelector?.('.historyInfo>b,.rowContent>b,.stackup-compact-name,.name,b')||row}
function numbered(row,index){
  const label=labelElement(row);if(!label)return;
  let host=label.querySelector?.(':scope > .stackup-list-label');
  if(host)return host.querySelector('.stackup-list-number').textContent=String(index).padStart(2,'0')+' •';
  if(label===row&&row.matches('button')){
    const original=text(row.textContent);row.textContent='';host=document.createElement('span');host.className='stackup-list-label';const n=document.createElement('span');n.className='stackup-list-number';n.textContent=String(index).padStart(2,'0')+' •';const t=document.createElement('span');t.textContent=original;host.append(n,t);row.appendChild(host);return;
  }
  const original=[...label.childNodes];host=document.createElement('span');host.className='stackup-list-label';const n=document.createElement('span');n.className='stackup-list-number';n.textContent=String(index).padStart(2,'0')+' •';const body=document.createElement('span');original.forEach(node=>body.appendChild(node));host.append(n,body);label.appendChild(host);
}
function sortAndNumber(container,selector){
  if(!container)return [];
  const rows=directChildren(container,selector).sort((a,b)=>rawName(a).localeCompare(rawName(b),'pt-BR',{sensitivity:'base'}));
  rows.forEach((row,i)=>{container.appendChild(row);numbered(row,i+1)});
  return rows;
}
function ensureCount(panel,list,label,selector){
  if(!panel||!list)return null;
  let card=panel.querySelector(':scope > .stackup-list-count');
  if(!card){card=document.createElement('div');card.className='stackup-list-count';card.innerHTML=`<span>${label}</span><strong>0</strong>`;list.insertAdjacentElement('beforebegin',card)}
  const update=()=>{const count=directChildren(list,selector).length;const strong=card.querySelector('strong');if(strong)strong.textContent=String(count)};
  update();return {card,update};
}
function clearChecks(root){root?.querySelectorAll?.('.pick,.stackup-directory-pick').forEach(x=>{x.checked=false})}
function setMode(root,mode,buttons=[]){
  if(!root)return;root.dataset.stackupSelectionMode=mode;clearChecks(root);buttons.forEach(b=>b.classList.toggle('active',b.dataset.stackupDirAction===mode||b.dataset.stackupAction===mode));
}
function resetMode(root,buttons=[]){if(!root)return;delete root.dataset.stackupSelectionMode;clearChecks(root);buttons.forEach(b=>b.classList.remove('active'))}
function selectionIds(root){return [...(root?.querySelectorAll?.('.pick:checked,.stackup-directory-pick:checked')||[])].map(x=>x.dataset.pick||x.dataset.id||x.closest('[data-row],[data-environment-row],[data-id]')?.dataset.row||x.closest('[data-environment-row]')?.dataset.environmentRow||x.closest('[data-id]')?.dataset.id).filter(Boolean)}

function adaptExistingHistory({root,list,toolbar,countLabel,toggle}){
  if(!root||!list||!toolbar)return;
  root.dataset.stackupDirectoryStandard='1';list.classList.add('stackup-simple-list');toolbar.classList.add('stackup-list-actions');
  if(toggle)toggle.classList.add('stackup-directory-toggle');
  if(toolbar.parentElement===root&&toolbar.nextElementSibling!==list)root.insertBefore(toolbar,list);
  let confirm=toolbar.querySelector('[data-stackup-confirm-selection]');
  if(!confirm){confirm=document.createElement('button');confirm.type='button';confirm.textContent='CONFIRMAR';confirm.dataset.stackupConfirmSelection='1';toolbar.appendChild(confirm)}
  const edit=toolbar.querySelector('#editSelected,[data-edit-selected]'),del=toolbar.querySelector('#deleteSelected,[data-delete-selected]');
  const actions=[edit,del].filter(Boolean);
  actions.forEach(btn=>{btn.dataset.stackupDirAction=btn===edit?'edit':'delete';btn.addEventListener('click',e=>{if(btn.dataset.stackupBypass==='1')return;e.preventDefault();e.stopImmediatePropagation();setMode(root,btn.dataset.stackupDirAction,actions)},true)});
  confirm.addEventListener('click',e=>{e.preventDefault();const mode=root.dataset.stackupSelectionMode,ids=selectionIds(root);if(!mode)return feedback('SELECIONE EDITAR OU APAGAR PRIMEIRO.',confirm,true);if(mode==='edit'&&ids.length!==1)return feedback('SELECIONE APENAS UM REGISTRO PARA EDITAR.',confirm,true);if(mode==='delete'&&!ids.length)return feedback('SELECIONE AO MENOS UM REGISTRO.',confirm,true);const target=mode==='edit'?edit:del;if(!target)return;target.dataset.stackupBypass='1';target.click();delete target.dataset.stackupBypass;setTimeout(()=>resetMode(root,actions),0)});
  const counter=ensureCount(root,list,countLabel,'.historyRow,.listRow,.row');
  const refresh=()=>{sortAndNumber(list,'.historyRow,.listRow,.row');counter?.update()};
  refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true,subtree:false});
}

function adaptPlayers(){
  const root=$('playerHistory'),list=$('list'),toolbar=root?.querySelector('.historyActions'),toggle=$('historyBtn');
  if(!root||!list||!toolbar)return;adaptExistingHistory({root,list,toolbar,countLabel:'QUANTIDADE DE JOGADORES',toggle});
}
function adaptStaff(){
  const root=$('staffHistory'),list=$('list'),toolbar=root?.querySelector('.historyActions');if(!root||!list||!toolbar)return;
  let toggle=$('stackup-staff-directory-toggle');if(!toggle){toggle=document.createElement('button');toggle.id='stackup-staff-directory-toggle';toggle.type='button';toggle.className='stackup-directory-toggle';toggle.textContent='STAFF CADASTRADOS';root.insertAdjacentElement('beforebegin',toggle);toggle.onclick=()=>root.classList.toggle('hidden')}
  adaptExistingHistory({root,list,toolbar,countLabel:'QUANTIDADE DE STAFF',toggle});
}

function adaptEnvironment(){
  const list=$('environmentList');if(!list)return;
  let panel=$('stackup-environment-directory-panel');
  if(!panel){panel=document.createElement('div');panel.id='stackup-environment-directory-panel';panel.className='stackup-directory-panel';panel.dataset.stackupDirectoryStandard='1';panel.hidden=true;list.insertAdjacentElement('beforebegin',panel);panel.appendChild(list)}
  list.classList.add('stackup-simple-list');
  let toggle=$('stackup-environment-directory-toggle');
  if(!toggle){toggle=document.createElement('button');toggle.id='stackup-environment-directory-toggle';toggle.type='button';toggle.className='stackup-directory-toggle';toggle.textContent='AMBIENTES';panel.insertAdjacentElement('beforebegin',toggle);toggle.onclick=()=>{panel.hidden=!panel.hidden;toggle.classList.toggle('active',!panel.hidden)}}
  let toolbar=panel.querySelector(':scope > .stackup-list-actions');
  if(!toolbar){toolbar=document.createElement('div');toolbar.className='stackup-list-actions';toolbar.innerHTML='<button type="button" data-stackup-action="edit">EDITAR</button><button type="button" data-stackup-action="delete">APAGAR</button><button type="button" data-stackup-action="use">USAR</button><button type="button" data-stackup-action="confirm">CONFIRMAR</button>';panel.insertBefore(toolbar,list)}
  const actionButtons=[...toolbar.querySelectorAll('[data-stackup-action]')];
  actionButtons.filter(b=>b.dataset.stackupAction!=='confirm').forEach(btn=>btn.onclick=()=>setMode(panel,btn.dataset.stackupAction,actionButtons));
  toolbar.querySelector('[data-stackup-action="confirm"]').onclick=()=>{const mode=panel.dataset.stackupSelectionMode,ids=selectionIds(panel);if(!mode)return feedback('SELECIONE EDITAR, APAGAR OU USAR PRIMEIRO.',toolbar,true);if(ids.length!==1)return feedback('SELECIONE APENAS UM AMBIENTE.',toolbar,true);const row=list.querySelector(`[data-environment-row="${CSS.escape(String(ids[0]))}"]`);if(!row)return;const target=mode==='edit'?row.querySelector('[data-stackup-edit]'):mode==='delete'?row.querySelector('[data-stackup-delete]'):row.querySelector('[data-stackup-fix]');resetMode(panel,actionButtons);target?.click()};
  list.addEventListener('click',e=>{const row=e.target.closest('[data-environment-row]');if(!row)return;if(e.target.closest('.stackup-row-actions'))return;e.preventDefault();e.stopImmediatePropagation();const pick=row.querySelector('.stackup-directory-pick');if(panel.dataset.stackupSelectionMode&&pick)pick.checked=!pick.checked},true);
  const counter=ensureCount(panel,list,'QUANTIDADE DE AMBIENTES','[data-environment-row]');
  const refresh=()=>{const rows=sortAndNumber(list,'[data-environment-row]');rows.forEach(row=>{if(!row.querySelector(':scope > .stackup-directory-pick')){const pick=document.createElement('input');pick.type='checkbox';pick.className='stackup-directory-pick';pick.dataset.id=row.dataset.environmentRow;row.insertBefore(pick,row.firstChild)}});counter?.update()};
  refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true,subtree:false});
}

function tournamentChoiceRefresh(list,counter){
  const rows=sortAndNumber(list,'.tournamentChoice');rows.forEach(row=>{if(!row.querySelector(':scope > .stackup-directory-pick')){const pick=document.createElement('input');pick.type='checkbox';pick.className='stackup-directory-pick';pick.dataset.id=row.dataset.id;row.insertBefore(pick,row.firstChild)}});counter?.update();
}
function stageRecords(){
  try{return (state.savedTournaments||[]).map(t=>{const d=t?.data||{};return{id:String(t.id||t.eventId||''),name:String(d.stageName||t.stageName||'ETAPA ÚNICA'),tournament:String(t.name||t.tournamentName||d.tournamentName||'TORNEIO')}}).filter(x=>x.id).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base'})||a.tournament.localeCompare(b.tournament,'pt-BR',{sensitivity:'base'}))}catch(_){return[]}
}
function adaptTournamentManager(){
  const list=$('tournamentList'),choose=$('chooseTournament'),selectedActions=$('selectedActions'),confirmOriginal=$('confirmAction');if(!list||!choose||!selectedActions||!confirmOriginal)return;
  const root=list.closest('.selectorRow')||list.parentElement;root.dataset.stackupDirectoryStandard='1';list.classList.add('stackup-simple-list');choose.textContent='TORNEIOS';choose.classList.add('stackup-directory-toggle');
  selectedActions.style.pointerEvents='auto';selectedActions.style.opacity='1';
  const originalActions=[...selectedActions.querySelectorAll('[data-action]')];const activate=selectedActions.querySelector('[data-action="activate"]');if(activate)activate.textContent='USAR';
  let toolbar=$('stackup-tournament-list-actions');if(!toolbar){toolbar=document.createElement('div');toolbar.id='stackup-tournament-list-actions';toolbar.className='stackup-list-actions';toolbar.innerHTML='<button type="button" data-stackup-action="edit">EDITAR</button><button type="button" data-stackup-action="delete">APAGAR</button><button type="button" data-stackup-action="activate">USAR</button><button type="button" data-stackup-action="confirm">CONFIRMAR</button>';list.insertAdjacentElement('beforebegin',toolbar)}
  const buttons=[...toolbar.querySelectorAll('[data-stackup-action]')];buttons.filter(b=>b.dataset.stackupAction!=='confirm').forEach(b=>b.onclick=()=>{setMode(root,b.dataset.stackupAction,buttons);list.classList.add('open')});
  const counter=ensureCount(root,list,'QUANTIDADE DE TORNEIOS','.tournamentChoice');
  let bypassChoice=false;
  list.addEventListener('click',e=>{const row=e.target.closest('.tournamentChoice');if(!row||bypassChoice)return;if(!root.dataset.stackupSelectionMode)return;e.preventDefault();e.stopImmediatePropagation();const pick=row.querySelector('.stackup-directory-pick');if(pick)pick.checked=!pick.checked},true);
  toolbar.querySelector('[data-stackup-action="confirm"]').onclick=()=>{const mode=root.dataset.stackupSelectionMode,ids=selectionIds(root);if(!mode)return feedback('SELECIONE EDITAR, APAGAR OU USAR PRIMEIRO.',toolbar,true);if(ids.length!==1)return feedback('SELECIONE APENAS UM TORNEIO.',toolbar,true);const choice=list.querySelector(`.tournamentChoice[data-id="${CSS.escape(String(ids[0]))}"]`);if(!choice)return;const actual=selectedActions.querySelector(`[data-action="${CSS.escape(mode)}"]`);if(!actual)return;bypassChoice=true;choice.click();bypassChoice=false;setTimeout(()=>{actual.click();setTimeout(()=>confirmOriginal.click(),0)},0);resetMode(root,buttons)};
  const refresh=()=>tournamentChoiceRefresh(list,counter);refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true,subtree:false});

  let stageToggle=$('stackup-stage-directory-toggle');if(!stageToggle){stageToggle=document.createElement('button');stageToggle.id='stackup-stage-directory-toggle';stageToggle.type='button';stageToggle.className='stackup-directory-toggle';stageToggle.textContent='ETAPAS';root.appendChild(stageToggle)}
  let stagePanel=$('stackup-stage-directory-panel');if(!stagePanel){stagePanel=document.createElement('div');stagePanel.id='stackup-stage-directory-panel';stagePanel.className='stackup-directory-panel';stagePanel.dataset.stackupDirectoryStandard='1';stagePanel.hidden=true;stagePanel.innerHTML='<div class="stackup-list-count"><span>QUANTIDADE DE ETAPAS</span><strong>0</strong></div><div class="stackup-stage-list stackup-simple-list"></div>';root.appendChild(stagePanel)}
  const renderStages=()=>{const arr=stageRecords(),host=stagePanel.querySelector('.stackup-stage-list');host.innerHTML=arr.map(x=>`<button type="button" class="stackup-stage-choice" data-id="${x.id.replace(/"/g,'&quot;')}"><span class="stackup-list-label"><span class="stackup-list-number"></span><span>${x.name} • ${x.tournament}</span></span></button>`).join('');[...host.children].forEach((r,i)=>{r.querySelector('.stackup-list-number').textContent=String(i+1).padStart(2,'0')+' •'});stagePanel.querySelector('.stackup-list-count strong').textContent=String(arr.length)};
  stageToggle.onclick=()=>{stagePanel.hidden=!stagePanel.hidden;stageToggle.classList.toggle('active',!stagePanel.hidden);if(!stagePanel.hidden)renderStages()};
}

function adaptReady(){
  const list=$('readyList');if(!list)return;list.dataset.stackupDirectoryStandard='1';list.classList.add('stackup-simple-list');let counter=list.previousElementSibling?.classList?.contains('stackup-list-count')?list.previousElementSibling:null;if(!counter){counter=document.createElement('div');counter.className='stackup-list-count';counter.innerHTML='<span>QUANTIDADE DE TORNEIOS</span><strong>0</strong>';list.insertAdjacentElement('beforebegin',counter)}
  const refresh=()=>{const rows=sortAndNumber(list,'.templateCard');counter.querySelector('strong').textContent=String(rows.length)};refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true,subtree:false});
}

function adaptStructureHistory(){
  if(page!=='setup.html')return;const list=$('historyList'),root=$('structureHistory');if(!list||!root)return;root.dataset.stackupDirectoryStandard='1';list.classList.add('stackup-simple-list');const counter=ensureCount(root,list,'QUANTIDADE DE ESTRUTURAS','.historyItem');const refresh=()=>{const rows=sortAndNumber(list,'.historyItem');counter?.update();rows.forEach(row=>row.classList.add('historyRow'))};refresh();new MutationObserver(()=>requestAnimationFrame(refresh)).observe(list,{childList:true,subtree:false});
}

function boot(){
  installStyle();
  if(page==='players-directory.html')adaptPlayers();
  if(page==='staff.html')adaptStaff();
  if(page==='environment-registered.html')adaptEnvironment();
  if(page==='tournament-manager.html')adaptTournamentManager();
  if(page==='ready-tournaments.html')adaptReady();
  if(page==='setup.html')adaptStructureHistory();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();