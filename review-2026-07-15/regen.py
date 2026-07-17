#!/usr/bin/env python3
"""
Regenerates index.html for the 2026-07-15 FSAI helpdesk review page.

No external dependencies (no `markdown` package, no pandoc). Rebuild any
time more raw captures land:

    python3 regen.py

Reads:
  - articles/FS Ai Helpdesk Articles/Sales/how-to-work-a-lead.md
  - articles/FS Ai Helpdesk Articles/Sales/about-sales-analytics.md
  - articles/FS Ai Helpdesk Articles/Franchisee Portal/14-submitting-a-ticket.md
  - screenshots/how-to-work-a-lead/raw/*.png
  - screenshots/about-sales-analytics/raw/*.png (falls back to _fullpage refs if empty)
  - screenshots/*/raw/*.png captured today, for the Batch A gallery
Writes:
  - screenshots/review-2026-07-15/index.html
"""
import html
import os
import re
import sys
from datetime import date, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_ROOT = os.path.dirname(HERE)
SUITE_ROOT = os.path.dirname(SCREENSHOTS_ROOT)
ARTICLES_ROOT = os.path.join(SUITE_ROOT, "articles", "FS Ai Helpdesk Articles")

TODAY = date(2026, 7, 15)


# ---------------------------------------------------------------------------
# Minimal markdown -> HTML converter (headings, bold, links, lists, blockquotes)
# ---------------------------------------------------------------------------

def inline_md(text):
    text = html.escape(text, quote=False)
    # links [text](url)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    # bold **text**
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    return text


def render_markdown(md_text):
    lines = md_text.splitlines()
    out = []
    i = 0
    n = len(lines)

    def is_blank(l):
        return l.strip() == ""

    while i < n:
        line = lines[i]

        if is_blank(line):
            i += 1
            continue

        # Headings
        if line.startswith("### "):
            out.append(f"<h3>{inline_md(line[4:].strip())}</h3>")
            i += 1
            continue
        if line.startswith("## "):
            out.append(f"<h2>{inline_md(line[3:].strip())}</h2>")
            i += 1
            continue
        if line.startswith("# "):
            out.append(f"<h1>{inline_md(line[2:].strip())}</h1>")
            i += 1
            continue

        # Blockquote
        if line.startswith(">"):
            quote_lines = []
            while i < n and lines[i].startswith(">"):
                quote_lines.append(lines[i].lstrip(">").strip())
                i += 1
            out.append(
                '<blockquote>' + inline_md(" ".join(quote_lines)) + "</blockquote>"
            )
            continue

        # Unordered list
        if re.match(r"^\s*-\s+", line):
            items = []
            while i < n and re.match(r"^\s*-\s+", lines[i]):
                item_text = re.sub(r"^\s*-\s+", "", lines[i])
                items.append(f"<li>{inline_md(item_text)}</li>")
                i += 1
            out.append("<ul>" + "".join(items) + "</ul>")
            continue

        # Ordered list
        if re.match(r"^\s*\d+\.\s+", line):
            items = []
            while i < n and re.match(r"^\s*\d+\.\s+", lines[i]):
                item_text = re.sub(r"^\s*\d+\.\s+", "", lines[i])
                items.append(f"<li>{inline_md(item_text)}</li>")
                i += 1
            out.append("<ol>" + "".join(items) + "</ol>")
            continue

        # Paragraph (collect until blank line or a line starting a new block)
        para_lines = []
        while i < n and not is_blank(lines[i]) and not re.match(
            r"^(#{1,3}\s|>|\s*-\s+|\s*\d+\.\s+)", lines[i]
        ):
            para_lines.append(lines[i])
            i += 1
        if para_lines:
            out.append(f"<p>{inline_md(' '.join(para_lines))}</p>")
        else:
            # Safety valve: single unmatched line, avoid infinite loop
            out.append(f"<p>{inline_md(lines[i])}</p>")
            i += 1

    return "\n".join(out)


