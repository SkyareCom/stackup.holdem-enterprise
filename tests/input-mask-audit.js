const fs=require('fs');
const failures=[];
const assert=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
const masks=fs.readFileSync('input-masks.js','utf8');
const shared=fs.readFileSync('shared.js','utf8');
assert('CPF usa formato 000.000.000-00',masks.includes("${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}")&&masks.includes("'000.000.000-00'"));
assert('Telefone e Whats usam formato (00) 00000-0000',masks.includes("(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}")&&masks.includes("'(00) 00000-0000'"));
assert('Máscara reconhece CPF',masks.includes("/\\bcpf\\b/"));
assert('Máscara reconhece telefone, celular e WhatsApp',masks.includes('telefone')&&masks.includes('celular')&&masks.includes('whatsapp')&&masks.includes('whats'));
assert('Máscara reconhece atributos data-* dos cards',masks.includes("getAttributeNames")&&masks.includes("startsWith('data-')"));
assert('Máscara ocorre durante a digitação',masks.includes("document.addEventListener('input',liveFormat,true)")&&masks.includes("document.addEventListener('input',liveFormat,false)"));
assert('Campos dinâmicos recebem máscara',masks.includes('MutationObserver'));
assert('Shared carrega máscaras globalmente',shared.includes('input-masks.js?v=')&&shared.includes('data-stackup-input-masks'));
if(failures.length){failures.forEach(f=>console.error('FAIL:',f));process.exit(1)}
console.log('INPUT MASK AUDIT PASS');