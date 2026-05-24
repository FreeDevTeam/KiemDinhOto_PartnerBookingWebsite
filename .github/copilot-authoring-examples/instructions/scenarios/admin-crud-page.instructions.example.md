---
description: "Use when creating an admin CRUD page for management or backoffice workflows using JavaScript and Vuexy conventions. Covers list page structure, filters, table config, form config, API service, and page orchestration."
applyTo: "KiemDinhOto_AdminWebSite/src/**/*.js"
---

# Admin CRUD Page

- Tách page thành filter area, table area, form area, và action area rõ ràng.
- Table columns, filter options, status labels, và default form values cần có file config riêng.
- Submit flow, refresh list, delete confirm, và API error handling không nên nhồi trong JSX.
- Giữ page bám layout admin của Vuexy để tránh lệch style toàn hệ thống.
- Nếu CRUD có nhiều bước, dùng action hoặc manager để điều phối thay vì để component ôm toàn bộ luồng.