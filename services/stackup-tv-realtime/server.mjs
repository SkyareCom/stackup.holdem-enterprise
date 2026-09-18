import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_HOST = process.env.PUBLIC_HOST || 'tv.stackup-holdem.com';
const rooms = new Map();

function getRoom(code) {
  code = String(code || '').toUpperCase();
  let room = rooms.get(code);
  if (!room) {
    room = { senderKey: null, sender: null, receivers: new Set(), lastState: null };
    rooms.set(code, room);
  }
  return room;
}

function presence(room) {
  if (room.sender?.readyState === WebSocket.OPEN) {
    try { room.sender.send(JSON.stringify({ type: 'presence', viewers: room.receivers.size })); } catch {}
  }
}

function tvHtml(room) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"><title>STACKUP TV • ${room}</title><style>
:root{--g:#8dfc3b;--bg:#020402;--line:rgba(141,252,59,.84);--u:min(1vw,1.7777778vh)}*{box-sizing:border-box;font-family:Arial,sans-serif}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#020402;color:#fff}body{background:radial-gradient(circle at 50% 50%,#010403 0,#020805 22%,#071c12 72%,#0c3d28 100%)}.cast{position:fixed;inset:0;padding:calc(var(--u)*.65) calc(var(--u)*.95) 0;display:grid;grid-template-rows:calc(var(--u)*8.5) 1fr calc(var(--u)*4.5);gap:10px}.head{display:grid;align-items:center;text-align:center}.event{font-size:calc(var(--u)*5.2);color:var(--g);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.main{min-height:0;display:grid;grid-template-columns:18% minmax(0,1fr) 18%;gap:10px}.side{display:grid;grid-template-rows:repeat(5,minmax(0,1fr));gap:10px}.stat,.hero,.next{border:2px solid var(--line);border-radius:calc(var(--u)*.6);background:rgba(3,16,7,.9)}.stat{padding:calc(var(--u)*.55) calc(var(--u)*1.05);display:flex;flex-direction:column;justify-content:center}.left .stat{text-align:left}.right .stat{text-align:right}.stat span{color:var(--g);font-size:calc(var(--u)*2.08)}.stat b{font-size:calc(var(--u)*2.86);margin-top:calc(var(--u)*.25)}.center{display:grid;grid-template-rows:repeat(5,minmax(0,1fr));gap:10px}.hero{grid-row:1/5;display:grid;grid-template-rows:auto 1fr auto;padding:calc(var(--u)*.8) calc(var(--u)*1.2)}.level{text-align:center;color:var(--g);font-size:calc(var(--u)*6.25)}.level b{color:#fff}.timer{display:grid;place-items:center}.clock{color:var(--g);font-size:calc(var(--u)*20.8);line-height:.75}.track{width:92%;height:max(4px,calc(var(--u)*.28));background:#1c2c18;border-radius:99px;overflow:hidden}.fill{height:100%;width:100%;background:var(--g)}.current{text-align:center;font-size:calc(var(--u)*6.77)}.next{grid-row:5;display:grid;grid-template-columns:1fr 2fr;align-items:center;padding:calc(var(--u)*.6) calc(var(--u)*1.1)}.nextTitle{text-align:center;color:var(--g);font-size:calc(var(--u)*2.86)}.nextValue{text-align:center;font-size:calc(var(--u)*4.16)}.ticker{margin:0 calc(var(--u)*-.95);border-top:1px solid var(--line);background:#030703;display:grid;grid-template-columns:18% 64% 18%;align-items:center;padding:0 calc(var(--u)*1.25)}.ticker em{font-style:normal;color:var(--g)}.tickerCenter{text-align:center;font-size:calc(var(--u)*2.08)}.wall{text-align:right}.status{position:fixed;right:10px;top:10px;font-size:12px;color:rgba(255,255,255,.55)}@media(orientation:portrait){.cast{width:100vh;height:56.25vh;top:50%;left:50%;inset:auto;transform:translate(-50%,-50%) rotate(90deg);--u:min(1vh,1.7777778vw)}}</style></head><body><div class="status" id="status">CONECTANDO...</div><main class="cast"><header class="head"><div class="event" id="eventName">EVENTO</div></header><section class="main"><aside class="left"><div class="side"><div class="stat"><span>ATIVOS / TOTAL</span><b id="leftField">0 / 0</b></div><div class="stat"><span>TOTAL CHIPS</span><b id="totalChips">0</b></div><div class="stat"><span>AVG STACK</span><b id="avgStack">0</b></div><div class="stat"><span>DECORRIDO</span><b id="elapsed">00:00:00</b></div><div class="stat"><span>INTERVALO</span><b id="breakTime">—</b></div></div></aside><section class="center"><div class="hero"><div class="level">NÍVEL <b id="level">00</b></div><div class="timer"><div class="clock" id="time">00:00</div><div class="track"><div class="fill" id="fill"></div></div></div><div class="current"><b id="sb">0</b> / <b id="bb">0</b> (<b id="ante">0</b>)</div></div><div class="next"><div class="nextTitle">PRÓXIMO NÍVEL</div><div class="nextValue"><b id="nextSb">0</b> / <b id="nextBb">0</b> (<b id="nextAnte">0</b>)</div></div></section><aside class="right"><div class="side"><div class="stat"><span>ENTRADAS</span><b id="buyIn">0</b></div><div class="stat"><span>RE-ENTRADAS</span><b id="reentry">0</b></div><div class="stat"><span>REBUYS I / II</span><b id="rebuy">0 / 0</b></div><div class="stat"><span>ADD ONS I / II</span><b id="addon">0 / 0</b></div><div class="stat"><span>BONUS I / II</span><b id="bonus">0 / 0</b></div></div></aside></section><footer class="ticker"><div>STACK<em>UP</em></div><div class="tickerCenter">♠ STACKUP HOLD'EM ENTERPRISE</div><div class="wall" id="wall">--:--</div></footer></main><script>
const room=${JSON.stringify(room)};const ids={eventName:'eventName',level:'level',time:'time',currentSb:'sb',currentBb:'bb',currentAnte:'ante',nextSb:'nextSb',nextBb:'nextBb',nextAnte:'nextAnte',leftField:'leftField',totalChips:'totalChips',avgStack:'avgStack',elapsed:'elapsed',breakTime:'breakTime',buyIn:'buyIn',reentry:'reentry',rebuy:'rebuy',addon:'addon',bonus:'bonus'};function render(p){if(!p)return;for(const[k,id]of Object.entries(ids)){if(p[k]!=null)document.getElementById(id).textContent=p[k]}if(p.progress!=null)document.getElementById('fill').style.width=Math.max(0,Math.min(100,+p.progress||0))+'%'}function connect(){const proto=location.protocol==='https:'?'wss:':'ws:';const ws=new WebSocket(proto+'//'+location.host+'/cast/'+room+'?role=receiver');status.textContent='CONECTANDO...';ws.onopen=()=>status.textContent='AO VIVO';ws.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.type==='state')render(m.payload)}catch{}};ws.onclose=()=>{status.textContent='RECONECTANDO...';setTimeout(connect,1500)};ws.onerror=()=>{try{ws.close()}catch{}}}setInterval(()=>wall.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),1000);connect();</script></body></html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const codeMatch = url.pathname.match(/^\/([A-Z2-9]{5})\/?$/i);
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase();
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(tvHtml(code));
    return;
  }
  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'stackup-tv-realtime', host: PUBLIC_HOST }));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(`STACKUP TV\nUse: https://${PUBLIC_HOST}/ABCDE`);
});

