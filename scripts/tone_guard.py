#!/usr/bin/env python3
"""
HaemCalc Pro tone-guard scanner.

Two checks run on every scan:

  1. Banned-words check (markdown, HTML, JSX/JS, plain text). Flags any
     occurrence of a word from the project owner's preference list.

  2. Inline-block-balance check (HTML only). Flags HTML files where the
     count of <script> opens does not match the count of </script> closes
     (same for <style>/</style>). The HTML parser terminates an inline
     <script>/<style> element at the FIRST occurrence of the matching end-tag
     substring, regardless of whether that substring appears inside a JS
     comment, JS string literal, or CSS string literal. The parser does not
     parse JS or CSS — it only matches against the raw text. A literal
     </script> inside a JS comment will close the script element early and
     silently drop everything after it. This check catches that bug pattern
     at lint time. (See PR ζ Part 2 commit f0882f4.)

Exits 0 on clean, non-zero on any hit from either check.

Usage:
    python scripts/tone_guard.py [path ...]

If no paths are given, scans the entire repository.

The banned list is kept inside this script (not in a config file) so a
contributor cannot silently weaken it via a pull request without the change
appearing in code review.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Iterable

BANNED_WORDS: tuple[str, ...] = (
    "embarked", "delved", "invaluable", "relentless", "groundbreaking",
    "endeavour", "enlightening", "insights", "esteemed", "shed light",
    "deep understanding", "crucial", "delving", "elevate", "resonate",
    "enhance", "expertise", "offerings", "valuable", "leverage",
    "intricate", "tapestry", "foster", "systemic", "inherent",
    "treasure trove", "testament", "peril", "landscape", "delve",
    "pertinent", "synergy", "explore", "underscores", "empower",
    "unleash", "unlock", "folks", "pivotal", "adhere", "amplify",
    "cognizant", "conceptualize", "emphasize", "complexity", "recognize",
    "adapt", "promote", "critique", "comprehensive", "implications",
    "complementary", "perspectives", "holistic", "discern", "multifaceted",
    "nuanced", "underpinnings", "cultivate", "integral", "profound",
    "facilitate", "encompass", "elucidate", "unravel", "paramount",
    "characterized", "significant",
)

SCANNED_EXTENSIONS: frozenset[str] = frozenset({
    ".md", ".markdown", ".html", ".htm", ".jsx", ".js", ".mjs",
    ".ts", ".tsx", ".txt", ".rst", ".json",
})

EXCLUDED_DIRS: frozenset[str] = frozenset({
    ".git", "node_modules", "dist", "build", ".next", ".cache",
    "coverage", ".venv", "venv", "__pycache__",
})


def build_pattern(words: Iterable[str]) -> re.Pattern[str]:
    escaped = [re.escape(w) for w in words]
    pattern = r"\b(?:" + "|".join(escaped) + r")\b"
    return re.compile(pattern, re.IGNORECASE)


def iter_files(roots: list[Path]) -> Iterable[Path]:
    for root in roots:
        if root.is_file():
            if root.suffix.lower() in SCANNED_EXTENSIONS:
                yield root
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
            for filename in filenames:
                p = Path(dirpath) / filename
                if p.suffix.lower() in SCANNED_EXTENSIONS:
                    yield p


def scan_file(path: Path, pattern: re.Pattern[str]) -> list[tuple[int, str, str]]:
    hits: list[tuple[int, str, str]] = []
    try:
        with path.open("r", encoding="utf-8", errors="replace") as fh:
            for lineno, line in enumerate(fh, start=1):
                for match in pattern.finditer(line):
                    hits.append((lineno, match.group(0), line.rstrip("\n")))
    except OSError as exc:
        print(f"WARN: cannot read {path}: {exc}", file=sys.stderr)
    return hits


HTML_EXTENSIONS: frozenset[str] = frozenset({".html", ".htm"})


def scan_inline_block_balance(path: Path) -> list[tuple[int, str, str]]:
    """Flag HTML files where <script>/<style> opens and closes do not balance.

    A balanced count is the necessary condition. If close count exceeds open
    count, the file contains a literal </script> or </style> substring inside
    an inline block — typically inside a JS comment, JS string literal, or
    CSS string literal. The HTML parser terminates the block at that point,
    so the author's intended block is silently truncated.

    Reports the first orphan close per tag (further orphans usually cascade
    from the same root cause and add noise).
    """
    hits: list[tuple[int, str, str]] = []
    if path.suffix.lower() not in HTML_EXTENSIONS:
        return hits
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        print(f"WARN: cannot read {path}: {exc}", file=sys.stderr)
        return hits

    for tag in ("script", "style"):
        open_re = re.compile(rf"<{tag}\b[^>]*>", re.IGNORECASE)
        close_re = re.compile(rf"</{tag}\s*>", re.IGNORECASE)
        events: list[tuple[int, str]] = []
        for m in open_re.finditer(text):
            events.append((m.start(), "open"))
        for m in close_re.finditer(text):
            events.append((m.start(), "close"))
        events.sort(key=lambda e: e[0])

        depth = 0
        for pos, kind in events:
            if kind == "open":
                depth += 1
            else:
                if depth == 0:
                    line = text.count("\n", 0, pos) + 1
                    snippet = text[max(0, pos - 60):pos + 20].replace("\n", " ")
                    hits.append((
                        line,
                        f"orphan-</{tag}>",
                        f"orphan </{tag}> — a literal </{tag} substring inside an inline {tag} block is closing it early. Snippet: ...{snippet.strip()}",
                    ))
                    break
                depth -= 1
    return hits


def main(argv: list[str]) -> int:
    if len(argv) > 1:
        roots = [Path(a).resolve() for a in argv[1:]]
    else:
        roots = [Path(".").resolve()]

    pattern = build_pattern(BANNED_WORDS)

    total_hits = 0
    files_scanned = 0
    files_with_hits = 0

    for path in iter_files(roots):
        files_scanned += 1
        file_had_hits = False

        # Banned-words check
        word_hits = scan_file(path, pattern)
        if word_hits:
            file_had_hits = True
            total_hits += len(word_hits)
            for lineno, match, line in word_hits:
                print(f"{path}:{lineno}:{match}: {line.strip()[:160]}")

        # Inline-block-balance check (HTML only)
        block_hits = scan_inline_block_balance(path)
        if block_hits:
            file_had_hits = True
            total_hits += len(block_hits)
            for lineno, match, line in block_hits:
                print(f"{path}:{lineno}:{match}: {line.strip()[:200]}")

        if file_had_hits:
            files_with_hits += 1

    print(
        f"\ntone-guard: {files_scanned} files scanned, "
        f"{files_with_hits} with hits, "
        f"{total_hits} hits total",
        file=sys.stderr,
    )

    return 0 if total_hits == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
