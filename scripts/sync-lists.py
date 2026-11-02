#!/usr/bin/env python3
"""Compare live Wix lists with the local site and restore missing ones.

Wix content lists (rich text and blog ricos) are extracted per sitemap URL.
A list is missing when those items are not an <ul>/<ol> in our rendered main
content. --apply turns the matching run of paragraphs in MDX or pages.json
into a real list, including nested lists.

Usage:
  python3 scripts/sync-lists.py [--base http://127.0.0.1:3460] [--apply]
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SITEMAPS = [
    "https://www.4man.co.il/pages-sitemap.xml",
    "https://www.4man.co.il/blog-posts-sitemap.xml",
    "https://www.4man.co.il/blog-categories-sitemap.xml",
    "https://www.4man.co.il/member-profiles_p_author-profile-chunk-sitemap.xml",
]
WIX_LISTS = "ul.wixui-rich-text__text, ol.wixui-rich-text__text, ul.OQqy3, ol.OQqy3"
UA = "4man-list-audit"


def fetch(url: str) -> str:
    parts = urllib.parse.urlsplit(url)
    path = urllib.parse.quote(urllib.parse.unquote(parts.path), safe="/")
    url = urllib.parse.urlunsplit((parts.scheme, parts.netloc, path, parts.query, parts.fragment))
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as res:
        return res.read().decode("utf-8", "replace")


def separate_links(value: str) -> str:
    """Wix shows a space after a link. Some source lines glue the next word on."""
    text = re.sub(r"(\]\([^)]*\))(?=\S)", r"\1 ", value or "")
    text = re.sub(r"(</a>)(?=\S)", r"\1 ", text, flags=re.I)
    return text


def norm(value: str) -> str:
    text = html.unescape(separate_links(value or ""))
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("**", "").replace("__", "").replace("*", "")
    text = text.replace("\u00a0", " ").replace("\u202f", " ")
    text = re.sub(r"[\u200b\u200c\u200d\ufeff\u200e\u200f]", "", text)
    text = text.replace("״", '"').replace("׳", "'").replace("“", '"').replace("”", '"').replace("’", "'")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def kind_of(el) -> str:
    styles = [el.get("style") or ""]
    first = el.find("li", recursive=False)
    if first:
        styles.append(first.get("style") or "")
    style = " ".join(styles)
    if "decimal" in style or re.search(r"list-style-type:\s*(lower|upper)", style):
        return "ol"
    if re.search(r"list-style-type:\s*(disc|circle|square)", style):
        return "ul"
    return "ol" if el.name == "ol" else "ul"


def parse_items(el) -> list[dict]:
    items = []
    for li in el.find_all("li", recursive=False):
        nested_el = li.find(["ul", "ol"])
        nested = None
        if nested_el is not None:
            nested = {"type": kind_of(nested_el), "items": parse_items(nested_el)}
            nested_el.decompose()
        text = norm(li.get_text(" ", strip=True))
        if not text and not nested:
            continue
        items.append({"text": text, "nested": nested})
    return items


def signature(kind: str, items: list[dict]):
    return (
        kind,
        tuple(
            (item["text"], signature(item["nested"]["type"], item["nested"]["items"]) if item["nested"] else None)
            for item in items
        ),
    )


def flatten(items: list[dict]) -> list[str]:
    out = []
    for item in items:
        out.append(item["text"])
        if item["nested"]:
            out.extend(flatten(item["nested"]["items"]))
    return out


def content_lists(soup: BeautifulSoup, selector: str) -> list[dict]:
    found = []
    for el in soup.select(selector):
        if el.find_parent(["ul", "ol"]) is not None:
            continue
        items = parse_items(el)
        if len(items) < 1:
            continue
        if all(len(item["text"]) < 2 for item in items):
            continue
        found.append({"type": kind_of(el), "items": items})
    return found


def local_lists(soup: BeautifulSoup) -> list[dict]:
    main = soup.select_one("main") or soup
    # Drop nested lists by selecting only lists that are not inside another list.
    found = []
    for el in main.find_all(["ul", "ol"]):
        if el.find_parent(["ul", "ol"]) is not None:
            continue
        if el.find_parent(["nav", "header", "footer"]) is not None:
            continue
        items = parse_items(el)
        if not items:
            continue
        found.append({"type": kind_of(el), "items": items})
    return found


def sitemap_paths() -> list[str]:
    paths = []
    for url in SITEMAPS:
        xml = fetch(url)
        for loc in re.findall(r"<loc>([^<]+)</loc>", xml):
            loc = html.unescape(loc).strip()
            if loc.endswith(".xml"):
                continue
            path = urllib.parse.urlparse(loc).path
            path = urllib.parse.unquote(path)
            if path not in paths:
                paths.append(path)
    return paths


def load_pair(path: str, base: str) -> tuple[str, list[dict], list[dict]]:
    wix = BeautifulSoup(fetch("https://www.4man.co.il" + path), "html.parser")
    local = BeautifulSoup(fetch(base + path), "html.parser")
    return path, content_lists(wix, WIX_LISTS), local_lists(local)


def missing_lists(wix_lists: list[dict], local: list[dict]) -> list[dict]:
    have = Counter(signature(item["type"], item["items"]) for item in local)
    need = Counter(signature(item["type"], item["items"]) for item in wix_lists)
    missing = []
    seen = Counter()
    for item in wix_lists:
        sig = signature(item["type"], item["items"])
        seen[sig] += 1
        # Wix repeats the same list in the document. One rendered list covers it.
        if seen[sig] > max(1, have[sig]) and have[sig] == 0 and seen[sig] == 1:
            missing.append(item)
        elif have[sig] == 0 and seen[sig] == 1:
            missing.append(item)
    return missing


def split_frontmatter(text: str) -> tuple[str, str]:
    if not text.startswith("---"):
        return "", text
    end = text.find("\n---\n", 3)
    if end < 0:
        return "", text
    return text[: end + 5], text[end + 5 :]


def mdx_blocks(content: str) -> list[str]:
    return re.split(r"\n[ \t]*\n", content.strip("\n"))


def is_para(block: str) -> bool:
    stripped = block.strip()
    if not stripped:
        return False
    if stripped.startswith("#"):
        return False
    if re.match(r"^[-*]\s", stripped):
        return False
    if re.match(r"^\d+\.\s", stripped):
        return False
    if stripped.startswith("<ul") or stripped.startswith("<ol"):
        return False
    return True


def gap_ok(blocks: list[str], start: int, end: int) -> bool:
    for index in range(start + 1, end):
        if norm(blocks[index]):
            return False
    return True


def find_groups(blocks: list[str], texts: list[str], used: set[int]) -> list[list[int]] | None:
    """Each Wix item may be one paragraph or several consecutive paragraphs joined."""
    paras = [i for i in range(len(blocks)) if i not in used and is_para(blocks[i]) and norm(blocks[i])]
    want = [norm(text) for text in texts]
    hits: list[list[list[int]]] = []
    for origin in range(len(paras)):
        groups: list[list[int]] = []
        pos = origin
        ok = True
        for target in want:
            acc: list[int] = []
            joined = ""
            matched = False
            while pos < len(paras):
                idx = paras[pos]
                if acc and not gap_ok(blocks, acc[-1], idx):
                    ok = False
                    break
                if groups and not acc and not gap_ok(blocks, groups[-1][-1], idx):
                    ok = False
                    break
                piece = norm(blocks[idx])
                trial = (joined + " " + piece).strip()
                if trial == target or target.startswith(trial + " ") or target.startswith(trial):
                    acc.append(idx)
                    joined = trial
                    pos += 1
                    if joined == target:
                        groups.append(acc)
                        matched = True
                        break
                    if len(joined) > len(target):
                        ok = False
                        break
                    continue
                ok = False
                break
            if not ok or not matched:
                ok = False
                break
        if ok and len(groups) == len(want):
            hits.append(groups)
    if len(hits) != 1:
        return None
    return hits[0]


def emit_md_from(items, sources, cursor, ordered, depth):
    lines = []
    for index, item in enumerate(items, 1):
        source = sources[cursor].strip()
        cursor += 1
        pad = "  " * depth
        marker = f"{index}." if ordered else "-"
        parts = source.split("\n")
        lines.append(f"{pad}{marker} {parts[0]}")
        for extra in parts[1:]:
            lines.append(f"{pad}  {extra}")
        if item["nested"]:
            nested, cursor = emit_md_from(item["nested"]["items"], sources, cursor, item["nested"]["type"] == "ol", depth + 1)
            lines.extend(nested)
    return lines, cursor


def apply_mdx(text: str, lists: list[dict]) -> tuple[str, int]:
    front, content = split_frontmatter(text)
    newline = "\n" if content.endswith("\n") or text.endswith("\n") else ""
    blocks = mdx_blocks(content)
    used: set[int] = set()
    replacements: list[tuple[int, int, str]] = []
    applied = 0
    for lst in lists:
        texts = flatten(lst["items"])
        groups = find_groups(blocks, texts, used)
        if not groups:
            continue
        sources = [" ".join(separate_links(blocks[i].strip()) for i in group) for group in groups]
        rendered, _ = emit_md_from(lst["items"], sources, 0, lst["type"] == "ol", 0)
        start = groups[0][0]
        end = groups[-1][-1]
        replacements.append((start, end, "\n".join(rendered)))
        used.update(range(start, end + 1))
        applied += 1
    if not replacements:
        return text, 0
    for start, end, rendered in sorted(replacements, reverse=True):
        blocks[start : end + 1] = [rendered]
    body = "\n\n".join(blocks).strip("\n") + newline
    return front + body, applied


def page_blocks(page: dict) -> list[dict]:
    return page["blocks"]


def block_plain(block: dict) -> str:
    if block.get("type") == "p":
        return block.get("html") or ""
    if block.get("type") == "h":
        return block.get("html") or ""
    return ""


def is_page_para(block: dict) -> bool:
    return block.get("type") == "p" and bool(norm(block.get("html") or ""))


def apply_page(page: dict, lists: list[dict]) -> int:
    blocks = page["blocks"]
    used: set[int] = set()
    replacements: list[tuple[int, int, dict]] = []
    applied = 0
    for lst in lists:
        texts = flatten(lst["items"])
        masked = []
        for block in blocks:
            if block.get("type") == "p":
                masked.append(block.get("html") or "")
            else:
                masked.append("# " + block_plain(block))
        groups = find_groups(masked, texts, used)
        if not groups:
            continue
        start = groups[0][0]
        end = groups[-1][-1]
        htmls = [" ".join(separate_links(blocks[i]["html"].strip()) for i in group) for group in groups]

        def build(items: list[dict], cursor: list[int]) -> str:
            pieces = []
            for item in items:
                inner = htmls[cursor[0]].strip()
                cursor[0] += 1
                if item["nested"]:
                    tag = item["nested"]["type"]
                    inner += f"<{tag}>{build(item['nested']['items'], cursor)}</{tag}>"
                pieces.append(f"<li>{inner}</li>")
            return "".join(pieces)

        top_items = []
        cursor = [0]
        for item in lst["items"]:
            inner = htmls[cursor[0]].strip()
            cursor[0] += 1
            if item["nested"]:
                tag = item["nested"]["type"]
                inner += f"<{tag}>{build(item['nested']['items'], cursor)}</{tag}>"
            top_items.append(inner)
        replacements.append((start, end, {"type": lst["type"], "items": top_items}))
        used.update(range(start, end + 1))
        applied += 1
    if not replacements:
        return 0
    for start, end, block in sorted(replacements, reverse=True):
        blocks[start : end + 1] = [block]
    return applied


def post_path(url_path: str) -> Path | None:
    if not url_path.startswith("/post/"):
        return None
    slug = url_path[len("/post/") :]
    file = ROOT / "content" / "posts" / f"{slug}.mdx"
    return file if file.exists() else None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://127.0.0.1:3460")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    base = args.base.rstrip("/")
    paths = sitemap_paths()
    print(f"urls {len(paths)}", flush=True)
    rows = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(load_pair, path, base) for path in paths]
        for future in as_completed(futures):
            path, wix_lists, rendered = future.result()
            missing = missing_lists(wix_lists, rendered)
            rows.append((path, wix_lists, rendered, missing))
            mark = "x" if missing else "."
            print(mark, end="", flush=True)
    print()
    rows.sort(key=lambda row: paths.index(row[0]))
    pages = json.loads((ROOT / "content" / "pages.json").read_text())
    fixed_pages = []
    unmatched = []
    list_count = 0
    for path, wix_lists, rendered, missing in rows:
        if not missing:
            continue
        print(f"\n{path}  wix {len(wix_lists)} local {len(rendered)} missing {len(missing)}")
        for lst in missing:
            preview = " | ".join(item["text"][:42] for item in lst["items"][:3])
            print(f"  {lst['type']} x{len(lst['items'])}: {preview}")
        if not args.apply:
            continue
        target = post_path(path)
        applied = 0
        if target:
            original = target.read_text()
            updated, applied = apply_mdx(original, missing)
            if applied:
                target.write_text(updated)
        elif path in pages:
            applied = apply_page(pages[path], missing)
        else:
            unmatched.append((path, "no source"))
            continue
        if applied:
            fixed_pages.append(path)
            list_count += applied
        if applied < len(missing):
            unmatched.append((path, f"applied {applied}/{len(missing)}"))
    if args.apply:
        (ROOT / "content" / "pages.json").write_text(json.dumps(pages, ensure_ascii=False, separators=(",", ":")))
        print(f"\nfixed pages {len(fixed_pages)} lists {list_count}")
        for path in fixed_pages:
            print("  ", path)
        if unmatched:
            print("unmatched")
            for item in unmatched:
                print(" ", item)
    else:
        missing_total = sum(len(row[3]) for row in rows)
        print(f"\nmissing lists {missing_total} on {sum(1 for row in rows if row[3])} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
