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
      .stackup-inline-notice,.stackup-inline-confirmation{
        display:block!important;position:relative!important;inset:auto!important;z-index:auto!important;
        width:100%!important;box-sizing:border-box!important;margin:8px 0 10px!important;padding:10px 12px!important;
        border:1px solid #27342D!important;border-radius:9px!important;background:transparent!important;box-shadow:none!important;
        color:#AEB8B1!important;font-family:inherit!important;letter-spacing:1px!important;text-transform:uppercase!important;
      }
      .stackup-inline-notice.stackup-error{border-color:#ff858d!important;color:#FFFFFF!important}
      .stackup-inline-message{color:inherit!important;font-size:12px!important;line-height:1.45!important;white-space:normal!important;overflow-wrap:anywhere!important}
      .stackup-inline-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:10px!important}
      .stackup-inline-actions button{width:100%!important;min-height:44px!important;margin:0!important;padding:10px 12px!important;border-radius:9px!important;border:1px solid #8DFC3B!important;background:#060907!important;color:#8DFC3B!important;font-family:inherit!important;text-transform:uppercase!important;letter-spacing:1px!important;cursor:pointer!important}
      .stackup-inline-actions button[data-stackup-cancel]{border-color:#27342D!important;color:#AEB8B1!important}
      .stackup-inline-input{display:block!important;width:100%!important;min-height:44px!important;box-sizing:border-box!important;margin-top:10px!important;padding:10px 12px!important;border:1px solid #27342D!important;border-radius:9px!important;background:#060907!important;color:#fff!important;font-family:inherit!important;text-transform:uppercase!important;letter-spacing:1px!important}
      @media(max-width:700px){.stackup-inline-actions{grid-template-columns:1fr!important}}
    `;
    (document.head||document.documentElement).appendChild(style);
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
  const parentFor=host=>host===document.body||host===document.documentElement?host:(host?.parentElement||document.querySelector('main')||document.body);
  const removeExisting=(host,selector)=>parentFor(host)?.querySelectorAll?.(`:scope > ${selector}`).forEach(x=>x.remove());
  const insertAfterHost=(host,node)=>{if(host===document.body||host===document.documentElement)host.appendChild(node);else host.insertAdjacentElement('afterend',node)};

  const showNotice=(message,{error=false,trigger=triggerFor()}={})=>{
    installStyle();
    const host=hostFor(trigger);removeExisting(host,'.stackup-inline-notice');
    const notice=document.createElement('div');
    notice.className=`stackup-inline-notice${error?' stackup-error':''}`;
    notice.setAttribute(UI,'1');notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');
    notice.innerHTML=`<div class="stackup-inline-message">${esc(message)}</div>`;
    insertAfterHost(host,notice);
    return notice;
  };
  const showDecision=(trigger,{message='',input=false,defaultValue='',confirmLabel='CONFIRMAR',cancelLabel='CANCELAR',onConfirm,onCancel}={})=>{
    installStyle();
    const host=hostFor(trigger);removeExisting(host,'.stackup-inline-confirmation');
    const panel=document.createElement('div');panel.className='stackup-inline-confirmation';panel.setAttribute(UI,'1');
    panel.innerHTML=`<div class="stackup-inline-message">${esc(message)}</div>${input?`<input class="stackup-inline-input" value="${esc(defaultValue)}" aria-label="RESPOSTA">`:''}<div class="stackup-inline-actions"><button type="button" data-stackup-confirm ${UI}="1">${esc(confirmLabel)}</button><button type="button" data-stackup-cancel ${UI}="1">${esc(cancelLabel)}</button></div>`;
    insertAfterHost(host,panel);
    const field=panel.querySelector('.stackup-inline-input');
    panel.querySelector('[data-stackup-confirm]').onclick=e=>{e.stopPropagation();onConfirm?.(field?.value??'')};
    panel.querySelector('[data-stackup-cancel]').onclick=e=>{e.stopPropagation();panel.remove();onCancel?.()};
    return panel;
  };

  document.addEventListener('click',event=>{
    const target=event.target.closest?.('button,a,[role="button"],[data-action],[data-open]');
    if(target&&!target.hasAttribute(UI))lastTrigger=target;
  },true);

  window.alert=function(message){showNotice(message,{error:true});};
  window.confirm=function(message){
    const trigger=triggerFor(),text=String(message);
    if(approved&&approved.trigger===trigger&&approved.message===text&&Date.now()-approved.at<5000){approved=null;return true}
    showDecision(trigger,{message:text,onConfirm:()=>{approved={trigger,message:text,at:Date.now()};document.querySelector('.stackup-inline-confirmation')?.remove();setTimeout(()=>trigger?.click?.(),0)},onCancel:()=>{approved=null}});
    return false;
  };
  window.prompt=function(message,defaultValue=''){
    const trigger=triggerFor(),text=String(message);
    if(prompted&&prompted.trigger===trigger&&prompted.message===text&&Date.now()-prompted.at<5000){const value=prompted.value;prompted=null;return value}
    showDecision(trigger,{message:text,input:true,defaultValue:String(defaultValue??''),onConfirm:value=>{prompted={trigger,message:text,value,at:Date.now()};document.querySelector('.stackup-inline-confirmation')?.remove();setTimeout(()=>trigger?.click?.(),0)},onCancel:()=>{prompted=null}});
    return null;
  };

  window.StackupInlineFeedback={show:showNotice,decision:showDecision,mount:showDecision};
})();