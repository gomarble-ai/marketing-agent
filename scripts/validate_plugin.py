#!/usr/bin/env python3
"""
Validate the plugin package against the OpenAI plugin directory rules and the Agent Skills /
Codex skill rules. Run from the repo root (or pass a path, e.g. an unzipped upload):

    python3 scripts/validate_plugin.py [plugin_root]

Exits 1 on any error. Rules come from developers.openai.com/plugins/deploy/submission(-errors)
and the Codex skill-creator validator (allowed front matter keys, name format, no angle brackets).
Needs PyYAML.
"""
import json
import os
import re
import struct
import sys

import yaml

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
errors, warnings = [], []


def err(code, msg):
    errors.append(f"{code}: {msg}")


def warn(code, msg):
    warnings.append(f"{code}: {msg}")


def path(*p):
    return os.path.join(ROOT, *p)


# ─── Codex manifest ───────────────────────────────────────────
m = json.load(open(path(".codex-plugin", "plugin.json")))
name = m.get("name", "")
if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name) or len(name) > 64:
    err("plugin_name_format", name)
if not re.fullmatch(r"\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?", m.get("version", "")):
    err("plugin_version_not_semver", m.get("version"))
desc = m.get("description", "")
if not desc or len(desc) > 1024:
    err("plugin_description", f"length {len(desc)} (1-1024)")
if not m.get("author", {}).get("name"):
    err("plugin_developer_missing", "author.name")
for k in ("homepage",):
    if k in m and not m[k].startswith("https://"):
        err(f"plugin_{k}_format", m[k])
if m.get("skills") not in ("./skills/", "./skills"):
    err("plugin_skills_path_unsupported", m.get("skills"))
if m.get("mcpServers") != "./.mcp.json":
    err("plugin_mcp_path_unsupported", m.get("mcpServers"))

i = m.get("interface") or {}
for k, limit in {"displayName": 30, "shortDescription": 30, "longDescription": 4000, "developerName": 80}.items():
    v = i.get(k)
    if not v:
        err(f"{k}_missing", k)
    elif len(v) > limit:
        err(f"{k}_too_long", f"{len(v)} > {limit}")
if "\n" in i.get("shortDescription", ""):
    err("shortDescription", "must be one line")
CATEGORIES = ["Productivity", "Creativity", "Developer Tools", "Business & Operations", "Data & Analytics",
              "Communication", "Education & Research", "Security", "Finance", "Healthcare", "Travel",
              "Entertainment", "Other"]
if i.get("category") not in CATEGORIES:
    err("plugin_category_unknown", i.get("category"))
caps = i.get("capabilities")
if not isinstance(caps, list) or len(caps) > 20 or any(not c or len(c) > 120 for c in caps):
    err("capabilities", "list of at most 20 non-empty strings, 120 chars each")
for k in ("websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"):
    v = i.get(k)
    if not v:
        err(k, "required for MCP review")
    elif not v.startswith("https://"):
        err(f"{k}_format", v)
prompts = i.get("defaultPrompt", [])
prompts = [prompts] if isinstance(prompts, str) else prompts
if len(prompts) > 3 or any(len(p) > 128 or "\n" in p for p in prompts):
    err("defaultPrompt", "at most 3, one line, 128 chars each")


def luminance(h):
    c = [int(h[j:j + 2], 16) / 255 for j in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    hi, lo = sorted([luminance(a), luminance(b)], reverse=True)
    return (hi + 0.05) / (lo + 0.05)


for key, bg in (("brandColor", "#FFFFFF"), ("brandColorDark", "#212121")):
    if key in i:
        v = i[key]
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", v) or contrast(v, bg) < 2:
            err(key, f"{v}: six-digit hex with at least 2:1 contrast against {bg}")


def png_size(fp):
    with open(fp, "rb") as f:
        head = f.read(24)
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", head[16:24])


for key in ("composerIcon", "logo", "composerIconDark", "logoDark"):
    if key not in i:
        if key in ("composerIcon", "logo"):
            err(f"plugin_{key}_path_missing", key)
        continue
    p = i[key]
    if not p.startswith("./"):
        err("branding_asset_path_missing_root_prefix", p)
    fp = path(p)
    if not os.path.isfile(fp):
        err("declared_asset_file_missing", p)
        continue
    if os.path.getsize(fp) > 5 * 1024 * 1024:
        err("image_file_too_large", p)
    if fp.endswith(".png"):
        size = png_size(fp)
        if not size:
            err("raster_image_decode_failed", p)
        elif size[0] != size[1] or size[0] < 48 or size[0] > 4096:
            err("raster_image_size", f"{p} is {size[0]}x{size[1]} (square, 48-4096)")
    elif not fp.endswith(".svg"):
        warn("image_format", f"{p}: checked only for PNG and SVG here")

x = m.get("extensions", {}).get("com.openai", {})
onboarding = x.get("onboardingSkill")
if onboarding and not os.path.isfile(path(onboarding)):
    err("onboardingSkill", f"{onboarding} missing")
review = x.get("review", {})
cases = review.get("test_cases", {})
pos, neg = cases.get("positive", []), cases.get("negative", [])
if len(pos) != 5:
    err("test_cases.positive", f"{len(pos)} (exactly 5 for MCP review)")
if len(neg) != 3:
    err("test_cases.negative", f"{len(neg)} (exactly 3 for MCP review)")
for c in pos:
    for k in ("description", "prompt", "tools_triggered", "expected_behavior"):
        if not c.get(k):
            err("positive test case", f"missing {k}")
for c in neg:
    for k in ("description", "prompt"):
        if not c.get(k):
            err("negative test case", f"missing {k}")
raw = json.dumps(m)
for forbidden in ("test_credentials", "reviewer_instructions"):
    if forbidden in raw:
        err("forbidden field", forbidden)
if not review.get("demo_recording_url"):
    warn("demo_recording_url", "not in the package; required before MCP review (can be set in the dashboard)")

tools_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "connector-tools.json")
if os.path.isfile(tools_file):
    tools = set(json.load(open(tools_file))["tools"])
    for c in pos:
        for t in (s.strip() for s in c.get("tools_triggered", "").split(",")):
            if t and t not in tools:
                err("tools_triggered", f"{t} is not a connector tool")

