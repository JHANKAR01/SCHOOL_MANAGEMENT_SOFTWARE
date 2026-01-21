---
description: Comprehensive index of external skills. Consult this file first when looking for specialized capabilities.
---

# External Skills Index

> **Location**: `.agent/external-skills/skills/`  
> **Total Skills**: 16  
> **Last Updated**: 2026-01-21

This folder contains specialized skill packages from Anthropic. Each skill has a `SKILL.md` with detailed instructions. **Consult this index first**, then read the specific skill's `SKILL.md` only when needed.

---

## 🛠️ Development & Testing (Most Relevant to This Project)

### `webapp-testing`
**Purpose**: Testing local web applications using Playwright.

**Use When**:
- Verifying frontend functionality
- Debugging UI behavior
- Capturing browser screenshots
- Viewing browser logs

**Key Files**:
- `SKILL.md` - Main guide
- `scripts/with_server.py` - Server lifecycle management
- `examples/` - Playwright patterns

**Example**: `python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_test.py`

---

### `frontend-design`
**Purpose**: Create distinctive, production-grade frontend interfaces.

**Use When**:
- Building web components, pages, dashboards
- Styling/beautifying web UI
- Avoiding "AI slop" aesthetics (purple gradients, centered layouts, Inter font)

**Key Focus**:
- Typography: Distinctive fonts (NOT Arial, Inter, Roboto)
- Color: Dominant colors with sharp accents
- Motion: CSS animations, scroll-triggering, hover effects
- Spatial Composition: Asymmetry, overlap, diagonal flow

**Warning**: Match implementation complexity to aesthetic vision.

---

### `mcp-builder`
**Purpose**: Build MCP (Model Context Protocol) servers.

**Use When**:
- Creating custom integrations for Claude
- Building tools that connect to external APIs
- Extending Claude's capabilities

**Key Files**:
- `SKILL.md` - Main guide
- `reference/mcp_best_practices.md`
- `reference/node_mcp_server.md` - TypeScript patterns
- `reference/python_mcp_server.md` - Python patterns

**Recommended Stack**: TypeScript + Streamable HTTP

---

### `web-artifacts-builder`
**Purpose**: Build complex multi-component HTML artifacts.

**Use When**:
- Creating elaborate React + Tailwind + shadcn/ui artifacts
- Need state management or routing in artifacts
- NOT for simple single-file HTML

**Stack**: React 18 + TypeScript + Vite + Parcel + Tailwind CSS + shadcn/ui

**Workflow**:
1. `bash scripts/init-artifact.sh <project-name>`
2. Develop the artifact
3. `bash scripts/bundle-artifact.sh` → Creates `bundle.html`

---

## 📄 Document Processing

### `docx`
**Purpose**: Create, edit, and analyze Word documents.

**Use When**:
- Creating new .docx files
- Editing existing documents
- Working with tracked changes (redlining)
- Adding comments

**Key Files**:
- `SKILL.md` - Main guide
- `docx-js.md` - Creating new documents (JavaScript)
- `ooxml.md` - Editing existing documents (Python)

**Key Commands**:
- Text extraction: `pandoc --track-changes=all file.docx -o output.md`
- Unpack: `python ooxml/scripts/unpack.py <file> <dir>`

---

### `xlsx`
**Purpose**: Create, edit, and analyze Excel spreadsheets.

**Use When**:
- Creating spreadsheets with formulas
- Data analysis and visualization
- Modifying existing spreadsheets while preserving formulas

**Key Libraries**:
- `pandas` - Data analysis
- `openpyxl` - Formulas and formatting

**Critical Rules**:
- ALWAYS use Excel formulas, NOT hardcoded values
- Run `python recalc.py output.xlsx` to calculate formulas
- Financial models: Blue = inputs, Black = formulas, Green = cross-sheet links

---

### `pptx`
**Purpose**: Create, edit, and analyze PowerPoint presentations.

**Use When**:
- Creating presentations from scratch
- Editing existing presentations
- Working with layouts and templates
- Adding speaker notes

**Key Workflows**:
1. **From scratch**: Use `html2pptx` workflow
2. **Using template**: Duplicate/reorder slides, then replace text
3. **Editing existing**: Unpack OOXML, edit XML, repack

