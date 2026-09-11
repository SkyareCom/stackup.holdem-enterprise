const fs=require('fs');
const path=require('path');

const root=process.cwd();
const allowedFiles=new Set([
  'inline-interactions-v1.js',
  'no-popups-v1.js',
  'tests/popup-surface-audit.js'
]);
const ignoreDirs=new Set(['.git','node_modules']);
const exts=new Set(['.js','.html','.css']);
const patterns=[
  ['native-alert',/\b(?:window\.|globalThis\.)?alert\s*\(/g],
  ['native-confirm',/\b(?:window\.|globalThis\.)?confirm\s*\(/g],
  ['native-prompt',/\b(?:window\.|globalThis\.)?prompt\s*\(/g],
  ['window-open',/\bwindow\.open\s*\(/g],
  ['dialog-showModal',/\.showModal\s*\(/g],
  ['dialog-markup',/<dialog\b/gi],
  ['popup-word',/\bpopup\b/gi],
  ['modal-class-id',/(?:class|id)=["'][^"']*\bmodal\b[^"']*["']/gi],
  ['overlay-class-id',/(?:class|id)=["'][^"']*\boverlay\b[^"']*["']/gi]
];

const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ignoreDirs.has(ent.name))continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())walk(p);
    else if(exts.has(path.extname(ent.name).toLowerCase()))files.push(p);
  }
}
walk(root);

const hits=[];
for(const abs of files){
  const rel=path.relative(root,abs).replace(/\\/g,'/');
  const text=fs.readFileSync(abs,'utf8');
  const lines=text.split(/\r?\n/);
  for(const [name,re] of patterns){
    re.lastIndex=0;
    let m;
    while((m=re.exec(text))){
      const before=text.slice(0,m.index);
      const line=before.split(/\r?\n/).length;
      const snippet=(lines[line-1]||'').trim().slice(0,220);
      hits.push({file:rel,line,type:name,snippet,allowed:allowedFiles.has(rel)});
      if(m[0].length===0)re.lastIndex++;
    }
  }
}

console.log(`POPUP SURFACE AUDIT: ${files.length} arquivos verificados.`);
for(const h of hits)console.log(`${h.allowed?'ALLOW':'HIT'} ${h.type} ${h.file}:${h.line} :: ${h.snippet}`);
const blocked=hits.filter(h=>!h.allowed);
console.log(`POPUP SURFACE AUDIT: ${hits.length} ocorrências; ${blocked.length} exigem revisão.`);
if(process.argv.includes('--enforce')&&blocked.length){process.exitCode=1;}
