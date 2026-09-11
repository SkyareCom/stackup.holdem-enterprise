(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
function removeStaff(){
  document.querySelectorAll('.teamGrid a,.teamGrid button').forEach(el=>{
    if(/^STAFF$/i.test((el.textContent||'').trim())){
      const a=el.closest('a');
      (a||el).remove();
    }
  });
}
function removeQtd(){
  document.querySelectorAll('.summaryTx .summaryMeta').forEach(meta=>{
    const value=meta.querySelector('b');
    if(!value)return;
    const id=value.id;
    const text=value.textContent;
    meta.innerHTML='';
    const b=document.createElement('b');
    if(id)b.id=id;
    b.textContent=text;
    meta.appendChild(b);
  });
}
function apply(){removeStaff();removeQtd()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
setTimeout(apply,250);
setTimeout(apply,1000);
})();