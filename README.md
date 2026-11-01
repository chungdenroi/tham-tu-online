# Vào Tù Thăm Idol — GAME NHẬP VAI 3D Phòng thăm nuôi online (Parody)

Game nhập vai (RPG) 3D thật bằng **Three.js 0.160.0 bundle TRONG REPO** (`vendor/three.module.js`,
không phụ thuộc CDN). Nhân vật là **file GLB rigged thật có skeleton + clip animation** (không còn
nhân vật ghép hộp/sphere — bản đó đã bị loại bỏ), chạy bằng `GLTFLoader` + `THREE.AnimationMixer`
với crossfade thật giữa Idle/Walk/Run/Wave/Sit.

## Chạy local
```bash
cd tham-tu-online
python3 -m http.server 8899
# mở http://127.0.0.1:8899/
```
Không cần mạng: Three.js, GLTFLoader, SkeletonUtils và toàn bộ nhân vật GLB đều nằm trong repo.
Mở trực tiếp `index.html` bằng file:// sẽ không chạy được (module ES cần HTTP).

## Cách chơi (UI kiểu game nhập vai RPG)
- **Màn hình vào game:** chọn nhân vật (Sam / Matt / Shaun), nhập tên, bấm **Bắt đầu phiêu lưu**.
- **HUD kiểu game:** thanh năng lượng thăm nuôi (máu), thanh XP + cấp bậc, vàng/điểm, **minimap sảnh**
  (vị trí mình + 4 ô idol + NPC), đồng hồ nhiệm vụ.
- **Đi dạo sảnh 3D:** WASD / mũi tên theo hướng camera, Shift chạy, kéo chuột xoay camera,
  lăn chuột zoom. Điện thoại: joystick góc trái để đi, kéo 1 ngón tay để xoay camera.
- **Hộp thoại NPC kiểu RPG:** tới gần idol/NPC sẽ hiện khung thoại dưới màn hình (tên nhân vật,
  avatar, 2–3 lựa chọn trả lời — mỗi lựa chọn idol đáp khác nhau).
- **Vào thăm:** đi tới gần ô kính có tên idol, hiện nút “Vào thăm” thì bấm **E** (hoặc chạm nút).
  Trong phòng thăm: bấm trực tiếp vào idol 3D để idol quay lại, vẫy tay, nói chuyện.
- **Túi đồ thăm nuôi:** mì tôm / trứng lộn / xúc xích / nước ngọt dạng ô đồ game, có số lượng,
  bấm để tặng idol (đồ bay tới idol trong cảnh 3D, mỗi món cộng điểm).
- **Quest log:** nhiệm vụ ngày + streak + đã thăm x/4, xong nhiệm vụ được thưởng điểm.
- **Chat / mini-game:** chat hỏi đáp đạo lý parody, mini-game riêng từng idol:
  Khá Bảnh múa quạt theo nhịp, Huấn Hoa Hồng trắc nghiệm đạo lý,
  Trường Con hứng đồ ăn rơi, Khánh Sky livestream tăng view.
- **Người khác trong sảnh:** NPC 3D đi lại ngẫu nhiên, bấm 👋 để vẫy tay, người gần nhất vẫy lại.
- **Khác:** lấy số xếp hàng, bảng vàng (mô phỏng), giấy chứng nhận thăm nuôi tải PNG,
  chụp ảnh kỷ niệm 3D (📸).

## Chống lỗi 3D (rút kinh nghiệm test trình duyệt thật bản v2 — canvas đen)
- Kiểm tra WebGL **trước** khi tạo renderer; phân biệt rõ 3 nguyên nhân và log vào
  `window.__thamtu3DError = { stage, message }`: `webgl` (trình duyệt chưa bật WebGL),
  `three-load` (không tải được thư viện local), `model-load` (không tải được file GLB).
- Lỗi 3D chỉ hiện **banner nhỏ ở đầu khung game**, KHÔNG che nút — vẫn chơi được bản chữ
  (chọn idol, vào thăm, chat, tặng quà, mini-game) và có nút “Thử lại 3D” / “Chơi bản chữ”.
- Canvas có kích thước thật nhờ `ResizeObserver` trên khung game + `resize()` sau khi DOM sẵn sàng.

## Nhân vật 3D rigged (file GLB trong `models/`, ~16 MB)
| Nhân vật trong game | File GLB | Clip animation thật trong file |
|---|---|---|
| Người chơi (Sam / Matt / Shaun — chọn ở màn hình vào game) | `sam.glb` / `matt.glb` / `shaun.glb` | Death, Duck, HitReact, Idle, Idle_Gun, Jump, Jump_Idle, Jump_Land, No, Punch, Run, Run_Gun, Run_Slash, Run_Stab, Slash, Stab, Walk, Walk_Gun, Wave, Yes (20 clip) |
| Khá Bảnh 🕺 (quạt vàng gắn xương tay phải) | `matt.glb` | như trên |
| Huấn Hoa Hồng 🌹 (hoa hồng gắn xương ngực) | `shaun.glb` | như trên |
| Trường Con 🍜 (bát mì gắn xương tay trái, áo tô cam vật liệu Main) | `soldier-male.glb` | Death, Defeat, Idle, Jump, PickUp, Punch, RecieveHit, Roll, Run, Run_Carry, Shoot_OneHanded, SitDown, StandUp, SwordSlash, Victory, Walk, Walk_Carry (17 clip) |
| Khánh Sky 👑 (vương miện vàng gắn xương đầu, cao 2.23m) | `sam.glb` (tái dùng — từ v5.4, thay knight) | 20 clip như Sam |
| NPC / người ngồi sau kính | `lis.glb`, `casual-female.glb`, `soldier-female.glb` (+ clone Sam/Matt/Shaun) | Lis: 20 clip như Sam; Casual/Soldier-F: 17 clip như Soldier |

