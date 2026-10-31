/* Vào Tù Thăm Idol — parody giải trí hư cấu, chạy hoàn toàn client-side.
   Không dùng ảnh thật. Mọi số liệu online/bảng vàng đều là mô phỏng, đã ghi rõ. */
'use strict';
const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem('thamtu_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('thamtu_' + k, JSON.stringify(v)); } catch (e) {} }
};

const IDOLS = [
  { id:'kha', name:'Khá Bảnh', real:'Ngô Bá Khá', emoji:'🕺', tag:'Múa quạt huyền thoại',
    status:'Đang chấp hành án 10 năm 6 tháng (2019) — tội đánh bạc / tổ chức đánh bạc.',
    desc:'Idol múa quạt. Vào thăm là được xem múa quạt theo nhịp, nhớ đừng rủ đánh lô đề.',
    game:'Múa quạt theo nhịp', gameDesc:'Nhẫn vàng sáng lên thì bấm “MÚA!” đúng nhịp. Bấm đúng +10 điểm, bấm trượt +1.',
    lines:['Múa quạt nè! Quạt này quạt cho mát, không quạt cho ai nóng!','Con đi không sao đâu, rồi con sẽ về!','Ở đây anh em đều ngoan, chỉ thiếu mỗi quạt thôi!','Nhớ nhà thì múa một bài cho đỡ nhớ!'],
    chat:[
      { keys:['làm','an','ăn'], reply:'Chỉ có làm thì mới có ăn… à nhầm, câu đó của anh Huấn. Anh thì chỉ có múa thì mới có quạt!' },
      { keys:['tiền'], reply:'Tiền thì anh không rủ ai đánh bạc nữa đâu. Giờ anh chỉ đếm… nhịp múa thôi.' },
      { keys:['ra tù','về'], reply:'Anh hứa ra tù sẽ làm công dân tốt. Giờ thì múa tiếp cho qua ngày!' },
      { keys:['nhớ nhà','nhớ mẹ'], reply:'Anh cũng nhớ nhà lắm. Nhưng mà múa một bài là thấy đỡ nhớ hơn một tí.' },
      { keys:['quạt','múa'], reply:'Muốn xem múa quạt không? Bấm nút MÚA ở mini-game bên phải kìa!' }
    ]},
  { id:'huan', name:'Huấn Hoa Hồng', real:'Bùi Xuân Huấn', emoji:'🌹', tag:'Thầy giảng đạo lý',
    status:'Bị khởi tố + tạm giam tháng 8/2026 — ĐANG CHỜ XỬ LÝ, chưa có bản án tuyên.',
    desc:'Thầy đạo lý. Vào thăm là được nghe giảng, nhưng nhớ: làm thì mới có ăn.',
    game:'Trắc nghiệm đạo lý', gameDesc:'Chọn câu đạo lý đúng phong cách thầy Huấn. Đúng +20 điểm, sai thì thầy lắc đầu.',
    lines:['Chỉ có làm thì mới có ăn, không làm mà đòi có ăn thì… thôi, tự hiểu nhé!','Các em vào đây thăm thầy là thầy vui rồi!','Đạo lý thì nhiều, nhưng quan trọng là phải làm!','Thầy ở đây vẫn ổn, các em ở ngoài nhớ làm ăn chân chính nhé!'],
    chat:[
      { keys:['làm','an','ăn'], reply:'Chỉ có làm thì mới có ăn! Không làm mà đòi có ăn thì chỉ có ăn… đòn thôi!' },
      { keys:['tiền'], reply:'Tiền kiếm bằng mồ hôi mới bền. Tiền nhanh thì đi cũng nhanh lắm em ạ.' },
      { keys:['ra tù','về'], reply:'Thầy đang chờ xử lý, chưa có bản án. Các em cứ sống tốt đi, đừng học theo thầy đoạn này.' },
      { keys:['nhớ nhà','nhớ'], reply:'Nhớ nhà thì gọi về cho bố mẹ đi em. Đừng để tới lúc muốn gọi mà không được.' },
      { keys:['hoa','hồng'], reply:'Hoa hồng thì đẹp, nhưng gai thì đau. Làm ăn cũng vậy, đừng ham cái đẹp mà quên cái gai!' }
    ]},
  { id:'truong', name:'Trường Con', real:'Trịnh Xuân Trường', emoji:'🍜', tag:'Thánh ăn chực',
    status:'Đang chấp hành án 20 năm tù (xử 2020) — tội mua bán trái phép chất ma túy.',
    desc:'Thánh ăn chực. Vào thăm nhớ mang đồ ăn, idol này chỉ cần đồ ăn là vui.',
    game:'Hứng đồ ăn rơi', gameDesc:'Kéo rổ / bấm ← → để hứng đồ ăn rơi. Hứng được +10 điểm, để rơi thì tiếc lắm!',
    lines:['Có đồ ăn không em? Cho anh xin một miếng!','Anh ở đây vẫn khỏe, chỉ thèm bát mì tôm thôi!','Ngày xưa anh hay đi ăn chực, giờ thì… vẫn thèm ăn!','Cảm ơn em đã vào thăm, nhớ mang theo xúc xích nhé!'],
    chat:[
      { keys:['làm','an','ăn'], reply:'Ăn thì anh rành lắm! Nhưng mà ăn chực hoài cũng không tốt, các em đừng học anh!' },
      { keys:['tiền'], reply:'Tiền thì anh không có, nhưng đồ ăn thì anh xin một miếng được không?' },
      { keys:['ra tù','về'], reply:'Án anh còn dài lắm. Các em ở ngoài nhớ sống tử tế, đừng dính vào ma túy nhé.' },
      { keys:['nhớ nhà','nhớ'], reply:'Anh nhớ Nam Định lắm. Nhớ cả những bữa cơm nhà nữa…' },
      { keys:['mì','đồ ăn'], reply:'Mì tôm là chân ái! Gửi cho anh một gói ở nút quà bên trên kìa!' }
    ]},
  { id:'khanh', name:'Khánh Sky', real:'Nguyễn Văn Hợi', emoji:'👑', tag:'Thiên tử livestream',
    status:'Bị bắt khẩn cấp + khởi tố tháng 8/2026 — ĐANG CHỜ XỬ LÝ, chưa có bản án tuyên.',
    desc:'Thiên tử livestream. Vào thăm là được xem livestream trong tù, view tăng vù vù.',
    game:'Livestream tăng view', gameDesc:'Bấm liên tục để tăng view livestream trong 15 giây. Né nút “BỊ REPORT” — bấm nhầm là mất 200 view!',
    lines:['Livestream của anh lúc nào cũng đông, giờ trong này cũng đông!','Các em bấm follow cho anh nhé, dù anh đang… nghỉ livestream dài hạn!','Anh xin lỗi mọi người, giờ anh chỉ muốn sống yên ổn thôi!','View tăng nhanh thế, các em bấm nhiệt tình quá!'],
    chat:[
      { keys:['làm','an','ăn'], reply:'Làm livestream thì phải có trách nhiệm với lời nói của mình, em ạ. Anh giờ mới hiểu.' },
      { keys:['tiền'], reply:'Tiền view thì nhanh, nhưng cái giá phải trả cũng không rẻ đâu em.' },
      { keys:['ra tù','về'], reply:'Anh đang chờ xử lý, chưa có bản án. Mong mọi người đừng chửi bới nhau nữa.' },
      { keys:['nhớ nhà','nhớ'], reply:'Anh nhớ nhà, nhớ mẹ lắm. Ở đây anh mới có thời gian nghĩ lại.' },
      { keys:['live','view'], reply:'Muốn tăng view không? Chơi mini-game livestream bên phải đi, bấm càng nhanh view càng lên!' }
    ]}
];

