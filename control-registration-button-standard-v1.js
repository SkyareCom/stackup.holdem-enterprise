(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
function fix(){
  const old=document.getElementById('hubRegistrations');
  if(!old)return;
  const count=old.querySelector('#hubRegistrationCount')?.textContent||'0';
  const parent=old.parentElement;
  if(parent?.tagName==='A'){
    const btn=document.createElement('button');
    btn.id='hubRegistrations';
    btn.className='opButton';
    btn.type='button';
    btn.innerHTML=`INSCRIÇÕES <span id="hubRegistrationCount">${count}</span>`;
    btn.onclick=()=>{location.href='smart-registration.html'};
    parent.replaceWith(btn);
  }else{
    old.classList.add('opButton');
    old.onclick=()=>{location.href='smart-registration.html'};
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();
})();