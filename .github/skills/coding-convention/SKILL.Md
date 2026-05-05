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
- comment rõ ràng, ngắn gọn, giải thích ý định của code và các function / method
- đặt tên biến, hàm, component rõ ràng, thể hiện ý định và chức năng của chúng
- tuân thủ cấu trúc và tổ chức code đã được thống nhất trong dự án
- tránh viết code phức tạp, khó hiểu, ưu tiên sự đơn giản và dễ hiểu
- viết code có thể dễ dàng test và maintain trong tương lai
- các file helper / constant đừng đặt tên là "vnpay.js" khi tìm import rất dễ bị trùng lặp, hãy đặt tên riêng unique cho dễ tìm kiếm.
### Specific Guidelines liên quan đến các định nghĩa dùng chung trong dự án
- các url / path luôn phải đặt trong "src/constants/url.js", các nơi cần sử dụng url phải import từ file này, không hardcode url trực tiếp trong component hoặc function
- các PATH của API định nghĩa vào 1 file constant riêng là "APIUrls.js" thì đúng hơn là "url.js" và comment rõ ràng. chuẩn đặt tên là CamelCase (viết hoa ký tự đầu của mỗi từ). để khi viết các function liên quan đến API thì sẽ dễ dàng tìm kiếm và import hơn, tránh nhầm lẫn với các api path / route khác trong project.
- các file helper / constant đừng đặt tên chung chung giống nhau ví dụ: helper/vnpay.js và constant/vnpay.js khi tìm import rất dễ bị trùng lặp, hãy đặt tên riêng unique cho dễ tìm kiếm, ví dụ: helper/VNPAYHelper.js và constant/VNPAYConstant.js. chuẩn đặt tên là CamelCase (viết hoa ký tự đầu của mỗi từ). các tên hàm cũng áp dụng tương tự.