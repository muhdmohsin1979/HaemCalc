# Contributing to HaemCalc Pro

This document is the rulebook for any change to this repository — by Dr Muhammad Mohsin, by collaborators, or by an automated agent acting on his behalf.# Contributing to HaemCalc Pro

This document is the rulebook for any change to this repository — by Dr Muhammad Mohsin, by collaborators, or by an automated agent acting on his behalf. The repository powers a clinical decision support tool used at point of care. Every change is potentially patient-safety relevant. The rules below exist so that no change reaches a clinician without the safeguards described.

## 1. Branching and pull-request flow

- The default branch is `main`. **Direct commits to `main` are not permitted** — every change goes through a pull request.
- Branch names follow the pattern `draft/<short-slug>-<yyyymmdd>` for new work, or whatever GitHub auto-generates for web-edits. The branch name is cosmetic; the PR title and description are what matter.
- Every PR is opened with `?expand=1` so the description template (`.github/PULL_REQUEST_TEMPLATE.md`) is loaded automatically.
- Cloudflare Workers builds a preview deployment on every PR. The preview URL appears as a comment from the `cloudflare-workers-and-pages` bot. Reviewers must visit the preview before approving.
- A PR may only be merged after the author or a reviewer has visited the preview URL and confirmed that the change renders as intended on desktop and on a ≤ 380 px viewport.

## 2. Sources of truth

Clinical content in this repository is grounded in primary regulatory and society sources, not in memory:

- **NICE Technology Appraisals and Guidelines** — `nice.org.uk/guidance/<id>`
- **Summaries of Product Characteristics (UK)** — `medicines.org.uk/emc/product/<id>/smpc`
- **British Society for Haematology guidelines** — `b-s-h.org.uk/guidelines/`
- **MHRA Drug Safety Update** — `gov.uk/drug-safety-update`
- **Peer-reviewed primary trials and meta-analyses on PubMed** — `pubmed.ncbi.nlm.nih.gov/<pmid>`

Every clinical recommendation in `public/reversal.html`, in the SOP at `outputs/haemcalc-cdss/01_clinical_sop.md`, and in the evidence table at `outputs/haemcalc-cdss/04_evidence_table.md` ties to one or more of these sources by URL and accessed date.

When a primary source is gated (BSH PDFs behind login), the citation is recorded by URL and the dose tables are transcribed only when the implementing clinician supplies the PDF. Memory-based dose tables are never written.

## 3. The "no fabrication" rule

If a number, citation, recommendation, or guideline reference cannot be verified against a live primary source on the day of the PR, the contribution is marked `[unverified — needs source]` rather than guessed. The reviewer is expected to refuse merging any PR that contains an unmarked unverifiable claim.

This rule applies to every change, including ones that "look right" or that are "common knowledge" in the field. Common knowledge changes between guideline cycles. Memory does not.

## 4. Tone guard

A scanner at `scripts/tone_guard.py` checks new prose against a banned-words list maintained in the script itself. The list is the project owner's preference and includes words that read as filler in clinical writing. Run the scanner locally before opening a PR:

```bash
python scripts/tone_guard.py \
  --repo-root . \
  --waivers .github/tone-guard-waivers.json \
  public/ CONTRIBUTING.md README.md
```

Exit code 0 means clean or covered by an exact active waiver. Non-zero means at least one blocking hit or an invalid, expired, unused or overused waiver. The scanner prints every blocking and waived occurrence with its file, line and waiver identity. CI runs the same scanner on every PR via `.github/workflows/tone-guard.yml`.

Waivers are stored in `.github/tone-guard-waivers.json`. Each waiver is limited to one Work Package, repository-relative file, restricted term, exact containing text, named owner, expiry date and maximum occurrence count. Closed waivers remain in the manifest for audit but suppress nothing. A waiver cannot suppress the HTML inline-block-balance check.

When a restricted term is necessary in controlled clinical or quoted primary-source text, do not alter accurate wording merely to satisfy the scanner. Add a narrowly scoped manifest entry and obtain the independent review and Programme Owner approval described in section 8.

## 5. Clinical-safety checklist

The PR template enforces the clinical-safety checklist. The two items reviewers must not skip:

- **Primary source for every changed dose, threshold, or branch.** No exceptions, including for "obvious" changes.
- **Unit tests for any logic change.** A change to the andexanet alfa dose-selection rules in late 2025 missed the SmPC dose-selection bug for over a year because no test exercised the standard-strength + within-8-hours combination. Every logic change since carries a unit test in the PR description.

## 6. Versioning and the change log

Material changes to clinical recommendations increment the document-set version in `outputs/haemcalc-cdss/06_governance_metadata.md` and add an entry to `08_change_log.md`. Editorial changes (typos, link cleanups, formatting) do not increment versions but are still recorded in the change log.

A material change is anything that could change which intervention a clinician selects: dose, threshold, branch, eligibility, escalation trigger, contraindication. A non-material change is anything that does not.

## 7. What is automated

A GitHub Actions workflow at `.github/workflows/tone-guard.yml` tests and runs the tone-guard scanner on every PR. A non-zero scanner exit remains blocking. The workflow has read-only repository permission, does not retain checkout credentials and does not claim to authenticate Programme Owner approval from PR-controlled code.

The Cloudflare Workers build is automatic on every push and PR. The build itself does not perform clinical validation; it only confirms the project compiles and renders.

## 8. What is not automated

- **Primary-source verification** — performed manually by the PR author and confirmed by the reviewer.
- **Mobile and print rendering** — visual inspection by the reviewer on the Cloudflare preview URL.
- **Validation of any new clinical pathway** against retrospective case data — performed per `outputs/haemcalc-cdss/05_validation_framework.md` Phase 1, before live deploy.
- **Tone-guard waiver authorisation** — every manifest change requires independent technical review and a Programme Owner decision recorded against the exact candidate tree or commit SHA and exact manifest SHA-256. The approval record states the Work Package, decision and approving owner. CI output proves scanner behaviour but does not self-authorise the waiver. Branch protection must not be changed to process an exception.

## 9. Roles

- **Project owner / clinical owner**: Dr Muhammad Mohsin, Consultant Haematologist. Final sign-off for any merge that changes clinical content.
- **Evidence owner**: to be named. Responsible for confirming primary sources are current and that any cited document has not been superseded.
- **Reviewers**: at least one independent consultant haematologist for any clinical-content PR.
- **Automated agent**: agents (e.g. an LLM-driven tool) may open PRs but may not approve or merge them. Every agent-authored PR must be reviewed by a human owner.

## 10. Rolling back

If a deployed change is found to contain a clinical error after merge, the rollback procedure is:

```
git revert <merge-sha> --no-edit
git push origin main
```

Cloudflare Workers redeploys automatically. The rollback PR carries the `rollback` label and a description of the error and how it was discovered. The change log records both the original entry and the rollback.

## 11. Asking for help

If a clinical question cannot be resolved by primary sources alone, escalate to a consultant haematologist before merging. If a code question cannot be resolved by reading the existing code, open a draft PR and request review rather than guessing.
