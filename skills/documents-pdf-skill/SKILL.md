---
name: documents-pdf-skill
description: "Use when generating PDF documents. Uses the marble_pdf API."
---
# PDF Skill: HTML-Based Document Generation

## Marble Library (PREFERRED)

Use the `marble_pdf` helper library. It builds HTML internally and converts to PDF via WeasyPrint — giving you full CSS styling with a simple Python API.

**IMPORTANT**: Always use the library helpers below. Never manually define CSS, color constants, or helper functions — the library handles all of this.

This skill is the **complete API reference** — all palettes, font pairs, and methods are documented below.

```python
from marble_pdf import PDF

pdf = PDF(f'{WORKSPACE}/report.pdf', palette='ocean', fonts='modern')
# palette: midnight, forest, coral, terracotta, ocean, charcoal, teal, berry, sage, cherry
# fonts: classic, modern, bold, elegant, clean
# Or: PDF(path) for default light theme
```

### API Quick Reference

| Method | Purpose |
|--------|---------|
| `PDF(path, theme, pagesize, margins, palette, fonts)` | Create PDF. `palette` for named colors, `fonts` for font pair |
| `pdf.cover_page(title, subtitle, author, date)` | Professional cover page with accent lines. Auto page break after |
| `pdf.title(text)` | Title (28px, centered, primary) |
| `pdf.subtitle(text)` | Subtitle (17px, centered, secondary). Use after `title()` |
| `pdf.heading(text, level)` | Heading (level 1=18px, 2=14px). Use `pdf.hr()` after headings |
| `pdf.body(text)` | Body paragraph (11px). Supports `<b>`, `<i>`, `<font>`, `<sub>`, `<sup>` |
| `pdf.caption(text)` | Caption (9px, secondary) |
| `pdf.bullet(text)` | Bullet list item. Supports HTML markup. Consecutive bullets auto-wrapped in `<ul>` |
| `pdf.spacer(height)` | Vertical space (default 12px) |
| `pdf.hr(color)` | Horizontal rule (default: primary) |
| `pdf.table(headers, rows, col_widths, first_col_align, header_bg, header_fg)` | Themed table with alternating rows |
| `pdf.two_column(left_items, right_items, col_widths)` | Side-by-side content layout |
| `pdf.image(path, width, align, max_height)` | Insert image (auto-embedded as base64, height auto-scales) |
| `pdf.page_break()` | Page break |
| `pdf.build(page_numbers=True)` | Build final PDF. Call last |

### Direct HTML Mode (for full layout control)

When you need custom layouts beyond the builder API:

```python
from marble_pdf import html_to_pdf, theme_css

css = theme_css('ocean', fonts='modern')
html = f"""<html>
<head><style>{css}</style></head>
<body>
<h2>Custom Report</h2><hr>
<p>Full <b>CSS control</b> — use any HTML elements, flexbox, grid, etc.</p>
<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Revenue</td><td>$1.2M</td></tr>
</table>
<div class="page-break"></div>
<h2>Page 2</h2>
<p>Content continues...</p>
</body>
</html>"""
html_to_pdf(html, f'{WORKSPACE}/report.pdf')
```

Available CSS classes from `theme_css()`: `.caption`, `.subtitle`, `.cover-page`, `.cover-author`, `.cover-date`, `.two-col` + `.col`, `.chart`, `.bullets`, `.page-break`, `.spacer`, `.spacer-sm`, `.spacer-lg`, `.spacer-xl`.

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

For reports and long documents:

1. **Cover page** — `pdf.cover_page()` (includes auto page break)
2. **Executive Summary** — heading + hr + body
3. **Body sections** — each with heading + hr + content
4. **Appendix** — data tables, methodology

### 2. Always use `pdf.hr()` after section headings

```python
pdf.heading('1. Executive Summary')
pdf.hr()
pdf.body('Key findings...')
```

### 3. Inline formatting

Use standard HTML tags in `pdf.body()` and `pdf.bullet()`:
- `<b>bold</b>`, `<i>italic</i>`
- `<font color="#34a853">colored text</font>`
- `<sub>subscript</sub>`, `<sup>superscript</sup>`

### 4. Chart sizing (matplotlib)

| Scenario | figsize |
|----------|---------|
| Single chart per page | `figsize=(7, 3)` |
| Two charts per page | `figsize=(7, 2.5)` |
| Wide chart | `figsize=(7, 2)` |
| **Maximum height** | **figsize height ≤ 4** (taller overflows) |

### 5. Image rules

