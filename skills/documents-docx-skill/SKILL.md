---
name: documents-docx-skill
description: "Use when generating Word documents (.docx). Uses the marble_docx API."
---
# Python-docx Skill: DOCX Document Generation

## Marble Library (PREFERRED)

Use the `marble_docx` helper library. It provides themed headings, tables, rules, cover pages, two-column layouts, and paragraphs — all with automatic theming.

**IMPORTANT**: Always use the library helpers below. Never manually define color constants, helper functions, or cell shading logic — the library handles all of this.

This skill is the **complete API reference** — all palettes, font pairs, and methods are documented below. Use them directly in your code without any exploration calls.

```python
from marble_docx import Doc

doc = Doc(palette='ocean', fonts='modern')
# palette: midnight, forest, coral, terracotta, ocean, charcoal, teal, berry, sage, cherry
# fonts: classic, modern, bold, elegant, clean
# Or: Doc() for default light theme, Doc('dark') for dark theme
```

### API Quick Reference

| Method | Purpose |
|--------|---------|
| `Doc(theme, font, palette, fonts)` | Create document. `palette` for named colors, `fonts` for font pair |
| `doc.cover_page(title, subtitle, author, date)` | Professional title page with accent lines |
| `doc.toc_placeholder()` | Table of Contents heading placeholder |
| `doc.heading(text, level)` | Heading with primary accent. Level 0=Title, 1=H1, 2=H2 |
| `doc.rule(color)` | Horizontal divider line (default: primary). Use after section headings |
| `doc.paragraph(text, bold, italic, color, size, align)` | Styled paragraph. Supports `<b>` and `<i>` |
| `doc.caption(text)` | Secondary italic note |
| `doc.rich(*parts)` | Mixed-style paragraph. Parts: strings or `{'text', 'bold', 'color', ...}` dicts |
| `doc.bullet(text)` | Bullet list item. Supports `<b>` and `<i>` |
| `doc.numbered(text)` | Numbered list item |
| `doc.table(headers, rows, col_widths, header_bg, header_fg)` | Themed table with alternating rows |
| `doc.two_column_table(left_rows, right_rows)` | Side-by-side content via invisible table |
| `doc.image(path, width, align)` | Insert image |
| `doc.page_break()` | Page break |
| `doc.header(text, align, color, bold)` | Set page header |
| `doc.footer(text, align, color, bold)` | Set page footer |
| `doc.raw` | Access underlying `docx.Document` for advanced ops |

### Named Palettes

Choose a palette that matches the content's mood — not the default blue:

| Palette | Primary | Best for |
|---------|---------|----------|
| `midnight` | Deep navy | Finance, enterprise, formal |
| `forest` | Rich green | Sustainability, health, growth |
| `coral` | Warm pink-red | Marketing, creative, consumer |
| `terracotta` | Earthy brown | Luxury, real estate, hospitality |
| `ocean` | Deep blue | Tech, analytics, professional |
| `charcoal` | Dark gray | Minimal, corporate, neutral |
| `teal` | Vibrant teal | Modern, SaaS, healthcare |
| `berry` | Deep plum | Premium, beauty, fashion |
| `sage` | Muted green-blue | Consulting, calm, wellness |
| `cherry` | Bold red | Bold reports, urgency, food |

### Font Pairs

| Name | Heading / Body |
|------|---------------|
| `classic` | Georgia / Calibri |
| `modern` | Calibri / Calibri Light |
| `bold` | Arial Black / Arial |
| `elegant` | Cambria / Calibri |
| `clean` | Trebuchet MS / Calibri |

## Design Guidelines

### 1. Document structure

For reports and long documents, follow this structure:

1. **Cover page** — `doc.cover_page()` + `doc.page_break()`
2. **Table of Contents** — `doc.toc_placeholder()` + `doc.page_break()` (optional)
3. **Executive Summary** — heading + key findings
4. **Body sections** — each with heading + rule + content
5. **Appendix** — data tables, methodology notes

### 2. Use `doc.rule()` after every section heading

This gives visual structure and separates sections clearly:
```python
doc.heading('1. Executive Summary', level=1)
doc.rule()
doc.paragraph('Key findings...')
```

### 3. Always set `col_widths` on tables

Without explicit widths, columns render unevenly:
```python
doc.table(headers, rows, col_widths=[3.5, 1.5, 1.5])  # GOOD
doc.table(headers, rows)  # BAD — uneven columns
```

### 4. Use rich() for mixed-style inline content

```python
doc.rich(
    'Total spend was ',
    {'text': '$793', 'bold': True},
    ' with a ROAS of ',
    {'text': '0.70x', 'bold': True, 'color': 'error'},
)
```

