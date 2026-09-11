(function(){
  if(typeof document==='undefined'||window.__stackupInlineInteractions)return;
  window.__stackupInlineInteractions=true;

  const UI='data-stackup-inline-ui';
  let lastTrigger=null;
  let approved=null;
  let prompted=null;

  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const installStyle=()=>{
    if(document.getElementById('stackup-inline-interactions-style'))return;
    const style=document.createElement('style');
    style.id='stackup-inline-interactions-style';
    style.textContent=`
      .stackup-inline-drawer{width:100%;box-sizing:border-box;margin:8px 0 10px;padding:12px;border:1px solid #27342D;border-radius:9px;background:linear-gradient(#0B100D,#060907);color:#fff;font-family:inherit;letter-spacing:1px;text-transform:uppercase}
      .stackup-inline-message{color:#AEB8B1;font-size:12px;line-height:1.45;white-space:normal;overflow-wrap:anywhere}
      .stackup-inline-message.stackup-error{color:#ffb1b6}
      .stackup-inline-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
      .stackup-inline-actions button{width:100%;min-height:44px;margin:0;padding:10px 12px;border-radius:9px;border:1px solid #8DFC3B;background:#060907;color:#8DFC3B;font-family:inherit;text-transform:uppercase;letter-spacing:1px;cursor:pointer}
      .stackup-inline-actions button[data-stackup-cancel]{border-color:#27342D;color:#AEB8B1}
      .stackup-inline-input{width:100%;min-height:44px;box-sizing:border-box;margin-top:10px;padding:10px 12px;border:1px solid #27342D;border-radius:9px;background:#060907;color:#fff;font-family:inherit;text-transform:uppercase;letter-spacing:1px}
      @media(max-width:700px){.stackup-inline-actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  };
  const triggerFor=()=>{
    const ev=window.event;
    const fromEvent=ev?.target?.closest?.('button,a,[role="button"],[data-action],[data-open]');
    return fromEvent&&!fromEvent.hasAttribute(UI)?fromEvent:lastTrigger;
  };
  const hostFor=trigger=>{
    if(!trigger)return document.querySelector('main')||document.body;
    return trigger.closest?.('.listRow,.historyRow,.row,.templateCard,.card,.panel,section,.block,.actions,.grid,.grid2,.grid3,.grid4,.grid5')||trigger.parentElement||document.querySelector('main')||document.body;
  };
  const clearFor=host=>{
    const parent=host?.parentElement||host;
    parent?.querySelectorAll?.(':scope > .stackup-inline-drawer').forEach(x=>x.remove());
  };
  const mount=(trigger,{message='',error=false,input=false,defaultValue='',confirmLabel='CONFIRMAR',cancelLabel='CANCELAR',onConfirm=null,onCancel=null}={})=>{
    installStyle();
    const host=hostFor(trigger);clearFor(host);
    const drawer=document.createElement('div');drawer.className='stackup-inline-drawer';drawer.setAttribute(UI,'1');
    drawer.innerHTML=`<div class="stackup-inline-message${error?' stackup-error':''}">${esc(message)}</div>${input?`<input class="stackup-inline-input" value="${esc(defaultValue)}" aria-label="RESPOSTA">`:''}${onConfirm||onCancel?`<div class="stackup-inline-actions">${onConfirm?`<button type="button" data-stackup-confirm ${UI}="1">${esc(confirmLabel)}</button>`:''}${onCancel?`<button type="button" data-stackup-cancel ${UI}="1">${esc(cancelLabel)}</button>`:''}</div>`:''}`;
    if(host===document.body||host===document.documentElement)host.appendChild(drawer);else host.insertAdjacentElement('afterend',drawer);
    const field=drawer.querySelector('.stackup-inline-input');
    drawer.querySelector('[data-stackup-confirm]')?.addEventListener('click',e=>{e.stopPropagation();onConfirm?.(field?.value??'');});
    drawer.querySelector('[data-stackup-cancel]')?.addEventListener('click',e=>{e.stopPropagation();drawer.remove();onCancel?.()});
    if(field){field.focus();field.select?.()}
    return drawer;
  };
  const notify=(message,{error=false,trigger=triggerFor()}={})=>mount(trigger,{message,error});

  document.addEventListener('click',event=>{
    const target=event.target.closest?.('button,a,[role="button"],[data-action],[data-open]');
    if(target&&!target.hasAttribute(UI))lastTrigger=target;
  },true);

  window.alert=function(message){notify(message,{error:true});};
  window.confirm=function(message){
    const trigger=triggerFor();
    if(approved&&approved.trigger===trigger&&approved.message===String(message)&&Date.now()-approved.at<5000){approved=null;return true}
    mount(trigger,{message:String(message),error:false,confirmLabel:'CONFIRMAR',cancelLabel:'CANCELAR',onConfirm:()=>{
      approved={trigger,message:String(message),at:Date.now()};
      const drawer=document.querySelector('.stackup-inline-drawer');drawer?.remove();
      setTimeout(()=>trigger?.click?.(),0);
    },onCancel:()=>{approved=null}});
    return false;
  };
  window.prompt=function(message,defaultValue=''){
    const trigger=triggerFor();
    if(prompted&&prompted.trigger===trigger&&prompted.message===String(message)&&Date.now()-prompted.at<5000){const value=prompted.value;prompted=null;return value}
    mount(trigger,{message:String(message),input:true,defaultValue:String(defaultValue??''),confirmLabel:'CONFIRMAR',cancelLabel:'CANCELAR',onConfirm:value=>{
      prompted={trigger,message:String(message),value,at:Date.now()};
      const drawer=document.querySelector('.stackup-inline-drawer');drawer?.remove();
      setTimeout(()=>trigger?.click?.(),0);
    },onCancel:()=>{prompted=null}});
    return null;
  };

  window.StackupInlineFeedback={show:notify,mount};
})();
