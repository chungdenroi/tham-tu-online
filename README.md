# Vào Tù Thăm Idol — Phòng thăm nuôi online (Parody)

Web tĩnh, không cần build step, chạy ngay trên GitHub Pages.

## Chạy local
```bash
cd tham-tu-online
python3 -m http.server 8899
# mở http://127.0.0.1:8899/
```
Hoặc mở trực tiếp `index.html` bằng trình duyệt (mọi tính năng chạy client-side, trừ `localStorage` vẫn hoạt động khi mở file).

## Deploy GitHub Pages
1. Push thư mục này lên repo GitHub (làm thư mục gốc của repo, hoặc giữ nguyên trong repo).
2. Repo → Settings → Pages → Source: Deploy from a branch → chọn nhánh + thư mục chứa `index.html` → Save.
3. Link sẽ có dạng `https://<user>.github.io/<repo>/`.

## File
- `index.html` — cấu trúc trang: sảnh + phòng thăm
- `style.css` — giao diện neon tối, mobile-first, responsive
- `app.js` — toàn bộ tương tác (không thư viện ngoài)

## Lưu ý nội dung
- Parody giải trí hư cấu, không phải thăm thật, không dùng ảnh thật (chỉ avatar CSS/emoji).
- Tình trạng pháp lý ghi theo báo chí: Trường Con 20 năm (2020); Khá Bảnh 10 năm 6 tháng (2019);
  Huấn Hoa Hồng và Khánh Sky bị khởi tố/tạm giam tháng 8/2026, đang chờ xử lý, chưa có bản án tuyên.
- Mọi số liệu “đang online / lượt thăm / bảng vàng” đều ghi rõ là số liệu minh họa / mô phỏng.
