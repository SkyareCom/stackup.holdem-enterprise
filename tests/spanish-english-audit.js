const fs=require('fs');
const path=require('path');
const i18n=require('../app-language.js');
require('../app-language-extra.js');
require('../app-language-final.js');
require('../app-language-qa.js');
require('../app-language-alerts-v1.js');
require('../app-language-spanish-clean-v1.js');
const ROOT=path.resolve(__dirname,'..');
const EXCLUDE=new Set(['node_modules','.git','.github','tests','tools']);
const allowed=new Set(['POKER','HOLD','EM','CASH','BUY-IN','REBUY','REBUYS','RE-ENTRY','RE-ENTRIES','ADD-ON','ADD-ONS','BLINDS','ANTE','BOUNTY','PKO','STACK','STACKS','POT','POTS','DEALER','DEALERS','HAND','HAND-FOR-HAND','ITM','TDA','CRM','TV','SMS','WHATSAPP','EMAIL','FIRE','STICK','CAST','HOME','GAME','GAMES','FLOOR','TD','AI','PIX']);
const suspicious=new Set(['BACK','MAIN','MENU','PRIMARY','SECONDARY','SETTINGS','SAVE','CANCEL','EDIT','DELETE','OPEN','CLOSE','START','END','NEXT','PREVIOUS','PLAYER','PLAYERS','LEFT','LIVE','CREDIT','TOURNAMENT','TOURNAMENTS','LEVEL','LEVELS','MESSAGE','MESSAGES','VOICE','VOICES','SOUND','SOUNDS','TEXT','ALERT','ALERTS','ACTIVE','INACTIVE','MALE','FEMALE','SELECT','SELECTED','TEST','TESTING','ENABLE','ENABLED','DISABLE','DISABLED','REMOVE','NEW','MANAGEMENT','REGISTRATION','STRUCTURE','STRUCTURES','TABLE','TABLES','BREAK','BREAKS','WELCOME','OPENING','RETURN','FROM','WITHOUT','WITH','ENTRY','ENTRIES','AUTOMATIC','FINISH','SEARCH','VIEW','CREATE','CREATED','UPDATE','UPDATED','CONFIRM','CONFIRMED','FINANCE','FINANCIAL','CONTACT','LANGUAGE','LANGUAGES','ENVIRONMENT','ENVIRONMENTS','TEAM','PERMISSIONS','DATABASE','OPERATIONS','BROADCAST','SCORING','RULEBOOK','ROOM','CLOCK','SCREEN','SCREENS','BACKGROUND','PROGRESS','CENTER','PERFORMANCE','LOYALTY','SEGMENTATION','COMMUNICATIONS','NOTICES','MOVES','OPERATIONAL','INFORMATION','DIRECTLY','CASHIER','PAYMENTS','CREDITS','WALLET','CURRENCIES','EXCHANGE','RATES','CLOSING','IMPORT','SMART','RECOGNITION','ANALYTICS','AUTOMATIONS','ASSISTANT','REPORTS','NONE','PENDING','REGISTERED','REQUIRED','INVALID','VALUE','DESTINATION','SEAT','OCCUPIED','SESSION','RESULT','NET','CURRENT','TIME','REMAINING','ELAPSED','UPCOMING','HISTORY','RESULTS','STATISTICS']);
const clean=s=>String(s||'').replace(/\\n/g,' ').replace(/\s+/g,' ').trim();
function walk(dir,out=[]){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(EXCLUDE.has(ent.name))continue;const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p,out);else if(ent.name.endsWith('.html'))out.push(p)}return out}
function extract(src){src=src.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'');const out=[];let m;const textRx=/>\s*([^<>]+?)\s*</g;while((m=textRx.exec(src)))out.push(m[1]);const attrRx=/(?:placeholder|title|aria-label|value)\s*=\s*["']([^"']+)["']/gi;while((m=attrRx.exec(src)))out.push(m[1]);return out}
const failures=[];let candidates=0;
for(const file of walk(ROOT)){const rel=path.relative(ROOT,file).replace(/\\/g,'/'),src=fs.readFileSync(file,'utf8');for(const raw of extract(src)){const source=clean(raw);if(source.length<2||source.length>360||!/\p{L}/u.test(source)||/^[A-Z0-9]+_[A-Z0-9_]+$/.test(source))continue;candidates++;const es=clean(i18n.translateString(source,'es'));const words=(es.toUpperCase().match(/[A-ZÁÉÍÓÚÜÑ-]+/g)||[]).filter(w=>suspicious.has(w)&&!allowed.has(w));if(words.length)failures.push(`${rel} :: ${source} => ${es} :: ENGLISH=[${[...new Set(words)].join(', ')}]`)}}
const unique=[...new Set(failures)];
if(unique.length){console.error(`SPANISH RENDERED-UI AUDIT FALHOU: ${unique.length} PROBLEMA(S) EM ${candidates} STRING(S) VISÍVEIS.`);unique.slice(0,1000).forEach(x=>console.error(' - '+x));process.exit(1)}
console.log(`SPANISH RENDERED-UI AUDIT OK: ${candidates} STRING(S) VISÍVEIS VERIFICADAS, SEM INGLÊS INDEVIDO.`);
