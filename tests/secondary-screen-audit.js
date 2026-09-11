const fs=require('fs');
const path=require('path');

const pages=[
  'environments-hub.html',
  'staff-hub.html',
  'players-hub.html',
  'tournaments.html',
  'ranking.html',
  'screen.html',
  'marketing.html',
  'communication-hub.html',
  'financial-hub.html',
  'ai-link.html'
];

const failures=[];
for(const page of pages){
  const file=path.join(process.cwd(),page);
  if(!fs.existsSync(file)){failures.push(`${page}: arquivo ausente`);continue}
  const html=fs.readFileSync(file,'utf8');

  const required=[
    'grid-template-columns:minmax(0,1fr)!important',
    'border-radius:14px',
    'height:140px!important',
    'height:136px!important',
    'class="tag"',
    'class="name"',
    'class="desc"'
  ];
  for(const token of required){if(!html.includes(token))failures.push(`${page}: padrão ausente: ${token}`)}

  const forbidden=[/<form\b/i,/<input\b/i,/<select\b/i,/<textarea\b/i,/<button\b/i,/class=["'][^"']*(?:history|listRow|formGrid|roomBox|roomActions)[^"']*["']/i];
  for(const rx of forbidden){if(rx.test(html))failures.push(`${page}: conteúdo operacional proibido na segunda tela: ${rx}`)}

  const cardTags=[...html.matchAll(/<(a|div)\b[^>]*class=["'][^"']*\bcard\b[^"']*["'][^>]*>/gi)];
  if(!cardTags.length)failures.push(`${page}: nenhum quadro de módulo encontrado`);
  for(const match of cardTags){
    const tag=match[1].toLowerCase(), raw=match[0];
    if(tag!=='a'){failures.push(`${page}: quadro de módulo não navegável: ${raw.slice(0,100)}`);continue}
    const href=(raw.match(/href=["']([^"']+)["']/i)||[])[1]||'';
    if(!href||href==='#'||href.startsWith('javascript:'))failures.push(`${page}: quadro sem terceira tela válida`);
    const base=href.split(/[?#]/)[0].split('/').pop().toLowerCase();
    if(base===page.toLowerCase())failures.push(`${page}: quadro abre a própria segunda tela (${href})`);
  }
}

if(failures.length){
  console.error('SECONDARY SCREEN AUDIT FAILED');
  failures.forEach(f=>console.error('- '+f));
  process.exit(1);
}
console.log(`SECONDARY SCREEN AUDIT OK • ${pages.length} segundas telas verificadas`);
