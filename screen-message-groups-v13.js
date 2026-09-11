(()=>{
'use strict';
const src='screen-message-groups-v12.js?v=866fd646';
fetch(src,{cache:'no-store'}).then(r=>r.text()).then(code=>{
 code=code.replace("const REGISTRATION_IDS=new Set(['lastRegistration','lastRebuy','lastEntry','lastRebuyEntry']);","const REGISTRATION_IDS=new Set(['lastRegistration','lastEntries','lastReentries','lastRebuy','lastEntry','lastRebuyEntry']);");
 code=code.replace("{id:'levelStart',ids:['levelAnte','levelNoAnte']}","{id:'levelStart',ids:['levelAnte','levelNoAnte','lastRegistration','lastEntries','lastReentries']}");
 code=code.replace("{id:'levelEnd',ids:['level3','level1','lastRegistration','lastEntry','lastRebuy','lastRebuyEntry']}","{id:'levelEnd',ids:['level3','level1','lastRegistration','lastEntries','lastReentries','lastEntry','lastRebuy','lastRebuyEntry']}");
 code=code.replaceAll("lastRegistration:'ÚLTIMO NÍVEL PARA REGISTRO NO TORNEIO'","lastRegistration:'ÚLTIMO NÍVEL PARA REGISTROS NO TORNEIO',lastEntries:'ÚLTIMO NÍVEL PARA ENTRADAS NO TORNEIO',lastReentries:'ÚLTIMO NÍVEL PARA REENTRADAS NO TORNEIO'");
 code=code.replaceAll("lastRegistration:'LAST LEVEL FOR TOURNAMENT REGISTRATION'","lastRegistration:'LAST LEVEL FOR TOURNAMENT REGISTRATIONS',lastEntries:'LAST LEVEL FOR TOURNAMENT ENTRIES',lastReentries:'LAST LEVEL FOR TOURNAMENT RE-ENTRIES'");
 code=code.replaceAll("lastRegistration:'ÚLTIMO NIVEL PARA REGISTRO EN EL TORNEO'","lastRegistration:'ÚLTIMO NIVEL PARA REGISTROS EN EL TORNEO',lastEntries:'ÚLTIMO NIVEL PARA ENTRADAS EN EL TORNEO',lastReentries:'ÚLTIMO NIVEL PARA REENTRADAS EN EL TORNEO'");
 (0,eval)(code+'\n//# sourceURL=screen-message-groups-v13-runtime.js');
}).catch(err=>console.error('STACKUP MESSAGE GROUPS V13',err));
})();