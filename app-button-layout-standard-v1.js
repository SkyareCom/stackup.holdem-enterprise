(()=>{
'use strict';
const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
if(/^cast-/.test(file)||['cast-v2.html','cast-10px.html','cast-connect.html','tv.html','tv-connect.html','dealer-access.html'].includes(file))return;
const INTERNAL=[
  '.timeGrid','.timerGrid','.timerCommands','.timer-controls','[data-timer-controls]',
  '.timeButtons','.blindModeRow','.structureMenu','.editorActions','.levelRow','.levelsWrap','.customTime','.historyActions','.saveName',
  '.grid5','.choice','.borderModes',
  '.payGrid','.hubPay','.paymentGrid','.paymentMethods',
  '.toggleRow','.modeGrid','.dealerGrid','.confirmGrid',
  '.dealerActions','.eliminationActions','.rebuyActions','.finalTableActions','.roundControls',
  '.modes','.hands','.voiceChoiceButtons','.messageActions','.linkBox',
  '.tabs','.tabRow','.pagination','.keypad','.keyboard','[data-internal-controls]'
].join(',');
const PAGE_CONTAINERS=[
  '.actionGrid','.utilityRow','.queryGrid','.teamGrid','.topActions','.bottomActions',
  '.cta','.pageActions','.page-actions','.mainActions','.main-actions','.navActions','.navigationActions','.links'
].join(',');
const PAGE_GRID_FILES=new Set(['tournament-smoke-test.html','tournament-manager.html','wallet.html','balancing.html']);
const KNOWN_PAGE_CONTAINERS={
  'finance.html':['main > .grid2'],
  'screen-settings.html':['main > .actions'],
  'tournament-readiness.html':['main > .actions'],
  'tournament-manager.html':['#selectedActions > .actions','#ops .grid'],
  'transmission-room.html':['.room > .actions']
};
function isInternal(el){return !!el?.closest?.(INTERNAL)}
function installStyle(){
  if(document.getElementById('stackupButtonLayoutStandardV1'))return;
  const s=document.createElement('style');
  s.id='stackupButtonLayoutStandardV1';
  s.textContent=`
    html body button:not(:disabled):not([aria-disabled="true"]),html body .btn:not([aria-disabled="true"]),html body .button:not([aria-disabled="true"]),html body [role="button"]:not([aria-disabled="true"]){pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}
    html body button:disabled,html body [aria-disabled="true"]{pointer-events:none!important;cursor:not-allowed!important}
    html body a.stackup-normalized-anchor-button{box-sizing:border-box!important;min-height:44px!important;padding:0 12px!important;background:linear-gradient(#0B100D,#060907)!important;background-color:#060907!important;color:#8DFC3B!important;border:1px solid #8DFC3B!important;border-radius:9px!important;outline:none!important;box-shadow:none!important;text-decoration:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;white-space:normal!important;touch-action:manipulation!important;cursor:pointer!important}
    html body .stackup-page-actions{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important;width:100%!important;align-items:stretch!important}
    html body .stackup-page-actions>a,html body .stackup-page-actions>button,html body .stackup-page-actions>.btn,html body .stackup-page-actions>.button{width:100%!important;max-width:100%!important;display:flex!important}
    html body .stackup-page-action,html body .stackup-page-link{width:100%!important;max-width:100%!important}
    html body .stackup-page-action{height:44px!important;min-height:44px!important;max-height:44px!important}
    html body .stackup-card-list{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important}
    html body .timeGrid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
    html body .timeGrid>button{width:100%!important}
  `;
  document.head.appendChild(s);
}
function normalizeNestedAnchorButtons(){
  document.querySelectorAll('a[href] > button:only-child').forEach(btn=>{
    if(isInternal(btn)||btn.disabled||btn.getAttribute('aria-disabled')==='true'||btn.hasAttribute('onclick'))return;
    const a=btn.parentElement;
    if(!a||a.dataset.stackupNestedNormalized==='1')return;
    if(btn.id&&!a.id)a.id=btn.id;
    for(const c of btn.classList)a.classList.add(c);
    for(const attr of [...btn.attributes]){
      const name=attr.name.toLowerCase();
      if(['id','class','type','style','disabled'].includes(name)||name.startsWith('on'))continue;
      if(!a.hasAttribute(attr.name))a.setAttribute(attr.name,attr.value);
    }
    a.innerHTML=btn.innerHTML;
    a.classList.add('button','stackup-normalized-anchor-button');
    a.dataset.stackupNestedNormalized='1';
  });
}
function markAction(el){
  if(!el||isInternal(el))return;
  if(el.matches?.('a[href]')){
    el.classList.add('stackup-page-link');
    const btn=el.querySelector?.(':scope > button,:scope > .btn,:scope > .button,:scope > [role="button"]');
    if(btn&&!isInternal(btn))btn.classList.add('stackup-page-action');
    else if(el.matches('.btn,.button,[role="button"]'))el.classList.add('stackup-page-action');
    return;
  }
  const btn=el.matches?.('button,.btn,.button,[role="button"]')?el:el.querySelector?.(':scope > button,:scope > .btn,:scope > .button,:scope > [role="button"]');
  if(btn&&!isInternal(btn))btn.classList.add('stackup-page-action');
}
function markContainer(c){
  if(!c||isInternal(c))return;
  c.classList.add('stackup-page-actions');
  [...c.children].forEach(markAction);
}
function actionChild(ch){return !!ch?.matches?.('button,a[href],.btn,.button,[role="button"]')}
function allDirectActions(c){const kids=[...c.children].filter(x=>x.nodeType===1);return kids.length>=2&&kids.every(actionChild)}
function directButtonCount(c){
  return [...c.children].filter(ch=>ch.matches?.('button,.btn,.button,[role="button"]')||(ch.matches?.('a[href]')&&(ch.matches('.btn,.button,[role="button"]')||ch.querySelector?.(':scope > button,:scope > .btn,:scope > .button,:scope > [role="button"]')))).length;
}
function normalizeCardLists(){
  document.querySelectorAll('.grid,.cards,.modules,.moduleGrid,.cardGrid').forEach(c=>{
    const direct=[...c.children].filter(x=>x.matches?.('a.card,.module-card,[data-module-card]'));
    if(direct.length){c.classList.add('stackup-card-list');direct.forEach(markAction)}
  });
}
function normalizeKnownPageContainers(){
  for(const selector of KNOWN_PAGE_CONTAINERS[file]||[])document.querySelectorAll(selector).forEach(c=>{if(!isInternal(c))markContainer(c)});
}
function normalizePageButtons(){
  document.querySelectorAll(PAGE_CONTAINERS).forEach(markContainer);
  document.querySelectorAll('main > .actions,.app > .actions').forEach(c=>{if(!isInternal(c))markContainer(c)});
  if(file==='tournament-manager.html')document.querySelectorAll('#selectedActions .actions').forEach(markContainer);
  if(PAGE_GRID_FILES.has(file))document.querySelectorAll('.grid').forEach(c=>{if(!isInternal(c)&&directButtonCount(c)>=2)markContainer(c)});
  document.querySelectorAll('main > .grid,main > .grid2,main > .grid3,main > .grid4,.app > .grid,.app > .grid2,.app > .grid3,.app > .grid4').forEach(c=>{if(!isInternal(c)&&allDirectActions(c))markContainer(c)});
  normalizeKnownPageContainers();
  document.querySelectorAll('main > button,main > a[href],.app > button,.app > a[href]').forEach(markAction);
  document.querySelectorAll('#openGameTournamentList,#confirmGameTournament').forEach(markAction);
}
function apply(){installStyle();normalizeNestedAnchorButtons();normalizeCardLists();normalizePageButtons()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
let queued=false;const obs=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})});
if(document.documentElement)obs.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(apply,250);setTimeout(apply,1000);
})();