const fs=require('fs');
const path=require('path');

const root=process.cwd();
const files=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const dangerous=new Set(['name','status','history','event','screen','location','top','parent','opener','frames','length']);
const failures=[];

function inlineScripts(html){return [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]||'').join('\n')}
function ids(html){return new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]))}
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function declared(code,id){const e=esc(id);return new RegExp(`\\b(?:const|let|var)\\s+${e}\\b`).test(code)}
function bareUsed(code,id){const e=esc(id);const cleaned=code.replace(/(['"`])(?:\\.|(?!\1)[\\s\\S])*\1/g,' ');return new RegExp(`(^|[^\\w.$])${e}\\s*(?:\\.|\\[|=|\\+\\+|--)`,'m').test(cleaned)}

for(const file of files){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const code=inlineScripts(html);
  for(const id of ids(html)){
    if(!dangerous.has(id))continue;
    if(bareUsed(code,id)&&!declared(code,id))failures.push(`${file}: ID "${id}" COLIDE COM GLOBAL DO NAVEGADOR E É USADO SEM BINDING EXPLÍCITO`);
  }
}

if(failures.length){
  console.error(`DOM GLOBAL COLLISION AUDIT FALHOU: ${failures.length}`);
  failures.forEach(x=>console.error(' - '+x));
  process.exit(1);
}
console.log(`DOM GLOBAL COLLISION AUDIT PASS: ${files.length} páginas verificadas.`);
