/* Vào Tù Thăm Idol — GAME 3D thật (Three.js 0.160.0, ES module + importmap).
   Nhân vật low-poly dựng bằng code, không dùng ảnh thật, không tải GLB ngoài.
   Parody giải trí hư cấu. Mọi số liệu online/bảng vàng đều là mô phỏng, đã ghi rõ. */
import * as THREE from 'three';

window.__thamtuStarted = false;
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerpAngle = (a, b, t) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};
const damp = (a, b, lambda, dt) => THREE.MathUtils.lerp(a, b, 1 - Math.exp(-lambda * dt));

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
    color: 0xff8a3d, pants: 0x2b2b3d, hair: 0x111111, acc: 'fan',
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
    color: 0xf5f5f5, pants: 0x1f2a44, hair: 0x222222, acc: 'rose',
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
    color: 0x8a6d3b, pants: 0x333333, hair: 0x111111, acc: 'bowl',
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
    color: 0xffd34d, pants: 0x4a2d78, hair: 0x3a2a00, acc: 'crown',
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
  autoWalkTo: null
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
let toastTimer = null;
function toast(msg) {
  const t = $('gameToast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3000);
}
function showSpeech3d(text, ms) {
  const el = $('speech3d'); el.textContent = text; el.hidden = false;
  clearTimeout(el._h); el._h = setTimeout(() => { el.hidden = true; }, ms || 3500);
}
function addPoints(n) { state.points += n; state.visitPoints += n; updateHeader(); const vp = $('visitPoints'); if (vp) vp.textContent = state.visitPoints; save(); }

/* ================= THREE.JS — SCENE ================= */
const HALL = { x: 13, z: 9 }; // nửa kích thước sảnh (người chơi bị chặn trong này)
let renderer, scene, camera, clock;
let player, playerRig;
const npcs = [];        // {rig, target, wait}
const idolRigs = {};    // id -> {rig, boothX, group}
const booths = [];      // {x, z, idolId|null, label}
const obstacles = [];   // {x, z, r} vòng tròn va chạm
const flyItems = [];    // đồ thăm nuôi đang bay
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
const keys = {};
const cam = { yaw: 0, pitch: 0.32, dist: 7.5, targetYaw: 0 };
const joy = { active: false, x: 0, y: 0, id: null };
let fpsFrames = 0, fpsTime = 0;

function mat(color, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.05 }, opts || {}));
}
function box(w, h, d, color, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  (parent || scene).add(m); return m;
}
function textSprite(text, scale) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(8,4,18,0.85)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(6, 18, 500, 92, 24); else ctx.rect(6, 18, 500, 92);
  ctx.fill();
  ctx.strokeStyle = '#ffcf3f'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 46px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 66);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(2.6 * (scale || 1), 0.65 * (scale || 1), 1);
  return sp;
}

/* --- Nhân vật low-poly dựng bằng code: đầu, thân áo, tay, chân, phụ kiện --- */
function makeHuman(opts) {
  const o = Object.assign({ shirt: 0x3f7fd0, pants: 0x2b2b3d, skin: 0xe8b98a, hair: 0x1a1a1a, scale: 1, acc: null }, opts || {});
  const g = new THREE.Group();
  const skin = mat(o.skin), shirt = mat(o.shirt), pants = mat(o.pants), hairM = mat(o.hair);
  // chân (pivot ở hông để đung đưa khi đi)
  const legL = new THREE.Group(); legL.position.set(-0.14, 0.78, 0);
  const legR = new THREE.Group(); legR.position.set(0.14, 0.78, 0);
  const lm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.78, 0.22), pants);
  lm.position.y = -0.39; lm.castShadow = true;
  const lm2 = lm.clone(); legL.add(lm); legR.add(lm2);
  // thân
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.36), shirt);
  body.position.y = 1.14; body.castShadow = true;
  // tay (pivot ở vai)
  const armL = new THREE.Group(); armL.position.set(-0.4, 1.44, 0);
  const armR = new THREE.Group(); armR.position.set(0.4, 1.44, 0);
  const am = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.18), shirt);
  am.position.y = -0.31; am.castShadow = true;
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), skin); handL.position.y = -0.66;
  const handR = handL.clone();
  armL.add(am, handL); armR.add(am.clone(), handR);
  // đầu + tóc + mắt
  const head = new THREE.Group(); head.position.y = 1.72;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 14), skin); skull.castShadow = true;
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.285, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM);
  hair.position.y = 0.04;
  const eyeM = mat(0x111111, { roughness: 0.4 });
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeM); eL.position.set(-0.1, 0.02, 0.24);
  const eR = eL.clone(); eR.position.x = 0.1;
  head.add(skull, hair, eL, eR);
  g.add(legL, legR, body, armL, armR, head);
  // phụ kiện riêng từng idol
  let accessory = null;
  if (o.acc === 'fan') {
    accessory = new THREE.Group();
    const fan = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.03), mat(0xffd34d));
    fan.position.set(0, -0.72, 0.05);
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.05), mat(0x7a4a1f));
    stick.position.set(0, -0.88, 0.05);
    accessory.add(fan, stick); armR.add(accessory);
  } else if (o.acc === 'rose') {
    accessory = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), mat(0xe6396b));
    accessory.position.set(-0.18, 1.32, 0.2); g.add(accessory);
  } else if (o.acc === 'bowl') {
    accessory = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.09, 12), mat(0xf5f5f5));
    accessory.position.set(0, -0.7, 0.08); armL.add(accessory);
  } else if (o.acc === 'crown') {
    accessory = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.16, 8), mat(0xffd34d, { metalness: 0.6, roughness: 0.3 }));
    accessory.position.y = 0.3; head.add(accessory);
  } else if (o.acc === 'cap') {
    accessory = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.09, 16), mat(0x2f6fd0));
    accessory.position.y = 0.24; head.add(accessory);
  }
  g.scale.setScalar(o.scale || 1);
  g.traverse((m) => { if (m.isMesh) m.userData.rootGroup = g; });
  const rig = { group: g, head, body, armL, armR, legL, legR, accessory,
    anim: 'idle', animTime: 0, phase: Math.random() * 6, speed: 0, targetYaw: 0 };
  return rig;
}

