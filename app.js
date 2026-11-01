/* Vào Tù Thăm Idol — GAME 3D v5: THĂM NUÔI 1999 (Vietnamese Retro Institutional RPG).
   - Màn hình "HỒ SƠ NGƯỜI THĂM": nhân vật 3D toàn thân thật đứng trong sảnh phía
     sau lớp phủ trong suốt; portrait danh sách render thật từ model GLB.
   - Tách UI khỏi 3D (v4): bindInput() chạy ngay khi DOMContentLoaded, boot3D() nền sau.
   - Three.js 0.160.0 bundle trong ./vendor/ (không phụ thuộc CDN).
   - Nhân vật là file GLB rigged có skeleton + clip animation thật (Quaternius CC0),
     Mixamo XBot/Soldier), KHÔNG còn nhân vật ghép hộp/sphere.
   - GLB tải bằng fetch + AbortController (timeout 12s) + loader.parse, tối đa 2 file
     đồng thời, theo giai đoạn P0 player → P1 idol → P2 còn lại + NPC nền.
   - Nếu WebGL/Three/model tải lỗi: KHÔNG chặn UI — hiện banner lỗi nhỏ ở đầu khung
     game (không che nút), vẫn chơi được ở bản chữ (chọn idol, thăm, chat, quà, game).
   Parody giải trí hư cấu. Mọi số liệu online/bảng vàng đều là mô phỏng, đã ghi rõ. */
const $ = (id) => document.getElementById(id);
const IS_TOUCH = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
const IS_MOBILE = IS_TOUCH || window.innerWidth <= 750;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerpAngle = (a, b, t) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};
const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));