### 5. Use captions for attributions and notes

```python
doc.caption('Source: Meta Ads API | Data as of Feb 23, 2026')
```

### 6. Color-coded table cells

```python
{'text': '1.55x', 'color': 'success', 'bold': True}  # green for positive
{'text': '0.38x', 'color': 'error', 'bold': True}     # red for negative
```

Bold header variant: `header_bg='primary', header_fg='text_on_primary'`

### 7. Embedding ad creatives, thumbnails, and other platform-fetched images

When the document needs real images returned by previous tool calls (ad thumbnails from `facebook_analyze_ad_creative_by_id_or_url`, competitor ad images from the ad library, etc.), pass each image URL as an `attachment_url` data source on the SAME `advanced_analysis` call. The runtime downloads them into the workspace before your code runs — `doc.image()` takes the local path:

```python
# Tool call payload:
# dataSources: [
#   {type: 'attachment_url', identifier: 'https://cdn.fbcdn.net/.../thumb_a.jpg', alias: 'creative_1'},
#   {type: 'attachment_url', identifier: 'https://cdn.fbcdn.net/.../thumb_b.png', alias: 'creative_2'},
# ]

# In code:
from marble_docx import Doc
doc = Doc(palette='ocean')
doc.heading('Top Performers', level=1)
doc.rule()
doc.image(f'{WORKSPACE}/creative_1.jpg', width=4)
doc.caption('Figure 1: Outdoor Adventure (Video) — CTR 2.46%')
doc.image(f'{WORKSPACE}/creative_2.png', width=4)
doc.caption('Figure 2: Forest Boots — CTR 1.92%')
doc.save(f'{WORKSPACE}/report.docx')
```

Do NOT import `requests`/`urllib` from inside your code — network is blocked and the call will fail with DNS errors. The `attachment_url` mechanism is the supported path. Extensions (.jpg/.png/.webp/.gif etc.) are auto-detected.

## Anti-Patterns — DO NOT

1. **NEVER use `\n` in text** — always call `doc.paragraph()` or `doc.bullet()` separately for each line.
2. **Don't dump raw data** — summarize with tables + bullet highlights. Max 6-8 columns per table.
3. **Don't use giant tables** — if you have 10+ columns, transpose the table or split into multiple tables.
4. **Don't forget `col_widths`** — every table needs explicit column widths.
5. **Don't skip cover pages for formal reports** — use `doc.cover_page()` for anything over 2 pages.
6. **Don't use `doc.heading()` without `doc.rule()`** — headings need visual separation.
7. **Don't manually define colors** — use theme keys: `'primary'`, `'success'`, `'error'`, `'secondary'`.
8. **Don't use `page_break()` after every section** — only use between major sections (e.g. after cover page, before appendix). Excessive page breaks create blank pages.
9. **NEVER use raw python-docx enums without importing them** — if using `doc.raw`, always import what you need: `from docx.enum.table import WD_TABLE_ALIGNMENT`, `from docx.enum.text import WD_ALIGN_PARAGRAPH`, `from docx.shared import Pt, Inches, RGBColor`. The `marble_docx` library handles this automatically — prefer it over raw API.
10. **Respect page count constraints** — if the user asks for "a 2-page report", the final document must be ~2 content pages (cover page is extra). Plan your layout BEFORE writing code: pick 2-3 key sections max, use compact tables, limit charts to 1-2, and skip exhaustive breakdowns. A page holds ~4-5 sections of heading+paragraph, OR 1 table + 2 paragraphs + 1 chart. Fewer `page_break()` calls = fewer pages.

## Example — Professional Report

