---
name: create-api
description: "Use when creating a new NodeJS JavaScript API endpoint. Covers route, controller or action, manager or handler split, validation, model mapping, database access, and response consistency."
---

# Create API

## When to Use

- thêm endpoint mới cho backend NodeJS
- tạo route CRUD hoặc action nghiệp vụ mới
- tách API đang viết tất cả trong một file

## References To Reuse

- `../../common/constants-and-config/SKILL.example.md`
- `../../common/layer-separation-action-manager-handler/SKILL.example.md`

## Procedure

1. Xác định request contract, response contract, validation rules, business flow, DB touch points
2. Tạo route và action entry point
3. Dùng manager nếu flow gồm nhiều bước nghiệp vụ hoặc nhiều handler
4. Dùng handler cho validate business rule, mapping model, gọi DB layer, hoặc format response data
5. Tách query hoặc repository logic khỏi action và manager
6. Giữ response format nhất quán toàn project

## Deliverables

- route registration
- action or controller entry
- manager or handler modules
- validation schema or request validation logic
- model mapping or response transformer
- DB access module

## Review Checklist

- route có mỏng và dễ đọc không
- business logic có bị dồn vào controller không
- DB query có bị rơi vào action layer không
- response format có thống nhất không
- error handling có nhất quán không