- Chuẩn hoá nhân vật bằng `Box3.setFromObject()` sau khi load (không đo bbox thô của file):
  scale để cao đúng chiều cao thiết kế (1.66–1.86 m), chân chạm đất y=0.
- Phụ kiện gắn vào **xương thật** tìm theo tên (`Head`, `LowerArmR`/`FistR`, `LowerArmL`, `Torso`).
- Tô áo cam chỉ áp cho vật liệu **không có texture** (`Main` của Soldier) — model dùng texture
  atlas (Sam/Matt/Shaun/Lis) không tô vì sẽ làm da cũng cam theo; phân biệt bằng phụ kiện,
  chiều cao, tên sprite trên đầu.
- Clip dùng trong game: Idle (đứng yên), Walk (đi), Run (Shift chạy), Wave (vẫy tay/chào),
  SitDown/Duck (ngồi), Victory/Wave (múa quạt/biểu diễn), Yes (chắp tay chào).
  Model nào thiếu clip thì tự động dùng clip thay thế gần nhất (đã map sẵn trong `CLIP_PATS`).

## Nguồn + giấy phép nhân vật
- **Quaternius qua Cinevva — CC0** (`https://app.cinevva.com/game-assets/free-3d-character-models`):
  `sam.glb`, `matt.glb`, `shaun.glb`, `lis.glb`, `soldier-male.glb`,
  `casual-female.glb`, `soldier-female.glb` — nhân vật gốc Quaternius, phân phối CC0 qua Cinevva
  (lưu ý: Quaternius hiện công bố giấy phép QAL v1.0 cho tài sản mới — miễn phí dùng cho game
  cá nhân/thương mại/giáo dục, không cần ghi nguồn, không được bán lại tài sản gốc dạng độc lập).
- **Khánh Sky đổi model từ v5.4:** `knight-golden-male.glb` còn nằm trong `models/` nhưng KHÔNG dùng
  nữa — mũ giáp hiệp sĩ là hình học Armor của cùng 1 mesh skinned duy nhất, không tách riêng được,
  không có mặt người bên dưới nên idol này không bao giờ thấy mặt. Từ v5.4 Khánh Sky tái dùng
  `sam.glb` (mặt người thấy rõ), phân biệt với Sam người chơi bằng vương miện vàng + cao hơn hẳn
  (1.86×1.2 ≈ 2.23m) + bảng tên + đứng sau ô kính; portrait thẻ idol cũng chụp kèm vương miện.
  Đã rà các model nam CC0 khác trên Cinevva/Quaternius: cyberpunk = đầu robot không mặt người,
  toon soldier = đội mũ + cầm súng to, zombie = mặt zombie, knight bạc = mũ kín — không có model nào hợp.
- **Three.js 0.160.0 (MIT)** trong `vendor/`: `three.module.js` + `GLTFLoader.js` +
  `SkeletonUtils.js` + `BufferGeometryUtils.js` (tải từ jsDelivr, lưu local, importmap trỏ file local).
- **Nguồn đã thử nhưng TẢI KHÔNG ĐƯỢC từ VM này, không dùng:** Ready Player Me mẫu công khai
  `https://models.readyplayer.me/6185a4acfb622cf1cdc49348.glb` (lỗi kết nối, exit 52 /
  RemoteDisconnected, cả khi đổi User-Agent). Thư viện animation RPM trên GitHub
  (`readyplayerme/animation-library`) chỉ có file animation, không có nhân vật gốc nên không dùng.
- Các file thay thế đã kiểm chứng nhưng **không đưa vào repo** để giữ repo gọn (chỉ ghi lại đây):
  XBot Mixamo (`Xbot.glb`, 67 joints, 7 clip), Soldier Vanguard (`soldier-three.glb`),
  `soldier_rigged.glb` (shanebrumback.com, 7 clip), RobotExpressive (three.js examples, 14 clip).

## File
- `index.html` — cấu trúc trang + importmap trỏ Three.js local + UI RPG
- `style.css` — giao diện game RPG (khung vàng/kim loại, thanh máu/XP, hộp thoại, túi đồ, minimap)
- `app.js` — toàn bộ game (module ES, ~1.450 dòng)
- `vendor/` — Three.js 0.160.0 + addons (GLTFLoader, SkeletonUtils, BufferGeometryUtils)
- `models/` — 8 file GLB nhân vật rigged (xem bảng trên)

## Lưu ý nội dung
- Parody giải trí hư cấu, không phải thăm thật, không dùng ảnh thật (nhân vật 3D rigged từ file GLB CC0).
- Tình trạng pháp lý ghi theo báo chí: Trường Con 20 năm (2020); Khá Bảnh 10 năm 6 tháng (2019);
  Huấn Hoa Hồng và Khánh Sky bị khởi tố/tạm giam tháng 8/2026, đang chờ xử lý, chưa có bản án tuyên.
- Mọi số liệu “đang online / lượt thăm / bảng vàng” đều ghi rõ là số liệu minh họa / mô phỏng.

## Deploy GitHub Pages
Push thư mục này lên repo GitHub (thư mục gốc), bật Settings → Pages → Deploy from a branch → main → / (root).
Link dạng `https://<user>.github.io/<repo>/`.