def render_markdown_with_images(md_text, image_map, fallback_images=None,
                                 fallback_label=None, full_width_fallback=False):
    """
    Renders markdown, injecting <figure> blocks after the <h3> section whose
    heading text matches a key in image_map (case-insensitive substring match
    on the heading). Any images not claimed by a section land in a trailing
    gallery. If image_map is empty and fallback_images is given, those are
    appended full-width at the end under fallback_label.
    """
    lines = md_text.splitlines()
    blocks = []
    i = 0
    n = len(lines)
    current_heading = None

    def is_blank(l):
        return l.strip() == ""

    remaining = dict(image_map)  # heading-key -> [(path, caption)]
    used_any = False

    while i < n:
        line = lines[i]
        if is_blank(line):
            i += 1
            continue
        if line.startswith("### "):
            heading_text = line[4:].strip()
            blocks.append(f"<h3>{inline_md(heading_text)}</h3>")
            i += 1
            # find a matching key
            match_key = None
            for key in remaining:
                if key.lower() in heading_text.lower():
                    match_key = key
                    break
            if match_key is not None:
                imgs = remaining.pop(match_key)
                if imgs:
                    used_any = True
                    blocks.append(figure_gallery(imgs))
            continue
        if line.startswith("# "):
            blocks.append(f"<h1>{inline_md(line[2:].strip())}</h1>")
            i += 1
            continue
        if line.startswith(">"):
            quote_lines = []
            while i < n and lines[i].startswith(">"):
                quote_lines.append(lines[i].lstrip(">").strip())
                i += 1
            blocks.append(
                '<blockquote>' + inline_md(" ".join(quote_lines)) + "</blockquote>"
            )
            continue
        if re.match(r"^\s*-\s+", line):
            items = []
            while i < n and re.match(r"^\s*-\s+", lines[i]):
                item_text = re.sub(r"^\s*-\s+", "", lines[i])
                items.append(f"<li>{inline_md(item_text)}</li>")
                i += 1
            blocks.append("<ul>" + "".join(items) + "</ul>")
            continue
        if re.match(r"^\s*\d+\.\s+", line):
            items = []
            while i < n and re.match(r"^\s*\d+\.\s+", lines[i]):
                item_text = re.sub(r"^\s*\d+\.\s+", "", lines[i])
                items.append(f"<li>{inline_md(item_text)}</li>")
                i += 1
            blocks.append("<ol>" + "".join(items) + "</ol>")
            continue
        para_lines = []
        while i < n and not is_blank(lines[i]) and not re.match(
            r"^(#{1,3}\s|>|\s*-\s+|\s*\d+\.\s+)", lines[i]
        ):
            para_lines.append(lines[i])
            i += 1
        if para_lines:
            blocks.append(f"<p>{inline_md(' '.join(para_lines))}</p>")
        else:
            blocks.append(f"<p>{inline_md(lines[i])}</p>")
            i += 1

    # any leftover mapped images that never matched a heading -> trailing gallery
    leftovers = []
    for key, imgs in remaining.items():
        leftovers.extend(imgs)
    if leftovers:
        blocks.append('<h3>More shots</h3>')
        blocks.append(figure_gallery(leftovers))
        used_any = True

    image_count = sum(len(v) for v in image_map.values())

    if not used_any and fallback_images:
        blocks.append(f'<h3>{html.escape(fallback_label or "Shots")}</h3>')
        blocks.append(figure_gallery(fallback_images, full_width=full_width_fallback))
        image_count = len(fallback_images)

    return "\n".join(blocks), image_count


def figure_gallery(items, full_width=False):
    cls = "shot-gallery shot-gallery-wide" if full_width else "shot-gallery"
    out = [f'<div class="{cls}">']
    for path, caption in items:
        out.append(
            f'<figure><a href="{html.escape(path)}" target="_blank" rel="noopener">'
            f'<img src="{html.escape(path)}" alt="{html.escape(caption)}" loading="lazy"></a>'
            f'<figcaption>{html.escape(caption)}</figcaption></figure>'
        )
    out.append("</div>")
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Source loading
# ---------------------------------------------------------------------------

def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def list_pngs(rel_dir):
    abs_dir = os.path.join(SCREENSHOTS_ROOT, rel_dir)
    if not os.path.isdir(abs_dir):
        return []
    names = sorted(
        f for f in os.listdir(abs_dir)
        if f.lower().endswith(".png")
    )
    return [(f"../{rel_dir}/{name}", name) for name in names]


def is_today(path):
    try:
        mtime = datetime.fromtimestamp(os.path.getmtime(path)).date()
        return mtime == TODAY
    except OSError:
        return False


