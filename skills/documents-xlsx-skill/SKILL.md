---
name: documents-xlsx-skill
description: "Use when generating Excel workbooks (.xlsx). Pandas + openpyxl patterns for multiple sheets, number formats, freeze panes, formulas."
---
# XLSX (Excel) Document Generation Skill

Generate downloadable \`.xlsx\` files for structured tabular output that CSV cannot express: multiple sheets, formulas, formatted cells, frozen headers, currency / percent / date number formats. If the user says "Excel" — produce \`.xlsx\`, not CSV.

## When xlsx vs csv

Pick **xlsx** if ANY of these are true:
- More than one logical table (use multiple sheets)
- Formatted cells needed (currency, percent, date, bold headers, column widths, freeze panes)
- The user said "Excel", "spreadsheet", "xlsx", "workbook"
- Formulas are required
- The output is a deliverable meant to be opened in Excel / Google Sheets

Pick **csv** if the output is a single flat table meant for pipeline interchange, raw data dump, or when the file will be read programmatically, not humans.

When in doubt → xlsx.

## Output path convention

- Deliverables: \`f'{WORKSPACE}/<descriptive-name>.xlsx'\` — auto-detected and uploaded.
- Intermediate working files: \`f'{WORKSPACE}/tmp_<name>.xlsx'\` — \`tmp_\` prefix skips auto-upload.
- Never write outside \`{WORKSPACE}\`. Never use \`/tmp/\` directly.
- One file per delivery. Multiple **sheets** inside one file — not multiple files.

## Pattern A — single-sheet (pandas, simplest)

\`\`\`python
import pandas as pd
df = pd.DataFrame(rows)
df.to_excel(f'{WORKSPACE}/campaign-report.xlsx', index=False, sheet_name='Summary', engine='openpyxl')
\`\`\`

\`index=False\` is almost always right. Omitting it writes the pandas index as a leading column and confuses users.

## Pattern B — multi-sheet (pandas)

\`\`\`python
import pandas as pd
with pd.ExcelWriter(f'{WORKSPACE}/performance.xlsx', engine='openpyxl') as w:
    summary_df.to_excel(w, sheet_name='Summary', index=False)
    campaigns_df.to_excel(w, sheet_name='Campaign Detail', index=False)
    weekly_df.to_excel(w, sheet_name='Weekly Trend', index=False)
\`\`\`

## Pattern C — formatted (openpyxl, for polished reports)

Use when cell colors, number formats, frozen headers, custom column widths, or formulas are required.

\`\`\`python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

wb = Workbook()
ws = wb.active
ws.title = 'Summary'

headers = ['Campaign', 'Spend', 'Revenue', 'ROAS']
ws.append(headers)

# Bold + branded header row
header_font = Font(bold=True, color='FFFFFF')
header_fill = PatternFill('solid', fgColor='006E78')
for cell in ws[1]:
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center')

# Data rows
for row in rows:
    ws.append([row['campaign'], row['spend'], row['revenue'], row['roas']])

# Currency formatting on Spend + Revenue
for r in range(2, ws.max_row + 1):
    ws.cell(row=r, column=2).number_format = '"$"#,##0.00'
    ws.cell(row=r, column=3).number_format = '"$"#,##0.00'
    ws.cell(row=r, column=4).number_format = '0.00"x"'

# Freeze header + widen columns
ws.freeze_panes = 'A2'
ws.column_dimensions['A'].width = 32
ws.column_dimensions['B'].width = 14
ws.column_dimensions['C'].width = 14
ws.column_dimensions['D'].width = 10

wb.save(f'{WORKSPACE}/performance.xlsx')
\`\`\`

Formulas — write as strings starting with \`=\`:

\`\`\`python
ws['D2'] = '=C2/B2'   # openpyxl does NOT evaluate; Excel computes on open
\`\`\`

For pre-computed totals (recommended when the file must display a numeric value without being opened in Excel first), calculate the total in pandas and write the literal number — not a formula.

## Critical rules (read before writing code)

- **Sheet names**: max 31 chars; no \`: \\ / ? * [ ]\`. Sanitise with \`re.sub(r'[:\\\\/\\?\\*\\[\\]]', '', name)[:31]\`.
- **Unique sheet names**: duplicates raise \`ValueError\`. Dedupe before calling \`to_excel\`.
- **\`index=False\`** on \`to_excel\` calls unless you specifically want the index as a column.
- **Engine**: use \`engine='openpyxl'\` (consistent, vetted). Don't use xlsxwriter — openpyxl covers every case we need and is what pandas defaults to for \`.xlsx\`.
- **Formulas are not evaluated by openpyxl** — the file opens with \`#VALUE!\` / blank until Excel computes. If the consumer will not open in Excel, write literal pre-computed values instead.
- **Hard cell cap**: 1,048,576 rows × 16,384 columns per sheet. Split across sheets if exceeded.
- **25 MB upload cap**. Down-sample or split if the workbook is large.
- **No hardcoded data**. Always load from workspace files via \`dataSources\` or previous saves.
- **Never use CSV as a substitute** when the user asked for Excel. CSV has no formatting, no sheets, no formulas.

## Typical ads report (end-to-end example)

\`\`\`python
import pandas as pd
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment

# 1. Build data with pandas
df_summary = pd.DataFrame([
    {'Metric': 'Total Spend', 'Value': total_spend},
    {'Metric': 'Total Revenue', 'Value': total_revenue},
    {'Metric': 'Overall ROAS', 'Value': overall_roas},
])
df_campaigns = campaigns_df  # from earlier analysis
df_weekly = weekly_df

# 2. Write all sheets
out = f'{WORKSPACE}/ads-performance-report.xlsx'
with pd.ExcelWriter(out, engine='openpyxl') as w:
    df_summary.to_excel(w, sheet_name='Overview', index=False)
    df_campaigns.to_excel(w, sheet_name='Campaign Breakdown', index=False)
    df_weekly.to_excel(w, sheet_name='Weekly Trend', index=False)

# 3. Re-open for formatting
wb = load_workbook(out)
for sheet_name in wb.sheetnames:
    ws = wb[sheet_name]
    # Header styling
    for cell in ws[1]:
        cell.font = Font(bold=True, color='FFFFFF')
        cell.fill = PatternFill('solid', fgColor='006E78')
        cell.alignment = Alignment(horizontal='center')
    ws.freeze_panes = 'A2'
    # Auto-widen based on max content length per column
    for col_idx, col_cells in enumerate(ws.columns, start=1):
        max_len = max((len(str(c.value)) for c in col_cells if c.value is not None), default=10)
        ws.column_dimensions[ws.cell(row=1, column=col_idx).column_letter].width = min(max_len + 2, 40)

wb.save(out)
\`\`\`

## Verification checklist (agent must confirm before finishing)

- [ ] File saved under \`{WORKSPACE}/\`, ends in \`.xlsx\`, no \`tmp_\` prefix
- [ ] All sheet names ≤ 31 chars, no forbidden chars, unique
- [ ] Headers bolded, freeze-panes set (unless trivial single-row data)
- [ ] Currency / percent / date columns have \`number_format\` applied
- [ ] No hardcoded sample data in the code
- [ ] File size < 25 MB
