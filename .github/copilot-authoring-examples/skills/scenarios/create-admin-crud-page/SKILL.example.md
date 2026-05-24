---
name: create-admin-crud-page
description: "Use when creating a CRUD management page for an admin or backoffice screen using JavaScript, ReactJS, and Vuexy conventions. Covers table, filter, form, page actions, API integration, and layer separation."
---

# Create Admin CRUD Page

## When to Use

- tạo màn hình quản lý cho admin
- tạo page list, create, update, delete
- thêm table, filter, popup form, action buttons

## References To Reuse

- `../../common/react-js-coding-conventions/SKILL.example.md`
- `../../common/style-separation-react-vuexy/SKILL.example.md`
- `../../common/constants-and-config/SKILL.example.md`
- `../../common/layer-separation-action-manager-handler/SKILL.example.md`

## Procedure

1. Tạo route và navigation item cho page quản lý
2. Tách page thành các phần chính: filter area, table area, modal or drawer form, page actions
3. Tạo constants riêng cho columns, filter options, status labels, default form values
4. Tạo service hoặc API module để gọi list, detail, create, update, delete
5. Dùng action hoặc manager để điều phối fetch list, submit form, refresh table, delete confirm
6. Giữ form field config riêng nếu số field nhiều
7. Nếu là Vuexy admin, giữ layout và spacing bám theo pattern card, toolbar, data table của framework

## Deliverables

- page container
- reusable filter config
- table column config
- form config and validation mapping
- API service module
- action or manager layer cho CRUD flow

## Review Checklist

- table config đã tách khỏi JSX chưa
- submit flow đã tách khỏi UI chưa
- constants có bị trộn với theme token không
- page có bám pattern admin của Vuexy không
- API error handling có nhất quán không