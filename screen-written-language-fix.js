(()=>{
'use strict';
function patchWritten(){
 const api=window.StackupScreenMessages,langSel=document.getElementById('voiceLang'),list=document.getElementById('writtenMessages');
 if(!api||!langSel||!list)return;
 const lang=langSel.value||api.officialLang();
 list.querySelectorAll('[data-write]').forEach(btn=>{
  const id=btn.dataset.write,card=btn.closest('.messageCard'),textEl=card?.querySelector('.messageText');
  if(textEl)textEl.textContent=api.messageText(id,lang);
  btn.onclick=()=>api.setAnnouncement(api.messageText(id,lang));
 });
}
function boot(){
 const langSel=document.getElementById('voiceLang'),list=document.getElementById('writtenMessages');
 if(!langSel||!list)return;
 langSel.addEventListener('change',()=>setTimeout(patchWritten,0));
 new MutationObserver(()=>patchWritten()).observe(list,{childList:true,subtree:true});
 patchWritten();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();