const store = {
  get(k, d) { try { const v = localStorage.getItem('thamtu_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('thamtu_' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ================= DỮ LIỆU IDOL (đã kiểm chứng, giữ nguyên bản cũ) ================= */
const IDOLS = [
  { id: 'kha', name: 'Khá Bảnh', real: 'Ngô Bá Khá', emoji: '🕺', tag: 'Múa quạt huyền thoại',
    status: 'Đang chấp hành án 10 năm 6 tháng (2019) — tội đánh bạc / tổ chức đánh bạc.',
    desc: 'Idol múa quạt. Vào thăm là được xem múa quạt theo nhịp, nhớ đừng rủ đánh lô đề.',
    game: 'Múa quạt theo nhịp', gameDesc: 'Nhẫn vàng sáng lên thì bấm “MÚA!” đúng nhịp. Bấm đúng +10 điểm, bấm trượt +1.',
    color: 0xff8a3d, pants: 0x2b2b3d, hair: 0x111111, acc: 'fan', model: 'matt', height: 1.78,
    lines: ['Múa quạt nè! Quạt này quạt cho mát, không quạt cho ai nóng!', 'Con đi không sao đâu, rồi con sẽ về!', 'Ở đây anh em đều ngoan, chỉ thiếu mỗi quạt thôi!', 'Nhớ nhà thì múa một bài cho đỡ nhớ!'],
    chat: [
      { keys: ['làm', 'an', 'ăn'], reply: 'Chỉ có làm thì mới có ăn… à nhầm, câu đó của anh Huấn. Anh thì chỉ có múa thì mới có quạt!' },
      { keys: ['tiền'], reply: 'Tiền thì anh không rủ ai đánh bạc nữa đâu. Giờ anh chỉ đếm… nhịp múa thôi.' },
      { keys: ['ra tù', 'về'], reply: 'Anh hứa ra tù sẽ làm công dân tốt. Giờ thì múa tiếp cho qua ngày!' },
      { keys: ['nhớ nhà', 'nhớ mẹ'], reply: 'Anh cũng nhớ nhà lắm. Nhưng mà múa một bài là thấy đỡ nhớ hơn một tí.' },
      { keys: ['quạt', 'múa'], reply: 'Muốn xem múa quạt không? Bấm nút MÚA ở mini-game bên dưới kìa!' }
    ] },
  { id: 'huan', name: 'Huấn Hoa Hồng', real: 'Bùi Xuân Huấn', emoji: '🌹', tag: 'Thầy giảng đạo lý',
    status: 'Bị khởi tố + tạm giam tháng 8/2026 — ĐANG CHỜ XỬ LÝ, chưa có bản án tuyên.',
    desc: 'Thầy đạo lý. Vào thăm là được nghe giảng, nhưng nhớ: làm thì mới có ăn.',
    game: 'Trắc nghiệm đạo lý', gameDesc: 'Chọn câu đạo lý đúng phong cách thầy Huấn. Đúng +20 điểm, sai thì thầy lắc đầu.',
    color: 0xf5f5f5, pants: 0x1f2a44, hair: 0x222222, acc: 'rose', model: 'shaun', height: 1.8,
    lines: ['Chỉ có làm thì mới có ăn, không làm mà đòi có ăn thì… thôi, tự hiểu nhé!', 'Các em vào đây thăm thầy là thầy vui rồi!', 'Đạo lý thì nhiều, nhưng quan trọng là phải làm!', 'Thầy ở đây vẫn ổn, các em ở ngoài nhớ làm ăn chân chính nhé!'],
    chat: [
      { keys: ['làm', 'an', 'ăn'], reply: 'Chỉ có làm thì mới có ăn! Không làm mà đòi có ăn thì chỉ có ăn… đòn thôi!' },
      { keys: ['tiền'], reply: 'Tiền kiếm bằng mồ hôi mới bền. Tiền nhanh thì đi cũng nhanh lắm em ạ.' },
      { keys: ['ra tù', 'về'], reply: 'Thầy đang chờ xử lý, chưa có bản án. Các em cứ sống tốt đi, đừng học theo thầy đoạn này.' },
      { keys: ['nhớ nhà', 'nhớ'], reply: 'Nhớ nhà thì gọi về cho bố mẹ đi em. Đừng để tới lúc muốn gọi mà không được.' },
      { keys: ['hoa', 'hồng'], reply: 'Hoa hồng thì đẹp, nhưng gai thì đau. Làm ăn cũng vậy, đừng ham cái đẹp mà quên cái gai!' }
    ] },
  { id: 'truong', name: 'Trường Con', real: 'Trịnh Xuân Trường', emoji: '🍜', tag: 'Thánh ăn chực',
    status: 'Đang chấp hành án 20 năm tù (xử 2020) — tội mua bán trái phép chất ma túy.',
    desc: 'Thánh ăn chực. Vào thăm nhớ mang đồ ăn, idol này chỉ cần đồ ăn là vui.',
    game: 'Hứng đồ ăn rơi', gameDesc: 'Kéo rổ / bấm ← → để hứng đồ ăn rơi. Hứng được +10 điểm, để rơi thì tiếc lắm!',
    color: 0x8a6d3b, pants: 0x333333, hair: 0x111111, acc: 'bowl', model: 'soldierMale', height: 1.82, tint: 'Main',
    lines: ['Có đồ ăn không em? Cho anh xin một miếng!', 'Anh ở đây vẫn khỏe, chỉ thèm bát mì tôm thôi!', 'Ngày xưa anh hay đi ăn chực, giờ thì… vẫn thèm ăn!', 'Cảm ơn em đã vào thăm, nhớ mang theo xúc xích nhé!'],
    chat: [
      { keys: ['làm', 'an', 'ăn'], reply: 'Ăn thì anh rành lắm! Nhưng mà ăn chực hoài cũng không tốt, các em đừng học anh!' },
      { keys: ['tiền'], reply: 'Tiền thì anh không có, nhưng đồ ăn thì anh xin một miếng được không?' },
      { keys: ['ra tù', 'về'], reply: 'Án anh còn dài lắm. Các em ở ngoài nhớ sống tử tế, đừng dính vào ma túy nhé.' },
      { keys: ['nhớ nhà', 'nhớ'], reply: 'Anh nhớ Nam Định lắm. Nhớ cả những bữa cơm nhà nữa…' },
      { keys: ['mì', 'đồ ăn'], reply: 'Mì tôm là chân ái! Gửi cho anh một gói ở nút quà bên dưới kìa!' }
    ] },
  { id: 'khanh', name: 'Khánh Sky', real: 'Nguyễn Văn Hợi', emoji: '👑', tag: 'Thiên tử livestream',
    status: 'Bị bắt khẩn cấp + khởi tố tháng 8/2026 — ĐANG CHỜ XỬ LÝ, chưa có bản án tuyên.',
    desc: 'Thiên tử livestream. Vào thăm là được xem livestream trong tù, view tăng vù vù.',
    game: 'Livestream tăng view', gameDesc: 'Bấm liên tục để tăng view livestream trong 15 giây. Né nút “BỊ REPORT” — bấm nhầm là mất 200 view!',
    color: 0xffd34d, pants: 0x4a2d78, hair: 0x3a2a00, acc: 'crown', model: 'knight', height: 1.86,
    lines: ['Livestream của anh lúc nào cũng đông, giờ trong này cũng đông!', 'Các em bấm follow cho anh nhé, dù anh đang… nghỉ livestream dài hạn!', 'Anh xin lỗi mọi người, giờ anh chỉ muốn sống yên ổn thôi!', 'View tăng nhanh thế, các em bấm nhiệt tình quá!'],
    chat: [
      { keys: ['làm', 'an', 'ăn'], reply: 'Làm livestream thì phải có trách nhiệm với lời nói của mình, em ạ. Anh giờ mới hiểu.' },
      { keys: ['tiền'], reply: 'Tiền view thì nhanh, nhưng cái giá phải trả cũng không rẻ đâu em.' },
      { keys: ['ra tù', 'về'], reply: 'Anh đang chờ xử lý, chưa có bản án. Mong mọi người đừng chửi bới nhau nữa.' },
      { keys: ['nhớ nhà', 'nhớ'], reply: 'Anh nhớ nhà, nhớ mẹ lắm. Ở đây anh mới có thời gian nghĩ lại.' },
      { keys: ['live', 'view'], reply: 'Muốn tăng view không? Chơi mini-game livestream bên dưới đi, bấm càng nhanh view càng lên!' }
    ] }
];
const GIFTS = [
  { emoji: '🍜', name: 'Mì tôm', pts: 10, secs: 30, color: 0xffd34d },
  { emoji: '🥚', name: 'Trứng lộn', pts: 15, secs: 20, color: 0xf5f5f5 },
  { emoji: '🌭', name: 'Xúc xích', pts: 12, secs: 20, color: 0xd94f30 },
  { emoji: '🥤', name: 'Nước ngọt', pts: 8, secs: 15, color: 0x3fe0d0 }
];
const QUIZ = [
  { q: 'Theo thầy Huấn, muốn có ăn thì phải làm gì?', opts: ['Chỉ cần ngồi chờ', 'Làm thì mới có ăn', 'Đi vay là có', 'Ngủ là có'], a: 1 },
  { q: 'Câu nào đúng phong cách thầy Huấn nhất?', opts: ['Không làm mà đòi có ăn', 'Làm ăn chân chính, đừng ham tiền nhanh', 'Tiền nhanh là tiền bền', 'Cứ liều là được'], a: 1 },
  { q: 'Thầy Huấn dặn giới trẻ điều gì?', opts: ['Học theo thầy đoạn sai', 'Sống tốt, làm ăn chân chính', 'Chửi bới cho nổi tiếng', 'Không cần làm gì cả'], a: 1 }
];
/* Model GLB rigged (đã tải về repo, không tải runtime từ URL ngoài trừ file local) */
const MODEL_URLS = {
  sam: 'models/sam.glb', matt: 'models/matt.glb', shaun: 'models/shaun.glb',
  soldierMale: 'models/soldier-male.glb', knight: 'models/knight-golden-male.glb',
  lis: 'models/lis.glb', casualF: 'models/casual-female.glb', soldierF: 'models/soldier-female.glb'
};

/* Nhân vật chọn được (Hồ sơ người thăm) — chỉ số hiển thị ở màn hình chọn */
const CHAMPS = {
  sam: { name: 'Sam', role: 'Nhanh nhẹn', speed: 88, stamina: 68, skill: 74,
    desc: 'Sam chạy nhanh nhất sảnh — hợp với người thích đi thăm nhiều ô kính trong thời gian ngắn.' },
  matt: { name: 'Matt', role: 'Cân bằng', speed: 76, stamina: 80, skill: 75,
    desc: 'Matt cân bằng mọi chỉ số — lựa chọn an toàn cho người mới chơi lần đầu.' },
  shaun: { name: 'Shaun', role: 'Bền bỉ', speed: 64, stamina: 95, skill: 70,
    desc: 'Shaun bền bỉ nhất — đi dạo cả buổi không mệt, hợp với người thích ngắm sảnh.' }
};
function updateChampPreview(key) {
  const c = CHAMPS[key] || CHAMPS.sam;
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('champPreviewName', c.name.toUpperCase());
  set('champPreviewTag', c.role + ' • ' + (key === 'sam' ? 'Chạy nhanh nhất sảnh' : key === 'matt' ? 'Cân bằng mọi chỉ số' : 'Bền bỉ nhất sảnh'));
  set('champDesc', c.desc);
  set('champFileNo', 'HS-1999-' + key.toUpperCase());
  set('champPreviewMono', c.name.charAt(0));
  const av = $('playerAvatar');
  if (av) av.textContent = c.name.charAt(0);
  const bar = (id, valId, v) => { const b = $(id); if (b) b.style.width = v + '%'; set(valId, v); };
  bar('statSpeed', 'statSpeedVal', c.speed);
  bar('statStamina', 'statStaminaVal', c.stamina);
  bar('statSkill', 'statSkillVal', c.skill);
  // Nhân vật 3D toàn thân đã hiện trong sảnh phía sau (preview camera) → ẩn
  // khung chờ khi rig người chơi đã tải xong.
  const fb = $('champPreviewFallback');
  if (fb) fb.style.display = (playerRig && state.threeReady) ? 'none' : '';
}

/* ================= PORTRAIT 3D THẬT (v5) =================
   Portrait danh sách nhân vật + thẻ idol được render THẬT từ model GLB bằng
   một renderer phụ (canvas 160x200, offscreen), không dùng emoji làm ảnh đại
   diện chính. Chụp 1 lần/model rồi cache dataURL; lỗi thì giữ chữ cái monogram. */
const portraitCache = {};
let portraitRenderer = null;
function snapshotPortrait(key, height) {
  if (portraitCache[key]) return portraitCache[key];
  const gltf = modelCache[key];
  if (!gltf || !THREE || !cloneSkinned) return null;
  try {
    if (!portraitRenderer) {
      const pc = document.createElement('canvas');
      pc.width = 160; pc.height = 200;
      portraitRenderer = new THREE.WebGLRenderer({ canvas: pc, antialias: true, alpha: true, preserveDrawingBuffer: true });
      portraitRenderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xfff2d0, 0x233b37, 1.4));
    const dl = new THREE.DirectionalLight(0xffe9a8, 1.8);
    dl.position.set(2, 4, 3); sc.add(dl);
    const grp = new THREE.Group();
    const clone = cloneSkinned(gltf.scene);
    grp.add(clone);
    const box = new THREE.Box3().setFromObject(grp);
    const size = new THREE.Vector3(); box.getSize(size);
    const ctr = new THREE.Vector3(); box.getCenter(ctr);
    const s = (height || 1.78) / Math.max(size.y, 0.01);
    grp.scale.setScalar(s);
    clone.position.set(-ctr.x, -box.min.y, -ctr.z);
    sc.add(grp);
    // Dáng đứng tự nhiên: phát clip Idle một lúc rồi mới chụp.
    try {
      const mixer = new THREE.AnimationMixer(grp);
      const idle = (gltf.animations || []).find((a) => /idle/i.test(a.name));
      if (idle) { mixer.clipAction(idle, grp).play(); mixer.update(0.6); }
    } catch (e) { /* dáng mặc định vẫn dùng được */ }
    const cam2 = new THREE.PerspectiveCamera(38, 160 / 200, 0.1, 20);
    cam2.position.set(0, 1.15, 3.4);
    cam2.lookAt(0, 0.95, 0);
    portraitRenderer.render(sc, cam2);
    const url = portraitRenderer.domElement.toDataURL('image/png');
    portraitCache[key] = url;
    return url;
  } catch (e) {
    console.warn('[thamtu] chụp portrait lỗi:', key, e);
    return null;
  }
}
function applyPortraits() {
  document.querySelectorAll('img[data-portrait]').forEach((img) => {
    const key = img.dataset.portrait;
    const url = snapshotPortrait(key, 1.78);
    if (url) { img.src = url; img.hidden = false; }
  });
}
/* Vé thăm: điền ngày/giờ hiện tại vào vé + bảng gọi số */
function updateTicketTimes() {
  const d = new Date();
  const dateTxt = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  const timeTxt = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('ticketDate', dateTxt); set('ticketTime', timeTxt);
  set('ticketStubDate', dateTxt); set('ticketStubTime', timeTxt);
  set('hudClock', timeTxt);
}

/* Gợi ý theo ngữ cảnh: mỗi lúc chỉ 1 gợi ý, tự biến mất sau ~3.5s */
let hintTimer = null;
function showHint(text, ms) {
  const el = $('hintBar');
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => { el.hidden = true; }, ms || 3500);
}
/* Menu phụ (overlay): nhiệm vụ / bảng vàng / túi đồ / số chờ / chia sẻ */
function openMenu(sectionId) {
  const ov = $('menuOverlay');
  if (!ov) return;
  ov.hidden = false;
  if (sectionId) {
    const sec = ov.querySelector('[data-menu-section="' + sectionId + '"]');
    const panel = ov.querySelector('.menu-panel');
    if (sec && panel) panel.scrollTop = sec.offsetTop - 10;
  }
}
function closeMenu() { const ov = $('menuOverlay'); if (ov) ov.hidden = true; }
function toggleMenu() { const ov = $('menuOverlay'); if (ov) ov.hidden ? openMenu() : closeMenu(); }

/* Quick Select Idol: 1 chạm → nhân vật tự chạy tới ô kính → hiện nút VÀO THĂM */
function selectIdolQuick(idolId) {
  const d = IDOLS.find((x) => x.id === idolId);
  if (!d) return;
  if (!state.started) enterGame();
  if (state.no3d || !player) { openVisit(idolId, 'card'); return; }
  const b = booths.find((x) => x.idolId === idolId);
  if (!b) { toast('⏳ Sảnh 3D chưa sẵn sàng — thử lại sau vài giây nhé!'); return; }
  state.targetBooth = idolId;
  state.autoWalkTo = { x: b.x, z: b.frontZ };
  showHint('🏃 Đang chạy tới ô ' + d.name + '… tới nơi sẽ hiện nút VÀO THĂM.');
}
function renderQuickIdolBar() {
  const bar = $('quickIdolBar');
  if (!bar) return;
  bar.innerHTML = '';
  IDOLS.forEach((d) => {
    const b = document.createElement('button');
    b.className = 'quick-idol-chip' + (state.visited.has(d.id) ? ' visited' : '');
    b.type = 'button';
    b.textContent = d.emoji + ' ' + d.name;
    b.addEventListener('click', () => selectIdolQuick(d.id));
    bar.appendChild(b);
  });
}
const state = {
  points: store.get('points', 0),
  visited: new Set(store.get('visited', [])),
  streak: store.get('streak', 0),
  lastVisitDay: store.get('lastVisitDay', ''),
  missions: store.get('missions', {}),
  chatCount: 0, giftsSentToday: 0, gamesPlayed: 0,
  currentIdol: null, visitSeconds: 180, visitPoints: 0, sentCount: 0,
  timerId: null, gameTimerId: null, gameActive: false, gameScore: 0,
  ticket: null, queueNum: 14, started: false, visitMode: false,
  autoWalkTo: null, targetBooth: null, no3d: false, threeReady: false
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
  const lv = $('playerLevel');
  if (lv) lv.textContent = 'Cấp ' + (Math.floor(state.points / 100) + 1);
  const ms = $('menuStreak');
  if (ms) ms.textContent = state.streak;
  const mv = $('menuVisited');
  if (mv) mv.textContent = state.visited.size + '/4';
  // Bảng gọi số (HUD góc phải trên) — số liệu minh họa, cố định theo vé A-014.
  const hc = $('hudCalling'); if (hc) hc.textContent = 'A-014';
  const hn = $('hudNext'); if (hn) hn.textContent = 'A-015';
  const hcl = $('hudCells'); if (hcl) hcl.textContent = '15/24';
  updateHudBars();
}
let toastTimer = null;
function toast(msg) {
  const t = $('gameToast'); if (!t) return; t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3000);
}
function showSpeech3d(text, ms) {
  const el = $('speech3d'); if (!el) return; el.textContent = text; el.hidden = false;
  clearTimeout(el._h); el._h = setTimeout(() => { el.hidden = true; }, ms || 3500);
}
function addPoints(n) { state.points += n; state.visitPoints += n; updateHeader(); const vp = $('visitPoints'); if (vp) vp.textContent = state.visitPoints; save(); }

/* ================= BOOT LOG + LỖI 3D (v3.1) =================
   Mọi bước khởi động 3D đều ghi vào #bootLog (DOM, có timestamp) và
   window.__thamtuBootLog / __thamtuBootStage — để lần test sau đọc được
   chính xác boot kẹt ở bước nào, thay vì chỉ thấy màn hình đen.
   Banner lỗi tĩnh trong index.html chỉ là chữ trung tính "Đang tải 3D…",
   KHÔNG bao giờ tự kết luận "trình duyệt chưa bật WebGL" khi chưa xác định
   được nguyên nhân thật. */
const BOOT_T0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
function bootLog(stage, detail) {
  const t = (((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - BOOT_T0) / 1000;
  const line = '[' + t.toFixed(1) + 's] ' + stage + (detail ? ' — ' + detail : '');
  window.__thamtuBootStage = stage;
  if (!Array.isArray(window.__thamtuBootLog)) window.__thamtuBootLog = [];
  window.__thamtuBootLog.push(line);
  try { console.log('[thamtu boot]', line); } catch (e) {}
  const el = $('bootLog');
  if (el) el.textContent = '⏳ ' + line;
  return line;
}
function show3dErrorBanner(stage, message) {
  const el = $('webglError');
  if (!el) return;
  const reason = stage === 'webgl'
    ? 'Trình duyệt/thiết bị này chưa bật WebGL nên không vẽ được cảnh 3D.'
    : stage === 'model-load'
      ? 'Không tải được file nhân vật 3D trong repo (' + message + ').'
      : stage === 'js-error'
        ? 'Game gặp lỗi JavaScript khi khởi động (' + message + ').'
        : 'Không tải được thư viện Three.js trong repo (' + message + ').';
  const b = el.querySelector('b');
  if (b) b.textContent = '⚠️ 3D tạm thời không mở được — vẫn chơi được bản chữ bên dưới.';
  const s = el.querySelector('span');
  if (s) s.textContent = reason + ' Bạn vẫn vào thăm idol, chat, tặng quà, chơi mini-game bình thường. Bấm “Thử lại 3D” để tải lại trang.';
  el.hidden = false;
}
// Lỗi JS top-level / promise chưa bắt: ghi lại stage thật để lần test sau đọc được.
// (Bỏ qua lỗi tải tài nguyên — chúng không có e.message, chỉ lỗi JS mới có.)
window.addEventListener('error', (e) => {
  if (window.__thamtu3DError) return;
  if (e && !e.message && e.target && e.target !== window) return;
  const msg = (e && e.message) ? e.message : 'unknown error';
  window.__thamtu3DError = { stage: 'js-error', message: String(msg) };
  bootLog('js-error', msg);
  if (window.__thamtuStarted !== true) show3dErrorBanner('js-error', msg);
});
window.addEventListener('unhandledrejection', (e) => {
  if (window.__thamtu3DError) return;
  const msg = (e && e.reason && e.reason.message) ? e.reason.message : String((e && e.reason) || 'unhandled rejection');
  window.__thamtu3DError = { stage: 'js-error', message: msg };
  bootLog('js-error', msg);
});

/* Banner lỗi nhỏ ở đầu khung game, KHÔNG che nút, vẫn chơi bản chữ */
function enterNo3D(stage, message) {
  state.no3d = true;
  window.__thamtuStarted = true; // logic phi-3D vẫn chạy -> không hiện lỗi toàn màn hình nữa
  window.__thamtu3DError = { stage, message: String(message || '') };
  bootLog('no3d:' + stage, String(message || ''));
  console.error('[thamtu 3D]', stage, message);
  show3dErrorBanner(stage, message);
  const gc = $('gameContainer');
  // Chỉ ẩn canvas khi KHÔNG có renderer (webgl/three-load lỗi). Nếu chỉ lỗi
  // tải model thì giữ canvas để sảnh 3D vẫn hiện (camera quay chậm quanh sảnh).
  if (gc && stage !== 'model-load') gc.classList.add('no3d');
  toast('⚠️ 3D không mở được — vẫn chơi bản chữ: chọn idol ở dưới để vào thăm.');
}

/* ================= THREE.JS — KHỞI ĐỘNG CÓ KIỂM TRA ================= */
let THREE = null, GLTFLoaderClass = null, cloneSkinned = null;
let renderer, scene, camera, clock, loader;
const HALL = { x: 13, z: 9 };
let player, playerRig;
const npcs = [];
const idolRigs = {};
const booths = [];
const obstacles = [];
const flyItems = [];
const allRigs = [];
let raycaster = null, pointerNDC = null;
const keys = {};
const cam = { yaw: 0, pitch: 0.32, dist: 7.5 };
const joy = { active: false, x: 0, y: 0, id: null };
let fpsFrames = 0, fpsTime = 0;
let jumpV = 0, playerJumpY = 0;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

/* ================= THREE.JS — KHỞI ĐỘNG NỀN (v4: UI đã gắn listener từ trước,
   boot 3D chỉ lo vẽ cảnh; lỗi 3D không bao giờ chặn nút bấm) ================= */
const bootState = { ui: 'pending', three: 'pending', hall: 'pending', player: 'pending', idol: 'pending' };
async function boot3D() {
  if (document.readyState === 'loading') {
    await new Promise((r) => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }
  // Hiển thị NGAY số liệu đã lưu (điểm / đã thăm / nhiệm vụ) từ localStorage,
  // trước khi 3D khởi động — để top bar không hiện số 0 tĩnh trong HTML rồi
  // mới nhảy số sau khi bấm BẮT ĐẦU (gây hiểu lầm là bấm Bắt đầu đã tính thăm).
  bootLog('boot3d', 'Đang khởi động 3D nền…');
  updateHeader(); renderIdols(); renderMissions(); renderLeaderboard();
  // 1) Kiểm tra WebGL TRƯỚC khi tạo renderer — phân biệt rõ nguyên nhân lỗi
  bootLog('webgl-check', 'Đang kiểm tra WebGL…');
  if (!webglAvailable()) {
    enterNo3D('webgl', 'getContext(webgl2/webgl) trả về null');
    return;
  }
  // 2) Tải Three.js LOCAL trong repo (./vendor/), không phụ thuộc CDN — có timeout
  // (dynamic import không hủy được, nhưng race timeout giúp boot không đứng
  // chờ mãi khi mạng chậm; module về muộn cũng không dùng nữa).
  bootLog('three-load', 'Đang tải Three.js trong repo (vendor/)…');
  try {
    const withTimeout = (p, ms, label) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout sau ' + (ms / 1000) + 's khi tải ' + label)), ms))]);
    const threeMod = await withTimeout(import('./vendor/three.module.js'), 20000, 'three.module.js');
    THREE = threeMod;
    const loaderMod = await withTimeout(import('./vendor/addons/loaders/GLTFLoader.js'), 20000, 'GLTFLoader.js');
    GLTFLoaderClass = loaderMod.GLTFLoader;
    const skelMod = await withTimeout(import('./vendor/addons/utils/SkeletonUtils.js'), 20000, 'SkeletonUtils.js');
    cloneSkinned = skelMod.clone;
    loader = new GLTFLoaderClass();
  } catch (err) {
    enterNo3D('three-load', err && err.message ? err.message : String(err));
    return;
  }
  bootLog('scene', 'Đang vẽ sảnh 3D…');
  try {
    initThree();
  } catch (err) {
    enterNo3D('webgl', err && err.message ? err.message : String(err));
    return;
  }
  bootState.three = 'ok'; bootState.hall = 'ok';
  state.threeReady = true;
  window.__thamtuStarted = true;
  bumpStreak();
  updateHeader(); renderIdols(); renderMissions(); renderLeaderboard();
  bootLog('scene-ready', 'Sảnh đã vẽ xong — đang tải nhân vật…');
  // 3) CHẠY VÒNG LẶP RENDER NGAY — sảnh hiện lên tức thì, không chờ nhân vật.
  tick();
  // 4) Tải nhân vật ƯU TIÊN (người chơi + 4 idol) — fetch + AbortController 12s/file,
  // tối đa 2 file/lượt; file nào lỗi thì dùng model khác thay thế, không đứng chờ cả lô.
  let ok = false;
  try {
    ok = await loadPriorityModels();
  } catch (err) {
    console.error('[thamtu] loadPriorityModels lỗi:', err);
    ok = false;
  }
  if (!ok) {
    enterNo3D('model-load', 'không tải được nhân vật 3D nào trong models/');
    // vẫn giữ scene sảnh (đã vẽ, camera quay chậm) + logic bản chữ; chỉ không có nhân vật
  } else {
    bootLog('ready', '✅ 3D sẵn sàng — WASD di chuyển, tới gần ô kính bấm E để vào thăm.');
    bootState.player = 'ok'; bootState.idol = 'ok';
    setTimeout(() => { const bl = $('bootLog'); if (bl) bl.style.display = 'none'; }, 4000);
    // v5: chụp portrait 3D thật cho danh sách nhân vật + thẻ idol (chạy nền,
    // không chặn game — ảnh nào xong thì hiện ảnh đó, chưa xong thì giữ monogram).
    setTimeout(() => { try { applyPortraits(); } catch (e) { console.warn('[thamtu] applyPortraits lỗi:', e); } }, 600);
  }
  // 5) Tải LAZY phần còn lại (người ngồi chờ ở ô kính + 6 NPC) — chạy nền,
  // rig tạo rải ra từng frame để không nghẽn main thread.
  loadLazyModels().catch((err) => console.warn('[thamtu] loadLazyModels lỗi:', err));
}

/* ================= RIG NHÂN VẬT GLB — AnimationMixer + crossfade thật ================= */
const modelCache = {};
const normCache = {};
const pendingLoads = {};
const MODEL_TIMEOUT_MS = 12000; // v4: AbortController 12s hủy request thật (Promise.race không hủy được)
const LOAD_CONCURRENCY = 2;
async function fetchGLB(key) {
  // Tải GLB bằng fetch + AbortController rồi loader.parse — phân biệt được lỗi
  // HTTP (404/500) với lỗi parse, và hủy thật request khi quá 12s.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), MODEL_TIMEOUT_MS);
  try {
    const res = await fetch(MODEL_URLS[key], { signal: ctrl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' khi tải ' + MODEL_URLS[key]);
    const buf = await res.arrayBuffer();
    try {
      return await loader.parseAsync(buf, '');
    } catch (e) {
      throw new Error('Lỗi parse GLB ' + MODEL_URLS[key] + ': ' + (e && e.message ? e.message : e));
    }
  } catch (e) {
    if (e && e.name === 'AbortError') throw new Error('Timeout sau ' + (MODEL_TIMEOUT_MS / 1000) + 's: ' + MODEL_URLS[key]);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
function loadModel(key) {
  // Dùng chung 1 promise cho mỗi file: file về muộn vẫn được cache để dùng sau.
  if (modelCache[key]) return Promise.resolve(modelCache[key]);
  if (!pendingLoads[key]) {
    pendingLoads[key] = fetchGLB(key).then((gltf) => {
      modelCache[key] = gltf;
      return gltf;
    });
    pendingLoads[key].catch(() => { delete pendingLoads[key]; }); // cho phép thử lại
  }
  return pendingLoads[key];
}
/* Tải tối đa 2 file cùng lúc, theo từng đợt — không dội 5 request một lúc. */
async function loadKeysLimited(keys, onOne) {
  const failed = [];
  for (let i = 0; i < keys.length; i += LOAD_CONCURRENCY) {
    const batch = keys.slice(i, i + LOAD_CONCURRENCY);
    const results = await Promise.allSettled(batch.map((k) => loadModel(k)));
    results.forEach((r, j) => {
      if (r.status === 'fulfilled') { if (onOne) onOne(batch[j]); }
      else failed.push(batch[j] + ': ' + (r.reason && r.reason.message ? r.reason.message : r.reason));
    });
  }
  return failed;
}
function findBone(group, names) {
  let found = null;
  group.traverse((o) => { if (!found && names.includes(o.name)) found = o; });
  return found;
}
function pickClip(rig, pats) {
  const names = Object.keys(rig.clips);
  for (const p of pats) {
    const k = names.find((n) => p.test(n));
    if (k) return rig.clips[k];
  }
  return null;
}
/* clip đích cho từng trạng thái (thử theo thứ tự ưu tiên) */
const CLIP_PATS = {
  idle: [/^Idle$/i, /idle/i],
  walk: [/^Walk$/i, /walk(?!_)/i, /walk/i],
  run: [/^Run$/i, /run(?!_)/i, /run/i],
  wave: [/wave/i, /^Yes$/i, /yes/i],
  sit: [/sitdown/i, /^Duck$/i, /duck/i, /sit/i],
  fan: [/dance/i, /victory/i, /wave/i, /punch/i],
  bow: [/^Yes$/i, /yes/i, /wave/i],
  jump: [/jump/i],
  dance: [/dance/i, /victory/i, /wave/i]
};
function makeRigFromGLTF(key, gltf, opts) {
  const o = Object.assign({ height: 1.78, name: key }, opts || {});
  const group = new THREE.Group();
  const inner = cloneSkinned(gltf.scene);
  group.add(inner);
  // Chuẩn hoá: đo Box3 ở tư thế tải về, scale để cao đúng target, chân chạm đất (y=0)
  let norm = normCache[key];
  if (!norm) {
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    norm = { scale: o.height / Math.max(size.y, 0.01), minY: box.min.y, cx: center.x, cz: center.z };
    normCache[key] = norm;
  }
  group.scale.setScalar(norm.scale);
  inner.position.set(-norm.cx, -norm.minY, -norm.cz);
  // Chỉ player + idol chính đổ bóng (v4) — NPC/người ngồi chờ tắt castShadow để nhẹ máy.
  group.traverse((m) => { if (m.isMesh) { m.castShadow = !!o.shadow; m.receiveShadow = false; } });
  const mixer = new THREE.AnimationMixer(group);
  const clips = {};
  (gltf.animations || []).forEach((a) => { clips[a.name] = a; });
  const rig = { group, inner, mixer, clips, anim: null, action: null, oneShotTimer: null,
    speed: 0, targetYaw: 0, height: o.height, key, role: o.role || 'npc' };
  group.userData.rig = rig;
  allRigs.push(rig);
  return rig;
}
function setAnim(rig, name, opts) {
  if (!rig || !rig.mixer) return false;
  const o = Object.assign({ fade: 0.25, once: false }, opts || {});
  if (rig.anim === name && rig.action && rig.action.isRunning()) return true;
  const clip = pickClip(rig, CLIP_PATS[name] || [new RegExp('^' + name + '$', 'i')]);
  if (!clip) { console.warn('[thamtu] rig', rig.key, 'không có clip cho', name, '— có:', Object.keys(rig.clips)); return false; }
  if (rig.oneShotTimer) { clearTimeout(rig.oneShotTimer); rig.oneShotTimer = null; }
  const next = rig.mixer.clipAction(clip, rig.group);
  const isSit = name === 'sit';
  next.setLoop(o.once || isSit ? THREE.LoopOnce : THREE.LoopRepeat, o.once || isSit ? 1 : Infinity);
  next.clampWhenFinished = !!(o.once || isSit);
  next.reset();
  if (rig.action && rig.action !== next) rig.action.fadeOut(o.fade);
  next.fadeIn(o.fade).play();
  rig.action = next; rig.anim = name;
  if (o.once) {
    const durMs = Math.max(600, clip.duration * 1000);
    rig.oneShotTimer = setTimeout(() => {
      if (rig.anim === name) setAnim(rig, 'idle', { fade: 0.3 });
    }, durMs);
  }
  return true;
}
function tintMaterial(rig, matName, hex) {
  // Chỉ tô màu vật liệu KHÔNG có texture (Main/Shirt của Quaternius).
  // Model dùng texture atlas (Sam/Matt/Shaun/Lis) KHÔNG tô — tô sẽ làm da cũng cam theo.
  rig.group.traverse((m) => {
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    mats.forEach((mt) => {
      if (mt && mt.name === matName && !mt.map) { mt.color.setHex(hex); mt.needsUpdate = true; }
    });
  });
}
function attachAccessory(rig, kind) {
  const head = findBone(rig.group, ['Head']);
  const armR = findBone(rig.group, ['LowerArmR', 'FistR']);
  const armL = findBone(rig.group, ['LowerArmL', 'FistL']);
  const torso = findBone(rig.group, ['Torso', 'Spine', 'Spine1']);
  const gold = new THREE.MeshStandardMaterial({ color: 0xffd34d, metalness: 0.6, roughness: 0.3 });
  if (kind === 'crown' && head) {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.14, 8), gold);
    crown.position.y = 0.16; head.add(crown);
  } else if (kind === 'fan' && armR) {
    const fan = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.02), new THREE.MeshStandardMaterial({ color: 0xffd34d, roughness: 0.6 }));
    blade.position.set(0, -0.32, 0.04);
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), new THREE.MeshStandardMaterial({ color: 0x7a4a1f }));
    stick.position.set(0, -0.44, 0.04);
    fan.add(blade, stick); armR.add(fan);
  } else if (kind === 'rose' && torso) {
    const rose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshStandardMaterial({ color: 0xe6396b, roughness: 0.5 }));
    rose.position.set(-0.14, 0.18, 0.2); torso.add(rose);
  } else if (kind === 'bowl' && armL) {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4 }));
    bowl.position.set(0, -0.3, 0.06); armL.add(bowl);
  } else if (kind === 'cap' && head) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.07, 16), new THREE.MeshStandardMaterial({ color: 0x2f6fd0, roughness: 0.7 }));
    cap.position.y = 0.15; head.add(cap);
  }
}
function addNameTag(rig, text, y) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(22,33,31,0.92)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(6, 18, 500, 92, 12); else ctx.rect(6, 18, 500, 92);
  ctx.fill();
  ctx.strokeStyle = '#C69A50'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#E8D9B7'; ctx.font = 'bold 46px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 66);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(2.2, 0.55, 1);
  sp.position.y = y || (rig.height + 0.45);
  rig.group.add(sp);
  return sp;
}

