const fs=require('fs');
const failures=[];
const artifact=process.env.STACKUP_DEPLOY_ARTIFACT==='1';
const protectedPages=[
  'environments-hub.html','environment-register.html','environment-registered.html',
  'staff-hub.html','staff.html','players-hub.html','players-directory.html',
  'tournaments.html','tournament-manager.html','tournament-settings.html','setup.html','ready-tournaments.html','tournament-readiness.html','tournament-center.html','tournament-close.html',
  'checkin.html','checkin-players.html','pre-registration.html','presence.html','players.html','tournament-players.html','balancing.html','control.html','bounty.html',
  'ranking.html','ranking-tournament.html','ranking-general.html',
  'screen.html','screen-settings.html','screen-alerts.html','screen-alerts-operation.html','transmission-room.html',
  'marketing.html','crm.html','communication-hub.html','communications.html',
  'financial-hub.html','finance.html','finance-settings.html','wallet.html',
  'ai-link.html','recognition.html','smart-registration.html','chip-count-ai.html'
];
const deployInjected=new Set(['setup.html','ready-tournaments.html','pre-registration.html','presence.html','tournament-players.html','balancing.html','screen-alerts-operation.html','transmission-room.html','finance.html']);
const pagesWorkflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
for(const page of protectedPages){
  if(!fs.existsSync(page)){failures.push(`${page}: arquivo ausente`);continue}
  const html=fs.readFileSync(page,'utf8');
  const direct=html.includes('auth-engine.js')&&html.includes('StackupAuth.guard()');
  if(artifact){if(!direct)failures.push(`${page}: artefato publicado sem auth-engine + guard`);continue}
  if(!direct){
    if(!deployInjected.has(page))failures.push(`${page}: fonte sem autenticação e sem cobertura de build`);
    else if(!pagesWorkflow.includes('const authPages=new Set(')||!pagesWorkflow.includes(`'${page}'`))failures.push(`${page}: cobertura de autenticação no Pages não comprovada`);
  }
}
const auth=fs.readFileSync('auth-engine.js','utf8');
for(const page of ['financial-hub.html','finance.html','finance-settings.html','wallet.html'])if(!auth.includes(`'${page}':'FINANCE'`)&&!auth.includes(`'${page}':'WALLET'`))failures.push(`${page}: sem permissão financeira mapeada`);
for(const page of ['communication-hub.html','communications.html'])if(!auth.includes(`'${page}':'MESSAGING'`))failures.push(`${page}: sem permissão MESSAGING mapeada`);
for(const page of ['marketing.html','crm.html'])if(!auth.includes(`'${page}':'MARKETING'`))failures.push(`${page}: sem permissão MARKETING mapeada`);
for(const page of ['staff-hub.html','staff.html'])if(!auth.includes(`'${page}':'STAFF_ADMIN'`))failures.push(`${page}: sem permissão STAFF_ADMIN mapeada`);
for(const page of ['environments-hub.html','environment-register.html','environment-registered.html'])if(!auth.includes(`'${page}':'ENVIRONMENT_ADMIN'`))failures.push(`${page}: sem permissão ENVIRONMENT_ADMIN mapeada`);
const tdLine=(auth.match(/const TD_PAGES=new Set\(([^;]+);/)||[])[0]||'';
for(const page of ['screen.html','transmission-room.html','screen-settings.html','screen-alerts.html','screen-alerts-operation.html']){
  if(!tdLine.includes(`'${page}'`))failures.push(`${page}: TD não possui acesso na cadeia de transmissão`);
  if(!auth.includes(`'${page}':'BROADCAST'`))failures.push(`${page}: sem permissão BROADCAST mapeada`);
}
if(!/TD:\s*\[[^\]]*'BROADCAST'/.test(auth))failures.push('TD: permissão BROADCAST ausente');
if(failures.length){console.error(`AUTH SURFACE AUDIT FAILED (${artifact?'ARTEFATO':'FONTE'}): ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log(`AUTH SURFACE AUDIT PASS (${artifact?'ARTEFATO':'FONTE'}): ${protectedPages.length} superfícies verificadas.`);