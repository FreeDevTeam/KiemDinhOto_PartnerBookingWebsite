---
name: react-js-coding-conventions
description: "Use when writing or updating ReactJS JavaScript screens, components, hooks, or page containers. Covers naming, file boundaries, state flow, and component responsibilities."
---

# React JS Coding Conventions

## When to Use

- tạo page mới cho frontend ReactJS
- chỉnh sửa component hiện có
- tách logic khỏi UI
- thêm hook hoặc service cho page

## Goals

- ưu tiên component nhỏ, rõ trách nhiệm
- tránh nhồi business logic vào JSX
- tách constants, services, handlers, hooks ra khỏi UI nếu logic bắt đầu lớn

## Procedure

1. Xác định page container, component con, service gọi API và constants
2. Giữ component trình bày tập trung vào render và props
3. Nếu logic xử lý submit, mapping dữ liệu, hoặc side effect dài hơn vài khối ngắn, tách sang hook hoặc handler riêng
4. Đặt tên file và tên function rõ ý nghĩa nghiệp vụ
5. Ưu tiên luồng dữ liệu một chiều: service -> container -> child component

## Rules

- component dùng PascalCase
- hooks dùng tiền tố `use`
- helper nội bộ đặt gần page nếu chỉ dùng cho page đó
- constants tách khỏi component nếu có enum, label map, route key, status map
- không viết API call trực tiếp rải rác trong nhiều component con

## Expected Output

- page có cấu trúc dễ đọc
- UI và logic không dính chặt vào nhau
- dễ tái sử dụng component và test luồng dữ liệu