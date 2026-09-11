(()=>{
'use strict';
const REG_IDS=['lastRebuy','lastEntry','lastRebuyEntry'];
const LEVEL_START_IDS=['levelAnte','levelNoAnte'];
const LEVEL_END_IDS=['level3','level1'];
let pending=false;
let running=false;
let prev={idx:null,rem:null};

function api(){return window.StackupScreenMessages}
function state(){try{return window.state||JSON.parse(localStorage.getItem('poker-club-state-v4')||'{}')}catch(_){return{}}}
function cfg(){return api()?.load?.()||{}}
function curLevel(s){return (s.structure||[])[+s.levelIndex||0]||{}}
function primaryActive(id){return !!cfg().spoken?.[id]}
function registrationActive(){const c=cfg();return REG_IDS.filter(id=>!!c.spoken?.[id])}
function queueIfNeeded(primaryId){if(!primaryActive(primaryId))return;if(!registrationActive().length)return;pending=true}

async function playRegistration(){
 if(running||!pending)return;
 const a=api();if(!a)return;
 const ids=registrationActive();
 if(!ids.length){pending=false;return}
 pending=false;running=true;
 const c=cfg(),lang=c.voiceLang||a.officialLang();
 try{
  for(const id of ids){
   const text=a.messageText(id,lang);
   await a.speak(text,{lang,profileId:c.voiceProfile,repeat:c.voiceRepeat,volume:c.voiceVolume/100,broadcast:true});
  }
 }finally{running=false}
}

const nativePlay=HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play=function(...args){
 const el=this;
 if(!el.__stackupRegistrationHook){
  el.__stackupRegistrationHook=true;
  el.addEventListener('ended',()=>{if(pending&&!running)setTimeout(playRegistration,0)},{once:false});
 }
 return nativePlay.apply(el,args)
};

function monitor(){
 const s=state(),cur=curLevel(s),idx=+s.levelIndex||0,rem=Math.max(0,+s.remaining||0);
 if(cur.type==='level'){
  if(rem>0&&rem<=180&&rem>165&&(prev.rem===null||prev.rem>180||prev.rem<=165))queueIfNeeded('level3');
  if(rem>0&&rem<=60&&rem>45&&(prev.rem===null||prev.rem>60||prev.rem<=45))queueIfNeeded('level1');
 }
 if(prev.idx!==null&&idx!==prev.idx&&cur.type==='level')queueIfNeeded(+cur.ante>0?'levelAnte':'levelNoAnte');
 prev={idx,rem};
}

setInterval(monitor,500);
})();