(()=>{
'use strict';
const api=window.StackupScreenMessages;
if(!api)return;

const groups=[
 {id:'welcome',title:'BOAS VINDAS',ids:['welcome']},
 {id:'levelStart',title:'INÍCIO DE NÍVEIS',ids:['levelAnte','levelNoAnte']},
 {id:'levelEnd',title:'TÉRMINO DE NÍVEIS',ids:['level3','level1']},
 {id:'register',title:'MENSAGENS DE REGISTRO',ids:['lastRebuy','lastEntry','lastRebuyEntry'],alwaysNoAlert:true},
 {id:'breakStart',title:'INÍCIO DE INTERVALOS',ids:['break','meal','addon']},
 {id:'breakEnd',title:'TÉRMINO DE INTERVALOS',ids:['resume']},
 {id:'extras',title:'EXTRAS',ids:['bubble','h4h','itm','ftBubble','ft','deal','alternate']}
];

function createManager(hostId,kind){
 const host=document.getElementById(hostId);if(!host)return null;
 const selected=Object.fromEntries(groups.map(g=>[g.id,null]));
 const activeSelected=Object.fromEntries(groups.map(g=>[g.id,null]));
 const open=Object.fromEntries(groups.map(g=>[g.id,{panel:false,activate:false,noAlert:false,active:false,edit:false,deleteArmed:false}]));
 function cfg(){return api.load()}
 function lang(){const c=cfg();return c.voiceLang||api.officialLang()}
 function rowsFor(g){return g.ids.map(id=>api.PT.find(r=>r[0]===id)).filter(Boolean)}
 function eventName(){try{return window.state?.tournamentName||JSON.parse(localStorage.getItem('poker-club-state-v4')||'{}').tournamentName||'EVENTO'}catch(_){return'EVENTO'}}
 function textFor(id){
   if(id==='welcome'&&lang()==='pt')return `Bem vindos jogadores ao ${eventName()}. Excelente jogo a todos !!!`;
   return api.messageText(id,lang())
 }
 function labelFor(id){return api.PT.find(r=>r[0]===id)?.[1]||id}
 function groupById(id){return groups.find(g=>g.id===id)}
 function setOnly(which,group,id){which[group]=which[group]===id?null:id;render()}
 function closeActions(group){const s=open[group];s.activate=false;s.noAlert=false;s.active=false;s.edit=false;s.deleteArmed=false;selected[group]=null;activeSelected[group]=null}
 function togglePanel(group){const next=!open[group].panel;groups.forEach(g=>{open[g.id].panel=false;closeActions(g.id)});open[group].panel=next;render()}
 function test(group,noAlert=false){const id=selected[group]||activeSelected[group];if(!id)return;const c=cfg(),l=lang(),g=groupById(group);if(kind==='spoken'){const opt={lang:l,profileId:c.voiceProfile,repeat:c.voiceRepeat,volume:c.voiceVolume/100};if(noAlert||g?.alwaysNoAlert)api.speak(textFor(id),opt);else api.playAlertThenSpeak(textFor(id),opt)}else api.setAnnouncement(textFor(id))}
 function activate(group,noAlert=false){const id=selected[group];if(!id)return;const g=groupById(group),forceNoAlert=kind==='spoken'&&!!g?.alwaysNoAlert;api.toggle(kind,id,true);if(kind==='spoken'&&api.setSpokenNoAlert)api.setSpokenNoAlert(id,forceNoAlert||!!noAlert);selected[group]=null;open[group].activate=false;open[group].noAlert=false;open[group].active=true;render()}
 function erase(group){const id=activeSelected[group];if(!id||!open[group].deleteArmed)return;api.toggle(kind,id,false);activeSelected[group]=null;open[group].deleteArmed=false;render()}
 function messageButton(id,isSelected,disabled,pickKind,group){return `<button type="button" class="msgPick ${isSelected?'selected':''}" data-pick="${pickKind}" data-group="${group}" data-id="${id}" ${disabled?'disabled':''} aria-pressed="${isSelected?'true':'false'}"><span class="msgPickText"><b>${labelFor(id)}</b><small>${textFor(id)}</small></span></button>`}
 function block(g){
  const c=cfg(),rows=rowsFor(g),activeRows=rows.filter(r=>!!c[kind]?.[r[0]]),availableRows=rows.filter(r=>!c[kind]?.[r[0]]),s=open[g.id];
  if(!s.panel)return `<button type="button" class="msgCategoryButton" data-category="${g.id}">${g.title}${activeRows.length?` • ${activeRows.length}`:''}</button>`;
  const noAlertMode=kind==='spoken'&&(g.alwaysNoAlert||s.noAlert);
  const actionButtons=kind==='spoken'?(noAlertMode?`<div class="msgPanelActions"><button type="button" data-msg-action="testNoAlert" data-group="${g.id}" ${!selected[g.id]?'disabled':''}>TESTAR MENSAGEM SEM ALERTA</button><button type="button" data-msg-action="confirmNoAlert" data-group="${g.id}" ${!selected[g.id]?'disabled':''}>ATIVAR MENSAGEM SEM ALERTA</button></div>`:`<div class="msgPanelActions"><button type="button" data-msg-action="test" data-group="${g.id}" ${!selected[g.id]?'disabled':''}>TESTAR MENSAGEM</button><button type="button" data-msg-action="confirm" data-group="${g.id}" ${!selected[g.id]?'disabled':''}>ATIVAR MENSAGEM</button></div>`):`<div class="msgPanelActions"><button type="button" data-msg-action="test" data-group="${g.id}" ${!selected[g.id]?'disabled':''}>TESTAR MENSAGEM</button><button type="button" data-msg-action="confirm" data-group="${g.id}" ${!selected[g.id]?'disabled':''}>ATIVAR MENSAGEM</button></div>`;
  const activateList=s.activate?`<div class="msgPanel"><div class="msgModeTitle">${noAlertMode?'ATIVAR MENSAGEM SEM ALERTA':'ATIVAR MENSAGEM'}</div>${availableRows.length?`<div class="msgList">${availableRows.map(r=>messageButton(r[0],selected[g.id]===r[0],false,'new',g.id)).join('')}</div>${actionButtons}`:`<div class="msgEmpty">TODAS AS MENSAGENS DESTE BLOCO JÁ ESTÃO ATIVAS.</div>`}</div>`:'';
  const activeList=s.active?`<div class="msgPanel activePanel"><div class="msgActiveHead"><span>${activeRows.length?activeRows.length+' MENSAGEM(NS) ATIVA(S)':'NENHUMA MENSAGEM ATIVA'}</span><button type="button" data-msg-action="edit" data-group="${g.id}" ${!activeRows.length?'disabled':''}>${s.edit?'FINALIZAR EDIÇÃO':'EDITAR'}</button></div>${activeRows.length?`<div class="msgList">${activeRows.map(r=>messageButton(r[0],activeSelected[g.id]===r[0],!s.edit,'active',g.id)).join('')}</div>`:''}${s.edit&&activeRows.length?`<div class="msgPanelActions"><button type="button" class="danger" data-msg-action="delete" data-group="${g.id}" ${!activeSelected[g.id]?'disabled':''}>APAGAR MENSAGEM</button><button type="button" data-msg-action="deleteConfirm" data-group="${g.id}" ${!activeSelected[g.id]||!s.deleteArmed?'disabled':''}>${s.deleteArmed?'CONFIRMAR PARA APAGAR':'CONFIRMAR'}</button></div>`:''}</div>`:'';
  const controls=kind==='spoken'?(g.alwaysNoAlert?`<div class="msgGroupButtons"><button type="button" data-msg-action="activateNoAlertOpen" data-group="${g.id}">ATIVAR MENSAGEM SEM ALERTA</button><button type="button" data-msg-action="activeOpen" data-group="${g.id}">MENSAGENS ATIVAS${activeRows.length?' • '+activeRows.length:''}</button></div>`:`<div class="msgGroupButtons msgGroupButtonsVoice"><button type="button" data-msg-action="activateOpen" data-group="${g.id}">ATIVAR MENSAGEM</button><button type="button" data-msg-action="activateNoAlertOpen" data-group="${g.id}">ATIVAR MENSAGEM SEM ALERTA</button><button type="button" data-msg-action="activeOpen" data-group="${g.id}">MENSAGENS ATIVAS${activeRows.length?' • '+activeRows.length:''}</button></div>`):`<div class="msgGroupButtons"><button type="button" data-msg-action="activateOpen" data-group="${g.id}">ATIVAR MENSAGEM</button><button type="button" data-msg-action="activeOpen" data-group="${g.id}">MENSAGENS ATIVAS${activeRows.length?' • '+activeRows.length:''}</button></div>`;
  const note=g.alwaysNoAlert&&kind==='spoken'?'<div class="msgRegisterNote">SE ATIVADAS, ESTAS MENSAGENS SÃO SEMPRE VEICULADAS SEM ALERTA.</div>':'';
  return `<section class="msgGroup"><button type="button" class="msgCategoryButton active" data-category="${g.id}">${g.title}</button><div class="msgCategoryBody">${note}${controls}${activateList}${activeList}</div></section>`
 }
 function bind(){
  host.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>togglePanel(b.dataset.category));
  host.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{if(b.disabled)return;const group=b.dataset.group;if(b.dataset.pick==='new')setOnly(selected,group,b.dataset.id);else{setOnly(activeSelected,group,b.dataset.id);open[group].deleteArmed=false}});
  host.querySelectorAll('[data-msg-action]').forEach(b=>b.onclick=e=>{e.stopPropagation();const g=b.dataset.group,a=b.dataset.msgAction,def=groupById(g);if(a==='activateOpen'){open[g].activate=!open[g].activate;open[g].noAlert=!!def?.alwaysNoAlert;if(open[g].activate)open[g].active=false;selected[g]=null}else if(a==='activateNoAlertOpen'){open[g].activate=!open[g].activate||!open[g].noAlert;open[g].noAlert=true;if(open[g].activate)open[g].active=false;selected[g]=null}else if(a==='activeOpen'){open[g].active=!open[g].active;if(open[g].active)open[g].activate=false;activeSelected[g]=null;open[g].edit=false;open[g].deleteArmed=false}else if(a==='test')test(g,false);else if(a==='testNoAlert')test(g,true);else if(a==='confirm')activate(g,false);else if(a==='confirmNoAlert')activate(g,true);else if(a==='edit'){open[g].edit=!open[g].edit;activeSelected[g]=null;open[g].deleteArmed=false}else if(a==='delete'){if(activeSelected[g])open[g].deleteArmed=true}else if(a==='deleteConfirm')erase(g);render()})
 }
 function render(){host.innerHTML=groups.map(block).join('');bind()}
 render();
 return {render};
}

