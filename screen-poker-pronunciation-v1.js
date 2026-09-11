(()=>{
'use strict';
const TTS_ENDPOINT='https://throbbing-voice-b4e2.celsomurakami.workers.dev/speak';
const nativeFetch=window.fetch.bind(window);
const POKER_TERMS=['poker','dealer','dealers','blind','blinds','small blind','big blind','rebuy','rebuys','re-entry','re-entries','reentry','reentries','add-on','addon','hand for hand','alternate','all-in','all in','buy-in','buy in','cash','stack','stacks','chip','chips','flop','turn','river','showdown','bounty','sit and go','heads-up','heads up','fold','call','raise','check','bet','pot','side pot'];
function pokerPronunciationInstruction(lang){
  if(lang!=='pt'&&lang!=='es')return '';
  const base=lang==='pt'?'Brazilian Portuguese':'Spanish';
  return `Speak the sentence naturally in ${base}. IMPORTANT: every English poker term must keep native American English pronunciation, never a Portuguese or Spanish phonetic reading. Code-switch only for the English poker words and immediately return to ${base}. Examples of terms that must sound English: ${POKER_TERMS.join(', ')}. Keep the same speaker, tone, pace and volume across the whole sentence.`;
}
window.fetch=async function(input,init){
  try{
    const url=typeof input==='string'?input:(input?.url||'');
    if(url===TTS_ENDPOINT&&init?.body){
      const body=typeof init.body==='string'?JSON.parse(init.body):null;
      if(body){
        const extra=pokerPronunciationInstruction(String(body.language||'').slice(0,2));
        if(extra){
          body.style=[body.style,extra].filter(Boolean).join('. ');
          init={...init,body:JSON.stringify(body)};
        }
      }
    }
  }catch(_){/* preserve original request on any parsing failure */}
  return nativeFetch(input,init);
};
})();
