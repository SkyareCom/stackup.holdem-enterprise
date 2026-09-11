(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
function fix(){const team=[...document.querySelectorAll('.teamGrid a')].find(a=>/DEALER STATION/i.test(a.textContent||''));if(!team)return;const allowed=window.StackupAuth?.can?.('SETUP')===true;if(!allowed){team.hidden=true;team.style.display='none';return}team.hidden=false;team.style.display='';team.href='dealer-activation.html';const b=team.querySelector('button');if(b)b.textContent='ATIVAR DEALER'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();
})();