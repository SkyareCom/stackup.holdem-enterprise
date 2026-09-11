(()=>{
'use strict';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const SENSITIVE=new Set(['wallet.html','finance.html','finance-settings.html','crm.html','communications.html','bounty.html','tournament-close.html']);
if(!SENSITIVE.has(page)||typeof window.state==='undefined')return;
const mutationIds=page==='wallet.html'?['addCredit','purchaseBtn','awardBtn','withdrawBtn']:page==='crm.html'?['createCampaign']:[];
const setPending=on=>mutationIds.forEach(id=>{const b=document.getElementById(id);if(b){if(on){b.dataset.authPendingDisabled=b.disabled?'1':'0';b.disabled=true}else if(b.dataset.authPendingDisabled==='0'){b.disabled=false;delete b.dataset.authPendingDisabled}}});
const apply=()=>{
  if(!window.StackupAuth)return false;
  const ok=window.StackupAuth.guard();
  if(ok)setPending(false);
  return true;
};
const load=()=>{
  setPending(true);
  if(apply())return;
  let s=[...document.scripts].find(x=>(x.getAttribute('src')||'').split('?')[0].endsWith('auth-engine.js'));
  if(s){s.addEventListener('load',apply,{once:true});setTimeout(apply,100);return}
  s=document.createElement('script');s.src='auth-engine.js?v=publication0914';s.dataset.stackupSensitiveAuth='1';s.onload=apply;(document.head||document.documentElement).appendChild(s);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();