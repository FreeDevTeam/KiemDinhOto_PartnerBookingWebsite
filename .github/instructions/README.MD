# Instructions

Thư mục này chứa các file instruction cho GitHub Copilot.

README này dành cho thành viên trong team. Copilot sẽ không tự đọc file `README.MD`; Copilot chỉ đọc các file đúng chuẩn như `*.instructions.md`, `copilot-instructions.md`, hoặc `AGENTS.md`.

## Quy tắc đặt tên (BẮT BUỘC)

- File PHẢI có đuôi `.instructions.md` (ví dụ: `coding-standards.instructions.md`)
- File không đúng đuôi sẽ **KHÔNG** được Copilot đọc

## YAML Frontmatter (BẮT BUỘC)

Mỗi file phải có YAML frontmatter ở đầu:

```yaml
---
description: "Mô tả ngắn gọn, chứa từ khóa để Copilot tự phát hiện khi nào cần dùng. Dùng pattern: Use when..."
applyTo: "**/*.js"  # (Tùy chọn) Glob pattern - tự động áp dụng khi làm việc với file khớp pattern
---
```

### Hai chế độ hoạt động

| Chế độ | Cách kích hoạt | Khi nào dùng |
|---|---|---|
| **On-demand** (theo `description`) | Copilot tự phát hiện dựa trên từ khóa | Hướng dẫn theo task: migration, refactoring, API work |
| **Explicit** (theo `applyTo`) | Tự động áp dụng khi file khớp glob pattern | Hướng dẫn theo loại file: coding standards, framework rules |

## Nguyên tắc thiết kế instruction

- Mỗi file chỉ nên tập trung vào **một concern**: ví dụ `api.instructions.md`, `testing.instructions.md`, `react-style.instructions.md`
- Không nên dồn quá nhiều chủ đề vào một file dài vì agent sẽ khó chọn đúng phần cần dùng
- Ưu tiên nhiều file nhỏ, mô tả rõ trigger trong `description`, thay vì một file lớn chứa mọi quy tắc
- `applyTo` nên hẹp và chính xác; tránh `applyTo: "**"` nếu nội dung không áp dụng cho toàn repo

## Tổ chức common và file riêng

Khi có nhiều quy tắc dùng chung giữa nhiều instruction, nên tách phần dùng chung ra thành tài liệu riêng cho người đọc và giữ mỗi instruction file ở mức ngắn gọn.

Ví dụ cấu trúc:

```text
.github/instructions/
	common/
		naming.md
		api-response-format.md
		project-structure.md
	api.instructions.md
	react-style.instructions.md
	testing.instructions.md
```

### Cách dùng hợp lý

- Các file trong `common/` là **nguồn tham chiếu chung** cho team
- Mỗi file `*.instructions.md` chỉ nên chứa phần tóm tắt thật sự cần để agent ra quyết định đúng
- Nếu cần, instruction có thể nhắc tới tài liệu chung để người đọc biết đọc thêm
- Không nên biến một file instruction thành bản sao đầy đủ của toàn bộ coding guideline

## Khuyến nghị tối ưu cho agent

- Đặt `description` giàu từ khóa theo pattern `Use when...`
- Tách rule theo bối cảnh sử dụng, không tách theo tài liệu nội bộ thuần túy
- Viết ngắn, rõ, hành động được
- Nếu một quy tắc áp dụng ở nhiều nơi, chỉ lặp lại phần tối thiểu cần cho ngữ cảnh đó

## Ví dụ

```markdown
---
description: "Use when writing API endpoints, creating routes, or handling HTTP requests. Covers REST conventions and error handling."
applyTo: "API/**/*.js"
---

# API Conventions

- Sử dụng async/await cho tất cả route handlers
- Trả về response format thống nhất: { data, message, status }
- Luôn validate input đầu vào
- Xem thêm project docs trong `.github/instructions/common/api-response-format.md`
```

## Lưu ý

- **description** phải chứa từ khóa rõ ràng - đây là cách Copilot quyết định có load file hay không
- Mỗi file nên tập trung vào **một chủ đề**
- Tránh dùng `applyTo: "**"` trừ khi instruction thật sự áp dụng cho mọi file
- Instruction hoạt động trên cả **VS Code local** và **GitHub Cloud Agent**
