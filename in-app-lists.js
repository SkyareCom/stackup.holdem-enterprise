(function(){
  if(typeof document==='undefined'||window.__stackupInAppLists)return;
  window.__stackupInAppLists=true;

  const STYLE_ID='stackup-in-app-lists-style';
  const addStyle=()=>{
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      select.stackup-open-list{
        display:block!important;position:relative!important;inset:auto!important;z-index:auto!important;
        width:100%!important;min-width:0!important;height:auto!important;max-height:320px!important;
        margin:6px 0!important;padding:0!important;box-sizing:border-box!important;overflow:auto!important;
        border:1px solid #27342D!important;border-radius:9px!important;background:#060907!important;
        color:#AEB8B1!important;box-shadow:none!important;outline:none!important;
        font-family:'Caacupe One',system-ui,sans-serif!important;font-style:normal!important;font-weight:400!important;
        font-size:12px!important;letter-spacing:1px!important;text-transform:uppercase!important;
      }
      select.stackup-open-list option{
        display:block!important;min-height:40px!important;padding:10px 12px!important;box-sizing:border-box!important;
        border:0!important;border-bottom:1px solid #27342D!important;background:#060907!important;color:#AEB8B1!important;
        font-family:'Caacupe One',system-ui,sans-serif!important;font-style:normal!important;font-weight:400!important;
        font-size:12px!important;letter-spacing:1px!important;text-transform:uppercase!important;
      }
      select.stackup-open-list option:checked{background:#8DFC3B!important;color:#020302!important}
      select.stackup-open-list option:disabled{opacity:.45!important}
      [data-stackup-drawer]{display:block!important;position:relative!important;inset:auto!important;z-index:auto!important;width:100%!important}
      [data-stackup-drawer] > [data-stackup-drawer-trigger]{display:none!important}
      [data-stackup-drawer] > [data-stackup-drawer-panel]{
        display:block!important;position:relative!important;inset:auto!important;z-index:auto!important;width:100%!important;
        max-height:none!important;overflow:visible!important;margin:6px 0 0!important;padding:0!important;
        border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;
      }
      [data-stackup-drawer-panel] button,[data-stackup-drawer-panel] [role="button"],[data-stackup-drawer-panel] a{
        display:flex!important;align-items:center!important;justify-content:flex-start!important;width:100%!important;
        min-height:40px!important;margin:0!important;padding:9px 4px!important;box-sizing:border-box!important;
        border:0!important;border-bottom:1px solid #27342D!important;border-radius:0!important;background:transparent!important;
        color:#AEB8B1!important;text-align:left!important;box-shadow:none!important;
      }
      [data-stackup-drawer-panel] button:last-child,[data-stackup-drawer-panel] [role="button"]:last-child,[data-stackup-drawer-panel] a:last-child{border-bottom:0!important}
      [data-stackup-drawer-panel] button:hover,[data-stackup-drawer-panel] button:focus-visible,[data-stackup-drawer-panel] [role="button"]:focus-visible,[data-stackup-drawer-panel] a:focus-visible{color:#8DFC3B!important;outline:none!important}
    `;
    (document.head||document.documentElement).appendChild(style);
  };

  const visibleRows=select=>Math.max(2,Math.min(8,Math.max(1,select.options?.length||0)));
  const syncSelect=select=>{
    if(!select||select.dataset.stackupInlineList!=='1')return;
    if(select.hidden||select.closest('[hidden]'))return;
    select.classList.add('stackup-open-list');
    select.setAttribute('size',String(visibleRows(select)));
    select.setAttribute('data-stackup-options-open','1');
    select.setAttribute('aria-expanded','true');
  };
  const enhanceSelect=select=>{
    if(!select||select.dataset.stackupInlineList==='1'||select.hidden||select.closest('[hidden]'))return;
    select.dataset.stackupInlineList='1';
    syncSelect(select);
    new MutationObserver(()=>syncSelect(select)).observe(select,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','selected','label','value','hidden','class','style']});
  };
  const enhanceDrawer=drawer=>{
    if(!drawer||drawer.dataset.stackupDrawerReady==='1')return;
    drawer.dataset.stackupDrawerReady='1';
    drawer.dataset.stackupOptionsOpen='1';
    drawer.classList.add('stackup-inline-options');
    const trigger=drawer.querySelector(':scope > [data-stackup-drawer-trigger]');
    const panel=drawer.querySelector(':scope > [data-stackup-drawer-panel]');
    if(trigger){trigger.hidden=true;trigger.setAttribute('aria-expanded','true')}
    if(panel){panel.hidden=false;panel.removeAttribute('aria-hidden')}
  };
  const apply=root=>{
    if(root?.matches?.('select'))enhanceSelect(root);
    root?.querySelectorAll?.('select').forEach(enhanceSelect);
    if(root?.matches?.('[data-stackup-drawer]'))enhanceDrawer(root);
    root?.querySelectorAll?.('[data-stackup-drawer]').forEach(enhanceDrawer);
  };
  const boot=()=>{
    addStyle();apply(document);
    new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)apply(n)}))).observe(document.documentElement,{childList:true,subtree:true});
    setInterval(()=>{apply(document);document.querySelectorAll('select[data-stackup-inline-list="1"]').forEach(syncSelect)},700);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();