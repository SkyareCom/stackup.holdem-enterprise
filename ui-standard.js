(function(){
  if(typeof document==='undefined'||window.__stackupUiStandard)return;
  window.__stackupUiStandard=true;
  const isCast=()=>{const page=(location.pathname.split('/').pop()||'').toLowerCase();return page.startsWith('cast-')||document.documentElement.dataset.stackupCastScale};
  const style=document.createElement('style');
  style.id='stackup-ui-standard-v1';
  style.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=Caacupe+One:wght@400&display=swap');
    html,body,body *,button,input,select,textarea,option,label,a,[role="button"],input::placeholder,textarea::placeholder,
    .stackup-select-trigger,.stackup-select-option,[data-stackup-drawer-trigger],[data-stackup-drawer-panel] *,
    #stackup-global-nav,#stackup-global-nav *,#stackup-global-nav button,#stackup-global-nav a,#stackup-back,#stackup-home{
      font-family:'Caacupe One',system-ui,sans-serif!important;
      font-style:normal!important;
      font-weight:300!important;
      letter-spacing:1px!important;
      text-transform:uppercase!important;
    }
    button,.primary,.btn:not(.card),.button:not(.card),a.btn:not(.card),a.button:not(.card),[role="button"]:not(.card),input[type="button"],input[type="submit"],input[type="reset"]{
      height:44px!important;
      min-height:44px!important;
      max-height:44px!important;
      box-sizing:border-box!important;
      padding:0 12px!important;
      border:1px solid #8DFC3B!important;
      border-radius:9px!important;
      background:linear-gradient(#0B100D,#060907)!important;
      color:#8DFC3B!important;
      box-shadow:none!important;
      outline:none!important;
      text-decoration:none!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      text-align:center!important;
      font-size:14px!important;
      font-weight:300!important;
      line-height:1.15!important;
    }
    input,select,textarea,option,input::placeholder,textarea::placeholder{font-size:14px!important;font-weight:300!important}
    h1,.page-title,.hero-title,.display-title{font-size:25px!important;font-weight:300!important}
    h2,.title,.card-title{font-size:18px!important;font-weight:300!important}
    h3,.section,.section-title,.subtitle{font-size:16px!important;font-weight:300!important}
    button.active,button.selected,button[aria-pressed="true"],button[aria-selected="true"],
    .toggleBtn.active,.lang.active,.stackup-select-option.active,.stackup-select-option.selected,
    [role="button"].active,[role="button"].selected,[role="button"][aria-pressed="true"],[role="button"][aria-selected="true"]{
      background:#8DFC3B!important;
      color:#020302!important;
      border-color:#8DFC3B!important;
    }
    button.active *,button.selected *,button[aria-pressed="true"] *,button[aria-selected="true"] *,
    .toggleBtn.active *,.lang.active *,.stackup-select-option.active *,.stackup-select-option.selected *,
    [role="button"].active *,[role="button"].selected *,[role="button"][aria-pressed="true"] *,[role="button"][aria-selected="true"] *{
      color:#020302!important;
    }
    button:disabled,.primary:disabled,.btn:disabled,.button:disabled,[role="button"][aria-disabled="true"],input[type="button"]:disabled,input[type="submit"]:disabled,input[type="reset"]:disabled{
      opacity:.5!important;cursor:not-allowed!important;
    }
    [data-stackup-new-action][hidden]{display:none!important}
  `;
  (document.head||document.documentElement).appendChild(style);

  const enforceTypography=()=>{
    if(isCast()||!document.body)return;
    const all=[document.body,...document.body.querySelectorAll('*')];
    all.forEach(el=>{
      if(el instanceof SVGElement||['SCRIPT','STYLE','NOSCRIPT','TEMPLATE'].includes(el.tagName))return;
      el.style.setProperty('font-family',"'Caacupe One', system-ui, sans-serif",'important');
      el.style.setProperty('font-style','normal','important');
      el.style.setProperty('font-weight','300','important');
      let size='14px';
      if(el.matches('h1,.page-title,.hero-title,.display-title'))size='25px';
      else if(el.matches('h2,.title,.card-title'))size='18px';
      else if(el.matches('h3,.section,.section-title,.subtitle'))size='16px';
      else if(el.matches('button,.primary,.btn,.button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"],input,select,textarea,option'))size='14px';
      el.style.setProperty('font-size',size,'important');
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enforceTypography,{once:true});else enforceTypography();
  if(!isCast())new MutationObserver(()=>requestAnimationFrame(enforceTypography)).observe(document.documentElement,{childList:true,subtree:true});

  const loadLanguageExtra=()=>{
    if(document.querySelector('script[data-stackup-language-extra]'))return;
    const x=document.createElement('script');
    x.src='app-language-extra.js?v=8ee11f0c0c8b0be7dbdb120b7a99a1d337cb2072';
    x.defer=true;x.dataset.stackupLanguageExtra='1';
    (document.head||document.documentElement).appendChild(x);
  };
  if(!window.StackupAppLanguage&&!document.querySelector('script[data-stackup-language]')){
    const l=document.createElement('script');
    l.src='app-language.js?v=25edfbe44d78b540013473f3275cc471ef832512';
    l.defer=true;l.dataset.stackupLanguage='1';l.onload=loadLanguageExtra;
    (document.head||document.documentElement).appendChild(l);
  }else loadLanguageExtra();
  if(!document.querySelector('script[data-stackup-confirmation-standard]')){
    const s=document.createElement('script');
    s.src='confirmation-standard.js?v=c5f762edc04fd6043d7bf8ebc624a97b002643d7';
    s.defer=true;
    s.dataset.stackupConfirmationStandard='1';
    (document.head||document.documentElement).appendChild(s);
  }
  if(!document.querySelector('script[data-stackup-environment-context]')){
    const e=document.createElement('script');
    e.src='environment-context.js?v=c201e5fbecff34df6c0bff811d05fa82cb435581';
    e.defer=true;
    e.dataset.stackupEnvironmentContext='1';
    (document.head||document.documentElement).appendChild(e);
  }
})();