const GIFTS = [
  { emoji:'🍜', name:'Mì tôm', pts:10, secs:30 },
  { emoji:'🥚', name:'Trứng lộn', pts:15, secs:20 },
  { emoji:'🌭', name:'Xúc xích', pts:12, secs:20 },
  { emoji:'🥤', name:'Nước ngọt', pts:8, secs:15 }
];

const state = {
  points: store.get('points', 0),
  visited: new Set(store.get('visited', [])),
  streak: store.get('streak', 0),
  lastVisitDay: store.get('lastVisitDay', ''),
  missions: store.get('missions', {}),
  chatCount: 0, giftsSentToday: 0, gamesPlayed: 0,
  currentIdol: null, visitSeconds: 180, visitPoints: 0, sentCount: 0,
  timerId: null, gameTimerId: null, gameActive: false, gameScore: 0,
  ticket: null, queueNum: 14, playerX: 50, playerY: 62, sitting: false
};

function save() {
  store.set('points', state.points);
  store.set('visited', Array.from(state.visited));
  store.set('streak', state.streak);
  store.set('lastVisitDay', state.lastVisitDay);
  store.set('missions', state.missions);
}
function todayStr() { return new Date().toDateString(); }
function bumpStreak() {
  const t = todayStr();
  if (state.lastVisitDay === t) return;
  const y = new Date(Date.now() - 86400000).toDateString();
  state.streak = (state.lastVisitDay === y) ? state.streak + 1 : 1;
  state.lastVisitDay = t; save();
}
function rankFor(p) {
  if (p >= 500) return '👑 Đại sứ thăm tù';
  if (p >= 200) return '🏅 Fan cứng thăm nuôi';
  if (p >= 80) return '⭐ Người thăm đều';
  return '🌱 Tân binh thăm nuôi';
}
function updateHeader() {
  $('visitedCount').textContent = state.visited.size + '/4';
  $('streakCount').textContent = state.streak;
  $('rankName').textContent = rankFor(state.points);
  $('pointsTotal').textContent = state.points.toLocaleString('vi-VN');
}
function toast(msg) {
  const t = $('hallToast'); t.textContent = msg; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 2600);
}
function addPoints(n) { state.points += n; state.visitPoints += n; updateHeader(); $('visitPoints').textContent = state.visitPoints; save(); }

