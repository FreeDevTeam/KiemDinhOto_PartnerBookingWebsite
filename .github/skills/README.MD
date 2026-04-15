# Skills

Thư mục này chứa các skill cho GitHub Copilot.

README này dành cho thành viên trong team. Copilot sẽ không tự đọc file `README.MD`; Copilot chỉ đọc `SKILL.md` trong từng thư mục skill.

## Cấu trúc thư mục (BẮT BUỘC)

Mỗi skill phải nằm trong **một thư mục con** với file `SKILL.md` bên trong:

```text
.github/skills/
  my-skill/
    SKILL.md           # BẮT BUỘC - file chính, tên phải là SKILL.md
    scripts/           # (Tùy chọn) Script thực thi
    references/        # (Tùy chọn) Tài liệu tham khảo
    assets/            # (Tùy chọn) Template, boilerplate
```

**KHÔNG** đặt file `SKILL.md` trực tiếp trong `.github/skills/` - phải có thư mục con.

## YAML Frontmatter trong `SKILL.md` (BẮT BUỘC)

```yaml
---
name: my-skill              # BẮT BUỘC: 1-64 ký tự, chữ thường + dấu gạch ngang, PHẢI trùng tên thư mục
description: "Mô tả skill và khi nào nên dùng. Tối đa 1024 ký tự."
---
```

## Nguyên tắc thiết kế skill

- `SKILL.md` nên ngắn, tập trung vào: skill này làm gì, dùng khi nào, quy trình tổng quát, và tham chiếu tới file phụ
- Không nên dồn toàn bộ coding convention, project structure, style guide, API rules vào một `SKILL.md` quá dài
- Skill nên được thiết kế theo kiểu **progressive loading**: file chính ngắn, file phụ chứa chi tiết
- Một workflow lớn như CRUD thường cần nhiều concern khác nhau: naming, validation, response format, folder structure, testing

## Tổ chức file phụ và common

Ví dụ cấu trúc khuyến nghị:

```text
.github/skills/
  common/
    coding-conventions.md
    project-structure.md
    api-response-format.md
  create-crud/
    SKILL.md
    references/
      crud-checklist.md
      db-mapping.md
    scripts/
      scaffold.js
```

### Cách hiểu cấu trúc này

- `create-crud/SKILL.md` là file để Copilot khám phá và quyết định có dùng skill hay không
- `create-crud/references/` chứa phần chi tiết riêng cho skill đó
- `.github/skills/common/` là nơi team lưu tri thức dùng chung giữa nhiều skill
- Nếu muốn agent dùng tài liệu chung, `SKILL.md` phải **tham chiếu rõ** tới file đó; không nên giả định agent sẽ tự đọc mọi file trong `common/`

## Cách viết `SKILL.md` hiệu quả

`SKILL.md` nên chứa:

- Mục đích của skill
- Trigger rõ ràng trong `description`
- Quy trình cấp cao theo từng bước
- Link tới file trong `references/`, `scripts/`, `assets/`
- Chỉ lặp lại phần tối thiểu của rule chung để agent định hướng đúng

Không nên chứa:

- Toàn bộ coding standard của cả repo
- Toàn bộ project structure nhiều màn hình
- Nhiều ví dụ dài không liên quan trực tiếp tới skill

## Ví dụ

```text
.github/skills/
  create-api-endpoint/
    SKILL.md
    references/
      endpoint-checklist.md
      request-validation.md
```

Nội dung `SKILL.md`:

```markdown
---
name: create-api-endpoint
description: "Create new API endpoints following project conventions. Use when: adding new routes, implementing CRUD operations, setting up middleware."
---

# Create API Endpoint

## Khi nào dùng
- Thêm route mới
- Implement CRUD operations

## Quy trình
1. Xem project structure trong `../common/project-structure.md`
2. Xem coding conventions trong `../common/coding-conventions.md`
3. Thực hiện checklist trong `./references/endpoint-checklist.md`
4. Áp dụng validation theo `./references/request-validation.md`
```

## Lưu ý

- **name** trong frontmatter PHẢI trùng với tên thư mục chứa `SKILL.md`
- **description** phải chứa từ khóa rõ ràng - Copilot dùng nó để quyết định khi nào load skill
- `SKILL.md` nên là file điều phối, không nên là nơi chứa toàn bộ kiến thức chi tiết
- Skill xuất hiện như slash command trên VS Code và hỗ trợ tự load khi phù hợp
- Skill hoạt động chủ yếu trên **VS Code local**; trên **GitHub Cloud Agent** mức hỗ trợ có thể hạn chế hơn
