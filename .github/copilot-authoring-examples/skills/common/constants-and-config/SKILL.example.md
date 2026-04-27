---
name: constants-and-config
description: "Use when introducing constants, enums, labels, route keys, table definitions, or configuration maps in JavaScript ReactJS or NodeJS projects. Covers what should and should not become a constant."
---

# Constants And Config

## When to Use

- thêm status map, label map, route key, table column config
- gom hardcoded string đang xuất hiện lặp lại
- tạo config cho form, table, tabs, filter

## Goals

- tránh magic string rải rác
- tách config khỏi component và handler
- giúp review logic nhanh hơn

## Procedure

1. Xác định giá trị nào lặp lại hoặc có meaning rõ ràng
2. Tách business constants khỏi theme token và khỏi API endpoint config
3. Với form hoặc table, ưu tiên tạo config object riêng thay vì hardcode từng field trong JSX
4. Nếu constant chỉ dùng nội bộ một module, giữ gần module đó

## Rules

- không đưa tất cả string vào một file constants toàn cục khổng lồ
- chia constants theo domain hoặc theo page
- constants cho UI label khác constants cho API contract
- config cần đủ rõ để người khác đọc mà không cần dò ngược JSX dài

## Expected Output

- giảm duplication
- dễ đổi label hoặc config
- page và API handler dễ đọc hơn