/* --- Chuyển animation mượt: đặt anim mới, rig tự lerp khớp về tư thế đích --- */
function setAnim(rig, anim, dur) {
  if (!rig) return;
  rig.anim = anim; rig.animTime = 0;
  if (dur) { rig.animDur = dur; } else { rig.animDur = 0; }
}
function updateRig(rig, dt) {
  rig.animTime += dt;
  const t = rig.animTime;
  let legSwing = 0, armSwing = 0, bob = 0, armRaiseR = 0, armRaiseL = 0, bodyPitch = 0, bodyY = 0, legBend = 0;
  if (rig.anim === 'walk') {
    const ph = t * (rig.speed > 4.5 ? 11 : 8);
    legSwing = Math.sin(ph) * 0.65;
    armSwing = Math.sin(ph) * 0.5;
    bob = Math.abs(Math.sin(ph)) * 0.07;
  } else if (rig.anim === 'wave') {
    armRaiseR = -2.3; // tay phải giơ cao
    rig.armR.rotation.x = damp(rig.armR.rotation.x, -0.4, 14, dt);
    rig.armR.rotation.z = damp(rig.armR.rotation.z, -0.5 + Math.sin(t * 9) * 0.35, 14, dt);
    legSwing = 0; bob = Math.sin(t * 2) * 0.015;
  } else if (rig.anim === 'bow') {
    bodyPitch = 0.55; armRaiseL = 0.3; armRaiseR = 0.3;
  } else if (rig.anim === 'fan') {
    armRaiseR = -1.1;
    rig.armR.rotation.x = damp(rig.armR.rotation.x, -0.9 + Math.sin(t * 7) * 0.55, 12, dt);
    rig.armR.rotation.z = damp(rig.armR.rotation.z, -0.4 + Math.cos(t * 7) * 0.25, 12, dt);
    bodyPitch = 0.06; bob = Math.sin(t * 3) * 0.02;
  } else if (rig.anim === 'sit') {
    legBend = -1.35; bodyY = -0.42; bodyPitch = 0.12;
  } else { // idle: thở
    bob = Math.sin(t * 1.8 + rig.phase) * 0.02;
    armSwing = Math.sin(t * 1.8 + rig.phase) * 0.05;
    rig.head.rotation.y = damp(rig.head.rotation.y, Math.sin(t * 0.5 + rig.phase) * 0.25, 4, dt);
  }
  if (rig.anim !== 'wave' && rig.anim !== 'fan') {
    rig.armR.rotation.x = damp(rig.armR.rotation.x, -armSwing + (armRaiseR ? -1.2 : 0), 12, dt);
    rig.armR.rotation.z = damp(rig.armR.rotation.z, armRaiseR ? -0.35 : 0.08, 12, dt);
  }
  if (rig.anim !== 'fan') {
    rig.armL.rotation.x = damp(rig.armL.rotation.x, armSwing + (armRaiseL ? -0.4 : 0), 12, dt);
    rig.armL.rotation.z = damp(rig.armL.rotation.z, armRaiseL ? 0.35 : -0.08, 12, dt);
  }
  rig.legL.rotation.x = damp(rig.legL.rotation.x, legSwing + legBend, 14, dt);
  rig.legR.rotation.x = damp(rig.legR.rotation.x, -legSwing + legBend, 14, dt);
  rig.body.rotation.x = damp(rig.body.rotation.x, bodyPitch, 10, dt);
  rig.body.position.y = damp(rig.body.position.y, 1.14 + bob + bodyY, 12, dt);
  rig.head.position.y = damp(rig.head.position.y, 1.72 + bob + bodyY, 12, dt);
  if (rig.animDur && t > rig.animDur) { rig.animDur = 0; setAnim(rig, rig.anim === 'sit' ? 'sit' : 'idle'); }
}

