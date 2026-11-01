# Vào Tù Thăm Idol — GAME 3D Phòng thăm nuôi online (Parody)

Game 3D thật bằng **Three.js 0.160.0** (pin cố định qua CDN jsDelivr, ES module + importmap).
Nhân vật low-poly dựng bằng code Three.js (đầu/thân/tay/chân/phụ kiện ghép từ hộp, sphere, cylinder),
animation procedural có easing (đi bộ, idle thở, vẫy tay, chắp tay, múa quạt, ngồi) với lerp/damp mượt.
Không dùng ảnh thật, không tải GLB ngoài — chạy chắc trên GitHub Pages.

## Chạy local
```bash
cd tham-tu-online
python3 -m http.server 8899
# mở http://127.0.0.1:8899/
```
Cần mạng để tải Three.js qua CDN. Mở trực tiếp `index.html` bằng file:// cũng chạy được
(module ES cần HTTP để import CDN — khuyến nghị chạy qua http server như trên).

## Cách chơi
- **Đi dạo sảnh 3D:** WASD / mũi tên, Shift chạy, kéo chuột xoay camera, lăn chuột zoom.
  Điện thoại: joystick góc trái để đi, kéo 1 ngón tay để xoay camera.
- **Vào thăm:** đi tới gần ô kính có tên idol, hiện nút “Vào thăm” thì bấm **E** (hoặc chạm nút).
  Trong phòng thăm: bấm trực tiếp vào idol 3D để idol quay lại, vẫy tay, nói chuyện.
- **Chat / tặng đồ / mini-game:** chat hỏi đáp đạo lý parody, tặng mì tôm/trứng lộn/xúc xích/nước ngọt
  (đồ bay tới idol trong cảnh 3D), mini-game riêng từng idol:
  Khá Bảnh múa quạt theo nhịp, Huấn Hoa Hồng trắc nghiệm đạo lý,
  Trường Con hứng đồ ăn rơi, Khánh Sky livestream tăng view.
- **Người khác trong sảnh:** NPC 3D đi lại ngẫu nhiên, bấm 👋 để vẫy tay, người gần nhất vẫy lại.
- **Khác:** lấy số xếp hàng, nhiệm vụ ngày, streak, cấp bậc, bảng vàng (mô phỏng),
  giấy chứng nhận thăm nuôi tải PNG, chụp ảnh kỷ niệm 3D (📸).

## File
- `index.html` — cấu trúc trang + importmap Three.js 0.160.0
- `style.css` — giao diện neon tối, mobile-first, responsive
- `app.js` — toàn bộ game 3D (module, `import * as THREE from 'three'`)

## Lưu ý nội dung
- Parody giải trí hư cấu, không phải thăm thật, không dùng ảnh thật (chỉ avatar 3D low-poly dựng bằng code).
- Tình trạng pháp lý ghi theo báo chí: Trường Con 20 năm (2020); Khá Bảnh 10 năm 6 tháng (2019);
  Huấn Hoa Hồng và Khánh Sky bị khởi tố/tạm giam tháng 8/2026, đang chờ xử lý, chưa có bản án tuyên.
- Mọi số liệu “đang online / lượt thăm / bảng vàng” đều ghi rõ là số liệu minh họa / mô phỏng.

## Deploy GitHub Pages
Push thư mục này lên repo GitHub (thư mục gốc), bật Settings → Pages → Deploy from a branch → main → / (root).
Link dạng `https://<user>.github.io/<repo>/`.