# ---------------------------------------------------------------------------
# Section 1: How to Work a Lead
# ---------------------------------------------------------------------------

def build_lead_section():
    md_path = os.path.join(ARTICLES_ROOT, "Sales", "how-to-work-a-lead.md")
    md_text = read(md_path)
    shots = list_pngs("how-to-work-a-lead/raw")
    shot_by_name = {name: path for path, name in shots}

    def img(name):
        return [(shot_by_name[name], name)] if name in shot_by_name else []

    image_map = {}
    image_map["Reviewing and editing details"] = img("lead-panel-details.png") + img("lead-assign-rep.png")
    image_map["Changing status and segments"] = img("lead-status-change.png") + img("lead-segments.png")
    image_map["Messaging the lead"] = img("lead-chat.png")
    image_map["Tracking tasks"] = img("lead-tasks.png")
    image_map["Reviewing activity"] = img("lead-activity.png")
    image_map["Reviewing assets"] = img("lead-assets.png")
    image_map["Handing off to a deal"] = img("lead-deal-tab-empty.png") + img("lead-deal-tab-overview.png")
    image_map["Quick actions"] = img("lead-actions-menu.png")
    # drop empty keys so unmatched files fall through cleanly
    image_map = {k: v for k, v in image_map.items() if v}

    # anything captured that wasn't claimed above still needs to show up
    claimed = {name for imgs in image_map.values() for _, name in imgs}
    leftover = [(p, n) for p, n in shots if n not in claimed]
    if leftover:
        image_map["__leftover__"] = leftover  # never matches a heading -> trailing gallery

    body_html, count = render_markdown_with_images(md_text, image_map)
    return body_html, count


# ---------------------------------------------------------------------------
# Section 2: About Sales Analytics
# ---------------------------------------------------------------------------

def build_analytics_section():
    md_path = os.path.join(ARTICLES_ROOT, "Sales", "about-sales-analytics.md")
    md_text = read(md_path)
    shots = list_pngs("about-sales-analytics/raw")

    if shots:
        shot_by_name = {name: path for path, name in shots}

        def img(name):
            return [(shot_by_name[name], name)] if name in shot_by_name else []

        image_map = {}
        image_map["Picking your brand and date range"] = img("sales-analytics-overview-top.png")
        image_map["Reading the Overview"] = img("sales-analytics-leads-by-source.png")
        image_map["The Portal Steps funnel"] = img("sales-analytics-portal-steps.png")
        image_map["Generating a report"] = img("sales-analytics-generate-report.png")
        image_map["Generating insights"] = img("sales-analytics-generate-insights.png")
        image_map = {k: v for k, v in image_map.items() if v}

        claimed = {name for imgs in image_map.values() for _, name in imgs}
        leftover = [(p, n) for p, n in shots if n not in claimed]
        if leftover:
            image_map["__leftover__"] = leftover
        body_html, count = render_markdown_with_images(md_text, image_map)
        return body_html, count

    # fallback: full-page references
    fullpage_dir = "_fullpage/brand-dashboard"
    fallback_names = [
        "2026-07-15-sales-analytics-overview.png",
        "2026-07-15-sales-analytics-portal-steps.png",
    ]
    fallback = []
    for name in fallback_names:
        rel = f"../{fullpage_dir}/{name}"
        abs_path = os.path.join(SCREENSHOTS_ROOT, fullpage_dir, name)
        if os.path.isfile(abs_path):
            fallback.append((rel, name))

    body_html, count = render_markdown_with_images(
        md_text, {}, fallback_images=fallback,
        fallback_label="Full-page reference captures (raw/ still empty)",
        full_width_fallback=True,
    )
    return body_html, count


# ---------------------------------------------------------------------------
# Section 3: Submitting a Ticket (F14) — text only
# ---------------------------------------------------------------------------

def build_ticket_section():
    md_path = os.path.join(
        ARTICLES_ROOT, "Franchisee Portal", "14-submitting-a-ticket.md"
    )
    md_text = read(md_path)
    body_html = render_markdown(md_text)
    return body_html


# ---------------------------------------------------------------------------
# Section 4: About Automations and Runs
# ---------------------------------------------------------------------------

