---
description: Rules for using the external skills library.
---

# External Skills Usage Rules

> **Location**: `.agent/external-skills/`  
> **Index**: `.agent/external-skills/INDEX.md`  
> **Content**: 16 specialized skills (document processing, testing, design, etc.)

---

## 🛑 Golden Rule

**DO NOT** scan or index the `external-skills/skills/` folder directly.  
**DO NOT** prioritize these skills over project-specific rules in `.agent/rules/` or `.agent/workflows/`.

---

## ✅ Workflow When External Skills Might Help

```
1. Check if project documentation answers the question first
   └── .agent/rules/*.md
   └── .agent/workflows/*.md
   
2. If not sufficient, read the INDEX:
   └── view_file(".agent/external-skills/INDEX.md")
   
3. Find the relevant skill in the INDEX

4. Read ONLY that skill's SKILL.md:
   └── view_file(".agent/external-skills/skills/<skill-name>/SKILL.md")
   
5. Apply the knowledge
```

---

## 📋 Available Skills (Quick Reference)

| Category | Skills |
|----------|--------|
| **Development** | `webapp-testing`, `frontend-design`, `mcp-builder`, `web-artifacts-builder` |
| **Documents** | `docx`, `xlsx`, `pptx`, `pdf` |
| **Creative** | `algorithmic-art`, `canvas-design`, `theme-factory`, `brand-guidelines` |
| **Utilities** | `skill-creator`, `doc-coauthoring`, `slack-gif-creator`, `internal-comms` |

**For detailed descriptions, read**: `.agent/external-skills/INDEX.md`

---

## ❌ When to IGNORE External Skills

Always use project-specific documentation instead for:

| Task | Use This Instead |
|------|------------------|
| Project architecture | `.agent/rules/structure.md` |
| Frontend (Mobile) | `.agent/workflows/frontend-mobile.md` |
| Frontend (Web) | `.agent/workflows/frontend-web.md` |
| API development | `.agent/workflows/backend.md` |
| API integration | `.agent/workflows/api-integration.md` |
| Database/Prisma | `.agent/workflows/data.md` |
| Security/RBAC | `.agent/rules/security.md` |
| Import paths | `.agent/rules/imports.md` |
| Known issues | `.agent/rules/common-pitfalls.md` |

---

## ✅ When External Skills ARE Useful

1. **Explicit Request**: User asks "use the PDF skill" or "check external skills for X"
2. **Generic Technical Tasks**: 
   - Complex SQL queries (generic patterns)
   - Document processing (docx, xlsx, pdf)
   - Playwright testing (generic patterns)
3. **Creative Tasks**:
   - Generative art
   - Presentation design
   - Theme creation

---

## 🔍 Search Strategy

If you need a specific skill, search for it rather than reading everything:

```bash
# ✅ Correct - Find specific skill
find_by_name(SearchDirectory=".agent/external-skills/skills", Pattern="*testing*")

# ❌ Wrong - Don't list everything
list_dir(DirectoryPath=".agent/external-skills/skills")
```
