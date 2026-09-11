(function(){
  'use strict';
  if(typeof document==='undefined'||window.__stackupConfirmationStandard)return;
  window.__stackupConfirmationStandard=true;

  const style=document.createElement('style');
  style.id='stackup-inline-notice-style';
  style.textContent=`
    [data-stackup-inline-notice]{
      display:block!important;width:100%!important;box-sizing:border-box!important;
      margin:8px 0 0!important;padding:10px 12px!important;border:1px solid #27342D!important;
      border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important;
      color:#AEB8B1!important;font-size:12px!important;line-height:1.35!important;
      font-family:'Caacupe One',system-ui,sans-serif!important;letter-spacing:1px!important;text-transform:uppercase!important;
    }
    [data-stackup-inline-notice="error"]{border-color:#ff858d!important;color:#FFFFFF!important}
    [data-stackup-inline-notice="success"]{border-color:#8DFC3B!important;color:#8DFC3B!important}
    [data-stackup-inline-notice="info"]{border-color:#27342D!important;color:#AEB8B1!important}
  `;
  (document.head||document.documentElement).appendChild(style);

  function rootFor(scope){return scope?.querySelector?scope:(document.querySelector('main')||document.body)}
  function showNotice(message,type='info',scope=null){
    const root=rootFor(scope),text=String(message??'').trim();
    if(!root||!text)return null;
    let box=root.querySelector(':scope > [data-stackup-inline-notice]');
    if(!box){
      box=document.createElement('div');
      box.setAttribute('role','status');
      box.setAttribute('aria-live','polite');
      root.prepend(box);
    }
    box.dataset.stackupInlineNotice=type;
    box.textContent=text;
    box.hidden=false;
    return box;
  }
  function clearNotice(scope=null){
    const root=rootFor(scope);if(!root)return;
    root.querySelectorAll('[data-stackup-inline-notice]').forEach(el=>{el.hidden=true;el.textContent=''});
  }

  window.StackupNotice={
    show:showNotice,
    clear:clearNotice,
    info:(message,scope)=>showNotice(message,'info',scope),
    success:(message,scope)=>showNotice(message,'success',scope),
    error:(message,scope)=>showNotice(message,'error',scope)
  };

  // Publication rule: this global layer is presentation-only. It must never
  // replace alert/confirm/prompt, auto-confirm destructive actions, change a
  // business button to CONFIRMADO, disable it, or inject synthetic buttons.
})();