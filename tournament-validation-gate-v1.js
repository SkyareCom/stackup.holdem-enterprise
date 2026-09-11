(()=>{
'use strict';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const returnTo=new URLSearchParams(location.search).get('return')||'';
const blocked=page==='checkin.html'||page==='pre-registration.html'||(page==='smart-registration.html'&&returnTo==='checkin.html');
if(!blocked)return;
const KEY='stackup-validated-tournaments-v1';
function validated(){try{const map=JSON.parse(localStorage.getItem(KEY)||'{}');return !!(window.state?.eventId&&map&&map[String(state.eventId)])}catch(_){return false}}
function apply(){if(!window.state)return setTimeout(apply,80);if(validated())return;const st=document.createElement('style');st.id='tournamentValidationGateStyle';st.textContent=`body>*:not(#stackup-global-nav):not(#tournamentValidationGate){filter:grayscale(.35);opacity:.45;pointer-events:none!important}#tournamentValidationGate{max-width:980px;margin:14px auto;padding:0 18px;color:#fff}#tournamentValidationGate .gateTitle{color:#8DFC3B;margin-bottom:6px}#tournamentValidationGate .gateText{color:#AEB8B1;line-height:1.5;margin-bottom:10px}#tournamentValidationGate a{display:flex;align-items:center;justify-content:center;min-height:44px;padding:10px 12px;border:1px solid #8DFC3B;border-radius:9px;color:#8DFC3B;text-decoration:none;background:#060907}`;document.head.appendChild(st);const box=document.createElement('div');box.id='tournamentValidationGate';box.innerHTML='<div class="gateTitle">TORNEIO NÃO VALIDADO</div><div class="gateText">INSCRIÇÕES E CHECK-IN SÓ SÃO LIBERADOS APÓS AUDITORIA, ATIVAÇÃO E CONFIRMAÇÃO EM GESTÃO DE TORNEIOS.</div><a href="tournament-manager.html">IR PARA GESTÃO DE TORNEIOS</a>';document.body.insertBefore(box,document.body.firstChild)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();