def build_automations_section():
    md_path = os.path.join(ARTICLES_ROOT, "Sales", "about-automations-and-runs.md")
    md_text = read(md_path)
    shots = list_pngs("about-automations-and-runs")
    shot_by_name = {name: path for path, name in shots}

    def img(name):
        return [(shot_by_name[name], name)] if name in shot_by_name else []

    image_map = {}
    image_map["The Automations tab"] = img("automations-list.png")
    image_map["Creating an automation"] = img("automations-create-modal.png") + img("automations-publish-toggle.png")
    image_map["The Runs tab"] = img("runs-tab.png")
    image_map["Using Runs to debug"] = img("runs-detail-timeline.png")
    image_map = {k: v for k, v in image_map.items() if v}

    claimed = {name for imgs in image_map.values() for _, name in imgs}
    leftover = [(p, n) for p, n in shots if n not in claimed]
    if leftover:
        image_map["__leftover__"] = leftover

    body_html, count = render_markdown_with_images(md_text, image_map)
    return body_html, count


# ---------------------------------------------------------------------------
# Section 5: About Segments
# ---------------------------------------------------------------------------

def build_segments_section():
    md_path = os.path.join(ARTICLES_ROOT, "Sales", "about-segments.md")
    md_text = read(md_path)
    shots = list_pngs("about-segments")
    shot_by_name = {name: path for path, name in shots}

    def img(name):
        return [(shot_by_name[name], name)] if name in shot_by_name else []

    image_map = {}
    image_map["Create a custom segment by tagging leads"] = (
        img("segments-create-tag.png") + img("segments-manage-tags.png")
    )
    image_map = {k: v for k, v in image_map.items() if v}

    claimed = {name for imgs in image_map.values() for _, name in imgs}
    leftover = [(p, n) for p, n in shots if n not in claimed]
    if leftover:
        image_map["__leftover__"] = leftover

    body_html, count = render_markdown_with_images(md_text, image_map)
    return body_html, count


# ---------------------------------------------------------------------------
# Section 6: About Link Tracking
# ---------------------------------------------------------------------------

def build_link_tracking_section():
    md_path = os.path.join(ARTICLES_ROOT, "Marketing and Email", "about-link-tracking.md")
    md_text = read(md_path)
    shots = list_pngs("about-link-tracking")
    shot_by_name = {name: path for path, name in shots}

    def img(name):
        return [(shot_by_name[name], name)] if name in shot_by_name else []

    image_map = {}
    image_map["Creating a tracking link"] = img("link-tracking-actions.png") + img("link-tracking-create.png")
    image_map["Sharing and copying a link"] = img("link-tracking-copy.png")
    image_map["Reading the Links table"] = img("link-tracking-links.png") + img("link-tracking-detail-panel.png")
    image_map["QR Templates"] = img("link-tracking-qr-templates.png")
    image_map["The Analytics tab"] = img("link-tracking-analytics.png")
    image_map = {k: v for k, v in image_map.items() if v}

    claimed = {name for imgs in image_map.values() for _, name in imgs}
    leftover = [(p, n) for p, n in shots if n not in claimed]
    if leftover:
        image_map["__leftover__"] = leftover

    body_html, count = render_markdown_with_images(md_text, image_map)
    return body_html, count


# ---------------------------------------------------------------------------
# Section 7: Batch A — everything else captured today
# ---------------------------------------------------------------------------

BATCH_A_CANDIDATE_DIRS = [
    "setting-up-your-profile",
    "how-to-connect-your-calendar",
    "auto-and-manual-assignment",
    "how-to-view-your-invoice",
    "how-to-edit-your-portal",
    "how-to-import-audiences",
    "creating-content-and-workflows",
    "about-locations",
    "how-to-upload-assets",
]

ALREADY_SHOWN_DIRS = {"how-to-work-a-lead", "about-sales-analytics"}


