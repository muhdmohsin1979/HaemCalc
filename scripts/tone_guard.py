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
    python scripts/tone_guard.py [--repo-root PATH] [--waivers JSON] [path ...]

If no paths are given, scans the entire repository.

The banned list is kept inside this script (not in a config file) so a
contributor cannot silently weaken it via a pull request without the change
appearing in code review. Waivers are exact, version-controlled exceptions;
their manifest changes require independent review and Programme Owner approval
of the exact candidate and manifest hashes outside this PR-controlled scanner.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from datetime import date
from pathlib import Path, PurePosixPath
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

PROGRAMME_OWNER = "muhdmohsin1979"

SCANNED_EXTENSIONS: frozenset[str] = frozenset({
    ".md", ".markdown", ".html", ".htm", ".jsx", ".js", ".mjs",
    ".ts", ".tsx", ".txt", ".rst", ".json",
})

EXCLUDED_DIRS: frozenset[str] = frozenset({
    ".git", "node_modules", "dist", "build", ".next", ".cache",
    "coverage", ".venv", "venv", "__pycache__",
})


@dataclass
class Waiver:
    waiver_id: str
    work_package: str
    path: str
    term: str
    exact_text: str
    reason: str
    approved_by: str
    status: str
    expires_on: date
    max_occurrences: int
    uses: int = 0
    matches: int = 0

    def matches_scope(
        self,
        path: Path,
        match: str,
        line: str,
        match_start: int,
        match_end: int,
        repo_root: Path,
    ) -> bool:
        try:
            relative_path = path.resolve().relative_to(repo_root).as_posix()
        except ValueError:
            return False
        if (
            self.status != "active"
            or relative_path != self.path
            or match.casefold() != self.term.casefold()
        ):
            return False

        exact_start = line.find(self.exact_text)
        while exact_start != -1:
            exact_end = exact_start + len(self.exact_text)
            if match_start >= exact_start and match_end <= exact_end:
                return True
            exact_start = line.find(self.exact_text, exact_start + 1)
        return False


class WaiverManifestError(ValueError):
    pass


class ScanError(OSError):
    pass


def waiver_audit_record(
    waiver: Waiver,
    *,
    outcome: str,
    lineno: int,
) -> str:
    return json.dumps(
        {
            "event": "tone_guard_waiver",
            "outcome": outcome,
            "waiver_id": waiver.waiver_id,
            "work_package": waiver.work_package,
            "path": waiver.path,
            "line": lineno,
            "term": waiver.term,
            "exact_text": waiver.exact_text,
            "reason": waiver.reason,
            "approved_by": waiver.approved_by,
            "status": waiver.status,
            "expires_on": waiver.expires_on.isoformat(),
            "max_occurrences": waiver.max_occurrences,
            "occurrence_count": waiver.matches,
        },
        sort_keys=True,
    )


