---
description: "Use when adding a new NodeJS JavaScript API endpoint. Covers route setup, validation, manager and handler split, model mapping, DB access, and consistent response structure."
applyTo: "API/**/*.js"
---

# Create API

- Route hoặc controller entry nên mỏng và chỉ làm nhiệm vụ nhận request, gọi flow chính, trả response.
- Validation request cần rõ ràng trước khi vào business flow.
- Business logic nhiều bước nên đưa vào manager; tác vụ cụ thể đưa vào handler.
- Model mapping, transform response, và DB query cần tách khỏi controller.
- Response format và error handling phải nhất quán với API hiện có của project.