const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = url.pathname.match(/^\/cast\/([A-Z2-9]{5})$/i);
  if (!match) return socket.destroy();
  const code = match[1].toUpperCase();
  const role = url.searchParams.get('role') === 'sender' ? 'sender' : 'receiver';
  const key = url.searchParams.get('key') || '';
  const room = getRoom(code);
  if (role === 'sender') {
    if (room.senderKey && room.senderKey !== key) { socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return socket.destroy(); }
    if (!room.senderKey) {
      if (!key) { socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n'); return socket.destroy(); }
      room.senderKey = key;
    }
  }
  wss.handleUpgrade(req, socket, head, (ws) => { ws.roomCode = code; ws.role = role; wss.emit('connection', ws, req); });
});
wss.on('connection', (ws) => {
  const room = getRoom(ws.roomCode);
  if (ws.role === 'sender') {
    if (room.sender && room.sender.readyState === WebSocket.OPEN) { try { room.sender.close(4001, 'replaced'); } catch {} }
    room.sender = ws;
  } else {
    room.receivers.add(ws);
    if (room.lastState) { try { ws.send(JSON.stringify({ type: 'state', payload: room.lastState })); } catch {} }
  }
  presence(room);
  ws.on('message', (raw) => {
    if (ws.role !== 'sender') return;
    let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (!msg || msg.type !== 'state' || !msg.payload) return;
    room.lastState = msg.payload;
    const packet = JSON.stringify({ type: 'state', payload: msg.payload });
    for (const client of room.receivers) if (client.readyState === WebSocket.OPEN) { try { client.send(packet); } catch {} }
  });
  const cleanup = () => {
    if (ws.role === 'sender' && room.sender === ws) room.sender = null;
    if (ws.role === 'receiver') room.receivers.delete(ws);
    presence(room);
  };
  ws.on('close', cleanup); ws.on('error', cleanup);
});
server.listen(PORT, '0.0.0.0', () => console.log(`STACKUP TV realtime listening on ${PORT}`));