function buildHall() {
  // sàn caro
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a1b4d, roughness: 0.9 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL.x * 2 + 6, HALL.z * 2 + 6), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const tileGeo = new THREE.PlaneGeometry(2, 2);
  for (let ix = -7; ix < 7; ix++) for (let iz = -5; iz < 5; iz++) {
    if ((ix + iz) % 2 === 0) continue;
    const tile = new THREE.Mesh(tileGeo, new THREE.MeshStandardMaterial({ color: 0x352260, roughness: 0.9 }));
    tile.rotation.x = -Math.PI / 2; tile.position.set(ix * 2 + 1, 0.01, iz * 2 + 1); tile.receiveShadow = true; scene.add(tile);
  }
  // tường
  const wallM = mat(0x3a2a5e);
  const mkWall = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallM); m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m; };
  mkWall(HALL.x * 2 + 6, 4.5, 0.4, 0, 2.25, -HALL.z - 3);
  mkWall(HALL.x * 2 + 6, 4.5, 0.4, 0, 2.25, HALL.z + 3);
  mkWall(0.4, 4.5, HALL.z * 2 + 6, -HALL.x - 3, 2.25, 0);
  mkWall(0.4, 4.5, HALL.z * 2 + 6, HALL.x + 3, 2.25, 0);
  // biển tên sảnh
  const sign = textSprite('SẢNH THĂM NUÔI 3D', 1.4); sign.position.set(0, 4.1, -HALL.z - 2.7); scene.add(sign);
  // cột + đèn trần
  for (const [x, z] of [[-8, -4], [8, -4], [-8, 4], [8, 4]]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 4.2, 10), mat(0x6b5a9e));
    col.position.set(x, 2.1, z); col.castShadow = true; scene.add(col);
    obstacles.push({ x, z, r: 0.7 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffc93f, emissiveIntensity: 1.4 }));
    lamp.position.set(x, 3.9, z); scene.add(lamp);
  }
  // 24 ô kính: 8 bắc (4 idol + 4 thường), 8 nam, 4 đông, 4 tây
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
    // khung + kính trong suốt + bàn + ghế
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 0.18), mat(0x1c1032));
    frame.position.y = 1.3; frame.castShadow = true; grp.add(frame);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.1),
      new THREE.MeshPhysicalMaterial({ color: 0x9fd8e8, transparent: true, opacity: 0.28, roughness: 0.1, metalness: 0 }));
    glass.position.set(0, 1.45, 0.12); grp.add(glass);
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 0.7), mat(0x6b4a2f));
    table.position.set(0, 0.85, 0.35); table.castShadow = true; grp.add(table);
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), mat(0x4a2d78));
    chair.position.set(0, 0.25, 0.9); grp.add(chair);
    const num = textSprite(b.idol ? b.idol.name : ('Ô ' + String(idx + 1).padStart(2, '0')), b.idol ? 1 : 0.8);
    num.position.set(0, 3.05, 0.2); grp.add(num);
    scene.add(grp);
    booths.push({ x: b.x, z: b.z, idolId: b.idol ? b.idol.id : null, frontX: b.x, frontZ: b.rotY ? b.z : (b.z > 0 ? HALL.z - 0.6 : -HALL.z + 1.6) });
    if (b.idol) {
      const rig = makeHuman({ shirt: b.idol.color, pants: b.idol.pants, hair: b.idol.hair, acc: b.idol.acc });
      rig.group.position.set(b.x, 0, b.z - 1.1);
      rig.group.rotation.y = 0; // quay mặt ra sảnh (hướng +z)
      rig.targetYaw = 0;
      const tag = textSprite(b.idol.name, 1);
      tag.position.set(0, 2.35, 0); rig.group.add(tag);
      scene.add(rig.group);
      idolRigs[b.idol.id] = { rig, boothX: b.x, boothZ: b.z };
      setAnim(rig, 'idle');
    } else {
      // bóng người thường ngồi sau kính, quay mặt về phía sảnh
      const rig = makeHuman({ shirt: 0x5a6b8a, pants: 0x333333, hair: 0x222222, scale: 0.96 });
      // đứng sau vách kính: tường bắc/nam lùi theo z, tường đông/tây lùi theo x
      const px = b.rotY ? b.x + (b.x < 0 ? -1.1 : 1.1) : b.x;
      const pz = b.rotY ? b.z : b.z + (b.z > 0 ? 1.1 : -1.1);
      rig.group.position.set(px, 0, pz);
      rig.group.rotation.y = b.z > 0 ? Math.PI : (b.x < 0 ? Math.PI / 2 : (b.x > 0 ? -Math.PI / 2 : 0));
      scene.add(rig.group);
      setAnim(rig, 'sit');
    }
  });
}

function buildNPCs() {
  const defs = [
    { name: 'Bà Tư', shirt: 0xc96b9e, hair: 0xdddddd }, { name: 'Anh Ba', shirt: 0x3f7fd0, hair: 0x111111 },
    { name: 'Chị Lan', shirt: 0x4ade80, hair: 0x2a1a00 }, { name: 'Sinh viên', shirt: 0xffd34d, hair: 0x111111 },
    { name: 'Ông Sáu', shirt: 0x8a6d3b, hair: 0xeeeeee }, { name: 'Bé An', shirt: 0xff5da2, hair: 0x111111 }
  ];
  defs.forEach((d, i) => {
    const rig = makeHuman({ shirt: d.shirt, hair: d.hair, scale: 0.95 });
    const x = -9 + i * 3.6, z = -2 + (i % 3) * 3;
    rig.group.position.set(x, 0, z);
    const tag = textSprite(d.name, 0.85); tag.position.set(0, 2.3, 0); rig.group.add(tag);
    scene.add(rig.group);
    npcs.push({ rig, name: d.name, target: new THREE.Vector3(x, 0, z), wait: Math.random() * 2 });
    setAnim(rig, 'idle');
  });
}

