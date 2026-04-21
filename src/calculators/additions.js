/* ============================================================================
   HaemCalc Pro — v4.5 calculator additions module
   ----------------------------------------------------------------------------
   This file is the FIRST step of the calculator modularisation. Additions live
   here and are spread-merged into the main `C` object in HaemCalcPro_v4.jsx.
   The plan (follow-up PR) is to migrate the legacy `C` entries out of the
   monolith into per-domain modules (lymphoma.js, mds-aml.js, vte.js, etc).

   Every entry in this file MUST carry:
     - A verifiable primary citation (PMID)
     - A current guideline reference (BSH / NICE / ELN / ISTH / ASH etc.)
     - whenUse / whenNot / limits — no calculator is safe without them
   Do NOT add a calculator without a real, checked citation.
   ============================================================================ */

export const ADDITIONS = {

  /* -------------------------------------------------------------------------
     GANZONI FORMULA — IV iron deficit (cumulative dose)
     ---------------------------------------------------------------------------
     Iron deficit (mg) = body weight (kg) × (target Hb − actual Hb) (g/dL) × 2.4
                        + iron stores (mg)
     Iron stores: 500 mg if body weight ≥35 kg, else 15 mg/kg.

     Primary: Ganzoni AM. Schweiz Med Wochenschr. 1970;100(7):301-3.
              PMID 5413918 (no DOI — pre-dates DOI registration).
     Guideline context: Snook J et al., BSG guidelines for management of iron
              deficiency anaemia in adults. Gut. 2021;70(11):2030-2051.
              DOI 10.1136/gutjnl-2021-325210. PMID 34497146.
     Note: Modern IV iron products (ferric carboxymaltose, iron
              isomaltoside/derisomaltose) often use simplified fixed-dose
              tables; the Ganzoni estimate remains useful for calculated
              cumulative need and for products dosed per total deficit.
  ------------------------------------------------------------------------- */
  ganzoni: {
    id: 'ganzoni',
    name: 'Ganzoni Iron Deficit',
    purpose: 'Estimate total body iron deficit (mg) to guide IV iron replacement in iron-deficiency anaemia.',
    cat: 'benign',
    disease: 'Iron Studies',
    icon: '🧪',
    tags: ['iron', 'deficiency', 'anaemia', 'IV iron', 'ganzoni', 'ferric carboxymaltose', 'isomaltoside', 'derisomaltose', 'bsg'],
    evidence: {
      source: 'Ganzoni AM. Schweiz Med Wochenschr. 1970;100(7):301-3. Contemporary context: Snook J et al., Gut. 2021;70(11):2030-51.',
      guideline: 'BSG 2021 / BSH / NICE CKS (Iron deficiency anaemia)',
      year: 2021,
      pmid: '34497146'
    },
    whenUse: 'Confirmed iron deficiency anaemia where IV iron is indicated (oral iron intolerance, malabsorption, ongoing blood loss exceeding oral replacement, CKD with ESA therapy, severe anaemia requiring rapid correction, pregnancy 2nd/3rd trimester where oral has failed).',
    whenNot: 'Active infection or bacteraemia (defer IV iron). Known iron overload. Anaemia not due to iron deficiency (check ferritin and Tsat first). First-trimester pregnancy (avoid IV iron if possible).',
    limits: 'Formula assumes Hb-bound iron and fixed stores; underestimates need in ongoing blood loss. Many licensed products (e.g. ferric carboxymaltose, iron isomaltoside/derisomaltose) use simplified weight-and-Hb tables per SmPC — prescribe per the product-specific table where applicable. Not validated in children <14 kg.',
    inputs: [
      { id: 'weight',    label: 'Body weight (kg)',          type: 'number', min: 5,   max: 250, step: 0.5 },
      { id: 'hb',        label: 'Current haemoglobin (g/dL)', type: 'number', min: 3,   max: 18,  step: 0.1 },
      { id: 'targetHb',  label: 'Target haemoglobin (g/dL)',  type: 'number', min: 10,  max: 16,  step: 0.5 },
    ],
    calc: (v) => {
      const w  = Number(v.weight)   || 0;
      const hb = Number(v.hb)       || 0;
      const tg = Number(v.targetHb) || 15;   // conventional Ganzoni target 15 g/dL

      if (!w || !hb) {
        return {
          score: '-',
          max: null,
          risk: 'info',
          label: 'Enter weight and current Hb',
          stats: [],
          interp: 'Awaiting input.',
          next: ''
        };
      }
      if (hb >= tg) {
        return {
          score: 0,
          max: null,
          risk: 'low',
          label: 'Current Hb already at or above target',
          stats: [
            ['Current Hb', hb + ' g/dL'],
            ['Target Hb',  tg + ' g/dL'],
          ],
          interp: 'No Hb deficit to correct. Verify iron indices (ferritin, Tsat) before considering any IV iron for stores alone.',
          next: 'If ferritin low with normal Hb, discuss risks/benefits of IV iron for stores with the patient and follow local protocol.'
        };
      }

      const hbDeficit = tg - hb;
      const stores    = w >= 35 ? 500 : Math.round(15 * w);
      const hbPortion = w * hbDeficit * 2.4;
      const totalMg   = Math.round(hbPortion + stores);

      let risk, label, interp;
      if (totalMg < 500) {
        risk = 'low';
        label = 'Low total iron deficit';
        interp = 'Small estimated deficit. A single-dose IV iron product is likely sufficient; oral iron may remain reasonable if tolerated.';
      } else if (totalMg < 1500) {
        risk = 'int';
        label = 'Moderate total iron deficit';
        interp = 'Typical outpatient replacement range. Deliverable in one or two infusions with most modern IV iron preparations per SmPC.';
      } else {
        risk = 'high';
        label = 'High total iron deficit';
        interp = 'Large deficit. Will usually require split dosing across multiple infusions per product SmPC limits.';
      }

      return {
        score: totalMg + ' mg',
        max: null,
        risk,
        label,
        stats: [
          ['Hb deficit',          hbDeficit.toFixed(1) + ' g/dL'],
          ['Hb-bound iron',       Math.round(hbPortion) + ' mg'],
          ['Iron stores',         stores + ' mg'],
          ['Total iron deficit',  totalMg + ' mg'],
          ['Weight',              w + ' kg'],
        ],
        interp,
        next: 'Prescribe IV iron per local formulary and product SmPC (e.g. ferric carboxymaltose, iron isomaltoside/derisomaltose). Check the product-specific simplified dose table where provided, as it may diverge from the calculated Ganzoni estimate. Recheck FBC and ferritin 4–8 weeks after replacement. Investigate cause of iron deficiency (GI, menstrual, dietary, malabsorption) per BSG 2021.'
      };
    }
  },

};
