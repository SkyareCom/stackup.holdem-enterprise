(function(){
'use strict';
const KEY='stackupScreenAlertAudio';
const PRESETS=[
 ['airport','AEROPORTO • 2 TONS',[[880,.18],[660,.42]]],
 ['singleTone','1 TOM',[[740,.32]]],
 ['analog','DESPERTADOR • ANALÓGICO',[[1700,.09],[1250,.09],[1700,.09],[1250,.22]]],
 ['digital','DESPERTADOR • DIGITAL',[[980,.12],[0,.06],[980,.12],[0,.06],[980,.22]]],
 ['double','ALARME • DUPLO',[[740,.18],[0,.08],[740,.28]]],
 ['triple','ALARME • TRIPLO',[[820,.1],[0,.07],[820,.1],[0,.07],[820,.24]]],
 ['low','ALARME • GRAVE',[[220,.22],[330,.22],[220,.35]]],
 ['high','ALARME • AGUDO',[[1320,.12],[1760,.12],[1320,.25]]],
 ['pulse','ALARME • PULSO',[[440,.1],[660,.1],[880,.1],[660,.1],[440,.3]]],
 ['attention','ATENÇÃO • ASCENDENTE',[[392,.12],[523,.12],[659,.12],[784,.32]]]
];
const defaults={preset:'airport',pitch:0,speed:1,repeats:1,volume:70};
let ctx=null,active=[];
function load(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');delete raw.bass;delete raw.treble;const saved=Object.assign({},defaults,raw);if(saved.preset==='airportSoft')saved.preset='singleTone';saved.speed=Math.max(.5,Math.min(4,+saved.speed||1));return saved}catch(_){return {...defaults}}}
function save(v){const clean={preset:v.preset,pitch:+v.pitch||0,speed:Math.max(.5,Math.min(4,+v.speed||1)),repeats:Math.max(1,+v.repeats||1),volume:Math.max(0,Math.min(100,+v.volume||0))};localStorage.setItem(KEY,JSON.stringify(clean));window.dispatchEvent(new CustomEvent('stackup-alert-audio-change',{detail:clean}))}
function stop(){active.forEach(n=>{try{n.stop?.()}catch(_){}});active=[]}
function context(){ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();return ctx}
function durationMs(settings){const s=Object.assign(load(),settings||{}),p=PRESETS.find(x=>x[0]===s.preset)||PRESETS[0],speed=Math.max(.5,Math.min(4,+s.speed||1)),reps=Math.max(1,Math.min(8,+s.repeats||1)),sequence=p[2].reduce((t,x)=>t+(+x[1]||0),0)/speed,gap=.18/speed;return Math.max(0,(.03+(sequence*reps)+(gap*Math.max(0,reps-1))+.02)*1000)}
function play(settings){const s=Object.assign(load(),settings||{}),p=PRESETS.find(x=>x[0]===s.preset)||PRESETS[0],c=context();stop();if(c.state==='suspended')c.resume();let t=c.currentTime+.03;const semitone=Math.pow(2,(+s.pitch||0)/12),speed=Math.max(.5,Math.min(4,+s.speed||1)),reps=Math.max(1,Math.min(8,+s.repeats||1));for(let r=0;r<reps;r++){for(const [hz,baseDur] of p[2]){const dur=baseDur/speed;if(!hz){t+=dur;continue}const osc=c.createOscillator(),gain=c.createGain();osc.type=p[0].includes('analog')?'square':p[0].includes('low')?'triangle':'sine';osc.frequency.value=hz*semitone;const vol=Math.max(0,Math.min(100,+s.volume||0))/100;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,vol*.32),t+.012);gain.gain.setValueAtTime(Math.max(.0001,vol*.32),Math.max(t+.013,t+dur-.035));gain.gain.exponentialRampToValueAtTime(.0001,t+dur);osc.connect(gain).connect(c.destination);osc.start(t);osc.stop(t+dur+.02);active.push(osc);t+=dur}if(r<reps-1)t+=.18/speed}return durationMs(s)}
window.StackupAlertAudio={PRESETS,defaults,load,save,play,stop,durationMs};
function loadManager(){if(!/screen-alerts\.html$/i.test(location.pathname))return;if(document.querySelector('script[data-stackup-alert-manager]'))return;const s=document.createElement('script');s.src='screen-alert-manager.js?v=c641f84';s.dataset.stackupAlertManager='1';document.body.appendChild(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadManager,{once:true});else loadManager();
})();