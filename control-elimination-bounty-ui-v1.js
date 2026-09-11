(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cpf=p=>String(p?.cpf||p?.document||p?.identity?.cpf||'');
const code=p=>String(Math.max(0,+p?.table||0)).padStart(2,'0')+String(Math.max(0,+p?.seat||0)).padStart(2,'0');
function selected(){const box=$('hubSelectedPlayer');if(!box)return null;const id=box.dataset.playerId||window.__stackupHubSelectedPlayerId||'';if(id)return(state.players||[]).find(p=>String(p.id)===String(id))||null;const text=box.textContent||'';return(state.players||[]).find(p=>text.includes(String(p.name||''))&&p.name)||null}
function action(){const active=document.querySelector('.hubAction.active');return active?.dataset.action||''}
function isSpecial(){return['ELIMINATION','BOUNTY'].includes(action())}
function renderSpecial(){if(!isSpecial())return;const p=selected(),box=$('hubSelectedPlayer'),btn=$('hubConfirm');if(box&&p){box.dataset.playerId=String(p.id);box.innerHTML=`<div class="hubLabel">DADOS DO JOGADOR</div><div class="hubValue">${esc(p.name||'JOGADOR')}</div><div class="hubMeta">CPF ${esc(cpf(p)||'—')}</div><div class="hubMeta">MESA ${esc(p.table??'—')} • POSIÇÃO ${esc(p.seat??'—')} • CÓDIGO ${code(p)}</div>`}if(btn){btn.textContent=action()==='ELIMINATION'?'CONFIRMAR ELIMINAÇÃO':'CONFIRMAR BOUNTY';btn.dataset.specialAction=action()}}
function install(){const panel=$('hubActionPanel');if(!panel)return;document.addEventListener('click',e=>{const result=e.target.closest?.('.hubResult[data-player]');if(result){window.__stackupHubSelectedPlayerId=String(result.dataset.player||'');setTimeout(renderSpecial,0)}const act=e.target.closest?.('.hubAction');if(act)setTimeout(renderSpecial,0);const btn=e.target.closest?.('#hubConfirm');if(btn&&btn.dataset.specialAction){const kind=btn.dataset.specialAction;setTimeout(()=>{const status=$('hubConfirmStatus')?.textContent||'';if(/CONFIRM|REGISTR|SUCESS|ELIMIN|BOUNTY/i.test(status)){btn.textContent=kind==='ELIMINATION'?'ELIMINAÇÃO CONFIRMADA':'BOUNTY CONFIRMADO';btn.classList.add('active')}},50)}},true);const mo=new MutationObserver(()=>renderSpecial());mo.observe(panel,{subtree:true,childList:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,50),{once:true});else setTimeout(install,50);
})();