/* ---------- Lobby: idols, cells, missions, leaderboard ---------- */
function renderIdols() {
  $('idolGrid').innerHTML = IDOLS.map(d => `
    <article class="idol-card ${state.visited.has(d.id) ? 'visited' : ''}" data-id="${d.id}" tabindex="0" role="button" aria-label="Thăm ${d.name}">
      <div class="idol-emoji">${d.emoji}</div>
      <h3>${d.name}</h3>
      <span class="tag">${d.tag}</span>
      <p>${d.desc}</p>
      <p class="fine">${d.status}</p>
      <p class="fine">🎮 ${d.game} • ${state.visited.has(d.id) ? '✅ Đã thăm' : 'Chưa thăm'}</p>
      <button class="btn primary visit-btn">Vào phòng thăm →</button>
    </article>`).join('');
  document.querySelectorAll('.idol-card').forEach(c => {
    const go = () => openVisit(c.dataset.id);
    c.addEventListener('click', go);
    c.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
}
function renderCells() {
  const busy = [1,3,5,8,11,14,17,20,22];
  $('cellsGrid').innerHTML = Array.from({length:24}, (_,i) => {
    const n = i + 1, isBusy = busy.includes(n);
    return `<div class="cell ${isBusy ? 'busy' : 'free'}">${isBusy ? '🧑‍🤝‍🧑' : '🪟'}<small>Ô ${String(n).padStart(2,'0')} • ${isBusy ? 'Đang thăm' : 'Trống'}</small></div>`;
  }).join('');
}
const MISSIONS = [
  { id:'visit1', text:'Thăm 1 idol hôm nay', check:() => state.visited.size > 0 },
  { id:'gift3', text:'Gửi 3 món đồ thăm nuôi', check:() => state.giftsSentToday >= 3 },
  { id:'game1', text:'Chơi 1 mini-game', check:() => state.gamesPlayed >= 1 },
  { id:'chat3', text:'Chat với idol 3 câu', check:() => state.chatCount >= 3 }
];
function renderMissions() {
  $('missionsList').innerHTML = MISSIONS.map(m => {
    const done = m.check() || !!state.missions[m.id];
    return `<li class="${done ? 'done' : ''}">${done ? '✅' : '⭕'} ${m.text}<button class="btn small" data-m="${m.id}" ${done ? 'disabled' : ''}>${done ? 'Xong' : 'Đang làm'}</button></li>`;
  }).join('');
}
function renderLeaderboard() {
  const rows = [['FanCuong99', 1280], ['ThamNuoiMoiNgay', 940], ['MeKhaBanh', 720], ['SkyOi', 610], ['Ban (bạn)', state.points]];
  $('leaderboardList').innerHTML = rows.map(r => `<li><b>${r[0]}</b> — ${r[1].toLocaleString('vi-VN')} điểm</li>`).join('');
}

/* ---------- Hall: player movement + bots ---------- */
const BOTS = [
  { emoji:'👵', name:'Bà Tư', x:20, y:55 }, { emoji:'🧔', name:'Anh Ba', x:70, y:70 },
  { emoji:'👩', name:'Chị Lan', x:35, y:75 }, { emoji:'🧑‍🎓', name:'Sinh viên', x:80, y:50 },
  { emoji:'👴', name:'Ông Sáu', x:55, y:80 }, { emoji:'👧', name:'Bé An', x:15, y:70 }
];
function renderBots() {
  $('bots').innerHTML = BOTS.map((b,i) => `<div class="bot" id="bot${i}" style="left:${b.x}%;top:${b.y}%">${b.emoji}<span class="name-tag">${b.name}</span></div>`).join('');
}
function movePlayer(dx, dy) {
  state.playerX = Math.max(4, Math.min(96, state.playerX + dx));
  state.playerY = Math.max(28, Math.min(88, state.playerY + dy));
  const p = $('player'); p.style.left = state.playerX + '%'; p.style.top = state.playerY + '%';
}
function moveBots() {
  BOTS.forEach((b,i) => {
    b.x = Math.max(5, Math.min(95, b.x + (Math.random()*16 - 8)));
    b.y = Math.max(30, Math.min(86, b.y + (Math.random()*10 - 5)));
    const el = $('bot' + i); if (el) { el.style.left = b.x + '%'; el.style.top = b.y + '%'; }
  });
}
function nearestBot() {
  let best = null, bd = 1e9;
  BOTS.forEach(b => { const d = Math.hypot(b.x - state.playerX, b.y - state.playerY); if (d < bd) { bd = d; best = b; } });
  return bd < 30 ? best : null;
}
function initHall() {
  renderBots();
  $('hall').addEventListener('click', (e) => {
    const r = $('hall').getBoundingClientRect();
    state.playerX = Math.max(4, Math.min(96, (e.clientX - r.left) / r.width * 100));
    state.playerY = Math.max(28, Math.min(88, (e.clientY - r.top) / r.height * 100));
    const p = $('player'); p.style.left = state.playerX + '%'; p.style.top = state.playerY + '%';
  });
  document.addEventListener('keydown', (e) => {
    if (!$('lobbyScreen').classList.contains('active')) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const step = 5;
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') { movePlayer(0,-step); e.preventDefault(); }
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') { movePlayer(0,step); e.preventDefault(); }
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') { movePlayer(-step,0); e.preventDefault(); }
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') { movePlayer(step,0); e.preventDefault(); }
  });
  setInterval(moveBots, 2200);
  setInterval(() => { // simulated online count, labelled as illustration in header
    $('onlineCount').textContent = (1200 + Math.floor(Math.random()*180)).toLocaleString('vi-VN');
    $('queueNow').textContent = 8 + Math.floor(Math.random()*12);
  }, 5000);
  $('waveBtn').addEventListener('click', () => {
    const b = nearestBot();
    toast(b ? `👋 Bạn vẫy tay chào ${b.name} — ${b.name} vẫy lại bạn!` : '👋 Bạn vẫy tay… chưa ai ở gần để chào lại!');
    if (b) addPoints(1);
  });
  $('bowBtn').addEventListener('click', () => {
    const b = nearestBot();
    toast(b ? `🙏 Bạn chắp tay chào ${b.name} — ${b.name} chắp tay đáp lễ!` : '🙏 Bạn chắp tay chào cả sảnh!');
    if (b) addPoints(1);
  });
  $('sitBtn').addEventListener('click', () => {
    state.sitting = !state.sitting;
    $('sitBtn').textContent = state.sitting ? '🧍 Đứng dậy' : '🪑 Ngồi chờ';
    toast(state.sitting ? '🪑 Bạn ngồi xuống ghế chờ, thở một hơi…' : '🧍 Bạn đứng dậy, sẵn sàng vào thăm!');
  });
  $('takeTicketBtn').addEventListener('click', () => {
    state.queueNum += 1;
    state.ticket = 'A-' + String(state.queueNum).padStart(3,'0');
    const t = $('ticketNumber'); t.textContent = state.ticket; t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop');
    toast('🎟️ Bạn đã lấy số ' + state.ticket + '! Ngồi chờ một lát nhé.');
  });
  $('nextNumberBtn').addEventListener('click', () => {
    const n = parseInt($('callingNumber').textContent.slice(2), 10) + 1;
    $('callingNumber').textContent = 'A-' + String(n).padStart(3,'0');
    if (state.ticket === $('callingNumber').textContent) toast('🔔 TỚI LƯỢT BẠN RỒI! Vào chọn idol để thăm ngay!');
  });
}

/* ---------- Visit room ---------- */
function fmt(s) { return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }
function openVisit(id) {
  const d = IDOLS.find(x => x.id === id); if (!d) return;
  state.currentIdol = d; state.visitSeconds = 180; state.visitPoints = 0; state.sentCount = 0;
  $('visitTitle').textContent = 'Phòng thăm — ' + d.name + ' ' + d.emoji;
  $('visitStatus').textContent = d.real + ' • ' + d.status + ' (Parody hư cấu)';
  $('idolAvatar').textContent = d.emoji;
  $('speechBubble').textContent = d.lines[0];
  $('visitTimer').textContent = fmt(state.visitSeconds);
  $('visitPoints').textContent = '0'; $('sentCount').textContent = '0';
  $('chatLog').innerHTML = `<div class="chat-msg idol"><b>${d.name}:</b> Chào em! Vào thăm anh/chị là vui rồi. Bấm vào anh/chị hoặc gõ câu hỏi nhé!</div>`;
  $('gameTitle').textContent = '🎮 Mini-game: ' + d.game;
  $('gameDesc').textContent = d.gameDesc;
  $('gameArea').innerHTML = '<p class="fine">Bấm “Chơi mini-game” để bắt đầu. Chơi xong được cộng điểm thăm nuôi.</p>';
  $('gameScore').textContent = '0'; $('gameTime').textContent = '—'; $('gameResult').hidden = true;
  $('quickAsk').innerHTML = ['Hôm nay idol khỏe không?','Idol có nhớ nhà không?','Khi nào idol ra tù?','Idol thích ăn gì nhất?'].map(q => `<button type="button">${q}</button>`).join('');
  document.querySelectorAll('#quickAsk button').forEach(b => b.addEventListener('click', () => { $('chatInput').value = b.textContent; sendChat(); }));
  renderGifts();
  $('lobbyScreen').classList.remove('active'); $('visitScreen').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.visitSeconds -= 1;
    if (state.visitSeconds <= 0) { endVisit('Hết giờ thăm!'); return; }
    $('visitTimer').textContent = fmt(state.visitSeconds);
  }, 1000);
  bumpStreak(); updateHeader();
}
function renderGifts() {
  $('giftsRow').innerHTML = GIFTS.map((g,i) => `<button class="gift-btn" data-i="${i}">${g.emoji} ${g.name}<br><small>+${g.pts}đ • +${g.secs}s</small></button>`).join('');
  document.querySelectorAll('.gift-btn').forEach(b => b.addEventListener('click', () => {
    const g = GIFTS[+b.dataset.i];
    state.sentCount += 1; state.giftsSentToday += 1;
    $('sentCount').textContent = state.sentCount;
    state.visitSeconds = Math.min(300, state.visitSeconds + g.secs);
    $('visitTimer').textContent = fmt(state.visitSeconds);
    addPoints(g.pts);
    $('speechBubble').textContent = state.currentIdol.name + ': Cảm ơn em đã gửi ' + g.name + ' ' + g.emoji + '! Ngon lắm!';
    if (state.giftsSentToday >= 3) { state.missions.gift3 = true; save(); renderMissions(); }
    renderLeaderboard();
  }));
}
function idolReply(text) {
  const d = state.currentIdol; if (!d) return '…';
  const t = text.toLowerCase();
  for (const c of d.chat) if (c.keys.some(k => t.includes(k))) return c.reply;
  const generic = ['Câu này hay đó! Nhưng ở đây anh/chị chỉ trả lời được mấy chuyện đời thường thôi.','Em hỏi khó quá! Hỏi anh/chị về ăn, làm, tiền, nhớ nhà đi!','Ừ, anh/chị nghe rồi. Em thăm anh/chị thế này là quý lắm!'];
  return generic[Math.floor(Math.random()*generic.length)];
}
function sendChat() {
  const inp = $('chatInput'); const text = inp.value.trim(); if (!text || !state.currentIdol) return;
  $('chatLog').innerHTML += `<div class="chat-msg you"><b>Bạn:</b> ${text.replace(/</g,'&lt;')}</div>`;
  inp.value = ''; state.chatCount += 1;
  if (state.chatCount >= 3) { state.missions.chat3 = true; save(); renderMissions(); }
  $('chatLog').innerHTML += `<div class="chat-msg idol" id="typingMsg"><b>${state.currentIdol.name}:</b> <i>đang gõ…</i></div>`;
  $('chatLog').scrollTop = $('chatLog').scrollHeight;
  setTimeout(() => {
    const tm = $('typingMsg'); if (tm) tm.outerHTML = `<div class="chat-msg idol"><b>${state.currentIdol.name}:</b> ${idolReply(text)}</div>`;
    $('chatLog').scrollTop = $('chatLog').scrollHeight;
  }, 700);
}
function endVisit(reason) {
  clearInterval(state.timerId); stopGame();
  const d = state.currentIdol; if (!d) return;
  state.visited.add(d.id); state.missions.visit1 = true; save();
  updateHeader(); renderIdols(); renderMissions(); renderLeaderboard();
  drawCertificate(d);
  $('speechBubble').textContent = reason + ' ' + d.name + ': Cảm ơn em đã vào thăm! Hẹn em lần sau nhé!';
  toast('📜 ' + reason + ' Đã cấp giấy chứng nhận thăm nuôi cho ' + d.name + '!');
}

