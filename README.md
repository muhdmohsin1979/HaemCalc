# HaemCalc

**Live site: [https://haemcalc.com](https://haemcalc.com)**

**Anticoagulation Reversal Calculator: [https://haemcalc.com/reversal](https://haemcalc.com/reversal)**

---

HaemCalc is a clinical decision-support platform for haematology, developed and maintained by Dr Muhammad Mohsin, Consultant Haematologist.

The Anticoagulation Reversal Calculator at `/reversal` provides interactive dose recommendations for DOACs, warfarin, heparin, LMWH, fondaparinux, argatroban, and bivalirudin, anchored to BSH guidance and current SmPCs. Each recommendation is paired with evidence-hierarchy badges (PR β), a consultant reasoning panel (PR γ), an MDT handover line (PR δ), a clinical-debate and uncertainty section (PR α), and a governance footer recording review state under the Governance Metadata Schema v1.0 (PR ζ).

## Status

DRAFT — pending Trust ratification. Use remains subject to local Trust governance.

## Governance

- Last clinically reviewed: 11 May 2026
- Next scheduled review: 11 November 2026
- Primary reviewer: Dr Muhammad Mohsin, Consultant Haematologist
- Source set version: 0.3.2-addendum

See [public/reversal.html](public/reversal.html) for the governance footer and the full set of clinical layers.

## Repository structure

- `src/` — React application (HaemCalc Pro, Vite build)
- `public/` — Static assets served at the site root, including `reversal.html`, `sitemap.xml`, `robots.txt`
- `scripts/` — Tone-guard and SmPC re-verification scanners
- `.github/workflows/` — CI workflows (tone-guard, SmPC re-verification)
- `wrangler.jsonc` — Cloudflare Workers configuration

## License and authorship

&copy; 2026 Dr Muhammad Mohsin. All rights reserved. Authored and developed by Dr Muhammad Mohsin, Consultant Haematologist. The right of Dr Muhammad Mohsin to be identified as the author of this work has been asserted in accordance with the Copyright, Designs and Patents Act 1988.
