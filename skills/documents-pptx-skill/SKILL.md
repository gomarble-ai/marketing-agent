---
name: documents-pptx-skill
description: "Use when generating PowerPoint presentations (.pptx). Uses the marble_pptx API."
---
# Python-pptx Skill: PowerPoint Presentation Generation

## Marble Library (PREFERRED)

Use the `marble_pptx` helper library. It provides cover slides, section dividers, KPI cards, tables, charts, card grids, stat callouts, two-column layouts, and icon rows — all with automatic theming, backgrounds, and slide numbers.

**IMPORTANT**: Always use the library helpers below. Never manually create backgrounds, slide numbers, helper functions, or color constants — the library handles all of this.

This skill is the **complete API reference** — all palettes, font pairs, and methods are documented below. Use them directly in your code without any exploration calls.

```python
from marble_pptx import Deck

deck = Deck(palette='ocean', fonts='modern')
# palette: midnight, forest, coral, terracotta, ocean, charcoal, teal, berry, sage, cherry
# fonts: classic, modern, bold, elegant, clean
# Or: Deck() for default light theme, Deck('dark') for dark theme
```

### API Quick Reference

| Method | Purpose |
|--------|---------|
| `Deck(theme, palette, fonts, width, height)` | Create new presentation. `theme='light'`/`'dark'`/dict, `palette` for named colors, `fonts` for font pair |
| `Deck.open(path, palette, fonts)` | Open existing PPTX for appending themed slides (edits without rebuild) |
| `deck.cover_slide(title, subtitle, footer, style)` | Cover/closing slide. `style='bar'` (default), `'dark'`, or `'center'` |
| `deck.section_slide(title, subtitle)` | Bold section divider (dark bg, large centered text) |
| `deck.add_slide(title, subtitle)` | Content slide with bg + slide number + optional title block |
| `s.header_bar(title, subtitle, height, color)` | Full-width colored bar with white title |
| `s.text(txt, left, top, width, height, size, bold, italic, color, align, font)` | Styled text box. Supports `<b>` and `<i>` |
| `s.title(txt, subtitle)` | Section title (32pt primary) + subtitle + divider |
| `s.kpi(left, top, width, height, label, value, value_color, sub)` | KPI card with border |
| `s.stat_callout(value, label, sub, left, top, width, height, value_size, value_color)` | Hero metric — large number (60-72pt) centered |
| `s.two_column(left_content, right_content, left, top, width, height, gap)` | Two-column layout via callables (also accepts `left_fn`/`right_fn`) |
| `s.icon_text_row(items, left, top, width, height, icon_size, icon_color)` | Row of circle icons + title + value. Items: `{'icon', 'title', 'body'}` |
| `s.callout(txt, left, top, width, height, fill, border)` | Tinted insight box |
| `s.table(headers, rows, left, top, width, col_widths, header_bg, header_fg)` | Themed table with alternating rows. Returns table with `._bottom` (y-coordinate of table bottom) |
| `s.vbars(labels, values, left, top, width, height, fmt, colors, color_fn, ref_line)` | Vertical bar chart |
| `s.hbars(labels, values, left, top, width, height, fmt, colors, color_fn, label_width)` | Horizontal bar chart |
| `s.cards(items, cols, left, top, width, height)` | Grid of titled cards with accent strips |
| `s.insights([(num, title, body), ...], top, row_height, left, width)` | Numbered insight cards. Use `left`/`width` for side-by-side layouts |
| `s.divider(left, top, width)` | Horizontal line |
| `s.rect(left, top, width, height, fill, radius, border)` | Rectangle shape |
| `s.accent_bar(left, top, width, height, color)` | Thin accent bar |
| `s.image(path, left, top, width, height)` | Insert image |
| `s.note(txt)` | Small italic footnote at bottom |
| `s.raw` | Access underlying `pptx.slide.Slide` |

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

### 1. Pick a content-informed palette

Always specify a `palette` — never use the default blue for every deck. Match the palette to the subject matter or brand.

### 2. Typography hierarchy