listing = " ".join([i.get("shortDescription", ""), i.get("longDescription", ""), desc]).lower()
for w in ("free plan", "free trial", "pricing", "discount", "subscription", "upgrade", "7-day trial"):
    if w in listing:
        err("listing_promotion", f"listing text mentions '{w}' (no pricing or promotions)")

# ─── MCP config ───────────────────────────────────────────────
mcp = json.load(open(path(".mcp.json")))
servers = mcp.get("mcpServers")
if not isinstance(servers, dict) or not servers:
    err("mcp_servers_missing", ".mcp.json needs a top-level mcpServers object")
else:
    if len(servers) != 1:
        err("mcp", "exactly one server (plugin-level review cases need one)")
    for k, v in servers.items():
        if not isinstance(v, dict) or not v.get("url", "").startswith("https://"):
            err("mcp_server", f"{k} needs an https url")
extra = set(mcp) - {"mcpServers"}
if extra:
    err("mcp_extra_keys", f".mcp.json has {sorted(extra)}; only mcpServers is read")

# ─── Package layout ───────────────────────────────────────────
for d in ("commands", "agents", "hooks"):
    if os.path.isdir(path(d)):
        err("unsupported_component", f"{d}/ (convert to skills)")
for f in (".app.json",):
    if os.path.exists(path(f)):
        err("unsupported_component", f)

# ─── Skills (Agent Skills spec + Codex skill-creator rules) ───
ALLOWED_KEYS = {"name", "description", "license", "allowed-tools", "metadata"}
seen = {}
skills_dir = path("skills")
for d in sorted(os.listdir(skills_dir)):
    sp = os.path.join(skills_dir, d, "SKILL.md")
    if not os.path.isfile(sp):
        if os.path.isdir(os.path.join(skills_dir, d)):
            err("skill_manifest_missing", d)
        continue
    text = open(sp, encoding="utf-8").read()
    fm_match = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not fm_match:
        err("skill_frontmatter", d)
        continue
    fm = yaml.safe_load(fm_match.group(1))
    body = fm_match.group(2).strip()
    if not isinstance(fm, dict):
        err("skill_frontmatter_wrong_type", d)
        continue
    extra_keys = set(fm) - ALLOWED_KEYS
    if extra_keys:
        err("skill_frontmatter_keys", f"{d}: unexpected {sorted(extra_keys)}")
    sname, sdesc = fm.get("name"), fm.get("description")
    if not isinstance(sname, str) or not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", sname) or len(sname) > 64:
        err("skill_name", f"{d}: {sname!r}")
    elif sname != d:
        err("skill_name_folder", f"{d}: name is {sname}")
    if not isinstance(sdesc, str) or not sdesc.strip():
        err("skill_description_missing", d)
    else:
        if len(sdesc) > 1024:
            err("skill_description_too_long", f"{d}: {len(sdesc)}")
        if "<" in sdesc or ">" in sdesc:
            err("skill_description_angle_brackets", d)
    if not body:
        err("skill_body_empty", d)
    if len(f"{name}:{sname}") > 64:
        err("skill_identity_too_long", sname)
    seen[sname] = seen.get(sname, 0) + 1
    if re.search(r"\$ARGUMENTS", text):
        err("skill_arguments_placeholder", d)
    if re.search(r"(?i)\bclaude\b(?! code)", text):
        warn("skill_mentions_claude", d)
for k, v in seen.items():
    if v > 1:
        err("skill_identity_duplicate", k)

print(f"{len(seen)} skills | {len(errors)} errors | {len(warnings)} warnings")
for e in errors:
    print("  ERROR", e)
for w in warnings:
    print("  WARN ", w)
sys.exit(1 if errors else 0)