/* ---------- Certificate ---------- */
function drawCertificate(d) {
  const c = $('certCanvas'), ctx = c.getContext('2d');
  ctx.fillStyle = '#fff8e6'; ctx.fillRect(0,0,640,400);
  ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 6; ctx.strokeRect(10,10,620,380);
  ctx.fillStyle = '#7a1f1f'; ctx.font = 'bold 30px serif'; ctx.textAlign = 'center';
  ctx.fillText('GIẤY CHỨNG NHẬN THĂM NUÔI', 320, 70);
  ctx.fillStyle = '#333'; ctx.font = '20px sans-serif';
  ctx.fillText('Người thăm đã vào thăm idol parody:', 320, 120);
  ctx.font = 'bold 34px sans-serif'; ctx.fillStyle = '#1a0d33';
  ctx.fillText(d.name + ' ' + d.emoji, 320, 170);
  ctx.font = '19px sans-serif'; ctx.fillStyle = '#333';
  ctx.fillText('Điểm buổi thăm: ' + state.visitPoints + ' điểm  •  Đã thăm ' + state.visited.size + '/4 idol', 320, 215);
  ctx.fillText('Ngày: ' + new Date().toLocaleDateString('vi-VN'), 320, 250);
  ctx.font = 'italic 16px sans-serif'; ctx.fillStyle = '#666';
  ctx.fillText('(Parody giải trí hư cấu — không phải giấy tờ thật)', 320, 285);
  ctx.beginPath(); ctx.arc(520, 320, 42, 0, Math.PI*2); ctx.fillStyle = 'rgba(200,30,30,.85)'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ĐÃ THĂM', 520, 316); ctx.fillText('PARODY', 520, 334);
}