def load_waivers(path: Path | None) -> list[Waiver]:
    if path is None:
        return []

    def reject_duplicate_keys(pairs: list[tuple[str, object]]) -> dict[str, object]:
        result: dict[str, object] = {}
        for key, value in pairs:
            if key in result:
                raise WaiverManifestError(f"duplicate JSON key: {key}")
            result[key] = value
        return result

    data = json.loads(
        path.read_text(encoding="utf-8"),
        object_pairs_hook=reject_duplicate_keys,
    )
    manifest_fields = {"version", "waivers"}
    waiver_fields = {
        "id",
        "work_package",
        "path",
        "term",
        "exact_text",
        "reason",
        "approved_by",
        "status",
        "expires_on",
        "max_occurrences",
    }
    if (
        not isinstance(data, dict)
        or type(data.get("version")) is not int
        or data["version"] != 1
    ):
        raise WaiverManifestError("version must be integer 1")
    unexpected_manifest_fields = set(data) - manifest_fields
    if unexpected_manifest_fields:
        raise WaiverManifestError(
            "manifest has unexpected fields: "
            + ", ".join(sorted(unexpected_manifest_fields))
        )
    missing_manifest_fields = manifest_fields - set(data)
    if missing_manifest_fields:
        raise WaiverManifestError(
            "manifest is missing fields: "
            + ", ".join(sorted(missing_manifest_fields))
        )
    items = data.get("waivers")
    if not isinstance(items, list):
        raise WaiverManifestError("waivers must be a list")

    waivers: list[Waiver] = []
    seen_ids: set[str] = set()
    banned_terms = {word.casefold() for word in BANNED_WORDS}
    for index, item in enumerate(items, start=1):
        if not isinstance(item, dict):
            raise WaiverManifestError(f"waiver {index} must be an object")
        unexpected_waiver_fields = set(item) - waiver_fields
        if unexpected_waiver_fields:
            raise WaiverManifestError(
                f"waiver {index} has unexpected fields: "
                + ", ".join(sorted(unexpected_waiver_fields))
            )
        missing_waiver_fields = waiver_fields - set(item)
        if missing_waiver_fields:
            raise WaiverManifestError(
                f"waiver {index} is missing fields: "
                + ", ".join(sorted(missing_waiver_fields))
            )
        try:
            waiver_id = item["id"]
            work_package = item["work_package"]
            waiver_path = item["path"]
            term = item["term"]
            exact_text = item["exact_text"]
            reason = item["reason"]
            approved_by = item["approved_by"]
            status = item["status"]
            expires_on_raw = item["expires_on"]
            max_occurrences = item["max_occurrences"]
        except (KeyError, TypeError, ValueError) as exc:
            raise WaiverManifestError(
                f"waiver {index} has a missing or invalid field: {exc}"
            ) from exc

        if (
            not isinstance(expires_on_raw, str)
            or re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", expires_on_raw) is None
        ):
            raise WaiverManifestError(
                f"waiver {index} expires_on must use YYYY-MM-DD"
            )
        try:
            expires_on = date.fromisoformat(expires_on_raw)
        except ValueError as exc:
            raise WaiverManifestError(
                f"waiver {index} expires_on is not a valid date: {expires_on_raw}"
            ) from exc

        if not isinstance(waiver_id, str) or not waiver_id:
            raise WaiverManifestError(f"waiver {index} id must be non-empty")
        if waiver_id in seen_ids:
            raise WaiverManifestError(f"duplicate waiver id: {waiver_id}")
        seen_ids.add(waiver_id)
        if (
            not isinstance(work_package, str)
            or re.fullmatch(r"HC-WP[0-9A-Z]+(?:-[0-9A-Z]+)*", work_package) is None
        ):
            raise WaiverManifestError(f"waiver {waiver_id} has invalid work_package")
        if re.fullmatch(re.escape(work_package) + r"-TG-[0-9]{3}", waiver_id) is None:
            raise WaiverManifestError(
                f"waiver {waiver_id} id must belong to work_package {work_package}"
            )
        if not isinstance(waiver_path, str):
            raise WaiverManifestError(f"waiver {waiver_id} path must be a string")
        pure_path = PurePosixPath(waiver_path)
        if (
            pure_path.is_absolute()
            or ".." in pure_path.parts
            or pure_path.as_posix() != waiver_path
            or not pure_path.name
        ):
            raise WaiverManifestError(
                f"waiver {waiver_id} path must be a repository-relative file without traversal"
            )
        if not isinstance(term, str) or term.casefold() not in banned_terms:
            raise WaiverManifestError(f"waiver {waiver_id} term is not banned")
        if (
            not isinstance(exact_text, str)
            or not build_pattern([term]).search(exact_text)
        ):
            raise WaiverManifestError(
                f"waiver {waiver_id} exact_text must contain the exact banned term"
            )
        if not isinstance(reason, str) or not reason.strip():
            raise WaiverManifestError(f"waiver {waiver_id} reason must be non-empty")
        if approved_by != PROGRAMME_OWNER:
            raise WaiverManifestError(
                f"waiver {waiver_id} approved_by must be {PROGRAMME_OWNER}"
            )
        if not isinstance(status, str) or status not in {"active", "closed"}:
            raise WaiverManifestError(
                f"waiver {waiver_id} status must be active or closed"
            )
        if (
            isinstance(max_occurrences, bool)
            or not isinstance(max_occurrences, int)
            or max_occurrences < 1
        ):
            raise WaiverManifestError(
                f"waiver {waiver_id} max_occurrences must be a positive integer"
            )

        waivers.append(Waiver(
            waiver_id=waiver_id,
            work_package=work_package,
            path=waiver_path,
            term=term,
            exact_text=exact_text,
            reason=reason,
            approved_by=approved_by,
            status=status,
            expires_on=expires_on,
            max_occurrences=max_occurrences,
        ))
    return waivers


