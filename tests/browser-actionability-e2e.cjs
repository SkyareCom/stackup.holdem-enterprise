const { chromium } = require('playwright');

const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
const failures=[];
let checked=0,pagesChecked=0;

const roleConfig={
  TD:{personId:'person-td',staffId:'td1',membershipId:'m-td',name:'QA TD'},
  FLOOR:{personId:'person-floor',staffId:'floor1',membershipId:'m-floor',name:'QA FLOOR'},
  CASHIER:{personId:'person-cashier',staffId:'cashier1',membershipId:'m-cashier',name:'QA CASHIER'},
  VIEWER:{personId:'person-viewer',staffId:'viewer1',membershipId:'m-viewer',name:'QA VIEWER'}
};

// setup.html e checkin.html possuem jornadas Chromium dedicadas.
// Esta varredura mantém a mesma cobertura de rotas/funções, mas usa hit-test DOM real
// dentro do Chromium em vez de trial-click por controle, evitando o timeout artificial
// de centenas de controles em telas grandes como screen-settings.html.
const routes={
  TD:[
    'index.html','tournaments.html','tournament-settings.html',
    'tournament-manager.html?id=event-e2e','ready-tournaments.html','tournament-readiness.html','control.html',
    'players-hub.html','players-directory.html?view=registered','final-table-settings.html',
    'screen.html','screen-settings.html','screen-alerts.html','communication-hub.html','communications.html','bot.html',
    'ranking.html','ranking-tournament.html','ranking-general.html','ai-link.html','structure-import.html','recognition.html'
  ],
  FLOOR:[
    'index.html','tournaments.html','tournament-manager.html?id=event-e2e','control.html',
    'players-hub.html','players-directory.html?view=registered','communication-hub.html','communications.html'
  ],
  CASHIER:[
    'index.html','financial-hub.html','finance.html','finance-settings.html','wallet.html','cash.html',
    'players-hub.html','players-directory.html?view=registered'
  ],
  VIEWER:['index.html','tournament-center.html','ready-tournaments.html','ranking.html','ranking-tournament.html','ranking-general.html']
};

