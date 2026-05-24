# Copilot Authoring Examples

Thư mục này chỉ dành cho thành viên trong team tham khảo khi tạo skill và instruction mới.

Mục tiêu của thư mục này:

- cung cấp mẫu hoàn chỉnh để copy và chỉnh sửa
- tách biệt khỏi `.github/skills/` và `.github/instructions/`
- tránh để GitHub Copilot tự load khi làm việc hằng ngày

Lý do Copilot không tự đọc thư mục này:

- thư mục này không nằm trong đường dẫn chuẩn mà Copilot quét cho skill và instruction
- file skill mẫu dùng tên `SKILL.example.md`, không phải `SKILL.md`
- file instruction mẫu dùng tên `*.instructions.example.md`, không phải `*.instructions.md`

## Cấu trúc

```text
.github/copilot-authoring-examples/
  skills/
    common/
    scenarios/
  instructions/
    common/
    scenarios/
```

## Cách sử dụng

1. Chọn file mẫu phù hợp trong `skills/` hoặc `instructions/`
2. Copy sang đúng thư mục thật:
   - skill thật: `.github/skills/<skill-name>/SKILL.md`
   - instruction thật: `.github/instructions/<name>.instructions.md`
3. Đổi `name`, `description`, đường dẫn tham chiếu, và nội dung cho đúng repo cụ thể
4. Giữ file chính ngắn gọn, để chi tiết ở file phụ hoặc tài liệu chung

## Nguyên tắc được thể hiện trong các ví dụ

- ưu tiên progressive loading
- tách `coding convention`, `style`, `theme`, `constants`, `action/manager/handler` thành concern riêng
- các workflow đặc thù như CRUD, form, API mới sẽ tham chiếu tới các concern chung thay vì nhồi tất cả vào một file
- phù hợp cho ReactJS thuần, NodeJS thuần, và Admin dùng Vuexy trên JavaScript