function mat(color, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.05 }, opts || {}));
}
function textSprite(text, scale) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(22,33,31,0.92)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(6, 18, 500, 92, 12); else ctx.rect(6, 18, 500, 92);
  ctx.fill();
  ctx.strokeStyle = '#C69A50'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#E8D9B7'; ctx.font = 'bold 46px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 66);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(2.6 * (scale || 1), 0.65 * (scale || 1), 1);
  return sp;
}

function buildHall() {
  // Sàn: 1 mặt phẳng duy nhất với texture kẻ ô (canvas texture) — v4 dùng ~70
  // mesh gạch riêng lẻ = ~70 draw call, là 1 trong các nguyên nhân FPS chỉ ~20.
  const tileCv = document.createElement('canvas'); tileCv.width = 256; tileCv.height = 256;
  const tctx = tileCv.getContext('2d');
  tctx.fillStyle = '#2E4038'; tctx.fillRect(0, 0, 256, 256);
  tctx.fillStyle = '#26362D';
  tctx.fillRect(0, 0, 128, 128); tctx.fillRect(128, 128, 128, 128);
  tctx.strokeStyle = '#1F2E29'; tctx.lineWidth = 4;
  tctx.strokeRect(0, 0, 128, 128); tctx.strokeRect(128, 0, 128, 128);
  tctx.strokeRect(0, 128, 128, 128); tctx.strokeRect(128, 128, 128, 128);
  const tileTex = new THREE.CanvasTexture(tileCv);
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  tileTex.repeat.set(8, 6);
  tileTex.colorSpace = THREE.SRGBColorSpace;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL.x * 2 + 6, HALL.z * 2 + 6),
    new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wallM = mat(0x3D5047);
  const mkWall = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallM); m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m; };
  mkWall(HALL.x * 2 + 6, 4.5, 0.4, 0, 2.25, -HALL.z - 3);
  mkWall(HALL.x * 2 + 6, 4.5, 0.4, 0, 2.25, HALL.z + 3);
  mkWall(0.4, 4.5, HALL.z * 2 + 6, -HALL.x - 3, 2.25, 0);
  mkWall(0.4, 4.5, HALL.z * 2 + 6, HALL.x + 3, 2.25, 0);
  const sign = textSprite('SẢNH THĂM NUÔI • 1999', 1.4); sign.position.set(0, 4.1, -HALL.z - 2.7); scene.add(sign);
  for (const [x, z] of [[-8, -4], [8, -4], [-8, 4], [8, 4]]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 4.2, 10), mat(0x594538));
    col.position.set(x, 2.1, z); col.castShadow = true; scene.add(col);
    obstacles.push({ x, z, r: 0.7 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffc93f, emissiveIntensity: 1.4 }));
    lamp.position.set(x, 3.9, z); scene.add(lamp);
  }
  const boothDefs = [];
  IDOLS.forEach((d, i) => boothDefs.push({ x: -10.5 + i * 7, z: -HALL.z - 1.2, idol: d }));
  for (let i = 0; i < 4; i++) boothDefs.push({ x: -13.5 + i * 9, z: -HALL.z - 1.2, idol: null });
  for (let i = 0; i < 8; i++) boothDefs.push({ x: -13.5 + i * 3.9, z: HALL.z + 1.2, idol: null });
  for (let i = 0; i < 4; i++) boothDefs.push({ x: -HALL.x - 1.2, z: -6 + i * 4, idol: null, rotY: Math.PI / 2 });
  for (let i = 0; i < 4; i++) boothDefs.push({ x: HALL.x + 1.2, z: -6 + i * 4, idol: null, rotY: Math.PI / 2 });
  boothDefs.forEach((b, idx) => {
    const grp = new THREE.Group();
    grp.position.set(b.x, 0, b.z);
    if (b.rotY) grp.rotation.y = b.rotY;
    // v5 P0 — KHUNG Ô KÍNH: v4 dùng 1 tấm hộp ĐẶC (3.2x2.6) làm khung nên idol
    // đứng sau kính bị tấm khung che kín, chỉ thấy đầu/bóng tối. Giờ khung chỉ
    // còn 4 thanh viền gỗ + mặt kính trong suốt → idol nhìn thấy rõ qua kính.
    const woodM = mat(0x594538);
    const barT = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.28, 0.18), woodM);
    barT.position.y = 2.55; barT.castShadow = true; grp.add(barT);
    const barB = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.28, 0.18), woodM);
    barB.position.y = 0.14; barB.castShadow = true; grp.add(barB);
    const barL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.6, 0.18), woodM);
    barL.position.set(-1.46, 1.35, 0); barL.castShadow = true; grp.add(barL);
    const barR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.6, 0.18), woodM);
    barR.position.set(1.46, 1.35, 0); barR.castShadow = true; grp.add(barR);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.75, 2.1),
      new THREE.MeshPhysicalMaterial({ color: 0x9fd8e8, transparent: true, opacity: 0.18, roughness: 0.08, metalness: 0 }));
    glass.position.set(0, 1.45, 0.12); grp.add(glass);
    // Loa liên lạc trên khung phải + đèn huỳnh quang trong buồng (emissive,
    // không tốn thêm đèn thật — giữ FPS): idol không còn đứng trong bóng tối.
    const speaker = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.44, 0.12), mat(0x2A2A2A));
    speaker.position.set(1.28, 2.0, 0.16); grp.add(speaker);
    const spkDot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshStandardMaterial({ color: 0x7A9A5B, emissive: 0x7A9A5B, emissiveIntensity: 1.2 }));
    spkDot.position.set(1.28, 2.0, 0.24); grp.add(spkDot);
    if (b.idol) {
      const tube = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.09, 0.09),
        new THREE.MeshStandardMaterial({ color: 0xFFF6DC, emissive: 0xFFE9A8, emissiveIntensity: 1.8 }));
      tube.position.set(0, 2.42, -0.4); grp.add(tube);
    }
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 0.7), mat(0x6b4a2f));
    table.position.set(0, 0.85, 0.35); table.castShadow = true; grp.add(table);
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), mat(0x33544C));
    chair.position.set(0, 0.25, 0.9); grp.add(chair);
    const num = textSprite(b.idol ? b.idol.name : ('Ô ' + String(idx + 1).padStart(2, '0')), b.idol ? 1 : 0.8);
    num.position.set(0, 3.05, 0.2); grp.add(num);
    scene.add(grp);
    booths.push({ x: b.x, z: b.z, idolId: b.idol ? b.idol.id : null, boothNo: idx + 1, frontX: b.x, frontZ: b.rotY ? b.z : (b.z > 0 ? HALL.z - 0.6 : -HALL.z + 1.6), rotY: b.rotY || 0 });
  });
}