function initThree() {
  const canvas = $('gameCanvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x140a26);
  scene.fog = new THREE.Fog(0x140a26, 22, 42);
  camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
  camera.position.set(0, 4, 10);
  clock = new THREE.Clock();
  scene.add(new THREE.HemisphereLight(0xcdb8ff, 0x1a0f2e, 0.9));
  const sun = new THREE.DirectionalLight(0xffe9a8, 1.6);
  sun.position.set(8, 12, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -18; sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18; sun.shadow.camera.bottom = -18;
  scene.add(sun);
  const warm = new THREE.PointLight(0xff8a3d, 25, 18, 1.8); warm.position.set(0, 3.6, -6); scene.add(warm);
  buildHall(); buildNPCs();
  // người chơi
  playerRig = makeHuman({ shirt: 0x3f7fd0, pants: 0x2b2b3d, hair: 0x1a1a1a, acc: 'cap' });
  playerRig.group.position.set(0, 0, 5);
  const ptag = textSprite('Bạn', 0.9); ptag.position.set(0, 2.35, 0); playerRig.group.add(ptag);
  scene.add(playerRig.group);
  player = playerRig.group;
  setAnim(playerRig, 'idle');
  resize();
  window.addEventListener('resize', resize);
  window.__thamtuStarted = true;
}
function resize() {
  const box = $('gameContainer').getBoundingClientRect();
  const w = Math.max(320, box.width), h = Math.max(320, box.height);
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}

/* ================= ĐIỀU KHIỂN THIRD-PERSON ================= */
function updatePlayer(dt) {
  if (!state.started || state.visitMode) {
    const want = state.visitMode ? 'sit' : 'idle';
    if (playerRig.anim !== want) setAnim(playerRig, want);
    return;
  }
  let ix = 0, iz = 0;
  if (keys['KeyW'] || keys['ArrowUp']) iz -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) iz += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) ix -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) ix += 1;
  ix += joy.x; iz += joy.y;
  // tự chạy tới ô kính khi bấm thẻ idol
  if (state.autoWalkTo) {
    const dx = state.autoWalkTo.x - player.position.x;
    const dz = state.autoWalkTo.z - player.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.6) { state.autoWalkTo = null; }
    else { ix = dx / d; iz = dz / d; }
  }
  const len = Math.hypot(ix, iz);
  const running = keys['ShiftLeft'] || keys['ShiftRight'];
  const speed = running ? 6.2 : 3.4;
  if (len > 0.01) {
    ix /= Math.max(1, len); iz /= Math.max(1, len);
    // hướng di chuyển theo góc camera (yaw)
    const sin = Math.sin(cam.yaw), cos = Math.cos(cam.yaw);
    const wx = ix * cos - iz * sin;
    const wz = ix * sin + iz * cos;
    player.position.x += wx * speed * dt;
    player.position.z += wz * speed * dt;
    const targetYaw = Math.atan2(wx, wz);
    player.rotation.y = lerpAngle(player.rotation.y, targetYaw, 1 - Math.exp(-12 * dt));
    playerRig.speed = speed;
    if (playerRig.anim === 'idle' || playerRig.anim === 'walk') setAnim(playerRig, 'walk');
  } else {
    playerRig.speed = 0;
    if (playerRig.anim === 'walk') setAnim(playerRig, 'idle');
  }
  // va chạm: biên sảnh + cột + bàn ô kính
  player.position.x = clamp(player.position.x, -HALL.x + 0.8, HALL.x - 0.8);
  player.position.z = clamp(player.position.z, -HALL.z + 1.8, HALL.z - 0.8);
  for (const o of obstacles) {
    const dx = player.position.x - o.x, dz = player.position.z - o.z;
    const d = Math.hypot(dx, dz);
    if (d < o.r + 0.45 && d > 0.001) {
      player.position.x = o.x + (dx / d) * (o.r + 0.45);
      player.position.z = o.z + (dz / d) * (o.r + 0.45);
    }
  }
}
function updateCamera(dt) {
  let targetPos, lookAt;
  if (state.visitMode && state.currentIdol) {
    const info = idolRigs[state.currentIdol.id];
    const bx = info ? info.boothX : 0;
    targetPos = new THREE.Vector3(bx, 2.1, -3.4);
    lookAt = new THREE.Vector3(bx, 1.4, -HALL.z - 1);
  } else {
    const dist = cam.dist;
    const cx = player.position.x - Math.sin(cam.yaw) * Math.sin(cam.pitch) * 0 + Math.sin(cam.yaw) * dist * Math.cos(cam.pitch);
    const cz = player.position.z + Math.cos(cam.yaw) * dist * Math.cos(cam.pitch);
    const cy = 1.6 + Math.sin(cam.pitch) * dist + 1.2;
    targetPos = new THREE.Vector3(cx, cy, cz);
    lookAt = new THREE.Vector3(player.position.x, 1.5, player.position.z);
  }
  camera.position.x = damp(camera.position.x, targetPos.x, 6, dt);
  camera.position.y = damp(camera.position.y, targetPos.y, 6, dt);
  camera.position.z = damp(camera.position.z, targetPos.z, 6, dt);
  camera.lookAt(lookAt);
}
function updateNPCs(dt) {
  for (const n of npcs) {
    if (n.wait > 0) { n.wait -= dt; setAnim(n.rig, 'idle'); continue; }
    const p = n.rig.group.position;
    const dx = n.target.x - p.x, dz = n.target.z - p.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.4) {
      n.wait = 1 + Math.random() * 3;
      n.target.set((Math.random() * 2 - 1) * 11, 0, (Math.random() * 2 - 1) * 7);
      if (n.rig.anim === 'walk') setAnim(n.rig, 'idle');
    } else {
      n.rig.speed = 2;
      if (n.rig.anim === 'idle' || n.rig.anim === 'walk') setAnim(n.rig, 'walk');
      p.x += (dx / d) * 1.8 * dt; p.z += (dz / d) * 1.8 * dt;
      n.rig.group.rotation.y = lerpAngle(n.rig.group.rotation.y, Math.atan2(dx, dz), 1 - Math.exp(-8 * dt));
    }
    updateRig(n.rig, dt);
  }
}
function nearestBooth() {
  let best = null, bd = 1e9;
  for (const b of booths) {
    if (!b.idolId) continue;
    const fx = b.frontX, fz = b.frontZ;
    const d = Math.hypot(player.position.x - fx, player.position.z - fz);
    if (d < bd) { bd = d; best = b; }
  }
  return bd < 2.6 ? { booth: best, dist: bd } : null;
}
function nearestNPC() {
  let best = null, bd = 1e9;
  for (const n of npcs) {
    const p = n.rig.group.position;
    const d = Math.hypot(p.x - player.position.x, p.z - player.position.z);
    if (d < bd) { bd = d; best = n; }
  }
  return bd < 5 ? best : null;
}

/* ================= VÒNG LẶP GAME ================= */
let lastNear = null;
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  fpsFrames++; fpsTime += dt;
  if (fpsTime >= 1) { $('fpsChip').textContent = Math.round(fpsFrames / fpsTime) + ' FPS'; fpsFrames = 0; fpsTime = 0; }
  updatePlayer(dt);
  updateCamera(dt);
  updateNPCs(dt);
  updateRig(playerRig, dt);
  for (const id in idolRigs) updateRig(idolRigs[id].rig, dt);
  // đồ bay tới idol
  for (let i = flyItems.length - 1; i >= 0; i--) {
    const f = flyItems[i]; f.t += dt / 0.9;
    if (f.t >= 1) { scene.remove(f.mesh); flyItems.splice(i, 1); continue; }
    f.mesh.position.lerpVectors(f.from, f.to, f.t);
    f.mesh.position.y += Math.sin(f.t * Math.PI) * 1.2;
    f.mesh.rotation.y += dt * 6;
  }
  // nhắc vào thăm khi tới gần ô kính
  if (state.started && !state.visitMode) {
    const near = nearestBooth();
    lastNear = near;
    if (near) {
      const d = IDOLS.find(x => x.id === near.booth.idolId);
      $('nearPromptText').textContent = 'Tới gần ô kính ' + d.name + ' ' + d.emoji + ' — bấm E để vào thăm';
      $('nearPrompt').hidden = false;
    } else $('nearPrompt').hidden = true;
  } else $('nearPrompt').hidden = true;
  renderer.render(scene, camera);
}

