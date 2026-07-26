from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
TONE_GUARD = REPO_ROOT / "scripts" / "tone_guard.py"


class ToneGuardWaiverTests(unittest.TestCase):
    def run_guard(
        self,
        root: Path,
        target: Path,
        waivers: list[dict[str, object]],
        *,
        as_of: str = "2026-07-26",
        manifest_version: object = 1,
    ) -> subprocess.CompletedProcess[str]:
        manifest = root / ".github" / "tone-guard-waivers.json"
        manifest.parent.mkdir(parents=True, exist_ok=True)
        manifest.write_text(
            json.dumps({"version": manifest_version, "waivers": waivers}),
            encoding="utf-8",
        )
        return subprocess.run(
            [
                sys.executable,
                str(TONE_GUARD),
                "--repo-root",
                str(root),
                "--waivers",
                str(manifest),
                "--as-of",
                as_of,
                str(target),
            ],
            capture_output=True,
            text=True,
            check=False,
        )

    def run_guard_without_manifest(
        self,
        root: Path,
        target: Path,
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(TONE_GUARD),
                "--repo-root",
                str(root),
                str(target),
            ],
            capture_output=True,
            text=True,
            check=False,
        )

    def run_guard_with_manifest_text(
        self,
        root: Path,
        target: Path,
        manifest_text: str,
    ) -> subprocess.CompletedProcess[str]:
        manifest = root / ".github" / "tone-guard-waivers.json"
        manifest.parent.mkdir(parents=True, exist_ok=True)
        manifest.write_text(manifest_text, encoding="utf-8")
        return subprocess.run(
            [
                sys.executable,
                str(TONE_GUARD),
                "--repo-root",
                str(root),
                "--waivers",
                str(manifest),
                "--as-of",
                "2026-07-26",
                str(target),
            ],
            capture_output=True,
            text=True,
            check=False,
        )

    def exact_active_waiver(self) -> dict[str, object]:
        return {
            "id": "HC-WP2-CELLF-2026-001-TG-001",
            "work_package": "HC-WP2-CELLF-2026-001",
            "path": "public/reversal.html",
            "term": "significant",
            "exact_text": "clinically significant factor Xa inhibitor activity remains",
            "reason": "Programme Owner-approved clinical wording",
            "approved_by": "muhdmohsin1979",
            "status": "active",
            "expires_on": "2026-10-26",
            "max_occurrences": 1,
        }

    def test_exact_active_waiver_suppresses_one_hit_and_is_audited(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )

            result = self.run_guard(root, target, [self.exact_active_waiver()])

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("WAIVED HC-WP2-CELLF-2026-001-TG-001", result.stdout)
            self.assertIn("1 waived", result.stderr)
            audit_lines = [
                line.removeprefix("AUDIT ")
                for line in result.stdout.splitlines()
                if line.startswith("AUDIT ")
            ]
            self.assertEqual(len(audit_lines), 1)
            audit = json.loads(audit_lines[0])
            self.assertEqual(
                audit,
                {
                    "event": "tone_guard_waiver",
                    "outcome": "waived",
                    "waiver_id": "HC-WP2-CELLF-2026-001-TG-001",
                    "work_package": "HC-WP2-CELLF-2026-001",
                    "path": "public/reversal.html",
                    "line": 1,
                    "term": "significant",
                    "exact_text": (
                        "clinically significant factor Xa inhibitor activity remains"
                    ),
                    "reason": "Programme Owner-approved clinical wording",
                    "approved_by": "muhdmohsin1979",
                    "status": "active",
                    "expires_on": "2026-10-26",
                    "max_occurrences": 1,
                    "occurrence_count": 1,
                },
            )

    def test_expired_waiver_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )
            waiver = self.exact_active_waiver()
            waiver["expires_on"] = "2026-07-25"

            result = self.run_guard(root, target, [waiver])

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("expired", result.stderr.lower())

    def test_invalid_as_of_date_fails_without_traceback(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )

            for as_of in ("not-a-date", "20260726", "2026-W30-7"):
                result = self.run_guard(
                    root,
                    target,
                    [self.exact_active_waiver()],
                    as_of=as_of,
                )

                self.assertNotEqual(result.returncode, 0)
                self.assertIn("ERROR: invalid --as-of date", result.stderr)
                self.assertNotIn("Traceback", result.stderr)

    def test_active_unused_waiver_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text("No banned prose here.\n", encoding="utf-8")

            result = self.run_guard(root, target, [self.exact_active_waiver()])

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("unused", result.stderr.lower())

    def test_path_traversal_waiver_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )
            waiver = self.exact_active_waiver()
            waiver["path"] = "../public/reversal.html"

            result = self.run_guard(root, target, [waiver])

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("repository-relative file without traversal", result.stderr)

    def test_dot_waiver_path_is_rejected_as_non_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "clean.html"
            target.write_text("Clean text.\n", encoding="utf-8")
            waiver = self.exact_active_waiver()
            waiver["path"] = "."
            waiver["status"] = "closed"

            result = self.run_guard(root, target, [waiver])

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("path must be a repository-relative file", result.stderr)

    def test_waiver_paths_must_be_existing_regular_files(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "clean.html"
            target.write_text("Clean text.\n", encoding="utf-8")
            directory = root / "directory"
            directory.mkdir()
            alias = root / "alias.html"
            alias.symlink_to(target)

            for status in ("active", "closed"):
                for invalid_path in (
                    "does/not/exist.html",
                    "directory",
                    "alias.html",
                ):
                    waiver = self.exact_active_waiver()
                    waiver["path"] = invalid_path
                    waiver["status"] = status
                    result = self.run_guard(root, target, [waiver])

                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn(
                        "waiver path must identify an existing non-symlinked regular file",
                        result.stderr,
                    )

    def test_non_string_status_fails_without_traceback(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "clean.html"
            target.write_text("Clean text.\n", encoding="utf-8")
            waiver = self.exact_active_waiver()
            waiver["status"] = []

            result = self.run_guard(root, target, [waiver])

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("status must be active or closed", result.stderr)
            self.assertNotIn("Traceback", result.stderr)

    def test_waiver_manifest_outside_repo_root_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            root = base / "repo"
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )
            manifest = base / "tone-guard-waivers.json"
            manifest.write_text(
                json.dumps({
                    "version": 1,
                    "waivers": [self.exact_active_waiver()],
                }),
                encoding="utf-8",
            )

            result = subprocess.run(
                [
                    sys.executable,
                    str(TONE_GUARD),
                    "--repo-root",
                    str(root),
                    "--waivers",
                    str(manifest),
                    "--as-of",
                    "2026-07-26",
                    str(target),
                ],
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("waiver manifest outside repo_root", result.stderr)

    def test_boolean_manifest_version_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )

            result = self.run_guard(
                root,
                target,
                [self.exact_active_waiver()],
                manifest_version=True,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("version must be integer 1", result.stderr)

    def test_noncanonical_expiry_representations_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )

            for expiry in ("20261026", "2026-W44-1"):
                waiver = self.exact_active_waiver()
                waiver["expires_on"] = expiry
                result = self.run_guard(root, target, [waiver])
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("expires_on must use YYYY-MM-DD", result.stderr)

    def test_duplicate_json_keys_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )
            waiver_json = json.dumps(self.exact_active_waiver())
            duplicate_status = waiver_json.replace(
                '"status": "active"',
                '"status": "closed", "status": "active"',
            )
            manifests = [
                (
                    '{"version": 0, "version": 1, "waivers": ['
                    + waiver_json
                    + "]}"
                ),
                '{"version": 1, "waivers": [' + duplicate_status + "]}",
            ]

            for manifest_text in manifests:
                result = self.run_guard_with_manifest_text(
                    root,
                    target,
                    manifest_text,
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("duplicate JSON key", result.stderr)

    def test_unknown_manifest_and_waiver_fields_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )
            waiver_with_unknown = self.exact_active_waiver()
            waiver_with_unknown["unexpected_item"] = True
            manifests = [
                {
                    "version": 1,
                    "waivers": [self.exact_active_waiver()],
                    "unexpected_top": True,
                },
                {"version": 1, "waivers": [waiver_with_unknown]},
            ]

            for manifest in manifests:
                result = self.run_guard_with_manifest_text(
                    root,
                    target,
                    json.dumps(manifest),
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("unexpected fields", result.stderr)

    def test_waiver_does_not_apply_to_another_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "other.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )
            (target.parent / "reversal.html").write_text(
                "Clean text.\n",
                encoding="utf-8",
            )

            result = self.run_guard(root, target, [self.exact_active_waiver()])

            self.assertNotEqual(result.returncode, 0)
            self.assertIn(":significant:", result.stdout)
            self.assertNotIn("WAIVED", result.stdout)

    def test_waiver_does_not_apply_to_another_phrase_or_term(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text("This remains significant.\n", encoding="utf-8")

            phrase_result = self.run_guard(
                root,
                target,
                [self.exact_active_waiver()],
            )
            term_waiver = self.exact_active_waiver()
            term_waiver["term"] = "crucial"
            term_waiver["exact_text"] = "This remains crucial."
            term_result = self.run_guard(root, target, [term_waiver])

            for result in (phrase_result, term_result):
                self.assertNotEqual(result.returncode, 0)
                self.assertNotIn("WAIVED", result.stdout)

    def test_waiver_binds_to_term_occurrence_inside_exact_text(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains "
                "and another significant claim\n",
                encoding="utf-8",
            )
            waiver = self.exact_active_waiver()
            waiver["max_occurrences"] = 2

            result = self.run_guard(root, target, [waiver])

            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(result.stdout.count("WAIVED"), 1)
            self.assertIn(":significant:", result.stdout)
            self.assertIn("1 hits total", result.stderr)

    def test_duplicate_waiver_ids_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )
            waiver = self.exact_active_waiver()

            result = self.run_guard(root, target, [waiver, waiver.copy()])

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("duplicate waiver id", result.stderr)

    def test_waiver_id_must_belong_to_declared_work_package(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )
            waiver = self.exact_active_waiver()
            waiver["work_package"] = "HC-WP3A-CI-WAIVER-2026-001"

            result = self.run_guard(root, target, [waiver])

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("id must belong to work_package", result.stderr)

    def test_occurrences_above_the_approved_maximum_remain_blocking(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            phrase = "clinically significant factor Xa inhibitor activity remains\n"
            target.write_text(phrase + phrase, encoding="utf-8")

            result = self.run_guard(root, target, [self.exact_active_waiver()])

            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(result.stdout.count("WAIVED"), 1)
            self.assertIn("1 hits total", result.stderr)
            self.assertIn(
                "ERROR: overused waiver HC-WP2-CELLF-2026-001-TG-001",
                result.stderr,
            )
            self.assertIn("approved_max=1 actual_occurrence=2", result.stderr)
            self.assertIn("public/reversal.html:2", result.stderr)
            self.assertIn("term=significant", result.stderr)
            self.assertIn(
                "text=clinically significant factor Xa inhibitor activity remains",
                result.stderr,
            )
            audit_lines = [
                line.removeprefix("AUDIT ")
                for line in result.stderr.splitlines()
                if line.startswith("AUDIT ")
            ]
            self.assertEqual(len(audit_lines), 1)
            audit = json.loads(audit_lines[0])
            self.assertEqual(audit["outcome"], "overused")
            self.assertEqual(audit["work_package"], "HC-WP2-CELLF-2026-001")
            self.assertEqual(audit["path"], "public/reversal.html")
            self.assertEqual(audit["term"], "significant")
            self.assertEqual(
                audit["exact_text"],
                "clinically significant factor Xa inhibitor activity remains",
            )
            self.assertEqual(audit["approved_by"], "muhdmohsin1979")
            self.assertEqual(audit["status"], "active")
            self.assertEqual(audit["expires_on"], "2026-10-26")
            self.assertEqual(audit["max_occurrences"], 1)
            self.assertEqual(audit["occurrence_count"], 2)

    def test_closed_waiver_suppresses_nothing(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n",
                encoding="utf-8",
            )
            waiver = self.exact_active_waiver()
            waiver["status"] = "closed"

            result = self.run_guard(root, target, [waiver])

            self.assertNotEqual(result.returncode, 0)
            self.assertNotIn("WAIVED", result.stdout)

    def test_waiver_cannot_suppress_inline_block_failure(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text(
                "clinically significant factor Xa inhibitor activity remains\n"
                '<script>const value = "</script>";</script>\n',
                encoding="utf-8",
            )

            result = self.run_guard(root, target, [self.exact_active_waiver()])

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("orphan-</script>", result.stdout)
            self.assertIn("WAIVED", result.stdout)

    def test_no_manifest_preserves_blocking_behaviour(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_text("This is significant.\n", encoding="utf-8")

            result = self.run_guard_without_manifest(root, target)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn(":significant:", result.stdout)

    def test_unreadable_text_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "public" / "reversal.html"
            target.parent.mkdir(parents=True)
            target.write_bytes(b"\xff\xfe\x00")

            result = self.run_guard_without_manifest(root, target)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("ERROR: cannot scan", result.stderr)

    def test_scan_target_outside_repo_root_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            root = base / "repo"
            root.mkdir()
            outside = base / "outside.html"
            outside.write_text("Clean text.\n", encoding="utf-8")
            target = root / "linked.html"
            target.symlink_to(outside)

            result = self.run_guard_without_manifest(root, target)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("outside repo_root", result.stderr)

    def test_discovered_symlink_outside_repo_root_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            root = base / "repo"
            public = root / "public"
            public.mkdir(parents=True)
            outside = base / "outside.html"
            outside.write_text("Clean text.\n", encoding="utf-8")
            (public / "linked.html").symlink_to(outside)

            result = self.run_guard_without_manifest(root, root)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("outside repo_root", result.stderr)

    def test_discovered_symlinked_directory_outside_repo_root_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            root = base / "repo"
            root.mkdir()
            outside = base / "outside"
            outside.mkdir()
            (outside / "clean.html").write_text("Clean text.\n", encoding="utf-8")
            (root / "linked-directory").symlink_to(outside, target_is_directory=True)

            result = self.run_guard_without_manifest(root, root)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("outside repo_root", result.stderr)

    def test_excluded_name_symlinked_directory_outside_repo_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            root = base / "repo"
            root.mkdir()
            outside = base / "outside"
            outside.mkdir()
            (outside / "escape.html").write_text(
                "Another significant claim.\n",
                encoding="utf-8",
            )
            (root / "node_modules").symlink_to(outside, target_is_directory=True)

            result = self.run_guard_without_manifest(root, root)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("outside repo_root", result.stderr)

    def test_discovered_internal_file_symlink_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "source.html"
            target.write_text("Clean text.\n", encoding="utf-8")
            (root / "alias.html").symlink_to(target)

            result = self.run_guard_without_manifest(root, root)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("symlinked file", result.stderr)

    def test_explicit_internal_file_symlink_target_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "source.html"
            target.write_text("Clean text.\n", encoding="utf-8")
            alias = root / "alias.html"
            alias.symlink_to(target)

            result = self.run_guard_without_manifest(root, alias)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("symlinked scan target", result.stderr)

    def test_non_scanned_name_file_symlink_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            root = base / "repo"
            root.mkdir()
            outside = base / "outside.html"
            outside.write_text("Another significant claim.\n", encoding="utf-8")
            (root / "alias.data").symlink_to(outside)

            result = self.run_guard_without_manifest(root, root)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("symlinked file", result.stderr)

    def test_noncanonical_cli_paths_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            public = root / "public"
            public.mkdir()
            target = public / "clean.html"
            target.write_text("Clean text.\n", encoding="utf-8")
            manifest = root / "waivers.json"
            manifest.write_text(
                json.dumps({"version": 1, "waivers": []}),
                encoding="utf-8",
            )
            cases = [
                ["--repo-root", f"{root}/public/.."],
                [
                    "--repo-root",
                    str(root),
                    f"{root}/missing/../public/clean.html",
                ],
                [
                    "--repo-root",
                    str(root),
                    "--waivers",
                    f"{root}/missing/../waivers.json",
                    str(target),
                ],
                ["--repo-root", str(root), f"{root}/public/./clean.html"],
                ["--repo-root", str(root), f"{root}//public/clean.html"],
            ]

            for arguments in cases:
                result = subprocess.run(
                    [sys.executable, str(TONE_GUARD), *arguments],
                    text=True,
                    capture_output=True,
                    check=False,
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("non-canonical", result.stderr)

    def test_symlinked_repo_root_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            real_root = base / "repo"
            real_root.mkdir()
            (real_root / "clean.html").write_text("Clean text.\n", encoding="utf-8")
            linked_root = base / "linked-repo"
            linked_root.symlink_to(real_root, target_is_directory=True)

            result = subprocess.run(
                [sys.executable, str(TONE_GUARD), "--repo-root", str(linked_root)],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("symlinked repo_root", result.stderr)

    def test_scan_target_beneath_symlinked_parent_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            real_directory = root / "real-directory"
            real_directory.mkdir()
            target = real_directory / "clean.html"
            target.write_text("Clean text.\n", encoding="utf-8")
            linked_directory = root / "linked-directory"
            linked_directory.symlink_to(real_directory, target_is_directory=True)

            result = self.run_guard_without_manifest(
                root,
                linked_directory / "clean.html",
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("symlinked scan target component", result.stderr)

    def test_waiver_manifest_beneath_symlinked_parent_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            target = root / "clean.html"
            target.write_text("Clean text.\n", encoding="utf-8")
            real_directory = root / "real-directory"
            real_directory.mkdir()
            manifest = real_directory / "waivers.json"
            manifest.write_text(
                json.dumps({"version": 1, "waivers": []}),
                encoding="utf-8",
            )
            linked_directory = root / "linked-directory"
            linked_directory.symlink_to(real_directory, target_is_directory=True)

            result = subprocess.run(
                [
                    sys.executable,
                    str(TONE_GUARD),
                    "--repo-root",
                    str(root),
                    "--waivers",
                    str(linked_directory / "waivers.json"),
                    str(target),
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("symlinked waiver manifest component", result.stderr)

    def test_repo_root_beneath_symlinked_parent_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            real_parent = base / "real-parent"
            real_root = real_parent / "repo"
            real_root.mkdir(parents=True)
            linked_parent = base / "linked-parent"
            linked_parent.symlink_to(real_parent, target_is_directory=True)

            result = subprocess.run(
                [
                    sys.executable,
                    str(TONE_GUARD),
                    "--repo-root",
                    str(linked_parent / "repo"),
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("symlinked repo_root", result.stderr)

    def test_scan_targets_via_sibling_symlink_aliases_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            root = base / "repo"
            root.mkdir()
            source = root / "source.html"
            source.write_text("Clean text.\n", encoding="utf-8")
            directory_alias = base / "repo-alias"
            directory_alias.symlink_to(root, target_is_directory=True)
            file_alias = base / "source-alias.html"
            file_alias.symlink_to(source)

            results = [
                self.run_guard_without_manifest(root, directory_alias / "source.html"),
                self.run_guard_without_manifest(root, file_alias),
            ]

            for result in results:
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("symlinked scan target component", result.stderr)

    def test_waiver_manifests_via_sibling_symlink_aliases_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp).resolve()
            root = base / "repo"
            root.mkdir()
            target = root / "clean.html"
            target.write_text("Clean text.\n", encoding="utf-8")
            manifest = root / "waivers.json"
            manifest.write_text(
                json.dumps({"version": 1, "waivers": []}),
                encoding="utf-8",
            )
            directory_alias = base / "repo-alias"
            directory_alias.symlink_to(root, target_is_directory=True)
            file_alias = base / "waivers-alias.json"
            file_alias.symlink_to(manifest)

            results = []
            for waiver_path in (
                directory_alias / "waivers.json",
                file_alias,
            ):
                results.append(
                    subprocess.run(
                        [
                            sys.executable,
                            str(TONE_GUARD),
                            "--repo-root",
                            str(root),
                            "--waivers",
                            str(waiver_path),
                            str(target),
                        ],
                        text=True,
                        capture_output=True,
                        check=False,
                    )
                )

            for result in results:
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("symlinked waiver manifest component", result.stderr)


if __name__ == "__main__":
    unittest.main()
