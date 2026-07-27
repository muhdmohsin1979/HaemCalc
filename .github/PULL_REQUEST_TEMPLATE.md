<!--
  HaemCalc Pro pull-request template.
  Tick every box that applies. Mark N/A and explain if a box does not apply.
  PRs that touch clinical content must NOT be merged with unticked clinical-safety boxes.
-->

## Summary

<!-- One short paragraph: what this PR changes and why. -->

## Type of change

- [ ] Bug fix (non-clinical)
- [ ] Bug fix (clinical — dose, branch, threshold, or recommendation)
- [ ] New calculator or pathway
- [ ] Reference / citation update
- [ ] UI / styling / mobile / print
- [ ] Build, tooling, or CI
- [ ] Documentation (SOP, README, evidence table)

## Clinical-safety checklist (mandatory if any clinical content changed)

- [ ] Every changed dose, threshold, or branch is traceable to a primary source (NICE TA, SmPC on EMC, BSH guideline, MHRA, peer-reviewed primary trial). The source URL and accessed date are in the diff or the PR description.
- [ ] No clinical claim has been added or modified from memory. Anything unverifiable is marked `[unverified — needs source]` rather than guessed.
- [ ] On-call Consultant Haematologist contact, escalation triggers, and "do not delay resuscitation" guidance are unchanged or improved (not weakened).
- [ ] Trust-customisable items (4F-PCC product, protamine doses, MHP activation criteria, named owners) are flagged as `[Trust customisation]` rather than hard-coded.
- [ ] If any input range, default, or branch logic was changed, an explicit unit test covering the change is included in the PR description.
- [ ] If a recommendation could plausibly differ between NHS Scotland and rest-of-UK (e.g. NICE-funded scope), the divergence is surfaced to the user.

## Reference and link integrity

- [ ] Every URL touched in this PR was hit live on the PR's working day. None return 404 or redirect to a search page.
- [ ] Direct SmPC links are used in preference to EMC search-result pages.
- [ ] Any new primary source has a structured entry in the `REFS` object in `public/reversal.html`.

## Tone guard

- [ ] `python scripts/tone_guard.py --repo-root . --waivers .github/tone-guard-waivers.json` exits with status 0 against the changed files (or is run by CI on this PR).
- [ ] No restricted term has been introduced unless an exact active manifest waiver covers it.
- [ ] If the waiver manifest changed, independent technical review is recorded and the Programme Owner decision identifies the Work Package, exact candidate tree or commit SHA, exact manifest SHA-256 and approving owner.

## Build, mobile, and print

- [ ] `npm run build` succeeds locally.
- [ ] Mobile render verified at ≤ 380 px viewport (form grid collapses, dose tables fit, draft banner readable).
- [ ] Print preview shows the signature block and hides the no-print zones (where applicable).

## Governance

- [ ] If this PR materially changes a clinical recommendation, the document set version in `outputs/haemcalc-cdss/06_governance_metadata.md` is incremented and `08_change_log.md` has a new entry.
- [ ] Re-validation per `05_validation_framework.md` is triggered or explicitly waived in the PR description.

## Reviewer note

<!-- Anything the reviewer should look at first or any decision they should sanity-check. -->