```python
from marble_docx import Doc

doc = Doc(palette='ocean', fonts='elegant')

doc.header('B&M Advertising  |  Performance Report', align='center', color='primary', bold=True)
doc.footer('Powered by GoMarble AI  |  Feb 2026')

# ── Cover page ──
doc.cover_page(
    'B&M Advertising Account',
    subtitle='Spend & ROAS Performance Report',
    author='GoMarble AI',
    date='February 17 – February 23, 2026',
)
doc.page_break()

# ── Executive Summary ──
doc.heading('1. Executive Summary', level=1)
doc.rule()
doc.paragraph('This report covers Meta Ads performance for B&M Advertising over the past 7 days.')
doc.rich(
    'Total spend was ',
    {'text': '$793.95', 'bold': True},
    ' with a blended ROAS of ',
    {'text': '0.70x', 'bold': True, 'color': 'error'},
    ' — below the 1.0x break-even threshold.',
)
doc.caption('Note: Weighted ROAS is the spend-weighted average across all campaigns.')

# ── Key Metrics (two-column) ──
doc.heading('2. Key Metrics', level=1)
doc.rule()
doc.two_column_table(
    ['Total Spend: $793.95', 'Active Campaigns: 4'],
    ['Blended ROAS: 0.70x', 'Top ROAS: 2.83x (Test)'],
)

# ── Campaign Breakdown ──
doc.heading('3. Campaign Performance', level=1)
doc.rule()
doc.table(
    headers=['Campaign', 'Spend', 'ROAS', 'Status'],
    rows=[
        ['Prospecting', '$320', {'text': '0.55x', 'color': 'error', 'bold': True}, 'Active'],
        ['ASC', '$200', {'text': '0.38x', 'color': 'error', 'bold': True}, 'Active'],
        ['BOF', '$137', {'text': '1.55x', 'color': 'success', 'bold': True}, 'Active'],
        ['Test', '$136', {'text': '2.83x', 'color': 'success', 'bold': True}, 'Active'],
    ],
    col_widths=[2.5, 1.2, 1.2, 1.2],
    header_bg='primary', header_fg='text_on_primary',
)

# ── Chart ──
doc.image(f'{WORKSPACE}/roas_chart.png', width=6)
doc.caption('Figure 1: ROAS by Campaign')

# ── Recommendations ──
doc.heading('4. Recommendations', level=1)
doc.rule()
doc.bullet('<b>Pause Prospecting</b> — 0.55x ROAS, reallocate budget to BOF.')
doc.bullet('<b>Scale BOF</b> — 1.55x ROAS with $137 spend, room to grow.')
doc.bullet('<b>Expand Testing</b> — 2.83x ROAS is the highest performer.')
doc.bullet('<b>Review ASC targeting</b> — 0.38x ROAS suggests audience/creative issues.')

doc.save(f'{WORKSPACE}/report.docx')
result = {"title": "B&M Performance Report", "description": "Multi-page Word document with cover page and recommendations."}
```

## Raw API (fallback)

For anything the library doesn't cover, use `doc.raw`:

```python
doc = Doc()
raw = doc.raw  # docx.Document object

# Helpers also exported:
from marble_docx import shade_cell, replace_image
shade_cell(cell, '1A73E8')
replace_image(doc, 0, f'{WORKSPACE}/new_chart.png', width=5.0)
```

## Editing an Existing DOCX

For edits (fix text, update a table, remove a section), open the existing file — do NOT rebuild from scratch.

```python
from docx import Document

doc = Document(f'{WORKSPACE}/report.docx')
```

### Navigate paragraphs
```python
for i, para in enumerate(doc.paragraphs):
    if para.text.strip():
        print(i, para.style.name, para.text[:80])
```

### Change text in a paragraph
```python
para = doc.paragraphs[5]
for run in para.runs:
    run.text = run.text.replace('old value', 'new value')
```

### Replace an entire paragraph's text
```python
para = doc.paragraphs[5]
para.clear()
run = para.add_run('New paragraph text')
run.font.size = Pt(11)
```

### Delete a paragraph
```python
para = doc.paragraphs[5]
p = para._element
p.getparent().remove(p)
```

### Modify a table cell
```python
table = doc.tables[0]  # first table
table.cell(1, 2).text = '$1,250'  # row 1, col 2
```

### Add a row to an existing table
```python
table = doc.tables[0]
row = table.add_row()
row.cells[0].text = 'New Campaign'
row.cells[1].text = '$500'
```

### Replace an image (e.g. regenerate a chart at different size)
```python
from marble_docx import replace_image

doc = Document(f'{WORKSPACE}/report.docx')
# List images to find the right index
for i, shape in enumerate(doc.inline_shapes):
    print(i, shape.width, shape.height)
# Replace image 0 with a new file, optionally resize
replace_image(doc, 0, f'{WORKSPACE}/new_chart.png', width=5.0)
doc.save(f'{WORKSPACE}/report.docx')
```

### Save back
```python
doc.save(f'{WORKSPACE}/report.docx')
result = {"title": "Updated Report", "description": "Fixed table values"}
```

### When to edit vs rebuild
- **Edit**: fix text, update table cells, delete a paragraph, change formatting, replace an image — use `Document(path)`
- **Rebuild section**: if a whole section is wrong, delete those paragraphs and add new ones
- **Full rebuild**: only if the entire structure needs to change

## Saving

Always save to WORKSPACE:
```python
doc.save(f'{WORKSPACE}/filename.docx')
```