/* Hàng đợi tạo rig: mỗi frame chỉ tạo rig trong ngân sách ~3ms (mobile 1 rig/frame,
   desktop 2 rig/frame) để không nghẽn main thread. */
const rigQueue = [];
function processRigQueue(maxPerFrame, budgetMs) {
  const t0 = performance.now();
  const budget = budgetMs || 3;
  let n = 0;
  while (rigQueue.length && n < (maxPerFrame || (IS_MOBILE ? 1 : 2))) {
    const job = rigQueue.shift();
    try { job(); } catch (e) { console.warn('[thamtu] tạo rig lỗi:', e); }
    n++;
    if (performance.now() - t0 > budget) break; // hết ngân sách frame → để frame sau
  }
  return rigQueue.length;
}

/* Tải ƯU TIÊN theo giai đoạn (v4): P0 chỉ model người chơi → P1 4 idol (tối đa
   2 file/lượt). File nào lỗi thì thay bằng model đã tải được. */
async function loadPriorityModels() {
  const playerKey = state.playerModel || 'sam';
  const idolKeys = ['matt', 'shaun', 'soldierMale', 'knight'];
  bootLog('models-priority', 'Đang tải nhân vật chính 0/5 (người chơi trước)…');
  let done = 0;
  const bump = () => { done++; bootLog('models-priority', 'Đã tải nhân vật chính ' + done + '/5'); };
  const failed = [];
  failed.push(...await loadKeysLimited([playerKey], bump));
  failed.push(...await loadKeysLimited(idolKeys, bump));
  if (failed.length) console.warn('[thamtu] model ưu tiên tải lỗi:', failed);
  const loaded = ['sam', 'matt', 'shaun', 'soldierMale', 'knight'].filter((k) => modelCache[k]);
  if (!loaded.length) return false;
  const fallbackKey = loaded[0];
  const pick = (k) => (modelCache[k] ? k : fallbackKey);
  // Người chơi: model đã chọn ở màn hình RPG (mặc định Sam)
  playerRig = makeRigFromGLTF(pick(state.playerModel || 'sam'), modelCache[pick(state.playerModel || 'sam')], { height: 1.76, name: 'player', shadow: true, role: 'player' });
  playerRig.group.position.set(0, 0, 5);
  attachAccessory(playerRig, 'cap');
  addNameTag(playerRig, state.playerName || 'Bạn');
  scene.add(playerRig.group);
  player = playerRig.group;
  setAnim(playerRig, 'idle');
  // 4 idol sau vách kính — v5: đứng SÁT kính hơn (z - 0.6 thay vì -1.1) để nhìn
  // rõ toàn thân qua ô kính đã mở khung; đèn huỳnh quang trong buồng đã thêm
  // ở buildHall() nên idol không còn chìm trong bóng tối.
  IDOLS.forEach((d) => {
    const key = pick(d.model);
    const rig = makeRigFromGLTF(key, modelCache[key], { height: d.height, name: d.id, shadow: true, role: 'idol' });
    const b = booths.find((x) => x.idolId === d.id);
    rig.group.position.set(b.x, 0, b.z - 0.6);
    rig.group.rotation.y = 0;
    if (d.tint) tintMaterial(rig, d.tint, 0xff8a3d); // áo tù cam (chỉ vật liệu không texture)
    attachAccessory(rig, d.acc);
    addNameTag(rig, d.name);
    scene.add(rig.group);
    idolRigs[d.id] = { rig, boothX: b.x, boothZ: b.z };
    setAnim(rig, 'idle');
  });
  if (failed.length) toast('⚠️ Một số nhân vật tải lỗi, đã thay bằng nhân vật khác: ' + failed.map((f) => f.split(':')[0]).join(', '));
  return true;
}

function makeOccupantRig(b, pick) {
  // Người thường ngồi sau kính ở ô không có idol.
  const occKeys = ['lis', 'casualF', 'soldierF'];
  const key = pick(occKeys[(b._occIdx || 0) % occKeys.length]);
  const rig = makeRigFromGLTF(key, modelCache[key], { height: 1.72, name: 'occ', role: 'occ' });
  const px = b.rotY ? b.x + (b.x < 0 ? -1.1 : 1.1) : b.x;
  const pz = b.rotY ? b.z : b.z + (b.z > 0 ? 1.1 : -1.1);
  rig.group.position.set(px, 0, pz);
  rig.group.rotation.y = b.z > 0 ? Math.PI : (b.x < 0 ? Math.PI / 2 : (b.x > 0 ? -Math.PI / 2 : 0));
  scene.add(rig.group);
  setAnim(rig, 'sit');
  return rig;
}
function makeNpcRig(d, i, pick) {
  const key = pick(d.model);
  const rig = makeRigFromGLTF(key, modelCache[key], { height: d.height, name: 'npc' + i, role: 'npc' });
  const x = -9 + i * 3.6, z = -2 + (i % 3) * 3;
  rig.group.position.set(x, 0, z);
  addNameTag(rig, d.name, rig.height + 0.4);
  scene.add(rig.group);
  npcs.push({ rig, name: d.name, target: new THREE.Vector3(x, 0, z), wait: Math.random() * 2 });
  setAnim(rig, 'idle');
  return rig;
}

/* Tải LAZY (chạy nền, không await): người ngồi chờ ở ô kính + 6 NPC đi lại.
   Rig được xếp hàng đợi, mỗi frame tạo tối đa 2 rig — sảnh đầy dần mà không giật. */
async function loadLazyModels() {
  const keys = ['lis', 'casualF', 'soldierF'];
  bootLog('models-lazy', 'Đang tải nhân vật phụ (người ngồi chờ + NPC)…');
  const failed = await loadKeysLimited(keys);
  if (failed.length) console.warn('[thamtu] model phụ tải lỗi:', failed);
  const loaded = keys.filter((k) => modelCache[k]);
  const fallbackKey = loaded[0] || Object.keys(modelCache)[0];
  if (!fallbackKey) { bootLog('models-lazy', 'Không tải được nhân vật phụ nào — sảnh chỉ có người chơi + 4 idol.'); return; }
  const pick = (k) => (modelCache[k] ? k : fallbackKey);
  let oi = 0;
  booths.filter((b) => !b.idolId).forEach((b) => { b._occIdx = oi++; rigQueue.push(() => makeOccupantRig(b, pick)); });
  const npcDefs = [
    { name: 'Bà Tư', model: 'lis', height: 1.68 }, { name: 'Anh Ba', model: 'matt', height: 1.78 },
    { name: 'Chị Lan', model: 'casualF', height: 1.7 }, { name: 'Sinh viên', model: 'sam', height: 1.76 },
    { name: 'Ông Sáu', model: 'shaun', height: 1.8 }, { name: 'Bé An', model: 'soldierF', height: 1.66 }
  ];
  npcDefs.forEach((d, i) => rigQueue.push(() => makeNpcRig(d, i, pick)));
  bootLog('models-lazy', 'Đã xếp ' + rigQueue.length + ' nhân vật phụ vào hàng đợi — sẽ hiện dần trong sảnh.');
}

function initThree() {
  const canvas = $('gameCanvas');
  // v5: mobile DPR tối đa 1.0, desktop 1.25 (FPS ~20 ở v4 → giảm pixel phải vẽ);
  // tắt antialias trên mobile; preserveDrawingBuffer:false (chụp ảnh render lại riêng).
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !IS_MOBILE, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.0 : 1.25));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x16211F);
  scene.fog = new THREE.Fog(0x16211F, 22, 42);
  camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
  camera.position.set(0, 4, 10);
  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();
  pointerNDC = new THREE.Vector2();
  scene.add(new THREE.HemisphereLight(0xFFF2D0, 0x233B37, 1.15));
  const sun = new THREE.DirectionalLight(0xffe9a8, 1.6);
  sun.position.set(8, 12, 6); sun.castShadow = true;
  // v5: shadow map nhỏ lại (512 desktop / 256 mobile) để tăng FPS.
  sun.shadow.mapSize.set(IS_MOBILE ? 256 : 512, IS_MOBILE ? 256 : 512);
  sun.shadow.camera.left = -18; sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18; sun.shadow.camera.bottom = -18;
  scene.add(sun);
  const warm = new THREE.PointLight(0xff8a3d, 25, 18, 1.8); warm.position.set(0, 3.6, -6); scene.add(warm);
  buildHall();
  resize();
  window.addEventListener('resize', resize);
  // ResizeObserver: canvas luôn có kích thước thật khi khung game đổi cỡ
  if (window.ResizeObserver) {
    new ResizeObserver(() => { if (renderer) resize(); }).observe($('gameContainer'));
  }
}
function resize() {
  if (!renderer || !camera) return;
  const box = $('gameContainer').getBoundingClientRect();
  const w = Math.max(320, box.width), h = Math.max(320, box.height);
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}

