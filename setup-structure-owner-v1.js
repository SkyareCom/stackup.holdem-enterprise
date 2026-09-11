(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='setup.html')return;

function boot(){
  if(document.getElementById('structureOwnerV1Style'))return;
  const style=document.createElement('style');
  style.id='structureOwnerV1Style';
  style.textContent=`
    [data-identifier-toggle]{display:none!important}
    .levelTypeCell{display:block!important;position:relative!important;inset:auto!important;z-index:auto!important;min-width:220px!important}
    .levelTypeCell select{display:block!important;position:relative!important;width:100%!important}
  `;
  document.head.appendChild(style);
  document.getElementById('identifierModalV1')?.remove();

  const old=document.getElementById('newStructure');
  if(old){
    const n=old.cloneNode(true);
    old.replaceWith(n);
    n.addEventListener('click',e=>{
      e.preventDefault();
      document.getElementById('structureHistory')?.classList.add('hidden');
      document.getElementById('structureEditor')?.classList.remove('hidden');
      document.getElementById('saveNameRow')?.classList.add('hidden');
      setTimeout(()=>window.dispatchEvent(new Event('resize')),0);
    });
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();