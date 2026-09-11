(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='setup.html')return;

  function apply(){
    if(!document.getElementById('stackup-ft-ui-fix-style')){
      const style=document.createElement('style');
      style.id='stackup-ft-ui-fix-style';
      style.textContent=`
        #finalTableModeSettings .ftModeGrid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
        #finalTableModeSettings .ftModeOption{
          display:grid!important;
          grid-template-columns:24px minmax(0,1fr)!important;
          align-items:center!important;
          gap:10px!important;
          width:100%!important;
          height:auto!important;
          min-height:64px!important;
          max-height:none!important;
          padding:12px!important;
          white-space:normal!important;
          overflow:visible!important;
          text-align:left!important;
          line-height:1.35!important;
          box-sizing:border-box!important
        }
        #finalTableModeSettings .ftModeText{
          display:block!important;
          min-width:0!important;
          white-space:normal!important;
          overflow:visible!important;
          text-overflow:clip!important;
          word-break:normal!important;
          overflow-wrap:anywhere!important;
          line-height:1.35!important
        }
        #finalTableModeSettings .ftModeSquare{align-self:center!important}
        #finalTableModeSettings .ftContinuity{display:none!important}
        @media(max-width:700px){
          #finalTableModeSettings .ftModeOption{min-height:76px!important;padding:12px 10px!important}
        }
      `;
      document.head.appendChild(style);
    }
    document.querySelectorAll('#finalTableModeSettings .ftContinuity').forEach(el=>el.remove());
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();