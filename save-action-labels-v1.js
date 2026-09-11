(()=>{
'use strict';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const labels={
  'finance-settings.html':[['save','SALVAR CONFIGURAÇÕES FINANCEIRAS'],['savePlayerRule','SALVAR REGRA DO JOGADOR']]
};
function apply(){for(const [id,text] of labels[page]||[]){const b=document.getElementById(id);if(b)b.textContent=text}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();