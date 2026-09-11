(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='staff.html')return;
  function cleanup(){
    document.getElementById('staffRoleSelector')?.remove();
    const select=document.getElementById('role');
    if(!select)return;
    select.setAttribute('aria-label','FUNÇÃO');
    const wrap=select.__stackupListWrap||(select.nextElementSibling?.classList?.contains('stackup-select')?select.nextElementSibling:null);
    if(!wrap)return;
    const trigger=wrap.querySelector('.stackup-select-trigger');
    const list=wrap.querySelector('.stackup-select-list');
    if(!trigger||!list)return;
    const signature=[...select.options].map(o=>`${o.value}:${o.textContent}:${o.disabled?'1':'0'}`).join('|');
    if(list.dataset.staffRoleSignature===signature)return;
    list.dataset.staffRoleSignature=signature;
    list.innerHTML='';
    [...select.options].forEach((option,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='stackup-select-option'+(option.selected?' selected':'');
      button.textContent=option.textContent;
      button.disabled=option.disabled;
      button.onclick=e=>{
        e.preventDefault();
        select.selectedIndex=index;
        select.dispatchEvent(new Event('input',{bubbles:true}));
        select.dispatchEvent(new Event('change',{bubbles:true}));
        wrap.classList.remove('open');
        trigger.setAttribute('aria-expanded','false');
        cleanup();
      };
      list.appendChild(button);
    });
    if(trigger.firstChild){
      const selected=select.options[select.selectedIndex];
      trigger.firstChild.nodeValue=(selected?.textContent||'SELECIONAR FUNÇÃO')+' ';
    }
  }
  function boot(){
    cleanup();
    const root=document.body||document.documentElement;
    if(!root)return;
    const observer=new MutationObserver(()=>cleanup());
    observer.observe(root,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),3000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();