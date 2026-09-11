(function(){
  if(typeof document==='undefined'||window.__stackupClickableListDrawer)return;
  window.__stackupClickableListDrawer=true;

  const STYLE_ID='stackup-clickable-list-drawer-style';
  const install=()=>{
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;(document.head||document.documentElement).appendChild(style)}
    style.textContent=`
      .stackup-click-list-item>.tag,
      .stackup-click-list-item>.desc,
      .stackup-click-list-item>span,
      .stackup-click-list-item>.meta,
      .stackup-click-list-item>.purchases,
      .stackup-click-list-item>.total{display:initial!important}
      .stackup-list-drawer{display:none!important}
    `;
    document.querySelectorAll('.stackup-list-drawer').forEach(x=>x.remove());
    document.querySelectorAll('.stackup-list-expanded').forEach(x=>x.classList.remove('stackup-list-expanded'));
  };

  // Regra global: listas e cards executam sua ação original no primeiro clique.
  // Nenhuma gaveta intermediária, popup ou segundo clique é injetado por esta camada.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();