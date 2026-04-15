---
name: layer-separation-action-manager-handler
description: "Use when organizing JavaScript code into action, manager, handler, function, model, UI, and DB layers. Covers responsibility boundaries for ReactJS frontend and NodeJS API code."
---

# Layer Separation: Action Manager Handler

## When to Use

- page hoặc API đang phình to
- business flow có nhiều bước validate, mapping, persistence, response handling
- cần tách trách nhiệm cho dễ maintain

## Layer Intent

- `UI`: render, collect input, show state
- `action`: orchestration entry point cho user flow hoặc request flow
- `manager`: business coordination, combine multiple handlers or services
- `handler`: xử lý tác vụ cụ thể, nhỏ hơn manager
- `function` or `helper`: pure logic, format, transform, compute
- `model`: shape dữ liệu, schema, mapping
- `DB`: persistence layer, query, repository

## Procedure

1. Xác định flow chính đang bị trộn nhiều trách nhiệm
2. Đưa orchestration lên action hoặc manager
3. Đưa tác vụ chuyên biệt xuống handler
4. Đưa pure logic xuống function/helper
5. Giữ UI và DB không gọi chéo lẫn nhau theo cách khó kiểm soát

## Rules

- action không nên chứa full query hoặc JSX detail
- handler không nên kiêm luôn render hoặc navigation
- manager không nên trở thành god object
- helper nên thuần nhất, tránh side effect nếu không cần

## Expected Output

- flow nghiệp vụ dễ follow
- dễ thay đổi từng tầng
- giảm coupling giữa UI, business logic và DB