/* ---------- Mini-games ---------- */
function stopGame() { state.gameActive = false; clearInterval(state.gameTimerId); }
function startGame() {
  const d = state.currentIdol; if (!d) return;
  stopGame(); state.gameActive = true; state.gameScore = 0; $('gameScore').textContent = '0';
  $('gameResult').hidden = true; state.gamesPlayed += 1; state.missions.game1 = true; save(); renderMissions();
  if (d.id === 'kha') startRhythm();
  else if (d.id === 'huan') startQuiz();
  else if (d.id === 'truong') startCatch();
  else startLivestream();
}
function finishGame(msg) {
  stopGame(); addPoints(state.gameScore);
  const r = $('gameResult'); r.hidden = false; r.textContent = msg + ' Cộng ' + state.gameScore + ' điểm thăm nuôi!';
  renderLeaderboard();
}
function startRhythm() {
  let left = 20, canHit = false;
  $('gameArea').innerHTML = `<p>Bấm <b>MÚA!</b> đúng lúc vòng vàng sáng lên!</p><div class="rhythm-ring" id="ring">🪭</div><button class="btn primary" id="rhythmBtn">💃 MÚA!</button>`;
  $('gameTime').textContent = left + 's';
  const beat = setInterval(() => { if (!state.gameActive) { clearInterval(beat); return; } canHit = true; const ring = $('ring'); if (ring) ring.classList.add('hit'); setTimeout(() => { canHit = false; const r2 = $('ring'); if (r2) r2.classList.remove('hit'); }, 320); }, 900);
  $('rhythmBtn').addEventListener('click', () => {
    if (!state.gameActive) return;
    if (canHit) { state.gameScore += 10; $('speechBubble').textContent = 'Khá Bảnh: Đúng nhịp rồi! Múa đẹp quá!'; }
    else state.gameScore += 1;
    $('gameScore').textContent = state.gameScore;
  });
  state.gameTimerId = setInterval(() => { left -= 1; $('gameTime').textContent = left + 's'; if (left <= 0) { clearInterval(beat); finishGame('Hết giờ múa quạt! Bạn được ' + state.gameScore + ' điểm.'); } }, 1000);
}
const QUIZ = [
  { q:'Theo thầy Huấn, muốn có ăn thì phải làm gì?', opts:['Chỉ cần ngồi chờ','Làm thì mới có ăn','Đi vay là có','Ngủ là có'], a:1 },
  { q:'Câu nào đúng phong cách thầy Huấn nhất?', opts:['Không làm mà đòi có ăn','Làm ăn chân chính, đừng ham tiền nhanh','Tiền nhanh là tiền bền','Cứ liều là được'], a:1 },
  { q:'Thầy Huấn dặn giới trẻ điều gì?', opts:['Học theo thầy đoạn sai','Sống tốt, làm ăn chân chính','Chửi bới cho nổi tiếng','Không cần làm gì cả'], a:1 }
];
function startQuiz() {
  let qi = 0, left = 30;
  const showQ = () => {
    if (qi >= QUIZ.length) { finishGame('Hết 3 câu đạo lý! Bạn được ' + state.gameScore + ' điểm.'); return; }
    const q = QUIZ[qi];
    $('gameArea').innerHTML = `<p><b>Câu ${qi+1}/3:</b> ${q.q}</p>` + q.opts.map((o,i) => `<button class="quiz-opt" data-i="${i}">${o}</button>`).join('');
    document.querySelectorAll('.quiz-opt').forEach(b => b.addEventListener('click', () => {
      if (+b.dataset.i === q.a) { state.gameScore += 20; $('speechBubble').textContent = 'Huấn Hoa Hồng: Đúng rồi! Em hiểu đạo lý đấy!'; }
      else $('speechBubble').textContent = 'Huấn Hoa Hồng: Sai rồi em ơi, nghĩ lại đi!';
      $('gameScore').textContent = state.gameScore; qi += 1; showQ();
    }));
  };
  showQ(); $('gameTime').textContent = left + 's';
  state.gameTimerId = setInterval(() => { left -= 1; $('gameTime').textContent = left + 's'; if (left <= 0) finishGame('Hết giờ trắc nghiệm! Bạn được ' + state.gameScore + ' điểm.'); }, 1000);
}
function startCatch() {
  $('gameArea').innerHTML = `<canvas id="catchCanvas" width="420" height="220"></canvas><p>Dùng ← → hoặc kéo tay trên canvas để hứng đồ ăn!</p>`;
  const cv = $('catchCanvas'), ctx = cv.getContext('2d');
  let bx = 190, left = 20; const items = [];
  const foods = ['🍜','🥚','🌭','🥤','🍗'];
  const move = (x) => { const r = cv.getBoundingClientRect(); bx = Math.max(0, Math.min(360, (x - r.left) / r.width * 420 - 30)); };
  cv.addEventListener('pointermove', e => move(e.clientX));
  cv.addEventListener('pointerdown', e => move(e.clientX));
  const keyH = (e) => { if (e.key === 'ArrowLeft') bx = Math.max(0, bx - 24); if (e.key === 'ArrowRight') bx = Math.min(360, bx + 24); };
  document.addEventListener('keydown', keyH);
  const tick = setInterval(() => {
    if (!state.gameActive) { clearInterval(tick); document.removeEventListener('keydown', keyH); return; }
    if (Math.random() < 0.35) items.push({ x: Math.random()*380, y: 0, e: foods[Math.floor(Math.random()*foods.length)] });
    ctx.clearRect(0,0,420,220);
    ctx.font = '26px serif';
    items.forEach(it => { it.y += 4; ctx.fillText(it.e, it.x, it.y); });
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (it.y > 185 && it.x > bx - 10 && it.x < bx + 70) { state.gameScore += 10; $('gameScore').textContent = state.gameScore; items.splice(i,1); }
      else if (it.y > 220) items.splice(i,1);
    }
    ctx.font = '34px serif'; ctx.fillText('🧺', bx, 215);
  }, 50);
  $('gameTime').textContent = left + 's';
  state.gameTimerId = setInterval(() => { left -= 1; $('gameTime').textContent = left + 's'; if (left <= 0) { clearInterval(tick); document.removeEventListener('keydown', keyH); finishGame('Hết giờ hứng đồ ăn! Bạn được ' + state.gameScore + ' điểm.'); } }, 1000);
}
function startLivestream() {
  let left = 15, views = 0;
  $('gameArea').innerHTML = `<p>👀 <b id="liveViews">0</b> người đang xem <em>(minh họa)</em></p><button class="tap-big" id="liveTap">🔴 BẤM ĐỂ TĂNG VIEW</button><p class="fine">Né nút “BỊ REPORT” màu đỏ — bấm nhầm mất 200 view!</p>`;
  const spawnReport = () => {
    if (!state.gameActive) return;
    const old = document.querySelector('.report-btn'); if (old) old.remove();
    const b = document.createElement('button'); b.className = 'report-btn'; b.textContent = '⚠️ BỊ REPORT';
    b.style.left = (10 + Math.random()*70) + '%'; b.style.top = (10 + Math.random()*60) + '%';
    b.addEventListener('click', (e) => { e.stopPropagation(); views = Math.max(0, views - 200); $('liveViews').textContent = views.toLocaleString('vi-VN'); b.remove(); });
    $('gameArea').appendChild(b);
    setTimeout(() => b.remove(), 1100);
    setTimeout(spawnReport, 1800 + Math.random()*800);
  };
  setTimeout(spawnReport, 1200);
  $('liveTap').addEventListener('click', () => {
    if (!state.gameActive) return;
    views += 50 + Math.floor(Math.random()*100); state.gameScore = Math.floor(views / 50);
    $('liveViews').textContent = views.toLocaleString('vi-VN'); $('gameScore').textContent = state.gameScore;
  });
  $('gameTime').textContent = left + 's';
  state.gameTimerId = setInterval(() => { left -= 1; $('gameTime').textContent = left + 's'; if (left <= 0) finishGame('Livestream kết thúc! Bạn kéo được ' + views.toLocaleString('vi-VN') + ' view (minh họa).'); }, 1000);
}