def build_pattern(words: Iterable[str]) -> re.Pattern[str]:
    escaped = [re.escape(w) for w in words]
    pattern = r"\b(?:" + "|".join(escaped) + r")\b"
    return re.compile(pattern, re.IGNORECASE)


def first_symlink_component(path: Path) -> Path | None:
    absolute_path = path.absolute()
    current = Path(absolute_path.anchor)
    for part in absolute_path.parts[1:]:
        current /= part
        if current.is_symlink():
            return current
    return None


def validate_waiver_files(waivers: Iterable[Waiver], repo_root: Path) -> None:
    for waiver in waivers:
        candidate = repo_root.joinpath(*PurePosixPath(waiver.path).parts)
        symlink_component = first_symlink_component(candidate)
        try:
            candidate.resolve(strict=True).relative_to(repo_root)
        except (FileNotFoundError, NotADirectoryError, ValueError):
            raise WaiverManifestError(
                f"waiver {waiver.waiver_id} waiver path must identify an existing "
                "non-symlinked regular file"
            ) from None
        if symlink_component is not None or not candidate.is_file():
            raise WaiverManifestError(
                f"waiver {waiver.waiver_id} waiver path must identify an existing "
                "non-symlinked regular file"
            )


def lexical_cli_path(raw: str, label: str, *, allow_bare_dot: bool = False) -> Path:
    if allow_bare_dot and raw == ".":
        return Path(raw)
    if not raw or "//" in raw or any(
        component in {".", ".."} for component in raw.split("/")
    ):
        raise ValueError(f"non-canonical {label} path: {raw}")
    return Path(raw)


def iter_files(roots: list[Path], repo_root: Path) -> Iterable[Path]:
    def raise_walk_error(exc: OSError) -> None:
        raise ScanError(f"cannot traverse directory: {exc}") from exc

    for root in roots:
        if root.is_file():
            if root.suffix.lower() in SCANNED_EXTENSIONS:
                yield root
            continue
        for dirpath, dirnames, filenames in os.walk(root, onerror=raise_walk_error):
            retained_dirs: list[str] = []
            for dirname in dirnames:
                directory = Path(dirpath) / dirname
                if directory.is_symlink():
                    resolved = directory.resolve()
                    try:
                        resolved.relative_to(repo_root)
                    except ValueError:
                        raise ScanError(
                            "discovered symlinked directory outside repo_root: "
                            f"{directory}"
                        )
                    raise ScanError(
                        f"cannot safely traverse symlinked directory: {directory}"
                    )
                if dirname in EXCLUDED_DIRS:
                    continue
                retained_dirs.append(dirname)
            dirnames[:] = retained_dirs
            for filename in filenames:
                p = Path(dirpath) / filename
                if p.is_symlink():
                    try:
                        p.resolve().relative_to(repo_root)
                    except ValueError:
                        raise ScanError(
                            f"discovered symlinked file outside repo_root: {p}"
                        )
                    raise ScanError(f"cannot safely scan symlinked file: {p}")
                if p.suffix.lower() in SCANNED_EXTENSIONS:
                    yield p


