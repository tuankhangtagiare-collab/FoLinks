# Hướng dẫn Migrate & Seed Cơ sở dữ liệu Folink

Tài liệu này hướng dẫn cách cấu hình, chạy migration và seed dữ liệu khởi tạo cho dự án **Folink** sử dụng **Prisma ORM** và **Neon PostgreSQL**.

---

## 1. Cấu hình biến môi trường

Đảm bảo bạn đã điền chính xác đường dẫn kết nối Neon PostgreSQL trong file `.env` ở thư mục gốc:

```env
DATABASE_URL="postgresql://<username>:<password>@<ep-hostname>.<region>.aws.neon.tech/<dbname>?sslmode=require"
```

---

## 2. Các câu lệnh NPM được thiết lập sẵn

Chúng tôi đã thiết lập sẵn các script trong `package.json` để thao tác nhanh:

### A. Thiết lập toàn bộ từ đầu (Khuyên dùng)
Câu lệnh này sẽ chạy toàn bộ migration chưa áp dụng và tự động chạy file seed để tạo các cấu hình mặc định + tài khoản Admin:
```bash
npm run db:setup
```

### B. Chạy Migration riêng lẻ
Áp dụng các thay đổi schema vào cơ sở dữ liệu:
```bash
npm run db:migrate
```

### C. Chạy Seed dữ liệu riêng lẻ
Tạo mới tài khoản Admin và cấu hình website mặc định nếu chưa tồn tại:
```bash
npm run db:seed
```

---

## 3. Thông tin tài khoản mặc định sau khi Seed

Sau khi chạy câu lệnh seed thành công, hệ thống sẽ tự động tạo:

- **Tài khoản Super Admin**:
  - **Email**: `admin@folink.com`
  - **Username**: `admin`
  - **Mật khẩu**: `AdminSecurePassword123!`
  - **Quyền hạn**: `SUPER_ADMIN` (Toàn quyền quản trị hệ thống)

- **Cấu hình mặc định (SiteSettings)**:
  - CPM mặc định: `$3.00`
  - Thời gian chờ countdown: `15s`
  - Các cổng quảng cáo Adsterra & Cloudinary sẵn sàng hoạt động sau khi cập nhật API key trong trang quản trị Admin.