/* ================= DI CHUYỂN — third-person controller ================= */
function movePlayerTo(x, z, dt) {
  const dx = x - player.position.x, dz = z - player.position.z;
  const len = Math.hypot(dx, dz);
  if (len < 0.05) return;
  const sp = 3.2 * dt;
  player.position.x += (dx / len) * Math.min(sp, len);
  player.position.z += (dz / len) * Math.min(sp, len);
}
function updatePlayer(dt) {
  if (!player || !playerRig) return;
  if (state.visitMode) {
    if (playerRig.anim !== 'sit') setAnim(playerRig, 'sit');
    return;
  }
  // Nhảy (Space) — rig có clip Jump thật, vật lý nhảy đơn giản
  if (keys['Space'] && playerJumpY <= 0 && !state.autoWalkTo) {
    jumpV = 5.2;
    setAnim(playerRig, 'jump', { once: true });
  }
  if (jumpV !== 0 || playerJumpY > 0) {
    jumpV -= 14 * dt;
    playerJumpY = Math.max(0, playerJumpY + jumpV * dt);
    if (playerJumpY === 0) jumpV = 0;
    player.position.y = playerJumpY;
  }
  if (state.autoWalkTo) {
    const t = state.autoWalkTo;
    const dx = t.x - player.position.x, dz = t.z - player.position.z;
    if (Math.hypot(dx, dz) < 0.25) {
      state.autoWalkTo = null;
      if (playerRig.anim !== 'idle') setAnim(playerRig, 'idle');
      // Tới ô kính đã chọn nhanh → nhắc bấm VÀO THĂM (1 thao tác cuối).
      if (state.targetBooth) {
        const d = IDOLS.find((x) => x.id === state.targetBooth);
        if (d) showHint('📍 Đã tới ô ' + d.name + ' — chạm nút VÀO THĂM để vào thăm!');
        state.targetBooth = null;
      }
    }
    else {
      movePlayerTo(t.x, t.z, dt);
      playerRig.targetYaw = Math.atan2(dx, dz);
      if (playerRig.anim !== 'walk') setAnim(playerRig, 'walk');
    }
  } else {
    let ix = 0, iz = 0;
    if (keys['KeyW'] || keys['ArrowUp']) iz -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) iz += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) ix -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) ix += 1;
    if (joy.active) { ix += joy.x; iz += joy.y; }
    const len = Math.hypot(ix, iz);
    const running = !!(keys['ShiftLeft'] || keys['ShiftRight']);
    if (len > 0.08) {
      ix /= Math.max(1, len); iz /= Math.max(1, len);
      const sin = Math.sin(cam.yaw), cos = Math.cos(cam.yaw);
      const mx = ix * cos - iz * sin, mz = ix * sin + iz * cos;
      const speed = running ? 5.6 : 3.0;
      player.position.x += mx * speed * dt;
      player.position.z += mz * speed * dt;
      playerRig.targetYaw = Math.atan2(mx, mz);
      const want = running ? 'run' : 'walk';
      if (playerRig.anim !== want) setAnim(playerRig, want);
    } else if (playerRig.anim !== 'idle') {
      setAnim(playerRig, 'idle');
    }
  }
  player.rotation.y = lerpAngle(player.rotation.y, playerRig.targetYaw, 1 - Math.exp(-12 * dt));
  player.position.x = clamp(player.position.x, -HALL.x - 2.4, HALL.x + 2.4);
  player.position.z = clamp(player.position.z, -HALL.z - 2.4, HALL.z + 2.4);
  for (const o of obstacles) {
    const dx = player.position.x - o.x, dz = player.position.z - o.z;
    const d = Math.hypot(dx, dz);
    if (d < o.r && d > 0.001) { player.position.x = o.x + (dx / d) * o.r; player.position.z = o.z + (dz / d) * o.r; }
  }
}
function updateCamera(dt) {
  if (!player || !camera) return;
  if (state.visitMode && state.currentIdol) {
    const info = idolRigs[state.currentIdol];
    const bx = info ? info.boothX : 0;
    // v5: camera thăm lại gần hơn (cách idol ~4m, ngang vai) để thấy rõ toàn
    // thân idol sau kính thay vì chỉ thấy đầu nhỏ từ xa như v4.
    const target = new THREE.Vector3(bx + 0.4, 1.7, -HALL.z + 2.4);
    camera.position.x = damp(camera.position.x, target.x, 4, dt);
    camera.position.y = damp(camera.position.y, target.y, 4, dt);
    camera.position.z = damp(camera.position.z, target.z, 4, dt);
    const look = new THREE.Vector3(bx, 1.5, -HALL.z - 1.8);
    camera.lookAt(look);
    return;
  }
  const cd = cam.dist;
  const tx = player.position.x - Math.sin(cam.yaw) * cd;
  const tz = player.position.z - Math.cos(cam.yaw) * cd;
  const ty = 2.2 + Math.sin(cam.pitch) * cd;
  camera.position.x = damp(camera.position.x, tx, 8, dt);
  camera.position.y = damp(camera.position.y, ty, 8, dt);
  camera.position.z = damp(camera.position.z, tz, 8, dt);
  camera.lookAt(player.position.x, 1.5, player.position.z);
}
function updateNPCs(dt) {
  for (const n of npcs) {
    if (!n.rig) continue;
    if (n.wait > 0) { n.wait -= dt; if (n.rig.anim !== 'idle') setAnim(n.rig, 'idle'); continue; }
    const dx = n.target.x - n.rig.group.position.x, dz = n.target.z - n.rig.group.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.3) {
      n.wait = 1 + Math.random() * 4;
      n.target.set((Math.random() * 2 - 1) * (HALL.x - 2), 0, (Math.random() * 2 - 1) * (HALL.z - 2));
      if (n.rig.anim !== 'idle') setAnim(n.rig, 'idle');
    } else {
      n.rig.group.position.x += (dx / d) * 1.2 * dt;
      n.rig.group.position.z += (dz / d) * 1.2 * dt;
      n.rig.targetYaw = Math.atan2(dx, dz);
      n.rig.group.rotation.y = lerpAngle(n.rig.group.rotation.y, n.rig.targetYaw, 1 - Math.exp(-8 * dt));
      if (n.rig.anim !== 'walk') setAnim(n.rig, 'walk');
    }
  }
}
function nearestBooth() {
  if (!player) return null;
  let best = null, bestD = 2.6;
  for (const b of booths) {
    const d = Math.hypot(player.position.x - b.x, player.position.z - b.frontZ);
    if (d < bestD) { bestD = d; best = b; }
  }
  return best;
}
function updateNearPrompt() {
  const el = $('nearPrompt');
  const eBtn = $('interactBtn');
  const eLabel = $('interactLabel');
  const setE = (label, armed) => {
    if (eLabel) eLabel.textContent = label;
    if (eBtn) eBtn.classList.toggle('armed', !!armed);
  };
  if (!state.started || !player) { el.hidden = true; setE('THĂM', false); return; }
  if (state.visitMode) { el.hidden = true; setE('THĂM', false); return; }
  const b = nearestBooth();
  if (!b) { el.hidden = true; setE('ĐI TỚI', false); return; }
  // Hộp thoại NPC đang mở thì ẩn nhắc tương tác (tránh 2 khung chồng nhau
  // cùng chỗ — khung thoại đã mời tương tác rồi); đóng thoại thì nhắc lại hiện.
  el.hidden = $('rpgDialog').hidden ? false : true;
  if (b.idolId) {
    $('nearPromptText').textContent = 'Ô ' + IDOLS.find((d) => d.id === b.idolId).name + ' — bấm E để vào thăm';
    setE('VÀO THĂM', true);
  } else {
    $('nearPromptText').textContent = 'Ô này đang trống — bấm E để ngồi chờ';
    setE('THĂM', false);
  }
  el.dataset.boothId = b.idolId || '';
}
function enterGame() {
  // LƯU Ý (v3.1): nút NHẬN VÉ & VÀO SẢNH chỉ mở màn hình chơi — KHÔNG cộng điểm,
  // KHÔNG tính "đã thăm" idol nào. "Đã thăm" chỉ tăng trong openVisit()
  // khi người chơi THỰC SỰ vào ô thăm (bấm E gần ô kính / nút "Vào thăm").
  // v5: bỏ qua tên người chơi — mặc định là "Bạn", không bắt nhập tên.
  $('startScreen').hidden = true;
  state.started = true;
  // Hiện HUD THĂM NUÔI 1999 (v5): vé thăm + bảng gọi số/minimap + nhật ký + khay.
  ['questTracker', 'callBoard', 'ticketCard', 'quickIdolBar', 'bottomHud'].forEach((id) => { const el = $(id); if (el) el.hidden = false; });
  renderQuickIdolBar();
  updateChampPreview(state.playerModel || 'sam');
  if (playerRig) swapPlayerModel(state.playerModel || 'sam');
  if (state.no3d) {
    showHint('🎮 Đang chơi bản chữ — chạm 1 idol ở thanh phía trên để vào thăm.');
    return;
  }
  if (!playerRig) { showHint('⏳ Đang tải nhân vật 3D… chờ một chút rồi di chuyển nhé!'); }
  else {
    showHint(IS_TOUCH
      ? '🎮 Kéo joystick để di chuyển, chạm 1 idol phía trên để tự chạy tới ô kính!'
      : '🎮 WASD di chuyển • tới gần ô kính bấm E để vào thăm. Chạm 1 idol phía trên để tự chạy tới!');
  }
}

/* ================= THĂM NUÔI ================= */
/* Mở phòng thăm. source chỉ nhận 2 hành động rõ ràng của người chơi:
   'booth' (bấm E / nút Vào thăm khi đứng gần ô kính) và 'card' (nút "Vào thăm"
   trên thẻ idol). Không nguồn nào khác được phép gọi hàm này để tính thăm. */
function openVisit(idolId, source) {
  const idol = IDOLS.find((d) => d.id === idolId);
  if (!idol) return;
  if (!state.started) { enterGame(); }
  state.currentIdol = idolId;
  state.visitMode = true;
  state.visitSeconds = 180;
  state.visitPoints = 0;
  state.sentCount = 0;
  bumpStreak();
  if (!state.visited.has(idolId)) {
    state.visited.add(idolId);
    addPoints(20);
    toast('🎉 Lần đầu thăm ' + idol.name + '! +20 điểm.');
  }
  if (state.no3d || !idolRigs[idolId]) {
    // Bản chữ: không cần camera 3D, vẫn mở phòng thăm đầy đủ
  } else if (player && playerRig) {
    const info = idolRigs[idolId];
    const b = booths.find((x) => x.idolId === idolId);
    player.position.set(b.x, 0, b.frontZ);
    player.rotation.y = Math.PI;
    playerRig.targetYaw = Math.PI;
    setAnim(playerRig, 'sit');
    if (info.rig) setAnim(info.rig, 'wave', { once: true });
  }
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  $('visitScreen').classList.add('active');
  $('visitTitle').textContent = idol.emoji + ' Thăm ' + idol.name;
  $('visitStatus').textContent = idol.status;
  const vb = $('visitBooth');
  if (vb) {
    const bNo = booths.find((x) => x.idolId === idolId);
    vb.textContent = 'BUỒNG SỐ ' + String(bNo ? bNo.boothNo : '--').padStart(2, '0') + ' • LOA LIÊN LẠC: BẬT • VÉ A-014';
  }
  $('sentCount').textContent = '0';
  $('visitPoints').textContent = state.visitPoints;
  $('speechBubble').textContent = '"' + idol.lines[0] + '"';
  $('chatLog').innerHTML = '';
  $('gameResult').textContent = '';
  $('gameScore').textContent = '0';
  $('gameTime').textContent = '0:00';
  $('gameTitle').textContent = '🎮 ' + idol.game;
  $('gameDesc').textContent = idol.gameDesc;
  $('gameArea').innerHTML = '<p class="hint">Bấm “Bắt đầu chơi” để chơi mini-game của ' + idol.name + '.</p>';
  renderGifts();
  // v4: phòng thăm là overlay trong khung game — KHÔNG scrollIntoView (không cuộn trang mobile).
  showHint('🎁 Chọn quà bên dưới để tặng ' + idol.name + '!');
  const greetBtn = $('greetIdolBtn');
  if (greetBtn) greetBtn.textContent = '👋 Chào ' + idol.name;
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.visitSeconds--;
    const t = $('visitTimer');
    if (t) t.textContent = String(Math.floor(state.visitSeconds / 60)).padStart(2, '0') + ':' + String(state.visitSeconds % 60).padStart(2, '0');
    if (state.visitSeconds <= 0) { endVisit('⏰ Hết 3 phút thăm nuôi! Cảm ơn bạn đã vào thăm ' + idol.name + '.'); }
  }, 1000);
  checkMission('visit');
}
function endVisit(msg) {
  clearInterval(state.timerId);
  if (msg) toast(msg);
  state.visitMode = false;
  state.currentIdol = null;
  stopGame();
  if (playerRig && playerRig.anim !== 'idle') setAnim(playerRig, 'idle');
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  // v4: overlay chỉ ẩn đi, không cuộn trang — người chơi ở lại đúng chỗ trong sảnh.
  showHint(IS_TOUCH ? 'Chạm 1 idol phía trên để thăm người tiếp theo!' : 'Chọn idol khác ở thanh phía trên để thăm tiếp!');
}
function greetIdol() {
  const idol = IDOLS.find((d) => d.id === state.currentIdol);
  if (!idol) return;
  const info = idolRigs[idol.id];
  if (info && info.rig) setAnim(info.rig, 'wave', { once: true });
  const line = idol.lines[Math.floor(Math.random() * idol.lines.length)];
  $('speechBubble').textContent = '"' + line + '"';
  if (playerRig) setAnim(playerRig, 'bow', { once: true });
  showSpeech3d(line, 3500);
  addPoints(5);
  toast('👋 Bạn chào ' + idol.name + ' (+5 điểm).');
  checkMission('greet');
}
function renderGifts() {
  const row = $('giftsRow');
  row.innerHTML = '';
  GIFTS.forEach((g, i) => {
    const b = document.createElement('button');
    b.className = 'gift-btn';
    const count = (state.inventory[INV_KEYS[i]] || 0);
    b.textContent = g.emoji + ' ' + g.name + ' (+' + g.pts + 'đ) ×' + count;
    if (count <= 0) b.disabled = true;
    b.addEventListener('click', () => sendGift(g));
    row.appendChild(b);
  });
}
function sendGift(g) {
  const idol = IDOLS.find((d) => d.id === state.currentIdol);
  if (!idol) return;
  // Trừ đồ trong túi (RPG inventory)
  const gi = GIFTS.indexOf(g);
  const key = INV_KEYS[gi];
  if ((state.inventory[key] || 0) <= 0) {
    toast('🎒 Hết ' + g.name + ' rồi! Bấm “Nhận thêm đồ tiếp tế” ở túi đồ nhé!');
    return;
  }
  state.inventory[key]--;
  store.set('inventory', state.inventory);
  renderInventory(); renderGifts();
  state.giftsSentToday++;
  state.sentCount++;
  $('sentCount').textContent = String(state.sentCount);
  addPoints(g.pts);
  const line = idol.name + ' nhận được ' + g.emoji + ' ' + g.name + '! Cảm ơn bạn nhiều nhé!';
  $('speechBubble').textContent = '"' + line + '"';
  showSpeech3d(line, 3000);
  if (state.threeReady && !state.no3d && idolRigs[idol.id]) flyGift(g, idolRigs[idol.id].rig);
  toast(g.emoji + ' Đã gửi ' + g.name + ' cho ' + idol.name + ' (+' + g.pts + ' điểm, còn ' + g.secs + 's thăm nuôi thêm — tính gộp vào lượt này).');
  checkMission('gift');
}
function flyGift(g, rig) {
  if (!rig || !scene) return;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), new THREE.MeshStandardMaterial({ color: g.color, emissive: g.color, emissiveIntensity: 0.35 }));
  const start = player ? player.position.clone().add(new THREE.Vector3(0, 1.4, 0)) : new THREE.Vector3(0, 1.4, 0);
  mesh.position.copy(start);
  scene.add(mesh);
  const target = rig.group.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  const startTime = performance.now();
  flyItems.push({ mesh, start, target, startTime });
}

