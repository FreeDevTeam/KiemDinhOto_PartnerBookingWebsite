---
name: localstorage-usage
description: "Use LocalStorageManager for client-side storage operations (get, set, delete, clear). Avoid direct access to window.localStorage."
---

# Kỹ năng: LocalStorage Usage

## Mục tiêu
- Thao tác localStorage thông qua LocalStorageManager
- Đảm bảo consistent format và tránh lỗi parse/stringify

---

## 1. Nguyên tắc

- Không dùng trực tiếp `window.localStorage`
- Luôn dùng `LocalStorageManager`
- Data lưu phải serialize/deserialize đúng format

---

## 2. Các thao tác chính

### set
- Lưu dữ liệu theo key
- Value phải được serialize (nếu là object)

### get
- Lấy dữ liệu theo key
- Trả về đúng type (parse nếu cần)

### delete
- Xoá 1 key cụ thể

### clear
- Xoá toàn bộ dữ liệu localStorage (cẩn thận khi dùng)

---

## 3. Naming convention

- Key phải có prefix rõ ràng theo module
  - Ví dụ: `user.token`, `cart.items`, `app.settings`
- Tránh key generic: `data`, `info`, `temp`

---

## 4. Nguyên tắc quan trọng

- Không lưu sensitive data (password, private key)
- Không lưu object quá lớn
- Luôn handle trường hợp key không tồn tại
- Tránh overwrite dữ liệu nếu không cần thiết

---

## 5. Anti-patterns

- Dùng trực tiếp `localStorage.setItem/getItem`
- Không parse JSON khi đọc
- Lưu data không có cấu trúc rõ ràng
- Dùng key không nhất quán