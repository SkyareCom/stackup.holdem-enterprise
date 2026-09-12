(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='tournament-manager.html')return;
function install(toolbar,root,list){
  if(!toolbar||toolbar.querySelector('[data-stackup-action="deactivate"]'))return;
  const confirm=toolbar.querySelector('[data-stackup-action="confirm"]');
  const button=document.createElement('button');button.type='button';button.dataset.stackupAction='deactivate';button.textContent='DESATIVAR';
  toolbar.insertBefore(button,confirm||null);
  button.onclick=()=>{
    root.dataset.stackupSelectionMode='deactivate';
    root.querySelectorAll('.pick').forEach(x=>x.checked=false);
    root.querySelectorAll('.stackup-directory-pick').forEach(x=>{delete x.dataset.picked;x.setAttribute('aria-checked','false')});
    toolbar.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));
    list?.classList.add('open');
  };
  confirm?.addEventListener('click',()=>setTimeout(()=>button.classList.remove('active'),0));
}
function boot(){
  const list=document.getElementById('tournamentList'),root=list?.closest('.selectorRow')||list?.parentElement;
  install(document.getElementById('stackup-tournament-list-actions'),root,list);
  const stage=document.getElementById('stackup-stage-directory-panel');
  install(stage?.querySelector('.stackup-list-actions'),stage,stage?.querySelector('.stackup-stage-list'));
}
let tries=0;const run=()=>{tries++;boot();if(tries<30&&(!document.getElementById('stackup-tournament-list-actions')||!document.getElementById('stackup-stage-directory-panel')))setTimeout(run,100)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();