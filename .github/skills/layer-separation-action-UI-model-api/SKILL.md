---
name: layer-separation-action-UI-model-api
description: "Use when refactoring or designing a new feature that involves complex user interactions and business logic. Focuses on separating concerns between UI components, action handlers, business logic managers, data models, and API interactions to improve maintainability and scalability."
---

# Layer Separation: Action / UI / Model / API

## When to Use

- tạo page mới hoặc implement feature mới có nhiều bước xử lý
- refactor code cũ bị trộn lẫn UI, logic và API call
- cần tổ chức code theo hướng dễ maintain và mở rộng
- implement feature mới trên page cũ cũng cần phải lưu ý tách biệt rõ ràng giữa UI, action, model và API cho các phần code mới

## Layer Intent

- `UI`: render, collect input, show state
- `action`: orchestration entry point cho user flow hoặc request flow
- `function` or `helper`: pure logic, format, transform, compute
- `model`: shape dữ liệu, schema, mapping
- `API`: giao tiếp với backend, fetch, post data

## Rules

- Comment rõ ràng từng layer làm gì, input output là gì
- Mỗi layer chỉ tập trung vào 1 nhiệm vụ, không trộn lẫn trách nhiệm
- Sử dụng tên hàm, biến rõ ràng để thể hiện ý định của code
- Tách biệt rõ ràng giữa UI và logic để dễ test và maintain

## Mandatory Separation Checklist

- `UI` chỉ render state và emit user event, **không** parse query, decrypt/encrypt, validate business rule, gọi API trực tiếp
- `action` điều phối flow: đọc input, gọi logic/model/API, cập nhật state cho UI
- `model/helper` xử lý parse/decrypt/transform/validate dữ liệu, ưu tiên pure function
- `API` chỉ chứa giao tiếp backend, không chứa render hoặc điều hướng UI
- Code review phải reject khi thấy logic nghiệp vụ nằm trong component UI

## Anti-patterns (Must Avoid)

- đặt logic giải mã AES/RSA trong component React
- đọc và xử lý URL param trực tiếp trong JSX render branch
- trộn call API + business transform + setState trong cùng một component function dài

## Expected Output

- flow nghiệp vụ dễ follow
- dễ thay đổi từng phầnmà không ảnh hưởng đến phần khác
- giảm coupling giữa UI, business logic và API