def build_batch_a_section():
    groups = []
    total = 0
    for rel_dir in BATCH_A_CANDIDATE_DIRS:
        if rel_dir in ALREADY_SHOWN_DIRS:
            continue
        raw_rel = f"{rel_dir}/raw"
        abs_dir = os.path.join(SCREENSHOTS_ROOT, raw_rel)
        if not os.path.isdir(abs_dir):
            continue
        items = []
        for path, name in list_pngs(raw_rel):
            abs_path = os.path.join(SCREENSHOTS_ROOT, raw_rel, name)
            if is_today(abs_path):
                items.append((path, name))
        if items:
            groups.append((rel_dir, items))
            total += len(items)

    parts = []
    for rel_dir, items in groups:
        parts.append(f"<h3>{html.escape(rel_dir)}</h3>")
        parts.append(figure_gallery(items))

    if not parts:
        parts.append("<p>No additional raw captures from today outside the sections above.</p>")

    return "\n".join(parts), total


# ---------------------------------------------------------------------------
# Page assembly
# ---------------------------------------------------------------------------

PAGE_TEMPLATE = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FSAI Helpdesk Review — 2026-07-15</title>
<style>
  :root {{
    color-scheme: light dark;
    --bg: #ffffff;
    --fg: #1a1a1a;
    --muted: #6b6b6b;
    --border: #e2e2e2;
    --card-bg: #f7f7f7;
    --quote-bg: #eef4fb;
    --quote-border: #4c7fb8;
    --link: #1a5fb4;
    --toc-bg: #fafafa;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{
      --bg: #14161a;
      --fg: #e8e8e8;
      --muted: #9a9a9a;
      --border: #2c2f36;
      --card-bg: #1c1f26;
      --quote-bg: #17232f;
      --quote-border: #4c8fd8;
      --link: #7ab3f5;
      --toc-bg: #1a1c22;
    }}
  }}
  * {{ box-sizing: border-box; }}
  html, body {{
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--fg);
  }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 17px;
    line-height: 1.6;
  }}
  .wrap {{
    max-width: 680px;
    margin: 0 auto;
    padding: 0 20px 64px;
  }}
  header.page-header {{
    padding: 20px 20px 8px;
    max-width: 680px;
    margin: 0 auto;
  }}
  header.page-header h1 {{
    font-size: 22px;
    margin: 0 0 4px;
  }}
  header.page-header .sub {{
    color: var(--muted);
    font-size: 14px;
    margin: 0;
  }}
  nav.toc {{
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--toc-bg);
    border-bottom: 1px solid var(--border);
    padding: 10px 20px;
    margin-bottom: 24px;
  }}
  nav.toc ul {{
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    max-width: 680px;
    margin: 0 auto;
  }}
  nav.toc a {{
    color: var(--link);
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }}
  section.article {{
    margin-bottom: 56px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }}
  section.article:last-child {{
    border-bottom: none;
  }}
  h1 {{
    font-size: 26px;
    line-height: 1.25;
    margin: 0 0 16px;
  }}
  h2 {{
    font-size: 20px;
    margin: 32px 0 12px;
  }}
  h3 {{
    font-size: 18px;
    margin: 28px 0 10px;
  }}
  p {{
    margin: 0 0 14px;
  }}
  ul, ol {{
    margin: 0 0 14px;
    padding-left: 22px;
  }}
  li {{
    margin-bottom: 6px;
  }}
  strong {{
    font-weight: 700;
  }}
  a {{
    color: var(--link);
  }}
  em {{ font-style: normal; }}
  blockquote {{
    margin: 0 0 16px;
    padding: 12px 14px;
    background: var(--quote-bg);
    border-left: 4px solid var(--quote-border);
    border-radius: 4px;
    font-size: 15.5px;
  }}
  .section-meta {{
    color: var(--muted);
    font-size: 13px;
    margin: -10px 0 20px;
  }}
  .note-pending {{
    color: var(--muted);
    background: var(--card-bg);
    border: 1px dashed var(--border);
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 14px;
    margin: 8px 0 24px;
  }}
  .shot-gallery {{
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin: 10px 0 26px;
  }}
  .shot-gallery figure {{
    margin: 0;
  }}
  .shot-gallery img {{
    display: block;
    max-width: 100%;
    height: auto;
    border: 1px solid var(--border);
    border-radius: 10px;
  }}
  .shot-gallery figcaption {{
    margin-top: 6px;
    font-size: 12.5px;
    color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    word-break: break-all;
  }}
  .batch-group {{
    margin-bottom: 30px;
  }}
  footer.page-footer {{
    max-width: 680px;
    margin: 40px auto 0;
    padding: 0 20px;
    color: var(--muted);
    font-size: 13px;
  }}
