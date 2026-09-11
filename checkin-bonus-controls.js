(function(){
  const PAGE=(location.pathname.split('/').pop()||'').toLowerCase();
  if(PAGE!=='checkin.html')return;

  function mount(){
    const row=document.getElementById('bonusEligibilityRow');
    const earlyButton=document.getElementById('earlyBonusToggle');
    const addonButton=document.getElementById('addonBonusToggle');
    if(!row||!earlyButton||!addonButton)return false;
    if(document.getElementById('earlyBonusCheck'))return true;

    earlyButton.style.display='none';
    addonButton.style.display='none';
    row.style.gridTemplateColumns='1fr';
    row.style.gap='8px';

    const make=(id,text,source)=>{
      const label=document.createElement('label');
      label.className='toggle bonusCheck';
      label.innerHTML=`<input type="checkbox" id="${id}"><span>${text}</span>`;
      const input=label.querySelector('input');
      input.checked=source.classList.contains('active')||source.textContent.trim().startsWith('■');
      input.addEventListener('change',()=>{
        source.click();
        setTimeout(sync,0);
      });
      return label;
    };

    const early=make('earlyBonusCheck','EARLY BONUS',earlyButton);
    const addon=make('addonBonusCheck','ADD ON BONUS',addonButton);
    row.append(early,addon);

    function sync(){
      const e=document.getElementById('earlyBonusCheck');
      const a=document.getElementById('addonBonusCheck');
      if(e)e.checked=earlyButton.classList.contains('active')||earlyButton.textContent.trim().startsWith('■');
      if(a)a.checked=addonButton.classList.contains('active')||addonButton.textContent.trim().startsWith('■');
    }
    window.addEventListener('storage',()=>setTimeout(sync,0));
    new MutationObserver(sync).observe(row,{subtree:true,childList:true,attributes:true,characterData:true});
    sync();
    return true;
  }

  if(!mount()){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(mount()||tries>80)clearInterval(timer);
    },50);
  }
})();