(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='setup.html')return;
function boot(){
 if(document.getElementById('setupUiStandardV1'))return;
 const s=document.createElement('style');s.id='setupUiStandardV1';s.textContent=`
:root{--setup-gap:10px;--setup-section-gap:22px;--setup-control-h:48px}
.wrap{padding:18px!important}
.card{margin:0 0 var(--setup-section-gap)!important}
.section{margin:22px 2px 10px!important}.itemTitle{margin:20px 2px 8px!important}
.grid,.valueGrid,.singleGrid,.cta,.structureMenu,.editorActions,.historyActions,.blindModeRow,.timeButtons,.saveName,.checks{gap:var(--setup-gap)!important}
.valueRow{margin-top:0!important;margin-bottom:12px!important}
input,select,button{box-sizing:border-box!important}
.grid>input,.grid>select,.valueGrid>input,.singleGrid>input,#structureName{min-height:var(--setup-control-h)!important;height:var(--setup-control-h)!important}
button{min-height:var(--setup-control-h)!important;height:auto!important;padding:10px 12px!important;line-height:1.15!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;white-space:normal!important;touch-action:manipulation!important}
.structureMenu{margin:0 0 14px!important}.structureMenu button{height:var(--setup-control-h)!important}
#structureEditor{margin-top:14px!important}.blindModeRow{margin:0 0 12px!important}.blindModeRow button{height:var(--setup-control-h)!important}
.timeButtons{margin:0 0 14px!important}.timeButtons>button{height:var(--setup-control-h)!important}
.customTime input,.customTime button{height:var(--setup-control-h)!important;min-height:var(--setup-control-h)!important}
.levelsWrap{margin-top:14px!important;padding:2px 0 8px!important;position:relative!important;overflow-x:auto!important;overflow-y:visible!important}.levelsHead{margin:0 0 8px!important}.levelRow{margin-bottom:10px!important;position:relative!important}.levelRow input,.levelRow select{height:44px!important;min-height:44px!important}.levelRow select.levelIdentifier{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;touch-action:manipulation!important;position:relative!important;z-index:20!important;appearance:auto!important;-webkit-appearance:menulist!important;cursor:pointer!important}.levelRow select.levelIdentifier option{display:block!important;color:#fff!important;background:#060907!important}.levelRow button{height:44px!important;min-height:44px!important;padding:7px 4px!important;position:relative!important;z-index:1!important}
.editorActions{margin-top:16px!important}.editorActions button{min-height:var(--setup-control-h)!important}
#saveNameRow{margin-top:10px!important}.historyList{gap:10px!important}.historyItem{padding:12px 0!important}.historyItem>.historyActions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}
.summary{padding-top:2px!important}.cta{margin-top:20px!important}.cta button{min-height:52px!important}
.check{min-height:52px!important;padding:10px 12px!important}
@media(max-width:700px){.wrap{padding:14px!important}:root{--setup-gap:9px;--setup-section-gap:20px}.structureMenu,.cta{gap:9px!important}.editorActions{grid-template-columns:repeat(3,minmax(0,1fr))!important}.editorActions button{padding:9px 6px!important;font-size:12px!important}.historyItem>.historyActions{grid-template-columns:repeat(3,minmax(0,1fr))!important}.historyItem>.historyActions button{padding:9px 6px!important;font-size:12px!important}}
@media(max-width:390px){.wrap{padding:12px!important}.structureMenu{grid-template-columns:1fr!important}.cta{grid-template-columns:1fr!important}.editorActions{grid-template-columns:1fr!important}.editorActions button{font-size:13px!important}.historyItem>.historyActions{grid-template-columns:1fr!important}}
`;
 document.head.appendChild(s);
 document.addEventListener('pointerdown',e=>{const sel=e.target.closest('select.levelIdentifier');if(!sel)return;e.stopPropagation();},true);
 document.addEventListener('click',e=>{const sel=e.target.closest('select.levelIdentifier');if(!sel)return;e.stopPropagation();},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();