| Element | Size | Weight |
|---------|------|--------|
| Cover title | 38-42pt | Bold |
| Section title | 32pt | Bold |
| Slide title | 28pt | Bold |
| Body text | 14-18pt | Regular |
| Caption / footnote | 11-13pt | Regular/Italic |
| **Minimum** | **12pt** | — |

Use heading font for titles. Use body font for everything else.

### 3. Layout variety — CRITICAL

**Vary layouts across slides.** Never use the same layout on consecutive slides. Mix from:
- **KPI row** — 3-4 `kpi()` cards in a row for metrics
- **Stat callout** — `stat_callout()` for a single hero number
- **Two-column** — `two_column()` for side-by-side content (e.g., chart + insights)
- **Cards grid** — `cards()` for 2-6 takeaways
- **Table** — `table()` for detailed data
- **Chart + insight** — chart image + callout below
- **Icon row** — `icon_text_row()` for 3-5 quick metrics with visual anchors
- **Horizontal bars** — `hbars()` for ranked comparisons
- **Vertical bars** — `vbars()` for time series or category comparisons

### 4. Every slide needs a visual element

Never make a slide that is only text. Each slide must have at least one of: chart image, KPI card, stat callout, icon row, cards, table, or bar chart.

### 5. Spacing rules

| Rule | Value |
|------|-------|
| Minimum side margins | 0.5" from slide edges |
| Space between elements | 0.3" minimum |
| Title to first content | top=1.7" (after title block ends at ~1.5") |
| Footer / note area | below 6.8" |
| Card grid bottom | never below 6.5" |
| KPI card height | 1.8-2.2" typical |
| KPI card width | 3.0-4.0" typical |

### 6. Color coding

- **Success / positive**: `'success'` (green)
- **Error / negative**: `'error'` (red)
- **Warning / caution**: `'warning'` (yellow)
- **Emphasis**: `'primary'` (palette primary)
- **De-emphasis**: `'secondary'` (gray)

### 7. Use `._bottom` to position elements after tables

Tables vary in height based on row count. Use the returned `._bottom` attribute + a gap to place the next element:
```python
tbl = s.table(headers, rows, top=1.7, ...)
s.two_column(left_fn, right_fn, top=tbl._bottom + 0.2)
```

### 8. Use `left`/`width` on `insights()` for side-by-side layouts

By default `insights()` renders full-width. To place next to a chart:
```python
s.image(f'{WORKSPACE}/chart.png', left=0.4, top=1.65, width=5.8, height=3.3)
s.insights([...], left=6.5, top=1.65, width=6.0)
```

### 9. Embedding ad creatives, thumbnails, and other platform-fetched images

When a slide needs real ad creatives (e.g. top-performer thumbnails from `facebook_analyze_ad_creative_by_id_or_url`, competitor ad images from the ad library, video stills from creative analysis), pass each image URL as an `attachment_url` data source on the SAME `advanced_analysis` call that builds the slide. The sandbox runtime downloads them into the workspace before your code runs — `s.image()` then takes the local path:

```python
# Tool call payload:
# dataSources: [
#   {type: 'attachment_url', identifier: 'https://cdn.fbcdn.net/.../thumb_a.jpg', alias: 'top_ad_1'},
#   {type: 'attachment_url', identifier: 'https://cdn.fbcdn.net/.../thumb_b.png', alias: 'top_ad_2'},
# ]

# In code:
from marble_pptx import Deck
deck = Deck(palette='ocean')
s = deck.add_slide(title='Top 3 Performing Creatives')
s.image(f'{WORKSPACE}/top_ad_1.jpg', left=0.5, top=1.7, width=4)
s.image(f'{WORKSPACE}/top_ad_2.png', left=4.7, top=1.7, width=4)
# ...metrics, captions, callouts under each image...
deck.save(f'{WORKSPACE}/report.pptx')
```

Do NOT import `requests`/`urllib` to fetch image URLs from inside your code — network is blocked and the call will fail with DNS errors. The `attachment_url` mechanism is the supported path. Extensions (.jpg/.png/.webp/.gif/.mp4 etc.) are auto-detected from the URL or its Content-Type header.

## Anti-Patterns — DO NOT