**Key Commands**:
- Thumbnail grid: `python scripts/thumbnail.py presentation.pptx`
- Text extraction: `python -m markitdown file.pptx`

---

### `pdf`
**Purpose**: PDF manipulation toolkit.

**Use When**:
- Extracting text and tables from PDFs
- Creating new PDFs
- Merging/splitting documents
- Filling PDF forms

**Key Libraries**:
- `pypdf` - Basic operations (merge, split, rotate)
- `pdfplumber` - Text and table extraction
- `reportlab` - Create new PDFs

**Commands**:
- Extract text: `pdftotext input.pdf output.txt`
- Merge: `qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf`

---

## 🎨 Creative & Design

### `algorithmic-art`
**Purpose**: Create generative art using p5.js.

**Use When**:
- Creating art using code
- Flow fields, particle systems
- Generative/algorithmic art

**Process**:
1. Create an "Algorithmic Philosophy" (.md)
2. Express it through p5.js code (.html + .js)

**Key**: Uses seeded randomness for reproducibility.

---

### `canvas-design`
**Purpose**: Create beautiful static visual art (.png, .pdf).

**Use When**:
- Creating posters, art pieces
- Design-forward static visuals
- Museum/magazine quality work

**Process**:
1. Create a "Design Philosophy" (.md)
2. Express it on a canvas (.pdf/.png)

**Philosophy**: 90% visual design, 10% essential text.

---

### `theme-factory`
**Purpose**: Apply professional font and color themes.

**Use When**:
- Styling slides, docs, HTML pages
- Need consistent professional look

**Contains**: 10 pre-set themes (Ocean Depths, Sunset Boulevard, Forest Canopy, etc.)

**Workflow**:
1. Show `theme-showcase.pdf`
2. User selects theme
3. Apply to artifact

---

### `brand-guidelines`
**Purpose**: Apply Anthropic's official brand styling.

**Colors**:
- Dark: `#141413`
- Light: `#faf9f5`
- Orange accent: `#d97757`

**Fonts**:
- Headings: Poppins
- Body: Lora

---

## 🔧 Utilities & Meta

### `skill-creator`
**Purpose**: Guide for creating new skills.

**Use When**:
- Creating a new skill
- Updating an existing skill

**Key Principles**:
- Concise is key (context window is a public good)
- Match specificity to task fragility
- Use progressive disclosure (metadata → SKILL.md → resources)

**Scripts**:
- `scripts/init_skill.py <name> --path <dir>` - Initialize skill
- `scripts/package_skill.py <path>` - Package for distribution

---

### `doc-coauthoring`
**Purpose**: Structured workflow for writing documentation.

**Use When**:
- Writing docs, proposals, specs
- Creating PRDs, design docs, RFCs

**Workflow**:
1. Context Gathering - Get all info from user
2. Refinement & Structure - Build section by section
3. Reader Testing - Test with fresh Claude

---

### `slack-gif-creator`
**Purpose**: Create animated GIFs for Slack.

**Use When**:
- Creating Slack emoji GIFs (128x128)
- Creating message GIFs (480x480)

**Key**: Uses PIL + GIFBuilder with seeded output.

**Animations**: Shake, pulse, bounce, spin, fade, slide, zoom, explode.

---

### `internal-comms`
**Purpose**: Write internal communications.

**Use When**:
- 3P updates (Progress, Plans, Problems)
- Company newsletters
- FAQ responses
- Status reports

**Templates in**: `examples/` directory

---

## 💡 How to Use This Index

1. **Identify** your task type from the categories above
2. **Read** the brief description to confirm relevance
3. **If needed**, read the full SKILL.md:
   ```
   view_file(".agent/external-skills/skills/<skill-name>/SKILL.md")
   ```
4. **Apply** the skill's knowledge to your task

---

## ⚠️ Important Rules

1. **DO NOT** scan the entire `external-skills` folder - use this index
2. **PRIORITIZE** project-specific rules in `.agent/rules/` over these generic skills
3. **These skills are generic** - they don't know about NativeWind, Hono, or this project's structure
4. **Use selectively** - only when project documentation is insufficient