function seed(role){
  const cfg=roleConfig[role],now=Date.now();
  const staff=[
    {id:'td1',personId:'person-td',clubId:'club-a',name:'QA TD',role:'TD',active:true,phone:'551199990001'},
    {id:'floor1',personId:'person-floor',clubId:'club-a',name:'QA FLOOR',role:'FLOOR',active:true,phone:'551199990002'},
    {id:'cashier1',personId:'person-cashier',clubId:'club-a',name:'QA CASHIER',role:'CASHIER',active:true,phone:'551199990003'},
    {id:'viewer1',personId:'person-viewer',clubId:'club-a',name:'QA VIEWER',role:'VIEWER',active:true,phone:'551199990004'},
    {id:'dealer1',personId:'person-dealer',clubId:'club-a',name:'QA DEALER',role:'DEALER',active:true,phone:'551199990005'},
    {id:'foreign-dealer',personId:'person-foreign',clubId:'club-b',name:'FOREIGN DEALER',role:'DEALER',active:true,phone:'551199990006'}
  ];
  const people=staff.map((s,i)=>({id:s.personId,cpf:String(10000000000+i),name:s.name,pin:'1234',active:true}));
  const memberships=staff.map(s=>({id:s.id===cfg.staffId?cfg.membershipId:`m-${s.id}`,personId:s.personId,clubId:s.clubId,staffId:s.id,role:s.role,permissions:[],active:true,createdAt:now}));
  const structure=[
    {type:'level',label:'NÍVEL 1',duration:1200,sb:100,bb:200,ante:200},
    {type:'level',label:'NÍVEL 2',duration:1200,sb:200,bb:400,ante:400}
  ];
  const state={
    eventId:'event-e2e',tournamentName:'E2E MAIN',clubId:'club-a',clubName:'QA CLUB A',activeEnvironmentId:'club-a',activeEnvironmentName:'QA CLUB A',activeEnvironmentType:'CLUB',prepared:true,tournamentStatus:'VALIDATED',status:'VALIDADO',
    gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,buyinChips:30000,startingStack:30000,fee:50,guaranteed:10000,paidPlaces:3,lateRegLevel:4,language:'pt',
    running:false,levelIndex:0,remaining:1200,elapsed:0,playersLeft:2,field:2,prizePool:1000,structure,
    staffUsers:staff,authPeople:people,authClubs:[{id:'club-a',name:'QA CLUB A',type:'CLUB',active:true},{id:'club-b',name:'QA CLUB B',type:'CLUB',active:true}],authMemberships:memberships,dealerWorkSessions:[],
    players:[
      {id:'p1',name:'ALFA',validationEventId:'event-e2e',eventId:'event-e2e',status:'active',table:1,seat:1,seatStatus:'ASSIGNED',validationCode:'ABC123',validationCodeStatus:'ACTIVE',createdAt:now},
      {id:'p2',name:'BRAVO',validationEventId:'event-e2e',eventId:'event-e2e',status:'active',table:1,seat:2,seatStatus:'ASSIGNED',validationCode:'DEF456',validationCodeStatus:'ACTIVE',createdAt:now},
      {id:'foreign-player',name:'OUTRO EVENTO',validationEventId:'event-other',eventId:'event-other',status:'active',table:1,seat:1,validationCode:'ZZZ999',validationCodeStatus:'ACTIVE'}
    ],
    transactions:[{id:'tx1',eventId:'event-e2e',playerId:'p1',playerName:'ALFA',type:'ENTRY',value:550,breakdown:{classification:'CLASSIFIED',prize:500,fee:50}},{id:'foreign-tx',eventId:'event-other',playerId:'foreign-player',type:'REBUY',value:999}],
    seatCheckins:[],tableMovements:[],balancePlan:[],staffAlerts:[],botCommands:[],auditLog:[],messageQueue:[],messageLog:[],paymentIntents:[],walletTransactions:[],validationLog:[],rankings:[],loyaltyAccounts:[],campaigns:[],playerCommunications:[],cashTables:[],cashSessions:[],cashTransactions:[],savedStructures:[],dealerAccessGrants:[],
    savedTournaments:[{id:'event-e2e',name:'E2E MAIN',status:'VALIDATED',data:{tournamentName:'E2E MAIN',clubId:'club-a',clubName:'QA CLUB A',gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,buyinChips:30000,startingStack:30000,structure,finalTableStructureMode:'TIMER',finalTableHandsPerLevel:10}}]
  };
  const session={id:`session-${role}`,personId:cfg.personId,personName:cfg.name,clubId:'club-a',clubName:'QA CLUB A',membershipId:cfg.membershipId,staffId:cfg.staffId,role,permissions:[],deviceId:`device-${role}`,startedAt:now};
  const ready=[{id:'event-e2e',name:'E2E MAIN',status:'VALIDATED',validatedAt:now,dealerIds:['dealer1'],staffIds:['td1','floor1','cashier1','viewer1','dealer1'],data:{clubId:'club-a',clubName:'QA CLUB A',gameType:'NLH',tournamentFormat:'REGULAR',seatsPerTable:9,buyin:500,buyinChips:30000,startingStack:30000,structure,finalTableStructureMode:'TIMER',finalTableHandsPerLevel:10}}];
  return {role,state,session,ready};
}

async function contextFor(browser,role){
  const context=await browser.newContext({viewport:{width:412,height:915}});
  const data=seed(role);
  await context.addInitScript(({role,state,session,ready})=>{
    const marker=`stackup-actionability-${role}`;
    if(sessionStorage.getItem(marker)==='1')return;
    localStorage.setItem('stackup-production-reset-version','2026-09-04-professional-v1');
    localStorage.setItem('poker-club-state-v4',JSON.stringify(state));
    localStorage.setItem('stackup-auth-session-v1',JSON.stringify(session));
    localStorage.setItem('stackup-auth-login-v1',JSON.stringify({personId:session.personId,authenticatedAt:Date.now()}));
    localStorage.setItem('stackup-ready-tournaments-v1',JSON.stringify(ready));
    localStorage.setItem('stackup-active-environment-v1','club-a');
    sessionStorage.setItem(marker,'1');
  },data);
  return context;
}