</style>

<header class="page-header">
  <h1>FSAI Helpdesk Review — 2026-07-15</h1>
  <p class="sub">Reading view for today's work. Regenerate with <code>regen.py</code> as more raws land.</p>
</header>

<nav class="toc">
  <ul>
    <li><a href="#lead">How to Work a Lead</a></li>
    <li><a href="#analytics">About Sales Analytics</a></li>
    <li><a href="#ticket">Submitting a Ticket (F14)</a></li>
    <li><a href="#automations">About Automations and Runs</a></li>
    <li><a href="#segments">About Segments</a></li>
    <li><a href="#link-tracking">About Link Tracking</a></li>
    <li><a href="#batch-a">Batch A shots</a></li>
  </ul>
</nav>

<div class="wrap">

  <section class="article" id="lead">
    {lead_body}
    <p class="section-meta">{lead_count} shot(s) embedded from <code>how-to-work-a-lead/raw/</code>.</p>
  </section>

  <section class="article" id="analytics">
    {analytics_body}
    <p class="section-meta">{analytics_count} shot(s) embedded{analytics_note}.</p>
  </section>

  <section class="article" id="ticket">
    {ticket_body}
    <p class="note-pending">Images pending capture.</p>
  </section>

  <section class="article" id="automations">
    {automations_body}
    <p class="section-meta">{automations_count} shot(s) embedded from <code>about-automations-and-runs/</code>.</p>
  </section>

  <section class="article" id="segments">
    {segments_body}
    <p class="section-meta">{segments_count} shot(s) embedded from <code>about-segments/</code>.</p>
  </section>

  <section class="article" id="link-tracking">
    {link_tracking_body}
    <p class="section-meta">{link_tracking_count} shot(s) embedded from <code>about-link-tracking/</code>.</p>
  </section>

  <section class="article" id="batch-a">
    <h1>Settings refresh shots (Batch A)</h1>
    <p class="section-meta">{batch_count} shot(s) captured today, grouped by article folder, not already shown above.</p>
    {batch_body}
  </section>

</div>

<footer class="page-footer">
  Generated {generated_at} by regen.py &middot; served from the screenshots repo root on port 4410.
</footer>
"""


def main():
    lead_body, lead_count = build_lead_section()
    analytics_body, analytics_count = build_analytics_section()
    analytics_shots_dir_has_files = bool(list_pngs("about-sales-analytics/raw"))
    analytics_note = "" if analytics_shots_dir_has_files else " (fallback full-page references; raw/ still empty)"
    ticket_body = build_ticket_section()
    automations_body, automations_count = build_automations_section()
    segments_body, segments_count = build_segments_section()
    link_tracking_body, link_tracking_count = build_link_tracking_section()
    batch_body, batch_count = build_batch_a_section()

    html_out = PAGE_TEMPLATE.format(
        lead_body=lead_body,
        lead_count=lead_count,
        analytics_body=analytics_body,
        analytics_count=analytics_count,
        analytics_note=analytics_note,
        ticket_body=ticket_body,
        automations_body=automations_body,
        automations_count=automations_count,
        segments_body=segments_body,
        segments_count=segments_count,
        link_tracking_body=link_tracking_body,
        link_tracking_count=link_tracking_count,
        batch_body=batch_body,
        batch_count=batch_count,
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
    )

    out_path = os.path.join(HERE, "index.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html_out)

    print(f"Wrote {out_path}")
    print(f"  how-to-work-a-lead:     {lead_count} images")
    print(f"  about-sales-analytics:  {analytics_count} images{analytics_note}")
    print(f"  submitting-a-ticket:    text only")
    print(f"  about-automations-and-runs: {automations_count} images")
    print(f"  about-segments:         {segments_count} images")
    print(f"  about-link-tracking:    {link_tracking_count} images")
    print(f"  batch A:                {batch_count} images")
    with open(out_path) as f:
        n_leftover = f.read().count("More shots")
    if n_leftover:
        print(f"  !! WARNING: {n_leftover} section(s) have UNMAPPED shots in a 'More shots' gallery.")
        print(f"  !! Max's rule: every image must be section-mapped. Update the image_map in the")
        print(f"  !! relevant build_*_section() before showing him the page.")


if __name__ == "__main__":
    main()
