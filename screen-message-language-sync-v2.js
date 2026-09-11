(()=>{
'use strict';
const api=window.StackupScreenMessages;if(!api)return;
const selected=()=>{
  const direct=window.StackupAppLanguage?.get?.();
  if(['pt','en','es'].includes(direct))return direct;
  try{const saved=localStorage.getItem('stackup-app-language');if(['pt','en','es'].includes(saved))return saved}catch(_){}
  try{const s=window.state||JSON.parse(localStorage.getItem('poker-club-state-v4')||'{}');if(['pt','en','es'].includes(String(s.language||'').slice(0,2)))return String(s.language).slice(0,2)}catch(_){}
  return 'pt';
};
api.officialLang=selected;
function sync(){const lang=selected(),c=api.load(),sex=String(c.voiceProfile||'').endsWith('_f')?'f':'m',wanted=`${lang}_${sex}`;if(c.voiceLang!==lang||c.voiceProfile!==wanted){c.voiceLang=lang;c.voiceProfile=wanted;api.save(c)}document.documentElement.lang=lang==='pt'?'pt-BR':lang}
sync();
window.addEventListener('stackup-language-change',()=>setTimeout(sync,0));
})();