(function(){
  if(typeof document==='undefined'||window.__stackupClickableListDrawer)return;
  window.__stackupClickableListDrawer=true;

  const bypass=new WeakSet();
  const drawers=new WeakMap();
  const itemSelector='button.templateCard,a.templateCard,.readyList>button,.readyList>a,.list>button,.list>a,[id$="List"]>button,[id$="List"]>a,button.rebuyRequest,.listRow[role="button"],.row[role="button"],.listRow[onclick],.row[onclick]';
  const style=document.createElement('style');
  style.id='stackup-clickable-list-drawer-style';
  style.textContent=`
    .stackup-click-list-item{position:relative!important}
    .stackup-click-list-item:not(.stackup-list-expanded)>.tag,
    .stackup-click-list-item:not(.stackup-list-expanded)>.desc,
    .stackup-click-list-item:not(.stackup-list-expanded)>span:not(.name):not(:first-child),
    .stackup-click-list-item:not(.stackup-list-expanded)>.meta,
    .stackup-click-list-item:not(.stackup-list-expanded)>.purchases,
    .stackup-click-list-item:not(.stackup-list-expanded)>.total{display:none!important}
    .stackup-list-drawer{width:100%;box-sizing:border-box;margin:6px 0 10px;padding:12px;border:1px solid #27342D;border-radius:9px;background:linear-gradient(#0B100D,#060907)}
    .stackup-list-drawer .stackup-list-detail{color:#AEB8B1;font-size:12px;line-height:1.45;white-space:normal;overflow-wrap:anywhere}
    .stackup-list-drawer .stackup-list-actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:10px}
    .stackup-list-drawer button{width:100%;min-height:44px;margin:0;padding:10px 12px;border:1px solid #8DFC3B;border-radius:9px;background:#060907;color:#8DFC3B;font:inherit;text-transform:uppercase;letter-spacing:1px;cursor:pointer}
  `;
  (document.head||document.documentElement).appendChild(style);

  const isCandidate=el=>{
    if(!(el instanceof HTMLElement)||el.closest('[data-stackup-inline-ui]')||el.closest('.stackup-row-actions'))return false;
    if(el.closest('#tournamentList'))return false;
    if(el.classList.contains('stackup-compact-row')||el.closest('.stackup-compact-row'))return false;
    return el.matches(itemSelector);
  };
  const nameText=item=>{
    const name=item.querySelector('.name,:scope>b,:scope>.rowContent>b,:scope>.historyInfo>b');
    return (name?.textContent||item.textContent||'ITEM').trim().replace(/\s+/g,' ');
  };
  const detailText=item=>{
    const nodes=[...item.querySelectorAll('.tag,.desc,.meta,.purchases,.total,:scope>span')].filter(n=>!n.classList.contains('name'));
    const parts=nodes.map(n=>n.textContent.trim()).filter(Boolean);
    return [...new Set(parts)].join(' • ');
  };
  const labelFor=item=>item.matches('a,[href]')||/ABRIR|GESTÃO|TORNEIO|HISTÓRICO|DETALHES/.test(nameText(item).toUpperCase())?'ABRIR':'SELECIONAR';
  const closeOthers=current=>document.querySelectorAll('.stackup-list-drawer').forEach(d=>{if(d!==current)d.remove()});
  const openDrawer=item=>{
    const existing=drawers.get(item);if(existing?.isConnected){existing.remove();drawers.delete(item);item.classList.remove('stackup-list-expanded');return}
    closeOthers(null);document.querySelectorAll('.stackup-click-list-item.stackup-list-expanded').forEach(x=>x.classList.remove('stackup-list-expanded'));
    item.classList.add('stackup-click-list-item','stackup-list-expanded');
    const drawer=document.createElement('div');drawer.className='stackup-list-drawer';drawer.setAttribute('data-stackup-inline-ui','1');
    const detail=detailText(item),label=labelFor(item);
    drawer.innerHTML=`<div class="stackup-list-detail">${detail||nameText(item)}</div><div class="stackup-list-actions"><button type="button" data-stackup-list-run data-stackup-inline-ui="1">${label}</button></div>`;
    item.insertAdjacentElement('afterend',drawer);drawers.set(item,drawer);
    drawer.querySelector('[data-stackup-list-run]').onclick=e=>{e.stopPropagation();bypass.add(item);drawer.remove();drawers.delete(item);item.classList.remove('stackup-list-expanded');item.click()};
  };

  document.addEventListener('click',event=>{
    const item=event.target.closest?.(itemSelector);if(!isCandidate(item))return;
    if(bypass.has(item)){bypass.delete(item);return}
    event.preventDefault();event.stopImmediatePropagation();openDrawer(item);
  },true);
})();