/* ================= RPG: túi đồ, nhiệm vụ, bảng vàng, hộp thoại, minimap ================= */
const MISSIONS = [
  { id: 'visit', text: 'Thăm 1 idol trong ngày', reward: 20 },
  { id: 'greet', text: 'Chào 1 idol (nút 👋 hoặc bấm vào idol)', reward: 5 },
  { id: 'gift', text: 'Tặng 1 món đồ thăm nuôi', reward: 10 },
  { id: 'chat', text: 'Chat với idol 3 câu', reward: 15 },
  { id: 'game', text: 'Chơi 1 mini-game', reward: 15 }
];
state.inventory = store.get('inventory', { noodle: 3, egg: 2, sausage: 2, drink: 3 });
state.playerModel = store.get('playerModel', 'sam');
state.playerName = store.get('playerName', 'Bạn');
state.dialogKey = null; state.dialogUntil = 0;
const INV_KEYS = ['noodle', 'egg', 'sausage', 'drink'];
const DIALOG_CHOICES = {
  kha: [
    { label: 'Anh múa quạt cho em xem đi!', reply: 'Được thôi! Nhìn đây — quạt này quạt cho mát, không quạt cho ai nóng!' },
    { label: 'Anh có nhớ nhà không?', reply: 'Nhớ chứ. Nhưng múa một bài là thấy đỡ nhớ hơn một tí.' },
    { label: 'Em chỉ ghé thăm thôi ạ.', reply: 'Vào thăm là anh vui rồi! Nhớ ghé lại nhé!' }
  ],
  huan: [
    { label: 'Thầy giảng đạo lý cho em nghe đi!', reply: 'Chỉ có làm thì mới có ăn! Không làm mà đòi có ăn thì chỉ có ăn… đòn thôi!' },
    { label: 'Thầy có hối hận không?', reply: 'Hối hận thì nhiều lắm em ạ. Giờ thầy chỉ mong các em đừng đi vào vết xe đổ của thầy.' },
    { label: 'Em chúc thầy khỏe ạ.', reply: 'Cảm ơn em! Các em ở ngoài nhớ làm ăn chân chính nhé!' }
  ],
  truong: [
    { label: 'Anh có đói không? Em mang mì nè!', reply: 'Có đồ ăn không em? Cho anh xin một miếng! Mì tôm là chân ái!' },
    { label: 'Anh có nhớ nhà không?', reply: 'Anh nhớ Nam Định lắm. Nhớ cả những bữa cơm nhà nữa…' },
    { label: 'Anh giữ sức khỏe nhé!', reply: 'Cảm ơn em đã vào thăm, nhớ mang theo xúc xích nhé!' }
  ],
  khanh: [
    { label: 'Anh livestream tiếp đi!', reply: 'Livestream của anh lúc nào cũng đông, giờ trong này cũng đông! Các em bấm follow nhé!' },
    { label: 'Anh có muốn nói gì với mọi người không?', reply: 'Anh xin lỗi mọi người. Giờ anh chỉ muốn sống yên ổn thôi.' },
    { label: 'Em ủng hộ anh quay lại làm tốt!', reply: 'Cảm ơn em! View tăng nhanh thế, các em bấm nhiệt tình quá!' }
  ]
};
const NPC_LINES = [
  'Chào bạn! Sảnh hôm nay đông quá, tôi chờ mãi mới tới lượt.',
  'Bạn thăm idol nào vậy? Tôi thì chờ thăm người thân.',
  'Nhớ mang đủ đồ tiếp tế nhé, trong này mì tôm là quý nhất!',
  'Đi dạo sảnh cho quen đường đi, tới gần ô kính thì bấm E để vào thăm.'
];
function checkMission(kind) {
  const today = todayStr();
  if (!state.missions.date || state.missions.date !== today) state.missions = { date: today, done: {} };
  if (state.missions.done[kind]) return;
  const m = MISSIONS.find((x) => x.id === kind);
  if (!m) return;
  state.missions.done[kind] = true;
  addPoints(m.reward);
  toast('✅ Nhiệm vụ xong: ' + m.text + ' (+' + m.reward + ' điểm thưởng).');
  save(); renderMissions();
}
function renderMissions() {
  const today = todayStr();
  if (!state.missions.date || state.missions.date !== today) state.missions = { date: today, done: {} };
  const html = [];
  MISSIONS.forEach((m) => {
    const done = !!state.missions.done[m.id];
    html.push('<li class="' + (done ? 'done' : '') + '">' + (done ? '✅ ' : '🔲 ') + m.text + ' <span class="reward">+' + m.reward + 'đ</span></li>');
  });
  const doneCount = MISSIONS.filter((m) => state.missions.done[m.id]).length;
  html.push('<li>🎯 Đã thăm <b>' + state.visited.size + '/4</b> idol • Hoàn thành <b>' + doneCount + '/' + MISSIONS.length + '</b> nhiệm vụ • Reset 00:00</li>');
  ['missionsList', 'menuMissionsList'].forEach((id) => {
    const ul = $(id);
    if (ul) ul.innerHTML = html.join('');
  });
}
function renderIdols() {
  const grid = $('idolGrid');
  if (!grid) return;
  grid.innerHTML = '';
  IDOLS.forEach((d) => {
    const card = document.createElement('div');
    card.className = 'idol-card' + (state.visited.has(d.id) ? ' visited' : '');
    // Portrait 3D thật (chụp từ model GLB) — monogram chữ cái hiện trước,
    // ảnh chụp xong thì đè lên. Thăm rồi thì đóng dấu mộc đỏ ĐÃ THĂM.
    card.innerHTML = '<div class="idol-portrait"><span class="champ-mono">' + d.name.charAt(0) + '</span><img data-portrait="' + d.model + '" alt="' + d.name + '" hidden></div><h3>' + d.name + '</h3>' +
      '<span class="tag">' + d.tag + '</span><p>' + d.desc + '</p>' +
      '<p class="fine">' + d.status + '</p>' +
      (state.visited.has(d.id) ? '<span class="stamp card-stamp">ĐÃ THĂM</span>' : '') +
      '<button class="btn primary visit-btn">' + (state.visited.has(d.id) ? '✅ Đã thăm — Thăm lại' : '🚪 Vào thăm') + '</button>';
    card.addEventListener('click', () => selectIdolQuick(d.id));
    grid.appendChild(card);
  });
  renderQuickIdolBar();
  try { applyPortraits(); } catch (e) { /* portrait chụp sau khi model tải xong */ }
}
function renderLeaderboard() {
  const rows = [
    { name: 'Chị Lan', pts: 860, level: 12 }, { name: 'Ông Sáu', pts: 720, level: 11 },
    { name: 'Bà Tư', pts: 640, level: 10 }, { name: 'Anh Ba', pts: 520, level: 9 },
    { name: 'Bạn', pts: state.points, level: Math.floor(state.points / 100) + 1, you: true }
  ].sort((a, b) => b.pts - a.pts).slice(0, 5);
  const html = rows.map((r, i) => '<li>' + (i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : '🎖️ ') +
    '<b>' + r.name + '</b> — Cấp ' + r.level + ' • ' + r.pts.toLocaleString('vi-VN') + ' điểm' + (r.you ? ' <span class="reward">← bạn</span>' : '') + '</li>').join('');
  ['leaderboardList', 'menuLeaderboardList'].forEach((id) => {
    const list = $(id);
    if (list) list.innerHTML = html;
  });
}
function renderInventory() {
  const makeSlot = (g, i) => {
    const key = INV_KEYS[i];
    const count = state.inventory[key] || 0;
    const slot = document.createElement('div');
    slot.className = 'inv-slot' + (count <= 0 ? ' empty' : '');
    slot.innerHTML = '<span class="inv-count">×' + count + '</span><div class="inv-emoji">' + g.emoji + '</div><b>' + g.name + '</b><small>+' + g.pts + 'đ • +' + g.secs + 's</small>';
    slot.addEventListener('click', () => {
      if (state.visitMode && state.currentIdol) sendGift(g);
      else toast('🎒 Vào thăm idol rồi bấm món đồ để tặng nhé!');
    });
    return slot;
  };
  ['inventoryGrid', 'menuInventory'].forEach((id) => {
    const grid = $(id);
    if (!grid) return;
    grid.innerHTML = '';
    GIFTS.forEach((g, i) => grid.appendChild(makeSlot(g, i)));
  });
  // Ô đồ mini trên HUD dưới (MOBA inventory) — bấm là tặng ngay khi đang thăm.
  const hud = $('hudInventory');
  if (hud) {
    hud.innerHTML = '';
    GIFTS.forEach((g, i) => {
      const key = INV_KEYS[i];
      const count = state.inventory[key] || 0;
      const s = document.createElement('button');
      s.className = 'hud-inv-slot' + (count <= 0 ? ' empty' : '');
      s.type = 'button';
      s.title = g.name + ' (+' + g.pts + 'đ) — bấm để tặng idol khi đang thăm';
      s.innerHTML = '<span class="inv-count">×' + count + '</span>' + g.emoji + '<small>' + g.name + '</small>';
      s.addEventListener('click', () => {
        if (state.visitMode && state.currentIdol) sendGift(g);
        else toast('🎒 Vào thăm idol rồi bấm món đồ để tặng nhé!');
      });
      hud.appendChild(s);
    });
  }
}
function refillInventory() {
  const now = Date.now();
  const last = store.get('lastRefill', 0);
  if (now - last < 60000) { toast('⏳ Đợi ' + Math.ceil((60000 - (now - last)) / 1000) + 's nữa mới nhận thêm được!'); return; }
  INV_KEYS.forEach((k) => { state.inventory[k] = (state.inventory[k] || 0) + 1; });
  store.set('lastRefill', now);
  store.set('inventory', state.inventory);
  renderInventory(); renderGifts();
  toast('🛒 Đã nhận thêm đồ tiếp tế: +1 mỗi món!');
}
/* Hộp thoại RPG — avatar là chữ cái đầu tên (monogram), không dùng emoji lớn */
function showRpgDialog(name, avatar, text, choices) {
  $('rpgAvatar').textContent = name.charAt(0);
  $('rpgName').textContent = name;
  $('rpgText').textContent = text;
  const box = $('rpgChoices');
  box.innerHTML = '';
  (choices || []).forEach((c) => {
    const b = document.createElement('button');
    b.textContent = '▶ ' + c.label;
    b.addEventListener('click', () => {
      $('rpgText').textContent = c.reply;
      box.innerHTML = '';
      addPoints(2);
    });
    box.appendChild(b);
  });
  $('rpgDialog').hidden = false;
}
function hideRpgDialog() {
  $('rpgDialog').hidden = true;
  state.dialogKey = null;
  state.dialogUntil = Date.now() + 8000;
}
function checkProximityDialog() {
  if (!state.started || state.visitMode || Date.now() < state.dialogUntil) return;
  if (!$('rpgDialog').hidden) return;
  const b = nearestBooth();
  if (b && b.idolId) {
    const d = IDOLS.find((x) => x.id === b.idolId);
    const key = 'idol:' + d.id;
    if (state.dialogKey !== key) {
      showRpgDialog(d.name, d.emoji, d.lines[0], DIALOG_CHOICES[d.id]);
      state.dialogKey = key;
    }
    return;
  }
  if (player) {
    for (const n of npcs) {
      const dd = Math.hypot(n.rig.group.position.x - player.position.x, n.rig.group.position.z - player.position.z);
      if (dd < 2) {
        const key = 'npc:' + n.name;
        if (state.dialogKey !== key) {
          showRpgDialog(n.name, '🧑', NPC_LINES[Math.floor(Math.random() * NPC_LINES.length)], [
            { label: 'Chào bạn!', reply: 'Chào bạn! Chúc bạn thăm idol vui vẻ nhé!' },
            { label: 'Bạn đang chờ ai vậy?', reply: 'Tôi chờ thăm người thân. Sảnh này đông lắm, lấy số rồi ngồi chờ thôi!' }
          ]);
          state.dialogKey = key;
        }
        return;
      }
    }
  }
  state.dialogKey = null;
}
/* Minimap sảnh — v5: chấm idol TO, viền trắng, vẽ sau ô kính để luôn nổi;
   trước đây idol chỉ là ô vàng 8x6px lẫn với ô kính nên nhìn như không có. */
function drawMinimap() {
  const cv = $('minimap');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  ctx.fillStyle = '#16211F'; ctx.fillRect(0, 0, W, H);
  const px = (x) => ((x + 17) / 34) * W;
  const pz = (z) => ((z + 12.5) / 25) * H;
  ctx.strokeStyle = '#C69A50'; ctx.lineWidth = 2;
  ctx.strokeRect(px(-HALL.x), pz(-HALL.z), px(HALL.x) - px(-HALL.x), pz(HALL.z) - pz(-HALL.z));
  booths.forEach((b) => {
    if (b.idolId) return; // ô idol vẽ riêng ở dưới, to và nổi hơn
    ctx.fillStyle = '#668D87';
    ctx.fillRect(px(b.x) - 3, pz(b.z) - 2, 6, 4);
  });
  npcs.forEach((n) => {
    ctx.fillStyle = '#3FE0D0';
    ctx.beginPath(); ctx.arc(px(n.rig.group.position.x), pz(n.rig.group.position.z), 3, 0, 7); ctx.fill();
  });
  // Chấm idol: vòng tròn vàng đồng lớn + viền trắng — không lẫn với ô kính.
  booths.forEach((b) => {
    if (!b.idolId) return;
    const x = px(b.x), y = pz(b.z);
    ctx.fillStyle = '#C69A50';
    ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
    ctx.strokeStyle = '#FFF6E8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke();
    ctx.fillStyle = '#16211F';
    ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', x, y + 0.5);
  });
  if (player) {
    const x = px(player.position.x), y = pz(player.position.z);
    const a = Math.atan2(Math.sin(player.rotation.y), Math.cos(player.rotation.y));
    ctx.fillStyle = '#FF5DA2';
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(a) * 10, y + Math.cos(a) * 10);
    ctx.lineTo(x + Math.sin(a + 2.5) * 7, y + Math.cos(a + 2.5) * 7);
    ctx.lineTo(x + Math.sin(a - 2.5) * 7, y + Math.cos(a - 2.5) * 7);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  }
}
/* Thanh máu/XP/vàng + đồng hồ nhiệm vụ — v4: chỉ ghi DOM khi chỉ số đổi
   (không gọi mỗi frame trong tick() nữa). */