/* ================= PHÒNG THĂM 3D ================= */
function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function openVisit(id) {
  const d = IDOLS.find(x => x.id === id); if (!d) return;
  state.currentIdol = d; state.visitMode = true; state.visitSeconds = 180; state.visitPoints = 0; state.sentCount = 0;
  const info = idolRigs[id];
  if (info) { // người chơi ngồi trước ô kính, idol quay mặt lại
    player.position.set(info.boothX, 0, -HALL.z + 2.6);
    player.rotation.y = Math.PI;
    setAnim(playerRig, 'sit');
    setAnim(info.rig, 'wave', 2.5);
    info.rig.group.rotation.y = 0;
  }
  $('visitTitle').textContent = 'Phòng thăm — ' + d.name + ' ' + d.emoji;
  $('visitStatus').textContent = d.real + ' • ' + d.status + ' (Parody hư cấu)';
  $('speechBubble').textContent = d.name + ': ' + d.lines[0];
  showSpeech3d(d.name + ': ' + d.lines[0], 4000);
  $('visitTimer').textContent = fmt(state.visitSeconds);
  $('visitPoints').textContent = '0'; $('sentCount').textContent = '0';
  $('chatLog').innerHTML = '<div class="chat-msg idol"><b>' + d.name + ':</b> Chào em! Vào thăm anh/chị là vui rồi. Bấm vào idol 3D hoặc gõ câu hỏi nhé!</div>';
  $('gameTitle').textContent = '🎮 Mini-game: ' + d.game;
  $('gameDesc').textContent = d.gameDesc;
  $('gameArea').innerHTML = '<p class="fine">Bấm “Chơi mini-game” để bắt đầu. Chơi xong được cộng điểm thăm nuôi.</p>';
  $('gameScore').textContent = '0'; $('gameTime').textContent = '—'; $('gameResult').hidden = true;
  $('quickAsk').innerHTML = ['Hôm nay idol khỏe không?', 'Idol có nhớ nhà không?', 'Khi nào idol ra tù?', 'Idol thích ăn gì nhất?'].map(q => '<button type="button">' + q + '</button>').join('');
  document.querySelectorAll('#quickAsk button').forEach(b => b.addEventListener('click', () => { $('chatInput').value = b.textContent; sendChat(); }));
  renderGifts();
  $('visitScreen').classList.add('active');
  $('visitScreen').scrollIntoView({ behavior: 'smooth', block: 'start' });
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.visitSeconds -= 1;
    if (state.visitSeconds <= 0) { endVisit('Hết giờ thăm!'); return; }
    $('visitTimer').textContent = fmt(state.visitSeconds);
  }, 1000);
  bumpStreak(); updateHeader();
  toast('🚪 Bạn đã vào phòng thăm ' + d.name + ' — bấm vào idol 3D để chào!');
}
function closeVisit() {
  state.visitMode = false; state.currentIdol = null;
  clearInterval(state.timerId); stopGame();
  setAnim(playerRig, 'idle');
  $('visitScreen').classList.remove('active');
  $('gameContainer').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function endVisit(reason) {
  clearInterval(state.timerId); stopGame();
  const d = state.currentIdol; if (!d) return;
  state.visited.add(d.id); state.missions.visit1 = true; save();
  updateHeader(); renderIdols(); renderMissions(); renderLeaderboard();
  drawCertificate(d);
  $('speechBubble').textContent = reason + ' ' + d.name + ': Cảm ơn em đã vào thăm! Hẹn em lần sau nhé!';
  showSpeech3d(d.name + ': Cảm ơn em đã vào thăm!', 3500);
  toast('📜 ' + reason + ' Đã cấp giấy chứng nhận thăm nuôi cho ' + d.name + '!');
}
function renderGifts() {
  $('giftsRow').innerHTML = GIFTS.map((g, i) => '<button class="gift-btn" data-i="' + i + '">' + g.emoji + ' ' + g.name + '<br><small>+' + g.pts + 'đ • +' + g.secs + 's</small></button>').join('');
  document.querySelectorAll('.gift-btn').forEach(b => b.addEventListener('click', () => sendGift(+b.dataset.i)));
}
function sendGift(i) {
  const g = GIFTS[i]; const d = state.currentIdol; if (!d) return;
  state.sentCount += 1; state.giftsSentToday += 1;
  $('sentCount').textContent = state.sentCount;
  state.visitSeconds = Math.min(300, state.visitSeconds + g.secs);
  $('visitTimer').textContent = fmt(state.visitSeconds);
  addPoints(g.pts);
  // đồ bay trong cảnh 3D từ người chơi tới idol
  const info = idolRigs[d.id];
  if (info) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), mat(g.color));
    mesh.position.copy(player.position).add(new THREE.Vector3(0, 1.4, 0));
    scene.add(mesh);
    flyItems.push({ mesh, from: mesh.position.clone(), to: new THREE.Vector3(info.boothX, 1.4, -HALL.z - 0.6), t: 0 });
    setAnim(info.rig, 'wave', 2);
    showSpeech3d(d.name + ': Cảm ơn em đã gửi ' + g.name + ' ' + g.emoji + '! Ngon lắm!', 3000);
  }
  $('speechBubble').textContent = d.name + ': Cảm ơn em đã gửi ' + g.name + ' ' + g.emoji + '! Ngon lắm!';
  if (state.giftsSentToday >= 3) { state.missions.gift3 = true; save(); renderMissions(); }
  renderLeaderboard();
}
let lineIdx = 0;
function tapIdol() {
  const d = state.currentIdol; if (!d) return;
  const info = idolRigs[d.id];
  lineIdx = (lineIdx + 1) % d.lines.length;
  const line = d.name + ': ' + d.lines[lineIdx];
  $('speechBubble').textContent = line;
  showSpeech3d(line, 3500);
  if (info) setAnim(info.rig, d.id === 'kha' ? 'fan' : 'wave', 2.5);
  addPoints(1);
}
function idolReply(text) {
  const d = state.currentIdol; if (!d) return '…';
  const t = text.toLowerCase();
  for (const c of d.chat) if (c.keys.some(k => t.includes(k))) return c.reply;
  const generic = ['Câu này hay đó! Nhưng ở đây anh/chị chỉ trả lời được mấy chuyện đời thường thôi.', 'Em hỏi khó quá! Hỏi anh/chị về ăn, làm, tiền, nhớ nhà đi!', 'Ừ, anh/chị nghe rồi. Em thăm anh/chị thế này là quý lắm!'];
  return generic[Math.floor(Math.random() * generic.length)];
}
function sendChat() {
  const inp = $('chatInput'); const text = inp.value.trim(); if (!text || !state.currentIdol) return;
  $('chatLog').innerHTML += '<div class="chat-msg you"><b>Bạn:</b> ' + text.replace(/</g, '&lt;') + '</div>';
  inp.value = ''; state.chatCount += 1;
  if (state.chatCount >= 3) { state.missions.chat3 = true; save(); renderMissions(); }
  $('chatLog').innerHTML += '<div class="chat-msg idol" id="typingMsg"><b>' + state.currentIdol.name + ':</b> <i>đang gõ…</i></div>';
  $('chatLog').scrollTop = $('chatLog').scrollHeight;
  setTimeout(() => {
    const tm = $('typingMsg'); if (tm) tm.outerHTML = '<div class="chat-msg idol"><b>' + state.currentIdol.name + ':</b> ' + idolReply(text) + '</div>';
    $('chatLog').scrollTop = $('chatLog').scrollHeight;
  }, 700);
}