1. **NEVER add accent lines under titles** — this is a telltale AI hallmark. The `title()` method already adds a divider.
2. **Don't repeat the same layout** on every slide — if you used KPI cards on slide 2, use a chart or table on slide 3.
3. **Don't center body text** — left-align paragraphs. Only center titles and stat callouts.
4. **Don't skimp on size contrast** — titles must be 28pt+ while body is 14-18pt. If they're close in size, the hierarchy is lost.
5. **Max 6-8 text lines per slide** — split content across multiple slides. Less is more.
6. **Don't overfill** — leave breathing room. 0.5" minimum margins, 0.3" between elements.
7. **Don't manually draw backgrounds or slide numbers** — `add_slide()` handles both.
8. **Don't manually create cover layouts** — use `cover_slide()`.
9. **Don't put more than 4 KPI cards in one row** — they'll be too narrow.
10. **Don't use tiny fonts** — minimum 12pt for anything visible.
11. **Respect slide count constraints** — if the user asks for "a 5-slide deck", produce exactly ~5 content slides (cover/closing are extra). Plan the slide outline BEFORE writing code: decide which content goes on which slide, pick one layout per slide (don't stack KPI cards + table + chart on one slide).

## Example — Multi-layout Deck

```python
from marble_pptx import Deck

deck = Deck(palette='ocean', fonts='modern')

# ── Slide 1: Cover ──
deck.cover_slide('B&M Advertising', subtitle='Weekly Performance Report',
                 footer='Meta Ads | GoMarble AI')

# ── Slide 2: Section divider ──
deck.section_slide('Account Overview')

# ── Slide 3: KPI row + callout ──
s = deck.add_slide(title='Account Summary', subtitle='Feb 17 – Feb 23, 2026')
s.kpi(0.7, 1.75, 3.6, 2.0, 'Total Spend', '$793.95')
s.kpi(4.7, 1.75, 3.6, 2.0, 'ROAS', '0.70x', value_color='error')
s.kpi(8.7, 1.75, 3.6, 2.0, 'Active Campaigns', '4', value_color='primary')
s.callout('Account-wide ROAS is 0.70x — below break-even (1.0x).', top=4.1)

# ── Slide 4: Stat callout (hero metric) ──
s = deck.add_slide(title='Revenue Highlight')
s.stat_callout('$2.4M', 'Total Revenue', sub='+23% vs previous period')

# ── Slide 5: Two-column (chart + insights) ──
s = deck.add_slide(title='Campaign Analysis')
def left(l, t, w, h):
    s.image(f'{WORKSPACE}/roas_chart.png', l, t, w, h)
def right(l, t, w, h):
    s.text('Key Findings:', l, t, w, 0.4, size=16, bold=True, color='primary')
    s.text('BOF campaign delivers 1.55x ROAS', l, t+0.5, w, 0.3, size=14)
    s.text('Prospecting needs optimization', l, t+0.9, w, 0.3, size=14)
    s.text('Test campaigns most efficient', l, t+1.3, w, 0.3, size=14)
s.two_column(left, right)

# ── Slide 6: Table ──
s = deck.add_slide(title='Campaign Breakdown', subtitle='Sorted by Spend')
s.table(
    headers=['Campaign', 'Spend', 'ROAS', 'Status'],
    rows=[
        ['Prospecting', '$320', {'text': '0.55x', 'color': 'error', 'bold': True}, 'Active'],
        ['ASC', '$200', {'text': '0.38x', 'color': 'error', 'bold': True}, 'Active'],
        ['BOF', '$137', {'text': '1.55x', 'color': 'success', 'bold': True}, 'Active'],
        ['Test', '$136', {'text': '2.83x', 'color': 'success', 'bold': True}, 'Active'],
    ],
    col_widths=[4.0, 2.5, 2.5, 2.5],
)

# ── Slide 7: Vertical bars with reference line ──
s = deck.add_slide(title='ROAS by Campaign')
s.vbars(
    labels=['Prospecting', 'ASC', 'BOF', 'Test'],
    values=[0.55, 0.38, 1.55, 2.83],
    fmt='{:.2f}x',
    color_fn=lambda v: 'success' if v >= 1.0 else 'error',
    ref_line={'value': 1.0, 'label': 'Break-even (1.0x)'},
)

# ── Slide 8: Cards grid (recommendations) ──
s = deck.add_slide(title='Recommendations')
s.cards([
    {'title': 'Pause Prospecting', 'body': '0.55x ROAS — reallocate budget to BOF.', 'accent': 'error'},
    {'title': 'Scale BOF', 'body': '1.55x ROAS with $137 spend — room to grow.', 'accent': 'success'},
    {'title': 'Expand Testing', 'body': '2.83x ROAS is highest — increase budget.', 'accent': 'success'},
    {'title': 'Review ASC Targeting', 'body': '0.38x ROAS — audience or creative issue.', 'accent': 'warning'},
], cols=2)

# ── Slide 9: Icon metric row ──
s = deck.add_slide(title='Quick Metrics')
s.icon_text_row([
    {'icon': '$', 'title': 'Spend', 'body': '$793'},
    {'icon': 'R', 'title': 'ROAS', 'body': '0.70x'},
    {'icon': '#', 'title': 'Campaigns', 'body': '4'},
    {'icon': '%', 'title': 'CTR', 'body': '2.1%'},
])

# ── Slide 10: Closing ──
deck.cover_slide('Thank You', footer='Powered by GoMarble AI', style='dark')

deck.save(f'{WORKSPACE}/report.pptx')
result = {"title": "B&M Advertising Report", "description": "10-slide performance deck with varied layouts."}
```

## Raw API (fallback)

For anything the library doesn't cover, use `s.raw`:

```python
s = deck.add_slide()
raw_slide = s.raw  # pptx.slide.Slide object — full python-pptx API available
```

## Editing an Existing PPTX

For edits (fix a slide, change text, move shapes), open the existing file — do NOT rebuild from scratch.

### Add themed slides to an existing deck (preferred)
```python
from marble_pptx import Deck

deck = Deck.open(f'{WORKSPACE}/report.pptx', palette='ocean', fonts='modern')
deck.cover_slide('Thank You', style='dark')
deck.add_slide(title='New Section')
deck.save(f'{WORKSPACE}/report.pptx')
```

### Low-level edits (text, shapes, positions)
```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation(f'{WORKSPACE}/report.pptx')
```

### Navigate slides (0-indexed)
```python
slide = prs.slides[2]  # slide 3
```

### List shapes on a slide
```python
for shape in slide.shapes:
    print(shape.shape_id, shape.name, shape.left, shape.top, shape.width, shape.height)
    if shape.has_text_frame:
        print('  text:', shape.text_frame.text[:80])
```

### Move or resize a shape
```python
shape.left = Inches(1.0)
shape.top = Inches(2.0)
shape.width = Inches(4.0)
shape.height = Inches(1.5)
```

### Change text in a shape
```python
for shape in slide.shapes:
    if shape.has_text_frame and 'Old Title' in shape.text:
        shape.text_frame.paragraphs[0].text = 'New Title'
```

### Delete a shape
```python
sp = shape._element
sp.getparent().remove(sp)
```

### Delete a slide (0-indexed)
```python
rId = prs.slides._sldIdLst[2].rId
prs.part.drop_rel(rId)
del prs.slides._sldIdLst[2]
```

### Replace an image on a slide (e.g. regenerate a chart)
```python
from marble_pptx import replace_image

prs = Presentation(f'{WORKSPACE}/report.pptx')
slide = prs.slides[3]  # slide 4
replace_image(slide, 0, f'{WORKSPACE}/new_chart.png', width=5.8)
prs.save(f'{WORKSPACE}/report.pptx')
```

### Save back
```python
prs.save(f'{WORKSPACE}/report.pptx')
result = {"title": "Updated Report", "description": "Fixed slide 3 layout"}
```

### When to edit vs rebuild
- **Edit**: fix text, reposition shapes, delete a shape, change colors, replace an image — use `Presentation(path)`
- **Add themed slides**: use `Deck.open(path, palette, fonts)` to append cover, section, or content slides with theming
- **Rebuild slide**: if the whole slide layout is wrong, delete that slide and add a new one using marble helpers
- **Full rebuild**: only if the entire structure needs to change

## Saving

Always save to WORKSPACE:
```python
deck.save(f'{WORKSPACE}/filename.pptx')
```
