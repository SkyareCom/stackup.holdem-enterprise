(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
const $=id=>document.getElementById(id);
function inlineMetrics(){for(const id of ['hubOpenTables','hubFullTables','hubAlternateCount','hubBalancingCount']){const v=$(id),card=v?.closest('.hubInfo');if(!card)continue;card.classList.add('hubMetricInline');card.style.display='flex';card.style.flexDirection='row';card.style.alignItems='center';card.style.justifyContent='space-between';card.style.gap='10px';card.style.minHeight='44px';const label=card.querySelector('.hubLabel');if(label){label.style.margin='0';label.style.lineHeight='1.15'}v.style.margin='0';v.style.lineHeight='1.15';v.style.textAlign='right'}}
function moveTableList(){const hub=$('controlOperationalHub');if(!hub)return;const list=$('hubTables');if(list)list.style.display='none';const sections=[...hub.querySelectorAll('.section')];const sec=sections.find(x=>x.textContent.trim()==='LISTA DE MESAS');if(!sec)return;if($('openTournamentTables')){sec.style.display='none';return}const wrap=document.createElement('div');wrap.id='tableListButtonWrap';wrap.style.margin='18px 0 8px';wrap.innerHTML='<button id="openTournamentTables" class="hubBtn" type="button" style="width:100%;min-height:44px">LISTA DE MESAS</button>';sec.replaceWith(wrap);$('openTournamentTables').onclick=()=>location.href='tournament-tables.html'}
function apply(){inlineMetrics();moveTableList()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();setTimeout(apply,100)},{once:true});else{apply();setTimeout(apply,100)}
const mo=new MutationObserver(()=>apply());document.addEventListener('DOMContentLoaded',()=>{if(document.body)mo.observe(document.body,{childList:true,subtree:true})},{once:true});
})();