/* ================= GIẤY CHỨNG NHẬN ================= */
function drawCertificate(d) {
  const c = $('certCanvas'), ctx = c.getContext('2d');
  ctx.fillStyle = '#fff8e6'; ctx.fillRect(0, 0, 640, 400);
  ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 6; ctx.strokeRect(10, 10, 620, 380);
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
  ctx.beginPath(); ctx.arc(520, 320, 42, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,30,30,.85)'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ĐÃ THĂM', 520, 316); ctx.fillText('PARODY', 520, 334);
}
function screenshot() {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = 'tham-tu-3d-' + Date.now() + '.png';
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
  toast('📸 Đã chụp ảnh kỷ niệm 3D!');
}

/* ================= MINI-GAME (giữ từ bản cũ, gắn vào phòng thăm 3D) ================= */
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
  $('gameArea').innerHTML = '<p>Bấm <b>MÚA!</b> đúng lúc vòng vàng sáng lên!</p><div class="rhythm-ring" id="ring">🪭</div><button class="btn primary" id="rhythmBtn">💃 MÚA!</button>';
  $('gameTime').textContent = left + 's';
  const info = idolRigs.kha;
  const beat = setInterval(() => {
    if (!state.gameActive) { clearInterval(beat); return; }
    canHit = true; const ring = $('ring'); if (ring) ring.classList.add('hit');
    if (info) setAnim(info.rig, 'fan', 0.6);
    setTimeout(() => { canHit = false; const r2 = $('ring'); if (r2) r2.classList.remove('hit'); }, 320);
  }, 900);
  $('rhythmBtn').addEventListener('click', () => {
    if (!state.gameActive) return;
    if (canHit) { state.gameScore += 10; $('speechBubble').textContent = 'Khá Bảnh: Đúng nhịp rồi! Múa đẹp quá!'; }
    else state.gameScore += 1;
    $('gameScore').textContent = state.gameScore;
  });
  state.gameTimerId = setInterval(() => { left -= 1; $('gameTime').textContent = left + 's'; if (left <= 0) { clearInterval(beat); finishGame('Hết giờ múa quạt! Bạn được ' + state.gameScore + ' điểm.'); } }, 1000);
}
function startQuiz() {
  let qi = 0, left = 30;
  const showQ = () => {
    if (qi >= QUIZ.length) { finishGame('Hết 3 câu đạo lý! Bạn được ' + state.gameScore + ' điểm.'); return; }
    const q = QUIZ[qi];
    $('gameArea').innerHTML = '<p><b>Câu ' + (qi + 1) + '/3:</b> ' + q.q + '</p>' + q.opts.map((o, i) => '<button class="quiz-opt" data-i="' + i + '">' + o + '</button>').join('');
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
  $('gameArea').innerHTML = '<canvas id="catchCanvas" width="420" height="220"></canvas><p>Dùng ← → hoặc kéo tay trên canvas để hứng đồ ăn!</p>';
  const cv = $('catchCanvas'), ctx = cv.getContext('2d');
  let bx = 190, left = 20; const items = [];
  const foods = ['🍜', '🥚', '🌭', '🥤', '🍗'];
  const move = (x) => { const r = cv.getBoundingClientRect(); bx = clamp((x - r.left) / r.width * 420 - 30, 0, 360); };
  cv.addEventListener('pointermove', e => move(e.clientX));
  cv.addEventListener('pointerdown', e => move(e.clientX));
  const keyH = (e) => { if (e.key === 'ArrowLeft') bx = Math.max(0, bx - 24); if (e.key === 'ArrowRight') bx = Math.min(360, bx + 24); };
  document.addEventListener('keydown', keyH);
  const tick2 = setInterval(() => {
    if (!state.gameActive) { clearInterval(tick2); document.removeEventListener('keydown', keyH); return; }
    if (Math.random() < 0.35) items.push({ x: Math.random() * 380, y: 0, e: foods[Math.floor(Math.random() * foods.length)] });
    ctx.clearRect(0, 0, 420, 220); ctx.font = '26px serif';
    items.forEach(it => { it.y += 4; ctx.fillText(it.e, it.x, it.y); });
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (it.y > 185 && it.x > bx - 10 && it.x < bx + 70) { state.gameScore += 10; $('gameScore').textContent = state.gameScore; items.splice(i, 1); }
      else if (it.y > 220) items.splice(i, 1);
    }
    ctx.font = '34px serif'; ctx.fillText('🧺', bx, 215);
  }, 50);
  $('gameTime').textContent = left + 's';
  state.gameTimerId = setInterval(() => { left -= 1; $('gameTime').textContent = left + 's'; if (left <= 0) { clearInterval(tick2); document.removeEventListener('keydown', keyH); finishGame('Hết giờ hứng đồ ăn! Bạn được ' + state.gameScore + ' điểm.'); } }, 1000);
}
function startLivestream() {
  let left = 15, views = 0;
  $('gameArea').innerHTML = '<p>👀 <b id="liveViews">0</b> người đang xem <em>(minh họa)</em></p><button class="tap-big" id="liveTap">🔴 BẤM ĐỂ TĂNG VIEW</button><p class="fine">Né nút “BỊ REPORT” màu đỏ — bấm nhầm mất 200 view!</p>';
  const spawnReport = () => {
    if (!state.gameActive) return;
    const old = document.querySelector('.report-btn'); if (old) old.remove();
    const b = document.createElement('button'); b.className = 'report-btn'; b.textContent = '⚠️ BỊ REPORT';
    b.style.left = (10 + Math.random() * 70) + '%'; b.style.top = (10 + Math.random() * 60) + '%';
    b.addEventListener('click', (e) => { e.stopPropagation(); views = Math.max(0, views - 200); $('liveViews').textContent = views.toLocaleString('vi-VN'); b.remove(); });
    $('gameArea').appendChild(b);
    setTimeout(() => b.remove(), 1100);
    setTimeout(spawnReport, 1800 + Math.random() * 800);
  };
  setTimeout(spawnReport, 1200);
  $('liveTap').addEventListener('click', () => {
    if (!state.gameActive) return;
    views += 50 + Math.floor(Math.random() * 100); state.gameScore = Math.floor(views / 50);
    $('liveViews').textContent = views.toLocaleString('vi-VN'); $('gameScore').textContent = state.gameScore;
  });
  $('gameTime').textContent = left + 's';
  state.gameTimerId = setInterval(() => { left -= 1; $('gameTime').textContent = left + 's'; if (left <= 0) finishGame('Livestream kết thúc! Bạn kéo được ' + views.toLocaleString('vi-VN') + ' view (minh họa).'); }, 1000);
}

