---
name: theme-and-design-tokens
description: "Use when creating or updating shared visual tokens for ReactJS or Vuexy-based JavaScript projects. Covers semantic color naming, spacing, typography, and reusable theme decisions."
---

# Theme And Design Tokens

## When to Use

- thêm màu, spacing, typography, border radius dùng chung
- đồng bộ UI giữa nhiều page
- refactor hardcoded UI constants

## Goals

- dùng token có ý nghĩa nghiệp vụ hoặc vai trò UI
- giảm hardcode trong component
- dễ đổi theme toàn cục

## Procedure

1. Xác định token ở mức semantic như `primaryText`, `dangerBg`, `pageGap`, `cardRadius`
2. Tách token theme khỏi page-specific constants
3. Nếu một token chỉ dùng cho một màn hình, giữ nó ở constant của màn hình đó thay vì đẩy vào global theme
4. Khi thêm token mới, kiểm tra có trùng ý nghĩa với token cũ hay không

## Rules

- không đặt tên token theo hex color nếu có thể đặt theo meaning
- không trộn theme token với business constant
- theme token là dùng chung cho visual system, không phải chỗ chứa status code hoặc route key

## Expected Output

- visual consistency tốt hơn
- ít sửa tay khi đổi style toàn hệ thống
- component code ngắn và dễ đọc hơn