- **Only specify `width`** — height auto-scales. Never pass explicit `height`.
- Images are auto-embedded as base64 (no broken references).
- Use `max_height` param to constrain tall images (default 3.5").

### 6. Embedding ad creatives, thumbnails, and other platform-fetched images

When the PDF needs real images returned by previous tool calls (ad thumbnails from `facebook_analyze_ad_creative_by_id_or_url`, competitor ad images from the ad library, video stills, etc.), pass each image URL as an `attachment_url` data source on the SAME `advanced_analysis` call. The runtime downloads them before your code runs — `pdf.image()` takes the local path:

```python
# Tool call payload:
# dataSources: [
#   {type: 'attachment_url', identifier: 'https://cdn.fbcdn.net/.../thumb_a.jpg', alias: 'creative_1'},
#   {type: 'attachment_url', identifier: 'https://cdn.fbcdn.net/.../thumb_b.png', alias: 'creative_2'},
# ]

# In code:
from marble_pdf import PDF
pdf = PDF(f'{WORKSPACE}/report.pdf', palette='ocean')
pdf.heading('Top Performers')
pdf.hr()
pdf.image(f'{WORKSPACE}/creative_1.jpg', width=5)
pdf.caption('Figure 1: Outdoor Adventure (Video) — CTR 2.46%')
pdf.image(f'{WORKSPACE}/creative_2.png', width=5)
pdf.caption('Figure 2: Forest Boots — CTR 1.92%')
pdf.build()
```

Do NOT import `requests`/`urllib` from inside your code — network is blocked and the call will fail with DNS errors. The `attachment_url` mechanism is the supported path. Extensions (.jpg/.png/.webp/.gif etc.) are auto-detected.

## Anti-Patterns — DO NOT

1. **Don't forget `pdf.build()`** — it must be called last to finalize the PDF.
2. **Don't forget `pdf.hr()` after headings** — gives visual structure.
3. **Don't pass `height` to images** — only `width`. Height auto-scales.
4. **Don't use raw `\n` for spacing** — use separate `pdf.body()` calls or `pdf.spacer()`.
5. **NEVER import `pypdf`** — it is NOT available. Use `marble_pdf` only. There is no PDF reading/editing library — regenerate from data instead.
6. **Respect page count constraints** — if the user asks for "a 2-page report", the final PDF must be ~2 content pages (cover page is extra). Plan layout BEFORE writing code.

## Example — Professional Report

```python
from marble_pdf import PDF

pdf = PDF(f'{WORKSPACE}/report.pdf', palette='ocean', fonts='modern')

# — Cover page (auto page break) —
pdf.cover_page(
    'B&M Advertising Account',
    subtitle='Spend & ROAS Performance Report',
    author='GoMarble AI',
    date='February 17 – February 23, 2026',
)

# — Executive Summary —
pdf.heading('1. Executive Summary')
pdf.hr()
pdf.body('This report covers Meta Ads performance for B&M Advertising over the past 7 days.')
pdf.body('Total spend was <b>$793.95</b> with a blended ROAS of <b>0.70x</b>.')

# — Key Metrics (two-column) —
pdf.heading('2. Key Metrics')
pdf.hr()
pdf.two_column(
    ['<b>Total Spend:</b> $793.95', '<b>Active Campaigns:</b> 4'],
    ['<b>Blended ROAS:</b> 0.70x', '<b>Top ROAS:</b> 2.83x (Test)'],
)
pdf.spacer(12)

# — Campaign Breakdown —
pdf.heading('3. Campaign Performance')
pdf.hr()
pdf.table(
    headers=['Campaign', 'Spend', 'ROAS', 'Status'],
    rows=[
        ['Prospecting', '$320', '0.55x', 'Active'],
        ['ASC', '$200', '0.38x', 'Active'],
        ['BOF', '$137', '1.55x', 'Active'],
        ['Test', '$136', '2.83x', 'Active'],
    ],
    header_bg='primary', header_fg='text_on_primary',
)
pdf.spacer(8)

# — Chart —
pdf.image(f'{WORKSPACE}/roas_chart.png', width=5.8)
pdf.caption('Figure 1: ROAS by Campaign')

# — Recommendations —
pdf.page_break()
pdf.heading('4. Recommendations')
pdf.hr()
pdf.bullet('<b>Pause Prospecting</b> — 0.55x ROAS, reallocate budget to BOF.')
pdf.bullet('<b>Scale BOF</b> — 1.55x ROAS with $137 spend, room to grow.')
pdf.bullet('<b>Expand Testing</b> — 2.83x ROAS is the highest performer.')
pdf.bullet('<b>Review ASC targeting</b> — 0.38x ROAS suggests audience/creative issues.')

pdf.spacer(20)
pdf.caption('Data Source: Meta Ads Graph API | Report generated by GoMarble AI')

pdf.build()
result = {"title": "B&M Performance Report", "description": "Multi-page PDF with cover and recommendations."}
```

## Editing a PDF

`build()` saves an HTML file alongside the PDF (e.g., `report.pdf.html`). To edit, load the HTML, modify it, and re-convert — no need to rewrite the full generation code.

```python
from marble_pdf import html_to_pdf

# Load the saved HTML
with open(f'{WORKSPACE}/report.pdf.html', 'r') as f:
    html = f.read()

# Make targeted edits
html = html.replace('Total spend was <b>$793.95</b>', 'Total spend was <b>$850.00</b>')
html = html.replace('0.70x', '0.75x')

# Re-convert to PDF
html_to_pdf(html, f'{WORKSPACE}/report.pdf')
result = {"title": "Updated Report", "description": "Fixed spend and ROAS figures"}
```

### When to edit vs regenerate
- **Small text/number fixes** — load HTML, replace, re-convert (above)
- **Structural changes** (add/remove sections, reorder) — regenerate with `PDF()` builder from data files

## Saving

Save to WORKSPACE. Path is set at construction, call `pdf.build()` to finalize:
```python
pdf = PDF(f'{WORKSPACE}/filename.pdf')
# ... add content ...
pdf.build()
```