/* ================= LOBBY UI (thẻ idol, nhiệm vụ, bảng vàng) ================= */
function renderIdols() {
  $('idolGrid').innerHTML = IDOLS.map(d => `
    <article class="idol-card ${state.visited.has(d.id) ? 'visited' : ''}" data-id="${d.id}" tabindex="0" role="button" aria-label="Thăm ${d.name}">
      <div class="idol-emoji">${d.emoji}</div>
      <h3>${d.name}</h3>
      <span class="tag">${d.tag}</span>
      <p>${d.desc}</p>
      <p class="fine">${d.status}</p>
      <p class="fine">🎮 ${d.game} • ${state.visited.has(d.id) ? '✅ Đã thăm' : 'Chưa thăm'}</p>
      <button class="btn primary visit-btn">🏃 Chạy tới ô kính →</button>
    </article>`).join('');
  document.querySelectorAll('.idol-card').forEach(c => {
    const go = () => {
      const info = idolRigs[c.dataset.id];
      if (!info) return;
      state.autoWalkTo = { x: info.boothX, z: -HALL.z + 2.6 };
      $('gameContainer').scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('🏃 Nhân vật của bạn đang chạy tới ô kính ' + IDOLS.find(x => x.id === c.dataset.id).name + '…');
      if (!state.started) { state.started = true; $('startScreen').style.display = 'none'; }
    };
    c.addEventListener('click', go);
    c.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
}
const MISSIONS = [
  { id: 'visit1', text: 'Thăm 1 idol hôm nay', check: () => state.visited.size > 0 },
  { id: 'gift3', text: 'Gửi 3 món đồ thăm nuôi', check: () => state.giftsSentToday >= 3 },
  { id: 'game1', text: 'Chơi 1 mini-game', check: () => state.gamesPlayed >= 1 },
  { id: 'chat3', text: 'Chat với idol 3 câu', check: () => state.chatCount >= 3 }
];
function renderMissions() {
  $('missionsList').innerHTML = MISSIONS.map(m => {
    const done = m.check() || !!state.missions[m.id];
    return '<li class="' + (done ? 'done' : '') + '">' + (done ? '✅' : '⭕') + ' ' + m.text + '</li>';
  }).join('');
}
function renderLeaderboard() {
  const rows = [['FanCuong99', 1280], ['ThamNuoiMoiNgay', 940], ['MeKhaBanh', 720], ['SkyOi', 610], ['Bạn', state.points]];
  $('leaderboardList').innerHTML = rows.map(r => '<li><b>' + r[0] + '</b> — ' + r[1].toLocaleString('vi-VN') + ' điểm</li>').join('');
}

/* ================= INPUT: bàn phím, chuột, joystick, raycast ================= */
function bindInput() {
  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.code === 'KeyE' && state.started && !state.visitMode && lastNear) openVisit(lastNear.booth.idolId);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  });
  document.addEventListener('keyup', (e) => { keys[e.code] = false; });

  const canvas = $('gameCanvas');
  let dragging = false, lastX = 0, lastY = 0, dragMoved = 0, downPos = null;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; dragMoved = 0; downPos = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY; dragMoved += Math.abs(dx) + Math.abs(dy);
    cam.yaw -= dx * 0.005;
    cam.pitch = clamp(cam.pitch + dy * 0.004, 0.08, 1.1);
  });
  canvas.addEventListener('pointerup', (e) => {
    dragging = false;
    // bấm (không kéo) vào idol 3D trong phòng thăm -> chào idol
    if (downPos && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) < 8 && state.visitMode) {
      const r = canvas.getBoundingClientRect();
      pointerNDC.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(Object.values(idolRigs).map(o => o.rig.group), true);
      if (hits.length) tapIdol();
    }
    downPos = null;
  });
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.dist = clamp(cam.dist + e.deltaY * 0.01, 4, 11); }, { passive: false });

  // Joystick ảo
  const joyEl = $('joystick'), knob = $('joyKnob');
  const setKnob = (dx, dy) => { knob.style.left = (35 + dx) + 'px'; knob.style.top = (35 + dy) + 'px'; };
  joyEl.addEventListener('pointerdown', (e) => { joy.active = true; joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); });
  joyEl.addEventListener('pointermove', (e) => {
    if (!joy.active || e.pointerId !== joy.id) return;
    const r = joyEl.getBoundingClientRect();
    let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    joy.x = dx; joy.y = dy; setKnob(dx * 35, dy * 35);
  });
  const endJoy = () => { joy.active = false; joy.x = 0; joy.y = 0; setKnob(0, 0); };
  joyEl.addEventListener('pointerup', endJoy);
  joyEl.addEventListener('pointercancel', endJoy);

  $('enterGameBtn').addEventListener('click', () => {
    const name = ($('playerNameInput').value || 'Bạn').trim().slice(0, 20) || 'Bạn';
    state.started = true;
    $('startScreen').style.display = 'none';
    toast('🎮 Chào ' + name + '! Dùng WASD để đi dạo sảnh 3D, tới gần ô kính rồi bấm E nhé!');
    bumpStreak(); updateHeader();
  });
  $('reloadBtn').addEventListener('click', () => location.reload());
  $('helpBtn').addEventListener('click', () => { document.querySelector('.help-list').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  $('takeTicketBtn').addEventListener('click', () => {
    state.queueNum += 1;
    state.ticket = 'A-' + String(state.queueNum).padStart(3, '0');
    $('ticketNumber').textContent = state.ticket;
    toast('🎟️ Bạn đã lấy số ' + state.ticket + '! Đi dạo sảnh chờ tới lượt nhé.');
  });
  $('nearVisitBtn').addEventListener('click', () => { if (lastNear) openVisit(lastNear.booth.idolId); });
  $('interactBtn').addEventListener('click', () => { if (lastNear && !state.visitMode) openVisit(lastNear.booth.idolId); else if (state.visitMode) tapIdol(); });
  $('waveBtn').addEventListener('click', () => {
    setAnim(playerRig, 'wave', 2);
    const n = nearestNPC();
    if (n) { setAnim(n.rig, 'wave', 2); toast('👋 Bạn vẫy tay chào ' + n.name + ' — ' + n.name + ' vẫy lại bạn!'); addPoints(1); }
    else toast('👋 Bạn vẫy tay… chưa ai ở gần để chào lại!');
  });
  $('bowBtn').addEventListener('click', () => {
    setAnim(playerRig, 'bow', 2);
    const n = nearestNPC();
    toast(n ? '🙏 Bạn chắp tay chào ' + n.name + ' — ' + n.name + ' chắp tay đáp lễ!' : '🙏 Bạn chắp tay chào cả sảnh!');
    if (n) addPoints(1);
  });
  $('sitBtn').addEventListener('click', () => {
    if (playerRig.anim === 'sit') { setAnim(playerRig, 'idle'); toast('🧍 Bạn đứng dậy, sẵn sàng vào thăm!'); }
    else { setAnim(playerRig, 'sit'); toast('🪑 Bạn ngồi xuống ghế chờ, thở một hơi…'); }
  });
  $('photoBtn').addEventListener('click', screenshot);
  $('greetIdolBtn').addEventListener('click', tapIdol);
  $('idolFanBtn').addEventListener('click', () => {
    const d = state.currentIdol; if (!d) return;
    const info = idolRigs[d.id];
    if (info) setAnim(info.rig, 'fan', 3);
    const line = d.name + ': ' + (d.id === 'kha' ? 'Múa quạt nè! Xem cho kỹ nhé!' : 'Biểu diễn một điệu cho em xem nè!');
    $('speechBubble').textContent = line; showSpeech3d(line, 3000);
  });
  $('backToLobbyBtn').addEventListener('click', () => { if (state.currentIdol) endVisit('Buổi thăm kết thúc.'); closeVisit(); });
  $('endVisitBtn').addEventListener('click', () => { if (state.currentIdol) { endVisit('Buổi thăm kết thúc.'); closeVisit(); } });
  $('chatSendBtn').addEventListener('click', sendChat);
  $('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
  $('gameStartBtn').addEventListener('click', startGame);
  $('downloadCertBtn').addEventListener('click', () => {
    if (!state.currentIdol) { toast('Vào thăm 1 idol rồi kết thúc buổi thăm để có giấy chứng nhận nhé!'); return; }
    drawCertificate(state.currentIdol);
    const a = document.createElement('a'); a.download = 'giay-chung-nhan-tham-nuoi.png'; a.href = $('certCanvas').toDataURL('image/png'); a.click();
  });
  $('photoVisitBtn').addEventListener('click', () => {
    screenshot();
    $('photoFeedback').hidden = false; setTimeout(() => { $('photoFeedback').hidden = true; }, 2500);
  });
  $('shareBtn').addEventListener('click', async () => {
    const text = '🎟️ THẺ THĂM NUÔI (Parody)\nTôi đã thăm ' + state.visited.size + '/4 idol • ' + state.points + ' điểm • Streak ' + state.streak + ' ngày\nVào Tù Thăm Idol 3D — web parody giải trí hư cấu, không phải thăm thật.';
    try { await navigator.clipboard.writeText(text); } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    $('shareFeedback').hidden = false; setTimeout(() => { $('shareFeedback').hidden = true; }, 2500);
  });
  $('copyLinkBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); } catch (e) {}
    const f = $('shareFeedback'); f.hidden = false; f.textContent = 'Đã sao chép link web!';
    setTimeout(() => { f.hidden = true; f.textContent = 'Đã sao chép!'; }, 2500);
  });
  // số liệu mô phỏng, ghi rõ là minh họa
  setInterval(() => {
    $('onlineCount').textContent = (1200 + Math.floor(Math.random() * 180)).toLocaleString('vi-VN');
  }, 5000);
}

/* ================= KHỞI ĐỘNG ================= */
try {
  initThree();
  bindInput();
  bumpStreak();
  updateHeader(); renderIdols(); renderMissions(); renderLeaderboard();
  tick();
} catch (err) {
  console.error(err);
  const el = $('webglError'); if (el) el.hidden = false;
  const ss = $('startScreen'); if (ss) ss.style.display = 'none';
}
