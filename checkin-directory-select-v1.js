(()=>{
'use strict';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
if(page!=='checkin.html')return;
function apply(){
  if(document.getElementById('selectRegisteredPlayer'))return;
  const current=[...document.querySelectorAll('a.directoryBtn')].find(a=>(a.getAttribute('href')||'').split('?')[0]==='checkin-players.html');
  if(!current)return;
  const a=document.createElement('a');
  a.id='selectRegisteredPlayer';
  a.className=current.className||'directoryBtn';
  a.href='checkin-players.html?return=checkin.html';
  a.textContent='SELECIONAR JOGADOR CADASTRADO';
  current.insertAdjacentElement('afterend',a);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();