const style=document.createElement('style');style.textContent=`
#spokenMessages,#writtenMessages{display:grid;gap:8px}.msgGroup{border:0!important;border-radius:0!important;background:transparent!important;padding:0!important}.msgCategoryButton{width:100%!important;text-align:left!important;padding:12px!important}.msgCategoryButton.active{background:#0B100D!important;color:#FFFFFF!important}.msgCategoryBody{padding:10px 0 14px}.msgGroupButtons,.msgPanelActions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.msgGroupButtonsVoice{grid-template-columns:repeat(3,minmax(0,1fr))}.msgRegisterNote{color:#AEB8B1!important;margin:0 0 9px}.msgPanel{margin-top:10px;padding-top:10px;border:0!important;background:transparent!important}.msgModeTitle{color:#FFFFFF!important;margin-bottom:8px}.msgList{display:grid;gap:7px}.msgPick{display:block!important;width:100%!important;text-align:left!important;background:#020302!important;border:0!important;border-radius:0!important;padding:10px!important;box-shadow:none!important}.msgPick.selected{border:0!important;background:#0B100D!important;box-shadow:none!important}.msgPick:disabled{opacity:.7!important}.msgPickText{display:grid;gap:4px}.msgPickText b,#spokenMessages .msgPickText b,#writtenMessages .msgPickText b{color:#FFFFFF!important}.msgPickText small,#spokenMessages .msgPickText small,#writtenMessages .msgPickText small{color:#AEB8B1!important;line-height:1.35!important;font-weight:300!important}.msgPanelActions{margin-top:9px}.msgActiveHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;color:#AEB8B1!important}.msgPanelActions .danger{border-color:#7a2b2b!important}.msgEmpty{color:#AEB8B1!important;padding:8px 2px}@media(max-width:700px){.msgGroupButtons,.msgGroupButtonsVoice,.msgPanelActions{grid-template-columns:1fr}.msgActiveHead{align-items:stretch;flex-direction:column}}
`;document.head.appendChild(style);
const managers=[createManager('spokenMessages','spoken'),createManager('writtenMessages','written')].filter(Boolean);
window.addEventListener('stackup-screen-message-config',()=>managers.forEach(m=>m.render()));
})();