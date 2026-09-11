(()=>{
'use strict';
const REG_IDS=['lastRebuy','lastEntry','lastRebuyEntry'];
let running=false;
const fired=new Set();
let prev={idx:null,rem:null};
function api(){return window.StackupScreenMessages}
function st(){try{return window.state||JSON.parse(localStorage.getItem('poker-club-state-v4')||'{}')}catch(_){return{}}}
function cfg(){return api()?.load?.()||{}}
function curLevel(s){return (s.structure||[])[+s.levelIndex||0]||{}}
function currentLevelNumberSafe(){try{return typeof currentLevelNumber==='function'?+currentLevelNumber()||(+st().levelIndex||0)+1:(+st().levelIndex||0)+1}catch(_){return(+st().levelIndex||0)+1}}
function activeRegistration(){const c=cfg();return REG_IDS.find(id=>!!c.spoken?.[id])||null}
function primaryChoice(){const c=cfg();if(c.spoken?.level3)return'level3';if(c.spoken?.level1)return'level1';return null}
function num(v){const n=+v;return Number.isFinite(n)&&n>0?n:null}
function levelFlag(row,id){if(!row||typeof row!=='object')return false;const aliases={lastRebuy:['lastRebuy','rebuyEnd','rebuyEnds','finalRebuy','closeRebuy'],lastEntry:['lastEntry','entryEnd','entriesEnd','registrationEnd','lateRegistrationEnd','closeEntries'],lastRebuyEntry:['lastRebuyEntry','rebuyEntryEnd','registrationAndRebuyEnd','closeRegistration']};return aliases[id].some(k=>row[k]===true||row[k]===1||row[k]==='true')}
function configuredLevel(s,id){const maps={lastRebuy:['lastRebuyLevel','rebuyEndLevel','rebuyLastLevel','finalRebuyLevel'],lastEntry:['lastEntryLevel','entryEndLevel','registrationEndLevel','lateRegistrationEndLevel','lastRegistrationLevel'],lastRebuyEntry:['lastRebuyEntryLevel','rebuyEntryEndLevel','registrationAndRebuyEndLevel']};for(const k of maps[id]){const n=num(s[k]);if(n)return n}for(let i=0;i<(s.structure||[]).length;i++){if(levelFlag(s.structure[i],id))return i+1}return null}
function appliesNow(s,id){const target=configuredLevel(s,id);return target?currentLevelNumberSafe()===target:false}
async function speakRegistration(id,forceNoAlert){if(running)return;const a=api();if(!a)return;const s=st(),key=`${s.eventId||s.tournamentName||'event'}:${id}:${+s.levelIndex||0}`;if(fired.has(key))return;fired.add(key);running=true;const c=cfg(),lang=c.voiceLang||a.officialLang(),text=a.messageText(id,lang),opt={lang,profileId:c.voiceProfile,repeat:c.voiceRepeat,volume:c.voiceVolume/100,broadcast:true};try{if(forceNoAlert||c.spokenNoAlert?.[id])await a.speak(text,opt);else await a.playAlertThenSpeak(text,opt)}finally{running=false}}
function queueAfterPrimary(primary,id){const a=api();if(!a)return;const handler=e=>{const d=e?.detail||{};if(d.id&&d.id!==primary)return;window.removeEventListener('stackup-screen-message-finished',handler);speakRegistration(id,true)};window.addEventListener('stackup-screen-message-finished',handler,{once:false});setTimeout(()=>{window.removeEventListener('stackup-screen-message-finished',handler)},120000)}
const nativePlay=HTMLMediaElement.prototype.play;
let pending=null;
HTMLMediaElement.prototype.play=function(...args){const el=this;if(!el.__stackupRegistrationHookV2){el.__stackupRegistrationHookV2=true;el.addEventListener('ended',()=>{if(!pending||running)return;const p=pending;pending=null;speakRegistration(p.id,true)})}return nativePlay.apply(el,args)};
function monitor(){const s=st(),cur=curLevel(s),idx=+s.levelIndex||0,rem=Math.max(0,+s.remaining||0),id=activeRegistration();if(cur.type==='level'&&id&&appliesNow(s,id)){
 const primary=primaryChoice();
 if(primary==='level3'&&rem>0&&rem<=180&&rem>165&&(prev.rem===null||prev.rem>180||prev.rem<=165)){pending={id,primary:'level3'};queueAfterPrimary('level3',id)}
 else if(primary==='level1'&&rem>0&&rem<=60&&rem>45&&(prev.rem===null||prev.rem>60||prev.rem<=45)){pending={id,primary:'level1'};queueAfterPrimary('level1',id)}
 else if(!primary&&rem>0&&rem<=60&&rem>45&&(prev.rem===null||prev.rem>60||prev.rem<=45)){speakRegistration(id,false)}
 }
 prev={idx,rem};
}
setInterval(monitor,500);
})();