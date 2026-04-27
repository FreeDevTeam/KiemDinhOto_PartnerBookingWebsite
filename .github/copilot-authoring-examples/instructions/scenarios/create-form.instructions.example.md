---
description: "Use when creating or refactoring a JavaScript form in ReactJS or Vuexy-based admin pages. Covers field config, initial state, validation, payload mapping, and submit handling."
applyTo: "src/**/*.js"
---

# Create Form

- Field config, option list, label, placeholder, và default value nên tách khỏi JSX nếu form không còn đơn giản.
- Validation rule và submit payload mapping cần ở tầng rõ ràng, không lẫn với render detail.
- Nếu form dùng cho cả create và update, chuẩn hóa initial values và transform logic theo một luồng chung.
- Component form nên tập trung vào input rendering, error display, và event binding.
- Tránh hardcode payload key hoặc text lặp lại trực tiếp trong nhiều field block.