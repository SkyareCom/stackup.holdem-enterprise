(function(){
  'use strict';
  const loadUiStandard=()=>{if(document.querySelector('script[data-stackup-ui-standard]'))return;const s=document.createElement('script');s.src='ui-standard.js?v=publication0915';s.defer=true;s.dataset.stackupUiStandard='1';(document.head||document.documentElement).appendChild(s)};
  const loadInlineLists=()=>{if(document.querySelector('script[data-stackup-inline-lists]'))return;const s=document.createElement('script');s.src='in-app-lists.js?v=publication0915';s.defer=true;s.dataset.stackupInlineLists='1';(document.head||document.documentElement).appendChild(s)};
  const boot=()=>{loadUiStandard();loadInlineLists()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();