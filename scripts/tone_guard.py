#!/usr/bin/env python3
"""
HaemCalc Pro tone-guard scanner.

Scans markdown, HTML, JSX/JS, and plain-text files for banned words from the
project owner's preference list. Exits 0 on clean, non-zero on hits.

Usage:
    python scripts/tone_guard.py [path ...]

If no paths are given, scans the entire repository.

The list is kept inside this script (not in a config file) so a contributor
cannot silently weaken it via a pull request without the change appearing
in code review.
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


def build_pattern(words: Iterable[str]) -> re.Pattern[ str]:
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


def scan_file(path: Path, pattern: re.Pattern[ str]) -> list[tuple[int, str, str]]:
    hits: list[tuple[int, str, str]] = []
    try:
        with path.open("r", encoding="utf-8", errors="replace") as fh:
            for lineno, line in enumerate(fh, start=1):
                for match in pattern.finditer(line):
                    hits.append((lineno, match.group(0), line.rstrip("\n")))
    except OSError as exc:
        print(f"WARN: cannot read {path}: {exc}", file=sys.stderr)
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
        hits = scan_file(path, pattern)
        if hits:
            files_with_hits += 1
            total_hits += len(hits)
            for lineno, match, line in hits:
                print(f"{path}:{lineno}:{match}: {line.strip()[:160]}")

    print(
        f"\ntone-guard: {files_scanned} files scanned, "
        f"{files_with_hits} with hits, "
        f"{total_hits} hits total",
        file=sys.stderr,
    )

    return 0 if total_hits == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
