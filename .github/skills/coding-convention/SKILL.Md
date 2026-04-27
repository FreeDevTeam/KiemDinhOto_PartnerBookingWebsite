---
name: coding-convention
description: "Use when writing or updating code in the project. Covers general coding conventions, best practices, and guidelines to ensure code quality, readability, and maintainability across the codebase."
---

## When to Use

- khi viết code mới hoặc chỉnh sửa code hiện có
- khi cần đảm bảo code tuân thủ các quy tắc và chuẩn mực chung của dự án
- khi muốn cải thiện chất lượng, readability và maintainability của code

## Rules

### General Coding Conventions
- comment rõ ràng, ngắn gọn, giải thích ý định của code
- đặt tên biến, hàm, component rõ ràng, thể hiện ý định và chức năng của chúng
- tuân thủ cấu trúc và tổ chức code đã được thống nhất trong dự án
- tránh viết code phức tạp, khó hiểu, ưu tiên sự đơn giản và dễ hiểu
- viết code có thể dễ dàng test và maintain trong tương lai

### Specific Guidelines liên quan đến các định nghĩa dùng chung trong dự án
- các url / path luôn phải đặt trong "src/constants/url.js", các nơi cần sử dụng url phải import từ file này, không hardcode url trực tiếp trong component hoặc function