def scan_file(
    path: Path,
    pattern: re.Pattern[str],
) -> list[tuple[int, str, str, int, int]]:
    hits: list[tuple[int, str, str, int, int]] = []
    try:
        with path.open("r", encoding="utf-8") as fh:
            for lineno, line in enumerate(fh, start=1):
                for match in pattern.finditer(line):
                    hits.append((
                        lineno,
                        match.group(0),
                        line.rstrip("\n"),
                        match.start(),
                        match.end(),
                    ))
    except (OSError, UnicodeError) as exc:
        raise ScanError(f"cannot scan {path}: {exc}") from exc
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
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        raise ScanError(f"cannot scan {path}: {exc}") from exc

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
    parser = argparse.ArgumentParser(description="HaemCalc tone-guard scanner")
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--waivers")
    parser.add_argument("--as-of")
    parser.add_argument("paths", nargs="*")
    args = parser.parse_args(argv[1:])

    try:
        raw_repo_root = lexical_cli_path(
            args.repo_root,
            "repo_root",
            allow_bare_dot=True,
        ).absolute()
        raw_roots = [
            lexical_cli_path(path, "scan target") for path in args.paths
        ]
        raw_waiver_path = (
            lexical_cli_path(args.waivers, "waiver manifest")
            if args.waivers is not None
            else None
        )
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    repo_root_symlink = first_symlink_component(raw_repo_root)
    if repo_root_symlink is not None:
        print(
            f"ERROR: cannot safely use symlinked repo_root: {repo_root_symlink}",
            file=sys.stderr,
        )
        return 1
    repo_root = raw_repo_root.resolve()
    for raw_root in raw_roots:
        symlink_component = first_symlink_component(raw_root)
        if symlink_component is not None:
            try:
                symlink_component.resolve().relative_to(repo_root)
            except ValueError:
                print(
                    f"ERROR: scan target outside repo_root: {raw_root}",
                    file=sys.stderr,
                )
                return 1
            print(
                "ERROR: cannot safely scan symlinked scan target component: "
                f"{symlink_component}",
                file=sys.stderr,
            )
            return 1
    roots = [path.resolve() for path in raw_roots] or [repo_root]
    if raw_waiver_path is not None:
        waiver_symlink = first_symlink_component(raw_waiver_path)
        if waiver_symlink is not None:
            print(
                "ERROR: cannot safely load symlinked waiver manifest component: "
                f"{waiver_symlink}",
                file=sys.stderr,
            )
            return 1
    waiver_path = raw_waiver_path.resolve() if raw_waiver_path else None
    if not repo_root.is_dir():
        print(f"ERROR: repo_root is not a directory: {repo_root}", file=sys.stderr)
        return 1
    if waiver_path is not None:
        try:
            waiver_path.relative_to(repo_root)
        except ValueError:
            print(
                f"ERROR: waiver manifest outside repo_root: {waiver_path}",
                file=sys.stderr,
            )
            return 1
    for root in roots:
        try:
            root.relative_to(repo_root)
        except ValueError:
            print(f"ERROR: scan target outside repo_root: {root}", file=sys.stderr)
            return 1
        if not root.exists():
            print(f"ERROR: scan target does not exist: {root}", file=sys.stderr)
            return 1
    try:
        waivers = load_waivers(waiver_path)
        validate_waiver_files(waivers, repo_root)
    except (OSError, json.JSONDecodeError, WaiverManifestError) as exc:
        print(f"ERROR: invalid waiver manifest: {exc}", file=sys.stderr)
        return 1
    try:
        if args.as_of is not None and re.fullmatch(
            r"[0-9]{4}-[0-9]{2}-[0-9]{2}",
            args.as_of,
        ) is None:
            raise ValueError("date must use YYYY-MM-DD")
        as_of = date.fromisoformat(args.as_of) if args.as_of else date.today()
    except ValueError as exc:
        print(f"ERROR: invalid --as-of date: {exc}", file=sys.stderr)
        return 1
    expired = [
        waiver
        for waiver in waivers
        if waiver.status == "active" and waiver.expires_on < as_of
    ]
    if expired:
        for waiver in expired:
            print(
                f"ERROR: waiver {waiver.waiver_id} expired on "
                f"{waiver.expires_on.isoformat()}",
                file=sys.stderr,
            )
        return 1
    pattern = build_pattern(BANNED_WORDS)

    total_hits = 0
    total_waived = 0
    files_scanned = 0
    files_with_hits = 0

    try:
        scan_paths = list(iter_files(roots, repo_root))
    except ScanError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    for path in scan_paths:
        if waiver_path is not None and path.resolve() == waiver_path:
            continue
        files_scanned += 1
        try:
            path.resolve().relative_to(repo_root)
        except ValueError:
            total_hits += 1
            files_with_hits += 1
            print(
                f"ERROR: discovered scan target outside repo_root: {path}",
                file=sys.stderr,
            )
            continue
        file_had_hits = False

        try:
            word_hits = scan_file(path, pattern)
            block_hits = scan_inline_block_balance(path)
        except ScanError as exc:
            total_hits += 1
            files_with_hits += 1
            print(f"ERROR: {exc}", file=sys.stderr)
            continue

        # Banned-words check
        for lineno, match, line, match_start, match_end in word_hits:
            waiver = next(
                (
                    candidate
                    for candidate in waivers
                    if candidate.matches_scope(
                        path,
                        match,
                        line,
                        match_start,
                        match_end,
                        repo_root,
                    )
                ),
                None,
            )
            if waiver is not None:
                waiver.matches += 1
            if waiver is not None and waiver.uses < waiver.max_occurrences:
                waiver.uses += 1
                total_waived += 1
                print(
                    f"WAIVED {waiver.waiver_id}: "
                    f"{path}:{lineno}:{match}: {line.strip()[:160]}"
                )
                print(
                    f"AUDIT {waiver_audit_record(waiver, outcome='waived', lineno=lineno)}"
                )
            elif waiver is not None:
                file_had_hits = True
                total_hits += 1
                relative_path = path.resolve().relative_to(repo_root).as_posix()
                print(
                    f"ERROR: overused waiver {waiver.waiver_id} "
                    f"approved_max={waiver.max_occurrences} "
                    f"actual_occurrence={waiver.matches} "
                    f"path={relative_path}:{lineno} term={match} "
                    f"text={line.strip()[:160]}",
                    file=sys.stderr,
                )
                print(
                    f"AUDIT {waiver_audit_record(waiver, outcome='overused', lineno=lineno)}",
                    file=sys.stderr,
                )
            else:
                file_had_hits = True
                total_hits += 1
                print(f"{path}:{lineno}:{match}: {line.strip()[:160]}")

        # Inline-block-balance check (HTML only)
        if block_hits:
            file_had_hits = True
            total_hits += len(block_hits)
            for lineno, match, line in block_hits:
                print(f"{path}:{lineno}:{match}: {line.strip()[:200]}")

        if file_had_hits:
            files_with_hits += 1

    unused = [
        waiver
        for waiver in waivers
        if waiver.status == "active" and waiver.uses == 0
    ]
    for waiver in unused:
        total_hits += 1
        print(
            f"ERROR: active waiver {waiver.waiver_id} is unused",
            file=sys.stderr,
        )

    print(
        f"\ntone-guard: {files_scanned} files scanned, "
        f"{files_with_hits} with hits, "
        f"{total_hits} hits total, "
        f"{total_waived} waived",
        file=sys.stderr,
    )

    return 0 if total_hits == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
