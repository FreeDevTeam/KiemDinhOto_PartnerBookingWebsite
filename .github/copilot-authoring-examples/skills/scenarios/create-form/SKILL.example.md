---
name: create-form
description: "Use when creating a new form in JavaScript ReactJS or admin Vuexy screens. Covers field configuration, initial values, validation, submit handling, and separation between UI and business logic."
---

# Create Form

## When to Use

- tạo form nhập liệu mới
- refactor form đang bị hardcode quá nhiều
- thêm modal form hoặc standalone page form

## References To Reuse

- `../../common/react-js-coding-conventions/SKILL.example.md`
- `../../common/constants-and-config/SKILL.example.md`
- `../../common/style-separation-react-vuexy/SKILL.example.md`

## Procedure

1. Xác định input fields, initial values, validation rules, submit payload
2. Tách field config nếu form có nhiều field hoặc nhiều trạng thái
3. Giữ UI form tập trung vào render control và show validation message
4. Tách mapping input -> payload sang helper hoặc handler nếu có transform logic
5. Gom label, placeholder, option list, default values thành constants hoặc config riêng

## Review Checklist

- field config có dễ mở rộng không
- validation có nằm đúng tầng không
- submit handler có bị trộn với render logic không
- option list và label có bị hardcode trong JSX không

## Expected Output

- form component gọn
- payload mapping rõ ràng
- dễ thêm field mới hoặc đổi validation