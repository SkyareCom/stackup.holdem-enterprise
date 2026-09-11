(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='setup.html')return;
  function normalizeConfirm(){const legacy=document.getElementById('setupDataActions');const primary=document.getElementById('confirmTournamentData');if(legacy&&primary)legacy.remove()}
  function boot(){normalizeConfirm();const root=document.body||document.documentElement;if(root)new MutationObserver(normalizeConfirm).observe(root,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();