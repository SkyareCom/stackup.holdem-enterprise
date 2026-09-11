const fs=require('fs');
const files=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const failures=[];
const iframePages=[];
const allowedShells=new Set(['staff-register.html','staff-registered.html','player-register.html','players-registered.html']);
for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  const frames=(html.match(/<iframe\b/gi)||[]).length;
  if(frames){iframePages.push(file);if(!allowedShells.has(file))failures.push(`${file}: iframe não auditado/necessário`);if(frames!==1)failures.push(`${file}: deve conter somente um iframe de compatibilidade`);if(/<button\b/i.test(html))failures.push(`${file}: shell de iframe não deve instalar botão próprio`);if(/contentDocument|contentWindow|createElement\s*\(/.test(html))failures.push(`${file}: shell de iframe não deve reescrever DOM da tela interna`)}
  if(file!=='environment-register.html'&&/(id=["'](?:newClubName|newClubType|createClub)["'])/.test(html))failures.push(`${file}: cadastro de ambiente duplicado fora do módulo AMBIENTES`);
  if(/<button\b[^>]*>[\s\S]{0,200}<br\s*\/?>(?:[\s\S]{0,200})<\/button>/i.test(html))failures.push(`${file}: botão com quebra explícita de linha`);
  if(/class=["'][^"']*\bname\b[^"']*["'][^>]*>[\s\S]{0,120}<br\s*\/?/i.test(html))failures.push(`${file}: nome de card com quebra explícita de linha`);
}
for(const [hub,blocked] of [['staff-hub.html',['staff-register.html','staff-registered.html']],['players-hub.html',['player-register.html','players-registered.html']]]){const html=fs.readFileSync(hub,'utf8');for(const target of blocked)if(html.includes(`href="${target}`)||html.includes(`href='${target}`))failures.push(`${hub}: navegação principal ainda usa shell ${target}`)}
const staff=fs.readFileSync('staff.html','utf8'),players=fs.readFileSync('player-directory-history.js','utf8');
if(!staff.includes("VIEW==='register'")||!staff.includes("VIEW==='registered'"))failures.push('staff.html: views nativas register/registered ausentes');
if(!players.includes("view==='register'")||!players.includes("view==='registered'"))failures.push('players-directory: views nativas register/registered ausentes');
console.log('TERTIARY STRUCTURE: iframe shells -> '+(iframePages.join(', ')||'nenhum'));
if(failures.length){console.error(`TERTIARY STRUCTURE AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log(`TERTIARY STRUCTURE AUDIT PASS: ${files.length} páginas verificadas; shells isolados e sem botões/DOM sintéticos.`);