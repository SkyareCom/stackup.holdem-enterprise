(function(){
  if(typeof document==='undefined'||window.__stackupInputMasks)return;
  window.__stackupInputMasks=true;

  const digits=(value,max)=>String(value??'').replace(/\D/g,'').slice(0,max);
  const formatCpf=value=>{
    const d=digits(value,11);
    if(d.length<=3)return d;
    if(d.length<=6)return `${d.slice(0,3)}.${d.slice(3)}`;
    if(d.length<=9)return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  };
  const formatPhone=value=>{
    const d=digits(value,11);
    if(!d)return '';
    if(d.length<=2)return `(${d}`;
    if(d.length<=7)return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };
  const signature=el=>{
    const names=el.getAttributeNames?.().filter(n=>n.startsWith('data-')).join(' ')||'';
    return [el.id,el.name,el.placeholder,el.getAttribute('aria-label'),el.getAttribute('autocomplete'),names,...Object.keys(el.dataset||{})].filter(Boolean).join(' ').toLowerCase();
  };
  const kindOf=el=>{
    if(!(el instanceof HTMLInputElement))return '';
    const sig=signature(el);
    if(/\bcpf\b/.test(sig))return 'cpf';
    if(el.type==='tel'||/(telefone|fone|phone|celular|whatsapp|whats\b|whats[-_ ]?app)/.test(sig))return 'phone';
    return '';
  };
  const semanticLabel=(el,kind)=>{
    const sig=signature(el);
    if(kind==='cpf')return 'CPF';
    if(/whatsapp|whats\b|whats[-_ ]?app/.test(sig))return 'WHATSAPP';
    if(/celular/.test(sig))return 'CELULAR';
    return 'TELEFONE';
  };
  const applyValue=(el,kind=kindOf(el))=>{
    if(!kind)return;
    const next=kind==='cpf'?formatCpf(el.value):formatPhone(el.value);
    if(el.value!==next){el.value=next;try{el.setSelectionRange(next.length,next.length)}catch(_){ }}
  };
  const prepare=el=>{
    const kind=kindOf(el);
    if(!kind)return '';
    const label=semanticLabel(el,kind);
    el.dataset.stackupMask=kind;
    el.inputMode='numeric';
    el.maxLength=kind==='cpf'?14:15;
    el.placeholder=label;
    if(!el.getAttribute('aria-label'))el.setAttribute('aria-label',label);
    el.dataset.stackupMaskFormat=kind==='cpf'?'000.000.000-00':'(00) 00000-0000';
    applyValue(el,kind);
    return kind;
  };
  const scan=root=>{if(root instanceof HTMLInputElement)prepare(root);root.querySelectorAll?.('input').forEach(prepare)};
  const liveFormat=event=>{const el=event.target;if(!(el instanceof HTMLInputElement))return;const kind=el.dataset.stackupMask||prepare(el);if(kind)applyValue(el,kind)};
  const boot=()=>{
    scan(document);
    document.addEventListener('input',liveFormat,true);
    document.addEventListener('input',liveFormat,false);
    document.addEventListener('change',liveFormat,false);
    document.addEventListener('blur',liveFormat,true);
    new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(node=>{if(node.nodeType===1)scan(node)}))).observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StackupInputMasks={formatCpf,formatPhone};
})();

(function ensureCompactRegistryLists(){
  if(typeof document==='undefined')return;
  if(document.querySelector('script[data-stackup-compact-directory]'))return;
  const script=document.createElement('script');
  script.src='directory-compact-v1.js?v=3b0c7dbd';
  script.defer=true;
  script.dataset.stackupCompactDirectory='1';
  (document.head||document.documentElement).appendChild(script);
})();

(function ensureGlobalLanguage(){
  if(typeof document==='undefined')return;
  const loadExtra=()=>{
    if(document.querySelector('script[data-stackup-language-extra]'))return;
    const extra=document.createElement('script');
    extra.src='app-language-extra.js?v=8ee11f0c0c8b0be7dbdb120b7a99a1d337cb2072';
    extra.defer=true;extra.dataset.stackupLanguageExtra='1';
    (document.head||document.documentElement).appendChild(extra);
  };
  if(window.StackupAppLanguage){loadExtra();return}
  const existing=document.querySelector('script[data-stackup-language]');
  if(existing){existing.addEventListener('load',loadExtra,{once:true});return}
  const script=document.createElement('script');
  script.src='app-language.js?v=25edfbe44d78b540013473f3275cc471ef832512';
  script.defer=true;script.dataset.stackupLanguage='1';script.onload=loadExtra;
  (document.head||document.documentElement).appendChild(script);
})();