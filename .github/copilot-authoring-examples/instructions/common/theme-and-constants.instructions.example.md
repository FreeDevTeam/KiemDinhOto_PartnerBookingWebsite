---
description: "Use when introducing theme tokens, labels, option maps, status maps, route keys, or other reusable constants in JavaScript ReactJS or NodeJS projects."
applyTo: "src/**/*.js, API/**/*.js"
---

# Theme And Constants Separation

- Theme token và business constant là hai nhóm khác nhau, không trộn chung một file nếu không cần.
- Token theme nên đặt theo semantic meaning như `primaryText`, `dangerBg`, `pageGap`.
- Status map, label map, route key, table column config nên tách theo domain hoặc theo module.
- Không tạo một file constants toàn cục quá lớn chứa mọi string trong hệ thống.
- Với form hoặc table, ưu tiên config object riêng thay vì hardcode rải rác trong component.