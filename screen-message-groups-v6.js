(()=>{
'use strict';
const api=window.StackupScreenMessages;if(!api)return;
const REGISTRATION_IDS=new Set(['lastRebuy','lastEntry','lastRebuyEntry']);
const groups=[
{id:'welcome',title:'BOAS VINDAS',ids:['welcome']},
{id:'levelStart',title:'INÍCIO DE NÍVEIS',ids:['levelAnte','levelNoAnte']},
{id:'levelEnd',title:'TÉRMINO DE NÍVEIS',ids:['level3','level1']},
{id:'breakStart',title:'INÍCIO DE INTERVALOS',ids:['break','meal','addon']},
{id:'breakEnd',title:'TÉRMINO DE INTERVALOS',ids:['resume']},
{id:'extrasAuto',title:'EXTRAS AUTOMÁTICAS',ids:['lastRebuy','lastEntry','lastRebuyEntry','bubble','h4h','itm','ftBubble','ft','alternate']},
{id:'extrasManual',title:'EXTRAS NÃO AUTOMÁTICAS',ids:['deal']}
];
function createManager(hostId,kind){
 const host=document.getElementById(hostId);if(!host)return null;
 const state=Object.fromEntries(groups.map(g=>[g.id,{open:false,selected:null,mode:'alert'}]));
 const cfg=()=>api.load();
 const lang=()=>cfg().voiceLang||api.officialLang();
 function eventName(){try{return window.state?.tournamentName||JSON.parse(localStorage.getItem('poker-club-state-v4')||'{}').tournamentName||'EVENTO'}catch(_){return'EVENTO'}}
 function textFor(id){if(id==='welcome'&&lang()==='pt')return `Bem vindos jogadores ao ${eventName()}. Excelente jogo a todos !!!`;return api.messageText(id,lang())}
 const labelFor=id=>api.PT.find(r=>r[0]===id)?.[1]||id;
 const rowsFor=g=>g.ids.map(id=>api.PT.find(r=>r[0]===id)).filter(Boolean);
 const forcedNoAlert=id=>kind==='spoken'&&REGISTRATION_IDS.has(id);
 function chooseGroup(id){const next=!state[id].open;groups.forEach(g=>{state[g.id].open=false;state[g.id].selected=null;state[g.id].mode='alert'});state[id].open=next;render()}
 function chooseMessage(g,id){state[g].selected=state[g].selected===id?null:id;if(forcedNoAlert(id))state[g].mode='noalert';render()}
 function setMode(g,mode){const id=state[g].selected;if(!id)return;if(forcedNoAlert(id)){state[g].mode='noalert'}else state[g].mode=mode;render()}
 function test(g){const s=state[g],id=s.selected;if(!id)return;const c=cfg(),l=lang();if(kind==='spoken'){const opt={lang:l,profileId:c.voiceProfile,repeat:c.voiceRepeat,volume:c.voiceVolume/100};if(s.mode==='noalert'||forcedNoAlert(id))api.speak(textFor(id),opt);else api.playAlertThenSpeak(textFor(id),opt)}else api.setAnnouncement(textFor(id))}
 function confirm(g){const s=state[g],id=s.selected;if(!id)return;api.toggle(kind,id,true);if(kind==='spoken'&&api.setSpokenNoAlert)api.setSpokenNoAlert(id,s.mode==='noalert'||forcedNoAlert(id));s.selected=null;s.mode='alert';render()}
 function messageRow(r,g,c){const id=r[0],selected=state[g.id].selected===id,active=!!c[kind]?.[id],registration=forcedNoAlert(id);return `<button type="button" class="msgPick ${selected?'selected':''}" data-pick="${id}" data-group="${g.id}"><span class="msgPickText"><b>${labelFor(id)}</b><small>${textFor(id)}</small>${active?'<em>ATIVA</em>':''}${registration?'<em>SEMPRE SEM ALERTA</em>':''}</span></button>`}
 function block(g){const s=state[g.id],c=cfg(),rows=rowsFor(g),activeCount=rows.filter(r=>!!c[kind]?.[r[0]]).length;if(!s.open)return `<button type="button" class="msgCategoryButton" data-category="${g.id}">${g.title}${activeCount?` • ${activeCount}`:''}</button>`;
 const selected=s.selected,registration=forcedNoAlert(selected),mode=s.mode;
 const controls=kind==='spoken'?`<div class="msgActionsFour"><button type="button" data-action="modeAlert" data-group="${g.id}" class="${mode==='alert'&&!registration?'active':''}" ${!selected||registration?'disabled':''}>ATIVAR COM ALERTA</button><button type="button" data-action="modeNoAlert" data-group="${g.id}" class="${mode==='noalert'||registration?'active':''}" ${!selected?'disabled':''}>ATIVAR SEM ALERTA</button><button type="button" data-action="test" data-group="${g.id}" ${!selected?'disabled':''}>TESTAR MENSAGEM</button><button type="button" data-action="confirm" data-group="${g.id}" ${!selected?'disabled':''}>CONFIRMAR ATIVAÇÃO</button></div>`:`<div class="msgActionsTwo"><button type="button" data-action="test" data-group="${g.id}" ${!selected?'disabled':''}>TESTAR MENSAGEM</button><button type="button" data-action="confirm" data-group="${g.id}" ${!selected?'disabled':''}>CONFIRMAR ATIVAÇÃO</button></div>`;
 return `<section class="msgGroup"><button type="button" class="msgCategoryButton active" data-category="${g.id}">${g.title}</button><div class="msgCategoryBody"><div class="msgList">${rows.map(r=>messageRow(r,g,c)).join('')}</div>${controls}</div></section>`}
 function bind(){host.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>chooseGroup(b.dataset.category));host.querySelectorAll('[data-pick]').forEach(b=>b.onclick=e=>{e.stopPropagation();chooseMessage(b.dataset.group,b.dataset.pick)});host.querySelectorAll('[data-action]').forEach(b=>b.onclick=e=>{e.stopPropagation();const g=b.dataset.group,a=b.dataset.action;if(a==='modeAlert')setMode(g,'alert');else if(a==='modeNoAlert')setMode(g,'noalert');else if(a==='test')test(g);else if(a==='confirm')confirm(g)})}
 function render(){host.innerHTML=groups.map(block).join('');bind()}
 render();return{render};
}
const style=document.createElement('style');style.textContent=`#spokenMessages,#writtenMessages{display:grid;gap:8px}.msgGroup{border:0!important;background:transparent!important;padding:0!important}.msgCategoryButton{width:100%!important;text-align:left!important;padding:12px!important}.msgCategoryButton.active{background:#0B100D!important;color:#fff!important}.msgCategoryBody{padding:10px 0 14px}.msgList{display:grid;gap:7px}.msgPick{display:block!important;width:100%!important;text-align:left!important;background:#020302!important;border:0!important;border-radius:0!important;padding:10px!important;box-shadow:none!important}.msgPick.selected{background:#0B100D!important}.msgPickText{display:grid;gap:4px}.msgPickText b{color:#fff!important}.msgPickText small{color:#AEB8B1!important;line-height:1.35!important;font-weight:300!important}.msgPickText em{font-style:normal;color:#8DFC3B!important;font-weight:400!important}.msgActionsFour{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.msgActionsTwo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.msgActionsFour button.active{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}@media(max-width:700px){.msgActionsFour,.msgActionsTwo{grid-template-columns:1fr}}`;document.head.appendChild(style);
const managers=[createManager('spokenMessages','spoken'),createManager('writtenMessages','written')].filter(Boolean);
window.addEventListener('stackup-screen-message-config',()=>managers.forEach(m=>m.render()));
})();