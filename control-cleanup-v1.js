(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
const $=id=>document.getElementById(id);
function cleanHub(){
 const hub=$('controlOperationalHub');if(!hub)return;
 const r=$('hubRegistrationsCount');if(r)r.style.display='none';
 const c=$('hubCheckinCount');if(c)c.style.display='none';
 // Bonus toggles: one single line, black text when active.
 for(const [btnId,stateId,label] of [['hubEarlyBonus','hubEarlyBonusState','EARLY BONUS'],['hubAddonBonusToggle','hubAddonBonusState','ADD ON BONUS']]){
   const b=$(btnId),x=$(stateId);if(!b||!x)continue;
   const active=x.textContent.trim()==='ATIVADO';
   b.style.display='flex';b.style.flexDirection='row';b.style.alignItems='center';b.style.justifyContent='center';b.style.gap='8px';b.style.lineHeight='1';b.style.whiteSpace='nowrap';
   b.childNodes[0].nodeValue=label+' ';
   x.style.display='inline';x.style.margin='0';x.style.lineHeight='1';x.style.color=active?'#020302':'#AEB8B1';
   if(active)b.style.color='#020302';
 }
 // Operational metrics: standard single-row cards with label left / value right.
 const metrics=[['hubOpenTables','MESAS ABERTAS'],['hubFullTables','MESAS COMPLETAS'],['hubAlternateCount','ALTERNATE'],['hubBalancingCount','BALANCING']];
 for(const [valueId,label] of metrics){const v=$(valueId),card=v?.closest('.hubInfo');if(!card)continue;const lab=card.querySelector('.hubLabel');if(lab)lab.textContent=label;card.style.minHeight='44px';card.style.display='flex';card.style.flexDirection='row';card.style.alignItems='center';card.style.justifyContent='space-between';card.style.gap='10px';card.style.padding='10px';if(lab){lab.style.margin='0';lab.style.lineHeight='1.15'}v.style.margin='0';v.style.lineHeight='1.15';v.style.fontSize='14px';v.style.textAlign='right'}
}
function cleanLegacy(){
 const main=document.querySelector('main.app');if(!main)return;
 const op=[...main.querySelectorAll('.section')].find(x=>x.textContent.trim()==='OPERAÇÃO DO TORNEIO');
 if(op){
   const links=op.nextElementSibling;
   if(links?.classList.contains('links')){
     const anchors=[...links.querySelectorAll('a')];
     const keepers=anchors.filter(a=>['dealer.html','staff.html'].includes((a.getAttribute('href')||'').toLowerCase()));
     if(keepers.length){
       const keep=document.createElement('div');keep.className='links';keep.id='staffDealerOnly';keepers.forEach(a=>keep.appendChild(a));links.replaceWith(keep);
     }else links.remove();
   }
   op.textContent='EQUIPE E DEALER';
 }
 const quick=[...main.querySelectorAll('.section')].find(x=>x.textContent.trim()==='AJUSTES RÁPIDOS');if(quick){const links=quick.nextElementSibling;if(links?.classList.contains('links'))links.remove();quick.remove()}
 const bottom=main.querySelector('.bottomActions');if(bottom)bottom.remove();
}
function apply(){cleanHub();cleanLegacy()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();setTimeout(apply,100)},{once:true});else{apply();setTimeout(apply,100)}
const mo=new MutationObserver(()=>apply());document.addEventListener('DOMContentLoaded',()=>{if(document.body)mo.observe(document.body,{childList:true,subtree:true})},{once:true});
})();