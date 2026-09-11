const fs=require('fs');
const vm=require('vm');
const failures=[];
const assert=(name,cond,detail='')=>{if(cond)console.log('PASS:',name);else failures.push(name+(detail?` • ${detail}`:''))};

const store=new Map();
const events=[];
const localStorage={
  getItem:k=>store.has(k)?store.get(k):null,
  setItem:(k,v)=>store.set(k,String(v)),
  removeItem:k=>store.delete(k)
};
class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}}
const window={
  dispatchEvent:event=>{events.push(event?.type||'UNKNOWN');return true},
  StackupFinance:{load:()=>({feePolicy:{}}),feeWaived:()=>false}
};
const sandbox={console,localStorage,CustomEvent,window,Date,Math,JSON,String,Array,Object,Number,Map,Set};
window.window=window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('wallet-engine.js','utf8'),sandbox,{filename:'wallet-engine.js'});
const wallet=window.StackupWallet;
assert('Wallet engine foi carregado',!!wallet);
const player={id:'p-wallet-test',directoryId:'dir-wallet-test',name:'PLAYER TEST'};

const beforeFirst=events.length;
const first=wallet.account(player);
const afterFirst=events.length;
assert('Primeira criação de conta pode emitir uma única mudança',!!first&&afterFirst-beforeFirst===1,`eventos=${afterFirst-beforeFirst}`);

const beforeRead=events.length;
const second=wallet.account(player);
const afterRead=events.length;
assert('Leitura de conta existente não dispara stackup-wallet-change',!!second&&afterRead===beforeRead,`antes=${beforeRead} depois=${afterRead}`);

const beforeDeposit=events.length;
const deposit=wallet.deposit(player,100,{reference:'QA'});
const afterDeposit=events.length;
assert('Mutação real continua disparando evento de wallet',deposit.ok&&afterDeposit-beforeDeposit===1,`eventos=${afterDeposit-beforeDeposit}`);
assert('Evento de mutação é stackup-wallet-change',events[events.length-1]==='stackup-wallet-change',events[events.length-1]);

const beforePostMutationRead=events.length;
const third=wallet.account(player);
const afterPostMutationRead=events.length;
assert('Leitura após mutação também permanece silenciosa',third?.balanceBRL===100&&afterPostMutationRead===beforePostMutationRead,`saldo=${third?.balanceBRL} eventos=${afterPostMutationRead-beforePostMutationRead}`);

if(failures.length){console.error(`WALLET READ SAFETY AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('WALLET READ SAFETY AUDIT PASS: leituras não reentram no render; mutações continuam notificando.');
