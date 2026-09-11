(()=>{
'use strict';
const api=window.StackupScreenMessages;if(!api)return;
const lang=api.officialLang();
const c=api.load();
const sex=String(c.voiceProfile||'').endsWith('_f')?'f':'m';
const wanted=`${lang}_${sex}`;
if(c.voiceLang!==lang||c.voiceProfile!==wanted){
  c.voiceLang=lang;
  c.voiceProfile=wanted;
  api.save(c);
}
})();