/* ---------- Share / misc ---------- */
function initMisc() {
  $('backToLobbyBtn').addEventListener('click', () => { endVisit('Buổi thăm kết thúc.'); $('visitScreen').classList.remove('active'); $('lobbyScreen').classList.add('active'); window.scrollTo({top:0}); });
  $('endVisitBtn').addEventListener('click', () => endVisit('Buổi thăm kết thúc.'));
  $('idolAvatar').addEventListener('click', tapIdol);
  $('idolAvatar').addEventListener('keydown', e => { if (e.key === 'Enter') tapIdol(); });
  $('chatSendBtn').addEventListener('click', sendChat);
  $('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
  $('gameStartBtn').addEventListener('click', startGame);
  $('downloadCertBtn').addEventListener('click', () => {
    if (!state.currentIdol) { toast('Vào thăm 1 idol rồi kết thúc buổi thăm để có giấy chứng nhận nhé!'); return; }
    drawCertificate(state.currentIdol);
    const a = document.createElement('a'); a.download = 'giay-chung-nhan-tham-nuoi.png'; a.href = $('certCanvas').toDataURL('image/png'); a.click();
  });
  $('shareBtn').addEventListener('click', async () => {
    const text = `🎟️ THẺ THĂM NUÔI (Parody)\nTôi đã thăm ${state.visited.size}/4 idol • ${state.points} điểm • Streak ${state.streak} ngày\nVào Tù Thăm Idol — web parody giải trí hư cấu, không phải thăm thật.`;
    try { await navigator.clipboard.writeText(text); } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    $('shareFeedback').hidden = false; setTimeout(() => { $('shareFeedback').hidden = true; }, 2500);
  });
  $('copyLinkBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); } catch (e) {}
    $('shareFeedback').hidden = false; $('shareFeedback').textContent = 'Đã sao chép link web!'; setTimeout(() => { $('shareFeedback').hidden = true; $('shareFeedback').textContent = 'Đã sao chép!'; }, 2500);
  });
}
let lineIdx = 0;
function tapIdol() {
  const d = state.currentIdol; if (!d) return;
  const av = $('idolAvatar'); av.classList.remove('bounce'); void av.offsetWidth; av.classList.add('bounce');
  lineIdx = (lineIdx + 1) % d.lines.length;
  $('speechBubble').textContent = d.name + ': ' + d.lines[lineIdx];
  addPoints(1);
}

/* ---------- Init ---------- */
bumpStreak();
updateHeader(); renderIdols(); renderCells(); renderMissions(); renderLeaderboard();
initHall(); initMisc();
