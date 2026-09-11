(function(){
  if(typeof document==='undefined'||window.__stackupEnvironmentContext)return;
  window.__stackupEnvironmentContext=true;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const getActive=()=>({id:String(state?.activeEnvironmentId||''),name:String(state?.activeEnvironmentName||state?.clubName||''),type:String(state?.activeEnvironmentType||'')});
  const badge=()=>{
    const active=getActive();
    if(!active.id&&!active.name)return null;
    let el=document.getElementById('stackupActiveEnvironment');
    if(el)return el;
    el=document.createElement('div');
    el.id='stackupActiveEnvironment';
    el.style.cssText='margin:8px 0;padding:10px 12px;border:1px solid #27342D;border-radius:9px;color:#8DFC3B;font-size:12px;line-height:1.35';
    el.textContent='AMBIENTE SELECIONADO • '+active.name;
    const target=document.querySelector('.section,.card,main')||document.body;
    target.insertAdjacentElement('afterend',el);
    return el;
  };
  function staff(){
    if(page!=='staff.html')return;
    const active=getActive(); if(!active.id)return;
    const apply=()=>{const club=document.getElementById('club');if(!club)return false;if([...club.options].some(o=>String(o.value)===active.id)){club.value=active.id;club.dataset.activeEnvironmentSelected='1';return true}return false};
    badge(); if(!apply()){let n=0,t=setInterval(()=>{n++;if(apply()||n>20)clearInterval(t)},100)}
    document.addEventListener('click',e=>{if(e.target?.id==='save')setTimeout(apply,0)},true);
  }
  function players(){
    if(page!=='players-directory.html')return;
    const active=getActive(); if(!active.id)return;
    const title=[...document.querySelectorAll('.section')].find(x=>/CADASTRO DE JOGADORES/.test(x.textContent||''));
    if(title&&!document.getElementById('stackupActiveEnvironment')){const el=document.createElement('div');el.id='stackupActiveEnvironment';el.style.cssText='margin:8px 0;padding:10px 12px;border:1px solid #27342D;border-radius:9px;color:#8DFC3B;font-size:12px';el.textContent='AMBIENTE SELECIONADO • '+active.name;title.insertAdjacentElement('afterend',el)}
    const stampRecent=()=>{try{
      let stamped=false;
      if(typeof players!=='undefined'&&Array.isArray(players)&&players.length){const recent=[...players].sort((a,b)=>(+b.createdAt||0)-(+a.createdAt||0))[0];if(recent&&Date.now()-(+recent.createdAt||0)<3000){recent.clubId=active.id;recent.environmentId=active.id;recent.environmentName=active.name;stamped=true;if(typeof persist==='function')persist()}}
      if(stamped)return;
      const key='stackup-player-directory-v1',arr=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(arr)||!arr.length)return;const recent=[...arr].sort((a,b)=>(+b.createdAt||0)-(+a.createdAt||0))[0];if(recent&&Date.now()-(+recent.createdAt||0)<3000){recent.clubId=active.id;recent.environmentId=active.id;recent.environmentName=active.name;localStorage.setItem(key,JSON.stringify(arr))}
    }catch(_){}};
    document.addEventListener('click',e=>{if(e.target?.id!=='save')return;setTimeout(stampRecent,0)},false);
  }
  function tournament(){
    if(page!=='setup.html')return;
    const active=getActive(); if(!active.id&&!active.name)return;
    const apply=()=>{const field=document.getElementById('clubName');if(!field)return false;field.value=active.name;field.readOnly=true;state.clubName=active.name;state.activeEnvironmentId=active.id;state.activeEnvironmentName=active.name;state.activeEnvironmentType=active.type;try{saveState()}catch(_){};return true};
    badge(); if(!apply())document.addEventListener('DOMContentLoaded',apply,{once:true});
  }
  const boot=()=>{try{staff();players();tournament()}catch(_){}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();