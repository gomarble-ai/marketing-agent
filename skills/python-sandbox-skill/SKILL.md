---
name: python-sandbox-skill
description: "Foundation for any document generation skill (DOCX/PPTX/PDF/XLSX). Python-sandbox execution environment, available packages, file I/O conventions. Used internally by the document skills."
---
# Python Sandbox Skill: Document Generation & Advanced Patterns

## Document Generation

Libraries: python-docx (`import docx`), python-pptx (`import pptx`), reportlab (`import reportlab`), Pillow (`import PIL`), matplotlib (for charts)

- Set `result = {'title': 'Human Title', 'description': 'Brief desc'}` for document metadata
- For editing a previous document: use dataSources with type `'generated_document'`
- ALWAYS retrieve the appropriate document skill (docx-skill, pptx-skill, or pdf-skill) via the langfuse skill tool BEFORE writing generation code
- **After generation**: The UI automatically shows a document card with Download and View buttons. Keep your follow-up message brief (e.g. "Here's your report."). Do NOT add download links, page-by-page summaries, or repeat the document contents in chat.
- **CSV files**: CSV files saved to WORKSPACE are auto-uploaded just like DOCX/PDF/PPTX. Use `df.to_csv(f'{WORKSPACE}/export.csv', index=False)` to generate downloadable CSVs. Set `result = {'title': '...', 'description': '...'}` as usual.

### Editing Existing Documents

For fixes/edits, open the existing file from WORKSPACE — do NOT rebuild from scratch:
- **PPTX — add themed slides**: `Deck.open(f'{WORKSPACE}/file.pptx', palette='ocean')` — append cover/content slides with theming
- **PPTX — low-level edits**: `Presentation(f'{WORKSPACE}/file.pptx')` — modify specific slides/shapes, save back
- **DOCX**: `Document(f'{WORKSPACE}/file.docx')` — modify specific paragraphs/tables, save back
- **PDF**: Regenerate (ReportLab can't edit) — reload data from workspace files and rebuild

### Temp Files

Files prefixed with `tmp_` are excluded from document upload detection. If you need to save intermediate/temporary files, prefix them with `tmp_` (e.g. `tmp_chart.pptx`).

### Embedding images from URLs (ad thumbnails, video stills, creative assets)

When a previous tool returned image URLs (e.g. `thumbnail`, `thumbnail_url`, `image`, `asset_url`, `video`, `avatar` from `facebook_analyze_ad_creative_by_id_or_url`, competitor ad library, brand research, etc.) and you need to embed them in a document:

**DO NOT** import `requests` / `urllib` / `http` to fetch them — network is blocked inside your code and DNS will fail.

**DO** pass each URL as a separate `attachment_url` data source. The runtime downloads them into the workspace BEFORE your code runs, with the correct file extension auto-detected from the URL path or response Content-Type.

```python
# In the tool call:
# dataSources: [
#   {type: 'attachment_url', identifier: 'https://cdn.fbcdn.net/foo.jpg?...', alias: 'top_ad_1'},
#   {type: 'attachment_url', identifier: 'https://cdn.fbcdn.net/bar.png?...', alias: 'top_ad_2'},
#   {type: 'attachment_url', identifier: 'https://assets.gomarble.ai/.../baz.webp', alias: 'top_ad_3'},
# ]

# Then in your code, files exist at:
# {WORKSPACE}/top_ad_1.jpg, {WORKSPACE}/top_ad_2.png, {WORKSPACE}/top_ad_3.webp
# Use them directly with marble image helpers — no rename needed.

from marble_pptx import Deck
deck = Deck(palette='ocean')
s = deck.add_slide(title='Top Performers')
s.image(f'{WORKSPACE}/top_ad_1.jpg', left=0.7, top=1.7, width=4)
s.image(f'{WORKSPACE}/top_ad_2.png', left=4.9, top=1.7, width=4)
deck.save(f'{WORKSPACE}/report.pptx')
```

If a URL has no extension and no recognisable Content-Type, the file lands as `.csv` — verify with `workspace_files()` and rename via `os.rename(src, dst)` if needed (very rare).

### Chart PNGs for Document Embedding

Only generate chart PNGs when building a document. For chat-only analysis, the agent renders charts inline — do NOT save chart files.

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(7, 3))
ax.barh(names, values)
ax.set_xlabel('Spend ($)')
ax.set_title('Top 5 by Spend')
plt.tight_layout()
plt.savefig(f'{WORKSPACE}/chart_spend.png', dpi=150)
plt.close()
```

## Examples

### Example 1 — Explore structure first (ALWAYS do this)

```python
import json
with open(f'{WORKSPACE}/campaigns.json') as f:
    data = json.load(f)
items = data.get('results', data.get('data', []))
result = {
    'count': len(items),
    'keys': list(items[0].keys()) if items else [],
    'sample': items[0] if items else None
}
```

Check `dataStructure` in response for actual keys, types, sample values.

### Example 2 — Analyze (re-read file each call — variables don't persist)

```python
import json, pandas as pd
with open(f'{WORKSPACE}/campaigns.json') as f:
    items = json.load(f).get('data', [])
df = pd.DataFrame(items)
total_spend = float(df['spend'].astype(float).sum())
avg_roas = float(df['roas'].mean()) if 'roas' in df.columns else 0.0
result = {
    'total_spend': total_spend,
    'avg_roas': round(avg_roas, 2),
    'top5': df.nlargest(5, 'spend').to_dict('records')
}
```

For document generation code (DOCX/PPTX/PDF), retrieve the appropriate document skill — do not use this skill for document code patterns.
