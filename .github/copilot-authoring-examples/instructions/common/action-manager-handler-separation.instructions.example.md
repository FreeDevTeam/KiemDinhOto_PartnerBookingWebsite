---
description: "Use when a JavaScript feature mixes UI, business logic, validation, mapping, and persistence. Covers action, manager, handler, function, model, UI, and DB responsibility boundaries."
applyTo: "src/**/*.js, API/**/*.js"
---

# Action Manager Handler Separation

- UI chỉ nên render, thu input, và hiển thị state.
- Action là entry point của flow, không nên ôm toàn bộ query hoặc transform detail.
- Manager điều phối business flow lớn; handler xử lý tác vụ cụ thể hơn.
- Helper hoặc function nên giữ thuần logic tính toán hoặc transform.
- DB layer tách khỏi UI và không bị gọi rải rác từ nhiều tầng không kiểm soát.