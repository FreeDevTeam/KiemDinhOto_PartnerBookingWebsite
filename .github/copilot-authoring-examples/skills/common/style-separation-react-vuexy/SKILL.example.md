---
name: style-separation-react-vuexy
description: "Use when styling ReactJS pages or Vuexy-based admin screens in JavaScript. Covers separation between layout structure, component style, theme tokens, and reusable visual patterns."
---

# Style Separation For React And Vuexy

## When to Use

- thêm style cho page mới
- refactor page đang bị trộn logic và style
- xây màn hình admin dùng Vuexy

## Goals

- style không làm che business logic
- tránh hardcode màu, khoảng cách, border, typography ở nhiều chỗ
- phân biệt rõ phần layout, reusable UI, và theme token

## Procedure

1. Giữ style theo từng tầng: theme token -> reusable component style -> page layout style
2. Không để object style dài trong component nếu có thể tách ra constant hoặc style file riêng
3. Nếu đang dùng Vuexy, ưu tiên bám pattern của framework trước rồi mới mở rộng
4. Với style lặp lại trên nhiều màn hình, gom thành reusable token hoặc shared block

## Rules

- không hardcode nhiều mã màu trong JSX
- không để một file page vừa chứa table config, form logic, API mapping và full style detail
- style cho admin cần tôn trọng spacing, card, table, filter, action area của Vuexy
- nếu style gắn chặt với theme, đặt tên dựa trên semantic meaning thay vì màu cụ thể

## Expected Output

- code dễ maintain khi đổi theme hoặc refactor layout
- page admin nhất quán với Vuexy
- style tái sử dụng được thay vì copy paste