let hudSig = '';
function updateHudBars() {
  const energy = state.visitMode ? Math.max(0, Math.round((state.visitSeconds / 180) * 100)) : 100;
  const p = state.points;
  const next = p >= 500 ? 1000 : p >= 200 ? 500 : p >= 80 ? 200 : 80;
  const base = p >= 500 ? 500 : p >= 200 ? 200 : p >= 80 ? 80 : 0;
  const pct = clamp(((p - base) / (next - base)) * 100, 0, 100);
  const d = new Date();
  const clockTxt = '🕐 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' • reset 00:00';
  const sig = energy + '|' + p + '|' + next + '|' + pct.toFixed(1) + '|' + clockTxt;
  if (sig === hudSig) return;
  hudSig = sig;
  const ef = $('energyFill'), et = $('energyText');
  if (ef) ef.style.width = energy + '%';
  if (et) et.textContent = energy + '%';
  const xf = $('xpFill'), xt = $('xpText'), gc = $('goldCount');
  if (xf) xf.style.width = pct + '%';
  if (xt) xt.textContent = p + '/' + next + ' XP';
  if (gc) gc.textContent = '🪙 ' + p.toLocaleString('vi-VN') + ' vàng';
  const qc = $('questClock');
  if (qc) qc.textContent = clockTxt;
  const hc2 = $('hudClock');
  if (hc2) hc2.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
/* Đổi nhân vật người chơi (chọn ở màn hình RPG) */
function swapPlayerModel(key) {
  if (!playerRig || !scene || !modelCache[key] || playerRig.key === key) return;
  const pos = playerRig.group.position.clone();
  const yaw = playerRig.group.rotation.y;
  scene.remove(playerRig.group);
  const idx = allRigs.indexOf(playerRig);
  if (idx >= 0) allRigs.splice(idx, 1);
  playerRig = makeRigFromGLTF(key, modelCache[key], { height: 1.76, name: 'player', shadow: true, role: 'player' });
  playerRig.group.position.copy(pos);
  playerRig.group.rotation.y = yaw;
  playerRig.targetYaw = yaw;
  attachAccessory(playerRig, 'cap');
  addNameTag(playerRig, state.playerName || 'Bạn');
  scene.add(playerRig.group);
  player = playerRig.group;
  setAnim(playerRig, 'idle');
  toast('🧑 Đã đổi nhân vật: ' + key.toUpperCase());
}

/* ================= CHAT ================= */
function addChatMsg(who, text) {
  const log = $('chatLog');
  const d = document.createElement('div');
  d.className = 'chat-msg ' + who;
  d.textContent = text;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}
function sendChat(text) {
  const idol = IDOLS.find((d) => d.id === state.currentIdol);
  if (!idol || !text) return;
  addChatMsg('you', text);
  state.chatCount++;
  const low = text.toLowerCase();
  let reply = idol.lines[Math.floor(Math.random() * idol.lines.length)];
  for (const c of idol.chat) {
    if (c.keys.some((k) => low.includes(k))) { reply = c.reply; break; }
  }
  setTimeout(() => {
    addChatMsg('idol', idol.name + ': ' + reply);
    $('speechBubble').textContent = '"' + reply + '"';
    const info = idolRigs[idol.id];
    if (info && info.rig) setAnim(info.rig, 'wave', { once: true });
  }, 400);
  addPoints(2);
  if (state.chatCount >= 3) checkMission('chat');
}
function renderQuickAsk() {
  const box = $('quickAsk');
  box.innerHTML = '';
  ['Làm thế nào để có ăn?', 'Anh có nhớ nhà không?', 'Khi nào anh ra tù?'].forEach((q) => {
    const b = document.createElement('button');
    b.textContent = q;
    b.addEventListener('click', () => sendChat(q));
    box.appendChild(b);
  });
}

/* ================= MINI-GAME ================= */
function stopGame() {
  state.gameActive = false;
  clearInterval(state.gameTimerId);
  state.gameTimerId = null;
}
function startGame() {
  const idol = IDOLS.find((d) => d.id === state.currentIdol);
  if (!idol) { toast('Vào thăm idol rồi mới chơi mini-game nhé!'); return; }
  stopGame();
  state.gameActive = true;
  state.gameScore = 0;
  $('gameScore').textContent = '0';
  $('gameResult').hidden = true;
  const area = $('gameArea');
  if (idol.id === 'kha') startRhythmGame(area);
  else if (idol.id === 'huan') startQuizGame(area);
  else if (idol.id === 'truong') startCatchGame(area);
  else startTapGame(area);
}
function endGame(msg) {
  if (!state.gameActive) return;
  stopGame();
  addPoints(state.gameScore);
  $('gameScore').textContent = String(state.gameScore);
  const r = $('gameResult');
  r.textContent = msg + ' (+' + state.gameScore + ' điểm đã cộng vào túi vàng!)';
  r.hidden = false;
  checkMission('game');
  const info = state.currentIdol ? idolRigs[state.currentIdol] : null;
  if (info && info.rig) setAnim(info.rig, 'fan', { once: true });
}
function startRhythmGame(area) {
  area.innerHTML = '<div class="rhythm-ring" id="rhythmRing">🪭</div><p>Bấm <b>MÚA!</b> ngay khi vòng vàng sáng lên!</p><button class="btn primary big" id="rhythmBtn">🪭 MÚA!</button>';
  let lit = false, left = 20;
  $('gameTime').textContent = '0:' + left;
  const ring = $('rhythmRing');
  const lightTimer = setInterval(() => {
    if (!state.gameActive) { clearInterval(lightTimer); return; }
    lit = true; ring.classList.add('hit');
    setTimeout(() => { lit = false; ring.classList.remove('hit'); }, 450);
  }, 950);
  $('rhythmBtn').addEventListener('click', () => {
    if (!state.gameActive) return;
    if (lit) { state.gameScore += 10; toast('🎵 Đúng nhịp! +10'); }
    else { state.gameScore += 1; toast('😅 Trượt nhịp, +1 an ủi'); }
    $('gameScore').textContent = String(state.gameScore);
  });
  state.gameTimerId = setInterval(() => {
    left--;
    $('gameTime').textContent = '0:' + String(Math.max(0, left)).padStart(2, '0');
    if (left <= 0) { clearInterval(lightTimer); endGame('🎵 Hết giờ múa quạt!'); }
  }, 1000);
}
function startQuizGame(area) {
  let qi = 0;
  const showQ = () => {
    if (qi >= QUIZ.length) { endGame('🎓 Trắc nghiệm đạo lý xong!'); return; }
    const q = QUIZ[qi];
    area.innerHTML = '<p><b>Câu ' + (qi + 1) + '/' + QUIZ.length + ':</b> ' + q.q + '</p>';
    q.opts.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.addEventListener('click', () => {
        if (!state.gameActive) return;
        if (i === q.a) { state.gameScore += 20; toast('✅ Đúng đạo lý! +20'); }
        else toast('❌ Thầy Huấn lắc đầu… đáp án đúng là: ' + q.opts[q.a]);
        $('gameScore').textContent = String(state.gameScore);
        qi++; showQ();
      });
      area.appendChild(b);
    });
  };
  $('gameTime').textContent = '—';
  showQ();
}
function startCatchGame(area) {
  area.innerHTML = '<canvas id="catchCanvas" width="420" height="220"></canvas><p>Kéo chuột / bấm ← → để di chuyển rổ hứng đồ ăn rơi!</p>';
  const cv = $('catchCanvas');
  const ctx = cv.getContext('2d');
  let basketX = 210, items = [], left = 20;
  const spawn = () => items.push({ x: 20 + Math.random() * 380, y: -10, v: 2 + Math.random() * 2, e: ['🍜', '🥚', '🌭', '🥤'][Math.floor(Math.random() * 4)] });
  const onMove = (e) => {
    const r = cv.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    basketX = clamp(cx * (cv.width / r.width), 30, 390);
  };
  cv.addEventListener('pointermove', onMove);
  cv.addEventListener('pointerdown', onMove);
  const loop = setInterval(() => {
    if (!state.gameActive) { clearInterval(loop); return; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (Math.random() < 0.12) spawn();
    items.forEach((it) => { it.y += it.v; ctx.font = '22px sans-serif'; ctx.fillText(it.e, it.x, it.y); });
    items = items.filter((it) => {
      if (it.y > 200) {
        if (Math.abs(it.x - basketX) < 45) { state.gameScore += 10; $('gameScore').textContent = String(state.gameScore); }
        return false;
      }
      return true;
    });
    ctx.font = '30px sans-serif'; ctx.fillText('🧺', basketX - 15, 215);
  }, 50);
  $('gameTime').textContent = '0:' + left;
  state.gameTimerId = setInterval(() => {
    left--;
    $('gameTime').textContent = '0:' + String(Math.max(0, left)).padStart(2, '0');
    if (left <= 0) { clearInterval(loop); endGame('🍜 Hết giờ hứng đồ ăn!'); }
  }, 1000);
}
function startTapGame(area) {
  area.innerHTML = '<p>Bấm <b>LIVESTREAM</b> liên tục để tăng view! Né nút <b>BỊ REPORT</b> — bấm nhầm mất 200 view!</p><button class="tap-big" id="tapBtn">📺 LIVESTREAM! +1 view</button> <button class="btn" id="reportBtn" style="display:none">🚫 BỊ REPORT</button><p>View hiện tại: <b id="tapViews">0</b></p>';
  let left = 15;
  $('gameTime').textContent = '0:' + left;
  $('tapBtn').addEventListener('click', () => {
    if (!state.gameActive) return;
    state.gameScore += 1;
    $('tapViews').textContent = String(state.gameScore);
    $('gameScore').textContent = String(state.gameScore);
  });
  const repTimer = setInterval(() => {
    if (!state.gameActive) { clearInterval(repTimer); return; }
    const rb = $('reportBtn');
    if (rb) {
      rb.style.display = 'inline-block';
      setTimeout(() => { if (rb) rb.style.display = 'none'; }, 700);
    }
  }, 1800);
  $('reportBtn').addEventListener('click', () => {
    state.gameScore = Math.max(0, state.gameScore - 200);
    $('tapViews').textContent = String(state.gameScore);
    $('gameScore').textContent = String(state.gameScore);
    toast('🚫 Bị report! Mất 200 view!');
  });
  state.gameTimerId = setInterval(() => {
    left--;
    $('gameTime').textContent = '0:' + String(Math.max(0, left)).padStart(2, '0');
    if (left <= 0) { clearInterval(repTimer); endGame('📺 Livestream kết thúc! Tổng view: ' + state.gameScore); }
  }, 1000);
}

/* ================= GIẤY CHỨNG NHẬN + ẢNH ================= */
function drawCert() {
  const c = $('certCanvas');
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FFF6E8'; ctx.fillRect(0, 0, 640, 400);
  ctx.strokeStyle = '#C69A50'; ctx.lineWidth = 8; ctx.strokeRect(10, 10, 620, 380);
  ctx.strokeStyle = '#A84238'; ctx.lineWidth = 2; ctx.strokeRect(22, 22, 596, 356);
  ctx.fillStyle = '#A84238'; ctx.font = 'bold 34px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('GIẤY CHỨNG NHẬN THĂM NUÔI', 320, 80);
  ctx.fillStyle = '#233B37'; ctx.font = '22px system-ui, sans-serif';
  const idol = IDOLS.find((d) => d.id === state.currentIdol);
  ctx.fillText('Chứng nhận bạn ' + (state.playerName || 'Bạn') + ' đã vào thăm', 320, 140);
  ctx.font = 'bold 30px system-ui, sans-serif'; ctx.fillStyle = '#8A6A34';
  ctx.fillText(idol ? idol.emoji + ' ' + idol.name : 'Idol', 320, 185);
  ctx.font = '20px system-ui, sans-serif'; ctx.fillStyle = '#233B37';
  ctx.fillText('Ngày ' + new Date().toLocaleDateString('vi-VN') + ' • Điểm buổi thăm: ' + state.visitPoints, 320, 235);
  ctx.fillText('Parody giải trí hư cấu — không phải buổi thăm thật', 320, 280);
  ctx.font = 'bold 20px system-ui, sans-serif'; ctx.fillStyle = '#A84238';
  ctx.fillText('★ VÀO TÙ THĂM IDOL — THĂM NUÔI 1999 ★', 320, 340);
  // Dấu mộc đỏ ĐÃ DUYỆT đóng chéo góc phải (phong cách THĂM NUÔI 1999).
  ctx.save();
  ctx.translate(500, 300); ctx.rotate(-0.18);
  ctx.strokeStyle = '#A84238'; ctx.lineWidth = 4;
  ctx.strokeRect(-78, -26, 156, 52);
  ctx.fillStyle = '#A84238'; ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText('ĐÃ DUYỆT', 0, 10);
  ctx.restore();
}
function downloadCert() {
  drawCert();
  const a = document.createElement('a');
  a.href = $('certCanvas').toDataURL('image/png');
  a.download = 'giay-chung-nhan-tham-nuoi.png';
  a.click();
  toast('📜 Đã tải giấy chứng nhận!');
}
function takePhoto() {
  if (state.no3d || !renderer) {
    toast('📸 Bản chữ không chụp được ảnh 3D — dùng giấy chứng nhận bên dưới nhé!');
    return;
  }
  try {
    // preserveDrawingBuffer:false nên phải render lại rồi toDataURL NGAY trong
    // cùng 1 tác vụ JS (trước khi trình duyệt composite) mới lấy được ảnh.
    renderer.render(scene, camera);
    const a = document.createElement('a');
    a.href = renderer.domElement.toDataURL('image/png');
    a.download = 'tham-tu-' + Date.now() + '.png';
    a.click();
    toast('📸 Đã chụp ảnh kỷ niệm!');
  } catch (e) { toast('📸 Không chụp được ảnh: ' + e.message); }
}

/* Kỹ năng MOBA (gán chức năng thật, không nút trang trí) */
function doWave() {
  if (playerRig) setAnim(playerRig, 'wave', { once: true });
  let best = null, bestD = 6;
  if (player) for (const n of npcs) {
    const d = Math.hypot(n.rig.group.position.x - player.position.x, n.rig.group.position.z - player.position.z);
    if (d < bestD) { bestD = d; best = n; }
  }
  if (best) { setAnim(best.rig, 'wave', { once: true }); showSpeech3d(best.name + ' vẫy tay chào lại bạn! 👋', 2500); }
  else toast('👋 Bạn vẫy tay… chưa ai ở gần để đáp lại.');
}
function doBow() { if (playerRig) setAnim(playerRig, 'bow', { once: true }); toast('🙏 Bạn chắp tay chào.'); }
function doIdolPerform() {
  const info = state.currentIdol ? idolRigs[state.currentIdol] : null;
  if (info && info.rig) { setAnim(info.rig, 'fan', { once: true }); toast('🪭 Idol biểu diễn cho bạn xem!'); }
  else toast('🪭 Vào thăm idol rồi bấm R để xem idol biểu diễn!');
}
function interactNear() {
  if (!state.started) return;
  const b = nearestBooth();
  if (b && b.idolId) { openVisit(b.idolId, 'booth'); return; }
  // Chưa đứng gần ô idol nào: bấm E / nút THĂM là tự đi tới ô idol gần nhất
  // (mobile: nút E hiện "ĐI TỚI") — người mới không cần học WASD trước.
  if (player && !state.no3d) {
    let best = null, bestD = Infinity;
    for (const x of booths) {
      if (!x.idolId) continue;
      const d = Math.hypot(player.position.x - x.x, player.position.z - x.frontZ);
      if (d < bestD) { bestD = d; best = x; }
    }
    if (best) {
      state.targetBooth = best.idolId;
      state.autoWalkTo = { x: best.x, z: best.frontZ };
      showHint('🏃 Đang chạy tới ô ' + IDOLS.find((d) => d.id === best.idolId).name + '… tới nơi sẽ hiện nút VÀO THĂM.');
      return;
    }
  }
  if (b) toast('🪟 Ô này đang trống — chọn ô có idol để vào thăm nhé!');
  else toast('🚶 Đi tới gần ô kính có tên idol rồi bấm E nhé!');
}
function bindInput() {
  // v4 P0: UI gắn listener NGAY khi DOM sẵn sàng, KHÔNG chờ boot 3D.
  // Guard chống đăng ký 2 lần (boot3D không còn gọi bindInput nữa).
  if (window.__thamtuUIBound) return;
  window.__thamtuUIBound = true;
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && e.target && e.target.tagName !== 'INPUT') e.preventDefault();
    if (e.code === 'KeyE') interactNear();
    if (e.code === 'KeyQ') doWave();
    if (e.code === 'KeyW') doBow();
    if (e.code === 'KeyR') doIdolPerform();
    if (e.code === 'KeyD') takePhoto();
    if (e.code === 'KeyF') toggleMenu();
    if (e.code === 'Escape') { hideRpgDialog(); closeMenu(); }
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  $('enterGameBtn').addEventListener('click', enterGame);
  updateTicketTimes();
  setInterval(updateTicketTimes, 30000); // vé + đồng hồ cập nhật mỗi 30 giây
  document.querySelectorAll('.champion-option').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.champion-option').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      state.playerModel = b.dataset.model;
      store.set('playerModel', state.playerModel);
      updateChampPreview(state.playerModel);
      if (playerRig) swapPlayerModel(state.playerModel);
    });
  });
  $('nearVisitBtn').addEventListener('click', interactNear);
  $('interactBtn').addEventListener('click', interactNear);
  $('waveBtn').addEventListener('click', doWave);
  $('bowBtn').addEventListener('click', doBow);
  $('sitBtn').addEventListener('click', () => {
    if (!playerRig) return;
    if (playerRig.anim === 'sit') setAnim(playerRig, 'idle');
    else setAnim(playerRig, 'sit');
  });
  $('photoBtn').addEventListener('click', takePhoto);
  $('skillRBtn').addEventListener('click', doIdolPerform);
  $('skillFBtn').addEventListener('click', toggleMenu);
  $('menuBtn').addEventListener('click', toggleMenu);
  $('menuCloseBtn').addEventListener('click', closeMenu);
  $('menuQuestBtn').addEventListener('click', () => openMenu('quest'));
  $('menuBagBtn').addEventListener('click', () => openMenu('bag'));
  $('menuMainBtn').addEventListener('click', () => openMenu());
  $('helpBtn').addEventListener('click', () => openMenu());
  $('takeTicketBtn').addEventListener('click', () => {
    state.ticket = 'A-' + String(Math.floor(Math.random() * 900) + 100);
    $('ticketNumber').textContent = state.ticket;
    toast('🎟️ Bạn đã lấy số ' + state.ticket + ' — ngồi chờ tới lượt nhé!');
  });
  $('shareBtn').addEventListener('click', async () => {
    const text = '🎮 Tôi vừa thăm idol trên Vào Tù Thăm Idol — ' + state.visited.size + '/4 idol, ' + state.points + ' điểm! Chơi thử tại ' + location.href;
    try { await navigator.clipboard.writeText(text); $('shareFeedback').hidden = false; setTimeout(() => { $('shareFeedback').hidden = true; }, 2500); }
    catch (e) { toast('Không sao chép được — copy tay link trên thanh địa chỉ nhé!'); }
  });
  $('copyLinkBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); $('shareFeedback').hidden = false; setTimeout(() => { $('shareFeedback').hidden = true; }, 2500); }
    catch (e) { toast('Không sao chép được — copy tay link trên thanh địa chỉ nhé!'); }
  });
  $('greetIdolBtn').addEventListener('click', greetIdol);
  $('idolFanBtn').addEventListener('click', doIdolPerform);
  $('endVisitBtn').addEventListener('click', () => { drawCert(); endVisit('👋 Kết thúc buổi thăm. Giấy chứng nhận đã cấp bên dưới!'); });
  $('backToLobbyBtn').addEventListener('click', () => { drawCert(); endVisit(); });
  $('chatSendBtn').addEventListener('click', () => { const v = $('chatInput').value.trim(); if (v) { sendChat(v); $('chatInput').value = ''; } });
  $('chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { const v = e.target.value.trim(); if (v) { sendChat(v); e.target.value = ''; } } });
  $('gameStartBtn').addEventListener('click', startGame);
  $('downloadCertBtn').addEventListener('click', downloadCert);
  $('photoVisitBtn').addEventListener('click', takePhoto);
  $('refillInvBtn').addEventListener('click', refillInventory);
  $('refillInvBtn2').addEventListener('click', refillInventory);
  $('rpgContinue').addEventListener('click', hideRpgDialog);
  $('reloadBtn').addEventListener('click', () => location.reload());
  const retry = $('retry3dBtn');
  if (retry) retry.addEventListener('click', () => location.reload());
  const dismiss = $('dismiss3dBtn');
  if (dismiss) dismiss.addEventListener('click', () => { $('webglError').hidden = true; toast('📜 Đang chơi bản chữ — chọn idol ở dưới để vào thăm.'); });
  // Chuột: kéo orbit, lăn zoom, bấm vào idol để chào.
  // Phân biệt ngón camera bằng pointerId riêng (v4): ngón joystick hay ngón thứ
  // hai chạm vào màn hình không được làm xoay camera; overlay/menu/start-screen
  // đang mở thì không bắt đầu kéo camera.
  const gc = $('gameContainer');
  let dragging = false, camPointerId = null, lastX = 0, lastY = 0, downX = 0, downY = 0;
  gc.addEventListener('pointerdown', (e) => {
    if (dragging) return; // đã có 1 ngón đang xoay camera
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.joystick') || e.target.closest('.rpg-dialog') || e.target.closest('#menuOverlay') || e.target.closest('#visitScreen') || e.target.closest('#startScreen')) return;
    dragging = true; camPointerId = e.pointerId; lastX = e.clientX; lastY = e.clientY; downX = e.clientX; downY = e.clientY;
    gc.setPointerCapture(e.pointerId);
  });
  gc.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== camPointerId) return;
    cam.yaw -= (e.clientX - lastX) * 0.005;
    cam.pitch = clamp(cam.pitch + (e.clientY - lastY) * 0.003, 0.05, 1.1);
    lastX = e.clientX; lastY = e.clientY;
  });
  gc.addEventListener('pointerup', (e) => {
    if (!dragging || e.pointerId !== camPointerId) return;
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    dragging = false; camPointerId = null;
    if (moved < 8 && state.threeReady && !state.no3d && state.visitMode && state.currentIdol) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNDC.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointerNDC, camera);
      const info = idolRigs[state.currentIdol];
      if (info && info.rig) {
        const hits = raycaster.intersectObject(info.rig.group, true);
        if (hits.length) greetIdol();
      }
    }
  });
  gc.addEventListener('pointercancel', (e) => {
    if (e.pointerId === camPointerId) { dragging = false; camPointerId = null; }
  });
  gc.addEventListener('wheel', (e) => {
    e.preventDefault();
    cam.dist = clamp(cam.dist + e.deltaY * 0.01, 4, 12);
  }, { passive: false });
  // Joystick ảo — bán kính tính theo kích thước thật của joystick
  // (maxRadius = 30% chiều rộng), phân biệt ngón joystick bằng pointerId riêng.
  const joyEl = $('joystick'), knob = $('joyKnob');
  const setJoy = (e) => {
    const r = joyEl.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const maxR = r.width * 0.30;
    let dx = (e.clientX - cx) / maxR, dy = (e.clientY - cy) / maxR;
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    joy.x = dx; joy.y = dy;
    knob.style.transform = 'translate(' + (dx * maxR) + 'px,' + (dy * maxR) + 'px)';
  };
  joyEl.addEventListener('pointerdown', (e) => { joy.active = true; joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); setJoy(e); });
  joyEl.addEventListener('pointermove', (e) => { if (joy.active && e.pointerId === joy.id) setJoy(e); });
  const endJoy = () => { joy.active = false; joy.x = 0; joy.y = 0; knob.style.transform = ''; };
  joyEl.addEventListener('pointerup', endJoy);
  joyEl.addEventListener('pointercancel', endJoy);
  // Joystick reset về giữa khi mất focus / chuyển tab (không bị kẹt hướng đi).
  window.addEventListener('blur', endJoy);
  document.addEventListener('visibilitychange', () => { if (document.hidden) endJoy(); });
  renderQuickAsk();
  renderInventory();
  drawCert();
  drawMinimap();
  updateHudBars();
}
let tickRunning = false;
let minimapAccum = 0;
let idleYaw = 0;
let previewAngle = 0;
let tickFrame = 0;
function updateCameraIdle(dt) {
  // Khi chỉ lỗi tải model: giữ sảnh 3D sống động bằng camera quay chậm quanh sảnh.
  if (!camera) return;
  idleYaw += dt * 0.06;
  const r = 12;
  camera.position.set(Math.sin(idleYaw) * r, 5.5, Math.cos(idleYaw) * r);
  camera.lookAt(0, 1.2, 0);
}
function updatePreviewCamera(dt) {
  // v5: màn hình HỒ SƠ NGƯỜI THĂM — camera quay chậm quanh nhân vật người chơi
  // (toàn thân, có animation Idle) để người chơi thấy model 3D thật ngay từ
  // màn hình chọn, thay vì emoji như v4. Lớp phủ giữa màn hình trong suốt.
  if (!camera || !player) return;
  previewAngle += dt * 0.12;
  const px = player.position.x, pz = player.position.z;
  camera.position.set(px + Math.sin(previewAngle) * 3.4, 1.35, pz + Math.cos(previewAngle) * 3.4);
  camera.lookAt(px, 1.05, pz);
}
function tick() {
  // Tab ẩn: dừng render hẳn (không chạy rAF nền) — quay lại tab thì resume.
  if (document.hidden) { tickRunning = false; return; }
  tickRunning = true;
  requestAnimationFrame(tick);
  const dt = clock ? Math.min(0.05, clock.getDelta()) : 0.016;
  tickFrame++;
  if (state.threeReady) {
    if (!state.no3d) {
      if (!state.started && playerRig) {
        // Chưa vào sảnh: preview nhân vật 3D toàn thân ở màn hình hồ sơ.
        updatePreviewCamera(dt);
        if (playerRig.anim !== 'idle') setAnim(playerRig, 'idle');
      } else {
        updatePlayer(dt);
        updateCamera(dt);
      }
      updateNPCs(dt);
      // v5 FPS: player + idol cập nhật animation mỗi frame; NPC/người ngồi chờ
      // (xa camera, ít quan trọng) chỉ cập nhật frame chẵn — giảm tải mixer.
      for (const r of allRigs) {
        if (r.role === 'npc' || r.role === 'occ') { if (tickFrame % 2 === 0) r.mixer.update(dt * 2); }
        else r.mixer.update(dt);
      }
      for (let i = flyItems.length - 1; i >= 0; i--) {
        const f = flyItems[i];
        const p = (performance.now() - f.startTime) / 900;
        if (p >= 1) { scene.remove(f.mesh); flyItems.splice(i, 1); }
        else {
          f.mesh.position.lerpVectors(f.start, f.target, p);
          f.mesh.position.y += Math.sin(p * Math.PI) * 1.2;
          f.mesh.rotation.y += dt * 6;
        }
      }
      updateNearPrompt();
      checkProximityDialog();
    } else {
      // Chỉ lỗi tải model: sảnh vẫn render, camera quay chậm, rig nào có thì vẫn động.
      updateCameraIdle(dt);
      for (const r of allRigs) r.mixer.update(dt);
    }
    // Tạo rig phụ theo ngân sách ~3ms/frame (mobile 1 rig/frame) để không nghẽn main thread.
    processRigQueue(IS_MOBILE ? 1 : 2, 3);
    renderer.render(scene, camera);
    fpsFrames++; fpsTime += dt;
    if (fpsTime >= 1) {
      const fc = $('fpsChip');
      if (fc) fc.textContent = Math.round(fpsFrames / fpsTime) + ' FPS';
      fpsFrames = 0; fpsTime = 0;
    }
  }
  // Minimap chỉ vẽ 10 lần/giây; HUD chỉ ghi DOM khi chỉ số đổi (xem updateHudBars).
  minimapAccum += dt;
  if (minimapAccum >= 0.1) { minimapAccum = 0; drawMinimap(); }
  updateHudBars();
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !tickRunning && state.threeReady) tick();
});

/* ================= KHỞI ĐỘNG v4: UI trước, 3D nền sau =================
   P0 (lỗi gốc): bindInput() + render UI chạy NGAY khi module load — nút CHƠI NGAY
   bấm được ngay cả khi Three.js/GLB chưa tải xong. boot3D() chỉ lo vẽ cảnh 3D
   và chạy nền; lỗi 3D không bao giờ chặn UI nữa. */
bindInput();
updateHeader(); renderIdols(); renderMissions(); renderLeaderboard(); renderQuickIdolBar();
updateChampPreview(state.playerModel || 'sam');
bootState.ui = 'ok';
bootLog('init', 'Giao diện đã sẵn sàng — đang tải 3D nền…');
boot3D();
