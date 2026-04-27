---
description: "Use when writing ReactJS JavaScript pages, components, hooks, or shared UI modules. Covers naming, state ownership, file boundaries, and keeping JSX focused on rendering."
applyTo: "src/**/*.js"
---

# React JS Coding Conventions

- Tách UI render khỏi business logic khi logic bắt đầu dài hoặc có nhiều side effect.
- Không đặt API call hoặc mapping payload phức tạp trực tiếp trong component render.
- Component trình bày nên nhận data đã được chuẩn hóa từ container, hook, handler, hoặc service.
- Tách constants, config table, config form, status map ra file riêng thay vì hardcode trong JSX.
- Hook dùng tiền tố `use`, component dùng PascalCase, helper đặt tên theo hành vi cụ thể.