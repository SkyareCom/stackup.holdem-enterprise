(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
const item=(t,code)=>String(t.itemCode||t.payment?.reference||'').toUpperCase()===code;
const currentTx=()=> (state.transactions||[]).filter(t=>t.eventId===state.eventId&&t.status!=='cancelled'&&t.status!=='void');
function metrics(){
  const tx=currentTx();
  const buy=tx.filter(t=>t.type==='ENTRY').length;
  const r1=tx.filter(t=>item(t,'REBUY_I')||(!t.itemCode&&!t.payment?.reference&&t.type==='REBUY')).length;
  const r2=tx.filter(t=>item(t,'REBUY_II')||(!t.itemCode&&!t.payment?.reference&&t.type==='DOUBLE_REBUY')).length;
  const re=tx.filter(t=>t.type==='REENTRY').length;
  const a1=tx.filter(t=>item(t,'ADDON_I')).length;
  const a2=tx.filter(t=>item(t,'ADDON_II')).length;
  const early=tx.filter(t=>t.type==='BONUS'&&item(t,'EARLY_BONUS')).length;
  const addonBonus=tx.filter(t=>t.type==='BONUS'&&item(t,'ADDON_BONUS')).length;
  return{buy,r1,r2,re,a1,a2,early,addonBonus};
}
function setText(id,value){const el=document.getElementById(id);if(el)el.textContent=String(value)}
function install(){
  const bonus=document.getElementById('miniBonus');
  if(bonus){const label=bonus.closest('.infoCard')?.querySelector('.infoLabel');if(label)label.textContent='EARLY BONUS';}
  if(!document.getElementById('miniAddonBonus')){
    const a2=document.getElementById('miniAddon2')?.closest('.infoCard');
    if(a2){const card=document.createElement('div');card.className='infoCard';card.innerHTML='<span class="infoLabel">ADD ON BONUS</span><span id="miniAddonBonus" class="infoValue">0</span>';a2.insertAdjacentElement('afterend',card)}
  }
}
function render(){
  install();
  const m=metrics();
  setText('name',state.tournamentName||'TORNEIO');
  setText('status',state.eventId?'ATIVO':'INATIVO');
  setText('miniPlayers',`${Number(state.playersLeft)||0}/${Number(state.field)||0}`);
  setText('miniBuyins',m.buy);
  setText('miniReentries',m.re);
  setText('miniRebuy1',m.r1);
  setText('miniRebuy2',m.r2);
  setText('miniAddon1',m.a1);
  setText('miniAddon2',m.a2);
  setText('miniBonus',m.early);
  setText('miniAddonBonus',m.addonBonus);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();setInterval(render,250)},{once:true});else{render();setInterval(render,250)}
const prev=window.onPokerStateChange;window.onPokerStateChange=s=>{if(typeof prev==='function')prev(s);render()};
})();