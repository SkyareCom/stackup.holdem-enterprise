(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
const $=id=>document.getElementById(id);
const n=v=>Math.max(0,+v||0);
const money=v=>'R$ '+n(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const item=t=>String(t?.itemCode||t?.payment?.reference||'').toUpperCase();
const tx=()=>Array.isArray(state.transactions)?state.transactions.filter(t=>t.eventId===state.eventId&&t.status!=='cancelled'&&t.status!=='void'):[];
function qtyOf(t){return Math.max(1,+t.quantity||1)}
function unitValue(t){if(Number.isFinite(+t.value)&&+t.value>0)return +t.value;const p=t.payment||{};if(Number.isFinite(+p.amount)&&+p.amount>0)return +p.amount;if(Number.isFinite(+p.totalAmount)&&+p.totalAmount>0)return +p.totalAmount;return 0}
function totalValue(t){const q=qtyOf(t),p=t.payment||{};if(Number.isFinite(+p.totalAmount)&&+p.totalAmount>0)return +p.totalAmount;if(Number.isFinite(+t.value)&&+t.value>0)return (+t.value)*q;if(Number.isFinite(+p.amount)&&+p.amount>0)return (+p.amount)*q;return 0}
const funding=t=>['ENTRY','REENTRY','REBUY','DOUBLE_REBUY','ADDON','BONUS'].includes(String(t.type||'').toUpperCase())||['REBUY_I','REBUY_II','ADDON_I','ADDON_II','EARLY_BONUS','ADDON_BONUS'].includes(item(t));
const expense=t=>['PAYOUT','BOUNTY_PAYOUT','EXPENSE','REFUND'].includes(String(t.type||'').toUpperCase())||(+t.value||0)<0;
function eventTotals(){let gross=0,expenses=0;for(const t of tx()){const val=Math.abs(totalValue(t));if(funding(t))gross+=val;if(expense(t))expenses+=val}return{gross,expenses,final:gross-expenses}}
const defs=[
 {id:'miniBuyins',label:'BUY INS',filter:t=>t.type==='ENTRY',unit:()=>n(state.buyin)},
 {id:'miniRebuy1',label:'REBUY I',filter:t=>item(t)==='REBUY_I'||(!item(t)&&t.type==='REBUY'),unit:()=>n(state.rebuyValue)},
 {id:'miniRebuy2',label:'REBUY II',filter:t=>item(t)==='REBUY_II'||(!item(t)&&t.type==='DOUBLE_REBUY'),unit:()=>n(state.doubleRebuyValue)},
 {id:'miniReentries',label:'REENTRADAS',filter:t=>t.type==='REENTRY',unit:()=>n(state.reentryValue||state.buyin)},
 {id:'miniAddon1',label:'ADD ON I',filter:t=>item(t)==='ADDON_I',unit:()=>n(state.addonValue)},
 {id:'miniAddon2',label:'ADD ON II',filter:t=>item(t)==='ADDON_II',unit:()=>n(state.specialAddonValue)},
 {id:'miniBonus',label:'EARLY BONUS',filter:t=>item(t)==='EARLY_BONUS'||t.type==='EARLY_BONUS',unit:()=>n(state.earlyBonusValue)},
 {id:'miniAddonBonus',label:'ADD ON BONUS',filter:t=>item(t)==='ADDON_BONUS'||t.type==='ADDON_BONUS',unit:()=>n(state.addonBonusValue)}
];
function installStyle(){if($('financialCompactStyle'))return;const s=document.createElement('style');s.id='financialCompactStyle';s.textContent=`
#eventFinancialRow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}
.txCompact{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;min-height:52px!important;flex-wrap:nowrap!important}
.txCompact .infoLabel{flex:0 0 auto!important}.txCompact .txCompactDetails{margin-left:auto;display:flex;align-items:center;justify-content:flex-end;gap:12px;min-width:0;white-space:nowrap;font-size:11px}.txCompact .txCompactDetails b{color:#fff;font-weight:400}.txCompact .txCompactDetails span{color:#AEB8B1}
@media(max-width:700px){#eventFinancialRow{grid-template-columns:1fr}.txCompact .txCompactDetails{gap:8px;font-size:10px}.txCompact{padding:10px!important}}
`;document.head.appendChild(s)}
function installEventCards(){const title=[...document.querySelectorAll('.section')].find(x=>x.textContent.trim()==='EVENTO');if(!title)return;const grid=title.nextElementSibling;if(!grid)return;let row=$('eventFinancialRow');if(!row){row=document.createElement('div');row.id='eventFinancialRow';row.innerHTML='<div class="infoCard"><span class="infoLabel">ARRECADADO</span><span id="eventGross" class="infoValue"></span></div><div class="infoCard"><span class="infoLabel">DESPESAS</span><span id="eventExpenses" class="infoValue"></span></div><div class="infoCard"><span class="infoLabel">VALOR FINAL</span><span id="eventFinal" class="infoValue"></span></div>';grid.insertAdjacentElement('afterend',row)}}
function removeStatusSection(){const sec=[...document.querySelectorAll('.section')].find(x=>x.textContent.trim()==='STATUS DO EVENTO');if(!sec)return;const grid=sec.nextElementSibling;if(grid?.classList.contains('grid'))grid.remove();sec.remove()}
function restoreCard(card){card.style.removeProperty('display');card.style.removeProperty('grid-template-columns');card.style.removeProperty('align-items');card.style.removeProperty('gap');card.querySelector('.txCardDetails')?.remove()}
function enhanceSummaryCards(){for(const d of defs){const val=$(d.id);if(!val)continue;const card=val.closest('.infoCard');if(!card)continue;restoreCard(card);card.classList.add('txCompact');const label=card.querySelector('.infoLabel');if(label)label.textContent=d.label;val.style.display='none';let details=card.querySelector('.txCompactDetails');if(!details){details=document.createElement('div');details.className='txCompactDetails';details.innerHTML='<span>VALOR <b class="txUnit">R$ 0,00</b></span><span>ARRECADADO <b class="txGross">R$ 0,00</b></span><span>QTD <b class="txQty">0</b></span>';card.appendChild(details)}}}
function render(){installStyle();installEventCards();removeStatusSection();enhanceSummaryCards();const totals=eventTotals();if($('eventGross'))$('eventGross').textContent=money(totals.gross);if($('eventExpenses'))$('eventExpenses').textContent=money(totals.expenses);if($('eventFinal'))$('eventFinal').textContent=money(totals.final);const rows=tx();for(const d of defs){const val=$(d.id);if(!val)continue;const card=val.closest('.infoCard'),matched=rows.filter(d.filter),qty=matched.reduce((a,t)=>a+qtyOf(t),0),gross=matched.reduce((a,t)=>a+Math.abs(totalValue(t)),0);let unit=d.unit();if(!unit&&matched.length)unit=unitValue(matched[0]);const details=card?.querySelector('.txCompactDetails');if(details){details.querySelector('.txUnit').textContent=money(unit);details.querySelector('.txGross').textContent=money(gross);details.querySelector('.txQty').textContent=String(qty)}}}
function boot(){render();setInterval(render,500);const prev=window.onPokerStateChange;window.onPokerStateChange=s=>{if(typeof prev==='function')prev(s);render()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();