function cleanText(v){return String(v||'').replace(/\s+/g,' ').trim().slice(0,120)}

async function sweepPage(page,role,route){
  const errors=[];
  page.on('pageerror',e=>errors.push(`pageerror @ ${page.url()}: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')errors.push(`console @ ${page.url()}: ${m.text()}`)});

  await page.goto(`${BASE}/${route}`,{waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForTimeout(250);
  const expected=new URL(`${BASE}/${route}`).pathname.split('/').pop();
  const actual=new URL(page.url()).pathname.split('/').pop();
  if(actual!==expected){
    failures.push(`${role} • ${route}: REDIRECIONOU PARA ${actual||page.url()}`);
    console.error('FAIL:',role,route,'redirecionou para',actual||page.url());
    return;
  }

  const result=await page.evaluate(()=>{
    const all=[...document.querySelectorAll('button,a[href],[role="button"]')];
    const bad=[];
    let count=0;
    const label=(el,i)=>{
      const txt=(el.innerText||el.textContent||el.getAttribute('aria-label')||el.getAttribute('title')||'').replace(/\s+/g,' ').trim().slice(0,90);
      const id=el.id?`#${el.id}`:'';
      const href=el.getAttribute('href');
      return `${el.tagName.toLowerCase()}${id}${href?`[href="${href}"]`:''}${txt?` «${txt}»`:''} [${i}]`;
    };
    const visible=el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&r.width>0&&r.height>0;
    };
    const disabled=el=>el.matches(':disabled,[aria-disabled="true"],[inert]')||!!el.closest('[inert],[aria-disabled="true"],.disabled,fieldset[disabled]');

    all.forEach((el,i)=>{
      if(!visible(el)||disabled(el))return;
      count++;
      el.scrollIntoView({block:'center',inline:'center'});
      const r=el.getBoundingClientRect();
      const x=Math.min(innerWidth-1,Math.max(0,r.left+r.width/2));
      const y=Math.min(innerHeight-1,Math.max(0,r.top+r.height/2));
      const top=document.elementFromPoint(x,y);
      const pointer=getComputedStyle(el).pointerEvents;
      const hit=!!top&&(top===el||el.contains(top));
      if(pointer==='none'||!hit){
        bad.push(`${label(el,i)} :: pointer-events=${pointer}; hit=${top?top.tagName.toLowerCase():'none'}`);
      }
    });
    return {count,bad};
  });

  checked+=result.count;
  pagesChecked++;
  result.bad.forEach(msg=>{
    failures.push(`${role} • ${route} • ${msg}`);
    console.error('FAIL:',role,route,cleanText(msg));
  });
  errors.forEach(e=>{
    failures.push(`${role} • ${route} • ${e}`);
    console.error('FAIL:',role,route,cleanText(e));
  });
  console.log(`PASS: ${role} • ${route} • ${result.count} controle(s) visível(is) com hit-test real em Chromium`);
}

async function sweepRole(browser,role,list){
  const context=await contextFor(browser,role);
  try{
    for(const route of list){
      const page=await context.newPage();
      try{await sweepPage(page,role,route)}catch(e){
        failures.push(`${role} • ${route}: ${cleanText(e.stack||e.message||e)}`);
        console.error('FAIL:',role,route,cleanText(e.stack||e.message||e));
      }finally{await page.close().catch(()=>{})}
    }
  }finally{await context.close().catch(()=>{})}
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    await Promise.all(Object.entries(routes).map(([role,list])=>sweepRole(browser,role,list)));
  }finally{await browser.close()}
  if(failures.length){
    console.error(`BROWSER ACTIONABILITY E2E FAILED: ${failures.length} falha(s) após ${checked} controle(s) verificados em ${pagesChecked} página(s).`);
    failures.forEach(x=>console.error('- '+x));
    process.exit(1);
  }
  console.log(`BROWSER ACTIONABILITY E2E PASS: ${checked} controle(s) visíveis/habilitados passaram hit-test DOM real em ${pagesChecked} página(s).`);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
