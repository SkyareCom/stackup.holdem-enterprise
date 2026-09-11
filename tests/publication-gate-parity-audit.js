const fs=require('fs');
const smoke=fs.readFileSync('.github/workflows/tournament-smoke.yml','utf8');
const pages=fs.readFileSync('.github/workflows/pages.yml','utf8');
const failures=[];
const required=[
  'tests/tournament-smoke.js',
  'tests/tournament-isolation-runtime.js',
  'tests/balancing-scope-runtime.js',
  'tests/tournament-detail-scope-audit.js',
  'tests/control-hub-scope-audit.js',
  'tests/readiness-scope-runtime.js',
  'tests/tournament-manager-permission-audit.js',
  'tests/communication-security-audit.js',
  'tests/role-navigation-audit.js',
  'tests/cash-security-audit.js',
  'tests/wallet-read-safety-audit.js',
  'tests/dealer-activation-audit.js',
  'tests/final-table-settings-audit.js',
  'tests/alert-save-audit.js',
  'tests/ui-button-audit.js',
  'tests/final-interaction-audit.js',
  'tests/dom-global-collision-audit.js',
  'tests/production-readiness.js',
  'tests/cross-sector-integration-audit.js',
  'tests/runtime-api-contract-audit.js',
  'tests/staff-integrity-audit.js',
  'tests/player-directory-integrity-audit.js',
  'tests/auth-surface-audit.js',
  'tests/tertiary-structure-audit.js',
  'tests/in-app-drawer-audit.js',
  'tests/secondary-screen-audit.js',
  'tests/confirmation-standard-audit.js',
  'tests/environment-context-audit.js',
  'tests/ranking-hierarchy-audit.js',
  'tests/save-persistence-audit.js',
  'tests/input-mask-audit.js',
  'tests/language-audit.js',
  'tests/spanish-english-audit.js',
  'tests/language-runtime-alerts-audit.js'
];
for(const test of required){
  if(!smoke.includes(`node ${test}`))failures.push(`Tournament Smoke não executa ${test}`);
  if(!pages.includes(`node ${test}`))failures.push(`Pages publication gate não executa ${test}`);
}
if(!smoke.includes('node tests/publication-gate-parity-audit.js'))failures.push('Tournament Smoke não audita paridade do gate');
if(!pages.includes('node tests/publication-gate-parity-audit.js'))failures.push('Pages não audita paridade do gate');
if(!pages.includes('playwright@1.55.0')||!pages.includes('playwright install --with-deps chromium'))failures.push('Pages não instala Chromium real para o gate E2E');
const browserRequired=[
  'tests/browser-open-test-e2e.cjs',
  'tests/browser-actionability-e2e.cjs',
  'tests/browser-control-dynamic-e2e.cjs',
  'tests/browser-environment-dynamic-e2e.cjs',
  'tests/browser-manager-dynamic-e2e.cjs',
  'tests/browser-setup-dynamic-e2e.cjs',
  'tests/browser-checkin-dynamic-e2e.cjs'
];
for(const test of browserRequired)if(!pages.includes(`node ${test}`))failures.push(`Pages não executa ${test} antes do deploy`);
if(failures.length){console.error(`PUBLICATION GATE PARITY AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log(`PUBLICATION GATE PARITY AUDIT PASS: ${required.length} verificações críticas em ambos os workflows + ${browserRequired.length} jornadas Chromium obrigatórias no Pages.`);
