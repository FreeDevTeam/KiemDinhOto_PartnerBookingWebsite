---
description: "Use when creating or updating admin pages built with Vuexy and JavaScript. Covers layout consistency, style separation, and avoiding hardcoded design values inside page logic."
applyTo: "KiemDinhOto_AdminWebSite/src/**/*.js"
---

# Vuexy Style Separation

- Bám layout, spacing, card, toolbar, data table pattern của Vuexy trước khi tự thiết kế mới.
- Không trộn full style detail với table config, form logic, và API mapping trong cùng một file page.
- Tách reusable visual config, semantic color token, và page-specific style theo từng tầng.
- Tránh hardcode nhiều màu, khoảng cách, border, và typography trực tiếp trong JSX.
- Nếu một block UI lặp lại ở nhiều màn hình admin, ưu tiên tách thành reusable component hoặc shared style config.