(()=>{
'use strict';
const A=window.StackupAlertAudio;
let host=document.getElementById('alertManager');
if(!host){
 const heading=[...document.querySelectorAll('.section')].find(el=>el.textContent.trim().startsWith('1. ALERTAS SONOROS'));
 const block=heading?.nextElementSibling;
 if(block){block.innerHTML='<div id="alertManager"></div>';host=document.getElementById('alertManager')}
}
if(!A||!host)return;
const MEM_KEY='stackupAlertPresetMemoriesV1';
const ACTIVE_KEY='stackupAlertActiveV1';
const MOMENTS=[
 ['levelStart','INÍCIO DO NÍVEL'],
 ['levelEnd','TÉRMINO DO NÍVEL'],
 ['fiveMin','5 MINUTOS'],
 ['threeMin','3 MINUTOS'],
 ['oneMin','1 MINUTO'],
 ['tournamentStart','INÍCIO DO TORNEIO'],
 ['bubbleItm','BOLHA ITM'],
 ['itm','ITM'],
 ['bubbleFt','BOLHA FT'],
 ['ft','FT']
];
let open=false;
let momentsOpen=false;
let selected=A.load().preset||A.PRESETS[0][0];
let draft={pitch:0,repeats:1,moments:[]};
function loadMem(){try{return JSON.parse(localStorage.getItem(MEM_KEY)||'{}')||{}}catch(_){return{}}}
function saveMem(mem){localStorage.setItem(MEM_KEY,JSON.stringify(mem))}
function activeId(){return localStorage.getItem(ACTIVE_KEY)||A.load().preset||''}
function setActive(id){localStorage.setItem(ACTIVE_KEY,id)}
function loadDraft(){const mem=loadMem(),base=A.load(),m=mem[selected]||{};draft={pitch:Number.isFinite(+m.pitch)?+m.pitch:(base.preset===selected?+base.pitch||0:0),repeats:Number.isFinite(+m.repeats)?Math.max(1,Math.min(8,+m.repeats||1)):(base.preset===selected?Math.max(1,Math.min(8,+base.repeats||1)):1),moments:Array.isArray(m.moments)?[...m.moments]:[]}}
function saveSelectedMemory(){const mem=loadMem();mem[selected]={...(mem[selected]||{}),pitch:+draft.pitch||0,repeats:Math.max(1,Math.min(8,+draft.repeats||1)),moments:[...draft.moments]};saveMem(mem)}
function memorize(){saveSelectedMemory();render('CONFIGURAÇÃO MEMORIZADA')}
function test(){A.play({...A.load(),preset:selected,pitch:+draft.pitch||0,repeats:Math.max(1,+draft.repeats||1)})}
function activate(){const current=A.load();A.save({...current,preset:selected,pitch:+draft.pitch||0,repeats:Math.max(1,+draft.repeats||1)});setActive(selected);saveSelectedMemory();render('ALERTA ATIVADO')}
function pick(id){selected=id;momentsOpen=false;loadDraft();render()}
function toggleMoment(id){draft.moments=draft.moments.includes(id)?draft.moments.filter(x=>x!==id):[...draft.moments,id];saveSelectedMemory();render()}
function row(p){const on=selected===p[0];return `<button type="button" class="alertPick ${on?'selected':''}" data-alert-id="${p[0]}" aria-pressed="${on?'true':'false'}">${p[1]}</button>`}
function momentRow(m){const on=draft.moments.includes(m[0]);return `<button type="button" class="momentPick ${on?'selected':''}" data-moment-id="${m[0]}" aria-pressed="${on?'true':'false'}">${m[1]}</button>`}
function render(status=''){
 const active=activeId()===selected;
 host.innerHTML=`<button type="button" class="alertMainButton" id="toggleAlertList">SELECIONAR ALERTAS</button>${open?`<div class="alertPanel"><div class="alertList">${A.PRESETS.map(row).join('')}</div><div class="alertConfig"><label class="alertControl"><span>PITCH</span><b id="alertPitchValue">${draft.pitch} ST</b><input id="alertPitch" type="range" min="-24" max="24" step="1" value="${draft.pitch}"></label><label class="alertControl"><span>REPETIÇÕES</span><b id="alertRepeatValue">${draft.repeats}X</b><input id="alertRepeat" type="range" min="1" max="8" step="1" value="${draft.repeats}"></label></div><button type="button" class="momentMainButton ${draft.moments.length?'hasSelection':''}" id="toggleMomentList">MOMENTO DO ALERTA${draft.moments.length?' • '+draft.moments.length:''}</button>${momentsOpen?`<div class="momentList">${MOMENTS.map(momentRow).join('')}</div>`:''}<div class="alertActions"><button type="button" id="memorizeAlert">MEMORIZAR PITCH E REPETIÇÕES</button><button type="button" id="testAlert">TESTAR</button><button type="button" id="activateAlert" class="${active?'active':''}">${active?'ALERTA ATIVADO':'ATIVAR ALERTA'}</button></div>${status?`<div class="alertStatus">${status}</div>`:''}</div>`:''}`;
 document.getElementById('toggleAlertList').onclick=()=>{open=!open;momentsOpen=false;render()};
 host.querySelectorAll('[data-alert-id]').forEach(b=>b.onclick=()=>pick(b.dataset.alertId));
 const momentBtn=document.getElementById('toggleMomentList');if(momentBtn)momentBtn.onclick=()=>{momentsOpen=!momentsOpen;render()};
 host.querySelectorAll('[data-moment-id]').forEach(b=>b.onclick=()=>toggleMoment(b.dataset.momentId));
 const p=document.getElementById('alertPitch'),r=document.getElementById('alertRepeat');
 if(p)p.oninput=e=>{draft.pitch=+e.target.value;document.getElementById('alertPitchValue').textContent=draft.pitch+' ST'};
 if(r)r.oninput=e=>{draft.repeats=+e.target.value;document.getElementById('alertRepeatValue').textContent=draft.repeats+'X'};
 const m=document.getElementById('memorizeAlert'),t=document.getElementById('testAlert'),a=document.getElementById('activateAlert');
 if(m)m.onclick=memorize;if(t)t.onclick=test;if(a)a.onclick=activate;
}
const style=document.createElement('style');style.textContent=`
#alertManager{display:grid;gap:8px}.alertMainButton,.momentMainButton{width:100%!important}.alertPanel{margin-top:8px;border:1px solid #27342D;border-radius:9px;background:linear-gradient(#0B100D,#060907);padding:10px}.alertList,.momentList{display:grid;gap:7px}.alertPick,.momentPick{display:block!important;width:100%!important;text-align:left!important;background:#020302!important;border:1px solid #27342D!important;padding:10px!important}.alertPick.selected,.momentPick.selected{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}.alertConfig{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.alertControl{display:grid;grid-template-columns:1fr auto;gap:8px;padding:10px;border:1px solid #27342D;border-radius:9px}.alertControl input{grid-column:1/-1;width:100%;accent-color:#8DFC3B}.momentMainButton{margin-top:10px!important}.momentMainButton.hasSelection{border-color:#8DFC3B!important}.momentList{margin-top:8px}.alertActions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.alertActions button.active{background:#8DFC3B!important;color:#020302!important}.alertStatus{margin-top:8px;color:#8DFC3B}@media(max-width:700px){.alertConfig,.alertActions{grid-template-columns:1fr}}
`;document.head.appendChild(style);
loadDraft();render();
})();