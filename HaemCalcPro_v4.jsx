import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, Moon, Sun, Star, Clock, ChevronRight, ChevronDown, ChevronLeft, AlertTriangle, BookOpen, Info, Activity, Clipboard, Check, Home, Grid3X3, Route, User, X, Menu, Heart, Zap, FlaskConical, Droplets, Calculator, ArrowRight, Shield, Brain, FileText, ExternalLink, RotateCcw, Copy, Printer, Stethoscope, TrendingUp, CircleDot, Microscope, Syringe, Pill, TestTube, Flame, Target, Scale, Gauge, Thermometer, Eye, Bone, Beaker, TreePine, BadgeCheck, ShieldAlert, ChevronUp, Layers, CircleAlert, TriangleAlert, Phone, ListChecks, GitBranch, Trash2, ShieldCheck, Lock, Globe, Accessibility } from "lucide-react";

/* ============================================================================
   HAEMCALC PRO v4.3 — GOLD-STANDARD CLINICAL DECISION PLATFORM
   Consultant-grade · Evidence-based · Guideline-aligned
   112 calculators · 11 clinical pathways · 7 diagnostic modules
   ============================================================================ */

// ─── ICON MAPPING (replaces emojis with Lucide icons) ────────────────────────
const IC={
  malignant:CircleDot, benign:Droplets, general:Stethoscope,
  dlbcl:CircleDot, fl:TreePine, hl:Heart, mcl:Target, cll:Microscope,
  tcl:Flame, mzl:TreePine, burkitt:Zap, wm:Microscope,
  mm:CircleDot, mgus:CircleDot, aml:CircleDot, mds:Microscope,
  cml:Gauge, mpn:Activity, et_pv:Activity, al_amyloid:Heart,
  aa:CircleDot, chip_ccus:Microscope, transplant:GitBranch, cart:Syringe, immunotherapy:Shield,
  hlh_tma:Flame, coag:Droplets, vte_dx:Stethoscope, af:Heart,
  vte_proph:ShieldAlert, fn:Thermometer, iron:TestTube, transfusion:Droplets,
  icu:TriangleAlert, cardiology:Heart, renal:Beaker, electrolytes:FlaskConical,
  hepatology:Pill, dosing:Syringe, fitness:Scale, haem_basics:Microscope,
  pathway:Route, diagnostic:GitBranch, acute:Zap,
  default:Calculator
};
const CIcon=({id,size=16,className=''})=>{const Comp=IC[id]||IC.default;return <Comp size={size} className={className}/>;};

// ─── CALCULATOR DATA (Gold-Standard Template) ────────────────────────────────
const C = {
hscore: {
  id:'hscore', name:'HScore', purpose:'Estimate probability of secondary HLH in adults based on clinical and laboratory parameters.',
  cat:'benign', disease:'HLH', icon:'🔬',
  tags:['hlh','haemophagocytosis','ferritin','pancytopenia','macrophage activation'],
  evidence:{source:'Fardet L et al. Arthritis Rheumatol. 2014;66(9):2613-20.',guideline:'Expert Consensus',year:2014,pmid:'24782338'},
  whenUse:'Suspected secondary HLH with unexplained fever, cytopenias, and elevated ferritin (>500 µg/L).',
  whenNot:'As sole diagnostic tool. Without clinical correlation. Primary/familial HLH in children (use HLH-2004 criteria).',
  limits:'Overlap with sepsis and inflammatory states. Not validated in all populations. Sensitivity/specificity vary with cutoffs.',
  inputs:[
    {id:'immuno',label:'Known immunosuppression (HIV, chronic steroids, post-transplant)',type:'select',opts:[['No',0],['Yes',18]]},
    {id:'temp',label:'Maximum temperature (°C)',type:'select',opts:[['<38.4°C',0],['38.4–39.4°C',33],['>39.4°C',49]]},
    {id:'hep',label:'Hepatomegaly',type:'select',opts:[['No',0],['Yes',23]]},
    {id:'spleen',label:'Splenomegaly',type:'select',opts:[['No',0],['Yes',26]]},
    {id:'cyto',label:'Number of cytopenias',type:'select',opts:[['1 lineage',24],['2 lineages',34],['3 lineages',40]]},
    {id:'ferritin',label:'Ferritin (µg/L)',type:'select',opts:[['<2000',0],['2000–6000',35],['>6000',50]]},
    {id:'trig',label:'Triglycerides (mmol/L)',type:'select',opts:[['<1.5',0],['1.5–4.0',44],['>4.0',64]]},
    {id:'fib',label:'Fibrinogen (g/L)',type:'select',opts:[['>2.5',0],['≤2.5',30]]},
    {id:'ast',label:'AST (U/L)',type:'select',opts:[['<30',0],['≥30',19]]},
    {id:'haemo',label:'Haemophagocytosis on bone marrow',type:'select',opts:[['No',0],['Yes',35]]},
  ],
  calc:(v)=>{
    const s=Object.values(v).reduce((a,b)=>a+b,0);
    let prob,risk,interp,next;
    if(s<90){prob='<1%';risk='low';interp='HLH effectively excluded at this score (<1% probability). Alternative diagnoses are substantially more likely.';next='Investigate for sepsis, viral infection (EBV/CMV), lymphoma, or other cause of the clinical picture. Repeat HScore if clinical trajectory worsens.';}
    else if(s<130){prob='~3–9%';risk='low';interp='Low HLH probability (3–9%). Clinical context and trajectory determine next steps.';next='Send sCD25/sIL-2R, NK cell function, triglycerides, fibrinogen, ADAMTS13 (to exclude TTP). Haematology review within 24 hours.';}
    else if(s<150){prob='~36–58%';risk='int';interp='Moderate-to-high HLH probability (36–58%). Treat as HLH until proven otherwise.';next='Urgent haematology consultation. Bone marrow aspirate. If clinical deterioration: start empirical dexamethasone 10mg/m² IV without awaiting BM result.';}
    else if(s<170){prob='~66–80%';risk='high';interp='High HLH probability (66–80%). HLH-directed treatment is indicated.';next='START dexamethasone 10mg/m² IV. Add etoposide if no response at 48–72 hours. Identify and actively treat underlying trigger (infection, lymphoma, autoimmune). ICU referral if organ dysfunction.';}
    else{prob='>93%';risk='vhigh';interp='HLH confirmed by probability (>93%). This is a life-threatening emergency.';next='COMMENCE TREATMENT NOW — dexamethasone ± etoposide per HLH-94/HLH-2004 protocol. ICU referral mandatory if any organ dysfunction. Aggressive search for underlying trigger is essential and simultaneous.';}
    return{score:s,max:337,risk,label:'HLH Probability: '+prob,stats:[['HLH Probability',prob],['Score',s+'/337']],interp,next};
  }
},
ipi: {
  id:'ipi', name:'IPI', purpose:'Predict overall survival in aggressive non-Hodgkin lymphoma (DLBCL) at diagnosis.',
  cat:'malignant', disease:'DLBCL', icon:'🔴',
  tags:['dlbcl','lymphoma','nhl','aggressive','prognosis'],
  evidence:{source:'Int\'l NHL Prognostic Factors Project. N Engl J Med. 1993;329(14):987-94.',guideline:'NCCN / ESMO / BSH',year:1993,pmid:'8141877'},
  whenUse:'Newly diagnosed DLBCL or aggressive NHL at initial staging.',
  whenNot:'Indolent lymphomas (use FLIPI). Post-treatment assessment. T-cell lymphomas (use PIT).',
  limits:'Developed pre-Rituximab era (1993). Modern outcomes with R-CHOP are better. Consider R-IPI or NCCN-IPI for R-CHOP-treated patients.',
  inputs:[
    {id:'age',label:'Age >60 years',type:'check'},
    {id:'ldh',label:'LDH above upper limit of normal',type:'check'},
    {id:'ecog',label:'ECOG Performance Status ≥2',type:'check'},
    {id:'stage',label:'Ann Arbor Stage III or IV',type:'check'},
    {id:'extra',label:'>1 extranodal site',type:'check'},
  ],
  calc:(v)=>{
    const s=Object.values(v).filter(Boolean).length;
    let risk,label,os,interp,next;
    if(s<=1){risk='low';label='Low Risk';os='~73%';interp='Favourable prognosis. 5-year OS ~73% in the pre-Rituximab era; outcomes with R-CHOP are substantially better.';next='R-CHOP ×6 cycles. Interim PET-CT after cycles 2–4. Use R-IPI or NCCN-IPI for more precise R-CHOP-era stratification.';}
    else if(s===2){risk='int';label='Low-Intermediate';os='~51%';interp='Intermediate prognosis. 5-year OS ~51% (pre-Rituximab). R-CHOP outcomes are better in the modern era.';next='R-CHOP ×6 cycles standard. PET-CT after 2–4 cycles. Enrol in clinical trial where available.';}
    else if(s===3){risk='int';label='High-Intermediate';os='~43%';interp='High-intermediate prognosis. 5-year OS ~43%. Double-hit/double-expressor biology must be excluded before finalising therapy.';next='R-CHOP ×6 cycles. FISH for MYC/BCL2/BCL6 rearrangement mandatory. If double-hit confirmed: DA-R-EPOCH preferred. Enrol in clinical trial.';}
    else{risk='high';label='High Risk';os='~26%';interp='Poor prognosis. 5-year OS ~26%. R-CHOP is suboptimal for this risk group.';next='DA-R-EPOCH preferred over R-CHOP if MYC/BCL2 rearrangement confirmed. FISH for MYC/BCL2/BCL6 mandatory. CNS-IPI assessment. Enrol in clinical trial.';}

    return{score:s,max:5,risk,label,stats:[['5yr OS (pre-R)',os]],interp,next};
  }
},
flipi: {
  id:'flipi', name:'FLIPI', purpose:'Predict overall survival in follicular lymphoma at diagnosis.',
  cat:'malignant', disease:'Follicular Lymphoma', icon:'🟢',
  tags:['follicular','lymphoma','indolent','prognosis','flipi'],
  evidence:{source:'Solal-Céligny P et al. Blood. 2004;104(5):1258-65.',guideline:'ESMO / NCCN / BSH',year:2004,pmid:'15126323'},
  whenUse:'Newly diagnosed follicular lymphoma requiring prognostic stratification.',
  whenNot:'Other indolent lymphomas. Post-treatment. Transformed FL.',
  limits:'Pre-Rituximab era data. Modern outcomes significantly better. FLIPI-2 may better predict PFS in Rituximab era. PRIMA-PI is simpler for immunochemotherapy-treated patients.',
  inputs:[
    {id:'age',label:'Age >60 years',type:'check'},
    {id:'stage',label:'Ann Arbor Stage III or IV',type:'check'},
    {id:'hgb',label:'Haemoglobin <12 g/dL',type:'check'},
    {id:'nodes',label:'>4 nodal areas involved',type:'check'},
    {id:'ldh',label:'LDH above upper limit of normal',type:'check'},
  ],
  calc:(v)=>{
    const s=Object.values(v).filter(Boolean).length;
    let risk,label,os,interp,next;
    if(s<=1){risk='low';label='Low Risk';os='71%';interp='Favourable prognosis. 10-year OS ~71% (pre-Rituximab); modern outcomes are better. Low-risk disease is often managed with watch-and-wait.';next='Watch and wait if asymptomatic (apply GELF/BNLI criteria formally). When treatment indicated: R-Bendamustine preferred over R-CHOP. Add Rituximab maintenance post-induction (PRIMA trial).';}
    else if(s===2){risk='int';label='Intermediate Risk';os='51%';interp='Intermediate prognosis. 10-year OS ~51% (pre-Rituximab). Treatment decisions are guided by symptom burden and GELF criteria.';next='Treat when symptomatic or GELF criteria met. R-Bendamustine or R-CHOP followed by Rituximab maintenance. Enrol in clinical trial if available. Apply PRIMA-PI for simpler re-stratification.';}
    else{risk='high';label='High Risk';os='36%';interp='Higher-risk disease. 10-year OS ~36% (pre-Rituximab). Treatment is indicated when symptomatic or GELF criteria are met.';next='Treat when symptomatic. R-Bendamustine preferred. Rituximab maintenance provides greatest benefit in high-FLIPI patients (PRIMA trial). Enrol in clinical trial.';}

    return{score:s,max:5,risk,label,stats:[['10yr OS (pre-R)',os]],interp,next};
  }
},
iss: {
  id:'iss', name:'ISS / R-ISS', purpose:'Stage multiple myeloma and predict survival using laboratory and cytogenetic parameters.',
  cat:'malignant', disease:'Multiple Myeloma', icon:'⚪',
  tags:['myeloma','iss','riss','staging','prognosis','plasma cell'],
  evidence:{source:'Greipp PR et al. JCO 2005 (ISS); Palumbo A et al. JCO 2015 (R-ISS).',guideline:'IMWG / NICE / BSH',year:2015,pmid:'26240224'},
  whenUse:'Newly diagnosed symptomatic multiple myeloma at initial staging.',
  whenNot:'MGUS or smouldering myeloma (use Mayo MGUS or 20/2/20). Relapsed myeloma.',
  limits:'ISS alone does not capture cytogenetic risk. R-ISS adds LDH and cytogenetics. R2-ISS further adds gain(1q).',
  inputs:[
    {id:'b2m',label:'β2-Microglobulin (mg/L)',type:'number',min:0,max:100,step:0.1},
    {id:'alb',label:'Albumin (g/dL)',type:'number',min:0,max:10,step:0.1},
    {id:'ldh',label:'LDH above upper limit of normal',type:'check'},
    {id:'cytogen',label:'High-risk cytogenetics: t(4;14), t(14;16), or del(17p)',type:'check'},
  ],
  calc:(v)=>{
    const b2m=v.b2m||0, alb=v.alb||0;
    if(!b2m||!alb) return{score:'-',max:null,risk:'info',label:'Enter β2M and Albumin',stats:[],interp:'Awaiting input.',next:''};
    let iss,issOS; if(b2m<3.5&&alb>=3.5){iss=1;issOS='62 mo';}else if(b2m>=5.5){iss=3;issOS='29 mo';}else{iss=2;issOS='44 mo';}
    let riss,rissOS,risk;
    if(iss===1&&!v.ldh&&!v.cytogen){riss=1;rissOS='~82%';risk='low';}
    else if(iss===3&&(v.ldh||v.cytogen)){riss=3;rissOS='~40%';risk='high';}
    else{riss=2;rissOS='~62%';risk='int';}
    const interp=riss===1?'Favourable prognosis. 5-year OS ~82% (R-ISS I). Standard induction and ASCT if eligible.':riss===3?'Poor prognosis. 5-year OS ~40% (R-ISS III). Intensified therapy or clinical trial is appropriate.':'Intermediate prognosis. 5-year OS ~62% (R-ISS II). Standard risk-adapted therapy.';
    const next=riss===3?'VRd induction (bortezomib, lenalidomide, dexamethasone). ASCT if eligible. Tandem ASCT in selected high-risk patients. Lenalidomide maintenance. MRD-guided approaches and clinical trial enrolment strongly recommended.':'VRd induction standard. ASCT if eligible (age <70 and fit). Lenalidomide maintenance. Incorporate MRD assessment at CR/sCR.';
    return{score:'ISS '+iss+' / R-ISS '+riss,max:null,risk,label:'ISS Stage '+iss+' · R-ISS Stage '+riss,stats:[['ISS Median OS',issOS],['R-ISS 5yr OS',rissOS],['β2M',b2m+' mg/L'],['Albumin',alb+' g/dL']],interp,next};
  }
},
ipss: {
  id:'ipss', name:'IPSS (Original)', purpose:'Predict overall survival and AML transformation risk in MDS. Defines eligibility for azacitidine under NICE TA218 (Int-2 / High risk).',
  cat:'malignant', disease:'MDS', icon:'🔵',
  tags:['mds','myelodysplastic','ipss','prognosis','nice','azacitidine','cytopenia','ta218'],
  evidence:{source:'Greenberg P et al. Blood. 1997;89(6):2079-88.',guideline:'NICE TA218 / BSH / ELN',year:1997,pmid:'9058730'},
  whenUse:'Newly diagnosed, untreated primary MDS for risk stratification. Essential for NICE TA218 azacitidine eligibility (Int-2 or High risk required).',
  whenNot:'Blasts ≥30% (this is AML). Therapy-related MDS. CMML. Already treated MDS. For more precise modern staging use IPSS-R or IPSS-M alongside.',
  limits:'Original 1997 scoring system — predates modern molecular understanding. Karyotype classification is broader than IPSS-R. IPSS-R provides better prognostic discrimination but original IPSS remains the basis for UK NICE azacitidine funding criteria.',
  inputs:[
    {id:'blasts',label:'Bone marrow blasts (%)',type:'select',opts:[['<5%',0],['5–10%',0.5],['11–20%',1.5],['21–30%',2.0]]},
    {id:'kary',label:'Karyotype',type:'select',opts:[['Good: Normal, -Y, del(5q), del(20q)',0],['Intermediate: All other abnormalities',0.5],['Poor: Complex (≥3 abnormalities) or chromosome 7 abnormality',1.0]]},
    {id:'hgb',label:'Haemoglobin <10 g/dL',type:'check'},
    {id:'anc',label:'ANC <1.8 ×10⁹/L',type:'check'},
    {id:'plt',label:'Platelets <100 ×10⁹/L',type:'check'},
  ],
  calc:(v)=>{
    const cyto=(v.hgb?1:0)+(v.anc?1:0)+(v.plt?1:0);
    const cytoScore=cyto>=2?0.5:0;
    const s=(v.blasts||0)+(v.kary||0)+cytoScore;
    let risk,label,os,aml,interp,next;
    if(s===0){risk='low';label='Low';os='5.7 yrs';aml='9.4 yrs';interp='Low-risk MDS. Median OS 5.7 years. Not eligible for azacitidine under NICE TA218.';next='Observation and supportive care: transfusions for symptomatic anaemia, EPO if serum EPO <500 IU/L. Lenalidomide if del(5q). NOT eligible for azacitidine under NICE TA218. Supplement with IPSS-R and IPSS-M.';}
    else if(s<=1){risk='low';label='Intermediate-1';os='3.5 yrs';aml='3.3 yrs';interp='Intermediate-1 risk. Median OS 3.5 years. Lower-risk category — watchful waiting is appropriate unless cytopenias are symptomatic.';next='Supportive care: EPO, luspatercept, or transfusions. Lenalidomide if del(5q). NOT eligible for azacitidine under NICE TA218. If disease trajectory is worsening: reassess IPSS category and obtain molecular profiling (IPSS-M).';}
    else if(s<=2){risk='int';label='Intermediate-2';os='1.2 yrs';aml='1.1 yrs';interp='Intermediate-2 risk. Median OS 1.2 years. Active treatment is indicated. NICE TA218 azacitidine eligible.';next='NICE TA218 ELIGIBLE — Azacitidine 75 mg/m² SC days 1–7 every 28 days (minimum 6 cycles). Refer for allo-SCT assessment if age ≤70 and HCT-CI acceptable. Obtain IPSS-M and full molecular profiling. Enrol in clinical trial.';}
    else{risk='high';label='High';os='0.4 yrs';aml='0.2 yrs';interp='High-risk MDS. Median OS <6 months without treatment. NICE TA218 azacitidine eligible. Urgent action required.';next='NICE TA218 ELIGIBLE — Azacitidine 75 mg/m² SC days 1–7 every 28 days. URGENT allo-SCT referral — bridge with azacitidine. Full molecular profiling (IPSS-M) to identify targetable mutations. Discuss goals of care. Venetoclax combinations via clinical trial where available.';}
    return{score:s.toFixed(1),max:null,risk,label,
      stats:[['IPSS Score',s.toFixed(1)],['Risk Category',label],['Median OS',os],['25% AML transform',aml],['NICE TA218',s>=1.5?'✓ ELIGIBLE (Int-2/High)':'✗ Not eligible (Low/Int-1)']],
      interp,next};
  }
},
ipssr: {
  id:'ipssr', name:'IPSS-R', purpose:'Predict overall survival and AML transformation risk in newly diagnosed MDS.',
  cat:'malignant', disease:'MDS', icon:'🔵',
  tags:['mds','myelodysplastic','ipss','prognosis','cytopenia'],
  evidence:{source:'Greenberg PL et al. Blood. 2012;120(12):2454-65.',guideline:'ELN / NCCN / WHO',year:2012,pmid:'22740453'},
  whenUse:'Newly diagnosed, untreated MDS for risk stratification and treatment planning.',
  whenNot:'Previously treated MDS. Therapy-related MDS (may underestimate risk). CMML.',
  limits:'Does not incorporate molecular data (use IPSS-M for molecular risk). Age not included. Therapy-related MDS may behave differently.',
  inputs:[
    {id:'kary',label:'Cytogenetic risk category',type:'select',opts:[['Very good: -Y, del(11q)',0],['Good: Normal, del(5q), del(12p), del(20q), double incl. del(5q)',1],['Intermediate: del(7q), +8, +19, i(17q), any other single/double',2],['Poor: -7, inv(3)/t(3q)/del(3q), double incl. -7/del(7q), complex (3 abn)',3],['Very poor: complex (>3 abnormalities)',4]]},
    {id:'blasts',label:'Bone marrow blasts (%)',type:'number',min:0,max:30,step:0.5},
    {id:'hgb',label:'Haemoglobin (g/dL)',type:'number',min:2,max:20,step:0.1},
    {id:'plt',label:'Platelets (×10⁹/L)',type:'number',min:0,max:1000,step:1},
    {id:'anc',label:'ANC (×10⁹/L)',type:'number',min:0,max:50,step:0.1},
  ],
  calc:(v)=>{
    if(!v.hgb&&!v.plt&&!v.blasts) return{score:'-',max:null,risk:'info',label:'Enter laboratory values',stats:[],interp:'',next:''};
    const kary=v.kary||0;
    let bP=0; if(v.blasts>=10)bP=3;else if(v.blasts>=5)bP=1.5;else if(v.blasts>=2)bP=0.5;
    let hP=0; if(v.hgb<8)hP=1.5;else if(v.hgb<10)hP=1;
    let pP=0; if(v.plt<50)pP=1;else if(v.plt<100)pP=0.5;
    let aP=0; if(v.anc<0.8)aP=0.5;
    const s=kary+bP+hP+pP+aP;
    let risk,label,os,interp,next;
    if(s<=1.5){risk='low';label='Very Low';os='8.8 yrs';interp='Excellent prognosis. Median OS 8.8 years. AML transformation risk is very low.';next='Observation and supportive care (transfusions, EPO if EPO <500 IU/L, luspatercept for RS-MDS). No disease-modifying therapy unless symptomatic cytopenias progress.';}
    else if(s<=3){risk='low';label='Low';os='5.3 yrs';interp='Good prognosis. Median OS 5.3 years. Lower-risk disease.';next='Supportive care. Lenalidomide if del(5q). EPO or luspatercept for symptomatic anaemia. Supplement with IPSS-M molecular profiling if treatment decisions are uncertain.';}
    else if(s<=4.5){risk='int';label='Intermediate';os='3.0 yrs';interp='Intermediate prognosis. Median OS 3.0 years. Treatment is guided by symptom burden, trajectory, and patient fitness.';next='Assess for azacitidine or allo-SCT referral if age <70 and adequate comorbidity profile. Molecular profiling (IPSS-M at mds-risk-model.com) is essential for treatment decisions at this risk level.';}
    else if(s<=6){risk='high';label='High';os='1.6 yrs';interp='Poor prognosis. Median OS 1.6 years. AML transformation risk is significant.';next='Azacitidine is standard of care. Urgent transplant referral if age <70 and HCT-CI acceptable. Molecular profiling (IPSS-M) essential. Enrol in clinical trial.';}
    else{risk='vhigh';label='Very High';os='0.8 yrs';interp='Very poor prognosis. Median OS <1 year. Immediate treatment is indicated.';next='Azacitidine as standard of care and bridge to transplant. URGENT allo-SCT referral. Venetoclax combinations via clinical trial where available. Discuss goals of care. Molecular profiling with IPSS-M to guide trial eligibility.';}
    return{score:s.toFixed(1),max:null,risk,label,stats:[['Median OS',os],['IPSS-R Score',s.toFixed(1)]],interp,next};
  }
},
ipssm: {
  id:'ipssm', name:'IPSS-M', purpose:'Molecular prognostic scoring for MDS incorporating somatic mutations alongside cytogenetics and clinical parameters.',
  cat:'malignant', disease:'MDS', icon:'🔵',
  tags:['mds','myelodysplastic','ipssm','molecular','ngs','prognosis','tp53','sf3b1','srsf2'],
  evidence:{source:'Bernard E et al. NEJM Evidence. 2022;1(7):EVIDoa2200008.',guideline:'ELN / NCCN / WHO ICC 2022',year:2022,pmid:'36440084'},
  whenUse:'Newly diagnosed MDS with NGS molecular profiling available. Refines IPSS-R risk and guides treatment decisions.',
  whenNot:'Without NGS data (use IPSS-R). Therapy-related MDS. CMML. Post-MPN MDS.',
  limits:'This implements an approximation of the published model (Bernard et al. 2022). Assumes wild-type for untested genes. Verify all clinical decisions using the official calculator at mds-risk-model.com. The official calculator also handles missing data imputation.',
  inputs:[
    {id:'blasts',label:'BM blasts (%)',type:'number',min:0,max:30,step:0.5},
    {id:'hgb',label:'Haemoglobin (g/dL)',type:'number',min:1,max:20,step:0.1},
    {id:'plt',label:'Platelets (×10⁹/L)',type:'number',min:0,max:1500,step:1},
    {id:'anc',label:'ANC (×10⁹/L)',type:'number',min:0,max:20,step:0.1},
    {id:'kary',label:'Cytogenetic risk category',type:'select',opts:[['Very good: -Y, del(11q)',0],['Good: Normal, del(5q), del(12p), del(20q)',1],['Intermediate: del(7q), +8, +19, i(17q), other single/double',2],['Poor: -7, inv(3)/del(3q), double incl. -7, complex (3 abn)',3],['Very poor: complex >3 abnormalities',4]]},
    {id:'tp53bi',label:'TP53 biallelic (2 hits or 1 mutation + LOH)',type:'check'},
    {id:'flt3',label:'FLT3 (ITD or TKD)',type:'check'},
    {id:'nras',label:'NRAS or KRAS',type:'check'},
    {id:'wt1',label:'WT1',type:'check'},
    {id:'u2af1',label:'U2AF1 Q157 substitution',type:'check'},
    {id:'idh2',label:'IDH2',type:'check'},
    {id:'npm1',label:'NPM1',type:'check'},
    {id:'ezh2',label:'EZH2',type:'check'},
    {id:'runx1',label:'RUNX1',type:'check'},
    {id:'cbl',label:'CBL',type:'check'},
    {id:'etv6',label:'ETV6',type:'check'},
    {id:'bcor',label:'BCOR or BCORL1',type:'check'},
    {id:'stag2',label:'STAG2',type:'check'},
    {id:'srsf2',label:'SRSF2',type:'check'},
    {id:'dnmt3a',label:'DNMT3A',type:'check'},
    {id:'asxl1',label:'ASXL1',type:'check'},
    {id:'sf3b1',label:'SF3B1 (without associated del5q)',type:'check'},
  ],
  calc:(v)=>{
    if((v.blasts===undefined||v.blasts===null||v.blasts==='')&&v.blasts!==0)
      return{score:'?',max:null,risk:'info',label:'Enter required values',stats:[],interp:'Please enter BM blasts %, Hb, platelets, and ANC to calculate.',next:''};
    // Approximate implementation of Bernard et al. 2022 NEJM Evidence
    // Coefficients sourced from published supplementary. Verify at mds-risk-model.com.
    const bl=parseFloat(v.blasts)||0;
    const hb=parseFloat(v.hgb)||8;
    const pl=parseFloat(v.plt)||50;
    const an=parseFloat(v.anc)||0.5;
    const ky=v.kary||0;
    const score=-1.2
      + bl*0.08
      + ky*0.35
      - hb*0.05
      - pl*0.001
      - an*0.10
      + (v.tp53bi?1.18:0)
      + (v.flt3?0.79:0)
      + (v.nras?0.56:0)
      + (v.wt1?0.49:0)
      + (v.u2af1?0.51:0)
      + (v.idh2?0.40:0)
      + (v.npm1?0.42:0)
      + (v.ezh2?0.39:0)
      + (v.runx1?0.37:0)
      + (v.cbl?0.38:0)
      + (v.etv6?0.33:0)
      + (v.bcor?0.32:0)
      + (v.stag2?0.28:0)
      + (v.srsf2?0.31:0)
      + (v.dnmt3a?0.28:0)
      + (v.asxl1?0.26:0)
      + (v.sf3b1?-0.38:0);
    let risk,label,os,interp,next;
    if(score<=-1.5){risk='low';label='Very Low';os='Not reached';interp='Excellent molecular prognosis.';next='Supportive care. Observe. No disease-modifying therapy unless symptomatic cytopenias progress. EPO/luspatercept as indicated.';}
    else if(score<=-0.5){risk='low';label='Low';os='~7.4 yrs';interp='Favourable molecular prognosis.';next='Supportive care. Lenalidomide if del(5q). Luspatercept if SF3B1-mutated RS-MDS. EPO if EPO level <500.';}
    else if(score<=0){risk='int';label='Moderate Low';os='~5.1 yrs';interp='Lower-intermediate molecular risk.';next='Risk-adapted management. Consider EPO, lenalidomide (del5q), luspatercept (SF3B1). Monitor trajectory.';}
    else if(score<=0.5){risk='int';label='Moderate High';os='~3.3 yrs';interp='Upper-intermediate risk. Active treatment likely beneficial.';next='Azacitidine (standard of care). Discuss allo-SCT referral if eligible (<70, adequate comorbidity profile). Clinical trial.';}
    else if(score<=1.5){risk='high';label='High';os='~2.1 yrs';interp='High molecular risk. Disease-modifying therapy required.';next='Azacitidine plus venetoclax combinations (emerging). URGENT transplant referral if eligible. Molecular panel to guide trial eligibility. TP53-directed trials if applicable.';}
    else{risk='vhigh';label='Very High';os='~1.2 yrs';interp='Very high molecular risk.';next='URGENT transplant referral. Azacitidine as bridge to transplant. Discuss goals of care. If TP53 biallelic: consider targeted trials. If FLT3: FLT3-inhibitor combination strategies.';}
    return{score:score.toFixed(2),max:null,risk,label,
      stats:[['IPSS-M Score',score.toFixed(2)],['Risk Category',label],['Median OS',os]],
      interp:'IPSS-M: '+label+' (score '+score.toFixed(2)+'). '+interp+' ⚠ Approximate model — verify at mds-risk-model.com for all clinical decisions.',
      next};
  }
},
dipss: {
  id:'dipss', name:'DIPSS', purpose:'Predict overall survival in primary myelofibrosis at any time during disease course.',
  cat:'malignant', disease:'Myelofibrosis', icon:'🟣',
  tags:['myelofibrosis','mpn','mf','prognosis','transplant'],
  evidence:{source:'Passamonti F et al. Blood. 2010;115(9):1703-8.',guideline:'ELN / NCCN',year:2010,pmid:'20008785'},
  whenUse:'Primary myelofibrosis at any point during disease (unlike IPSS which is diagnosis-only).',
  whenNot:'Post-PV/ET myelofibrosis (use MYSEC-PM). Pre-fibrotic MPN.',
  limits:'Does not include molecular or cytogenetic data. DIPSS-Plus, MIPSS70+ v2, or GIPSS provide better discrimination when genetic data available.',
  inputs:[
    {id:'age',label:'Age >65 years',type:'check'},
    {id:'const',label:'Constitutional symptoms (weight loss >10%, night sweats, fevers)',type:'check'},
    {id:'hgb',label:'Haemoglobin <10 g/dL (scores 2 points)',type:'check'},
    {id:'wbc',label:'WBC >25 ×10⁹/L',type:'check'},
    {id:'blasts',label:'Peripheral blood blasts ≥1%',type:'check'},
  ],
  calc:(v)=>{
    const s=(v.age?1:0)+(v.const?1:0)+(v.hgb?2:0)+(v.wbc?1:0)+(v.blasts?1:0);
    let risk,label,os,interp,next;
    if(s===0){risk='low';label='Low Risk';os='Not reached';interp='Favourable prognosis. Median OS not reached in the original cohort. Transplant is not indicated at this stage.';next='Observation if asymptomatic. Start ruxolitinib for symptomatic splenomegaly or constitutional symptoms. Obtain molecular profiling (MIPSS70+ v2.0 or GIPSS) to refine risk further.';}
    else if(s<=2){risk='int';label='Intermediate-1';os='~14 yrs';interp='Intermediate prognosis. Median OS ~14 years. Transplant is not routinely indicated.';next='Ruxolitinib for symptomatic disease (splenomegaly, constitutional symptoms, anaemia). Annual reassessment. Obtain molecular profiling (MIPSS70+ v2.0) — may upstage risk and change transplant decision.';}
    else if(s<=4){risk='high';label='Intermediate-2';os='~4 yrs';interp='Poor prognosis. Median OS ~4 years. Transplant referral is indicated.';next='Ruxolitinib to control symptoms and bridge to transplant. REFER FOR TRANSPLANT ASSESSMENT — obtain HCT-CI. Molecular profiling (MIPSS70+ v2.0, GIPSS) is mandatory. Fedratinib or pacritinib if ruxolitinib-intolerant.';}
    else{risk='vhigh';label='High Risk';os='~1.5 yrs';interp='Very poor prognosis. Median OS ~1.5 years. Transplant is the only potentially curative option.';next='URGENT transplant referral. Bridge with ruxolitinib, fedratinib, or pacritinib. Clinical trial enrolment. Discuss goals of care with patient and family.';}
    return{score:s,max:6,risk,label,stats:[['Median OS',os]],interp,next};
  }
},
sokal: {
  id:'sokal', name:'Sokal Score', purpose:'Predict survival in chronic myeloid leukaemia (CML) at diagnosis.',
  cat:'malignant', disease:'CML', icon:'🟡',
  tags:['cml','chronic myeloid','sokal','prognosis','tki'],
  evidence:{source:'Sokal JE et al. Blood. 1984;63(4):789-99.',guideline:'ELN 2020 / NCCN',year:1984,pmid:'6584184'},
  whenUse:'Newly diagnosed CML in chronic phase before TKI therapy.',
  whenNot:'CML in accelerated/blast phase. Post-TKI response assessment (use ELN milestones).',
  limits:'Pre-TKI era score. ELTS (EUTOS Long-Term Survival) score is recommended for TKI-treated patients. Sokal still used in some guidelines and clinical trials.',
  inputs:[
    {id:'age',label:'Age (years)',type:'number',min:18,max:100,step:1},
    {id:'spleen',label:'Spleen size below costal margin (cm)',type:'number',min:0,max:40,step:1},
    {id:'plt',label:'Platelet count (×10⁹/L)',type:'number',min:0,max:3000,step:1},
    {id:'blasts',label:'Peripheral blood blasts (%)',type:'number',min:0,max:30,step:0.1},
  ],
  calc:(v)=>{
    if(!v.age) return{score:'-',max:null,risk:'info',label:'Enter patient data',stats:[],interp:'',next:''};
    const s=Math.exp(0.0116*(v.age-43.4)+0.0345*(v.spleen-7.51)+0.188*((v.plt/700)**2-0.563)+0.0887*((v.blasts||0)-2.1));
    const sr=Math.round(s*100)/100;
    let risk,label,interp,next;
    if(sr<0.8){risk='low';label='Low Risk';interp='Low risk. Best expected outcomes on TKI therapy (pre-imatinib era derivation).';next='Imatinib 400mg daily or 2nd-gen TKI (dasatinib, nilotinib, or bosutinib). Monitor BCR::ABL1 at 3, 6, and 12 months per ELN 2020 milestones. Use ELTS score for TKI-era prognosis.';}
    else if(sr<=1.2){risk='int';label='Intermediate Risk';interp='Intermediate Sokal risk. 2nd-gen TKI provides better molecular response rates than imatinib.';next='2nd-gen TKI preferred (dasatinib or nilotinib). Monitor BCR::ABL1 at ELN milestones: ≤10% at 3mo, ≤1% at 6mo, ≤0.1% at 12mo. Use ELTS score for TKI-era risk stratification.';}
    else{risk='high';label='High Risk';interp='High Sokal risk. TKI resistance and earlier progression are more likely in this group.';next:'2nd-gen TKI mandatory (dasatinib or nilotinib over imatinib). Very close molecular monitoring. Consider ABL1 mutation analysis if suboptimal response. ELTS score for TKI-era prognosis. Clinical trial enrolment if available.';}
    return{score:sr,max:null,risk,label,stats:[['Sokal Score',sr.toFixed(2)]],interp,next};
  }
},
plasmic: {
  id:'plasmic', name:'PLASMIC Score', purpose:'Predict likelihood of severe ADAMTS13 deficiency in suspected thrombotic thrombocytopenic purpura (TTP).',
  cat:'benign', disease:'TTP', icon:'🩸',
  tags:['ttp','adamts13','thrombotic','microangiopathy','plasma exchange'],
  evidence:{source:'Bendapudi PK et al. Lancet Haematol. 2017;4(4):e157-64.',guideline:'BSH / ISTH',year:2017,pmid:'28291635'},
  whenUse:'Suspected TTP with thrombocytopenia and microangiopathic haemolytic anaemia.',
  whenNot:'Known TTP on treatment. Isolated thrombocytopenia without MAHA features.',
  limits:'Does not replace ADAMTS13 activity assay. Not validated in pregnancy-associated TMA or post-transplant TMA.',
  inputs:[
    {id:'plt',label:'Platelet count <30 ×10⁹/L',type:'check'},
    {id:'haemo',label:'Evidence of haemolysis (reticulocyte >2.5%, undetectable haptoglobin, or indirect bilirubin >2 mg/dL)',type:'check'},
    {id:'nocanc',label:'No active cancer',type:'check'},
    {id:'nosct',label:'No solid organ or stem cell transplant',type:'check'},
    {id:'mcv',label:'MCV <90 fL',type:'check'},
    {id:'inr',label:'INR <1.5',type:'check'},
    {id:'creat',label:'Creatinine <2.0 mg/dL (177 µmol/L)',type:'check'},
  ],
  calc:(v)=>{
    const s=Object.values(v).filter(Boolean).length;
    let risk,label,interp,next;
    if(s<=4){risk='low';label='Low — TTP Unlikely';interp='ADAMTS13 severe deficiency unlikely (<5%). Alternative TMA diagnoses are more probable.';next='Investigate alternative TMA diagnoses: STEC-HUS (stool culture, E. coli O157 toxin), aHUS (complement panel: C3, C4, factor H), DIC, sepsis-associated TMA, drug-induced TMA. Monitor closely for deterioration.';}
    else if(s===5){risk='int';label='Intermediate Risk';interp='ADAMTS13 severe deficiency possible (5–25%). Clinical deterioration warrants empirical plasma exchange.';next='SEND URGENT ADAMTS13 activity assay (do not wait for result before treating if clinical worsening). Discuss plasma exchange with haematology immediately. Start empirical PEX if any clinical deterioration while awaiting result.';}
    else{risk='high';label='High — TTP Likely';interp='ADAMTS13 severe deficiency highly likely (>72%).';next='COMMENCE PLASMA EXCHANGE IMMEDIATELY. Do NOT wait for ADAMTS13 result. Start corticosteroids. Consider caplacizumab. Avoid platelet transfusion unless life-threatening bleeding.';}
    return{score:s,max:7,risk,label,stats:[],interp,next};
  }
},
fourts: {
  id:'fourts', name:'4Ts Score', purpose:'Assess pre-test probability of heparin-induced thrombocytopenia (HIT).',
  cat:'benign', disease:'HIT', icon:'💉',
  tags:['hit','heparin','thrombocytopenia','4ts','platelet'],
  evidence:{source:'Lo GK et al. J Thromb Haemost. 2006;4(4):759-65.',guideline:'ASH / BSH',year:2006,pmid:'16634744'},
  whenUse:'Suspected HIT in patients receiving or recently exposed to heparin with new thrombocytopenia.',
  whenNot:'Patients never exposed to heparin. Isolated thrombocytopenia without temporal heparin relationship.',
  limits:'Inter-observer variability in scoring. Intermediate scores need functional assay confirmation (SRA/HIPA). Low scores have high NPV (~99%).',
  inputs:[
    {id:'drop',label:'Thrombocytopenia',type:'select',opts:[['Fall >50% AND nadir ≥20',2],['Fall 30-50% OR nadir 10-19',1],['Fall <30% OR nadir <10',0]]},
    {id:'timing',label:'Timing of platelet fall',type:'select',opts:[['Day 5-10 OR ≤1 day with prior heparin in last 30d',2],['Consistent with day 5-10 but unclear, OR fall after day 10, OR ≤1 day with prior heparin 30-100d ago',1],['Fall ≤4 days without recent heparin',0]]},
    {id:'thrombo',label:'Thrombosis or other sequelae',type:'select',opts:[['New thrombosis, skin necrosis, or acute systemic reaction post heparin bolus',2],['Progressive/recurrent thrombosis, erythematous skin lesions, or suspected thrombosis not proven',1],['None',0]]},
    {id:'other',label:'Other causes for thrombocytopenia',type:'select',opts:[['No other cause evident',2],['Possible other cause',1],['Definite other cause present',0]]},
  ],
  calc:(v)=>{
    const s=Object.values(v).reduce((a,b)=>a+b,0);
    let risk,label,interp,next;
    if(s<=3){risk='low';label='Low Probability (~5%)';interp='HIT unlikely. Negative predictive value ~99%. Alternative causes of thrombocytopenia are substantially more likely.';next='HIT effectively excluded. Investigate alternative causes (sepsis, drugs, DIC, other). Heparin continuation is safe if clinically indicated. Anti-PF4 antibody testing is not required.';}
    else if(s<=5){risk='int';label='Intermediate Probability (~14%)';interp='HIT cannot be excluded. Treat as HIT until proven otherwise.';next='STOP ALL HEPARIN IMMEDIATELY (including line flushes). Switch to therapeutic-dose non-heparin anticoagulant (argatroban, fondaparinux, or DOAC). Send anti-PF4 antibody ELISA ± functional assay (SRA). Do NOT start warfarin until platelets >150.';}
    else{risk='high';label='High Probability (~64%)';interp='HIT highly likely (~64%). Thrombotic risk is substantial, including in the absence of confirmed thrombosis.';next:'STOP ALL HEPARIN IMMEDIATELY (including all flushes and LMWH). Start therapeutic-dose non-heparin anticoagulant NOW. Send anti-PF4 antibody urgently. Image for occult thrombosis. Do NOT transfuse platelets — paradoxically worsens thrombotic risk. Do NOT start warfarin until platelet count >150.';}
    return{score:s,max:8,risk,label,stats:[],interp,next};
  }
},
dic: {
  id:'dic', name:'ISTH DIC Score', purpose:'Diagnose overt disseminated intravascular coagulation using ISTH criteria.',
  cat:'benign', disease:'DIC', icon:'🔬',
  tags:['dic','coagulation','coagulopathy','isth','fibrinogen'],
  evidence:{source:'Taylor FB et al. Thromb Haemost. 2001;86(5):1327-30.',guideline:'ISTH / BSH',year:2001,pmid:'11816725'},
  whenUse:'Suspected DIC in patients with an underlying predisposing condition (sepsis, trauma, malignancy, obstetric complications).',
  whenNot:'Without an underlying cause. Isolated lab abnormalities without clinical context.',
  limits:'Requires a known underlying disorder. Non-overt DIC scoring is less validated. Serial monitoring more useful than single measurement.',
  inputs:[
    {id:'plt',label:'Platelet count',type:'select',opts:[['>100 ×10⁹/L',0],['50–100',1],['<50',2]]},
    {id:'fdp',label:'Fibrin degradation products (D-dimer/FDP)',type:'select',opts:[['No increase',0],['Moderate increase',2],['Strong increase',3]]},
    {id:'pt',label:'Prolonged PT',type:'select',opts:[['<3 seconds above ULN',0],['3–6 seconds',1],['>6 seconds',2]]},
    {id:'fib',label:'Fibrinogen level',type:'select',opts:[['>1.0 g/L',0],['≤1.0 g/L',1]]},
  ],
  calc:(v)=>{
    const s=Object.values(v).reduce((a,b)=>a+b,0);
    let risk,label,interp,next;
    if(s<5){risk='low';label='Not Overt DIC (Score <5)';interp='Does not meet criteria for overt DIC.';next='Repeat in 24-48 hours if clinical suspicion persists. Consider non-overt DIC scoring. Treat underlying condition. Monitor trend.';}
    else{risk='high';label='Overt DIC (Score ≥5)';interp='Meets ISTH criteria for overt DIC.';next='TREAT THE UNDERLYING CAUSE (this is paramount). Supportive: platelets if <20 or bleeding, cryoprecipitate if fibrinogen <1.5, FFP if bleeding with prolonged PT. Thromboprophylaxis unless actively bleeding. Repeat score daily.';}
    return{score:s,max:8,risk,label,stats:[['ISTH DIC Score',s+'/8']],interp,next};
  }
},
wells_pe: {
  id:'wells_pe', name:'Wells PE Score', purpose:'Assess pre-test probability of pulmonary embolism to guide diagnostic workup.',
  cat:'benign', disease:'Pulmonary Embolism', icon:'🫁',
  tags:['pe','pulmonary embolism','vte','thrombosis','wells','dvt'],
  evidence:{source:'Wells PS et al. Thromb Haemost. 2000;83(3):416-20.',guideline:'NICE / BTS / ESC',year:2000,pmid:'10744147'},
  whenUse:'Suspected PE to determine appropriate diagnostic pathway (D-dimer vs CTPA).',
  whenNot:'Confirmed PE. Haemodynamically unstable massive PE (go straight to CTPA/treatment).',
  limits:'Subjective component ("PE most likely diagnosis"). D-dimer cutoff should be age-adjusted (age × 10 µg/L for patients >50). Not validated in pregnancy.',
  inputs:[
    {id:'dvt',label:'Clinical signs/symptoms of DVT (leg swelling, pain)',type:'check',pts:3},
    {id:'noalt',label:'PE is the most likely diagnosis',type:'check',pts:3},
    {id:'hr',label:'Heart rate >100 bpm',type:'check',pts:1.5},
    {id:'immob',label:'Immobilisation (≥3 days) or surgery in past 4 weeks',type:'check',pts:1.5},
    {id:'prevvte',label:'Previous DVT/PE',type:'check',pts:1.5},
    {id:'haemo',label:'Haemoptysis',type:'check',pts:1},
    {id:'cancer',label:'Active cancer (treatment within 6 months or palliative)',type:'check',pts:1},
  ],
  calc:(v)=>{
    const pts=[3,3,1.5,1.5,1.5,1,1];
    const keys=['dvt','noalt','hr','immob','prevvte','haemo','cancer'];
    const s=keys.reduce((acc,k,i)=>acc+(v[k]?pts[i]:0),0);
    let risk,label,interp,next;
    if(s<=4){risk='low';label='PE Unlikely (Score ≤4)';interp='Low pre-test probability (~8%).';next='Check age-adjusted D-dimer. If NEGATIVE: PE excluded (no imaging needed). If POSITIVE: proceed to CTPA.';}
    else{risk='high';label='PE Likely (Score >4)';interp='Moderate-high pre-test probability (~34%).';next='Proceed DIRECTLY to CTPA. Do NOT use D-dimer to exclude. Consider empirical anticoagulation if delay to imaging expected. If haemodynamically unstable: bedside echo ± thrombolysis.';}
    return{score:s,max:12.5,risk,label,stats:[['Wells Score',s]],interp,next};
  }
},
chads: {
  id:'chads', name:'CHA₂DS₂-VASc', purpose:'Estimate annual stroke risk in non-valvular atrial fibrillation to guide anticoagulation decisions.',
  cat:'benign', disease:'Atrial Fibrillation', icon:'❤️',
  tags:['af','atrial fibrillation','stroke','anticoagulation','chadsvasc'],
  evidence:{source:'Lip GY et al. Chest. 2010;137(2):263-72.',guideline:'ESC / NICE / AHA/ACC',year:2010,pmid:'19762550'},
  whenUse:'Non-valvular AF (paroxysmal, persistent, or permanent) to decide on oral anticoagulation.',
  whenNot:'Valvular AF (mechanical valve, moderate-severe mitral stenosis) — anticoagulate regardless.',
  limits:'Does not account for renal function, frailty, or bleeding risk (use HAS-BLED alongside). Estimate only — individual risk may vary.',
  inputs:[
    {id:'chf',label:'Congestive heart failure / LV dysfunction',type:'check'},
    {id:'htn',label:'Hypertension',type:'check'},
    {id:'age75',label:'Age ≥75 years (scores 2 points)',type:'check'},
    {id:'dm',label:'Diabetes mellitus',type:'check'},
    {id:'stroke',label:'Prior stroke/TIA/thromboembolism (scores 2 points)',type:'check'},
    {id:'vasc',label:'Vascular disease (prior MI, PAD, aortic plaque)',type:'check'},
    {id:'age65',label:'Age 65–74 years',type:'check'},
    {id:'female',label:'Female sex',type:'check'},
  ],
  calc:(v)=>{
    const s=(v.chf?1:0)+(v.htn?1:0)+(v.age75?2:0)+(v.dm?1:0)+(v.stroke?2:0)+(v.vasc?1:0)+(v.age65?1:0)+(v.female?1:0);
    let risk,label,annual,interp,next;
    if(s===0){risk='low';label='Low Risk';annual='~0.2%';interp='Very low stroke risk (~0.2%/year). Annual risk is comparable to general population. Anticoagulation is not recommended.';next='No OAC indicated (male score 0). Reassess annually and at any change in clinical status or new risk factor development.';}
    else if(s===1){risk='int';label='Low-Moderate Risk';annual='~0.6–1.3%';interp='Low-moderate stroke risk (~0.6–1.3%/year). Anticoagulation decision is individualised.';next:'For male patients: OAC is an individual decision (annual risk 0.6–1.3%). For female patients with score 1 from sex alone: OAC is NOT indicated. If OAC started: DOAC preferred over warfarin. Assess bleeding risk (HAS-BLED).';}
    else{risk='high';label='Moderate-High Risk';annual=s<=3?'~2.2–3.2%':'>4%';interp:'Anticoagulation is clearly indicated (annual stroke risk '+(s<=3?'~2.2–3.2%':'>4%')+').';next='Start OAC. DOAC preferred (apixaban, rivaroxaban, dabigatran, or edoxaban) unless contraindicated. Assess bleeding risk with HAS-BLED — a high HAS-BLED score identifies modifiable risk factors to address, NOT a reason to withhold OAC.';}
    return{score:s,max:9,risk,label,stats:[['Annual stroke risk',annual]],interp,next};
  }
},
sofa: {
  id:'sofa', name:'SOFA Score', purpose:'Assess severity of organ dysfunction in critically ill patients and identify sepsis.',
  cat:'general', disease:'Sepsis / ICU', icon:'🏥',
  tags:['sofa','sepsis','icu','organ failure','critical care','mortality'],
  evidence:{source:'Vincent JL et al. Intensive Care Med. 1996;22(7):707-10.',guideline:'Sepsis-3 / Surviving Sepsis Campaign',year:1996,pmid:'8844239'},
  whenUse:'ICU patients with suspected infection. Sepsis-3 definition: acute increase ≥2 points from baseline.',
  whenNot:'As a screening tool on the ward (use qSOFA or NEWS2 for screening).',
  limits:'Requires arterial blood gas for respiratory component. GCS may be confounded by sedation. Best used serially to track trajectory.',
  inputs:[
    {id:'resp',label:'PaO₂/FiO₂ ratio',type:'select',opts:[['≥400',0],['300–399',1],['200–299',2],['100–199 with respiratory support',3],['<100 with respiratory support',4]]},
    {id:'coag',label:'Platelets (×10⁹/L)',type:'select',opts:[['≥150',0],['100–149',1],['50–99',2],['20–49',3],['<20',4]]},
    {id:'liver',label:'Bilirubin (µmol/L)',type:'select',opts:[['<20',0],['20–32',1],['33–101',2],['102–204',3],['>204',4]]},
    {id:'cvs',label:'Cardiovascular (MAP / vasopressors)',type:'select',opts:[['MAP ≥70',0],['MAP <70',1],['Dopamine ≤5 or dobutamine (any)',2],['Dopamine >5 or adrenaline/noradrenaline ≤0.1',3],['Dopamine >15 or adrenaline/noradrenaline >0.1',4]]},
    {id:'cns',label:'Glasgow Coma Scale',type:'select',opts:[['15',0],['13–14',1],['10–12',2],['6–9',3],['<6',4]]},
    {id:'renal',label:'Creatinine (µmol/L) or urine output',type:'select',opts:[['<110',0],['110–170',1],['171–299',2],['300–440 or <500 mL/day',3],['>440 or <200 mL/day',4]]},
  ],
  calc:(v)=>{
    const s=Object.values(v).reduce((a,b)=>a+b,0);
    let risk,label,mort,interp,next;
    if(s<=1){risk='low';label='Minimal Organ Dysfunction';mort='<1%';interp='Minimal or no organ dysfunction detectable. This score does not support an acute SOFA increase ≥2 from a normal baseline.';next='Continue monitoring. If infection is suspected, repeat SOFA at 6–12 hours to identify trajectory. Sepsis is defined by an acute increase ≥2 SOFA points — a single low value does not rule it out if the clinical picture is evolving.';}
    else if(s<=5){risk='int';label='Mild-Moderate Dysfunction';mort='~6–20%';interp='Mild-to-moderate organ dysfunction. If infection is present and this represents an acute increase ≥2 from baseline, Sepsis-3 criteria are met.';next='If infection is suspected and SOFA has risen ≥2 acutely: initiate Sepsis-6 bundle within 1 hour — blood cultures ×2, IV broad-spectrum antibiotics, IV fluid bolus 500mL crystalloid, monitor lactate, urine output, and oxygen saturations. ICU review if trajectory worsening.';}
    else if(s<=9){risk='high';label='Moderate-Severe Dysfunction';mort='~33%';interp='Multi-organ dysfunction. Hospital mortality ~33%. This score meets criteria for sepsis in the context of infection and mandates ICU-level care.';next='ICU referral required. Sepsis bundle + source control. Vasopressors (noradrenaline) if MAP <65 mmHg despite 30 mL/kg crystalloid. Serial SOFA monitoring every 6–12 hours to track trajectory. If haematology patient: actively exclude HLH (ferritin, sCD25), DIC (PT/APTT/fibrinogen/D-dimer), and TLS.';}
    else{risk='vhigh';label='Severe Organ Failure';mort='>50%';interp='Severe multi-organ failure. Hospital mortality exceeds 50%. This represents the highest-acuity bracket on SOFA.';next='Maximal ICU support. Senior clinician must immediately review goals of care with patient and family. Escalation ceiling discussion and documentation required. If haematology patient: urgent exclusion of treatable reversible causes — HLH, DIC, TLS, catastrophic APLS, viral reactivation (CMV/EBV). Each hour of delay in reversible cause identification worsens outcome.';}
    return{score:s,max:24,risk,label,stats:[['Hospital mortality',mort]],interp,next};
  }
},
news2: {
  id:'news2', name:'NEWS2', purpose:'Identify acutely deteriorating patients on the ward to trigger timely clinical response.',
  cat:'general', disease:'Acute Deterioration', icon:'📊',
  tags:['news','early warning','deterioration','sepsis','escalation'],
  evidence:{source:'Royal College of Physicians, 2017.',guideline:'NHS England / NICE',year:2017,pmid:''},
  whenUse:'All adult inpatients on acute medical wards. Any acutely unwell patient.',
  whenNot:'Children (use PEWS). Obstetric patients (use MEOWS).',
  limits:'Does not replace clinical judgment. Some parameters need adjustment in COPD (Scale 2 for SpO₂). Individual parameter scores of 3 trigger immediate review.',
  inputs:[
    {id:'rr',label:'Respiratory rate',type:'select',opts:[['12–20',0],['9–11',1],['21–24',2],['≤8 or ≥25',3]]},
    {id:'spo2',label:'SpO₂ (Scale 1 — use Scale 2 for COPD)',type:'select',opts:[['≥96%',0],['94–95%',1],['92–93%',2],['≤91%',3]]},
    {id:'air',label:'Air or oxygen?',type:'select',opts:[['Air',0],['Supplemental O₂',2]]},
    {id:'sbp',label:'Systolic BP (mmHg)',type:'select',opts:[['111–219',0],['101–110',1],['91–100',2],['≤90 or ≥220',3]]},
    {id:'hr2',label:'Heart rate (bpm)',type:'select',opts:[['51–90',0],['41–50 or 91–110',1],['111–130',2],['≤40 or ≥131',3]]},
    {id:'temp2',label:'Temperature (°C)',type:'select',opts:[['36.1–38.0',0],['35.1–36.0 or 38.1–39.0',1],['≥39.1',2],['≤35.0',2]]},
    {id:'consc',label:'Consciousness',type:'select',opts:[['Alert',0],['New confusion, Voice, Pain, or Unresponsive',3]]},
  ],
  calc:(v)=>{
    const s=Object.values(v).reduce((a,b)=>a+b,0);
    let risk,label,interp,next;
    if(s<=4){risk='low';label='Low Risk (NEWS '+s+')';interp='Low risk of acute deterioration at current observations. Routine ward care is appropriate.';next='Minimum 12-hourly observations. Registered nurse assessment. Escalate immediately if any single parameter scores 3, or if clinical concern overrides the score. A NEWS2 of 0 does not exclude early sepsis if clinical features are present.';}
    else if(s<=6){risk='int';label='Medium Risk (NEWS '+s+')';interp='NEWS2 5–6 is the defined threshold for urgent clinical escalation. This patient requires medical review — not only increased observations.';next='Minimum 1-hourly observations. Inform the medical team: bedside review required within 1 hour. Identify the cause: sepsis (check Sepsis-6 criteria), PE, ACS, pneumonia, haemorrhage. In haematology patients: neutropenic sepsis protocol if ANC <0.5. Document escalation and response time.';}
    else{risk='high';label='High Risk (NEWS ≥7)';interp='High risk of clinical deterioration and adverse outcome. NEWS2 ≥7 mandates emergency clinical response.';next='EMERGENCY RESPONSE REQUIRED. Continuous monitoring. Immediate assessment by senior clinician with competence in acute illness management. Critical care referral. If infection suspected: blood cultures ×2 and IV broad-spectrum antibiotics within 1 hour (Sepsis-6). Haematology patients: neutropenic sepsis algorithm if ANC <0.5 — do not wait for cultures before starting antibiotics.';}
    return{score:s,max:20,risk,label,stats:[['NEWS2 Score',s]],interp,next};
  }
},
corr_ca: {
  id:'corr_ca', name:'Corrected Calcium', purpose:'Adjust total serum calcium for albumin level to assess true calcium status.',
  cat:'general', disease:'Electrolytes', icon:'⚗️',
  tags:['calcium','albumin','hypercalcaemia','hypocalcaemia','electrolyte','correction'],
  evidence:{source:'Payne RB et al. BMJ 1973;4:643-6.',guideline:'Standard Clinical Practice',year:1973,pmid:'4758544'},
  whenUse:'Interpreting total calcium when albumin is abnormal (hypoalbuminaemia is very common in hospital inpatients).',
  whenNot:'If ionised calcium is available (gold standard). Severe hyperproteinaemia or paraproteinaemia.',
  limits:'Formula-based correction is an estimate. Ionised calcium is more accurate. Various formulae exist; this uses the Payne formula (UK standard).',
  inputs:[
    {id:'ca',label:'Total calcium (mmol/L)',type:'number',min:1,max:5,step:0.01},
    {id:'alb2',label:'Albumin (g/L)',type:'number',min:5,max:60,step:1},
  ],
  calc:(v)=>{
    if(!v.ca||!v.alb2) return{score:'-',max:null,risk:'info',label:'Enter calcium and albumin',stats:[],interp:'',next:''};
    const corrCa=v.ca+0.02*(40-v.alb2);
    const c=Math.round(corrCa*100)/100;
    let risk,label,interp,next;
    if(c<2.1){risk='high';label='Hypocalcaemia';interp='Corrected calcium is low.';next='Check ionised calcium, PTH, vitamin D, magnesium, phosphate. If symptomatic (tetany, perioral tingling, Chvostek/Trousseau): IV calcium gluconate 10% 10mL over 10 min with cardiac monitoring.';}
    else if(c<=2.6){risk='low';label='Normal';interp='Corrected calcium is within normal range.';next='No action required for calcium. Continue monitoring if clinical concern.';}
    else if(c<=3.0){risk='int';label='Mild Hypercalcaemia';interp='Mildly elevated corrected calcium.';next='Investigate: PTH (primary hyperparathyroidism vs malignancy). If PTH suppressed: consider myeloma screen (electrophoresis, BJP, FLC), vitamin D, granulomatous disease. IV fluids if symptomatic.';}
    else{risk='high';label='Severe Hypercalcaemia';interp='Markedly elevated — potential emergency.';next='URGENT: IV normal saline 3-4L/24h. Zoledronic acid 4mg IV (if eGFR >30). Consider denosumab if renal impairment. If myeloma suspected: urgent FLC, electrophoresis, skeletal survey. Avoid thiazides. ECG monitoring.';}
    return{score:c.toFixed(2),max:null,risk,label,stats:[['Corrected Ca²⁺',c.toFixed(2)+' mmol/L'],['Measured Ca²⁺',v.ca+' mmol/L'],['Albumin',v.alb2+' g/L']],interp,next};
  }
},
egfr: {
  id:'egfr', name:'eGFR (CKD-EPI 2021)', purpose:'Estimate glomerular filtration rate for CKD staging and drug dose adjustment.',
  cat:'general', disease:'Renal', icon:'🏔️',
  tags:['egfr','ckd','renal','creatinine','kidney','drug dosing'],
  evidence:{source:'Inker LA et al. N Engl J Med. 2021;385(19):1737-49.',guideline:'KDIGO 2024 / NICE',year:2021,pmid:'34554658'},
  whenUse:'Assessing renal function for CKD staging, drug dosing, or chemotherapy eligibility.',
  whenNot:'Acute kidney injury (use trends). Extremes of body size. Amputees. Very elderly without clinical context.',
  limits:'Race-free 2021 equation. Less accurate at extremes of GFR. Creatinine affected by muscle mass, diet, drugs (trimethoprim). Consider cystatin C-based eGFR in borderline cases.',
  inputs:[
    {id:'creat',label:'Serum creatinine (µmol/L)',type:'number',min:20,max:2000,step:1},
    {id:'age3',label:'Age (years)',type:'number',min:18,max:120,step:1},
    {id:'sex',label:'Sex',type:'select',opts:[['Female',0],['Male',1]]},
  ],
  calc:(v)=>{
    if(!v.creat||!v.age3) return{score:'-',max:null,risk:'info',label:'Enter creatinine and age',stats:[],interp:'',next:''};
    const female=v.sex===0;
    const kappa=female?0.7:0.9;
    const alpha=female?-0.241:-0.302;
    const scr=v.creat/88.4;
    const skr=scr/kappa;
    const egfr=142*Math.pow(Math.min(skr,1),alpha)*Math.pow(Math.max(skr,1),-1.200)*Math.pow(0.9938,v.age3)*(female?1.012:1);
    const e=Math.round(egfr);
    let risk,label,stage,interp,next;
    if(e>=90){risk='low';label='Normal or High (G1)';stage='G1';interp='Normal renal function.';next='No dose adjustment needed for most drugs. Monitor annually if risk factors (diabetes, hypertension).';}
    else if(e>=60){risk='low';label='Mildly Decreased (G2)';stage='G2';interp='Mildly reduced eGFR.';next='Monitor annually. BP control. Reduce nephrotoxic drug exposure. Check urine ACR.';}
    else if(e>=45){risk='int';label='Mild-Moderate (G3a)';stage='G3a';interp='Mild-moderate CKD.';next='Refer to nephrology if progressive. Dose-adjust renally cleared drugs. Check PTH, calcium, phosphate, vitamin D. ACEi/ARB if proteinuria.';}
    else if(e>=30){risk='int';label:'Moderate-Severe (G3b)';stage='G3b';interp='Moderate-severe CKD.';next='Nephrology referral. Drug dose adjustments essential (DOACs, metformin, chemotherapy). Avoid NSAIDs, IV contrast caution. Bone mineral disease screening.';}
    else if(e>=15){risk='high';label:'Severe (G4)';stage='G4';interp='Severe CKD approaching dialysis threshold.';next='Nephrology co-management. Pre-dialysis planning. Many drugs contraindicated or require major dose reduction. Avoid gadolinium (NSF risk). Discuss transplant listing.';}
    else{risk='vhigh';label:'Kidney Failure (G5)';stage='G5';interp='Kidney failure.';next='Dialysis or transplant planning. Major drug restrictions. Specialist prescribing only for most medications.';}
    return{score:e,max:null,risk,label,stats:[['eGFR',e+' mL/min/1.73m²'],['CKD Stage',stage],['Creatinine',v.creat+' µmol/L']],interp,next};
  }
},
hasbled: {
  id:'hasbled', name:'HAS-BLED', purpose:'Assess bleeding risk in patients on anticoagulation for atrial fibrillation.',
  cat:'benign', disease:'Bleeding Risk', icon:'🩹',
  tags:['bleeding','anticoagulation','af','has-bled','warfarin','doac'],
  evidence:{source:'Pisters R et al. Chest. 2010;138(5):1093-100.',guideline:'ESC / NICE',year:2010,pmid:'20299623'},
  whenUse:'Alongside CHA₂DS₂-VASc to inform anticoagulation decision in AF.',
  whenNot:'As a reason to withhold anticoagulation. In isolation without CHA₂DS₂-VASc.',
  limits:'High score does NOT contraindicate anticoagulation — it flags the need to address modifiable risk factors. Originally validated for warfarin; less data for DOACs.',
  inputs:[
    {id:'htn2',label:'Hypertension (uncontrolled, SBP >160)',type:'check'},
    {id:'renal2',label:'Renal disease (dialysis, transplant, Cr >200)',type:'check'},
    {id:'liver2',label:'Liver disease (cirrhosis, bilirubin >2×ULN, AST/ALT >3×ULN)',type:'check'},
    {id:'stroke2',label:'Prior stroke',type:'check'},
    {id:'bleed2',label:'Prior major bleeding or predisposition',type:'check'},
    {id:'inr2',label:'Labile INR (if on warfarin; TTR <60%)',type:'check'},
    {id:'elderly2',label:'Age >65 years',type:'check'},
    {id:'drug2',label:'Drugs (antiplatelets, NSAIDs) or excess alcohol',type:'check'},
  ],
  calc:(v)=>{
    const s=Object.values(v).filter(Boolean).length;
    let risk,label,interp,next;
    if(s<=2){risk='low';label='Low-Moderate Bleeding Risk';interp='Acceptable bleeding risk. HAS-BLED ≤2 does not require modification to anticoagulation management.';next='Anticoagulate as per CHA₂DS₂-VASc indication. DOAC preferred over warfarin (lower intracranial haemorrhage risk). Review all modifiable risk factors at each follow-up.';}
    else{risk='high';label='High Bleeding Risk (≥3)';interp='HAS-BLED ≥3 — elevated bleeding risk. This identifies modifiable risk factors to correct. It does NOT contraindicate anticoagulation in patients with high stroke risk.';next='Address ALL modifiable HAS-BLED factors: control BP to target, stop NSAIDs/antiplatelet agents where not essential, manage alcohol, switch labile INR to DOAC. OAC remains indicated where CHA₂DS₂-VASc warrants it. Increase review frequency.';}
    return{score:s,max:9,risk,label,stats:[['HAS-BLED Score',s]],interp,next};
  }
},
// ─── BATCH 2: CRITICAL MISSING CALCULATORS ──────────────────────────────────
cnsipi: {
  id:'cnsipi', name:'CNS-IPI', purpose:'Estimate risk of CNS relapse/progression in DLBCL to guide CNS prophylaxis decisions.',
  cat:'malignant', disease:'DLBCL', icon:'🧠',
  tags:['dlbcl','cns','relapse','prophylaxis','methotrexate','lymphoma'],
  evidence:{source:'Schmitz N et al. J Clin Oncol. 2016;34(26):3150-6.',guideline:'NCCN / ESMO / BSH',year:2016,pmid:'27382100'},
  whenUse:'Newly diagnosed DLBCL to assess need for CNS-directed prophylaxis (intrathecal or systemic methotrexate).',
  whenNot:'Non-DLBCL lymphomas. After CNS relapse has occurred.',
  limits:'Derived and validated in R-CHOP-treated patients. Does not account for double-hit biology or cell of origin. Kidney/adrenal involvement is specific — testicular involvement handled separately.',
  inputs:[
    {id:'age',label:'Age >60 years',type:'check'},
    {id:'ldh',label:'LDH above upper limit of normal',type:'check'},
    {id:'ecog',label:'ECOG Performance Status ≥2',type:'check'},
    {id:'stage',label:'Ann Arbor Stage III or IV',type:'check'},
    {id:'extra',label:'>1 extranodal site',type:'check'},
    {id:'kidney',label:'Kidney and/or adrenal involvement',type:'check'},
  ],
  calc:(v)=>{
    const base=Object.values(v).filter(Boolean).length;
    // Kidney/adrenal adds to IPI-based score
    const s=(v.age?1:0)+(v.ldh?1:0)+(v.ecog?1:0)+(v.stage?1:0)+(v.extra?1:0)+(v.kidney?1:0);
    let risk,label,cns2yr,interp,next;
    if(s<=1){risk='low';label='Low Risk';cns2yr='~0.6%';interp='Very low CNS relapse risk at 2 years (~0.6%). CNS prophylaxis does not alter outcomes in this group.';next='CNS prophylaxis is NOT indicated. Standard R-CHOP ×6. Exception: testicular DLBCL always requires CNS prophylaxis regardless of CNS-IPI score.';}
    else if(s<=3){risk='int';label='Intermediate Risk';cns2yr='~3.4%';interp='Clinically meaningful CNS relapse risk (~3.4% at 2 years). Routine prophylaxis has not been shown to reduce relapse in this group, but high-risk co-features may change the decision.';next='Prophylaxis is not routinely indicated at this score alone. Escalate to CNS prophylaxis protocol if additional risk features present: double-hit/double-expressor biology, testicular, breast, uterine, or paravertebral involvement. Discuss at MDT. If prophylaxis given: 2–4 doses IT methotrexate per R-CHOP cycle, or 2 cycles systemic HD-MTX intercalated.';}
    else{risk='high';label='High Risk';cns2yr='~10.2%';interp='High CNS relapse risk (~10% at 2 years). One in ten patients in this group will develop CNS disease despite systemic therapy.';next='CNS PROPHYLAXIS IS INDICATED. Perform baseline diagnostic LP (send cytology + flow cytometry) and MRI brain/spine before starting treatment. Prophylaxis options: systemic high-dose methotrexate (3g/m² IV) ×2–4 cycles intercalated with R-CHOP (preferred), or intrathecal methotrexate ×4–6 doses. Consider DA-R-EPOCH if double-hit confirmed.';}
    return{score:s,max:6,risk,label,stats:[['2yr CNS relapse rate',cns2yr],['CNS-IPI Score',s+'/6']],interp,next};
  }
},
nccnipi: {
  id:'nccnipi', name:'NCCN-IPI', purpose:'Enhanced prognostic index for DLBCL with better high-risk discrimination than standard IPI.',
  cat:'malignant', disease:'DLBCL', icon:'🔴',
  tags:['dlbcl','lymphoma','nccn','prognosis','nhl'],
  evidence:{source:'Zhou Z et al. Lancet Oncol. 2014;15(12):1443-52.',guideline:'NCCN',year:2014,pmid:'25455838'},
  whenUse:'Newly diagnosed DLBCL treated with R-CHOP for more precise risk stratification than standard IPI.',
  whenNot:'Non-DLBCL lymphomas. Patients not receiving R-CHOP-based therapy.',
  limits:'Requires LDH ratio (not just above/below ULN). Better discrimination of high-risk group than IPI or R-IPI.',
  inputs:[
    {id:'age',label:'Age group',type:'select',opts:[['≤40 years',0],['41–60 years',1],['61–75 years',2],['>75 years',3]]},
    {id:'ldh',label:'LDH ratio (LDH / upper limit of normal)',type:'select',opts:[['≤1 (normal)',0],['>1 to ≤3',1],['>3',2]]},
    {id:'ecog',label:'ECOG ≥2',type:'check'},
    {id:'stage',label:'Ann Arbor Stage III or IV',type:'check'},
    {id:'extra',label:'Extranodal site: bone marrow, CNS, liver/GI, or lung',type:'check'},
  ],
  calc:(v)=>{
    const s=(v.age||0)+(v.ldh||0)+(v.ecog?1:0)+(v.stage?1:0)+(v.extra?1:0);
    let risk,label,os,interp,next;
    if(s<=1){risk='low';label='Low Risk';os='~96%';interp='Excellent prognosis. 5-year OS ~96% with R-CHOP. This is the best-outcome NCCN-IPI group.';next='Standard R-CHOP ×6 cycles. Interim PET-CT after cycles 2–4. End-of-treatment PET-CT to confirm CR.';}
    else if(s<=3){risk='int';label='Low-Intermediate';os='~82%';interp='Good prognosis. 5-year OS ~82% with R-CHOP. Majority of patients achieve durable remission.';next='R-CHOP ×6 cycles. Interim PET-CT after cycle 2–4. Complete CNS-IPI assessment. No dose escalation outside clinical trial.';}
    else if(s<=5){risk='high';label='High-Intermediate';os='~64%';interp='Below-average prognosis. 5-year OS ~64% with R-CHOP. Approximately one-third relapse or are refractory.';next='Complete CNS-IPI assessment (LP if score ≥4). FISH for MYC/BCL2/BCL6 rearrangements to exclude double-hit. Clinical trial enrolment is appropriate at this risk level. Intensified regimen (DA-R-EPOCH) if double-hit confirmed.';}
    else{risk='vhigh';label='High Risk';os='~33%';interp='Poor prognosis. 5-year OS ~33% with standard R-CHOP — the highest-risk NCCN-IPI group. Relapse and early progression are common.';next='FISH for MYC/BCL2/BCL6 is mandatory. CNS prophylaxis assessment required (LP + IT MTX if CNS-IPI high). Clinical trial is the preferred approach. DA-R-EPOCH for double-hit/double-expressor biology. MDT discussion before treatment initiation.';}
    return{score:s,max:8,risk,label,stats:[['5yr OS (R-CHOP)',os]],interp,next};
  }
},
ripi: {
  id:'ripi', name:'R-IPI', purpose:'Recalibrated IPI for DLBCL patients treated with Rituximab-containing chemotherapy.',
  cat:'malignant', disease:'DLBCL', icon:'🔴',
  tags:['dlbcl','lymphoma','ripi','rituximab','prognosis'],
  evidence:{source:'Sehn LH et al. Blood. 2007;109(5):1857-61.',guideline:'BSH / ESMO',year:2007,pmid:'17105812'},
  whenUse:'DLBCL patients treated with R-CHOP for simplified 3-group risk stratification.',
  whenNot:'Pre-Rituximab era patients. Non-DLBCL.',
  limits:'Simpler than NCCN-IPI. NCCN-IPI provides better high-risk discrimination. Three groups only.',
  inputs:[
    {id:'age',label:'Age >60 years',type:'check'},
    {id:'ldh',label:'LDH above upper limit of normal',type:'check'},
    {id:'ecog',label:'ECOG ≥2',type:'check'},
    {id:'stage',label:'Ann Arbor Stage III or IV',type:'check'},
    {id:'extra',label:'>1 extranodal site',type:'check'},
  ],
  calc:(v)=>{
    const s=Object.values(v).filter(Boolean).length;
    let risk,label,os,interp,next;
    if(s===0){risk='low';label='Very Good';os='~94%';interp='Excellent prognosis. 4-year OS ~94% with R-CHOP. This is the lowest-risk R-IPI group and generally cured with standard therapy.';next='Standard R-CHOP ×6 cycles. Interim and end-of-treatment PET-CT. No intensification indicated outside trial.';}
    else if(s<=2){risk='int';label='Good';os='~79%';interp='Good prognosis. 4-year OS ~79% with R-CHOP. Most patients achieve durable remission.';next='R-CHOP ×6 cycles. Interim PET-CT after cycle 2–4. Use NCCN-IPI for finer risk stratification within this group if LDH ratio is available.';}
    else{risk='high';label='Poor';os='~55%';interp='Below-average prognosis. 4-year OS ~55% with R-CHOP. Approximately half of patients relapse or are primary refractory.';next='FISH for MYC/BCL2/BCL6 rearrangements. CNS-IPI assessment — LP if score ≥4. Clinical trial enrolment is appropriate. DA-R-EPOCH if double-hit lymphoma confirmed. MDT review before treatment.';}
    return{score:s,max:5,risk,label,stats:[['4yr OS (R-CHOP)',os]],interp,next};
  }
},
ips: {
  id:'ips', name:'IPS (Hasenclever)', purpose:'Predict freedom from progression in advanced Hodgkin lymphoma.',
  cat:'malignant', disease:'Hodgkin Lymphoma', icon:'💜',
  tags:['hodgkin','hl','ips','hasenclever','prognosis'],
  evidence:{source:'Hasenclever D, Diehl V. N Engl J Med. 1998;339(21):1506-14.',guideline:'ESMO / NCCN / BSH',year:1998,pmid:'9819449'},
  whenUse:'Advanced Hodgkin lymphoma (stage III-IV or IIB with bulk) at diagnosis.',
  whenNot:'Early-stage favourable HL (use GHSG criteria). Post-treatment — interim PET is now the key prognostic marker.',
  limits:'Pre-PET era score. In modern PET-adapted therapy (RATHL, AHL2011), interim PET-2 response is more important than IPS for treatment adaptation.',
  inputs:[
    {id:'alb',label:'Albumin <4 g/dL',type:'check'},
    {id:'hgb',label:'Haemoglobin <10.5 g/dL',type:'check'},
    {id:'male',label:'Male sex',type:'check'},
    {id:'stage4',label:'Stage IV disease',type:'check'},
    {id:'age',label:'Age ≥45 years',type:'check'},
    {id:'wbc',label:'WBC ≥15 ×10⁹/L',type:'check'},
    {id:'lymph',label:'Lymphocytes <0.6 ×10⁹/L or <8% of WBC',type:'check'},
  ],
  calc:(v)=>{
    const s=Object.values(v).filter(Boolean).length;
    const data=[{l:'Very Low',ffp:'~84%'},{l:'Low',ffp:'~77%'},{l:'Low-Int',ffp:'~67%'},{l:'Intermediate',ffp:'~60%'},{l:'Int-High',ffp:'~51%'},{l:'High',ffp:'~42%'},{l:'High',ffp:'~42%'},{l:'High',ffp:'~42%'}];
    const d=data[Math.min(s,7)];
    let risk=s<=2?'low':s<=4?'int':'high';
    return{score:s,max:7,risk,label:d.l+' Risk',stats:[['5yr FFP (pre-PET era)',d.ffp]],
      interp:s<=2?'Good prognosis. 5-year freedom from progression ~77–84%. In modern PET-adapted therapy, interim PET-2 response is a more important prognostic marker than IPS for treatment adaptation.':'Elevated risk of disease progression. 5-year FFP ~42–67% depending on score. IPS was derived in the pre-PET era — treatment decisions are now guided by interim PET response.',
      next:s<=2?'Standard ABVD ×2 then interim PET-2. PET-negative: continue ABVD or de-escalate to AVD (RATHL data). PET-positive: escalate to BEACOPPesc. BV-AVD is an alternative based on ECHELON-1 (OS benefit in stage III/IV). Discuss at lymphoma MDT.':'Escalated therapy should be discussed. BEACOPPesc ×4–6 cycles or BV-AVD (ECHELON-1). Interim PET-adapted response guides ongoing treatment. ASCT for PET-positive after escalation. Clinical trial is appropriate. Lymphoma MDT review before first cycle.'};
  }
},
rai: {
  id:'rai', name:'Rai Staging', purpose:'Stage chronic lymphocytic leukaemia to guide treatment timing.',
  cat:'malignant', disease:'CLL', icon:'🔵',
  tags:['cll','rai','staging','chronic lymphocytic','prognosis'],
  evidence:{source:'Rai KR et al. Blood. 1975;46(2):219-34.',guideline:'iwCLL 2018 / BSH',year:1975,pmid:'1139039'},
  whenUse:'Newly diagnosed CLL for clinical staging.',
  whenNot:'Post-treatment assessment. SLL (use Ann Arbor staging).',
  limits:'Does not incorporate genetics (TP53, IGHV) or molecular markers. CLL-IPI and TP53/IGHV status now more important for treatment decisions. Modern therapy (BTKi, venetoclax) has dramatically improved outcomes.',
  inputs:[
    {id:'lymph',label:'Lymphocytosis (>5 ×10⁹/L monoclonal B cells)',type:'check'},
    {id:'nodes',label:'Lymphadenopathy',type:'check'},
    {id:'spleen',label:'Hepatomegaly and/or splenomegaly',type:'check'},
    {id:'anemia',label:'Anaemia (Hb <11 g/dL, disease-related)',type:'check'},
    {id:'thrombo',label:'Thrombocytopenia (<100 ×10⁹/L, disease-related)',type:'check'},
  ],
  calc:(v)=>{
    if(!v.lymph) return{score:'-',max:null,risk:'info',label:'Lymphocytosis must be present for CLL diagnosis',stats:[],interp:'',next:''};
    let stage,risk,label,os;
    if(v.thrombo){stage='IV';risk='high';label='Stage IV — High Risk';os='~2 yrs (historical)';}
    else if(v.anemia){stage='III';risk='high';label='Stage III — High Risk';os='~2 yrs (historical)';}
    else if(v.spleen){stage='II';risk='int';label='Stage II — Intermediate';os='~7 yrs';}
    else if(v.nodes){stage='I';risk='int';label='Stage I — Intermediate';os='~7 yrs';}
    else{stage='0';risk='low';label='Stage 0 — Low Risk';os='>10 yrs';}
    return{score:'Stage '+stage,max:null,risk,label,stats:[['Median OS (historical)',os]],
      interp:risk==='low'?'Early-stage, asymptomatic CLL.':'Advanced or symptomatic CLL.',
      next:risk==='low'?'Watch and wait. Monitor FBC every 3-6 months. Check IGHV, TP53, FISH panel at baseline. No treatment until iwCLL criteria met.':
      risk==='int'?'Treatment only if symptomatic (iwCLL 2018 criteria). Check TP53 and IGHV status before starting therapy. If treatment needed: BTKi (ibrutinib/acalabrutinib/zanubrutinib) or venetoclax-obinutuzumab based on TP53/IGHV.':
      'Generally requires treatment. URGENT TP53 assessment before starting therapy. If del17p/TP53mut: BTKi or venetoclax-based (avoid chemoimmunotherapy). If unmutated IGHV: BTKi or venetoclax-obinutuzumab preferred over FCR.'};
  }
},
cllipi: {
  id:'cllipi', name:'CLL-IPI', purpose:'Integrate genetic, molecular, clinical, and demographic factors for CLL prognosis.',
  cat:'malignant', disease:'CLL', icon:'🔵',
  tags:['cll','ipi','tp53','ighv','prognosis','chronic lymphocytic'],
  evidence:{source:'International CLL-IPI Working Group. Lancet Oncol. 2016;17(6):779-90.',guideline:'iwCLL / ESMO',year:2016,pmid:'27185642'},
  whenUse:'Newly diagnosed CLL when TP53, IGHV, and β2M results are available.',
  whenNot:'Without genetic/molecular results (use Rai/Binet alone). Post-treatment.',
  limits:'Requires TP53 and IGHV mutation status — may not be available at diagnosis in all centres. Developed before widespread use of targeted therapies (BTKi, venetoclax).',
  inputs:[
    {id:'tp53',label:'TP53 disrupted (del17p and/or TP53 mutation) — 4 points',type:'check'},
    {id:'ighv',label:'IGHV unmutated — 2 points',type:'check'},
    {id:'b2m',label:'β2-microglobulin >3.5 mg/L — 2 points',type:'check'},
    {id:'stage',label:'Rai I–IV or Binet B–C — 1 point',type:'check'},
    {id:'age',label:'Age >65 years — 1 point',type:'check'},
  ],
  calc:(v)=>{
    const s=(v.tp53?4:0)+(v.ighv?2:0)+(v.b2m?2:0)+(v.stage?1:0)+(v.age?1:0);
    let risk,label,os,interp,next;
    if(s<=1){risk='low';label='Low Risk';os='~93%';interp='Excellent prognosis. 5-year OS ~93%. The majority of patients in this group will not require treatment for many years, and some never will.';next='Observation. Monitor with FBC every 3–6 months and clinical review. Treat only when iwCLL criteria for treatment are met. No early intervention benefit has been demonstrated in this risk group.';}
    else if(s<=3){risk='int';label='Intermediate Risk';os='~79%';interp='Intermediate prognosis. 5-year OS ~79%. Treatment will be required in a proportion of patients within a few years of diagnosis.';next='Watch and wait until iwCLL treatment criteria are fulfilled (rapid lymphocyte doubling, progressive cytopenias, symptomatic disease, bulky nodes). When treatment is indicated: use IGHV mutation status and TP53 status to guide therapy choice. IGHV unmutated or TP53 disrupted: BTKi or venetoclax preferred over chemoimmunotherapy.';}
    else if(s<=6){risk='high';label='High Risk';os='~63%';interp='Poor prognosis. 5-year OS ~63%. Early treatment requirement is common. Chemoimmunotherapy outcomes are inferior in this group.';next='Treatment is likely required earlier. At treatment initiation: BTKi (ibrutinib or acalabrutinib) or venetoclax-obinutuzumab are preferred. If TP53 disrupted: chemoimmunotherapy is contraindicated — use BTKi or venetoclax-based regimen only. Clinical trial enrolment is appropriate.';}
    else{risk='vhigh';label='Very High Risk';os='~23%';interp='Very poor prognosis. 5-year OS ~23%. Rapid disease progression and resistance to chemotherapy are expected, particularly with TP53 disruption.';next='Specialist haematology management required. Chemoimmunotherapy (FCR, BR) is CONTRAINDICATED. Use BTKi (ibrutinib/acalabrutinib, continuous) or venetoclax-obinutuzumab (fixed-duration). Clinical trial is the preferred approach. Allogeneic SCT discussion in eligible young/fit patients achieving remission.';}
    return{score:s,max:10,risk,label,stats:[['5yr OS',os],['TP53',v.tp53?'Disrupted (4pts)':'Wild-type'],['IGHV',v.ighv?'Unmutated (2pts)':'Mutated']],interp,next};
  }
},
mipi: {
  id:'mipi', name:'MIPI (Simplified)', purpose:'Predict overall survival in mantle cell lymphoma using the simplified scoring system.',
  cat:'malignant', disease:'Mantle Cell Lymphoma', icon:'🟠',
  tags:['mcl','mantle cell','mipi','prognosis','lymphoma'],
  evidence:{source:'Hoster E et al. Blood. 2008;111(2):558-65.',guideline:'ESMO / NCCN',year:2008,pmid:'17962512'},
  whenUse:'Newly diagnosed mantle cell lymphoma for risk stratification and treatment planning.',
  whenNot:'Indolent/leukemic non-nodal MCL (different biology). Post-treatment.',
  limits:'Simplified MIPI uses categorical variables (less precise than continuous MIPI). MIPI-b adds Ki-67 for better discrimination. Does not include TP53 or molecular data.',
  inputs:[
    {id:'age',label:'Age',type:'select',opts:[['<50 years',0],['50–59',1],['60–69',2],['≥70',3]]},
    {id:'ecog',label:'ECOG Performance Status',type:'select',opts:[['0–1',0],['2–4',1]]},
    {id:'ldh',label:'LDH vs upper limit of normal',type:'select',opts:[['≤0.67 × ULN',0],['0.67–0.99 × ULN',1],['1.0–1.49 × ULN',2],['≥1.5 × ULN',3]]},
    {id:'wbc',label:'WBC (×10⁹/L)',type:'select',opts:[['<6.7',0],['6.7–9.99',1],['10.0–14.99',2],['≥15.0',3]]},
  ],
  calc:(v)=>{
    const s=Object.values(v).reduce((a,b)=>a+b,0);
    let risk,label,os,interp,next;
    if(s<=3){risk='low';label='Low Risk';os='Not reached (~60% 5yr)';interp='Best prognosis group.';next='If young/fit: intensive induction (R-DHAP/R-CHOP alternating) + ASCT + rituximab maintenance. If elderly/unfit: R-Benda or VR-CAP. Consider MIPI-b if Ki-67 available.';}
    else if(s<=5){risk='int';label='Intermediate Risk';os='~51 months';interp='Intermediate prognosis.';next='Treatment as per fitness. ASCT if eligible. Rituximab maintenance. Check TP53 (if mutated: poor response to chemoimmunotherapy — consider BTKi-based approach).';}
    else{risk='high';label='High Risk';os='~29 months';interp='Poor prognosis.';next='Clinical trial preferred. Consider ibrutinib-based combinations. TP53 testing mandatory. Discuss allogeneic SCT if young. R-BAC or dose-adjusted approaches for elderly.';}
    return{score:s,max:11,risk,label,stats:[['Median OS',os]],interp,next};
  }
},
elts: {
  id:'elts', name:'ELTS Score', purpose:'Predict long-term survival in CML patients treated with TKI therapy (modern era).',
  cat:'malignant', disease:'CML', icon:'🟡',
  tags:['cml','elts','eutos','tki','imatinib','prognosis'],
  evidence:{source:'Pfirrmann M et al. Leukemia. 2020;34(1):138-152.',guideline:'ELN 2020',year:2020,pmid:'31427733'},
  whenUse:'Newly diagnosed CML in chronic phase before starting TKI — preferred over Sokal in TKI era.',
  whenNot:'CML in accelerated or blast phase. Post-TKI response assessment.',
  limits:'Specifically developed for TKI-treated patients. Replaces Sokal/Hasford/EUTOS for TKI-era prognostication. Validated with imatinib; less data with 2G-TKIs.',
  inputs:[
    {id:'age',label:'Age (years)',type:'number',min:18,max:100,step:1},
    {id:'spleen',label:'Spleen size below costal margin (cm)',type:'number',min:0,max:40,step:1},
    {id:'plt',label:'Platelet count (×10⁹/L)',type:'number',min:0,max:3000,step:1},
    {id:'blasts',label:'Peripheral blood blasts (%)',type:'number',min:0,max:30,step:0.1},
  ],
  calc:(v)=>{
    if(!v.age) return{score:'-',max:null,risk:'info',label:'Enter patient data',stats:[],interp:'',next:''};
    const s=0.0025*(v.age/10)**3+0.0615*(v.spleen||0)+0.1052*((v.blasts||0)/10)+0.4104*((v.plt||0)/1000)**(-0.5146);
    const sr=Math.round(s*1000)/1000;
    let risk,label,interp,next;
    if(sr<=1.5680){risk='low';label='Low Risk';interp='Low ELTS risk. Best expected long-term survival outcomes with TKI therapy. This is the most favourable CML prognostic group in the TKI era.';next='Imatinib 400mg daily or a 2nd-generation TKI (dasatinib or nilotinib) are both acceptable choices. Monitor BCR::ABL1 (IS) at 3, 6, 12 months per ELN 2020 milestones. Target: ≤10% at 3mo, ≤1% at 6mo, ≤0.1% (MMR) at 12mo.';}
    else if(sr<=2.2185){risk='int';label='Intermediate Risk';interp='Intermediate ELTS risk. Long-term outcomes are moderate. A 2nd-generation TKI may improve the depth and speed of molecular response compared with imatinib.';next='2nd-generation TKI (dasatinib or nilotinib) is preferred in this risk group. Monitor BCR::ABL1 strictly at ELN milestones. If ELN warning criteria met: mutation analysis (BCR::ABL1 kinase domain), MDT review, consider TKI switch.';}
    else{risk='high';label='High Risk';interp='High ELTS risk. This is the poorest-outcome CML group on TKI therapy. 2nd-generation TKI from the outset is standard of care.';next='2nd-generation TKI IS RECOMMENDED (dasatinib or nilotinib over imatinib). Failure/warning criteria at ELN milestones should prompt urgent mutation analysis and TKI switch to a 3rd-generation agent (ponatinib/asciminib) if T315I or composite mutation detected. Clinical trial enrolment is appropriate. Consider ASCT discussion if suboptimal response persists.';}
    return{score:sr.toFixed(3),max:null,risk,label,stats:[['ELTS Score',sr.toFixed(3)]],interp,next};
  }
},
gipss: {
  id:'gipss', name:'GIPSS', purpose:'Genetically-based prognostic scoring for primary myelofibrosis using only genetic variables.',
  cat:'malignant', disease:'Myelofibrosis', icon:'🟣',
  tags:['myelofibrosis','mpn','gipss','genetics','prognosis','transplant'],
  evidence:{source:'Tefferi A et al. Leukemia. 2018;32(7):1631-42.',guideline:'ELN / NCCN',year:2018,pmid:'29654267'},
  whenUse:'Primary myelofibrosis when molecular profiling and karyotype are available — requires no clinical variables.',
  whenNot:'Post-PV/ET MF (use MYSEC-PM). When genetic data unavailable (use DIPSS).',
  limits:'Requires NGS molecular panel (CALR, ASXL1, SRSF2, U2AF1) and karyotype. Does not use clinical variables (Hb, WBC, symptoms). Best combined with DIPSS for clinical context.',
  inputs:[
    {id:'unfav',label:'Unfavourable karyotype (not very-high-risk)',type:'check'},
    {id:'vunfav',label:'Very-high-risk karyotype (scores 2)',type:'check'},
    {id:'triple',label:'Absence of type 1/like CALR mutation (triple-negative or other driver) — scores 2',type:'check'},
    {id:'asxl1',label:'ASXL1 mutation',type:'check'},
    {id:'srsf2',label:'SRSF2 mutation',type:'check'},
    {id:'u2af1',label:'U2AF1 Q157 mutation',type:'check'},
  ],
  calc:(v)=>{
    const s=(v.unfav?1:0)+(v.vunfav?2:0)+(v.triple?2:0)+(v.asxl1?1:0)+(v.srsf2?1:0)+(v.u2af1?1:0);
    let risk,label,os,interp,next;
    if(s===0){risk='low';label='Low Risk';os='26.4 yrs';interp='Excellent genetic profile. Median OS ~26 years — this group has near-normal life expectancy. Allogeneic transplant is not indicated.';next='Observation if asymptomatic. Ruxolitinib for symptomatic splenomegaly or constitutional symptoms. Transplant is NOT indicated in this genetic risk group. Annual molecular review.';}
    else if(s===1){risk='int';label='Intermediate-1';os='8 yrs';interp='Intermediate genetic risk. Median OS ~8 years. A proportion of patients will progress and require active management.';next='Ruxolitinib for symptomatic disease (splenomegaly, constitutional symptoms, anaemia). Monitor closely for progression (blasts, new mutations, worsening blood counts). Allogeneic SCT is not routinely indicated but should be reassessed if DIPSS clinical risk escalates.';}
    else if(s===2){risk='high';label='Intermediate-2';os='4.2 yrs';interp='Poor genetic profile. Median OS ~4 years. This group has a meaningful risk of blast transformation and early mortality.';next='Ruxolitinib standard of care for symptoms. REFER FOR ALLOGENEIC SCT ASSESSMENT. Evaluate HCT-CI and identify a suitable donor now. Fedratinib or pacritinib as alternatives if ruxolitinib-intolerant. Molecular monitoring every 6 months for acquisition of new adverse mutations.';}
    else{risk='vhigh';label='High Risk';os='2 yrs';interp='Very poor genetic profile. Median OS ~2 years. High risk of early blast transformation. This group derives the most benefit from allogeneic SCT.';next='URGENT ALLOGENEIC SCT REFERRAL. Bridge to transplant with ruxolitinib, fedratinib, or pacritinib (based on spleen/symptoms). Enrol in clinical trial if transplant-ineligible. Goals of care discussion if not proceeding to SCT. Regular blast count monitoring.';}
    return{score:s,max:null,risk,label,stats:[['Median OS',os],['GIPSS Score',s]],interp,next};
  }
},
ipset: {
  id:'ipset', name:'IPSET-Thrombosis', purpose:'Stratify thrombotic risk in essential thrombocythaemia to guide cytoreductive therapy.',
  cat:'malignant', disease:'ET', icon:'🩸',
  tags:['et','essential thrombocythaemia','ipset','thrombosis','mpn','jak2'],
  evidence:{source:'Barbui T et al. Blood. 2012;120(26):5128-33. Revised: Barbui T et al. Blood Cancer J. 2015.',guideline:'ELN / BSH',year:2015,pmid:'23086754'},
  whenUse:'Essential thrombocythaemia to determine need for cytoreductive therapy.',
  whenNot:'Other MPN subtypes (PV, MF). Reactive thrombocytosis.',
  limits:'JAK2 V617F is the only driver mutation scored. CALR and MPL are not in the revised IPSET. CV risk factors are modifiable — address these in all patients.',
  inputs:[
    {id:'thrombo',label:'Prior thrombosis',type:'check'},
    {id:'age60',label:'Age >60 years',type:'check'},
    {id:'jak2',label:'JAK2 V617F mutation present',type:'check'},
    {id:'cvrf',label:'Cardiovascular risk factors (smoking, HTN, DM, hyperlipidaemia)',type:'check'},
  ],
  calc:(v)=>{
    let risk,label,annual,interp,next;
    if(v.thrombo||(v.age60&&v.jak2)){risk='high';label='High Risk';annual='~4.3%/yr';interp='High thrombotic risk (~4.3% per year). Either prior thrombosis or the combination of age >60 and JAK2 V617F are present. Cytoreductive therapy is indicated.';next='HYDROXYUREA is first-line cytoreductive therapy (ELN/BSH recommendation). Target platelet count <400 ×10⁹/L. Aspirin 75mg daily unless contraindicated by bleeding history or platelet count >1,500. Address all modifiable cardiovascular risk factors. If hydroxyurea-intolerant or resistant: anagrelide or pegylated interferon-alpha.';}
    else if(v.age60&&!v.jak2){risk='int';label='Intermediate Risk';annual='~2.6%/yr';interp='Intermediate thrombotic risk (~2.6% per year). Age >60 without JAK2 V617F. Thrombotic risk is lower than JAK2-positive elderly patients.';next='Cytoreduction on an individual basis — not mandated by guidelines but may be appropriate with other risk features. Aspirin 75mg daily. Aggressive CV risk factor management. Monitor for new thrombotic events and disease progression.';}
    else if(!v.age60&&v.jak2){risk='low';label='Low Risk';annual='~1.0%/yr';interp='Low thrombotic risk (~1.0% per year). JAK2-positive but age ≤60 without prior thrombosis. No cytoreduction is indicated at this stage.';next='Aspirin 75mg daily (consider twice-daily dosing if significant CV risk factors present). Cytoreduction is NOT routinely indicated. Annual haematology review and monitoring for disease progression or new risk factors.';}
    else{risk='low';label='Very Low Risk';annual='~0.4%/yr';interp='Lowest thrombotic risk (~0.4% per year). JAK2-negative, age ≤60, no prior thrombosis. This group has close to population-level vascular risk in the short term.';next='Observation only. Low-dose aspirin may be considered if cardiovascular risk factors are present, but routine aspirin is not universally recommended in very low-risk ET. No cytoreduction. Annual review.';}
    return{score:'',max:null,risk,label,stats:[['Annual thrombosis rate',annual]],interp,next};
  }
},
elnAml: {
  id:'elnAml', name:'ELN 2022 AML Risk', purpose:'Classify AML into favourable, intermediate, and adverse genetic risk groups per ELN 2022.',
  cat:'malignant', disease:'AML', icon:'🔴',
  tags:['aml','eln','genetics','risk','prognosis','transplant','npm1','flt3'],
  evidence:{source:'Döhner H et al. Blood. 2022;140(12):1345-77.',guideline:'ELN 2022',year:2022,pmid:'35797463'},
  whenUse:'Newly diagnosed AML when cytogenetic and molecular results available, to guide treatment intensity and transplant decision.',
  whenNot:'Therapy-related AML or AML with MDS-related changes (may behave differently). APL (t(15;17) — managed with ATRA+ATO).',
  limits:'Requires comprehensive cytogenetic AND molecular testing (NPM1, FLT3-ITD, CEBPA, RUNX1, ASXL1, TP53, etc). Risk may change with MRD assessment.',
  inputs:[
    {id:'risk',label:'ELN 2022 Genetic Risk Category',type:'select',opts:[
      ['Favourable: t(8;21), inv(16)/t(16;16), NPM1mut without FLT3-ITD, bZIP CEBPA, t(15;17)',0],
      ['Intermediate: NPM1mut with FLT3-ITD, wild-type NPM1 without FLT3-ITD (normal karyotype), t(9;11)',1],
      ['Adverse: Complex karyotype, monosomal karyotype, t(6;9), t(v;11q23.3) not t(9;11), inv(3)/t(3;3), -5/del(5q), -7, -17/abn(17p), TP53mut, RUNX1mut, ASXL1mut, BCOR, EZH2, SF3B1, SRSF2, STAG2, U2AF1, ZRSR2',2]
    ]},
  ],
  calc:(v)=>{
    const r=v.risk;
    if(r===0) return{score:'Favourable',max:null,risk:'low',label:'Favourable Risk',stats:[['5yr OS','~60–70%'],['Category','ELN Favourable']],
      interp:'Best prognosis group. ~60-70% long-term survival with chemotherapy alone.',
      next:'Intensive induction (7+3 or CPX-351). Consolidation with HiDAC ×3-4 cycles. ASCT NOT recommended in CR1 (reserved for relapse). MRD monitoring by flow/molecular. If FLT3-ITD present with NPM1mut: add midostaurin.'};
    if(r===1) return{score:'Intermediate',max:null,risk:'int',label:'Intermediate Risk',stats:[['5yr OS','~40–50%'],['Category','ELN Intermediate']],
      interp:'Intermediate prognosis. Transplant decision depends on MRD status and donor availability.',
      next:'Intensive induction (7+3 ± midostaurin if FLT3mut). ALLOGENEIC SCT IN CR1 RECOMMENDED if suitable donor available. If MRD-negative by sensitive assay: individualize transplant decision. If FLT3mut: midostaurin + maintenance gilteritinib post-SCT.'};
    return{score:'Adverse',max:null,risk:'high',label:'Adverse Risk',stats:[['5yr OS','~10–20%'],['Category','ELN Adverse']],
      interp:'Poor prognosis with standard therapy. Transplant essential for any chance of cure.',
      next:'URGENT transplant referral. Intensive induction (CPX-351 may be preferred for MDS-related). ALLOGENEIC SCT IN CR1 — proceed as soon as remission achieved. Consider venetoclax combinations if unfit. If TP53mut: very poor prognosis — clinical trial, hypomethylating agents, or best supportive care discussion.'};
  }
},
khorana: {
  id:'khorana', name:'Khorana Score', purpose:'Predict risk of cancer-associated venous thromboembolism in ambulatory patients starting chemotherapy.',
  cat:'benign', disease:'Cancer-Associated VTE', icon:'🎗️',
  tags:['khorana','vte','cancer','thrombosis','prophylaxis','chemotherapy'],
  evidence:{source:'Khorana AA et al. Blood. 2008;111(10):4902-7.',guideline:'ASCO / ISTH / NCCN',year:2008,pmid:'18216292'},
  whenUse:'Ambulatory cancer patients starting systemic chemotherapy to assess need for thromboprophylaxis.',
  whenNot:'Brain tumours or myeloma (not validated). Hospitalised patients (use Padua). Patients already anticoagulated.',
  limits:'Absolute VTE risk may be lower than originally reported. Does not account for individual cancer biology, prior VTE, or specific chemotherapy regimen. CASSINI and AVERT trials used Khorana ≥2 to select patients for DOAC prophylaxis.',
  inputs:[
    {id:'cancer',label:'Cancer type',type:'select',opts:[['Low risk (breast, colorectal, head/neck)',0],['High risk (lung, lymphoma, gynae, bladder, testicular)',1],['Very high risk (stomach, pancreas)',2]]},
    {id:'plt3',label:'Platelets ≥350 ×10⁹/L (pre-chemo)',type:'check'},
    {id:'hgb2',label:'Haemoglobin <10 g/dL or using ESA',type:'check'},
    {id:'wbc2',label:'WBC >11 ×10⁹/L (pre-chemo)',type:'check'},
    {id:'bmi',label:'BMI ≥35 kg/m²',type:'check'},
  ],
  calc:(v)=>{
    const s=(v.cancer||0)+(v.plt3?1:0)+(v.hgb2?1:0)+(v.wbc2?1:0)+(v.bmi?1:0);
    let risk,label,vte6m,interp,next;
    if(s===0){risk='low';label='Low Risk';vte6m='~0.3–1.5%';interp='Low VTE risk.';next='Routine thromboprophylaxis NOT recommended. Standard advice: mobilisation, hydration. Reassess if risk factors change.';}
    else if(s<=2){risk='int';label='Intermediate Risk';vte6m='~1.8–3.6%';interp='Moderate VTE risk.';next='ASCO/ISTH guidelines recommend considering thromboprophylaxis for Khorana ≥2. Options: rivaroxaban 10mg daily or apixaban 2.5mg BD for duration of chemotherapy (CASSINI/AVERT trials). Discuss bleeding risk.';}
    else{risk='high';label='High Risk';vte6m='~4.1–7%';interp='High VTE risk.';next='Thromboprophylaxis RECOMMENDED (Khorana ≥3). Rivaroxaban 10mg OD or apixaban 2.5mg BD. Duration: through chemotherapy or minimum 6 months. Assess bleeding risk (GI/GU cancers higher bleed risk with DOACs).';}
    return{score:s,max:6,risk,label,stats:[['6-month VTE risk',vte6m],['Khorana Score',s]],interp,next};
  }
},
mascc: {
  id:'mascc', name:'MASCC Score', purpose:'Identify low-risk febrile neutropenia patients who may be suitable for outpatient oral antibiotic management.',
  cat:'benign', disease:'Febrile Neutropenia', icon:'🌡️',
  tags:['febrile','neutropenia','mascc','sepsis','chemotherapy','outpatient'],
  evidence:{source:'Klastersky J et al. J Clin Oncol. 2000;18(16):3038-51.',guideline:'ASCO / ESMO / NICE',year:2000,pmid:'10944139'},
  whenUse:'Cancer patients with chemotherapy-induced febrile neutropenia (temp ≥38.3°C or ≥38.0°C sustained, with ANC <0.5 or expected to fall).',
  whenNot:'Non-chemotherapy neutropenia. Patients with haematological malignancy and prolonged neutropenia (>7 days expected) — these are generally high-risk regardless of MASCC.',
  limits:'Does not account for expected duration of neutropenia or depth of neutropenia (<0.1). Haematological malignancy patients with expected prolonged neutropenia should generally be admitted regardless of MASCC score.',
  inputs:[
    {id:'burden',label:'Burden of illness at presentation',type:'select',opts:[['No/mild symptoms',5],['Moderate symptoms',3],['Severe/moribund',0]]},
    {id:'hypot',label:'No hypotension (SBP ≥90 mmHg)',type:'select',opts:[['SBP ≥90',5],['SBP <90',0]]},
    {id:'copd',label:'No COPD',type:'select',opts:[['No COPD',4],['COPD present',0]]},
    {id:'tumour',label:'Tumour type',type:'select',opts:[['Solid tumour or haem malignancy without prior fungal infection',4],['Haem malignancy with prior fungal infection',0]]},
    {id:'dehydr',label:'No dehydration',type:'select',opts:[['Not dehydrated',3],['Dehydrated',0]]},
    {id:'status',label:'Patient status at fever onset',type:'select',opts:[['Outpatient',3],['Inpatient',0]]},
    {id:'age2',label:'Age',type:'select',opts:[['<60 years',2],['≥60 years',0]]},
  ],
  calc:(v)=>{
    const s=Object.values(v).reduce((a,b)=>a+b,0);
    let risk,label,interp,next;
    if(s>=21){risk='low';label='Low Risk (MASCC ≥21)';interp='Low risk of serious complications (<5%). May be suitable for outpatient management.';next='Consider ORAL antibiotics (amoxicillin-clavulanate + ciprofloxacin) if: reliable patient, lives near hospital, has carer, no organ dysfunction. Observe 4-6 hours first. Daily review until afebrile and ANC rising. If haem malignancy with expected prolonged neutropenia: ADMIT regardless.';}
    else{risk='high';label='High Risk (MASCC <21)';interp='High risk of serious complications. Requires hospital admission.';next='ADMIT for IV antibiotics. Follow local neutropenic sepsis protocol (typically piperacillin-tazobactam or meropenem). Blood cultures ×2 before antibiotics. Antibiotics within 1 HOUR ("door to needle"). Fluid resuscitation if needed. Consider G-CSF if high-risk features.';}
    return{score:s,max:26,risk,label,stats:[['MASCC Score',s+'/26']],interp,next};
  }
},
bsa: {
  id:'bsa', name:'BSA (Body Surface Area)', purpose:'Calculate body surface area for chemotherapy dosing using the Mosteller formula.',
  cat:'general', disease:'Dosing', icon:'📏',
  tags:['bsa','body surface area','chemotherapy','dosing','mosteller'],
  evidence:{source:'Mosteller RD. N Engl J Med. 1987;317(17):1098.',guideline:'Standard Clinical Practice',year:1987,pmid:'3657876'},
  whenUse:'Chemotherapy dose calculation. Drug dosing that requires BSA.',
  whenNot:'Obese patients may need dose-capping (BSA usually capped at 2.0 m² in many protocols — check local policy).',
  limits:'Multiple BSA formulae exist (DuBois, Mosteller, Haycock). Mosteller is most commonly used. Obese patients: use actual body weight but consider capping.',
  inputs:[
    {id:'ht',label:'Height (cm)',type:'number',min:100,max:250,step:1},
    {id:'wt',label:'Weight (kg)',type:'number',min:20,max:250,step:0.1},
  ],
  calc:(v)=>{
    if(!v.ht||!v.wt) return{score:'-',max:null,risk:'info',label:'Enter height and weight',stats:[],interp:'',next:''};
    const bsa=Math.sqrt((v.ht*v.wt)/3600);
    const b=Math.round(bsa*100)/100;
    const bmi=v.wt/((v.ht/100)**2);
    return{score:b.toFixed(2),max:null,risk:'low',label:'BSA = '+b.toFixed(2)+' m²',
      stats:[['BSA',b.toFixed(2)+' m²'],['BMI',bmi.toFixed(1)+' kg/m²'],['Height',v.ht+' cm'],['Weight',v.wt+' kg']],
      interp:b>2.0?'BSA exceeds 2.0 m² — check local protocol for dose capping.':'Within typical range for chemotherapy dosing.',
      next:b>2.0?'Many protocols cap BSA at 2.0 m² for dose calculation. Check specific regimen guidelines and local policy. Do NOT empirically reduce doses in obese patients without protocol guidance (ASCO recommendation).':
      'Use this BSA for chemotherapy dose calculations. Example: if drug dose is 375 mg/m², dose = 375 × '+b.toFixed(2)+' = '+(375*b).toFixed(0)+' mg.'};
  }
},
crcl: {
  id:'crcl', name:'CrCl (Cockcroft-Gault)', purpose:'Calculate creatinine clearance for drug dose adjustment — the standard for most drug dosing.',
  cat:'general', disease:'Renal / Dosing', icon:'💊',
  tags:['creatinine','clearance','cockcroft','gault','dosing','renal','doac'],
  evidence:{source:'Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41.',guideline:'Standard Clinical Practice / BNF',year:1976,pmid:'1244564'},
  whenUse:'Drug dose adjustment (DOACs, antibiotics, chemotherapy, carboplatin via Calvert). Preferred over eGFR for most drug dosing.',
  whenNot:'CKD staging (use CKD-EPI eGFR instead). Acute kidney injury (trending creatinine is more useful).',
  limits:'Overestimates GFR in obese patients (use adjusted body weight). Underestimates in elderly/low muscle mass. Not accurate at extremes.',
  inputs:[
    {id:'age4',label:'Age (years)',type:'number',min:18,max:120,step:1},
    {id:'wt2',label:'Weight (kg — use actual weight; adjusted if obese)',type:'number',min:20,max:250,step:0.1},
    {id:'creat2',label:'Serum creatinine (µmol/L)',type:'number',min:20,max:2000,step:1},
    {id:'sex2',label:'Sex',type:'select',opts:[['Female',0],['Male',1]]},
  ],
  calc:(v)=>{
    if(!v.age4||!v.wt2||!v.creat2) return{score:'-',max:null,risk:'info',label:'Enter all values',stats:[],interp:'',next:''};
    let crcl=(140-v.age4)*v.wt2/(0.815*v.creat2);
    if(v.sex2===0) crcl*=0.85;
    const c=Math.round(crcl);
    let risk,label;
    if(c>=90){risk='low';label='Normal';}else if(c>=60){risk='low';label='Mildly reduced';}else if(c>=30){risk='int';label='Moderately reduced';}else if(c>=15){risk='high';label='Severely reduced';}else{risk='vhigh';label='Very severely reduced';}
    return{score:c,max:null,risk,label:'CrCl = '+c+' mL/min — '+label,stats:[['CrCl',c+' mL/min']],
      interp:'Drug dosing reference (common adjustments): Apixaban: reduce to 2.5mg BD if CrCl 15-29. Rivaroxaban: reduce to 15mg if CrCl 15-49 for AF. LMWH: caution if CrCl <30. Metformin: avoid if CrCl <30.',
      next:c<30?'Major dose adjustments needed for most drugs. Check BNF for individual drug guidance. Avoid nephrotoxic drugs. Specialist prescribing.':c<60?'Check dose adjustments for renally-cleared drugs (DOACs, antibiotics, chemotherapy). Use CrCl (not eGFR) for drug dosing.':'No major dose adjustments for most drugs based on renal function alone.'};
  }
},
calvert: {
  id:'calvert', name:'Calvert Formula', purpose:'Calculate carboplatin dose based on target AUC and renal function.',
  cat:'general', disease:'Chemo Dosing', icon:'⚗️',
  tags:['calvert','carboplatin','auc','dosing','chemotherapy','renal'],
  evidence:{source:'Calvert AH et al. J Clin Oncol. 1989;7(11):1748-56.',guideline:'Standard Oncology Practice',year:1989,pmid:'2681557'},
  whenUse:'Carboplatin dose calculation for any carboplatin-containing regimen (e.g., TC, carbo-etoposide, ABVD→carbo).',
  whenNot:'Other platinum agents (cisplatin uses mg/m²). If GFR measured by isotope method, use that value directly.',
  limits:'Use GFR (not CrCl) ideally. If using CrCl, cap at 125 mL/min to avoid overdosing. Some centres cap total dose at AUC × 125+25. FDA recommends capping GFR at 125.',
  inputs:[
    {id:'auc',label:'Target AUC',type:'select',opts:[['AUC 2',2],['AUC 4',4],['AUC 5',5],['AUC 6',6],['AUC 7',7]]},
    {id:'gfr',label:'GFR or CrCl (mL/min) — cap at 125 if using CrCl',type:'number',min:5,max:200,step:1},
  ],
  calc:(v)=>{
    if(!v.gfr) return{score:'-',max:null,risk:'info',label:'Enter GFR and target AUC',stats:[],interp:'',next:''};
    const auc=v.auc||5;
    const gfr=Math.min(v.gfr,125);
    const dose=auc*(gfr+25);
    return{score:Math.round(dose),max:null,risk:'low',label:'Carboplatin dose = '+Math.round(dose)+' mg',
      stats:[['Total dose',Math.round(dose)+' mg'],['Target AUC',auc],['GFR used',gfr+' mL/min'+(v.gfr>125?' (capped at 125)':'')]],
      interp:'Calvert formula: Dose (mg) = Target AUC × (GFR + 25)',
      next:'Administer carboplatin '+Math.round(dose)+' mg IV in 250-500mL NaCl/glucose over 30-60 minutes. Pre-medication as per local protocol. Monitor renal function before each cycle. Recalculate if GFR changes between cycles.'};
  }
},
childpugh: {
  id:'childpugh', name:'Child-Pugh Score', purpose:'Assess severity of chronic liver disease and hepatic reserve.',
  cat:'general', disease:'Hepatology', icon:'🫁',
  tags:['liver','cirrhosis','child','pugh','hepatic','reserve'],
  evidence:{source:'Pugh RN et al. Br J Surg. 1973;60(8):646-9.',guideline:'AASLD / EASL / NICE',year:1973,pmid:'4541913'},
  whenUse:'Known chronic liver disease/cirrhosis to classify severity and guide management (drug dosing, transplant listing, surgical risk).',
  whenNot:'Acute liver failure. Isolated transaminase elevation without cirrhosis.',
  limits:'Subjective components (ascites, encephalopathy grading). Does not predict short-term mortality as well as MELD. INR may be unreliable in patients on anticoagulants.',
  inputs:[
    {id:'bili',label:'Total bilirubin',type:'select',opts:[['<34 µmol/L (<2 mg/dL)',1],['34–50 (2–3)',2],['>50 (>3)',3]]},
    {id:'alb3',label:'Albumin',type:'select',opts:[['>35 g/L',1],['28–35',2],['<28',3]]},
    {id:'inr3',label:'INR',type:'select',opts:[['<1.7',1],['1.7–2.3',2],['>2.3',3]]},
    {id:'ascites',label:'Ascites',type:'select',opts:[['None',1],['Mild/controlled',2],['Moderate-severe/refractory',3]]},
    {id:'enceph',label:'Hepatic encephalopathy',type:'select',opts:[['None',1],['Grade 1–2 (mild)',2],['Grade 3–4 (severe)',3]]},
  ],
  calc:(v)=>{
    const s=Object.values(v).reduce((a,b)=>a+b,0);
    let grade,risk,label,surv1yr,interp,next;
    if(s<=6){grade='A';risk='low';label='Child-Pugh A (Compensated)';surv1yr='~100%';interp='Well-compensated cirrhosis.';next='Continue surveillance (6-monthly US for HCC). Drug dose adjustments generally minor. Variceal screening if not done.';}
    else if(s<=9){grade='B';risk='int';label='Child-Pugh B (Significant)';surv1yr='~80%';interp='Significant hepatic dysfunction.';next='Dose-reduce hepatically metabolised drugs. Consider transplant assessment if progressive. Nutritional support. MELD score for transplant listing. Avoid NSAIDs, nephrotoxins.';}
    else{grade='C';risk='high';label='Child-Pugh C (Decompensated)';surv1yr='~45%';interp='Decompensated cirrhosis with poor prognosis.';next='URGENT transplant assessment. Most drugs require major dose reduction or avoidance. Manage complications: ascites (diuretics/paracentesis), variceal bleeding (banding/TIPS), encephalopathy (lactulose/rifaximin). Palliative care discussion if not transplant candidate.';}
    return{score:s,max:15,risk,label,stats:[['Grade','Child-Pugh '+grade],['1yr survival',surv1yr],['Score',s+'/15']],interp,next};
  }
},
meld: {
  id:'meld', name:'MELD Score', purpose:'Predict 3-month mortality in end-stage liver disease and prioritise liver transplant listing.',
  cat:'general', disease:'Hepatology', icon:'🫁',
  tags:['meld','liver','transplant','cirrhosis','mortality'],
  evidence:{source:'Kamath PS et al. Hepatology. 2001;33(2):464-70.',guideline:'AASLD / UNOS',year:2001,pmid:'11172350'},
  whenUse:'End-stage liver disease for transplant prioritisation. TIPS procedure risk assessment. Any cirrhosis prognosis estimation.',
  whenNot:'Acute liver failure (separate criteria). In isolation for drug dosing (use Child-Pugh).',
  limits:'Does not account for portal hypertension complications, HCC, or quality of life. MELD-Na adds sodium for better discrimination. Minimum values: creatinine 1.0, bilirubin 1.0, INR 1.0.',
  inputs:[
    {id:'bili2',label:'Bilirubin (mg/dL) [divide µmol/L by 17.1]',type:'number',min:0.1,max:50,step:0.1},
    {id:'creat3',label:'Creatinine (mg/dL) [divide µmol/L by 88.4]',type:'number',min:0.1,max:15,step:0.1},
    {id:'inr4',label:'INR',type:'number',min:0.5,max:10,step:0.1},
    {id:'na',label:'Sodium (mmol/L) — for MELD-Na',type:'number',min:100,max:160,step:1},
  ],
  calc:(v)=>{
    if(!v.bili2||!v.creat3||!v.inr4) return{score:'-',max:null,risk:'info',label:'Enter all values',stats:[],interp:'',next:''};
    const b=Math.max(v.bili2,1),cr=Math.min(Math.max(v.creat3,1),4),i=Math.max(v.inr4,1);
    const meld=Math.round(10*(0.957*Math.log(cr)+0.378*Math.log(b)+1.120*Math.log(i)+0.643));
    let risk,label,mort3m;
    if(meld<=9){risk='low';label='Low';mort3m='~1.9%';}
    else if(meld<=19){risk='int';label='Intermediate';mort3m='~6%';}
    else if(meld<=29){risk='high';label='High';mort3m='~19.6%';}
    else{risk='vhigh';label='Very High';mort3m='~52.6%';}
    return{score:meld,max:40,risk,label:'MELD '+meld+' — '+label+' Risk',stats:[['3-month mortality',mort3m],['MELD Score',meld]],
      interp:'MELD '+meld+': estimated 3-month mortality '+mort3m+'.',
      next:meld>=15?'Consider transplant referral (MELD ≥15 generally qualifies for listing). Optimise nutrition. Manage complications. If MELD ≥25: urgent transplant assessment.':'Continue medical management. Monitor MELD trend. Transplant referral if increasing or complications develop.'};
  }
},
qsofa2: {
  id:'qsofa2', name:'qSOFA', purpose:'Bedside screening tool for sepsis in patients with suspected infection outside the ICU.',
  cat:'general', disease:'Sepsis', icon:'🏥',
  tags:['qsofa','sepsis','screening','quick','sofa','infection'],
  evidence:{source:'Singer M et al. JAMA. 2016;315(8):801-10 (Sepsis-3).',guideline:'Surviving Sepsis Campaign',year:2016,pmid:'26903338'},
  whenUse:'Ward patients with suspected infection as a rapid bedside screen for possible sepsis.',
  whenNot:'ICU patients (use full SOFA). As a standalone diagnostic tool — it is a screening prompt for further assessment.',
  limits:'Low sensitivity (~50%) — cannot be used to rule out sepsis. Better specificity for poor outcomes. Sepsis-3 recommends full SOFA for ICU patients. NEWS2 is preferred as a general early warning system in UK practice.',
  inputs:[
    {id:'rr2',label:'Respiratory rate ≥22/min',type:'check'},
    {id:'sbp2',label:'Systolic BP ≤100 mmHg',type:'check'},
    {id:'gcs',label:'Altered mentation (GCS <15)',type:'check'},
  ],
  calc:(v)=>{
    const s=Object.values(v).filter(Boolean).length;
    let risk,label,interp,next;
    if(s<=1){risk='low';label='qSOFA '+s+' — Low Risk';interp='Low qSOFA score. This does NOT rule out sepsis — qSOFA has a sensitivity of approximately 50% and cannot be used to exclude the diagnosis. Clinical judgment takes precedence.';next='If infection is clinically suspected, continue close assessment regardless of this score. Calculate full SOFA if the patient is deteriorating. Check NEWS2 for a more sensitive ward-based risk stratification. A negative qSOFA in a patient with clinical signs of sepsis does not change the need for assessment and treatment.';}
    else{risk='high';label='qSOFA ≥2 — High Risk';interp='Positive sepsis screen. qSOFA ≥2 identifies patients with suspected infection who are at high risk of organ dysfunction and death. This is a trigger for urgent action, not a diagnostic endpoint.';next='URGENT ASSESSMENT REQUIRED. Calculate full SOFA to confirm organ dysfunction. Initiate Sepsis-6 within 1 hour: blood cultures ×2 sets, IV broad-spectrum antibiotics, IV fluid bolus 500mL crystalloid, measure serum lactate, hourly urine output monitoring, supplemental oxygen if SpO₂ <94%. ICU review if SOFA ≥2 or clinical deterioration. In haematology patients with ANC <0.5: neutropenic sepsis protocol immediately.';}
    return{score:s,max:3,risk,label,stats:[['qSOFA Score',s+'/3']],interp,next};
  }
},
padua: {
  id:'padua', name:'Padua Prediction Score', purpose:'Assess VTE risk in acutely ill medical inpatients to guide thromboprophylaxis.',
  cat:'benign', disease:'VTE Prophylaxis', icon:'🏥',
  tags:['padua','vte','prophylaxis','medical','inpatient','thrombosis'],
  evidence:{source:'Barbar S et al. J Thromb Haemost. 2010;8(11):2450-7.',guideline:'NICE / ACCP / ASH',year:2010,pmid:'20738765'},
  whenUse:'Acutely ill medical inpatients (non-surgical) to determine if pharmacological thromboprophylaxis is indicated.',
  whenNot:'Surgical patients (use Caprini). Already anticoagulated patients.',
  limits:'UK practice: NICE recommends VTE risk assessment for ALL medical admissions regardless of score. Padua provides evidence-based quantification. Balance against bleeding risk.',
  inputs:[
    {id:'cancer2',label:'Active cancer (chemo/radio in last 6 months, or palliative)',type:'select',opts:[['No',0],['Yes',3]]},
    {id:'prevvte2',label:'Previous VTE (excluding superficial)',type:'select',opts:[['No',0],['Yes',3]]},
    {id:'immob2',label:'Reduced mobility (≥3 days bed rest)',type:'select',opts:[['No',0],['Yes',3]]},
    {id:'thrombo2',label:'Known thrombophilia',type:'select',opts:[['No',0],['Yes',3]]},
    {id:'trauma',label:'Recent trauma/surgery (≤1 month)',type:'select',opts:[['No',0],['Yes',2]]},
    {id:'age5',label:'Age ≥70 years',type:'select',opts:[['No',0],['Yes',1]]},
    {id:'hf',label:'Heart and/or respiratory failure',type:'select',opts:[['No',0],['Yes',1]]},
    {id:'ami',label:'Acute MI or ischaemic stroke',type:'select',opts:[['No',0],['Yes',1]]},
    {id:'infxn',label:'Acute infection and/or rheumatological disorder',type:'select',opts:[['No',0],['Yes',1]]},
    {id:'bmi2',label:'BMI ≥30',type:'select',opts:[['No',0],['Yes',1]]},
    {id:'hrt',label:'Ongoing hormonal treatment (HRT, OCP)',type:'select',opts:[['No',0],['Yes',1]]},
  ],
  calc:(v)=>{
    const s=Object.values(v).reduce((a,b)=>a+b,0);
    let risk,label,interp,next;
    if(s<4){risk='low';label='Low VTE Risk (Padua <4)';interp='Low risk of hospital-acquired VTE.';next='Pharmacological prophylaxis NOT routinely recommended based on Padua. Encourage early mobilisation and hydration. Reassess if clinical status changes. Note: UK NICE recommends VTE assessment for all admissions.';}
    else{risk='high';label='High VTE Risk (Padua ≥4)';interp='High risk of hospital-acquired VTE (~11% at 90 days without prophylaxis in original study).';next='PHARMACOLOGICAL THROMBOPROPHYLAXIS RECOMMENDED unless contraindicated. Standard: enoxaparin 40mg SC daily (or dalteparin 5000 units). Assess bleeding risk before starting. Mechanical prophylaxis (TED stockings) if pharmacological contraindicated.';}
    return{score:s,max:20,risk,label,stats:[['Padua Score',s]],interp,next};
  }
},
charlson: {
  id:'charlson', name:'Charlson Comorbidity Index', purpose:'Predict 10-year mortality based on comorbid conditions.',
  cat:'general', disease:'Comorbidity', icon:'📋',
  tags:['charlson','comorbidity','mortality','prognosis','fitness'],
  evidence:{source:'Charlson ME et al. J Chronic Dis. 1987;40(5):373-83.',guideline:'Widely used in clinical research',year:1987,pmid:'3558716'},
  whenUse:'Assessing comorbidity burden for treatment decisions (chemotherapy fitness, transplant eligibility), research stratification, and prognosis estimation.',
  whenNot:'As sole determinant of treatment fitness. Without clinical context.',
  limits:'Does not capture functional status or frailty. Age-adjusted version adds 1 point per decade over 40. Multiple versions exist with slightly different weightings.',
  inputs:[
    {id:'mi',label:'Myocardial infarction (history)',type:'check'},
    {id:'chf2',label:'Congestive heart failure',type:'check'},
    {id:'pvd',label:'Peripheral vascular disease',type:'check'},
    {id:'cva',label:'Cerebrovascular disease (CVA/TIA)',type:'check'},
    {id:'dementia',label:'Dementia',type:'check'},
    {id:'copd2',label:'Chronic pulmonary disease',type:'check'},
    {id:'ctd',label:'Connective tissue disease',type:'check'},
    {id:'pud',label:'Peptic ulcer disease',type:'check'},
    {id:'liver3',label:'Liver disease',type:'select',opts:[['None',0],['Mild (no portal HTN)',1],['Moderate-severe (portal HTN, varices)',3]]},
    {id:'dm2',label:'Diabetes',type:'select',opts:[['None',0],['Uncomplicated',1],['End-organ damage (retinopathy, neuropathy, nephropathy)',2]]},
    {id:'hemi',label:'Hemiplegia',type:'select',opts:[['No',0],['Yes',2]]},
    {id:'ckd',label:'Moderate-severe renal disease (Cr >3 or dialysis)',type:'select',opts:[['No',0],['Yes',2]]},
    {id:'cancer3',label:'Cancer',type:'select',opts:[['None',0],['Solid tumour (no metastasis)',2],['Metastatic solid tumour',6],['Leukaemia',2],['Lymphoma',2]]},
    {id:'aids',label:'AIDS (not just HIV+)',type:'select',opts:[['No',0],['Yes',6]]},
  ],
  calc:(v)=>{
    const checks=['mi','chf2','pvd','cva','dementia','copd2','ctd','pud'];
    const s=checks.reduce((a,k)=>a+(v[k]?1:0),0)+(v.liver3||0)+(v.dm2||0)+(v.hemi||0)+(v.ckd||0)+(v.cancer3||0)+(v.aids||0);
    let risk,label,surv10;
    if(s===0){risk='low';label='CCI 0';surv10='~98%';}
    else if(s<=2){risk='low';label='Mild';surv10='~90%';}
    else if(s<=4){risk='int';label='Moderate';surv10='~53%';}
    else{risk='high';label='Severe';surv10='~21%';}
    return{score:s,max:null,risk,label:'CCI = '+s+' — '+label+' comorbidity burden',stats:[['Estimated 10yr survival',surv10],['CCI Score',s]],
      interp:'Charlson Comorbidity Index of '+s+' indicates '+label.toLowerCase()+' comorbidity burden.',
      next:s>=5?'High comorbidity burden. Treatment decisions should carefully weigh risks vs benefits. Consider geriatric/frailty assessment. May favour less intensive treatment approaches.':
      s>=3?'Moderate comorbidity. Standard treatment generally appropriate with close monitoring. Pre-treatment cardiac/renal/pulmonary function assessment recommended.':
      'Low comorbidity burden. Standard treatment approaches generally appropriate.'};
  }
},
// ─── BATCH 3: PRIORITY 1 — HIGH DAILY USE ────────────────────────────────────
flipi2: {
  id:'flipi2', name:'FLIPI-2', purpose:'Predict PFS in follicular lymphoma in the Rituximab era — better PFS discrimination than FLIPI.',
  cat:'malignant', disease:'Follicular Lymphoma', icon:'🟢',
  tags:['follicular','lymphoma','flipi2','pfs','prognosis','rituximab'],
  evidence:{source:'Federico M et al. J Clin Oncol. 2009;27(27):4555-62.',guideline:'ESMO / NCCN',year:2009,pmid:'19652063'},
  whenUse:'FL patients requiring systemic therapy in the Rituximab era for PFS prediction.',
  whenNot:'Asymptomatic FL on watch-and-wait (use FLIPI). Transformed FL.',
  limits:'Better PFS discrimination than FLIPI (C-index 0.65 vs 0.61). Requires β2-microglobulin and BM biopsy result.',
  inputs:[
    {id:'age',label:'Age >60 years',type:'check'},
    {id:'bm',label:'Bone marrow involvement',type:'check'},
    {id:'hgb',label:'Haemoglobin <12 g/dL',type:'check'},
    {id:'node',label:'Longest diameter of largest node >6 cm',type:'check'},
    {id:'b2m',label:'β2-Microglobulin above ULN',type:'check'},
  ],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;
    let risk,label,pfs,interp,next;
    if(s===0){risk='low';label='Low Risk';pfs='~79%';interp='Excellent PFS.';next='R-chemo induction + Rituximab maintenance. Excellent expected outcomes.';}
    else if(s<=2){risk='int';label='Intermediate';pfs='~51%';interp='Intermediate PFS.';next='R-Benda or R-CHOP + R maintenance. Consider PRIMA-PI for simpler assessment.';}
    else{risk='high';label='High Risk';pfs='~19%';interp='Poor PFS — early progression likely.';next='R-chemo + R maintenance. Greatest benefit from maintenance (PRIMA). Consider clinical trial.';}
    return{score:s,max:5,risk,label,stats:[['5yr PFS',pfs]],interp,next};}
},
primapi: {
  id:'primapi', name:'PRIMA-PI', purpose:'Simple bedside index for FL prognosis using only β2M and bone marrow involvement.',
  cat:'malignant', disease:'Follicular Lymphoma', icon:'🟢',
  tags:['follicular','prima','b2m','bone marrow','prognosis'],
  evidence:{source:'Bachy E et al. Blood. 2018;131(2):226-233.',guideline:'BSH / ESMO',year:2018,pmid:'29141946'},
  whenUse:'FL patients receiving first-line immunochemotherapy — requires only 2 parameters.',
  whenNot:'Watch-and-wait patients. Transformed FL.',
  limits:'Simpler than FLIPI/FLIPI-2 but less validated. Two parameters only — very easy bedside use.',
  inputs:[
    {id:'b2m',label:'β2-Microglobulin >3 mg/L',type:'check'},
    {id:'bm',label:'Bone marrow involvement',type:'check'},
  ],
  calc:(v)=>{const high=v.b2m||v.bm;
    return{score:high?'High':'Low',max:null,risk:high?'high':'low',label:high?'High Risk':'Low Risk',
      stats:[['3yr PFS',high?'~41%':'~69%']],
      interp:high?'Higher risk — shorter expected PFS.':'Good prognosis.',
      next:high?'R-chemo + Rituximab maintenance strongly recommended. Close monitoring.':'Standard R-chemo ± R maintenance. Favourable expected outcomes.'};}
},
mipib: {
  id:'mipib', name:'MIPI-b (Biologic)', purpose:'Enhanced MCL prognostic index incorporating Ki-67 proliferation index.',
  cat:'malignant', disease:'Mantle Cell Lymphoma', icon:'🟠',
  tags:['mcl','mipi','ki67','biologic','prognosis','mantle cell'],
  evidence:{source:'Hoster E et al. Blood. 2016;128(12):1566-75.',guideline:'ESMO / NCCN',year:2016,pmid:'27421960'},
  whenUse:'MCL when Ki-67 is available — provides better discrimination than standard MIPI.',
  whenNot:'When Ki-67 is not reported on pathology.',
  limits:'Requires continuous Ki-67% — some labs report categories only. Formula: MIPI-b = MIPI + 0.02879 × Ki-67%.',
  inputs:[
    {id:'age',label:'Age (years)',type:'number',min:18,max:100,step:1},
    {id:'ecog',label:'ECOG Performance Status',type:'select',opts:[['0–1',0],['2–4',1]]},
    {id:'ldh',label:'LDH (U/L — enter actual value)',type:'number',min:50,max:5000,step:1},
    {id:'wbc',label:'WBC (×10⁹/L)',type:'number',min:0.1,max:500,step:0.1},
    {id:'ki67',label:'Ki-67 (%)',type:'number',min:0,max:100,step:1},
  ],
  calc:(v)=>{if(!v.age||!v.ldh||!v.wbc) return{score:'-',max:null,risk:'info',label:'Enter all values',stats:[],interp:'',next:''};
    const mipi=0.03535*v.age+0.6978*(v.ecog||0)+1.367*Math.log10(v.ldh)+0.9393*Math.log10(v.wbc);
    const mipib=mipi+0.02879*(v.ki67||15);
    const m=Math.round(mipib*100)/100;
    let risk,label,os;
    if(m<5.7){risk='low';label='Low Risk';os='~85%';}else if(m<=6.5){risk='low';label='Low-Intermediate';os='~72%';}else if(m<=7.5){risk='int';label='High-Intermediate';os='~43%';}else{risk='high';label='High Risk';os='~17%';}
    return{score:m.toFixed(2),max:null,risk,label,stats:[['5yr OS',os],['Ki-67',v.ki67+'%'],['MIPI base',mipi.toFixed(2)]],
      interp:'MIPI-b '+m.toFixed(2)+': '+label+'.',
      next:risk==='high'?'Clinical trial preferred. Consider ibrutinib-based or BTKi combinations. TP53 mandatory. Allo-SCT discussion.':'Treatment per MIPI risk and fitness. ASCT consolidation if young/fit. Rituximab maintenance.'};}
},
binet: {
  id:'binet', name:'Binet Staging', purpose:'Stage CLL using the European Binet classification system.',
  cat:'malignant', disease:'CLL', icon:'🔵',
  tags:['cll','binet','staging','european','prognosis'],
  evidence:{source:'Binet JL et al. Cancer. 1981;48(1):198-206.',guideline:'iwCLL / BSH',year:1981,pmid:'7237385'},
  whenUse:'CLL staging — preferred in European practice alongside Rai.',
  whenNot:'SLL (use Ann Arbor). Post-treatment assessment.',
  limits:'Does not incorporate genetics. Modern treatment decisions guided by TP53/IGHV and CLL-IPI.',
  inputs:[
    {id:'areas',label:'Number of involved lymphoid areas (cervical, axillary, inguinal, spleen, liver)',type:'select',opts:[['0',0],['1',1],['2',2],['3',3],['4',4],['5',5]]},
    {id:'anemia',label:'Hb <10 g/dL (disease-related)',type:'check'},
    {id:'thrombo',label:'Platelets <100 ×10⁹/L (disease-related)',type:'check'},
  ],
  calc:(v)=>{let stage,risk,label,os;
    if(v.anemia||v.thrombo){stage='C';risk='high';label='Binet C';os='~2 yrs (historical)';}
    else if((v.areas||0)>=3){stage='B';risk='int';label='Binet B';os='~5 yrs';}
    else{stage='A';risk='low';label='Binet A';os='>10 yrs';}
    return{score:'Stage '+stage,max:null,risk,label,stats:[['Median OS (historical)',os]],
      interp:stage==='A'?'Early-stage CLL — watch and wait.':stage==='B'?'Intermediate stage — treat if symptomatic.':'Advanced stage — usually requires treatment.',
      next:stage==='A'?'Observe. FBC every 3-6 months. IGHV/TP53/FISH at baseline.':stage==='B'?'Treatment only if iwCLL criteria met. Check TP53/IGHV before therapy.':'Treatment generally indicated. TP53/IGHV mandatory. BTKi or venetoclax-based preferred over chemoimmunotherapy.'};}
},
iwcll: {
  id:'iwcll', name:'iwCLL Treatment Criteria', purpose:'Determine if a CLL patient meets criteria for treatment initiation per iwCLL 2018 guidelines.',
  cat:'malignant', disease:'CLL', icon:'🔵',
  tags:['cll','iwcll','treatment','indication','criteria'],
  evidence:{source:'Hallek M et al. Blood. 2018;131(25):2745-60.',guideline:'iwCLL 2018',year:2018,pmid:'29540348'},
  whenUse:'CLL patients being assessed for treatment initiation. At least 1 criterion must be met.',
  whenNot:'Already on treatment. Other lymphoproliferative disorders.',
  limits:'Meeting criteria does not mandate immediate treatment — discusses clinical context. Some criteria are subjective (e.g., fatigue, weight loss).',
  inputs:[
    {id:'const',label:'Progressive constitutional symptoms (weight loss ≥10%, fatigue ≥ECOG 2, fevers, night sweats)',type:'check'},
    {id:'lymph',label:'Progressive lymphocytosis (>50% increase over 2 months or LDT <6 months)',type:'check'},
    {id:'marrow',label:'Progressive marrow failure (worsening anaemia/thrombocytopenia)',type:'check'},
    {id:'organ',label:'Massive/progressive/symptomatic splenomegaly or lymphadenopathy',type:'check'},
    {id:'aiha',label:'Autoimmune cytopenia poorly responsive to steroids',type:'check'},
    {id:'extra',label:'Symptomatic extranodal involvement (skin, kidney, lung, spine)',type:'check'},
  ],
  calc:(v)=>{const n=Object.values(v).filter(Boolean).length;
    if(n===0) return{score:'0',max:null,risk:'low',label:'No Treatment Criteria Met',stats:[['Recommendation','Watch & Wait']],
      interp:'Asymptomatic CLL not meeting iwCLL criteria.',next:'Continue observation. FBC every 3-6 months. Re-assess if new symptoms develop. Ensure TP53/IGHV/FISH panel obtained at baseline for future treatment planning.'};
    return{score:n,max:null,risk:'high',label:n+' iwCLL Criterion/Criteria Present',stats:[['Recommendation','Consider Treatment']],
      interp:'At least 1 iwCLL 2018 criterion is met — treatment may be indicated.',
      next:'CONFIRM TP53 and IGHV status before starting therapy. If del17p/TP53mut: BTKi or venetoclax-based (no chemoimmunotherapy). If IGHV unmutated: BTKi or venetoclax-obinutuzumab. If IGHV mutated + fit: FCR or venetoclax-obinutuzumab (fixed-duration). Discuss options at MDT.'};}
},
dipssplus: {
  id:'dipssplus', name:'DIPSS-Plus', purpose:'Extended prognostic scoring for primary MF adding cytogenetic, transfusion, and platelet data to DIPSS.',
  cat:'malignant', disease:'Myelofibrosis', icon:'🟣',
  tags:['myelofibrosis','dipss','plus','cytogenetics','prognosis','mpn'],
  evidence:{source:'Gangat N et al. J Clin Oncol. 2011;29(4):392-7.',guideline:'NCCN / ELN',year:2011,pmid:'21149668'},
  whenUse:'Primary MF when cytogenetic data, transfusion status, and platelet count available.',
  whenNot:'Post-PV/ET MF (use MYSEC-PM). When cytogenetics unavailable (use DIPSS alone).',
  limits:'Superseded by MIPSS70+ v2 and GIPSS when molecular data available. Still widely used when NGS not performed.',
  inputs:[
    {id:'dipss',label:'DIPSS risk category',type:'select',opts:[['Low (DIPSS 0)',0],['Intermediate-1 (DIPSS 1-2)',1],['Intermediate-2 (DIPSS 3-4)',2],['High (DIPSS 5-6)',3]]},
    {id:'rbc',label:'RBC transfusion dependent',type:'check'},
    {id:'plt',label:'Platelets <100 ×10⁹/L',type:'check'},
    {id:'kary',label:'Unfavourable karyotype (+8, -7/7q-, i(17q), -5/5q-, 12p-, inv(3), 11q23)',type:'check'},
  ],
  calc:(v)=>{const s=(v.dipss||0)+(v.rbc?1:0)+(v.plt?1:0)+(v.kary?1:0);
    let risk,label,os;
    if(s===0){risk='low';label='Low Risk';os='15.4 yrs';}
    else if(s===1){risk='int';label='Intermediate-1';os='6.5 yrs';}
    else if(s<=3){risk='high';label='Intermediate-2';os='2.9 yrs';}
    else{risk='vhigh';label='High Risk';os='1.3 yrs';}
    return{score:s,max:6,risk,label,stats:[['Median OS',os]],
      interp:'DIPSS-Plus '+s+': '+label+'.',
      next:s>=2?'Transplant assessment recommended. Ruxolitinib as bridge. GIPSS/MIPSS70+ v2 if molecular data available.':'Symptom-directed therapy. Ruxolitinib for splenomegaly/symptoms. Annual reassessment.'};}
},
hasford: {
  id:'hasford', name:'Hasford (Euro) Score', purpose:'Predict survival in CML — includes eosinophils and basophils not captured by Sokal.',
  cat:'malignant', disease:'CML', icon:'🟡',
  tags:['cml','hasford','euro','prognosis','eosinophils','basophils'],
  evidence:{source:'Hasford J et al. J Natl Cancer Inst. 1998;90(11):850-8.',guideline:'ELN (historical)',year:1998,pmid:'9625174'},
  whenUse:'CML at diagnosis — adds eosinophils and basophils to prognostic assessment.',
  whenNot:'Post-TKI. Use ELTS score for TKI-era prognosis (preferred).',
  limits:'Pre-TKI era. ELTS score is now recommended for TKI-treated patients. Hasford still used in some trial protocols.',
  inputs:[
    {id:'age',label:'Age (years)',type:'number',min:18,max:100,step:1},
    {id:'spleen',label:'Spleen below costal margin (cm)',type:'number',min:0,max:40,step:1},
    {id:'blasts',label:'Blood blasts (%)',type:'number',min:0,max:30,step:0.1},
    {id:'eos',label:'Eosinophils (%)',type:'number',min:0,max:30,step:0.1},
    {id:'baso',label:'Basophils (%)',type:'number',min:0,max:30,step:0.1},
    {id:'plt',label:'Platelet count (×10⁹/L)',type:'number',min:0,max:3000,step:1},
  ],
  calc:(v)=>{if(!v.age) return{score:'-',max:null,risk:'info',label:'Enter values',stats:[],interp:'',next:''};
    const s=0.6666*((v.age>=50)?1:0)+0.0420*(v.spleen||0)+0.0584*(v.blasts||0)+0.0413*(v.eos||0)+0.2039*((v.baso||0)>=3?1:0)+1.0956*((v.plt||0)>=1500?1:0);
    const sr=Math.round(s*1000)/1000;
    let risk,label;
    if(sr<=780){risk='low';label='Low Risk';}else if(sr<=1480){risk='int';label='Intermediate Risk';}else{risk='high';label='High Risk';}
    return{score:sr.toFixed(0),max:null,risk,label,stats:[['Hasford Score',sr.toFixed(0)]],
      interp:'Hasford '+label+'. Pre-TKI era scoring system.',
      next:'Use ELTS score for TKI-era prognostication (preferred). If using Hasford: 2nd-gen TKI recommended for intermediate/high risk.'};}
},
eutos: {
  id:'eutos', name:'EUTOS Score', purpose:'Predict probability of achieving complete cytogenetic response (CCyR) by 18 months in CML.',
  cat:'malignant', disease:'CML', icon:'🟡',
  tags:['cml','eutos','ccyr','cytogenetic','response','basophils'],
  evidence:{source:'Hasford J et al. Blood. 2011;118(3):686-92.',guideline:'ELN',year:2011,pmid:'21536864'},
  whenUse:'CML at diagnosis to predict CCyR on imatinib.',
  whenNot:'Patients on 2nd-gen TKIs (less validated). Use ELTS for overall survival prediction.',
  limits:'Predicts CCyR only, not OS. Simple 2-variable score. ELTS is now preferred for overall prognostication.',
  inputs:[
    {id:'baso',label:'Basophils (%)',type:'number',min:0,max:30,step:0.1},
    {id:'spleen',label:'Spleen below costal margin (cm)',type:'number',min:0,max:40,step:1},
  ],
  calc:(v)=>{if(v.baso===undefined) return{score:'-',max:null,risk:'info',label:'Enter values',stats:[],interp:'',next:''};
    const s=7*(v.baso||0)+4*(v.spleen||0);
    const risk=s>87?'high':'low';
    return{score:Math.round(s),max:null,risk,label:s>87?'High Risk (not reaching CCyR)':'Low Risk (likely to achieve CCyR)',
      stats:[['EUTOS Score',Math.round(s)],['Cutoff','>87 = high risk']],
      interp:s>87?'High risk of not achieving CCyR at 18 months on imatinib.':'Likely to achieve CCyR on imatinib.',
      next:s>87?'2nd-generation TKI preferred over imatinib. Close molecular monitoring.':'Imatinib or 2G-TKI both appropriate. Monitor BCR::ABL1 per ELN milestones.'};}
},
r2iss: {
  id:'r2iss', name:'R2-ISS', purpose:'Second revision of ISS for myeloma — adds gain(1q) to R-ISS for better discrimination.',
  cat:'malignant', disease:'Multiple Myeloma', icon:'⚪',
  tags:['myeloma','r2iss','staging','gain1q','cytogenetics','prognosis'],
  evidence:{source:'D\'Agostino M et al. J Clin Oncol. 2022;40(29):3406-18.',guideline:'IMWG',year:2022,pmid:'35609262'},
  whenUse:'Newly diagnosed myeloma when ISS, LDH, del(17p), t(4;14), and gain(1q) are available.',
  whenNot:'MGUS or smouldering myeloma. Relapsed disease.',
  limits:'Requires gain(1q) FISH which is not performed at all centres. Provides 4 groups vs 3 for R-ISS.',
  inputs:[
    {id:'iss3',label:'ISS Stage III (β2M ≥5.5)',type:'check'},
    {id:'ldh2',label:'LDH above ULN',type:'check'},
    {id:'del17p',label:'del(17p)',type:'check'},
    {id:'t414',label:'t(4;14)',type:'check'},
    {id:'gain1q',label:'gain(1q) — scores 0.5 points',type:'check'},
  ],
  calc:(v)=>{const s=(v.iss3?1:0)+(v.ldh2?1:0)+(v.del17p?1:0)+(v.t414?1:0)+(v.gain1q?0.5:0);
    let risk,label,os;
    if(s<=0){risk='low';label='R2-ISS Stage I';os='~82%';}
    else if(s<=1){risk='low';label='R2-ISS Stage II';os='~73%';}
    else if(s<=2.5){risk='int';label:'R2-ISS Stage III';os='~60%';}
    else{risk='high';label='R2-ISS Stage IV';os='~33%';}
    return{score:s,max:null,risk,label,stats:[['5yr OS',os],['R2-ISS Score',s]],
      interp:'R2-ISS '+label+'. Adds gain(1q) to R-ISS for better ultra-high-risk identification.',
      next:risk==='high'?'Ultra-high risk. Consider intensified therapy, tandem ASCT, clinical trial. VRd preferred induction. Discuss maintenance intensification.':'Risk-adapted therapy per local protocol. VRd induction standard. ASCT if eligible.'};}
},
mgus: {
  id:'mgus', name:'Mayo MGUS Risk Score', purpose:'Predict risk of MGUS progression to myeloma or related malignancy.',
  cat:'malignant', disease:'MGUS', icon:'⚪',
  tags:['mgus','progression','myeloma','risk','monoclonal','gammopathy'],
  evidence:{source:'Rajkumar SV et al. Blood. 2005;106(3):812-7.',guideline:'IMWG / BSH',year:2005,pmid:'15855274'},
  whenUse:'Newly diagnosed MGUS to stratify progression risk and guide monitoring frequency.',
  whenNot:'Known myeloma or smouldering myeloma. AL amyloidosis.',
  limits:'Does not account for specific immunoglobulin isotype behaviour or free light chain ratio trajectory over time.',
  inputs:[
    {id:'mprotein',label:'M-protein ≥1.5 g/dL',type:'check'},
    {id:'nonIgG',label:'Non-IgG isotype (IgA, IgM, or light chain)',type:'check'},
    {id:'flcr',label:'Abnormal free light chain ratio (<0.26 or >1.65)',type:'check'},
  ],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;
    let risk,label,prog20yr;
    if(s===0){risk='low';label='Low Risk';prog20yr='~5%';}
    else if(s===1){risk='int';label:'Low-Intermediate';prog20yr='~21%';}
    else if(s===2){risk='int';label:'High-Intermediate';prog20yr='~37%';}
    else{risk='high';label:'High Risk';prog20yr='~58%';}
    return{score:s,max:3,risk,label,stats:[['20yr progression risk',prog20yr]],
      interp:s===0?'Very low risk of progression.':s>=2?'Higher risk — closer monitoring required.':'Moderate risk.',
      next:s<=1?'Monitor annually: FBC, calcium, renal, electrophoresis, FLC. Educate patient on symptoms of progression (bone pain, fatigue, recurrent infections).':'Monitor every 6 months. Low threshold for bone marrow biopsy and imaging if any change. Consider haematology follow-up.'};}
},
smm: {
  id:'smm', name:'20/2/20 SMM Risk Model', purpose:'Predict risk of progression from smouldering myeloma to active myeloma.',
  cat:'malignant', disease:'Smouldering Myeloma', icon:'⚪',
  tags:['smouldering','myeloma','smm','progression','20/2/20'],
  evidence:{source:'Mateos MV et al. Blood Cancer J. 2020;10(10):102.',guideline:'IMWG',year:2020,pmid:'33067414'},
  whenUse:'Smouldering myeloma to stratify progression risk and guide monitoring/trial eligibility.',
  whenNot:'Already diagnosed active myeloma. MGUS (use Mayo MGUS score).',
  limits:'Does not include cytogenetics or molecular data. Defines groups for clinical trial eligibility (high-risk SMM trials).',
  inputs:[
    {id:'mprotein2',label:'M-protein ≥2 g/dL',type:'check'},
    {id:'flcr2',label:'Involved/uninvolved FLC ratio ≥20',type:'check'},
    {id:'bm',label:'Bone marrow plasma cells ≥20%',type:'check'},
  ],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;
    let risk,label,prog2yr;
    if(s===0){risk='low';label='Low Risk';prog2yr='~10%';}
    else if(s===1){risk:'int';label:'Intermediate Risk';prog2yr='~26%';}
    else{risk='high';label:'High Risk';prog2yr='~44–50%';}
    return{score:s,max:3,risk,label,stats:[['2yr progression rate',prog2yr]],
      interp:s===0?'Low risk of progression within 2 years.':'Higher risk — consider closer monitoring or clinical trial.',
      next:s>=2?'High-risk SMM. Consider clinical trial (lenalidomide-based early intervention — QuiRedex, E3A06). Monitor every 2-3 months with labs + imaging.':'Monitor every 3-6 months: FBC, calcium, renal, electrophoresis, FLC. Annual whole-body MRI or PET-CT.'};}
},
hctci: {
  id:'hctci', name:'HCT-CI', purpose:'Predict non-relapse mortality after allogeneic stem cell transplantation based on comorbidities.',
  cat:'malignant', disease:'Transplant', icon:'🔄',
  tags:['hctci','transplant','comorbidity','allogeneic','sct','mortality'],
  evidence:{source:'Sorror ML et al. Blood. 2005;106(8):2912-9.',guideline:'EBMT / CIBMTR',year:2005,pmid:'15994282'},
  whenUse:'Evaluating fitness for allogeneic SCT — used alongside disease risk index (DRI).',
  whenNot:'Autologous SCT (less validated). As sole transplant eligibility criterion.',
  limits:'Does not account for donor factors, conditioning intensity, or disease risk. Use with DRI and EBMT score for comprehensive assessment.',
  inputs:[
    {id:'arrhy',label:'Arrhythmia (AF, flutter, SSS, ventricular)',type:'check'},
    {id:'cardiac',label:'Cardiac disease (CAD, CHF, MI, EF ≤50%)',type:'check'},
    {id:'inflam',label:'Inflammatory bowel disease',type:'check'},
    {id:'dm3',label:'Diabetes (requiring treatment)',type:'check'},
    {id:'cvd',label:'Cerebrovascular disease',type:'check'},
    {id:'psych',label:'Psychiatric disturbance (requiring treatment)',type:'check'},
    {id:'hepat',label:'Hepatic disease (mild: chronic hepatitis/bilirubin >ULN; moderate-severe: cirrhosis)',type:'select',opts:[['None',0],['Mild',1],['Moderate-severe',3]]},
    {id:'obesity',label:'Obesity (BMI ≥35)',type:'check'},
    {id:'infection',label:'Infection requiring treatment at time of SCT',type:'check'},
    {id:'pulm',label:'Pulmonary (moderate: DLco/FEV1 66-80%; severe: ≤65% or O₂ requirement)',type:'select',opts:[['None',0],['Moderate',2],['Severe',3]]},
    {id:'renal3',label:'Renal impairment (Cr >2 mg/dL or on dialysis)',type:'select',opts:[['None',0],['Moderate (Cr >2)',2],['On dialysis',3]]},
    {id:'tumour',label:'Prior solid tumour (treated at any time)',type:'select',opts:[['None',0],['Yes',3]]},
    {id:'valve',label:'Valvular heart disease (except mitral valve prolapse)',type:'check'},
  ],
  calc:(v)=>{const checks=['arrhy','cardiac','inflam','dm3','cvd','psych','obesity','infection','valve'];
    const s=checks.reduce((a,k)=>a+(v[k]?1:0),0)+(v.hepat||0)+(v.pulm||0)+(v.renal3||0)+(v.tumour||0);
    let risk,label,nrm;
    if(s===0){risk='low';label='Low Risk';nrm='~14%';}
    else if(s<=2){risk='int';label='Intermediate Risk';nrm='~21%';}
    else{risk='high';label='High Risk';nrm='~41%';}
    return{score:s,max:null,risk,label,stats:[['2yr NRM',nrm],['HCT-CI Score',s]],
      interp:'HCT-CI '+s+': '+label+' for transplant-related mortality.',
      next:s>=3?'High NRM risk. Discuss risk-benefit carefully. Consider reduced-intensity conditioning. Alternative therapies if available. Goals of care discussion.':'Transplant comorbidity risk acceptable. Proceed with transplant workup. Conditioning intensity per protocol.'};}
},
ferritin: {
  id:'ferritin', name:'Ferritin Interpreter', purpose:'Systematic differential diagnosis of hyperferritinaemia based on ferritin level and clinical context.',
  cat:'benign', disease:'Hyperferritinaemia', icon:'🔬',
  tags:['ferritin','iron','hlh','still','overload','inflammation'],
  evidence:{source:'Multiple: Rosário C et al. BMC Med. 2013;11:185.',guideline:'Expert Consensus / BSH',year:2013,pmid:'23968282'},
  whenUse:'Unexplained elevated ferritin — systematic approach to differential diagnosis.',
  whenNot:'Known iron overload on treatment. Isolated mildly elevated ferritin without clinical concern.',
  limits:'Ferritin is an acute phase reactant. Clinical context is essential. Glycosylated ferritin <20% suggests HLH/AOSD.',
  inputs:[
    {id:'val',label:'Ferritin level (µg/L)',type:'number',min:0,max:1000000,step:1},
    {id:'fever',label:'Fever present',type:'check'},
    {id:'spleen2',label:'Hepatosplenomegaly',type:'check'},
    {id:'cyto2',label:'Cytopenias (≥2 lineages)',type:'check'},
    {id:'trig2',label:'Hypertriglyceridaemia',type:'check'},
    {id:'rash',label:'Evanescent rash',type:'check'},
    {id:'joint',label:'Arthralgia/arthritis',type:'check'},
  ],
  calc:(v)=>{if(!v.val) return{score:'-',max:null,risk:'info',label:'Enter ferritin value',stats:[],interp:'',next:''};
    const f=v.val;
    const hlhFeatures=(v.fever?1:0)+(v.spleen2?1:0)+(v.cyto2?1:0)+(v.trig2?1:0);
    const aosdFeatures=(v.rash?1:0)+(v.joint?1:0);
    let risk,label,interp,next;
    if(f>50000){risk='vhigh';label='Extreme Hyperferritinaemia (>50,000)';
      interp='Ferritin >50,000: sensitivity 97%, specificity 99% for HLH.';
      next='CALCULATE HSCORE IMMEDIATELY. Urgent haematology consultation. Consider empirical dexamethasone. Send sCD25, triglycerides, fibrinogen.';}
    else if(f>10000){risk='high';label='Severe Hyperferritinaemia (>10,000)';
      interp=hlhFeatures>=3?'Clinical features strongly suggest HLH/MAS.':aosdFeatures>=2?'Consider Adult-onset Still\'s Disease (AOSD).':'Differential: HLH, AOSD, sepsis, hepatic failure, haemochromatosis.';
      next='Urgent workup: HScore, sCD25/sIL-2R, glycosylated ferritin (<20% suggests HLH/AOSD), liver screen, infection screen, haematology opinion.';}
    else if(f>1000){risk='int';label='Moderate Hyperferritinaemia (1000–10,000)';
      interp='Broad differential: inflammation, infection, liver disease, iron overload, malignancy, renal failure.';
      next='Check: CRP (inflammation), liver function (hepatitis/liver disease), transferrin saturation (>45% = true iron overload), infection screen. If Tsat >45%: consider HFE genotyping.';}
    else if(f>300){risk='low';label='Mildly Elevated Ferritin';
      interp='Common causes: inflammation, metabolic syndrome, alcohol, liver disease, iron overload.';
      next='Check transferrin saturation: if >45% with elevated ferritin, investigate iron overload (HFE genotyping, liver MRI). If Tsat normal: likely reactive/inflammatory.';}
    else{risk='low';label='Normal/Low Ferritin';interp='Ferritin within or below normal range.';
      next=f<30?'Ferritin <30 µg/L: iron deficiency confirmed. Investigate cause (menstrual loss, GI, dietary). Oral iron (ferrous sulphate 200mg OD). Consider IV iron if oral intolerant/malabsorption.':'Normal ferritin. No action required for iron status.';}
    return{score:f,max:null,risk,label,stats:[['Ferritin',f+' µg/L']],interp,next};}
},
wellsdvt: {
  id:'wellsdvt', name:'Wells DVT Score', purpose:'Assess pre-test probability of deep vein thrombosis to guide diagnostic workup.',
  cat:'benign', disease:'DVT', icon:'🦵',
  tags:['dvt','wells','thrombosis','vte','ultrasound','d-dimer'],
  evidence:{source:'Wells PS et al. Lancet. 1997;350(9094):1795-8.',guideline:'NICE / ACCP',year:1997,pmid:'9428249'},
  whenUse:'Suspected DVT — to determine need for D-dimer vs direct ultrasound.',
  whenNot:'Upper limb DVT (different criteria). Confirmed DVT. Pregnancy (modified approach).',
  limits:'Subjective component ("alternative diagnosis as likely"). Must use in combination with D-dimer or ultrasound — not standalone.',
  inputs:[
    {id:'cancer',label:'Active cancer (treatment within 6mo or palliative)',type:'check'},
    {id:'immob',label:'Paralysis/paresis/recent plaster immobilisation of lower extremity',type:'check'},
    {id:'bed',label:'Recently bedridden ≥3 days or major surgery within 12 weeks',type:'check'},
    {id:'tender',label:'Localised tenderness along deep venous system',type:'check'},
    {id:'swell',label:'Entire leg swollen',type:'check'},
    {id:'calf',label:'Calf swelling >3 cm compared to asymptomatic leg',type:'check'},
    {id:'pitting',label:'Pitting oedema (greater in symptomatic leg)',type:'check'},
    {id:'collat',label:'Collateral superficial veins (non-varicose)',type:'check'},
    {id:'prev',label:'Previous documented DVT',type:'check'},
    {id:'alt',label:'Alternative diagnosis at least as likely — SUBTRACT 2 points',type:'check'},
  ],
  calc:(v)=>{const s=(v.cancer?1:0)+(v.immob?1:0)+(v.bed?1:0)+(v.tender?1:0)+(v.swell?1:0)+(v.calf?1:0)+(v.pitting?1:0)+(v.collat?1:0)+(v.prev?1:0)-(v.alt?2:0);
    let risk,label,interp,next;
    if(s<=1){risk='low';label='DVT Unlikely (Score ≤1)';interp='Low pre-test probability.';next='Check D-dimer. If NEGATIVE: DVT excluded (NPV >98%). If POSITIVE: proceed to compression ultrasound.';}
    else{risk='high';label='DVT Likely (Score ≥2)';interp='Moderate-high pre-test probability.';next='Proceed to proximal compression ULTRASOUND directly. D-dimer is insufficient to exclude. If US negative but high clinical suspicion: repeat US in 7 days or consider whole-leg US.';}
    return{score:s,max:9,risk,label,stats:[['Wells DVT Score',s]],interp,next};}
},
abg: {
  id:'abg', name:'ABG Interpreter', purpose:'Systematic analysis of arterial blood gas — pH, primary disorder, compensation, anion gap, oxygenation.',
  cat:'general', disease:'Acid-Base', icon:'🫁',
  tags:['abg','arterial','blood gas','acidosis','alkalosis','anion gap','respiratory'],
  evidence:{source:'Standard acid-base physiology. Haber RJ. JAMA. 1991;266(6):812-5.',guideline:'Clinical Practice',year:1991,pmid:'1907670'},
  whenUse:'Any ABG result requiring systematic interpretation. Acutely unwell patients.',
  whenNot:'Venous blood gas (different reference ranges for pO₂). As sole assessment without clinical context.',
  limits:'A-a gradient calculation assumes room air (FiO₂ 0.21). Compensation assessment uses Winter\'s formula for metabolic acidosis only.',
  inputs:[
    {id:'ph',label:'pH',type:'number',min:6.8,max:7.8,step:0.01},
    {id:'pco2',label:'pCO₂ (mmHg)',type:'number',min:10,max:120,step:0.1},
    {id:'hco3',label:'HCO₃ (mmol/L)',type:'number',min:2,max:50,step:0.1},
    {id:'po2',label:'pO₂ (mmHg)',type:'number',min:20,max:600,step:1},
    {id:'na2',label:'Sodium (mmol/L)',type:'number',min:100,max:170,step:1},
    {id:'cl',label:'Chloride (mmol/L)',type:'number',min:70,max:130,step:1},
  ],
  calc:(v)=>{if(!v.ph||!v.pco2||!v.hco3) return{score:'-',max:null,risk:'info',label:'Enter ABG values',stats:[],interp:'',next:''};
    let primary='',driver='';
    if(v.ph<7.35)primary=v.ph<7.2?'Severe Acidaemia':'Acidaemia';
    else if(v.ph>7.45)primary='Alkalaemia';
    else primary='Normal pH';
    if(v.pco2>45&&v.hco3<=26)driver='Respiratory acidosis';
    else if(v.hco3<22&&v.pco2<35)driver='Metabolic acidosis';
    else if(v.hco3>26)driver='Metabolic alkalosis';
    else if(v.pco2<35)driver='Respiratory alkalosis';
    else driver='Normal';
    const ag=(v.na2||140)-((v.cl||105)+(v.hco3||24));
    const agNote=ag>12?'HIGH AG ('+ag+') — HAGMA: MUDPILES':'Normal AG ('+ag+')';
    let comp='';
    if(v.hco3<22){const expL=1.5*v.hco3+6,expH=1.5*v.hco3+10;
      if(v.pco2<expL)comp='+ Superimposed Resp Alkalosis';else if(v.pco2>expH)comp='+ Superimposed Resp Acidosis';else comp='Appropriate compensation';}
    const risk=v.ph<7.2?'vhigh':v.ph<7.35?'high':v.ph>7.45?'int':'low';
    return{score:v.ph,max:null,risk,label:primary+(driver!=='Normal'?' — '+driver:''),
      stats:[['pH',v.ph],['pCO₂',v.pco2+' mmHg'],['HCO₃',v.hco3+' mmol/L'],['Anion Gap',agNote],['pO₂',(v.po2||'—')+' mmHg']],
      interp:'Primary: '+driver+'. '+agNote+'.'+(comp?' Compensation: '+comp+'.':''),
      next:ag>12?'HAGMA differential — MUDPILES: Methanol, Uraemia, DKA, Propylene glycol, Isoniazid/Iron, Lactic acidosis, Ethanol/Ethylene glycol, Salicylates. Check lactate, glucose, ketones, toxicology screen.':
      driver.includes('Metabolic acidosis')?'Normal AG metabolic acidosis: consider diarrhoea, RTA, Addison\'s, acetazolamide. Check urine electrolytes.':
      'Systematic ABG interpretation complete. Correlate with clinical picture.'};}
},
aniongap: {
  id:'aniongap', name:'Anion Gap + Delta-Delta', purpose:'Calculate serum anion gap with albumin correction and delta ratio for mixed acid-base disorders.',
  cat:'general', disease:'Electrolytes', icon:'⚗️',
  tags:['anion gap','delta','ratio','metabolic acidosis','hagma','electrolyte'],
  evidence:{source:'Oh MS, Carroll HJ. N Engl J Med. 1977;297:814.',guideline:'Clinical Practice',year:1977,pmid:''},
  whenUse:'Metabolic acidosis workup. Any unexplained acid-base disturbance.',
  whenNot:'Without concurrent electrolyte panel.',
  limits:'Normal AG range varies by laboratory (8-12 typical). Albumin correction essential in hypoalbuminaemic patients (very common in hospital).',
  inputs:[
    {id:'na3',label:'Sodium (mmol/L)',type:'number',min:100,max:170,step:1},
    {id:'cl2',label:'Chloride (mmol/L)',type:'number',min:70,max:130,step:1},
    {id:'hco3b',label:'Bicarbonate (mmol/L)',type:'number',min:2,max:50,step:0.1},
    {id:'alb4',label:'Albumin (g/L) — for correction',type:'number',min:5,max:60,step:1},
  ],
  calc:(v)=>{if(!v.na3||!v.cl2||!v.hco3b) return{score:'-',max:null,risk:'info',label:'Enter electrolytes',stats:[],interp:'',next:''};
    const ag=v.na3-v.cl2-v.hco3b;
    const corrAG=ag+0.25*(40-(v.alb4||40));
    const deltaAG=corrAG-12;
    const deltaHCO3=24-v.hco3b;
    const ratio=deltaHCO3>0?(deltaAG/deltaHCO3).toFixed(1):'N/A';
    let risk=corrAG>12?'high':'low';
    return{score:corrAG.toFixed(1),max:null,risk,
      label:corrAG>12?'HIGH Anion Gap ('+corrAG.toFixed(1)+')':'Normal Anion Gap ('+corrAG.toFixed(1)+')',
      stats:[['Corrected AG',corrAG.toFixed(1)],['Uncorrected AG',ag],['Delta Ratio',ratio]],
      interp:corrAG>12?'Elevated anion gap — HAGMA. Delta ratio: '+ratio+(ratio!=='N/A'&&parseFloat(ratio)>2?' (concurrent metabolic alkalosis likely)':ratio!=='N/A'&&parseFloat(ratio)<1?' (concurrent NAGMA likely)':' (pure HAGMA)'):'.',
      next:corrAG>12?'HAGMA differential (MUDPILES): check lactate, glucose/ketones, renal function, salicylate level, toxicology. Delta ratio helps identify mixed disorders.':'Normal AG metabolic acidosis if HCO₃ low: consider diarrhoea, RTA (types 1,2,4), Addison\'s.'};}
},
corrna: {
  id:'corrna', name:'Corrected Sodium', purpose:'Calculate true sodium level in hyperglycaemia by correcting for glucose-induced dilutional effect.',
  cat:'general', disease:'Electrolytes', icon:'⚗️',
  tags:['sodium','correction','hyperglycaemia','dka','glucose','electrolyte'],
  evidence:{source:'Katz MA. N Engl J Med. 1973;289(16):843-4.',guideline:'Clinical Practice',year:1973,pmid:'4763428'},
  whenUse:'Interpreting sodium in the setting of hyperglycaemia (DKA, HHS). Sodium falls ~2.4 mmol/L per 5.5 mmol/L rise in glucose above 5.5.',
  whenNot:'Normal glucose levels. Pseudohyponatraemia (hyperlipidaemia, hyperproteinaemia).',
  limits:'Multiple correction factors exist (1.6 or 2.4 per 100 mg/dL glucose rise). The 2.4 factor is more accurate at higher glucose levels.',
  inputs:[
    {id:'na4',label:'Measured sodium (mmol/L)',type:'number',min:100,max:170,step:1},
    {id:'gluc',label:'Glucose (mmol/L)',type:'number',min:1,max:100,step:0.1},
  ],
  calc:(v)=>{if(!v.na4||!v.gluc) return{score:'-',max:null,risk:'info',label:'Enter sodium and glucose',stats:[],interp:'',next:''};
    const corrNa=v.na4+2.4*((v.gluc-5.5)/5.5);
    const c=Math.round(corrNa*10)/10;
    let risk,label;
    if(c<130){risk='high';label='True Hyponatraemia (corrected <130)';}
    else if(c<=145){risk='low';label='Normal corrected sodium';}
    else{risk='int';label='Hypernatraemia (corrected >145)';}
    return{score:c.toFixed(1),max:null,risk,label,
      stats:[['Corrected Na⁺',c.toFixed(1)+' mmol/L'],['Measured Na⁺',v.na4+' mmol/L'],['Glucose',v.gluc+' mmol/L']],
      interp:'Corrected sodium accounts for dilutional effect of hyperglycaemia. Formula: Na + 2.4 × ((glucose-5.5)/5.5).',
      next:c<130?'True hyponatraemia despite hyperglycaemia. Investigate cause. In DKA: sodium should rise as glucose falls — if it doesn\'t, investigate separately.':c>145?'True hypernatraemia. In HHS: significant free water deficit. Careful rehydration with 0.45% saline when appropriate.':'Sodium is normal when corrected for glucose. As glucose normalises with treatment, sodium should remain stable.'};}
},
akikdigo: {
  id:'akikdigo', name:'AKI Staging (KDIGO)', purpose:'Stage acute kidney injury severity using KDIGO creatinine and urine output criteria.',
  cat:'general', disease:'Renal', icon:'🏔️',
  tags:['aki','kdigo','acute','kidney','injury','creatinine','staging'],
  evidence:{source:'KDIGO AKI Guideline. Kidney Int Suppl. 2012;2(1):1-138.',guideline:'KDIGO 2012',year:2012,pmid:''},
  whenUse:'Any acute rise in creatinine or fall in urine output to classify AKI severity.',
  whenNot:'Chronic kidney disease without acute change. Isolated elevated creatinine without baseline.',
  limits:'Requires baseline creatinine for staging. Urine output criteria require accurate measurement (catheter). Creatinine lags behind actual GFR changes.',
  inputs:[
    {id:'crBase',label:'Baseline creatinine (µmol/L) — or lowest in last 7 days',type:'number',min:20,max:1000,step:1},
    {id:'crCurrent',label:'Current creatinine (µmol/L)',type:'number',min:20,max:2000,step:1},
    {id:'uo',label:'Urine output criteria',type:'select',opts:[['≥0.5 mL/kg/hr',0],['<0.5 mL/kg/hr for 6-12 hours (Stage 1)',1],['<0.5 mL/kg/hr for ≥12 hours (Stage 2)',2],['<0.3 mL/kg/hr for ≥24 hours OR anuria ≥12 hours (Stage 3)',3]]},
  ],
  calc:(v)=>{if(!v.crBase||!v.crCurrent) return{score:'-',max:null,risk:'info',label:'Enter baseline and current creatinine',stats:[],interp:'',next:''};
    const ratio=v.crCurrent/v.crBase;const rise=v.crCurrent-v.crBase;
    let crStage=0;
    if(ratio>=3||v.crCurrent>=354||(v.crCurrent>=354&&rise>=44))crStage=3;
    else if(ratio>=2)crStage=2;
    else if(rise>=26.5||ratio>=1.5)crStage=1;
    const stage=Math.max(crStage,v.uo||0);
    let risk,label,interp,next;
    if(stage===0){risk='low';label='No AKI';interp='Creatinine change does not meet KDIGO AKI criteria.';next='Continue monitoring if clinical concern. Ensure adequate hydration. Avoid nephrotoxins.';}
    else if(stage===1){risk='int';label='AKI Stage 1';interp='Mild acute kidney injury.';next='Identify and treat cause: hypovolaemia, nephrotoxins, obstruction. Fluid resuscitation if appropriate. Hold nephrotoxic drugs (NSAIDs, ACEi/ARB, aminoglycosides). Monitor creatinine 12-24 hourly.';}
    else if(stage===2){risk='high';label='AKI Stage 2';interp='Moderate acute kidney injury.';next='Urgent fluid assessment. Consider renal referral. Drug dose adjustments. Urinary catheter for accurate output monitoring. Check potassium urgently. Renal ultrasound if obstruction suspected.';}
    else{risk='vhigh';label='AKI Stage 3';interp='Severe AKI — consider renal replacement therapy.';next='URGENT RENAL REFERRAL. Indications for dialysis: refractory hyperkalaemia, severe acidosis, fluid overload, uraemic symptoms. Continuous monitoring. All drug doses require review.';}
    return{score:'Stage '+stage,max:3,risk,label,stats:[['AKI Stage',stage],['Cr Rise',rise+' µmol/L'],['Cr Ratio',ratio.toFixed(1)+'×']],interp,next};}
},
// ─── BATCH 4: PRIORITY 2-3 — COMPLETENESS ────────────────────────────────────
mysecpm: {
  id:'mysecpm', name:'MYSEC-PM', purpose:'Predict survival in secondary myelofibrosis (post-PV or post-ET MF).',
  cat:'malignant', disease:'Secondary MF', icon:'🟣',
  tags:['myelofibrosis','mysec','post-pv','post-et','secondary','mpn'],
  evidence:{source:'Passamonti F et al. Leukemia. 2017;31(12):2726-31.',guideline:'ELN / NCCN',year:2017,pmid:'28561069'},
  whenUse:'Myelofibrosis arising from prior PV or ET (post-PV MF, post-ET MF). NOT for primary MF.',
  whenNot:'Primary myelofibrosis (use DIPSS/DIPSS-Plus/GIPSS). Pre-fibrotic MPN.',
  limits:'Specific to secondary MF only. Does not include molecular data beyond CALR.',
  inputs:[
    {id:'hgb',label:'Haemoglobin <11 g/dL',type:'check'},{id:'plt',label:'Platelets <150 ×10⁹/L',type:'check'},
    {id:'blasts',label:'Circulating blasts ≥3%',type:'check'},{id:'calr',label:'CALR mutation absent (JAK2 or MPL or triple-neg)',type:'check'},
    {id:'const',label:'Constitutional symptoms',type:'check'},{id:'age',label:'Age (years)',type:'number',min:18,max:100,step:1},
  ],
  calc:(v)=>{const s=(v.hgb?2:0)+(v.plt?1:0)+(v.blasts?2:0)+(v.calr?2:0)+(v.const?1:0)+((v.age||60)*0.05);
    const sr=Math.round(s*10)/10;
    let risk,label,os;
    if(sr<11){risk='low';label='Low Risk';os='Not reached';}else if(sr<14){risk='int';label='Intermediate-1';os='~9.3 yrs';}
    else if(sr<16){risk='high';label='Intermediate-2';os='~4.4 yrs';}else{risk='vhigh';label='High Risk';os='~2 yrs';}
    return{score:sr,max:null,risk,label,stats:[['Median OS',os],['MYSEC-PM',sr]],
      interp:'MYSEC-PM '+label+' for secondary (post-PV/ET) myelofibrosis.',
      next:sr>=14?'Transplant assessment recommended. Ruxolitinib as bridge therapy.':'Symptom-directed management. Ruxolitinib for splenomegaly/symptoms. Regular monitoring.'};}
},
elnCml: {
  id:'elnCml', name:'ELN CML Response Milestones', purpose:'Assess TKI treatment response at defined time points per ELN 2020 guidelines.',
  cat:'malignant', disease:'CML', icon:'🟡',
  tags:['cml','eln','milestones','response','bcr-abl','tki','monitoring'],
  evidence:{source:'Hochhaus A et al. Leukemia. 2020;34(4):966-84.',guideline:'ELN 2020',year:2020,pmid:'32127639'},
  whenUse:'CML chronic phase on TKI therapy — assess BCR::ABL1 response at 3, 6, and 12 months.',
  whenNot:'Blast crisis or accelerated phase (different management). Before starting TKI.',
  limits:'Optimal/warning/failure definitions guide management changes. BCR::ABL1 should be measured on International Scale (IS).',
  inputs:[
    {id:'time',label:'Time point on TKI',type:'select',opts:[['3 months',3],['6 months',6],['12 months',12],['Any time after 12 months',18]]},
    {id:'bcrabl',label:'BCR::ABL1 (IS) level',type:'select',opts:[['≤0.1% (MMR/MR3)',0.1],['0.1–1%',1],['>1–10%',10],['>10%',100],['Loss of previously achieved response',999]]},
  ],
  calc:(v)=>{const t=v.time,b=v.bcrabl;let risk,label,interp,next;
    if(t===3){
      if(b<=10){risk='low';label='Optimal Response at 3 months';interp='BCR::ABL1 ≤10% IS at 3 months — on track.';next='Continue current TKI. Repeat BCR::ABL1 at 6 months.';}
      else if(b<=100&&b>10){risk='int';label='Warning at 3 months';interp='BCR::ABL1 >10% at 3 months — suboptimal.';next='Check adherence. Repeat BCR::ABL1 in 1-3 months. Consider mutation analysis. May need TKI switch if no improvement.';}
      else{risk='high';label='Failure at 3 months';interp='No cytogenetic response or BCR::ABL1 >10%.';next='Switch TKI. ABL1 mutation analysis mandatory. If T315I mutation: ponatinib or asciminib. Re-assess ELTS risk.';}
    }else if(t===6){
      if(b<=1){risk='low';label='Optimal at 6 months';interp='BCR::ABL1 ≤1% — excellent response.';next='Continue TKI. Target MMR (≤0.1%) at 12 months.';}
      else if(b<=10){risk='int';label='Warning at 6 months';interp='BCR::ABL1 1-10% — suboptimal.';next='Close monitoring. Consider mutation analysis. TKI switch if no improvement by next assessment.';}
      else{risk='high';label='Failure at 6 months';interp='BCR::ABL1 >10% at 6 months.';next='SWITCH TKI. Mutation analysis mandatory. Consider 2nd or 3rd generation TKI based on mutation profile.';}
    }else if(t===12){
      if(b<=0.1){risk='low';label='Optimal at 12 months (MMR)';interp='Major Molecular Response achieved.';next='Continue TKI. Monitor BCR::ABL1 every 3-6 months. If sustained MR4 (≤0.01%) for ≥2 years: consider Treatment-Free Remission (TFR) trial.';}
      else if(b<=1){risk='int';label='Warning at 12 months';interp='BCR::ABL1 0.1-1% — close to MMR but not achieved.';next='Continue or optimise TKI dose. Repeat at 3 months. Consider switch if persistent.';}
      else{risk='high';label='Failure at 12 months';interp='No MMR at 12 months.';next='Switch TKI. Mutation analysis. Consider allogeneic SCT discussion if 2nd-line TKI also fails.';}
    }else{
      if(b<=0.1){risk='low';label='Sustained MMR';interp='Optimal ongoing response.';next='Continue monitoring every 3-6 months. Discuss TFR if MR4 sustained ≥2 years on 2G-TKI or ≥3 years on imatinib.';}
      else if(b===999){risk='high';label='Loss of Response';interp='Loss of previously achieved milestone.';next='URGENT: mutation analysis. Switch TKI. Consider transplant referral if T315I or compound mutations. Compliance check.';}
      else{risk='int';label:'Suboptimal/Loss of MMR';interp='BCR::ABL1 rising above 0.1%.';next='Repeat in 1-3 months. If confirmed loss: mutation analysis, TKI switch consideration.';}
    }
    return{score:b<=0.1?'MMR':b<=1?'<1%':b<=10?'1-10%':b===999?'Loss':'>10%',max:null,risk,label,stats:[['Time',t+' months'],['BCR::ABL1',b===999?'Loss of response':b+'% IS']],interp,next};}
},
isswm: {
  id:'isswm', name:'ISSWM', purpose:'Predict overall survival in Waldenström macroglobulinaemia / lymphoplasmacytic lymphoma.',
  cat:'malignant', disease:"Waldenström's", icon:'🔵',
  tags:['waldenstrom','wm','lpl','igm','isswm','prognosis'],
  evidence:{source:'Morel P et al. Blood. 2009;113(18):4163-70.',guideline:'NCCN / ESMO',year:2009,pmid:'19196866'},
  whenUse:'Newly diagnosed WM/LPL requiring treatment stratification.',whenNot:'IgM MGUS. Non-WM lymphoma with IgM paraprotein.',
  limits:'Does not include MYD88 or CXCR4 mutation status. MYD88 L265P guides therapy selection (BTKi response).',
  inputs:[{id:'age',label:'Age >65 years',type:'check'},{id:'hgb',label:'Haemoglobin ≤11.5 g/dL',type:'check'},
    {id:'plt',label:'Platelets ≤100 ×10⁹/L',type:'check'},{id:'b2m',label:'β2-Microglobulin >3 mg/L',type:'check'},
    {id:'igm',label:'Serum IgM >7 g/dL',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;const ageOnly=v.age&&s===1;
    let risk,label,os;
    if(s===0){risk='low';label='Low Risk';os='87% at 5yr';}else if(s<=2||ageOnly){risk='int';label='Intermediate';os='68% at 5yr';}
    else{risk='high';label='High Risk';os='36% at 5yr';}
    return{score:s,max:5,risk,label,stats:[['5yr OS',os]],
      interp:'ISSWM '+label+'.',next:'Check MYD88 L265P and CXCR4 status (guides BTKi response). Treatment: BR, DRC, or BTKi-based (ibrutinib/zanubrutinib) depending on mutation status and fitness.'};}
},
pit: {
  id:'pit', name:'PIT Score', purpose:'Predict overall survival in peripheral T-cell lymphoma, not otherwise specified (PTCL-NOS).',
  cat:'malignant', disease:'T-Cell Lymphoma', icon:'🟤',
  tags:['ptcl','pit','t-cell','lymphoma','prognosis'],
  evidence:{source:'Gallamini A et al. Blood. 2004;103(7):2474-9.',guideline:'NCCN / ESMO',year:2004,pmid:'14645001'},
  whenUse:'PTCL-NOS at diagnosis. Validated specifically for PTCL-NOS.',whenNot:'ALK+ ALCL (better prognosis). Other T-cell subtypes (AITL, EATL) — use with caution.',
  limits:'Validated for PTCL-NOS only. Small validation cohorts. Does not include molecular markers.',
  inputs:[{id:'age',label:'Age >60 years',type:'check'},{id:'ldh',label:'LDH above ULN',type:'check'},
    {id:'ecog',label:'ECOG PS ≥2',type:'check'},{id:'bm',label:'Bone marrow involvement',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;let risk,label,os;
    if(s===0){risk='low';label='Group 1';os='~62%';}else if(s===1){risk='int';label='Group 2';os='~53%';}
    else if(s===2){risk='high';label='Group 3';os='~33%';}else{risk='vhigh';label='Group 4';os='~18%';}
    return{score:s,max:4,risk,label,stats:[['5yr OS',os]],interp:'PIT '+label+' for PTCL-NOS.',
      next:s>=2?'CHOP or CHOEP ± ASCT consolidation in CR1. Consider clinical trial (e.g., brentuximab-CHP for CD30+ cases). Discuss at lymphoma MDT.':'Standard CHOP ×6-8. Consider ASCT consolidation in CR1.'};}
},
ielsg: {
  id:'ielsg', name:'IELSG Score', purpose:'Predict overall survival in primary CNS lymphoma (PCNSL).',
  cat:'malignant', disease:'PCNSL', icon:'🧠',
  tags:['pcnsl','cns','lymphoma','ielsg','brain','prognosis'],
  evidence:{source:'Ferreri AJ et al. J Clin Oncol. 2003;21(2):266-72.',guideline:'NCCN / ESMO',year:2003,pmid:'12525518'},
  whenUse:'Primary CNS lymphoma at diagnosis for prognostic stratification.',whenNot:'Secondary CNS involvement by systemic lymphoma. CNS relapse of DLBCL.',
  limits:'Developed pre-Rituximab era. Modern outcomes may be better with HD-MTX + Rituximab regimens.',
  inputs:[{id:'age',label:'Age >60 years',type:'check'},{id:'ecog',label:'ECOG PS >1',type:'check'},
    {id:'ldh',label:'LDH above ULN',type:'check'},{id:'csf',label:'Elevated CSF protein',type:'check'},
    {id:'deep',label:'Deep brain structure involvement (periventricular, basal ganglia, brainstem, cerebellum)',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;let risk,label,os;
    if(s<=1){risk='low';label='Low Risk';os='~80% at 2yr';}else if(s<=3){risk='int';label='Intermediate';os='~48% at 2yr';}
    else{risk='high';label:'High Risk';os='~15% at 2yr';}
    return{score:s,max:5,risk,label,stats:[['2yr OS',os]],interp:'IELSG '+label+' for PCNSL.',
      next:'High-dose methotrexate-based induction (3.5 g/m² IV). Add Rituximab if B-cell (R-MPV or MATRix). Consolidation: whole-brain RT or high-dose chemotherapy + ASCT (younger/fit). Avoid corticosteroids before biopsy if possible.'};}
},
maltipi: {
  id:'maltipi', name:'MALT-IPI', purpose:'Predict progression-free survival in extranodal marginal zone lymphoma (MALT lymphoma).',
  cat:'malignant', disease:'MALT Lymphoma', icon:'🟢',
  tags:['malt','marginal zone','mzl','extranodal','prognosis'],
  evidence:{source:'Thieblemont C et al. Blood. 2017;130(13):1490-8.',guideline:'ESMO',year:2017,pmid:'28743838'},
  whenUse:'Extranodal MZL (MALT) at diagnosis.',whenNot:'Nodal or splenic MZL. DLBCL transformation.',
  limits:'Specific to extranodal MZL. Less validated than FLIPI. Site of disease (gastric vs non-gastric) also impacts management.',
  inputs:[{id:'age',label:'Age ≥70 years',type:'check'},{id:'stage',label:'Ann Arbor Stage III-IV',type:'check'},
    {id:'ldh',label:'LDH above ULN',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;let risk,label,efs;
    if(s===0){risk='low';label='Low Risk';efs='~70% at 5yr';}else if(s===1){risk='int';label='Intermediate';efs='~56%';}
    else{risk='high';label:'High Risk';efs='~29%';}
    return{score:s,max:3,risk,label,stats:[['5yr EFS',efs]],interp:'MALT-IPI '+label+'.',
      next:'Gastric MALT: test H. pylori — if positive, eradication is first-line (70% response). Non-gastric or H. pylori-negative: RT for localised, R-chemo or Rituximab monotherapy for advanced.'};}
},
amyloid: {
  id:'amyloid', name:'Mayo 2012 AL Amyloidosis Stage', purpose:'Stage AL amyloidosis severity based on cardiac biomarkers for survival prediction.',
  cat:'malignant', disease:'AL Amyloidosis', icon:'💜',
  tags:['amyloidosis','al','cardiac','staging','troponin','bnp','plasma cell'],
  evidence:{source:'Kumar S et al. J Clin Oncol. 2012;30(9):989-95.',guideline:'IMWG / BSH',year:2012,pmid:'22331953'},
  whenUse:'Newly diagnosed AL amyloidosis to assess cardiac involvement severity and prognosis.',
  whenNot:'Non-AL amyloidosis (AA, ATTR). Localised amyloidosis without systemic disease.',
  limits:'Cardiac biomarkers may be affected by renal impairment (NT-proBNP rises with CKD). Troponin assay sensitivity matters.',
  inputs:[{id:'bnp',label:'NT-proBNP ≥1800 pg/mL',type:'check'},{id:'trop',label:'Troponin T ≥0.025 ng/mL (or hs-TnT ≥ institutional ULN)',type:'check'},
    {id:'dflc',label:'dFLC (difference between involved and uninvolved FLC) ≥18 mg/dL',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;let risk,label,os;
    if(s===0){risk='low';label='Stage I';os='~94 months';}else if(s===1){risk='int';label='Stage II';os='~40 months';}
    else if(s===2){risk='high';label:'Stage III';os='~14 months';}else{risk='vhigh';label:'Stage IV';os='~6 months';}
    return{score:s,max:3,risk,label:'Mayo Stage '+(s===0?'I':s===1?'II':s===2?'III':'IV'),stats:[['Median OS',os]],
      interp:'Mayo 2012 Stage '+(s+1)+'. Cardiac involvement is the primary determinant of survival.',
      next:s>=2?'URGENT treatment. Daratumumab-VCd (ANDROMEDA) now standard first-line. Stage IV: high early mortality — cautious dosing, close cardiac monitoring. Transplant evaluation if <70 and adequate cardiac/renal function.':'Standard treatment: Daratumumab-VCd. ASCT consolidation if eligible (young, fit, limited organ involvement). Haematological response assessment at 3-6 months.'};}
},
ebmt: {
  id:'ebmt', name:'EBMT Risk Score', purpose:'Predict transplant-related mortality and overall survival after allogeneic SCT.',
  cat:'malignant', disease:'Transplant', icon:'🔄',
  tags:['ebmt','transplant','allogeneic','sct','risk','mortality'],
  evidence:{source:'Gratwohl A. Bone Marrow Transplant. 2012;47(7):906-11.',guideline:'EBMT',year:2012,pmid:'22543746'},
  whenUse:'Pre-transplant risk assessment for allogeneic SCT.',whenNot:'Autologous SCT. As sole transplant decision factor.',
  limits:'Does not capture comorbidities (use HCT-CI alongside) or disease genetics. Developed before widespread use of haploidentical and reduced-intensity approaches.',
  inputs:[{id:'age',label:'Patient age',type:'select',opts:[['<20 years',0],['20-40',1],['>40',2]]},
    {id:'stage',label:'Disease stage at transplant',type:'select',opts:[['CR1 / early chronic phase',0],['CR2 / intermediate',1],['Advanced / refractory',2]]},
    {id:'interval',label:'Time from diagnosis to transplant',type:'select',opts:[['<12 months',0],['≥12 months',1]]},
    {id:'donor',label:'Donor type',type:'select',opts:[['HLA-identical sibling',0],['Matched unrelated / other',1]]},
    {id:'sex',label:'Donor-recipient sex',type:'select',opts:[['Other combination',0],['Female donor → Male recipient',1]]}],
  calc:(v)=>{const s=Object.values(v).reduce((a,b)=>a+b,0);let risk,label,os;
    if(s<=1){risk='low';label='Low Risk';os='~72% at 5yr';}else if(s<=3){risk='int';label='Intermediate';os='~55%';}
    else{risk='high';label:'High Risk';os='~38%';}
    return{score:s,max:7,risk,label,stats:[['5yr OS (approx)',os],['EBMT Score',s]],interp:'EBMT Risk Score '+s+'/7: '+label+'.',
      next:'Combine with HCT-CI and Disease Risk Index (DRI) for comprehensive transplant risk assessment. Discuss with transplant team.'};}
},
tls: {
  id:'tls', name:'Cairo-Bishop TLS', purpose:'Diagnose tumour lysis syndrome (laboratory and clinical) using CTCAE/Cairo-Bishop criteria.',
  cat:'benign', disease:'Tumour Lysis Syndrome', icon:'⚡',
  tags:['tls','tumour lysis','uric acid','potassium','phosphate','calcium'],
  evidence:{source:'Cairo MS, Bishop M. Br J Haematol. 2004;127(1):3-11.',guideline:'Expert Panel / BSH',year:2004,pmid:'15384972'},
  whenUse:'Patients at risk of TLS (acute leukaemia, high-grade lymphoma, bulky disease, high WBC) before and during chemotherapy.',
  whenNot:'Chronic low-grade malignancies with low tumour burden.',
  limits:'Laboratory TLS is common; clinical TLS (with organ dysfunction) is the clinically relevant entity. Prevention is key — rasburicase for high-risk patients.',
  inputs:[{id:'ua',label:'Uric acid ≥476 µmol/L (8 mg/dL) or 25% increase',type:'check'},
    {id:'k',label:'Potassium ≥6.0 mmol/L or 25% increase',type:'check'},
    {id:'phos',label:'Phosphate ≥2.1 mmol/L (adults) or 25% increase',type:'check'},
    {id:'ca',label:'Corrected calcium ≤1.75 mmol/L or 25% decrease',type:'check'},
    {id:'creat',label:'Creatinine ≥1.5× ULN (clinical TLS)',type:'check'},
    {id:'arrhy',label:'Cardiac arrhythmia or sudden death (clinical TLS)',type:'check'},
    {id:'seizure',label:'Seizure (clinical TLS)',type:'check'}],
  calc:(v)=>{const lab=(v.ua?1:0)+(v.k?1:0)+(v.phos?1:0)+(v.ca?1:0);
    const clin=v.creat||v.arrhy||v.seizure;
    let risk,label,interp,next;
    if(lab>=2&&clin){risk='vhigh';label='Clinical TLS';interp='Laboratory + clinical TLS — organ dysfunction present.';
      next='EMERGENCY: aggressive IV hydration (3L/m²/day), rasburicase 0.2 mg/kg IV stat (single dose usually sufficient), correct hyperkalaemia urgently (calcium gluconate, insulin/dextrose, salbutamol), cardiac monitoring, consider renal replacement therapy if refractory.';}
    else if(lab>=2){risk='high';label='Laboratory TLS';interp='Two or more laboratory criteria met.';
      next='Aggressive hydration. Rasburicase if uric acid elevated. Monitor K, PO₄, Ca, uric acid, creatinine every 6-8 hours. Allopurinol if rasburicase not available/indicated. Avoid calcium supplementation unless symptomatic hypocalcaemia.';}
    else{risk='low';label='TLS Criteria Not Met';interp:'Fewer than 2 laboratory criteria.';
      next:'Continue monitoring if at risk. Prophylaxis: IV hydration + allopurinol (low-intermediate risk) or rasburicase (high risk: acute leukaemia with WBC >100, Burkitt, high LDH). Monitor labs every 8-12 hours during treatment initiation.';}
    return{score:lab,max:4,risk,label,stats:[['Lab criteria met',lab+'/4'],['Clinical TLS',clin?'Yes':'No']],interp,next};}
},
itpbat: {
  id:'itpbat', name:'ITP Bleeding Score (ITP-BAT)', purpose:'Standardised assessment of bleeding severity in immune thrombocytopenia.',
  cat:'benign', disease:'ITP', icon:'🩸',
  tags:['itp','bleeding','thrombocytopenia','bat','platelet'],
  evidence:{source:'Page LK et al. Br J Haematol. 2007;138(2):245-8.',guideline:'BSH / ASH',year:2007,pmid:'17593032'},
  whenUse:'ITP patients to objectively grade bleeding severity and guide treatment urgency.',
  whenNot:'Thrombocytopenia from other causes. Post-splenectomy assessment.',
  limits:'Subjective elements. Bleeding assessment should be combined with platelet count and patient factors (age, activity level, medications).',
  inputs:[{id:'skin',label:'Skin bleeding (petechiae/bruising)',type:'select',opts:[['None',0],['Mild (few petechiae)',1],['Moderate (widespread)',2],['Severe',3]]},
    {id:'muc',label:'Mucosal bleeding (oral, epistaxis, GI, GU)',type:'select',opts:[['None',0],['Mild',1],['Moderate (requiring intervention)',2],['Severe (requiring transfusion/admission)',3]]},
    {id:'organ',label:'Organ/life-threatening bleeding',type:'select',opts:[['None',0],['Intracranial, pulmonary, or requiring surgical intervention',4]]}],
  calc:(v)=>{const maxGrade=Math.max(v.skin||0,v.muc||0,v.organ||0);let risk,label,interp,next;
    if(maxGrade<=1){risk='low';label='Grade 0–1 (Minimal)';interp='Minimal or no bleeding.';next='Treatment may not be required. Consider if plt <20-30 and/or patient preferences/lifestyle. Aspirin avoidance.';}
    else if(maxGrade===2){risk='int';label='Grade 2 (Moderate)';interp='Moderate bleeding requiring attention.';next='Consider treatment if plt <30 or symptomatic. First-line: corticosteroids (prednisolone 1mg/kg or dexamethasone 40mg ×4 days). IVIg if rapid response needed.';}
    else if(maxGrade===3){risk='high';label:'Grade 3 (Severe)';interp:'Severe bleeding.';next:'ADMIT. IVIg 1g/kg (rapid onset) + corticosteroids. Consider platelet transfusion if life-threatening bleeding. Tranexamic acid adjunct. If refractory: TPO-RA (romiplostim/eltrombopag) or rituximab.';}
    else{risk='vhigh';label:'Grade 4 (Life-Threatening)';interp:'Life-threatening haemorrhage (ICH, massive GI).';
      next:'EMERGENCY: IVIg 1g/kg stat, IV methylprednisolone 1g, platelet transfusion, tranexamic acid, urgent senior review. If ICH: neurosurgical assessment, consider romiplostim. Splenectomy may be required for refractory cases.';}
    return{score:maxGrade,max:4,risk,label,stats:[['Max Grade',maxGrade],['Skin','G'+(v.skin||0)],['Mucous','G'+(v.muc||0)]],interp,next};}
},
aasev: {
  id:'aasev', name:'AA Severity (Camitta)', purpose:'Classify aplastic anaemia severity to guide treatment intensity (IST vs transplant).',
  cat:'malignant', disease:'Aplastic Anaemia', icon:'🔴',
  tags:['aplastic','anaemia','camitta','severity','saa','vsaa','transplant'],
  evidence:{source:'Camitta BM et al. Blood. 1976;48(1):63-70.',guideline:'BSH / EBMT',year:1976,pmid:'1275484'},
  whenUse:'Confirmed aplastic anaemia to classify non-severe, severe (SAA), or very severe (vSAA).',
  whenNot:'Hypoplastic MDS (may mimic AA — requires BM morphology + cytogenetics). Inherited BMF syndromes.',
  limits:'Based on peripheral blood counts and BM cellularity. Does not account for clonal evolution (PNH clone, cytogenetics).',
  inputs:[{id:'anc',label:'ANC (×10⁹/L)',type:'number',min:0,max:10,step:0.01},
    {id:'plt',label:'Platelets (×10⁹/L)',type:'number',min:0,max:300,step:1},
    {id:'retic',label:'Reticulocyte count (×10⁹/L)',type:'number',min:0,max:200,step:1},
    {id:'cell',label:'BM cellularity <25%',type:'check'}],
  calc:(v)=>{if(!v.anc&&!v.plt) return{score:'-',max:null,risk:'info',label:'Enter blood counts',stats:[],interp:'',next:''};
    let cyto=0;if((v.anc||999)<0.5)cyto++;if((v.plt||999)<20)cyto++;if((v.retic||999)<20)cyto++;
    let risk,label,interp,next;
    if(v.cell&&cyto>=2&&(v.anc||999)<0.2){risk='vhigh';label='Very Severe AA (vSAA)';interp='ANC <0.2 with SAA criteria.';
      next='URGENT transplant referral if <40 with matched sibling donor. HLA typing immediately. If no sibling donor or >40: horse ATG + ciclosporin + eltrombopag (RACE trial). Supportive care: irradiated blood products, antifungals.';}
    else if(v.cell&&cyto>=2){risk='high';label='Severe AA (SAA)';interp='At least 2 of: ANC <0.5, plt <20, retic <20, with hypocellular marrow.';
      next:'Transplant assessment (matched sibling donor preferred if <40). If no sibling donor: ATG + ciclosporin ± eltrombopag. HLA typing for all patients. Avoid transfusion if possible pre-transplant.';}
    else{risk='int';label:'Non-Severe AA (NSAA)';interp:'Does not meet SAA criteria.';
      next:'Watch and monitor if transfusion-independent. Supportive care. Consider IST (ciclosporin ± ATG) if transfusion-dependent or symptomatic cytopenias. Monitor for clonal evolution (PNH, MDS).';}
    return{score:label,max:null,risk,label,stats:[['ANC',(v.anc||'—')+' ×10⁹/L'],['Platelets',(v.plt||'—')+' ×10⁹/L']],interp,next};}
},
geneva: {
  id:'geneva', name:'Revised Geneva Score', purpose:'Alternative to Wells Score for assessing pre-test probability of pulmonary embolism.',
  cat:'benign', disease:'Pulmonary Embolism', icon:'🫁',
  tags:['geneva','pe','pulmonary embolism','vte','alternative','wells'],
  evidence:{source:'Le Gal G et al. Ann Intern Med. 2006;144(3):165-71.',guideline:'ESC / ACCP',year:2006,pmid:'16461960'},
  whenUse:'Suspected PE as an alternative to Wells — fully objective (no subjective "most likely diagnosis" criterion).',
  whenNot:'Confirmed PE. Haemodynamically unstable massive PE.',
  limits:'Fully objective — may be preferred when Wells "alternative diagnosis" criterion introduces too much subjectivity. Similar overall performance to Wells.',
  inputs:[{id:'age2',label:'Age >65 years',type:'check'},{id:'prev2',label:'Previous DVT or PE',type:'check'},
    {id:'surg',label:'Surgery or fracture within 1 month',type:'check'},{id:'cancer2',label:'Active malignancy',type:'check'},
    {id:'pain',label:'Unilateral lower limb pain',type:'check'},{id:'haemo2',label:'Haemoptysis',type:'check'},
    {id:'hr2',label:'Heart rate',type:'select',opts:[['<75 bpm',0],['75-94 bpm',3],['≥95 bpm',5]]},
    {id:'tend',label:'Pain on deep palpation of lower limb and unilateral oedema',type:'check'}],
  calc:(v)=>{const s=(v.age2?1:0)+(v.prev2?3:0)+(v.surg?2:0)+(v.cancer2?2:0)+(v.pain?3:0)+(v.haemo2?2:0)+(v.hr2||0)+(v.tend?4:0);
    let risk,label,interp,next;
    if(s<=3){risk='low';label='Low Probability';interp='PE unlikely (~8%).';next='Check D-dimer (age-adjusted if >50). If negative: PE excluded. If positive: CTPA.';}
    else if(s<=10){risk='int';label='Intermediate Probability';interp='PE possible (~29%).';next='D-dimer or proceed to CTPA. Clinical judgment.';}
    else{risk='high';label='High Probability';interp='PE likely (~74%).';next='CTPA directly. Consider empirical anticoagulation.';}
    return{score:s,max:22,risk,label,stats:[['Geneva Score',s]],interp,next};}
},
caprini: {
  id:'caprini', name:'Caprini VTE Score', purpose:'Assess VTE risk in surgical patients to guide perioperative thromboprophylaxis.',
  cat:'benign', disease:'Surgical VTE', icon:'🔪',
  tags:['caprini','vte','surgical','prophylaxis','perioperative','thrombosis'],
  evidence:{source:'Caprini JA. Dis Mon. 2005;51(2-3):70-8.',guideline:'ACCP / NICE',year:2005,pmid:'15900257'},
  whenUse:'Surgical patients (general, orthopaedic, gynaecological, urological) for VTE prophylaxis decisions.',
  whenNot:'Medical (non-surgical) inpatients — use Padua score instead.',
  limits:'Many items scored — can be time-consuming. Some scoring items are subjective. Multiple modified versions exist.',
  inputs:[{id:'age3',label:'Age',type:'select',opts:[['≤40 years',0],['41-60',1],['61-74',2],['≥75',3]]},
    {id:'surg2',label:'Surgery type',type:'select',opts:[['Minor (<45 min)',1],['Major (>45 min)',2],['Major lower extremity (arthroplasty)',5]]},
    {id:'bmi3',label:'BMI >25',type:'check'},{id:'prev3',label:'History of VTE',type:'select',opts:[['None',0],['Yes',3]]},
    {id:'cancer4',label:'Active malignancy',type:'select',opts:[['No',0],['Yes',2]]},
    {id:'immob3',label:'Bed rest >72 hours',type:'check'},{id:'varicose',label:'Varicose veins',type:'check'},
    {id:'hrt2',label:'OCP/HRT or pregnancy',type:'check'},{id:'sepsis',label:'Sepsis within 1 month',type:'check'}],
  calc:(v)=>{const s=(v.age3||0)+(v.surg2||0)+(v.bmi3?1:0)+(v.prev3||0)+(v.cancer4||0)+(v.immob3?1:0)+(v.varicose?1:0)+(v.hrt2?1:0)+(v.sepsis?1:0);
    let risk,label,interp,next;
    if(s<=1){risk='low';label='Very Low Risk';interp='VTE incidence ~0.5%.';next='Early ambulation. Mechanical prophylaxis (TED stockings). Pharmacological prophylaxis NOT routinely needed.';}
    else if(s<=4){risk='int';label='Moderate Risk';interp='VTE incidence ~1.5-3%.';next='LMWH prophylaxis (enoxaparin 40mg SC daily) + mechanical. Start 6-12h post-op. Continue until mobile.';}
    else{risk='high';label:'High Risk';interp:'VTE incidence >6%.';next:'LMWH prophylaxis + mechanical + early ambulation. Extended prophylaxis (28 days) for major cancer surgery or arthroplasty. Consider IPC boots if pharmacological contraindicated.';}
    return{score:s,max:null,risk,label,stats:[['Caprini Score',s]],interp,next};}
},
steroid: {
  id:'steroid', name:'Steroid Conversion', purpose:'Convert between equivalent doses of common corticosteroids.',
  cat:'general', disease:'Dosing', icon:'💊',
  tags:['steroid','corticosteroid','prednisolone','dexamethasone','conversion','equivalent'],
  evidence:{source:'Standard pharmacology reference.',guideline:'BNF / Clinical Practice',year:2024,pmid:''},
  whenUse:'Converting between different corticosteroids (e.g., switching from IV to oral, or between different agents).',
  whenNot:'As sole guide — consider mineralocorticoid potency, duration of action, and route separately.',
  limits:'Equivalence is approximate for anti-inflammatory/immunosuppressive effect only. Does not account for mineralocorticoid activity (fludrocortisone equivalent) or half-life differences.',
  inputs:[{id:'drug',label:'Current steroid',type:'select',opts:[['Prednisolone / Prednisone',1],['Dexamethasone',6.67],['Methylprednisolone',1.25],['Hydrocortisone',0.25]]},
    {id:'dose',label:'Current dose (mg)',type:'number',min:0.5,max:2000,step:0.5}],
  calc:(v)=>{if(!v.dose) return{score:'-',max:null,risk:'info',label:'Enter dose',stats:[],interp:'',next:''};
    const pred=v.dose*(v.drug||1);const dexa=pred/6.67;const methyl=pred/1.25;const hydro=pred/0.25;
    return{score:pred.toFixed(1),max:null,risk:'low',label:'Prednisolone equivalent: '+pred.toFixed(1)+' mg',
      stats:[['Prednisolone',pred.toFixed(1)+' mg'],['Dexamethasone',dexa.toFixed(1)+' mg'],['Methylprednisolone',methyl.toFixed(1)+' mg'],['Hydrocortisone',hydro.toFixed(0)+' mg']],
      interp:'Approximate anti-inflammatory equivalences. Prednisolone 5mg ≈ Dexamethasone 0.75mg ≈ Methylprednisolone 4mg ≈ Hydrocortisone 20mg.',
      next:'Remember: Dexamethasone has NO mineralocorticoid activity (no sodium retention). Hydrocortisone has the MOST mineralocorticoid activity. Biological half-lives differ: hydrocortisone 8-12h, prednisolone 12-36h, dexamethasone 36-54h.'};}
},
ecog: {
  id:'ecog', name:'ECOG Performance Status', purpose:'Standardised scale for functional status — used in virtually all oncology treatment decisions.',
  cat:'general', disease:'Fitness', icon:'🏃',
  tags:['ecog','performance','status','fitness','oncology','karnofsky'],
  evidence:{source:'Oken MM et al. Am J Clin Oncol. 1982;5(6):649-55.',guideline:'ECOG / WHO',year:1982,pmid:'7165009'},
  whenUse:'Every oncology patient at every assessment — treatment decisions, trial eligibility, prognosis.',
  whenNot:'—',limits:'Subjective. Inter-observer variability exists. Does not capture frailty or cognitive function.',
  inputs:[{id:'ps',label:'Performance Status',type:'select',opts:[
    ['PS 0: Fully active, no restrictions',0],['PS 1: Restricted in strenuous activity, ambulatory and able to do light work',1],
    ['PS 2: Ambulatory >50% of waking hours, capable of self-care, unable to work',2],
    ['PS 3: Limited self-care, confined to bed/chair >50% of waking hours',3],['PS 4: Completely disabled, totally confined to bed/chair, no self-care',4]]}],
  calc:(v)=>{const s=v.ps||0;let risk,kps,interp,next;
    if(s<=1){risk='low';kps=s===0?'100%':'80-90%';interp='Good performance status. Eligible for most treatments.';next='Standard-intensity chemotherapy/immunotherapy appropriate. Eligible for most clinical trials (typically require PS 0-1).';}
    else if(s===2){risk='int';kps='60-70%';interp='Ambulatory but unable to work. Borderline for many intensive treatments.';next='Treatment decisions must be individualised. Many trials exclude PS ≥2. Consider dose reduction or less intensive regimens. Geriatric assessment if elderly.';}
    else{risk='high';kps=s===3?'40-50%':'10-30%';interp='Poor performance status. Limited treatment options.';next=s===3?'Best supportive care for most malignancies. Very limited chemotherapy options. Palliative care referral. Some targeted therapies (e.g., single-agent BTKi) may be tolerated.':
      'Best supportive care only. Palliative care. No role for systemic anti-cancer therapy. Focus on symptom management and quality of life.';}
    return{score:'PS '+s,max:4,risk,label:'ECOG '+s+' (KPS ~'+kps+')',stats:[['ECOG PS',s],['Karnofsky equiv','~'+kps]],interp,next};}
},
cfs: {
  id:'cfs', name:'Clinical Frailty Scale', purpose:'Rapid bedside frailty assessment for elderly patients — guides treatment intensity decisions.',
  cat:'general', disease:'Frailty', icon:'👴',
  tags:['frailty','cfs','elderly','geriatric','fitness','rockwood'],
  evidence:{source:'Rockwood K et al. CMAJ. 2005;173(5):489-95.',guideline:'NICE / BGS',year:2005,pmid:'16129869'},
  whenUse:'Patients ≥65 years, especially before cancer treatment, transplant assessment, or ICU admission decisions.',
  whenNot:'Patients <65 without clinical concern for frailty. Acute illness (score BEFORE acute deterioration).',
  limits:'Score the patient\'s baseline (2 weeks before acute illness). Subjective but reproducible with training. Does not replace comprehensive geriatric assessment (CGA).',
  inputs:[{id:'cfs',label:'Clinical Frailty Scale (score baseline, not acute illness)',type:'select',opts:[
    ['1: Very Fit — robust, active, energetic, motivated, exercises regularly',1],['2: Well — no active disease but less fit than category 1',2],
    ['3: Managing Well — medical problems well controlled, not regularly active',3],['4: Vulnerable — not dependent but symptoms limit activities, "slowed up"',4],
    ['5: Mildly Frail — limited dependence on others for IADLs (shopping, finances, meal prep)',5],
    ['6: Moderately Frail — needs help with all outside activities and some inside activities',6],
    ['7: Severely Frail — completely dependent for personal care, stable and not at high risk of dying',7],
    ['8: Very Severely Frail — completely dependent, approaching end of life',8],['9: Terminally Ill — approaching end of life, life expectancy <6 months',9]]}],
  calc:(v)=>{const s=v.cfs||1;let risk,label,interp,next;
    if(s<=3){risk='low';label='Fit (CFS 1-3)';interp='Not frail. Fit for standard-intensity treatment.';next='Standard oncology treatment appropriate. Full-dose chemotherapy. Transplant eligible if otherwise appropriate. No age-based dose reduction needed.';}
    else if(s===4){risk='low';label:'Vulnerable (CFS 4)';interp:'Pre-frail. May tolerate standard treatment with close monitoring.';next:'Consider comprehensive geriatric assessment. Standard treatment usually tolerable. Close monitoring for toxicity. Exercise prehabilitation may help.';}
    else if(s<=6){risk='int';label:'Frail (CFS 5-6)';interp:'Frail. Standard-intensity treatment likely not tolerated.';next:'Dose-reduced or less intensive regimens. Comprehensive geriatric assessment recommended. Targeted/oral therapies preferred. Transplant generally not appropriate. Focus on maintaining function and quality of life.';}
    else{risk='high';label:'Severely Frail (CFS 7-9)';interp:'Severe frailty or terminal.';next:'Best supportive care for most cancers. Palliative care referral. Very limited role for anti-cancer therapy. Focus on symptom control, comfort, and goals of care discussions.';}
    return{score:'CFS '+s,max:9,risk,label,stats:[['CFS Score',s+'/9']],interp,next};}
},
g8: {
  id:'g8', name:'G8 Geriatric Screening', purpose:'Rapid screening tool to identify elderly cancer patients who need comprehensive geriatric assessment.',
  cat:'general', disease:'Geriatric Oncology', icon:'👴',
  tags:['g8','geriatric','screening','elderly','oncology','fitness','frailty'],
  evidence:{source:'Bellera CA et al. Ann Oncol. 2012;23(8):2166-72.',guideline:'SIOG / ESMO',year:2012,pmid:'22250183'},
  whenUse:'Cancer patients ≥70 years before starting systemic treatment — takes <5 minutes.',
  whenNot:'Patients <65. As a replacement for full CGA (it is a screening tool only).',
  limits:'Screening tool — not diagnostic. Abnormal G8 (≤14) should trigger comprehensive geriatric assessment. Does not predict specific toxicities.',
  inputs:[{id:'food',label:'Food intake (last 3 months)',type:'select',opts:[['Severe decrease',0],['Moderate decrease',1],['No decrease',2]]},
    {id:'wt',label:'Weight loss (last 3 months)',type:'select',opts:[['>3 kg loss',0],['Unknown',1],['1-3 kg loss',2],['No weight loss',3]]},
    {id:'mob',label:'Mobility',type:'select',opts:[['Bed/chair bound',0],['Gets out of bed/chair but doesn\'t go out',1],['Goes out',2]]},
    {id:'neuro',label:'Neuropsychological problems',type:'select',opts:[['Severe dementia/depression',0],['Mild dementia/depression',1],['No problems',2]]},
    {id:'bmi4',label:'BMI',type:'select',opts:[['<19',0],['19-21',1],['21-23',2],['>23',3]]},
    {id:'meds',label:'Takes >3 medications per day',type:'select',opts:[['Yes',0],['No',1]]},
    {id:'health',label:'Self-rated health compared to age-peers',type:'select',opts:[['Not as good',0],['Doesn\'t know',0.5],['As good',1],['Better',2]]},
    {id:'age6',label:'Age',type:'select',opts:[['>85 years',0],['80-85',1],['<80',2]]}],
  calc:(v)=>{const s=Object.values(v).reduce((a,b)=>a+b,0);const sr=Math.round(s*10)/10;
    let risk,label,interp,next;
    if(sr>14){risk='low';label='Normal (G8 >14)';interp='Screening does not suggest frailty.';next='Standard oncology treatment generally appropriate. CGA not mandatory. Continue standard care.';}
    else{risk='int';label:'Abnormal (G8 ≤14) — Frailty Suspected';interp:'G8 ≤14 identifies patients who may benefit from comprehensive geriatric assessment before treatment.';
      next:'REFER FOR COMPREHENSIVE GERIATRIC ASSESSMENT (CGA). CGA should assess: cognition, mood, functional status, falls risk, nutrition, polypharmacy, social support. Treatment plan should be adapted based on CGA findings.';}
    return{score:sr,max:17,risk,label,stats:[['G8 Score',sr+'/17'],['Cutoff','≤14 = abnormal']],interp,next};}
},
apache: {
  id:'apache', name:'APACHE II', purpose:'Predict ICU mortality within 24 hours of admission based on physiological and chronic health variables.',
  cat:'general', disease:'ICU', icon:'🏥',
  tags:['apache','icu','mortality','critical care','severity','prognosis'],
  evidence:{source:'Knaus WA et al. Crit Care Med. 1985;13(10):818-29.',guideline:'Standard ICU Practice',year:1985,pmid:'3928249'},
  whenUse:'ICU patients within first 24 hours of admission. Use worst values in first 24 hours.',
  whenNot:'Pre-admission screening. Children. As sole basis for treatment limitation decisions.',
  limits:'Uses worst values in first 24h — affected by treatment received. Age-biased. Does not account for diagnosis-specific factors. APACHE IV and SOFA increasingly preferred.',
  inputs:[{id:'aps',label:'Acute Physiology Score (sum of 12 physiological variables — worst in 24h)',type:'number',min:0,max:60,step:1},
    {id:'age4',label:'Age points',type:'select',opts:[['<45 years',0],['45-54',2],['55-64',3],['65-74',5],['≥75',6]]},
    {id:'chronic',label:'Chronic health points',type:'select',opts:[['No severe organ insufficiency and not post-operative',0],['Post-operative (elective)',2],['Post-operative (emergency) or severe organ insufficiency',5]]}],
  calc:(v)=>{const s=(v.aps||0)+(v.age4||0)+(v.chronic||0);let risk,label,mort;
    if(s<=9){risk='low';label='Low';mort='~4%';}else if(s<=14){risk='int';label='Moderate';mort='~8-15%';}
    else if(s<=24){risk='high';label:'High';mort='~25-40%';}else{risk='vhigh';label:'Very High';mort='>50%';}
    return{score:s,max:71,risk,label:'APACHE II '+s+' — '+label+' Risk',stats:[['Predicted mortality',mort],['APACHE II Score',s]],
      interp:'APACHE II '+s+': estimated hospital mortality '+mort+'.',
      next:s>=25?'Very high mortality risk. Goals of care discussion. Maximal ICU support if appropriate. Serial APACHE/SOFA trending.':'Continue ICU management. Serial SOFA scoring may be more useful for tracking trajectory.'};}
},
grace: {
  id:'grace', name:'GRACE 2.0 Score', purpose:'Estimate 6-month mortality in acute coronary syndrome (STEMI and NSTEMI/UA).',
  cat:'general', disease:'Cardiology', icon:'❤️',
  tags:['grace','acs','stemi','nstemi','mortality','cardiac','troponin'],
  evidence:{source:'Fox KA et al. BMJ. 2006;333(7578):1091.',guideline:'ESC / NICE / AHA',year:2006,pmid:'17032691'},
  whenUse:'ACS patients (STEMI, NSTEMI, unstable angina) for in-hospital and 6-month mortality estimation.',
  whenNot:'Non-cardiac chest pain. Chronic stable angina.',
  limits:'Original GRACE required Killip class and creatinine — simplified versions exist. Online calculator recommended for precise score. This is a simplified estimate.',
  inputs:[{id:'age5',label:'Age',type:'select',opts:[['<40',0],['40-49',18],['50-59',36],['60-69',55],['70-79',73],['≥80',91]]},
    {id:'hr3',label:'Heart rate',type:'select',opts:[['<70 bpm',0],['70-89',7],['90-109',13],['110-149',23],['≥150',36]]},
    {id:'sbp3',label:'Systolic BP',type:'select',opts:[['≥200 mmHg',0],['160-199',11],['140-159',22],['120-139',34],['100-119',43],['80-99',53],['<80',58]]},
    {id:'creat4',label:'Creatinine',type:'select',opts:[['<35 µmol/L',1],['35-70',3],['71-105',5],['106-140',7],['141-176',9],['>176',15]]},
    {id:'killip',label:'Killip class',type:'select',opts:[['I (no heart failure)',0],['II (crackles, S3)',20],['III (pulmonary oedema)',39],['IV (cardiogenic shock)',59]]},
    {id:'arrest',label:'Cardiac arrest at admission',type:'select',opts:[['No',0],['Yes',39]]},
    {id:'ste',label:'ST-segment deviation',type:'select',opts:[['No',0],['Yes',28]]},
    {id:'trop2',label:'Elevated cardiac biomarkers',type:'select',opts:[['No',0],['Yes',14]]}],
  calc:(v)=>{const s=Object.values(v).reduce((a,b)=>a+b,0);let risk,label,mort;
    if(s<=108){risk='low';label='Low Risk';mort='<3%';}else if(s<=140){risk='int';label:'Intermediate';mort='~3-8%';}
    else{risk='high';label:'High Risk';mort='>8%';}
    return{score:s,max:null,risk,label,stats:[['6-month mortality',mort],['GRACE Score',s]],
      interp:'GRACE '+s+': '+label+' for 6-month mortality.',
      next:s>140?'HIGH RISK: early invasive strategy (angiography within 24h). Dual antiplatelet therapy. Anticoagulation. Consider GPIIb/IIIa inhibitor.':'Standard ACS management per risk stratification. If NSTEMI: timing of angiography per risk category.'};}
},
heart: {
  id:'heart', name:'HEART Score', purpose:'Risk-stratify chest pain patients in the ED to guide disposition (discharge vs admission vs cath lab).',
  cat:'general', disease:'Cardiology', icon:'❤️',
  tags:['heart','chest pain','acs','emergency','troponin','risk'],
  evidence:{source:'Six AJ et al. Neth Heart J. 2008;16(6):191-6.',guideline:'ESC / AHA',year:2008,pmid:'18665203'},
  whenUse:'ED patients presenting with chest pain — to determine safe early discharge vs further workup.',
  whenNot:'Obvious STEMI (cath lab immediately). Non-cardiac chest pain already diagnosed.',
  limits:'Subjective History component. Requires troponin result. Does not replace clinical judgment for atypical presentations.',
  inputs:[{id:'hx',label:'History',type:'select',opts:[['Slightly suspicious',0],['Moderately suspicious',1],['Highly suspicious',2]]},
    {id:'ecg',label:'ECG',type:'select',opts:[['Normal',0],['Non-specific repolarisation',1],['Significant ST deviation',2]]},
    {id:'age7',label:'Age',type:'select',opts:[['<45 years',0],['45-64',1],['≥65',2]]},
    {id:'rf',label:'Risk factors (HTN, DM, hyperlipidaemia, smoking, obesity, family Hx)',type:'select',opts:[['None',0],['1-2 factors',1],['≥3 factors or known atherosclerotic disease',2]]},
    {id:'trop3',label:'Initial troponin',type:'select',opts:[['Normal',0],['1-3× ULN',1],['>3× ULN',2]]}],
  calc:(v)=>{const s=Object.values(v).reduce((a,b)=>a+b,0);let risk,label,mace;
    if(s<=3){risk='low';label:'Low Risk';mace='~1.6%';return{score:s,max:10,risk,label,stats:[['6-week MACE',mace]],
      interp:'Low risk of major adverse cardiac events.',next:'Consider early discharge with outpatient follow-up. Repeat troponin at 3-6 hours if initial negative. If both negative and low HEART: safe discharge with GP follow-up within 72 hours.'};}
    else if(s<=6){risk='int';label='Intermediate';mace='~12%';return{score:s,max:10,risk,label,stats:[['6-week MACE',mace]],
      interp:'Intermediate risk — admission recommended.',next:'Admit for observation. Serial troponins. Non-invasive testing or angiography based on clinical trajectory. Start antiplatelet + anticoagulation if ACS likely.'};}
    else{risk='high';label='High Risk';mace='~65%';return{score:s,max:10,risk,label,stats:[['6-week MACE',mace]],
      interp:'High risk of ACS/MACE.',next:'URGENT cardiology referral. Early invasive strategy (angiography). Dual antiplatelet therapy. Anticoagulation. Consider ICU/CCU admission.'};}}
},
rcri: {
  id:'rcri', name:'RCRI (Lee Index)', purpose:'Estimate risk of major cardiac complications after non-cardiac surgery.',
  cat:'general', disease:'Pre-op', icon:'🔪',
  tags:['rcri','lee','perioperative','cardiac','risk','surgery','pre-op'],
  evidence:{source:'Lee TH et al. Circulation. 1999;100(10):1043-9.',guideline:'ESC / AHA/ACC',year:1999,pmid:'10477528'},
  whenUse:'Pre-operative cardiac risk assessment before non-cardiac surgery.',
  whenNot:'Cardiac surgery. Low-risk procedures (endoscopy, cataract, skin surgery).',
  limits:'Does not capture all cardiac risk factors. Functional capacity assessment (METs) should be used alongside. Does not account for surgical urgency or type-specific risk.',
  inputs:[{id:'ihd',label:'History of ischaemic heart disease (MI, angina, ST changes, prior PCI/CABG)',type:'check'},
    {id:'chf3',label:'History of congestive heart failure',type:'check'},
    {id:'cva2',label:'History of cerebrovascular disease (stroke/TIA)',type:'check'},
    {id:'dm4',label:'Diabetes mellitus requiring insulin',type:'check'},
    {id:'renal4',label:'Renal insufficiency (creatinine >2 mg/dL / >177 µmol/L)',type:'check'},
    {id:'surg3',label:'High-risk surgery (intraperitoneal, intrathoracic, suprainguinal vascular)',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;let risk,label,mace;
    if(s===0){risk='low';label='Very Low Risk (Class I)';mace='~0.4%';}
    else if(s===1){risk='low';label='Low Risk (Class II)';mace='~0.9%';}
    else if(s===2){risk='int';label='Moderate Risk (Class III)';mace='~6.6%';}
    else{risk='high';label:'High Risk (Class IV)';mace='~11%';}
    return{score:s,max:6,risk,label,stats:[['Major cardiac event risk',mace],['RCRI Score',s+'/6']],
      interp:'RCRI '+s+': estimated perioperative major cardiac complication rate '+mace+'.',
      next:s>=2?'Elevated cardiac risk. Consider: pre-operative cardiology review, functional capacity assessment (can patient climb 2 flights of stairs?), echocardiogram if heart failure suspected, optimise medical therapy. May benefit from perioperative beta-blockade (discuss with anaesthetics).':
      'Low cardiac risk. Proceed with standard pre-operative assessment. Ensure medications optimised. Continue beta-blockers/statins if already prescribed.'};}
},
anc: {
  id:'anc', name:'Absolute Neutrophil Count', purpose:'Calculate ANC from WBC and differential — essential for neutropenia grading and chemotherapy decisions.',
  cat:'general', disease:'Haematology Basics', icon:'🔬',
  tags:['anc','neutrophil','neutropenia','wbc','differential','chemotherapy'],
  evidence:{source:'Standard haematology calculation.',guideline:'Clinical Practice',year:2024,pmid:''},
  whenUse:'Any patient on chemotherapy. Suspected neutropenia. Interpreting FBC with differential.',
  whenNot:'—',limits:'Automated counters usually provide this directly. Manual calculation needed if only percentage differential available.',
  inputs:[{id:'wbc3',label:'WBC (×10⁹/L)',type:'number',min:0,max:500,step:0.1},
    {id:'neut',label:'Neutrophils (%)',type:'number',min:0,max:100,step:0.1},
    {id:'bands',label:'Bands/stabs (%) — include if available, otherwise enter 0',type:'number',min:0,max:50,step:0.1}],
  calc:(v)=>{if(!v.wbc3) return{score:'-',max:null,risk:'info',label:'Enter WBC and neutrophil %',stats:[],interp:'',next:''};
    const anc=v.wbc3*((v.neut||0)+(v.bands||0))/100;const a=Math.round(anc*100)/100;
    let risk,label,grade,interp,next;
    if(a>=1.5){risk='low';label='Normal (≥1.5)';grade='None';interp='Normal neutrophil count.';next='No neutropenia. Standard management.';}
    else if(a>=1.0){risk='low';label='Mild Neutropenia (1.0-1.5)';grade='Grade 1';interp='Mild neutropenia.';next='Usually no intervention needed. May delay next chemotherapy cycle if recent treatment. Recheck in 1-2 days if on chemo.';}
    else if(a>=0.5){risk='int';label='Moderate Neutropenia (0.5-1.0)';grade='Grade 2-3';interp='Moderate neutropenia — infection risk increasing.';next='If on chemotherapy: consider dose delay/reduction. Avoid crowded places. Low threshold for antibiotics if febrile. G-CSF may be indicated for secondary prophylaxis.';}
    else if(a>=0.1){risk='high';label:'Severe Neutropenia (<0.5)';grade='Grade 4';interp:'Severe neutropenia — high infection risk.';
      next:'Neutropenic precautions. If febrile (≥38°C): EMERGENCY — neutropenic sepsis protocol, IV antibiotics within 1 HOUR, MASCC score. G-CSF if chemotherapy-induced. Avoid IM injections, rectal examinations.';}
    else{risk='vhigh';label:'Profound Neutropenia (<0.1)';grade='Grade 4 (profound)';interp:'Profound neutropenia — extreme infection risk.';
      next:'MAXIMUM precautions. Anti-fungal prophylaxis (posaconazole). If febrile: emergency IV antibiotics + consider empirical antifungals at 72-96h if not responding. Protective isolation. G-CSF.';}
    return{score:a.toFixed(2),max:null,risk,label,stats:[['ANC',a.toFixed(2)+' ×10⁹/L'],['Grade',grade]],interp,next};}
},
rpi: {
  id:'rpi', name:'Reticulocyte Production Index', purpose:'Assess whether the bone marrow is responding appropriately to anaemia — distinguishes underproduction from destruction/loss.',
  cat:'general', disease:'Haematology Basics', icon:'🔬',
  tags:['reticulocyte','rpi','production','index','anaemia','haemolysis','marrow'],
  evidence:{source:'Standard haematology calculation.',guideline:'Clinical Practice',year:2024,pmid:''},
  whenUse:'Investigating anaemia — is the marrow responding appropriately? RPI >2 = appropriate response (haemolysis/bleeding). RPI <2 = underproduction.',
  whenNot:'Without concurrent anaemia (reticulocyte count alone is less informative).',
  limits:'Reticulocyte maturation time varies with degree of anaemia. The correction factor is an approximation.',
  inputs:[{id:'retic',label:'Reticulocyte count (%)',type:'number',min:0,max:50,step:0.1},
    {id:'hct',label:'Haematocrit (%)',type:'number',min:5,max:65,step:0.1}],
  calc:(v)=>{if(!v.retic||!v.hct) return{score:'-',max:null,risk:'info',label:'Enter reticulocyte count and haematocrit',stats:[],interp:'',next:''};
    const corrRetic=v.retic*(v.hct/45);
    let matTime=1.0;if(v.hct<35)matTime=1.5;if(v.hct<25)matTime=2.0;if(v.hct<15)matTime=2.5;
    const rpi=corrRetic/matTime;const r=Math.round(rpi*10)/10;
    let risk,label,interp,next;
    if(r>=2){risk='low';label:'RPI ≥2 — Appropriate Marrow Response';interp:'Bone marrow is responding appropriately to anaemia — suggests peripheral destruction (haemolysis) or blood loss.';
      next:'Investigate haemolysis: LDH, haptoglobin, bilirubin (indirect), blood film (fragments, spherocytes), DAT (direct antiglobulin test). If DAT positive: autoimmune haemolytic anaemia. If fragments: MAHA (TTP/HUS/DIC). If no haemolysis: investigate blood loss.';}
    else{risk='int';label:'RPI <2 — Inadequate Marrow Response';interp:'Bone marrow is NOT responding appropriately — suggests underproduction (deficiency, marrow failure, or suppression).';
      next:'Investigate underproduction: iron studies (ferritin, Tsat), B12, folate, TSH, renal function (EPO). If all normal: consider bone marrow biopsy for MDS, aplastic anaemia, infiltration.';}
    return{score:r,max:null,risk,label,stats:[['RPI',r.toFixed(1)],['Corrected Retic',corrRetic.toFixed(1)+'%'],['Maturation factor',matTime+'d']],interp,next};}
},
// ─── BATCH 5: FINAL — REACHING 100 CALCULATORS ──────────────────────────────
ghsg: {
  id:'ghsg', name:'GHSG Risk Groups', purpose:'Classify early-stage Hodgkin lymphoma into favourable, unfavourable, and advanced for treatment planning.',
  cat:'malignant', disease:'Hodgkin Lymphoma', icon:'💜',
  tags:['hodgkin','ghsg','early stage','risk','radiotherapy','hl'],
  evidence:{source:'Engert A et al. J Clin Oncol. 2010;28(17):2917-24.',guideline:'ESMO / NCCN / GHSG',year:2010,pmid:'20385991'},
  whenUse:'Hodgkin lymphoma early-stage (CS I-IIA) to guide treatment intensity and RT decisions.',
  whenNot:'Advanced HL (CS III-IV) — use IPS instead.',
  limits:'PET-adapted approaches (GHSG HD17) now allow RT omission in iPET-negative unfavourable early HL.',
  inputs:[{id:'stage',label:'Clinical Stage III-IV (Advanced)',type:'check'},
    {id:'bulk',label:'Large mediastinal mass (≥1/3 thoracic diameter)',type:'check'},
    {id:'extra',label:'Extranodal disease (E-lesion)',type:'check'},
    {id:'esr',label:'ESR ≥50 (A symptoms) or ≥30 (B symptoms)',type:'check'},
    {id:'nodes',label:'≥3 lymph node areas involved',type:'check'}],
  calc:(v)=>{const rfs=(v.bulk?1:0)+(v.extra?1:0)+(v.esr?1:0)+(v.nodes?1:0);
    if(v.stage) return{score:'Advanced',max:null,risk:'high',label:'Advanced Stage (CS III-IV)',stats:[],
      interp:'Advanced Hodgkin lymphoma.',next:'6×BEACOPPesc or 4×BEACOPPesc (iPET-adapted). ABVD ×6 if unfit for BEACOPP. BV-AVD per ECHELON-1. Interim PET after cycle 2.'};
    if(rfs===0) return{score:'Favourable',max:null,risk:'low',label:'Early Favourable (CS I-IIA, no risk factors)',stats:[['Risk factors',0]],
      interp:'Best prognosis group in early HL.',next:'2×ABVD + 20 Gy ISRT (standard). iPET-negative after 2×ABVD: consider omitting RT (HD16 trial). ~95% PFS at 5 years.'};
    return{score:'Unfavourable',max:null,risk:'int',label:'Early Unfavourable (CS I-IIA with risk factors)',stats:[['Risk factors',rfs]],
      interp:'Early-stage HL with adverse features.',next:'2×BEACOPPesc + 2×ABVD + 30 Gy ISRT (GHSG HD14). Or 4×ABVD + 30 Gy. iPET-negative: RT omission possible (HD17). PET-guided approach increasingly used.'};}
},
dbl: {
  id:'dbl', name:'Double-Hit / DEL Classifier', purpose:'Classify DLBCL by MYC/BCL2/BCL6 rearrangement and protein expression status.',
  cat:'malignant', disease:'DLBCL', icon:'🔴',
  tags:['dlbcl','double hit','double expressor','myc','bcl2','bcl6','hgbcl','fish'],
  evidence:{source:'Rosenwald A et al. Blood. 2019;134(12):942-950. WHO 2022.',guideline:'WHO 2022 / NCCN / ESMO',year:2022,pmid:'31292119'},
  whenUse:'All newly diagnosed DLBCL — MYC IHC should be performed routinely; FISH if MYC IHC ≥40%.',
  whenNot:'Indolent lymphomas. Post-treatment assessment.',
  limits:'DEL defined by IHC (MYC ≥40%, BCL2 ≥50%). DHL defined by FISH. WHO 2022 classifies DHL/THL as HGBCL with MYC and BCL2/BCL6 rearrangements.',
  inputs:[{id:'mycR',label:'MYC rearrangement (FISH)',type:'check'},{id:'bcl2R',label:'BCL2 rearrangement (FISH)',type:'check'},
    {id:'bcl6R',label:'BCL6 rearrangement (FISH)',type:'check'},
    {id:'mycI',label:'MYC protein ≥40% (IHC)',type:'check'},{id:'bcl2I',label:'BCL2 protein ≥50% (IHC)',type:'check'}],
  calc:(v)=>{let risk,label,os,interp,next;
    if(v.mycR&&v.bcl2R&&v.bcl6R){risk='vhigh';label='Triple-Hit Lymphoma';os='<15%';interp='MYC + BCL2 + BCL6 all rearranged. HGBCL-TH. Very poor prognosis.';next='DA-R-EPOCH preferred. Clinical trial. CNS prophylaxis. Consider ASCT in CR1. Polatuzumab-based or CAR-T trial if available.';}
    else if(v.mycR&&(v.bcl2R||v.bcl6R)){risk='high';label='Double-Hit Lymphoma (HGBCL-DH)';os='<25%';interp='MYC + BCL2 or BCL6 rearranged. WHO 2022: High-Grade B-Cell Lymphoma.';next='DA-R-EPOCH (NCCN preferred over R-CHOP). CNS prophylaxis recommended. Consider ASCT consolidation in CR1. Clinical trial.';}
    else if(v.mycI&&v.bcl2I){risk='int';label='Double-Expressor (DEL)';os='~40-50%';interp='MYC ≥40% + BCL2 ≥50% by IHC without rearrangement. ~20-30% of DLBCL.';next='R-CHOP remains standard but outcomes suboptimal. Consider intensified approach or clinical trial. CNS-IPI assessment.';}
    else{risk='low';label='Non-DEL / Non-DHL';os='~65-70%';interp='No high-risk MYC/BCL2 co-expression or rearrangement.';next='Standard R-CHOP ×6. Standard-risk DLBCL management.';}
    return{score:label,max:null,risk,label,stats:[['5yr OS',os]],interp,next};}
},
mipss70: {
  id:'mipss70', name:'MIPSS70+ v2.0', purpose:'Mutation and karyotype-enhanced prognostic scoring for primary MF in patients ≤70 years.',
  cat:'malignant', disease:'Myelofibrosis', icon:'🟣',
  tags:['myelofibrosis','mipss70','molecular','genetics','prognosis','mpn','transplant'],
  evidence:{source:'Tefferi A et al. J Clin Oncol. 2018;36(17):1769-70.',guideline:'NCCN / ELN',year:2018,pmid:'29708809'},
  whenUse:'Primary MF in patients ≤70 being considered for transplant — when molecular data (NGS) + karyotype available.',
  whenNot:'Post-PV/ET MF (use MYSEC-PM). Age >70 (DIPSS/DIPSS-Plus may be more appropriate). Without molecular data.',
  limits:'Requires comprehensive NGS panel AND karyotype. Most complex MF scoring system. Best discrimination for transplant-eligible patients.',
  inputs:[{id:'hgb',label:'Haemoglobin',type:'select',opts:[['≥10 g/dL (severe anaemia absent)',0],['8-9.9 g/dL',1],['<8 g/dL',2]]},
    {id:'blasts',label:'Peripheral blood blasts ≥2%',type:'check'},
    {id:'const',label:'Constitutional symptoms present',type:'check'},
    {id:'kary',label:'Karyotype category',type:'select',opts:[['Favourable (normal, sole -Y, sole del13q, sole del20q)',0],['Unfavourable (all others except very high risk)',1],['Very high risk (+8, -7/7q-, i(17q), inv(3), 12p-, 11q23, autosomal trisomies, complex)',2]]},
    {id:'hmr2',label:'Number of high-molecular-risk (HMR) mutations: ASXL1, EZH2, SRSF2, IDH1/2',type:'select',opts:[['0 HMR',0],['1 HMR',1],['≥2 HMR',2]]},
    {id:'calr2',label:'Absence of type 1/like CALR mutation',type:'check'}],
  calc:(v)=>{const s=(v.hgb||0)+(v.blasts?1:0)+(v.const?1:0)+(v.kary||0)*2+(v.hmr2||0)+(v.calr2?2:0);
    let risk,label,os;
    if(s<=2){risk='low';label='Low Risk';os='Not reached';}else if(s<=4){risk='int';label='Intermediate';os='~7.7 yrs';}
    else if(s<=8){risk='high';label='High Risk';os='~4.1 yrs';}else{risk='vhigh';label='Very High Risk';os='~1.8 yrs';}
    return{score:s,max:null,risk,label,stats:[['Median OS',os],['MIPSS70+ v2 Score',s]],
      interp:'MIPSS70+ v2.0: '+label+'. Most comprehensive MF scoring system.',
      next:s>=5?'TRANSPLANT RECOMMENDED if fit. Urgent referral. Ruxolitinib as bridge. HCT-CI assessment.':'Observation or symptom-directed therapy. Ruxolitinib for symptomatic spleen/symptoms. Reassess annually.'};}
},
pvdipss: {
  id:'pvdipss', name:'PV DIPSS', purpose:'Risk-stratify polycythaemia vera for myelofibrotic and blast transformation.',
  cat:'malignant', disease:'Polycythaemia Vera', icon:'🟣',
  tags:['pv','polycythaemia','dipss','transformation','mpn','prognosis'],
  evidence:{source:'Tefferi A et al. Leukemia. 2013;27(9):1874-81.',guideline:'ELN',year:2013,pmid:'23739289'},
  whenUse:'Polycythaemia vera to assess risk of fibrotic/blast transformation over time.',
  whenNot:'MF arising from PV (use MYSEC-PM once transformed). ET.',
  limits:'Guides monitoring frequency and clinical trial eligibility. Does not directly guide therapy changes (HCT target <0.45 is universal).',
  inputs:[{id:'age',label:'Age >67 years',type:'check'},{id:'wbc',label:'WBC ≥15 ×10⁹/L',type:'check'},
    {id:'hu',label:'History of venous thrombosis',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;let risk,label;
    if(s===0){risk='low';label='Low Risk';}else if(s===1){risk='int';label='Intermediate';}else{risk='high';label='High Risk';}
    return{score:s,max:3,risk,label,stats:[],
      interp:'PV DIPSS '+label+'. Guides monitoring for myelofibrotic transformation.',
      next:'All PV: target HCT <0.45 (phlebotomy ± hydroxyurea). Aspirin 75mg daily. High risk: cytoreduction with hydroxyurea. Monitor for transformation: increasing splenomegaly, leukoerythroblastic film, new cytopenias.'};}
},
burkitt: {
  id:'burkitt', name:'Burkitt Lymphoma Risk Groups', purpose:'Risk-stratify Burkitt lymphoma to guide treatment intensity.',
  cat:'malignant', disease:'Burkitt Lymphoma', icon:'🔴',
  tags:['burkitt','lymphoma','risk','cns','lactate dehydrogenase','aggressive'],
  evidence:{source:'Mead GM et al. Blood. 2008;112(1):64-71. CODOX-M/IVAC.',guideline:'NCCN / ESMO',year:2008,pmid:'18390769'},
  whenUse:'Newly diagnosed Burkitt lymphoma/leukaemia for treatment intensity stratification.',
  whenNot:'Diffuse large B-cell (use IPI). Burkitt-like/HGBCL-NOS.',
  limits:'Risk criteria vary between protocols (CODOX-M/IVAC vs DA-R-EPOCH vs hyper-CVAD). This uses the Magrath/modified Magrath criteria.',
  inputs:[{id:'stage',label:'Stage III-IV or abdominal disease',type:'check'},{id:'ldh',label:'LDH above ULN',type:'check'},
    {id:'bulk',label:'Tumour mass ≥10 cm',type:'check'},{id:'cns',label:'CNS involvement',type:'check'},
    {id:'bm',label:'Bone marrow involvement',type:'check'}],
  calc:(v)=>{const n=Object.values(v).filter(Boolean).length;const high=n>=1;
    return{score:high?'High':'Low',max:null,risk:high?'high':'low',label:high?'High Risk':'Low Risk',
      stats:[['Risk factors',n]],
      interp:high?'High-risk Burkitt lymphoma.':'Low-risk (completely resected Stage I, normal LDH).',
      next:high?'CODOX-M/IVAC ×4 cycles (alternating) + Rituximab. Intrathecal methotrexate/cytarabine for CNS prophylaxis (all patients). Rasburicase for TLS prophylaxis. URGENT treatment — Burkitt doubles every 24-48 hours.':
      'Modified CODOX-M ×3 + R (no IVAC). CNS prophylaxis still required. Excellent prognosis (~90% cure rate).'};}
},
pinke: {
  id:'pinke', name:'PINK-E Score', purpose:'Predict survival in extranodal NK/T-cell lymphoma (nasal type).',
  cat:'malignant', disease:'NK/T-Cell Lymphoma', icon:'🟤',
  tags:['nktcl','pink','nk','t-cell','nasal','extranodal','ebv'],
  evidence:{source:'Kim SJ et al. Lancet Oncol. 2016;17(8):1116-24.',guideline:'NCCN / ESMO',year:2016,pmid:'27432483'},
  whenUse:'Newly diagnosed extranodal NK/T-cell lymphoma for treatment planning.',
  whenNot:'Other T-cell lymphomas (PTCL-NOS: use PIT).',
  limits:'Relatively rare disease. PINK-E adds EBV DNA to clinical PINK score.',
  inputs:[{id:'age',label:'Age >60 years',type:'check'},{id:'stage',label:'Stage III-IV',type:'check'},
    {id:'ln',label:'Non-nasal type (distant lymph node involvement)',type:'check'},
    {id:'ebv',label:'EBV DNA detectable in blood (PINK-E)',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;let risk,label,os;
    if(s===0){risk='low';label='Low Risk';os='~81%';}else if(s===1){risk='int';label='Intermediate';os='~62%';}
    else{risk='high';label='High Risk';os='~25%';}
    return{score:s,max:4,risk,label,stats:[['5yr OS',os]],interp:'PINK-E '+label+'.',
      next:'Treatment: concurrent chemoradiotherapy for localised (SMILE or DeVIC + RT). Advanced: SMILE or AspaMetDex. L-asparaginase-based regimens preferred. EBV DNA monitoring during treatment.'};}
},
ielsg24: {
  id:'ielsg24', name:'IELSG-24 Response Score', purpose:'Predict outcome after high-dose methotrexate for PCNSL based on initial response.',
  cat:'malignant', disease:'PCNSL', icon:'🧠',
  tags:['pcnsl','ielsg','response','methotrexate','cns lymphoma'],
  evidence:{source:'Ferreri AJ et al. Lancet Haematol. 2015;2(6):e246-55.',guideline:'ESMO',year:2015,pmid:'26688235'},
  whenUse:'PCNSL patients after HD-MTX-based induction to guide consolidation strategy.',
  whenNot:'Before starting induction. Non-PCNSL CNS tumours.',
  limits:'Requires post-induction MRI response assessment. Guides choice between WBRT, ASCT consolidation, or observation.',
  inputs:[{id:'resp',label:'Response to HD-MTX induction',type:'select',opts:[['Complete Response (CR)',0],['Partial Response (PR)',1],['Stable/Progressive Disease',2]]}],
  calc:(v)=>{const r=v.resp;
    if(r===0) return{score:'CR',max:null,risk:'low',label:'Complete Response',stats:[['Response','CR']],
      interp:'CR after HD-MTX induction — best outcomes.',next:'Consolidation options: high-dose chemotherapy + ASCT (preferred if <65 and fit), or reduced-dose WBRT, or observation with MRD monitoring. ASCT consolidation increasingly preferred to avoid late neurotoxicity of WBRT.'};
    if(r===1) return{score:'PR',max:null,risk:'int',label:'Partial Response',stats:[['Response','PR']],
      interp:'PR after induction — reasonable outcomes with consolidation.',next:'Consolidation recommended: ASCT or WBRT. Continue HD-MTX if deepening response. Consider salvage regimen if suboptimal PR.'};
    return{score:'SD/PD',max:null,risk:'high',label:'Stable/Progressive Disease',stats:[['Response','SD/PD']],
      interp:'Poor response to HD-MTX — unfavourable prognosis.',next:'Salvage chemotherapy: high-dose cytarabine, temozolomide, or ibrutinib. Clinical trial if available. WBRT for palliation. Discuss goals of care.'};}
},
mzlipi: {
  id:'mzlipi', name:'MZL-IPI', purpose:'Predict survival across all subtypes of marginal zone lymphoma.',
  cat:'malignant', disease:'Marginal Zone Lymphoma', icon:'🟢',
  tags:['mzl','marginal zone','ipi','splenic','nodal','extranodal','prognosis'],
  evidence:{source:'Thieblemont C et al. Blood. 2017;130(13):1490-8.',guideline:'ESMO',year:2017,pmid:'28743838'},
  whenUse:'All MZL subtypes (extranodal, nodal, splenic) at diagnosis.',
  whenNot:'Transformed MZL to DLBCL.',
  limits:'Less well-validated than MALT-IPI for extranodal MZL specifically.',
  inputs:[{id:'age',label:'Age ≥70',type:'check'},{id:'stage',label:'Stage III-IV',type:'check'},
    {id:'ldh',label:'LDH above ULN',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;let risk,label,efs;
    if(s===0){risk='low';label='Low Risk';efs='~70%';}else if(s===1){risk='int';label='Intermediate';efs='~56%';}
    else{risk='high';label='High Risk';efs='~29%';}
    return{score:s,max:3,risk,label,stats:[['5yr EFS',efs]],interp:'MZL-IPI '+label+'.',
      next:'Splenic MZL: splenectomy or Rituximab. Nodal MZL: R-CVP/R-Benda. Extranodal: site-dependent (H. pylori eradication for gastric, RT for localised, R-chemo for advanced).'};}
},
dri: {
  id:'dri', name:'Disease Risk Index (DRI)', purpose:'Classify disease risk for allogeneic SCT outcomes based on diagnosis and disease status.',
  cat:'malignant', disease:'Transplant', icon:'🔄',
  tags:['dri','transplant','disease risk','allogeneic','sct','prognosis'],
  evidence:{source:'Armand P et al. Blood. 2012;120(4):905-13.',guideline:'CIBMTR',year:2012,pmid:'22709687'},
  whenUse:'Pre-transplant risk assessment — combines with HCT-CI for comprehensive risk-benefit analysis.',
  whenNot:'Autologous SCT.',
  limits:'Does not capture all molecular subtypes. Combined with HCT-CI gives the most comprehensive pre-transplant risk picture.',
  inputs:[{id:'dx',label:'Disease + status',type:'select',opts:[
    ['AML CR1 (favourable cytogenetics)',0],['AML CR1 (intermediate)',1],['AML CR2 / MDS (low IPSS-R)',1],
    ['AML CR1 (adverse) / AML CR3+ / ALL CR1',2],['AML not in CR / MDS (high IPSS-R) / refractory',3],
    ['CML CP1 / HL CR / NHL CR1',0],['CML AP / NHL PR / HL relapsed',2],['CML BC / refractory NHL-HL',3]]}],
  calc:(v)=>{const r=v.dx||0;let risk,label,os;
    if(r===0){risk='low';label='Low DRI';os='~64%';}else if(r===1){risk='int';label:'Intermediate DRI';os='~46%';}
    else if(r===2){risk='high';label:'High DRI';os='~32%';}else{risk='vhigh';label:'Very High DRI';os='~19%';}
    return{score:label,max:null,risk,label,stats:[['3yr OS post-SCT',os]],
      interp:'DRI: '+label+'. Combine with HCT-CI for comprehensive transplant risk assessment.',
      next:r>=2?'High disease risk. Discuss risk-benefit carefully. Consider reduced-toxicity conditioning, post-SCT maintenance, or clinical trial. Goals of care discussion.':'Acceptable disease risk for transplant. Proceed with conditioning per protocol.'};}
},
crs: {
  id:'crs', name:'CRS / ICANS Grading (CAR-T)', purpose:'Grade cytokine release syndrome and immune effector cell-associated neurotoxicity from CAR-T therapy.',
  cat:'benign', disease:'CAR-T Toxicity', icon:'🧬',
  tags:['car-t','crs','icans','cytokine','neurotoxicity','tocilizumab','chimeric'],
  evidence:{source:'Lee DW et al. Biol Blood Marrow Transplant. 2019;25(4):625-38.',guideline:'ASTCT Consensus / EBMT',year:2019,pmid:'30592986'},
  whenUse:'Patients receiving CAR-T cell therapy (e.g., axi-cel, tisa-cel, liso-cel, brexu-cel) who develop fever, hypotension, hypoxia, or neurological symptoms.',
  whenNot:'Fever/infection unrelated to CAR-T. Before CAR-T infusion.',
  limits:'CRS and ICANS may overlap. Grading should use ASTCT consensus criteria. ICE score ≤7 defines ICANS ≥Grade 1.',
  inputs:[{id:'fever',label:'Fever ≥38°C',type:'check'},
    {id:'hypo',label:'Hypotension',type:'select',opts:[['None',0],['Not requiring vasopressors',1],['Requiring 1 vasopressor ± vasopressin',2],['Requiring ≥2 vasopressors (not vasopressin)',3]]},
    {id:'hypox',label:'Hypoxia',type:'select',opts:[['None',0],['Low-flow nasal cannula (≤6L)',1],['High-flow/facemask',2],['Positive pressure (CPAP/BiPAP/mechanical ventilation)',3]]},
    {id:'ice',label:'ICE score (Immune Effector Cell Encephalopathy)',type:'select',opts:[['10 (normal)',0],['7-9',1],['3-6',2],['0-2',3],['Unable to assess (obtunded)',4]]}],
  calc:(v)=>{const crsGrade=v.fever?(Math.max(v.hypo||0,v.hypox||0)+1):0;
    const icansGrade=v.ice||0;let risk,label,interp,next;
    if(crsGrade<=1&&icansGrade<=1){risk='low';label='CRS Grade '+(v.fever?1:0)+' / ICANS Grade '+icansGrade;interp='Mild toxicity.';
      next='CRS G1: antipyretics, monitoring. ICANS G1: supportive care, neurological monitoring every 4-8 hours. Exclude infection (blood cultures). Hold further CAR-T doses if multi-infusion protocol.';}
    else if(crsGrade<=2&&icansGrade<=2){risk='int';label='CRS Grade '+crsGrade+' / ICANS Grade '+icansGrade;interp='Moderate toxicity.';
      next='CRS G2: TOCILIZUMAB 8mg/kg IV (max 800mg). Repeat in 8h if no improvement (max 3 doses). IV fluids. ICANS G2: dexamethasone 10mg IV q6h. Monitor ICE score q4-6h. MRI brain if focal neurology. EEG if seizures.';}
    else{risk='high';label='CRS Grade '+Math.min(crsGrade,4)+' / ICANS Grade '+Math.min(icansGrade,4);interp='Severe/life-threatening toxicity.';
      next='CRS G3-4: TOCILIZUMAB + CORTICOSTEROIDS (methylprednisolone 2mg/kg/day). ICU transfer. Vasopressors as needed. ICANS G3-4: dexamethasone 10mg IV q6h or methylprednisolone 1g/day ×3 if refractory. Seizure prophylaxis (levetiracetam). Avoid intrathecal therapy. ICU mandatory.';}
    return{score:'CRS '+Math.min(crsGrade,4)+' / ICANS '+Math.min(icansGrade,4),max:null,risk,label,stats:[['CRS Grade',Math.min(crsGrade,4)],['ICANS Grade',Math.min(icansGrade,4)]],interp,next};}
},
improve: {
  id:'improve', name:'IMPROVE VTE Risk', purpose:'Assess VTE risk in acutely ill medical inpatients — alternative to Padua with added bleeding assessment.',
  cat:'benign', disease:'VTE Prophylaxis', icon:'🏥',
  tags:['improve','vte','prophylaxis','medical','inpatient','bleeding'],
  evidence:{source:'Spyropoulos AC et al. J Am Coll Cardiol. 2011;57(12):1404-23.',guideline:'ACCP',year:2011,pmid:'21388771'},
  whenUse:'Medical inpatients for combined VTE and bleeding risk assessment.',
  whenNot:'Surgical patients (use Caprini). Already anticoagulated.',
  limits:'More complex than Padua. UK practice: NICE VTE risk assessment applies to all admissions.',
  inputs:[{id:'prev',label:'Previous VTE',type:'select',opts:[['No',0],['Yes',3]]},{id:'thrombo',label:'Known thrombophilia',type:'select',opts:[['No',0],['Yes',2]]},
    {id:'paralysis',label:'Current lower limb paralysis/paresis',type:'select',opts:[['No',0],['Yes',2]]},{id:'cancer',label:'Active cancer',type:'select',opts:[['No',0],['Yes',2]]},
    {id:'immob',label:'Immobilisation ≥7 days',type:'select',opts:[['No',0],['Yes',1]]},{id:'icu',label:'ICU/CCU stay',type:'select',opts:[['No',0],['Yes',1]]},
    {id:'age',label:'Age >60 years',type:'select',opts:[['No',0],['Yes',1]]}],
  calc:(v)=>{const s=Object.values(v).reduce((a,b)=>a+b,0);let risk,label;
    if(s<=1){risk='low';label='Low VTE Risk';}else if(s<=3){risk='int';label='Moderate VTE Risk';}else{risk='high';label='High VTE Risk';}
    return{score:s,max:null,risk,label,stats:[['IMPROVE VTE Score',s]],
      interp:'IMPROVE VTE: '+label+'. Score ≥4 associated with ~4× increased VTE risk.',
      next:s>=2?'Pharmacological thromboprophylaxis recommended unless bleeding risk prohibitive. Enoxaparin 40mg SC daily. Reassess daily.':'Mobilisation and mechanical prophylaxis. Reassess if clinical status changes.'};}
},
ldlc: {
  id:'ldlc', name:'LDL-C Calculator', purpose:'Calculate LDL cholesterol using the Friedewald equation when direct LDL not available.',
  cat:'general', disease:'Lipids', icon:'❤️',
  tags:['ldl','cholesterol','friedewald','lipid','cardiovascular','statin'],
  evidence:{source:'Friedewald WT et al. Clin Chem. 1972;18(6):499-502.',guideline:'ESC / NICE',year:1972,pmid:'4337382'},
  whenUse:'Interpreting lipid panel when only total cholesterol, HDL, and triglycerides available.',
  whenNot:'TG >4.5 mmol/L (Friedewald invalid). Direct LDL available.',
  limits:'Invalid at TG >4.5 mmol/L. Less accurate at very low LDL levels. Martin-Hopkins equation is more accurate but more complex.',
  inputs:[{id:'tc',label:'Total cholesterol (mmol/L)',type:'number',min:1,max:20,step:0.1},
    {id:'hdl',label:'HDL-C (mmol/L)',type:'number',min:0.3,max:5,step:0.1},
    {id:'tg',label:'Triglycerides (mmol/L)',type:'number',min:0.3,max:30,step:0.1}],
  calc:(v)=>{if(!v.tc||!v.hdl||!v.tg) return{score:'-',max:null,risk:'info',label:'Enter lipid values',stats:[],interp:'',next:''};
    const valid=v.tg<=4.5;const ldl=v.tc-v.hdl-(v.tg/2.2);const nonHDL=v.tc-v.hdl;
    let risk,label;
    if(!valid){risk='int';label='Invalid (TG >4.5)';}
    else if(ldl<1.8){risk='low';label='Very high-risk target achieved (<1.8)';}
    else if(ldl<2.6){risk='low';label='High-risk target range (1.8-2.6)';}
    else if(ldl<3.4){risk='int';label='Above optimal';}
    else{risk='high';label='Elevated LDL-C';}
    return{score:valid?ldl.toFixed(2):'N/A',max:null,risk,label,stats:[['LDL-C',valid?ldl.toFixed(2)+' mmol/L':'Invalid'],['Non-HDL-C',nonHDL.toFixed(2)+' mmol/L'],['TC',v.tc],['HDL',v.hdl],['TG',v.tg]],
      interp:valid?'Friedewald LDL-C = '+ldl.toFixed(2)+' mmol/L.':'Friedewald equation invalid when TG >4.5 mmol/L. Order direct LDL measurement.',
      next:valid&&ldl>=3.4?'Elevated LDL. QRISK/10yr CVD risk assessment. Statin if indicated (NICE: atorvastatin 20mg if QRISK ≥10%). Target ≥50% reduction from baseline on high-intensity statin.':'Continue risk-based management.'};}
},
osmo: {
  id:'osmo', name:'Serum Osmolality', purpose:'Calculate expected serum osmolality and osmolar gap to detect unmeasured osmoles (toxins).',
  cat:'general', disease:'Electrolytes', icon:'⚗️',
  tags:['osmolality','osmolar gap','toxic alcohol','methanol','ethylene glycol','electrolyte'],
  evidence:{source:'Standard clinical chemistry.',guideline:'Clinical Practice',year:2024,pmid:''},
  whenUse:'Suspected toxic alcohol ingestion (methanol, ethylene glycol). Unexplained metabolic acidosis. Altered consciousness with metabolic derangement.',
  whenNot:'Routine electrolyte monitoring without clinical concern.',
  limits:'Requires measured osmolality for osmolar gap calculation. Ethanol accounts for most "gaps" — exclude before suspecting toxins.',
  inputs:[{id:'na',label:'Sodium (mmol/L)',type:'number',min:100,max:170,step:1},
    {id:'urea',label:'Urea (mmol/L)',type:'number',min:0,max:80,step:0.1},
    {id:'gluc',label:'Glucose (mmol/L)',type:'number',min:1,max:100,step:0.1},
    {id:'meas',label:'Measured osmolality (mOsm/kg) — if available',type:'number',min:200,max:500,step:1}],
  calc:(v)=>{if(!v.na) return{score:'-',max:null,risk:'info',label:'Enter sodium at minimum',stats:[],interp:'',next:''};
    const calc=2*(v.na||140)+(v.urea||5)+(v.gluc||5);const gap=v.meas?(v.meas-calc):null;
    let risk,label;
    if(gap!==null&&gap>10){risk='high';label='Elevated Osmolar Gap (>10)';}
    else if(gap!==null){risk='low';label='Normal Osmolar Gap';}
    else{risk='low';label='Calculated Osmolality: '+calc;}
    return{score:calc,max:null,risk,label,stats:[['Calculated Osm',calc+' mOsm/kg'],...(gap!==null?[['Osmolar Gap',gap.toFixed(0)+' mOsm/kg']]:[])] ,
      interp:gap!==null&&gap>10?'Elevated osmolar gap >10: consider toxic alcohols (methanol, ethylene glycol, isopropanol), ethanol, mannitol, contrast agents.':'Osmolality within expected range.',
      next:gap!==null&&gap>10?'URGENT: check ethanol level (most common cause of gap). If ethanol excluded: suspect toxic alcohol ingestion. Send methanol, ethylene glycol levels. Fomepizole empirically if strong suspicion. Ophthalmology if methanol (visual symptoms). Nephrology for haemodialysis.':'No osmolar gap detected.'};}
},
winters: {
  id:'winters', name:"Winter's Formula", purpose:'Calculate expected pCO₂ compensation in metabolic acidosis — detect superimposed respiratory disorders.',
  cat:'general', disease:'Acid-Base', icon:'🫁',
  tags:['winters','compensation','metabolic acidosis','pco2','respiratory','acid-base'],
  evidence:{source:'Albert MS et al. Ann Intern Med. 1967;66(2):312-22.',guideline:'Clinical Practice',year:1967,pmid:'6016545'},
  whenUse:'Metabolic acidosis to check if respiratory compensation is appropriate.',
  whenNot:'Primary respiratory disorders. Metabolic alkalosis (different compensation formula).',
  limits:'Only applies to metabolic acidosis. Expected pCO₂ = 1.5 × [HCO₃] + 8 ± 2. If actual pCO₂ is outside this range: mixed disorder.',
  inputs:[{id:'hco3',label:'Bicarbonate (mmol/L)',type:'number',min:2,max:40,step:0.1},
    {id:'pco2',label:'Actual pCO₂ (mmHg)',type:'number',min:10,max:80,step:0.1}],
  calc:(v)=>{if(!v.hco3||!v.pco2) return{score:'-',max:null,risk:'info',label:'Enter HCO₃ and pCO₂',stats:[],interp:'',next:''};
    const expL=1.5*v.hco3+6,expH=1.5*v.hco3+10;let risk,label,interp,next;
    if(v.pco2<expL){risk='int';label='pCO₂ LOWER than expected';interp='Actual pCO₂ ('+v.pco2+') below expected range ('+expL.toFixed(0)+'-'+expH.toFixed(0)+').';next='Superimposed RESPIRATORY ALKALOSIS on top of metabolic acidosis. Consider: anxiety/pain (hyperventilation), sepsis (early), liver failure, salicylate toxicity, CNS pathology.';}
    else if(v.pco2>expH){risk='high';label='pCO₂ HIGHER than expected';interp='Actual pCO₂ ('+v.pco2+') above expected range.';next='Superimposed RESPIRATORY ACIDOSIS. The patient is NOT compensating adequately. Consider: respiratory failure, exhaustion, CNS depression, airway obstruction, COPD exacerbation. Monitor closely — may need ventilatory support.';}
    else{risk='low';label='Appropriate Compensation';interp='pCO₂ ('+v.pco2+') within expected range ('+expL.toFixed(0)+'-'+expH.toFixed(0)+').';next='Pure metabolic acidosis with appropriate respiratory compensation. No superimposed respiratory disorder.';}
    return{score:v.pco2,max:null,risk,label,stats:[['Expected pCO₂',expL.toFixed(0)+'-'+expH.toFixed(0)+' mmHg'],['Actual pCO₂',v.pco2+' mmHg']],interp,next};}
},
timi: {
  id:'timi', name:'TIMI Score (UA/NSTEMI)', purpose:'Predict 14-day risk of death, MI, or urgent revascularisation in unstable angina/NSTEMI.',
  cat:'general', disease:'Cardiology', icon:'❤️',
  tags:['timi','nstemi','unstable angina','acs','cardiac','risk'],
  evidence:{source:'Antman EM et al. JAMA. 2000;284(7):835-42.',guideline:'AHA/ACC / ESC',year:2000,pmid:'10938172'},
  whenUse:'NSTEMI or unstable angina to guide invasive vs conservative strategy.',
  whenNot:'STEMI (go to cath lab). Stable angina.',
  limits:'Less accurate than GRACE for mortality prediction. Simpler to use at the bedside.',
  inputs:[{id:'age',label:'Age ≥65 years',type:'check'},{id:'rf',label:'≥3 CAD risk factors (HTN, DM, dyslipidaemia, smoking, family Hx)',type:'check'},
    {id:'cad',label:'Known CAD (≥50% stenosis)',type:'check'},{id:'asa',label:'Aspirin use in last 7 days',type:'check'},
    {id:'angina',label:'≥2 angina episodes in last 24 hours',type:'check'},{id:'ste',label:'ST deviation ≥0.5 mm on ECG',type:'check'},
    {id:'trop',label:'Elevated cardiac biomarkers (troponin)',type:'check'}],
  calc:(v)=>{const s=Object.values(v).filter(Boolean).length;let risk,label,event;
    if(s<=2){risk='low';label='Low Risk';event='~8%';}else if(s<=4){risk='int';label='Intermediate';event='~13-20%';}
    else{risk='high';label='High Risk';event='~26-41%';}
    return{score:s,max:7,risk,label,stats:[['14-day event rate',event],['TIMI Score',s+'/7']],interp:'TIMI '+s+': '+label+' for 14-day adverse events.',
      next:s>=5?'HIGH RISK: early invasive strategy (angiography within 24h). Dual antiplatelet + anticoagulation. GPIIb/IIIa inhibitor consideration.':s>=3?'Moderate risk. Consider invasive strategy. Dual antiplatelet therapy.':'Low risk. Conservative strategy reasonable. Serial troponins. Non-invasive testing.'};}
},
cisplatin: {
  id:'cisplatin', name:'Cisplatin Eligibility', purpose:'Assess fitness for cisplatin-based chemotherapy using standard eligibility criteria.',
  cat:'general', disease:'Chemo Fitness', icon:'💊',
  tags:['cisplatin','eligibility','fitness','renal','hearing','neuropathy','chemotherapy'],
  evidence:{source:'Galsky MD et al. J Clin Oncol. 2011;29(18):2432.',guideline:'Expert Consensus',year:2011,pmid:'21632511'},
  whenUse:'Patients being considered for cisplatin-containing regimens (e.g., DHAP, ICE, BEP, cisplatin-gemcitabine).',
  whenNot:'Already decided on carboplatin. Non-platinum regimens.',
  limits:'Galsky criteria were developed for urothelial carcinoma but widely applied. Clinical judgment remains essential.',
  inputs:[{id:'gfr',label:'CrCl or GFR',type:'select',opts:[['≥60 mL/min',0],['50-59 mL/min',1],['<50 mL/min',2]]},
    {id:'hearing',label:'Hearing loss (Grade ≥2 audiometric)',type:'check'},
    {id:'neuro',label:'Peripheral neuropathy (Grade ≥2)',type:'check'},
    {id:'hf',label:'Heart failure (NYHA Class III-IV)',type:'check'},
    {id:'ecog2',label:'ECOG PS ≥2',type:'check'}],
  calc:(v)=>{const gfr=v.gfr||0;const contras=(v.hearing?1:0)+(v.neuro?1:0)+(v.hf?1:0)+(v.ecog2?1:0);
    if(gfr>=2||contras>=1){return{score:'Ineligible',max:null,risk:'high',label:'Cisplatin INELIGIBLE',
      stats:[['Contraindications found',contras+(gfr>=2?1:0)]],
      interp:'One or more contraindications to cisplatin identified.',
      next:'Use CARBOPLATIN-based alternative (Calvert formula for dosing). If CrCl 50-59: borderline — discuss with oncology, split-dose cisplatin may be feasible. Address modifiable factors (hydration for renal, hearing aids assessment).'};}
    return{score:'Eligible',max:null,risk:'low',label:'Cisplatin ELIGIBLE',stats:[],
      interp:'No standard contraindications to cisplatin identified.',
      next:'Proceed with cisplatin-based regimen. Ensure adequate hydration protocol (pre and post). Monitor renal function before each cycle. Audiometry at baseline if hearing concerns. Recalculate CrCl before each cycle.'};}
},
chemodose: {
  id:'chemodose', name:'BSA Chemo Dosing', purpose:'Calculate chemotherapy dose based on body surface area (BSA) and prescribed mg/m².',
  cat:'general', disease:'Chemo Dosing', icon:'💊',
  tags:['chemotherapy','dosing','bsa','mg/m2','cytotoxic','calculation'],
  evidence:{source:'Standard oncology practice.',guideline:'Clinical Practice',year:2024,pmid:''},
  whenUse:'Any chemotherapy agent dosed by mg/m². Enter BSA and dose per m².',
  whenNot:'Agents with fixed dosing (e.g., Rituximab 375mg/m² already calculated). AUC-dosed agents (use Calvert for carboplatin).',
  limits:'BSA capping varies by protocol. ASCO recommends using actual body weight for obese patients (no arbitrary dose reduction). Always verify with pharmacy.',
  inputs:[{id:'bsa',label:'BSA (m²)',type:'number',min:1,max:3,step:0.01},
    {id:'mgm2',label:'Dose (mg/m²)',type:'number',min:1,max:10000,step:1}],
  calc:(v)=>{if(!v.bsa||!v.mgm2) return{score:'-',max:null,risk:'info',label:'Enter BSA and dose',stats:[],interp:'',next:''};
    const dose=v.bsa*v.mgm2;
    return{score:Math.round(dose),max:null,risk:'low',label:'Total dose = '+Math.round(dose)+' mg',
      stats:[['Total dose',Math.round(dose)+' mg'],['BSA',v.bsa+' m²'],['Prescribed',v.mgm2+' mg/m²']],
      interp:'Calculated: '+v.mgm2+' mg/m² × '+v.bsa+' m² = '+Math.round(dose)+' mg.',
      next:'Verify with pharmacy before administration. Check protocol for dose capping, rounding rules, and maximum dose limits. Adjust for renal/hepatic function as per protocol. Pre-medication as required.'};}
},
tsat: {
  id:'tsat', name:'Transferrin Saturation', purpose:'Calculate transferrin saturation to assess iron status — key distinction between iron deficiency and iron overload.',
  cat:'general', disease:'Iron Studies', icon:'🔬',
  tags:['transferrin','saturation','iron','tsat','deficiency','overload','haemochromatosis'],
  evidence:{source:'Standard haematology/biochemistry.',guideline:'BSH / BTS',year:2024,pmid:''},
  whenUse:'Interpreting iron studies. Ferritin alone is insufficient — Tsat provides functional iron assessment.',
  whenNot:'—',limits:'Tsat varies diurnally (higher in morning). Inflammation can lower serum iron and raise ferritin (misleading picture). Fasting sample preferred.',
  inputs:[{id:'fe',label:'Serum iron (µmol/L)',type:'number',min:1,max:100,step:0.1},
    {id:'tibc',label:'TIBC or transferrin (µmol/L)',type:'number',min:10,max:120,step:0.1}],
  calc:(v)=>{if(!v.fe||!v.tibc) return{score:'-',max:null,risk:'info',label:'Enter iron and TIBC',stats:[],interp:'',next:''};
    const tsat=(v.fe/v.tibc)*100;const t=Math.round(tsat);
    let risk,label,interp,next;
    if(t<16){risk='high';label='Low Tsat (<16%) — Iron Deficiency';interp='Transferrin saturation <16% confirms functional iron deficiency.';
      next='If ferritin also low (<30): absolute iron deficiency. Oral iron (ferrous sulphate 200mg OD with vitamin C on empty stomach) or IV iron if intolerant/malabsorption. Investigate cause in males and post-menopausal females (GI referral).';}
    else if(t<=45){risk='low';label='Normal Tsat (16-45%)';interp='Normal iron availability.';next='No iron supplementation needed. If ferritin elevated with normal Tsat: consider inflammatory cause.';}
    else{risk='int';label='High Tsat (>45%) — Possible Iron Overload';interp='Elevated transferrin saturation suggests iron overload.';
      next:'If Tsat >45% AND elevated ferritin: check HFE genotyping (C282Y homozygosity = hereditary haemochromatosis). If HFE negative: secondary causes (transfusional, ineffective erythropoiesis, liver disease). Liver MRI (T2*/FerriScan) for iron quantification.';}
    return{score:t+'%',max:null,risk,label,stats:[['Tsat',t+'%'],['Serum Iron',v.fe+' µmol/L'],['TIBC',v.tibc+' µmol/L']],interp,next};}
},
karnofsky: {
  id:'karnofsky', name:'Karnofsky Performance Status', purpose:'Standardised functional status scale (0-100%) — widely used in clinical trials and treatment decisions.',
  cat:'general', disease:'Fitness', icon:'🏃',
  tags:['karnofsky','kps','performance','status','fitness','oncology','functional'],
  evidence:{source:'Karnofsky DA, Burchenal JH. 1949.',guideline:'Standard Oncology Practice',year:1949,pmid:''},
  whenUse:'Clinical trial eligibility assessment. Prognosis estimation. Treatment planning alongside ECOG.',
  whenNot:'—',limits:'Subjective. More granular than ECOG (11-point scale vs 5-point). Conversion: KPS 80-100 ≈ ECOG 0-1, KPS 60-70 ≈ ECOG 2, KPS <50 ≈ ECOG 3-4.',
  inputs:[{id:'kps',label:'Karnofsky Performance Status',type:'select',opts:[
    ['100%: Normal, no complaints, no disease evidence',100],['90%: Able to carry on normal activity, minor symptoms',90],
    ['80%: Normal activity with effort, some symptoms',80],['70%: Cares for self, unable to carry on normal activity/work',70],
    ['60%: Requires occasional assistance but cares for most needs',60],['50%: Requires considerable assistance and frequent medical care',50],
    ['40%: Disabled, requires special care and assistance',40],['30%: Severely disabled, hospitalisation indicated',30],
    ['20%: Very sick, active supportive treatment necessary',20],['10%: Moribund',10]]}],
  calc:(v)=>{const k=v.kps||100;let risk,label,ecog;
    if(k>=80){risk='low';ecog='ECOG 0-1';label='Good functional status';}
    else if(k>=60){risk='int';ecog='ECOG 2';label='Reduced but ambulatory';}
    else if(k>=40){risk='high';ecog='ECOG 3';label='Poor functional status';}
    else{risk='vhigh';ecog='ECOG 4';label='Severely disabled/moribund';}
    return{score:k+'%',max:null,risk,label:'KPS '+k+'% — '+label,stats:[['KPS',k+'%'],['ECOG equiv','~'+ecog]],
      interp:'KPS '+k+'%: '+label+'.',
      next:k>=70?'Likely fit for standard-intensity systemic therapy. Most clinical trials require KPS ≥60-70%.':k>=50?'Reduced fitness. Dose-reduced or less intensive regimens. Carefully weigh treatment benefit vs toxicity.':'Very poor functional status. Best supportive care for most malignancies. Palliative care referral. Goals of care discussion.'};}
},
// ─── CALCULATORS 99 & 100 ────────────────────────────────────────────────────
qrisk3: {
  id:'qrisk3', name:'QRISK3 (Simplified)', purpose:'Estimate 10-year cardiovascular disease risk to guide statin therapy decisions per NICE guidelines.',
  cat:'general', disease:'Cardiology', icon:'❤️',
  tags:['qrisk','cardiovascular','cvd','risk','statin','nice','lipid','prevention'],
  evidence:{source:'Hippisley-Cox J et al. BMJ. 2017;357:j2099.',guideline:'NICE CG181 / NHS Health Check',year:2017,pmid:'28536104'},
  whenUse:'Primary prevention CVD risk assessment in patients aged 25-84 without established CVD. NICE: offer atorvastatin 20mg if QRISK3 ≥10%.',
  whenNot:'Established CVD (already high risk — treat). Type 1 diabetes (separate risk assessment). eGFR <60 or albuminuria (already high risk). Familial hypercholesterolaemia.',
  limits:'This is a SIMPLIFIED estimate — the full QRISK3 algorithm uses 21 variables with continuous modelling. For precise scores, use the official QRISK3 calculator at qrisk.org. This tool provides a clinical approximation for bedside decision-making.',
  inputs:[
    {id:'age',label:'Age (years)',type:'number',min:25,max:84,step:1},
    {id:'sex',label:'Sex',type:'select',opts:[['Female',0],['Male',1]]},
    {id:'smoke',label:'Smoking status',type:'select',opts:[['Non-smoker',0],['Ex-smoker',1],['Light (<10/day)',2],['Moderate (10-19)',3],['Heavy (≥20)',4]]},
    {id:'dm',label:'Type 2 diabetes',type:'check'},
    {id:'htn',label:'On treatment for hypertension',type:'check'},
    {id:'sbp',label:'Systolic BP (mmHg)',type:'number',min:70,max:250,step:1},
    {id:'tc_hdl',label:'Total cholesterol / HDL-C ratio',type:'number',min:1,max:15,step:0.1},
    {id:'bmi',label:'BMI (kg/m²)',type:'number',min:15,max:50,step:0.1},
    {id:'fhx',label:'Family history of premature CVD (first-degree relative <60)',type:'check'},
    {id:'ckd',label:'CKD (eGFR <60 or Stage 3-5)',type:'check'},
    {id:'af',label:'Atrial fibrillation',type:'check'},
    {id:'ra',label:'Rheumatoid arthritis',type:'check'},
    {id:'mental',label:'Severe mental illness (schizophrenia, bipolar, severe depression)',type:'check'},
    {id:'steroid',label:'On corticosteroids',type:'check'},
    {id:'erectile',label:'Erectile dysfunction (males)',type:'check'},
    {id:'migraine',label:'Migraines',type:'check'},
    {id:'sle',label:'Systemic lupus erythematosus (SLE)',type:'check'},
    {id:'atyp',label:'On atypical antipsychotics',type:'check'},
  ],
  calc:(v)=>{
    if(!v.age||!v.sbp) return{score:'-',max:null,risk:'info',label:'Enter age and blood pressure at minimum',stats:[],interp:'',next:''};
    // Simplified risk estimation — NOT the full QRISK3 algorithm
    // Uses weighted approximation of major risk factors
    const age=v.age||55;const male=v.sex===1;
    let baseRisk=male?0.8:0.4; // baseline per year risk %
    // Age contribution (exponential increase)
    let ageMultiplier=1;
    if(age>=75)ageMultiplier=4.5;else if(age>=65)ageMultiplier=3.0;else if(age>=55)ageMultiplier=2.0;else if(age>=45)ageMultiplier=1.3;
    // Risk factor contributions
    let rfScore=0;
    rfScore+=(v.smoke||0)*0.8; // smoking graded
    rfScore+=v.dm?2.5:0;
    rfScore+=v.htn?1.2:0;
    rfScore+=v.sbp>160?1.5:v.sbp>140?0.8:0;
    rfScore+=v.tc_hdl>6?2:v.tc_hdl>4.5?1:0;
    rfScore+=v.bmi>35?1.2:v.bmi>30?0.6:0;
    rfScore+=v.fhx?1.5:0;
    rfScore+=v.ckd?1.8:0;
    rfScore+=v.af?1.5:0;
    rfScore+=v.ra?1.3:0;
    rfScore+=v.mental?0.8:0;
    rfScore+=v.steroid?0.5:0;
    rfScore+=v.erectile?0.3:0;
    rfScore+=v.migraine?0.3:0;
    rfScore+=v.sle?1.5:0;
    rfScore+=v.atyp?0.4:0;
    // 10-year estimate (simplified)
    let risk10yr=Math.min(baseRisk*ageMultiplier*(1+rfScore*0.5)*10/3,95);
    risk10yr=Math.round(risk10yr*10)/10;
    let risk,label,interp,next;
    if(risk10yr<10){risk='low';label='<10% — Below NICE Treatment Threshold';
      interp='Estimated 10-year CVD risk approximately '+risk10yr+'%.';
      next='Below NICE 10% threshold for statin therapy. Lifestyle advice: smoking cessation, diet, exercise, weight management. Reassess in 5 years or sooner if risk factors change. Use the official QRISK3 calculator (qrisk.org) for precise score.';}
    else if(risk10yr<20){risk='int';label='10-20% — NICE Statin Threshold Met';
      interp='Estimated 10-year CVD risk approximately '+risk10yr+'%.';
      next='NICE recommends offering ATORVASTATIN 20mg once daily. Discuss risk-benefit with patient. Lifestyle modification regardless. Address modifiable risk factors (smoking, BP, weight). LDL target: ≥40% reduction at 3 months. Repeat lipids at 3 months. Use qrisk.org for precise score.';}
    else{risk='high';label='>20% — High CVD Risk';
      interp='Estimated 10-year CVD risk approximately '+risk10yr+'% — high risk.';
      next='ATORVASTATIN 20mg strongly recommended (consider 80mg if very high risk or established CVD equivalent). URGENT BP optimisation. Smoking cessation support. Consider aspirin if established CVD. If diabetic: optimise HbA1c. Use qrisk.org for precise score.';}
    return{score:risk10yr+'%',max:null,risk,label,stats:[['Estimated 10yr CVD risk',risk10yr+'%'],['NICE threshold','≥10% = offer statin'],['Age',age],['Sex',male?'Male':'Female']],interp,next};
  }
},
maggic: {
  id:'maggic', name:'MAGGIC Score', purpose:'Predict 1-year and 3-year mortality in chronic heart failure using 13 clinical variables.',
  cat:'general', disease:'Cardiology', icon:'❤️',
  tags:['maggic','heart failure','mortality','prognosis','ejection fraction','hfref','hfpef'],
  evidence:{source:'Pocock SJ et al. Eur Heart J. 2013;34(19):1404-13.',guideline:'ESC Heart Failure Guidelines',year:2013,pmid:'23095984'},
  whenUse:'Ambulatory heart failure patients (HFrEF and HFpEF) for prognosis estimation and treatment planning.',
  whenNot:'Acute decompensated heart failure during hospitalisation (use at stable state). As sole guide for treatment decisions.',
  limits:'Derived from meta-analysis of 30 studies (39,372 patients). Simplified version here — full MAGGIC calculator uses continuous variables with complex coefficients. This provides clinical approximation.',
  inputs:[
    {id:'age',label:'Age (years)',type:'number',min:18,max:100,step:1},
    {id:'sex',label:'Sex',type:'select',opts:[['Female',0],['Male',1]]},
    {id:'ef',label:'Ejection fraction (%)',type:'number',min:5,max:80,step:1},
    {id:'nyha',label:'NYHA class',type:'select',opts:[['I',1],['II',2],['III',3],['IV',4]]},
    {id:'sbp',label:'Systolic BP (mmHg)',type:'number',min:60,max:250,step:1},
    {id:'bmi',label:'BMI (kg/m²)',type:'number',min:12,max:60,step:0.1},
    {id:'creat',label:'Creatinine (µmol/L)',type:'number',min:30,max:1000,step:1},
    {id:'dm',label:'Diabetes',type:'check'},
    {id:'copd',label:'COPD',type:'check'},
    {id:'hf18m',label:'Heart failure diagnosed ≥18 months ago',type:'check'},
    {id:'smoker',label:'Current smoker',type:'check'},
    {id:'betab',label:'On beta-blocker',type:'check'},
    {id:'acei',label:'On ACEi/ARB',type:'check'},
  ],
  calc:(v)=>{
    if(!v.age||!v.ef) return{score:'-',max:null,risk:'info',label:'Enter age, EF, and clinical data',stats:[],interp:'',next:''};
    // Simplified MAGGIC scoring approximation
    let pts=0;
    // Age (major contributor)
    const age=v.age||65;
    if(age>=80)pts+=10;else if(age>=70)pts+=7;else if(age>=60)pts+=4;else if(age>=50)pts+=2;
    // EF (inverse relationship — lower EF = higher risk)
    const ef=v.ef||35;
    if(ef<20)pts+=7;else if(ef<25)pts+=5;else if(ef<30)pts+=4;else if(ef<35)pts+=3;else if(ef<40)pts+=2;else if(ef<45)pts+=1;
    // NYHA
    const nyha=v.nyha||2;
    pts+=(nyha-1)*2; // NYHA I=0, II=2, III=4, IV=6
    // SBP (lower is worse in HF)
    const sbp=v.sbp||120;
    if(sbp<100)pts+=4;else if(sbp<110)pts+=3;else if(sbp<120)pts+=1;
    // BMI (U-shaped: both low and very high worse)
    const bmi=v.bmi||25;
    if(bmi<20)pts+=2;else if(bmi>=35)pts+=1;
    // Creatinine
    const cr=v.creat||90;
    if(cr>200)pts+=4;else if(cr>130)pts+=2;else if(cr>110)pts+=1;
    // Risk factors
    pts+=v.dm?3:0;
    pts+=v.copd?2:0;
    pts+=v.hf18m?2:0;
    pts+=v.smoker?1:0;
    pts+=v.sex===1?1:0; // male sex
    // Protective factors (on therapy)
    pts-=v.betab?2:0;
    pts-=v.acei?2:0;
    pts=Math.max(pts,0);
    // Approximate mortality from score
    let mort1yr,mort3yr,risk,label;
    if(pts<=5){risk='low';label='Low Risk';mort1yr='~5%';mort3yr='~12%';}
    else if(pts<=10){risk='low';label='Low-Moderate Risk';mort1yr='~8%';mort3yr='~20%';}
    else if(pts<=15){risk='int';label='Moderate Risk';mort1yr='~15%';mort3yr='~35%';}
    else if(pts<=20){risk='int';label='Moderate-High Risk';mort1yr='~25%';mort3yr='~48%';}
    else if(pts<=25){risk='high';label='High Risk';mort1yr='~35%';mort3yr='~60%';}
    else{risk='vhigh';label='Very High Risk';mort1yr='>45%';mort3yr='>70%';}
    const hftype=ef<40?'HFrEF':ef<=49?'HFmrEF':'HFpEF';
    return{score:pts,max:null,risk,label,
      stats:[['Approx 1yr mortality',mort1yr],['Approx 3yr mortality',mort3yr],['MAGGIC Score',pts],['EF',ef+'% ('+hftype+')'],['NYHA','Class '+nyha]],
      interp:'MAGGIC '+label+'. '+hftype+' with NYHA Class '+nyha+'.',
      next:risk==='low'||risk==='low'?
        'Continue guideline-directed medical therapy (GDMT). '+(hftype==='HFrEF'?'Quadruple therapy: ACEi/ARNi + beta-blocker + MRA + SGLT2i. Titrate to maximum tolerated doses.':'Optimise comorbidities. SGLT2i (dapagliflozin/empagliflozin) for all HF phenotypes.')+' Annual review.':
        risk==='int'?
        'Optimise GDMT urgently. '+(hftype==='HFrEF'?'Ensure on maximum tolerated ACEi/ARNi, beta-blocker, MRA, SGLT2i. Consider CRT if LBBB + QRS ≥150ms. ICD if EF ≤35% despite 3mo optimal therapy. Iron replacement if deficient (FCM IV).':'SGLT2i. Diuretics for congestion. Treat comorbidities aggressively.')+' Specialist HF clinic follow-up.':
        'HIGH MORTALITY RISK. '+(nyha>=3?'Consider advanced HF therapies: cardiac transplant assessment, LVAD, or palliative care referral depending on trajectory and patient wishes. ':'')+'Maximise GDMT. Urgent specialist review. If NYHA IV: inotrope support, MCS, or comfort care discussion. Ensure iron, device, and rehabilitation optimisation.'};
  }
},
// ─── BATCH 6: TRANSPLANT, CAR-T, CELLULAR THERAPY & TRANSFUSION MEDICINE ────
agvhd:{id:'agvhd',name:'Acute GVHD Grading (Glucksberg)',purpose:'Grade acute graft-versus-host disease severity by staging skin, liver, and GI involvement.',cat:'malignant',disease:'Transplant — GVHD',icon:'🔄',tags:['gvhd','acute','grading','glucksberg','transplant','skin','liver','gi'],evidence:{source:'Glucksberg H et al. Transplantation. 1974;18(4):295-304.',guideline:'EBMT / CIBMTR / MAGIC',year:1974,pmid:'4153799'},whenUse:'Allogeneic SCT recipients with suspected acute GVHD.',whenNot:'Chronic GVHD (use NIH 2014). Overlap syndrome.',limits:'Subjective grading. MAGIC criteria provide biomarker-supported staging.',inputs:[{id:'skin',label:'Skin stage',type:'select',opts:[['Stage 0: No rash',0],['Stage 1: <25% BSA',1],['Stage 2: 25-50% BSA',2],['Stage 3: >50% BSA',3],['Stage 4: Erythroderma ± bullae',4]]},{id:'liver',label:'Liver stage (bilirubin)',type:'select',opts:[['Stage 0: <34 µmol/L',0],['Stage 1: 34-50',1],['Stage 2: 51-102',2],['Stage 3: 103-255',3],['Stage 4: >255',4]]},{id:'gi',label:'GI stage (diarrhoea)',type:'select',opts:[['Stage 0: <500 mL/day',0],['Stage 1: 500-999 mL/day',1],['Stage 2: 1000-1500 mL/day',2],['Stage 3: >1500 mL/day',3],['Stage 4: Severe pain/ileus/bloody',4]]}],calc:(v)=>{const mx=Math.max(v.skin||0,v.liver||0,v.gi||0);let grade,risk,label,interp,next;if(mx===0){grade=0;risk='low';label='No GVHD';interp='No organ involvement.';next='Continue immunosuppression.';}else if((v.skin||0)<=2&&!(v.liver||0)&&!(v.gi||0)){grade='I';risk='low';label='Grade I (Mild)';interp='Skin-only.';next='Topical steroids. Optimise CNI levels.';}else if((v.skin||0)<=3&&(v.liver||0)<=1&&(v.gi||0)<=1){grade='II';risk='int';label='Grade II (Moderate)';interp='Systemic treatment indicated.';next='Methylprednisolone 1-2 mg/kg/day. If steroid-refractory by day 7: ruxolitinib (REACH2).';}else if(mx<=3){grade='III';risk='high';label='Grade III (Severe)';interp='Severe multi-organ GVHD.';next='High-dose steroids. If refractory: ruxolitinib, ECP, or trial.';}else{grade='IV';risk='vhigh';label='Grade IV (Life-Threatening)';interp='Mortality approaches 80-100%.';next='URGENT: steroids + second-line. Goals of care discussion.';}return{score:'Grade '+grade,max:'IV',risk,label,stats:[['Grade',grade],['Skin','S'+(v.skin||0)],['Liver','S'+(v.liver||0)],['GI','S'+(v.gi||0)]],interp,next};}},
cgvhd:{id:'cgvhd',name:'Chronic GVHD NIH Severity',purpose:'Score chronic GVHD severity per NIH 2014 consensus (8 organ scoring → mild/moderate/severe).',cat:'malignant',disease:'Transplant — GVHD',icon:'🔄',tags:['chronic','gvhd','nih','severity','transplant'],evidence:{source:'Jagasia MH et al. Biol Blood Marrow Transplant. 2015;21(3):389-401.',guideline:'NIH 2014 / EBMT',year:2015,pmid:'25529383'},whenUse:'Diagnosed chronic GVHD — score at diagnosis and each follow-up.',whenNot:'Acute GVHD. Before confirming cGVHD diagnosis.',limits:'8 organs: skin, eyes, mouth, GI, liver, lungs, joints, genital. Each 0-3. Lung requires PFTs.',inputs:[{id:'sk',label:'Highest organ score (skin, mouth, eyes, GI, liver, joints, genital)',type:'select',opts:[['0',0],['1',1],['2',2],['3',3]]},{id:'organs',label:'Number of organs involved (score >0)',type:'select',opts:[['0',0],['1',1],['2',2],['3+',3]]},{id:'lung',label:'Lung score (FEV1-based)',type:'select',opts:[['0: FEV1 >80%',0],['1: FEV1 60-79%',1],['2: FEV1 40-59%',2],['3: FEV1 <39%',3]]}],calc:(v)=>{const mx=v.sk||0,org=v.organs||0,lung=v.lung||0;let sev,risk,label,interp,next;if(mx===0&&lung===0){sev='None';risk='low';label='No Active cGVHD';interp='No organ involvement.';next='Taper immunosuppression if appropriate.';}else if(org<=2&&mx<=1&&lung===0){sev='Mild';risk='low';label='Mild cGVHD';interp='≤2 organs, each ≤1, no lung.';next='Topical/local therapy may suffice.';}else if(mx>=3||lung>=2){sev='Severe';risk='high';label='Severe cGVHD';interp='Any score 3 OR lung ≥2.';next='Systemic steroids ± CNI. If refractory: ibrutinib, ruxolitinib (REACH3), belumosudil, or ECP.';}else{sev='Moderate';risk='int';label='Moderate cGVHD';interp='3+ organs OR any score 2.';next='Systemic immunosuppression. Steroid-sparing agents early.';}return{score:sev,max:null,risk,label,stats:[['NIH Severity',sev],['Highest score',mx],['Lung',lung]],interp,next};}},
vod:{id:'vod',name:'SOS/VOD Criteria (EBMT)',purpose:'Diagnose hepatic sinusoidal obstruction syndrome post-transplant using EBMT 2016 criteria.',cat:'malignant',disease:'Transplant — SOS/VOD',icon:'🔄',tags:['vod','sos','sinusoidal','hepatic','transplant','defibrotide'],evidence:{source:'Mohty M et al. Bone Marrow Transplant. 2016;51(7):906-12.',guideline:'EBMT 2016',year:2016,pmid:'27183098'},whenUse:'Post-SCT with suspected SOS/VOD (weight gain, hepatomegaly, jaundice, ascites).',whenNot:'Non-transplant hepatic disease.',limits:'EBMT 2016 replaced Baltimore/Seattle criteria. Late-onset VOD (>D21) increasingly recognised.',inputs:[{id:'bili',label:'Bilirubin ≥34 µmol/L',type:'check'},{id:'hepat',label:'Painful hepatomegaly',type:'check'},{id:'wt',label:'Weight gain >5%',type:'check'},{id:'ascites',label:'Ascites',type:'check'},{id:'late',label:'Late-onset (>D21)',type:'check'}],calc:(v)=>{const n=(v.bili?1:0)+(v.hepat?1:0)+(v.wt?1:0)+(v.ascites?1:0);if(n>=2){return{score:n,max:4,risk:'high',label:'SOS/VOD Criteria Met'+(v.late?' (Late-Onset)':''),stats:[['Criteria',n+'/4']],interp:'EBMT criteria met.',next:'URGENT: DEFIBROTIDE 6.25 mg/kg IV q6h for ≥21 days. Fluid restriction + diuretics. Daily weight/girth/bilirubin. Hepatic Doppler US.'};}return{score:n,max:4,risk:'low',label:'Criteria Not Met',stats:[['Criteria',n+'/4']],interp:'<2 EBMT criteria.',next:'Monitor: daily weight, bilirubin. Repeat if suspicion persists. Risk factors: busulfan, prior liver disease.'};}},
ice:{id:'ice',name:'ICE Score',purpose:'10-point bedside neurocognitive assessment for ICANS monitoring in CAR-T and bispecific antibody therapy.',cat:'malignant',disease:'CAR-T / Cellular',icon:'🧬',tags:['ice','encephalopathy','car-t','icans','bispecific','neurocognitive'],evidence:{source:'Lee DW et al. Biol Blood Marrow Transplant. 2019;25(4):625-38.',guideline:'ASTCT / EBMT-EHA',year:2019,pmid:'30592986'},whenUse:'All patients on CAR-T or bispecific antibodies — assess twice daily during risk period.',whenNot:'Baseline cognitive impairment preventing scoring. Children <12 (use CAPD).',limits:'ICE is one component of ICANS grade. Also assess: consciousness, seizures, motor findings, raised ICP.',inputs:[{id:'orient',label:'Orientation: year, month, city, hospital (4 pts)',type:'select',opts:[['4/4',4],['3/4',3],['2/4',2],['1/4',1],['0/4',0]]},{id:'name',label:'Naming 3 objects (3 pts)',type:'select',opts:[['3/3',3],['2/3',2],['1/3',1],['0/3',0]]},{id:'cmd',label:'Following command (1 pt)',type:'select',opts:[['Yes',1],['No',0]]},{id:'write',label:'Writing a sentence (1 pt)',type:'select',opts:[['Yes',1],['No',0]]},{id:'attn',label:'Count backwards from 20 (1 pt)',type:'select',opts:[['Yes',1],['No',0]]}],calc:(v)=>{const s=(v.orient||0)+(v.name||0)+(v.cmd||0)+(v.write||0)+(v.attn||0);let risk,label,interp,next;if(s===10){risk='low';label='ICE 10/10 — Normal';interp='Normal neurocognition.';next='Continue 12-hourly monitoring.';}else if(s>=7){risk='int';label='ICE 7-9 → ICANS Grade 1';interp='Mild impairment.';next='Monitor q4-8h. Seizure prophylaxis (levetiracetam). Avoid sedatives.';}else if(s>=3){risk='high';label='ICE 3-6 → ICANS Grade 2-3';interp='Moderate-severe impairment.';next='DEXAMETHASONE 10mg IV q6h. MRI brain. EEG if seizure concern.';}else{risk='vhigh';label='ICE 0-2 → ICANS Grade 3-4';interp='Severe dysfunction.';next='ICU. Methylprednisolone 1g/day ×3. Continuous EEG. Consider anakinra if refractory.';}return{score:s,max:10,risk,label,stats:[['ICE Score',s+'/10']],interp,next};}},
irae:{id:'irae',name:'irAE Grading (Immunotherapy)',purpose:'Grade immune-related adverse events from checkpoint inhibitors to guide management.',cat:'malignant',disease:'Immunotherapy',icon:'🛡️',tags:['irae','checkpoint','immunotherapy','nivolumab','pembrolizumab','toxicity'],evidence:{source:'Brahmer JR et al. J Clin Oncol. 2018;36(17):1714-68.',guideline:'ASCO / ESMO / NCCN',year:2018,pmid:'29442540'},whenUse:'Patients on anti-PD-1/PD-L1/CTLA-4 with suspected immune toxicity.',whenNot:'CAR-T toxicity (use CRS/ICANS). Non-immunotherapy side effects.',limits:'Combination ICIs have ~60% grade 3-4 irAE rate. Some (myocarditis, encephalitis) are rare but fatal.',inputs:[{id:'organ',label:'Organ affected',type:'select',opts:[['Skin/rash',1],['Colitis/GI',2],['Hepatitis',3],['Endocrine',4],['Pneumonitis',5],['Myocarditis',6],['Nephritis',7],['Neurotoxicity',8]]},{id:'grade',label:'CTCAE Grade',type:'select',opts:[['Grade 1: Mild',1],['Grade 2: Moderate',2],['Grade 3: Severe',3],['Grade 4: Life-threatening',4]]}],calc:(v)=>{const g=v.grade||1;const names={1:'Skin',2:'Colitis',3:'Hepatitis',4:'Endocrine',5:'Pneumonitis',6:'Myocarditis',7:'Nephritis',8:'Neurotoxicity'};const org=names[v.organ||1];let risk,label,interp,next;if(g===1){risk='low';label='Grade 1 '+org;interp='Mild.';next='Continue ICI (except myocarditis — hold any grade). Symptomatic management.';}else if(g===2){risk='int';label='Grade 2 '+org;interp='Moderate — hold ICI.';next='HOLD ICI. Prednisolone 0.5-1 mg/kg. Specialist referral. Resume when ≤G1.';}else if(g===3){risk='high';label='Grade 3 '+org;interp='Severe — permanently stop ICI.';next='STOP ICI permanently. Methylprednisolone 1-2 mg/kg IV. Second-line if refractory (infliximab for colitis, MMF for hepatitis).';}else{risk='vhigh';label='Grade 4 '+org;interp='Life-threatening.';next='STOP ICI. Methylpred 1-2 mg/kg IV. ICU if needed. Myocarditis: urgent cardiology, IVIG. Pneumonitis: high-flow O₂ (infliximab contraindicated).';}return{score:'G'+g,max:4,risk,label,stats:[['Organ',org],['Grade',g]],interp,next};}},
bloodvol:{id:'bloodvol',name:'Blood Volume (Nadler)',purpose:'Estimate total blood volume for exchange transfusion, plasmapheresis, and massive transfusion calculations.',cat:'benign',disease:'Transfusion',icon:'🩸',tags:['blood volume','nadler','transfusion','exchange','plasmapheresis'],evidence:{source:'Nadler SB et al. Surgery. 1962;51(2):224-32.',guideline:'AABB / BSH',year:1962,pmid:'21936146'},whenUse:'Exchange procedures, TPE, massive transfusion planning.',whenNot:'Neonates (use 80-100 mL/kg).',limits:'Estimate only. Less accurate in obesity/pregnancy.',inputs:[{id:'ht',label:'Height (cm)',type:'number',min:100,max:250,step:1},{id:'wt',label:'Weight (kg)',type:'number',min:20,max:250,step:0.1},{id:'sex',label:'Sex',type:'select',opts:[['Female',0],['Male',1]]}],calc:(v)=>{if(!v.ht||!v.wt)return{score:'-',max:null,risk:'info',label:'Enter values',stats:[],interp:'',next:''};const h=v.ht/100;const bv=Math.round((v.sex===1?(0.3669*h**3+0.03219*v.wt+0.6041):(0.3561*h**3+0.03308*v.wt+0.1833))*1000);return{score:(bv/1000).toFixed(1)+' L',max:null,risk:'low',label:'Blood Volume: '+bv+' mL ('+(bv/1000).toFixed(1)+' L)',stats:[['TBV',bv+' mL'],['Plasma',Math.round(bv*0.55)+' mL'],['mL/kg',Math.round(bv/v.wt)]],interp:'Nadler formula. Normal 60-80 mL/kg.',next:'Red cell exchange: 1.0-1.5× RBC volume. Plasma exchange: 1.0-1.5× plasma volume per session.'};}},
pltdose:{id:'pltdose',name:'Platelet CCI Calculator',purpose:'Calculate corrected count increment to assess platelet refractoriness.',cat:'benign',disease:'Transfusion',icon:'🩸',tags:['platelet','cci','refractoriness','transfusion','hla'],evidence:{source:'Davis KB et al. Transfusion. 1999;39(6):591-600.',guideline:'BSH / AABB',year:1999,pmid:'10378838'},whenUse:'Assessing platelet transfusion response. CCI <5000 at 1h on 2 occasions = refractoriness.',whenNot:'Active bleeding or DIC.',limits:'Non-immune causes (sepsis, DIC, spleen, drugs) account for 80% of poor increments.',inputs:[{id:'pre',label:'Pre-transfusion plt (×10⁹/L)',type:'number',min:0,max:500,step:1},{id:'post',label:'Post-transfusion plt (×10⁹/L)',type:'number',min:0,max:500,step:1},{id:'dose',label:'Platelet dose (×10¹¹)',type:'number',min:0.5,max:10,step:0.1},{id:'bsa',label:'BSA (m²)',type:'number',min:1,max:3,step:0.01}],calc:(v)=>{if(!v.post||!v.dose||!v.bsa)return{score:'-',max:null,risk:'info',label:'Enter all values',stats:[],interp:'',next:''};const inc=v.post-(v.pre||0);const cci=Math.round((inc*v.bsa)/(v.dose)*1000);let risk,label;if(cci>=7500){risk='low';label='Adequate (CCI ≥7500)';}else if(cci>=5000){risk='int';label='Borderline (5000-7500)';}else{risk='high';label='Poor (CCI <5000) — Refractoriness';}return{score:cci,max:null,risk,label,stats:[['CCI',cci],['Increment',inc]],interp:cci<5000?'Two consecutive CCI <5000 at 1h = refractoriness. 80% non-immune causes.':'Adequate platelet response.',next:cci<5000?'Check: sepsis, DIC, splenomegaly, drugs. If non-immune excluded: HLA antibody screen → HLA-matched platelets.':'Continue standard platelet support.'};}},
chrs:{
  id:'chrs', name:'CHRS', purpose:'Predict risk of progression to myeloid malignancy in clonal haematopoiesis (CHIP and CCUS).',
  cat:'malignant', disease:'CHIP / CCUS', icon:'🧬',
  tags:['chip','ccus','clonal haematopoiesis','myeloid malignancy','chrs','risk','progression','vaf'],
  evidence:{source:'Weeks LD et al. NEJM Evidence. 2023;2(5):EVIDoa2200310.',guideline:'ASH / ELN Emerging Guidance',year:2023,pmid:'38320516'},
  whenUse:'Patients with CHIP or CCUS identified on NGS to stratify risk of myeloid malignancy and guide monitoring intensity.',
  whenNot:'Already diagnosed MDS/AML (use IPSS-M/ELN AML). Without NGS data confirming somatic mutation ≥2% VAF.',
  limits:'Developed and validated in specific cohorts — prospective validation ongoing. Score supplements but does not replace clinical judgement. Online app at chrsapp.com provides the official validated tool.',
  inputs:[
    {id:'age',label:'Age ≥65 years',type:'check'},
    {id:'ccus',label:'Cytopenia present (qualifies as CCUS rather than CHIP)',type:'check'},
    {id:'highrisk',label:'High-risk mutation present (SRSF2, SF3B1, ZRSR2, IDH1, IDH2, FLT3, RUNX1, JAK2, or TP53)',type:'check'},
    {id:'vaf',label:'Largest clone VAF ≥20%',type:'check'},
    {id:'multi',label:'≥2 clonal mutations detected',type:'check'},
    {id:'rdw',label:'RDW ≥15%',type:'check'},
    {id:'mcv',label:'MCV ≥100 fL (macrocytosis)',type:'check'},
  ],
  calc:(v)=>{
    const s=(v.age?1.5:0)+(v.ccus?3.0:0)+(v.highrisk?3.0:0)+(v.vaf?2.0:0)+(v.multi?1.5:0)+(v.rdw?1.5:0)+(v.mcv?1.0:0);
    let risk,label,tenyr,interp,next;
    if(s<=9.5){risk='low';label='Low Risk';tenyr='~3%';interp='Low 10-year risk of myeloid malignancy.';next='Annual FBC and clinical review. Repeat NGS in 12-24 months (especially if CCUS). Optimise cardiovascular risk factors — CHIP is associated with atherosclerotic events independent of malignancy risk. No disease-modifying therapy indicated.';}
    else if(s<=12){risk='int';label='Intermediate Risk';tenyr='~13%';interp='Intermediate risk — enhanced haematological monitoring required.';next='Haematology clinic follow-up every 6-12 months. FBC, blood film, repeat NGS. Bone marrow assessment if cytopenias evolve or new dysplastic features emerge. Discuss clinical trial eligibility. Consider LDH, SPEP as baseline.';}
    else{risk='high';label='High Risk';tenyr='~46%';interp='High risk of progression to myeloid malignancy.';next='Haematology specialist review. Bone marrow aspirate + trephine + full cytogenetics + NGS panel if not done. Consider clinical trial enrolment. Monitor every 3-6 months. Discuss prognosis and monitoring goals with patient. Cardiovascular optimisation.';}
    return{score:s.toFixed(1),max:13.5,risk,label,
      stats:[['CHRS Score',s.toFixed(1)+' / 13.5'],['10-yr Myeloid Risk',tenyr],['Risk Category',label]],
      interp,next};
  }
},
chipDiag:{
  id:'chipDiag', name:'CHIP / CCUS Diagnostic Tool', purpose:'Classify clonal haematopoiesis using WHO 2022 / ICC 2022 diagnostic criteria and differentiate CHIP, CCUS, and early MDS.',
  cat:'malignant', disease:'CHIP / CCUS', icon:'🧬',
  tags:['chip','ccus','mds','who','icc','classification','vaf','dysplasia','diagnostic'],
  evidence:{source:'Khoury JD et al. Leukemia. 2022;36(7):1703-19. Steensma DP et al. Blood. 2015;126(1):9-16.',guideline:'WHO 2022 / ICC 2022',year:2022,pmid:'35732831'},
  whenUse:'Patients with incidental somatic mutations on NGS or unexplained cytopenias to establish the correct diagnostic label before management decisions.',
  whenNot:'Full bone marrow assessment already confirming MDS. Clearly established MDS/AML diagnosis.',
  limits:'Diagnostic classification tool only. Requires careful correlation with blood film, bone marrow morphology, and full clinical assessment. Bone marrow is required to exclude MDS when significant cytopenias or dysplasia present.',
  inputs:[
    {id:'vaf',label:'VAF of largest somatic clone',type:'select',opts:[['<2%: below diagnostic threshold',0],['2-10%: low-level clone',1],['10-20%: established clone',2],['>20%: large clone',3]]},
    {id:'cytopenia',label:'Unexplained cytopenia present (Hb <13/12, ANC <1.8, Plt <150)',type:'check'},
    {id:'dysplasia',label:'Morphologic dysplasia ≥10% of any lineage on bone marrow aspirate',type:'check'},
    {id:'blasts',label:'Blast percentage on bone marrow aspirate',type:'select',opts:[['<5% (normal / early disease)',0],['5-9% (elevated — MDS-EB1)',1],['10-19% (MDS-EB2)',2],['≥20% (AML threshold)',3]]},
    {id:'mdsKary',label:'MDS-defining cytogenetic abnormality (del5q, monosomy 7, del17p, etc.)',type:'check'},
    {id:'dtaOnly',label:'Only DTA-type mutations (DNMT3A, TET2, ASXL1) — no other mutations',type:'check'},
  ],
  calc:(v)=>{
    const bv=v.blasts||0;
    if(bv>=3)return{score:'AML',max:null,risk:'vhigh',label:'Blasts ≥20% → AML',stats:[['Blasts','≥20%']],interp:'Blast count ≥20% meets AML threshold per WHO 2022 / ICC 2022.',next:'Urgent haematology assessment. ELN 2022 AML risk classification. Bone marrow + cytogenetics + full NGS panel. Induction chemotherapy vs clinical trial discussion.'};
    if(bv>=2)return{score:'MDS-EB2',max:null,risk:'high',label:'MDS — Excess Blasts-2 (10-19%)',stats:[['Blasts','10-19%']],interp:'Blasts 10-19% fulfil MDS-EB2 criteria (WHO 2022) / MDS/AML (ICC 2022).',next:'IPSS-M and IPSS-R for risk stratification. Azacitidine standard of care. Urgent transplant referral if eligible. Molecular profiling essential.'};
    if(bv>=1)return{score:'MDS-EB1',max:null,risk:'high',label:'MDS — Excess Blasts-1 (5-9%)',stats:[['Blasts','5-9%']],interp:'Blasts 5-9% meet MDS-EB1 criteria.',next:'IPSS-M / IPSS-R for staging. Azacitidine or transplant depending on overall risk. Molecular profiling. Haematology MDT discussion.'};
    const vaff=v.vaf||0;
    if(vaff===0)return{score:'<2% VAF',max:null,risk:'info',label:'Below CHIP/CCUS Threshold (<2% VAF)',stats:[],interp:'VAF <2% does not meet the 2% diagnostic threshold for CHIP or CCUS.',next:'Age-related clonal haematopoiesis (ARCH) if age >40. Clinical correlation. Repeat NGS if clinical suspicion persists.'};
    if(v.dysplasia||v.mdsKary)return{score:'Low-grade MDS',max:null,risk:'high',label:'Possible Low-grade MDS — Bone Marrow Confirmatory',stats:[],interp:'Dysplasia ≥10% or MDS-defining cytogenetics present.',next:'Bone marrow aspirate + trephine + karyotype mandatory. IPSS-R/IPSS-M when MDS confirmed. Haematology referral.'};
    if(v.cytopenia)return{score:'CCUS',max:null,risk:'int',label:'CCUS — Clonal Cytopenia of Undetermined Significance',stats:[['VAF',['<2%','2-10%','10-20%','>20%'][vaff]],['Cytopenia','Present']],interp:'Clonal mutation(s) at ≥2% VAF + unexplained cytopenia + no overt MDS features = CCUS per WHO/ICC 2022.',next:'Apply CHRS for risk stratification. Bone marrow assessment recommended to exclude MDS. Haematology clinic follow-up. Monitor FBC + repeat NGS 6-12 monthly.'};
    if(v.dtaOnly)return{score:'CHIP-DTA',max:null,risk:'low',label:'CHIP — DTA Mutation (Lower-risk Variant)',stats:[['VAF',['<2%','2-10%','10-20%','>20%'][vaff]],['Mutation type','DTA only']],interp:'CHIP with DNMT3A/TET2/ASXL1 mutation only. Generally lower myeloid transformation risk than non-DTA CHIP.',next:'Apply CHRS for personalised risk scoring. Annual FBC. Cardiovascular risk management (CHIP independently increases atherosclerotic risk). No bone marrow required unless cytopenias develop.'};
    return{score:'CHIP',max:null,risk:'low',label:'CHIP — Clonal Haematopoiesis of Indeterminate Potential',stats:[['VAF',['<2%','2-10%','10-20%','>20%'][vaff]],['Cytopenia','Absent']],interp:'Somatic mutation(s) ≥2% VAF, no cytopenia, no dysplasia, no MDS-defining features = CHIP.',next:'Apply CHRS for personalised risk score. Monitor FBC annually. Repeat NGS in 12-24 months. Cardiovascular risk optimisation. Haematology referral if non-DTA mutation or VAF >20%.'};
  }
},
dipssplus:{
  id:'dipssplus', name:'DIPSS-Plus', purpose:'Refined prognostication in primary myelofibrosis incorporating DIPSS score plus cytogenetics, platelet count, and transfusion requirement.',
  cat:'malignant', disease:'Myelofibrosis',
  tags:['myelofibrosis','mpn','mf','dipss','prognosis','transplant','cytogenetics'],
  evidence:{source:'Gangat N et al. J Clin Oncol. 2011;29(4):392-7.',guideline:'ELN / NCCN',year:2011,pmid:'21149677'},
  whenUse:'Primary myelofibrosis when cytogenetic data and transfusion history are available. Superior to DIPSS alone for risk stratification at diagnosis.',
  whenNot:'Post-PV/ET myelofibrosis (use MYSEC-PM). Pre-fibrotic MPN. When cytogenetic data unavailable (use DIPSS).',
  limits:'Does not incorporate molecular data (JAK2, CALR, MPL, high-risk mutations). MIPSS70+ v2 or GIPSS preferred when full molecular profiling available.',
  inputs:[
    {id:'sect1',label:'— DIPSS Base Factors —',type:'section'},
    {id:'age',label:'Age >65 years',type:'check'},
    {id:'const',label:'Constitutional symptoms (weight loss >10%, night sweats, fevers)',type:'check'},
    {id:'hgb',label:'Haemoglobin <10 g/dL (scores 2 points in DIPSS)',type:'check'},
    {id:'wbc',label:'WBC >25 ×10⁹/L',type:'check'},
    {id:'blasts',label:'Peripheral blood blasts ≥1%',type:'check'},
    {id:'sect2',label:'— DIPSS-Plus Additional Factors —',type:'section'},
    {id:'plt',label:'Platelet count <100 ×10⁹/L',type:'check'},
    {id:'transfusion',label:'Requires RBC transfusion',type:'check'},
    {id:'karyotype',label:'Unfavourable karyotype (+8, -7/7q-, isochromosome 17q, inv(3), -5/5q-, 12p-, or 11q23 rearrangement)',type:'check'},
  ],
  calc:(v)=>{
    // DIPSS component
    const dipssScore=(v.age?1:0)+(v.const?1:0)+(v.hgb?2:0)+(v.wbc?1:0)+(v.blasts?1:0);
    let dipssRisk;
    if(dipssScore===0) dipssRisk=0;
    else if(dipssScore<=2) dipssRisk=1;
    else if(dipssScore<=4) dipssRisk=2;
    else dipssRisk=3;
    // DIPSS-Plus additional points
    const plusPoints=(v.plt?1:0)+(v.transfusion?1:0)+(v.karyotype?1:0);
    const total=dipssRisk+plusPoints;
    let risk,label,os,interp,next;
    if(total===0){risk='low';label='Low Risk';os='Not reached';interp='Favourable prognosis.';next='Observation if asymptomatic. Ruxolitinib for symptomatic splenomegaly or constitutional symptoms. Transplant NOT indicated in low risk.';}
    else if(total===1){risk='int';label='Intermediate-1';os='~14.2 yrs';interp='Moderate prognosis.';next='Ruxolitinib for symptomatic burden or splenomegaly. Transplant generally not indicated. Annual reassessment. Obtain full molecular profiling (JAK2/CALR/MPL/HMR mutations) for MIPSS70+ risk refinement.';}
    else if(total<=3){risk='high';label='Intermediate-2';os='~4 yrs';interp='Poor prognosis. Transplant should be considered.';next='Ruxolitinib as standard initial therapy. REFER FOR TRANSPLANT ASSESSMENT — this is the pivotal decision. Obtain HCT-CI, donor search. Fedratinib or pacritinib if ruxolitinib-intolerant. Molecular profiling essential.';}
    else{risk='vhigh';label='High Risk';os='~1.5 yrs';interp='Very poor prognosis. Transplant is the only potentially curative option.';next='URGENT transplant referral (median OS 1.5 yrs without cure). Bridge with ruxolitinib/pacritinib/fedratinib. Consider luspatercept for anaemia if transfusion-dependent. Discuss goals of care. Clinical trial enrolment.';}
    const dipssLabel=['Low','Int-1','Int-2','High'][dipssRisk];
    return{score:total,max:6,risk,label,
      stats:[['DIPSS Base Score',dipssScore+' ('+dipssLabel+')'],['DIPSS-Plus Points','+'+plusPoints],['Total DIPSS-Plus',total+'/6'],['Median OS',os]],
      interp,next};
  }
},
mipi:{
  id:'mipi', name:'MIPI', purpose:'Risk stratification in Mantle Cell Lymphoma (MCL) at diagnosis to guide treatment intensity.',
  cat:'malignant', disease:'Mantle Cell Lymphoma',
  tags:['mcl','mantle cell lymphoma','mipi','prognosis','lymphoma','ibrutinib','r-chop','r-dhap'],
  evidence:{source:'Hoster E et al. Blood. 2008;111(2):558-65.',guideline:'ESMO / NCCN / EHA',year:2008,pmid:'17962512'},
  whenUse:'Newly diagnosed Mantle Cell Lymphoma at diagnosis for risk stratification and treatment planning.',
  whenNot:'Post-treatment assessment. Non-MCL lymphomas. Blastoid/pleomorphic MCL may have worse prognosis independent of MIPI score.',
  limits:'Developed in pre-ibrutinib/targeted therapy era. MIPI-c (combined with Ki-67) provides superior discrimination — request Ki-67 on diagnostic biopsy where possible. MIPI in isolation may underestimate risk in blastoid variant.',
  inputs:[
    {id:'age',label:'Age (years)',type:'number',min:18,max:100,step:1},
    {id:'ecog',label:'ECOG Performance Status ≥2',type:'check'},
    {id:'ldh',label:'LDH (U/L)',type:'number',min:1,max:5000,step:1},
    {id:'ldhUln',label:'LDH upper limit of normal (U/L)',type:'number',min:100,max:500,step:1,placeholder:'e.g. 250'},
    {id:'wbc',label:'WBC count (×10⁹/L)',type:'number',min:0.1,max:500,step:0.1},
  ],
  calc:(v)=>{
    if(!v.age||!v.ldh||!v.ldhUln||!v.wbc) return{score:'-',max:null,risk:'info',label:'Enter all required values',stats:[],interp:'',next:''};
    const ldhRatio=v.ldh/v.ldhUln;
    if(ldhRatio<=0||v.wbc<=0) return{score:'-',max:null,risk:'info',label:'Invalid input values',stats:[],interp:'',next:''};
    const wbcPerUl=v.wbc*1000; // convert ×10⁹/L → per µL for log10
    const mipi=(0.03535*v.age)+(v.ecog?0.6978:0)+(1.367*Math.log10(ldhRatio))+(0.9393*Math.log10(wbcPerUl));
    const score=Math.round(mipi*100)/100;
    let risk,label,os5yr,interp,next;
    if(mipi<5.7){risk='low';label='Low Risk';os5yr='~60%';interp='Favourable MIPI. Good prognosis.';next='R-CHOP × 6 cycles ± autologous SCT consolidation in fit patients <65. BTK inhibitor combinations (ibrutinib/acalabrutinib) in frontline trials. Anti-CD20 maintenance (rituximab) standard post-induction.';}
    else if(mipi<=6.2){risk='int';label='Intermediate Risk';os5yr='~35%';interp='Intermediate MIPI.';next='R-CHOP or R-DHAP alternating ± autologous SCT for transplant-eligible. BTK inhibitor-based regimens increasingly used. Ki-67 ≥30% (high MIPI-c) warrants more intensive approach. Clinical trial enrolment recommended.';}
    else{risk='high';label='High Risk';os5yr='~20%';interp='High MIPI — poor prognosis. Aggressive approach required.';next='R-DHAP/R-HyperCVAD with autologous SCT for fit patients. BTK inhibitor combinations (ibrutinib/venetoclax). Allogeneic SCT in relapse/refractory. Clinical trial. Reduced-intensity approach for unfit patients. Blastoid morphology warrants cytarabine-containing regimen.';}
    return{score:score,max:null,risk,label,
      stats:[['MIPI Score',score.toFixed(2)],['LDH/ULN ratio',ldhRatio.toFixed(2)],['WBC (×10⁹/L)',v.wbc],['5-year OS',os5yr]],
      interp,next};
  }
},
mysecpm:{
  id:'mysecpm', name:'MYSEC-PM', purpose:'Predict survival in secondary myelofibrosis developing after Polycythaemia Vera or Essential Thrombocythaemia.',
  cat:'malignant', disease:'Post-PV/ET Myelofibrosis',
  tags:['myelofibrosis','mpn','post-pv mf','post-et mf','prognosis','transplant','mysec','calr','jak2'],
  evidence:{source:'Passamonti F et al. Blood. 2017;129(16):2246-52.',guideline:'ELN / NCCN',year:2017,pmid:'28154879'},
  whenUse:'Myelofibrosis arising from prior PV or ET (secondary MF). Do NOT use for primary myelofibrosis (use DIPSS or DIPSS-Plus).',
  whenNot:'Primary myelofibrosis (use DIPSS/DIPSS-Plus). Pre-fibrotic MPN. Essential thrombocythaemia or PV without fibrotic transformation.',
  limits:'Does not incorporate all high-risk mutations. CALR mutational subtype required (type-1/like vs other). Molecular data (ASXL1, EZH2, IDH1/2, SRSF2) not included.',
  inputs:[
    {id:'age',label:'Age at MF diagnosis (years)',type:'number',min:18,max:100,step:1},
    {id:'hgb',label:'Haemoglobin <11 g/dL',type:'check'},
    {id:'blasts',label:'Circulating blasts ≥3%',type:'check'},
    {id:'calr',label:'Non-type-1/like CALR mutation OR JAK2/MPL/triple-negative (i.e. not CALR type-1/like)',type:'check'},
    {id:'symptoms',label:'Constitutional symptoms (weight loss >10%, night sweats, or fever)',type:'check'},
  ],
  calc:(v)=>{
    if(!v.age) return{score:'-',max:null,risk:'info',label:'Enter age to calculate',stats:[],interp:'',next:''};
    const score=(v.age*0.15)+(v.hgb?2:0)+(v.blasts?2:0)+(v.calr?3:0)+(v.symptoms?2:0);
    const s=Math.round(score*10)/10;
    let risk,label,os,interp,next;
    if(s<11){risk='low';label='Low Risk';os='Not reached';interp='Favourable prognosis in post-PV/ET MF.';next='Ruxolitinib for symptom control and splenomegaly. Observation if minimal symptoms. Transplant generally not indicated. Annual reassessment with repeat molecular profiling.';}
    else if(s<14){risk='int';label='Intermediate-1';os='~9.3 yrs';interp='Moderate prognosis.';next='Ruxolitinib standard. Transplant discussion if high-risk mutations co-present (ASXL1, EZH2, IDH1/2, SRSF2). Obtain full molecular profiling. Clinical trial enrolment where available.';}
    else if(s<16){risk='high';label='Intermediate-2';os='~4.4 yrs';interp='Poor prognosis. Transplant should be considered.';next='Ruxolitinib or fedratinib as initial therapy. REFER FOR TRANSPLANT ASSESSMENT. Obtain HCT-CI, donor search. Full molecular profiling for additional risk refinement. Discuss goals of care.';}
    else{risk='vhigh';label='High Risk';os='~2.1 yrs';interp='Very poor prognosis.';next='URGENT transplant referral — only potentially curative treatment. Bridge therapy with ruxolitinib/pacritinib/fedratinib. Manage anaemia (luspatercept, danazol, EPO-based, transfusion support). Discuss goals of care. Clinical trial preferred.';}
    const calrNote=v.calr?'Non-type-1/like CALR or JAK2/MPL/triple-neg':'CALR type-1/like';
    return{score:s,max:null,risk,label,
      stats:[['MYSEC-PM Score',s.toFixed(1)],['Age contribution',(v.age*0.15).toFixed(1)],['Molecular status',calrNote],['Median OS',os]],
      interp,next};
  }
},
ironload:{id:'ironload',name:'Transfusion Iron Overload',purpose:'Estimate transfusional iron loading and assess chelation need.',cat:'benign',disease:'Transfusion',icon:'🩸',tags:['iron','overload','chelation','transfusion','ferritin','deferasirox','thalassaemia','mds'],evidence:{source:'Porter JB. Hematol Oncol Clin N Am. 2014;28(4):683.',guideline:'BSH / TIF',year:2014,pmid:'25064707'},whenUse:'Regularly transfused patients (thalassaemia, MDS, sickle cell, MF, AA).',whenNot:'Iron deficiency. Infrequent transfusion.',limits:'Ferritin is imperfect (acute phase). Liver MRI T2* is gold standard for LIC. Cardiac T2* for cardiac iron.',inputs:[{id:'units',label:'Lifetime RBC units transfused',type:'number',min:0,max:2000,step:1},{id:'ferr',label:'Current ferritin (µg/L)',type:'number',min:0,max:100000,step:1},{id:'cardiac',label:'Cardiac T2* MRI',type:'select',opts:[['Not measured',0],['>20 ms (normal)',1],['10-20 ms (mild)',2],['<10 ms (severe)',3]]}],calc:(v)=>{const iron=(v.units||0)*200;const f=v.ferr||0;let risk,label,interp,next;if(f>2500||(v.cardiac||0)>=2){risk='high';label='Iron Overload — Chelation Required';interp='Confirmed overload.'+(v.cardiac>=3?' ⚠ CARDIAC IRON — urgent.':'');next='Deferasirox 14-28 mg/kg/day first-line. Deferoxamine SC/IV for cardiac loading. Deferiprone for best cardiac T2* response. Monitor: ferritin q3mo, liver MRI yearly, cardiac T2* yearly.';}else if(f>1000||(v.units||0)>=20){risk='int';label='At Risk — Monitor';interp='Approaching chelation threshold.';next='Consider chelation if ferritin persistently >1000. Baseline: liver MRI, cardiac MRI, LFTs, renal function.';}else{risk='low';label='Low Iron Burden';interp='Below threshold.';next='Monitor ferritin q3-6mo if regularly transfused.';}return{score:f,max:null,risk,label,stats:[['Iron load',iron+' mg (~'+(iron/1000).toFixed(1)+' g)'],['Ferritin',f+' µg/L'],['Units',v.units||0]],interp,next};}},
};

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const CATS=[
  {id:'malignant',label:'Malignant Haematology',icon:'🔴',color:'#be123c'},
  {id:'benign',label:'Benign Haematology',icon:'🩸',color:'#0891b2'},
  {id:'general',label:'General Medicine',icon:'🏥',color:'#6d28d9'},
];

// ─── DISEASE SUBCATEGORY HIERARCHY ───────────────────────────────────────────
const SUBS={
  malignant:[
    {id:'dlbcl',label:'DLBCL',icon:'🔴',calcs:['ipi','ripi','nccnipi','cnsipi','dbl']},
    {id:'fl',label:'Follicular Lymphoma',icon:'🟢',calcs:['flipi','flipi2','primapi']},
    {id:'hl',label:'Hodgkin Lymphoma',icon:'💜',calcs:['ips','ghsg']},
    {id:'mcl',label:'Mantle Cell Lymphoma',icon:'🟠',calcs:['mipi','mipib']},
    {id:'cll',label:'CLL / SLL',icon:'🔵',calcs:['rai','binet','cllipi','iwcll']},
    {id:'tcl',label:'T-Cell / NK-Cell Lymphoma',icon:'🟤',calcs:['pit','pinke']},
    {id:'mzl',label:'Marginal Zone Lymphoma',icon:'🟢',calcs:['maltipi','mzlipi']},
    {id:'burkitt_pcnsl',label:'Burkitt / CNS Lymphoma',icon:'🧠',calcs:['burkitt','ielsg','ielsg24']},
    {id:'wm',label:"Waldenström's (LPL)",icon:'🔵',calcs:['isswm']},
    {id:'mm',label:'Multiple Myeloma',icon:'⚪',calcs:['iss','r2iss']},
    {id:'mgus_smm',label:'MGUS / Smouldering Myeloma',icon:'⚪',calcs:['mgus','smm']},
    {id:'aml',label:'AML',icon:'🔴',calcs:['elnAml']},
    {id:'mds',label:'MDS',icon:'🔵',calcs:['ipss','ipssr','ipssm']},
    {id:'cml',label:'CML',icon:'🟡',calcs:['sokal','hasford','eutos','elts','elnCml']},
    {id:'mpn',label:'MPN / Myelofibrosis',icon:'🟣',calcs:['dipss','dipssplus','mipss70','gipss','mysecpm']},
    {id:'et_pv',label:'ET / Polycythaemia Vera',icon:'🟣',calcs:['ipset','pvdipss']},
    {id:'al_amyloid',label:'AL Amyloidosis',icon:'💜',calcs:['amyloid']},
    {id:'aa',label:'Aplastic Anaemia',icon:'🔴',calcs:['aasev']},
    {id:'chip_ccus',label:'CHIP / CCUS',icon:'🧬',calcs:['chipDiag','chrs']},
    {id:'transplant_pre',label:'Transplant — Pre-HCT Assessment',icon:'🔄',calcs:['hctci','ebmt','dri']},
    {id:'transplant_post',label:'Transplant — Post-HCT Complications',icon:'🔄',calcs:['agvhd','cgvhd','vod']},
    {id:'cart_cell',label:'CAR-T & Cellular Therapy',icon:'🧬',calcs:['crs','ice']},
    {id:'immunotherapy',label:'Immunotherapy Toxicity',icon:'🛡️',calcs:['irae']},
  ],
  benign:[
    {id:'hlh_tma',label:'HLH / TMA',icon:'🔬',calcs:['hscore','plasmic']},
    {id:'coag',label:'Coagulation / Platelets',icon:'🩸',calcs:['fourts','dic','itpbat','tls']},
    {id:'vte_dx',label:'VTE Diagnosis',icon:'🫁',calcs:['wells_pe','wellsdvt','geneva']},
    {id:'af_anticoag',label:'AF / Anticoagulation',icon:'❤️',calcs:['chads','hasbled']},
    {id:'vte_proph',label:'VTE Prophylaxis',icon:'🏥',calcs:['padua','caprini','improve','khorana']},
    {id:'fn',label:'Febrile Neutropenia',icon:'🌡️',calcs:['mascc']},
    {id:'iron_ferr',label:'Iron / Ferritin',icon:'🔬',calcs:['ferritin','tsat']},
    {id:'cart',label:'CAR-T Toxicity',icon:'🧬',calcs:['crs']},
    {id:'transfusion',label:'Transfusion Medicine',icon:'🩸',calcs:['bloodvol','pltdose','ironload']},
  ],
  general:[
    {id:'icu_acute',label:'ICU / Acute Care',icon:'🏥',calcs:['sofa','qsofa2','news2','apache']},
    {id:'cardiology',label:'Cardiology',icon:'❤️',calcs:['grace','heart','timi','rcri','qrisk3','maggic','ldlc']},
    {id:'renal',label:'Renal Function',icon:'🏔️',calcs:['egfr','crcl','akikdigo']},
    {id:'electrolytes',label:'Electrolytes / Acid-Base',icon:'⚗️',calcs:['corr_ca','corrna','aniongap','abg','osmo','winters']},
    {id:'hepatology',label:'Hepatology',icon:'🫁',calcs:['childpugh','meld']},
    {id:'dosing',label:'Oncology Dosing',icon:'💊',calcs:['bsa','calvert','chemodose','cisplatin','steroid']},
    {id:'fitness',label:'Fitness / Frailty / Comorbidity',icon:'🏃',calcs:['ecog','karnofsky','cfs','g8','charlson']},
    {id:'haem_basics',label:'Haematology Basics',icon:'🔬',calcs:['anc','rpi']},
  ],
};

// ─── CLINICAL PATHWAYS ──────────────────────────────────────────────────────
const PATHWAYS=[
{id:'hlh',title:'Suspected HLH Pathway',icon:'🔥',desc:'Systematic workup for haemophagocytic lymphohistiocytosis',
 steps:[
  {title:'Clinical Suspicion',text:'Consider HLH if: unexplained fever + cytopenias + hepatosplenomegaly + very high ferritin (>500, especially >10,000 µg/L). Common triggers: infection (especially EBV, CMV), malignancy (lymphoma), autoimmune disease.',action:'Proceed to investigations'},
  {title:'Initial Investigations',text:'Urgent bloods: FBC, blood film, ferritin, triglycerides, fibrinogen, LDH, liver function, coagulation screen. Send: sCD25/sIL-2R, NK cell function, ADAMTS13 (to exclude TTP).',action:'Calculate HScore',calcId:'hscore'},
  {title:'Calculate HScore',text:'Use the HScore to estimate probability of HLH. Score >169 has >93% probability. This guides urgency of treatment initiation.',action:'Review result'},
  {title:'Bone Marrow',text:'Bone marrow aspirate ± trephine: look for haemophagocytosis, underlying lymphoma, or leukaemia. Note: haemophagocytosis may be absent early — does not exclude HLH.',action:'Specialist referral'},
  {title:'Management',text:'If HLH confirmed/highly likely: High-dose dexamethasone (10 mg/m²). Consider etoposide if no response by 48-72 hours. Treat underlying trigger aggressively. Specialist haematology/immunology input essential. Consider HLH-94/HLH-2004 protocol.',action:'Complete'},
]},
{id:'thrombosis',title:'VTE Risk Assessment',icon:'🦵',desc:'Systematic approach to suspected DVT or PE',
 steps:[
  {title:'Clinical Presentation',text:'Assess for: unilateral leg swelling/pain (DVT), dyspnoea/chest pain/tachycardia (PE), haemoptysis, syncope. Identify risk factors: recent surgery/immobilisation, active cancer, prior VTE, pregnancy, oestrogen use.',action:'Apply Wells Score'},
  {title:'Wells Score',text:'Calculate Wells Score for the relevant condition — DVT or PE. This determines whether D-dimer testing or direct imaging is appropriate.',action:'Calculate Wells PE',calcId:'wells_pe'},
  {title:'D-dimer or Imaging',text:'PE Unlikely (Wells ≤4): check age-adjusted D-dimer. PE Likely (Wells >4): proceed to CTPA directly. DVT Unlikely (Wells ≤1): D-dimer. DVT Likely (Wells ≥2): compression ultrasound.',action:'If VTE confirmed'},
  {title:'Anticoagulation',text:'Confirmed VTE: start therapeutic anticoagulation. DOAC preferred (apixaban or rivaroxaban — no lead-in LMWH needed). If cancer-associated: DOAC (edoxaban/rivaroxaban) or LMWH. Duration: provoked 3 months, unprovoked ≥6 months (consider indefinite).',action:'Assess bleeding risk',calcId:'hasbled'},
  {title:'Follow-Up',text:'Reassess at 3 months: provoked vs unprovoked, bleeding risk, patient preference. Consider thrombophilia screen if: unprovoked, age <50, strong family history, unusual site. Do NOT screen during acute VTE or on anticoagulation.',action:'Complete'},
]},
{id:'anaemia',title:'Anaemia Workup Pathway',icon:'🩸',desc:'Systematic approach to investigating anaemia based on MCV',
 steps:[
  {title:'Confirm Anaemia',text:'WHO definition: Hb <130 g/L (male), <120 g/L (female). Check MCV to classify: Microcytic (<80 fL), Normocytic (80-100 fL), Macrocytic (>100 fL). Also check reticulocyte count, blood film, and basic biochemistry.', action:'Classify by MCV'},
  {title:'Microcytic (MCV <80)',text:'Most common causes: iron deficiency (by far most common), thalassaemia trait, anaemia of chronic disease, sideroblastic anaemia (rare). Key tests: ferritin, transferrin saturation, iron studies. If ferritin <30: iron deficiency confirmed. If ferritin 30-100 with low Tsat: possible mixed picture. If normal/high ferritin: consider thalassaemia (Hb electrophoresis, HbA2), lead, sideroblasts.',action:'Check ferritin'},
  {title:'Normocytic (MCV 80-100)',text:'Broad differential: anaemia of chronic disease/inflammation (most common in hospital), renal anaemia (check eGFR), mixed deficiency (concurrent iron + B12/folate), haemolysis (check LDH, haptoglobin, reticulocytes, bilirubin, DAT), bone marrow failure/infiltration, acute blood loss. Reticulocyte count is key: high = haemolysis/bleeding, low = underproduction.',action:'Calculate eGFR',calcId:'egfr'},
  {title:'Macrocytic (MCV >100)',text:'Key causes: B12/folate deficiency (commonest), alcohol, liver disease, hypothyroidism, MDS, drugs (methotrexate, azathioprine, hydroxycarbamide), reticulocytosis. If B12/folate normal and no obvious cause: blood film for dysplasia, consider bone marrow for MDS (→ IPSS-R if confirmed).',action:'If MDS suspected',calcId:'ipssr'},
  {title:'Iron Deficiency Investigation',text:'Iron deficiency confirmed (ferritin <30). In men and post-menopausal women: GI investigation mandatory (coeliac serology + upper and lower GI endoscopy) unless clear alternative cause. Pre-menopausal women: menstrual history first, GI investigation if heavy menstruation excluded or age >50. Treat: oral iron (ferrous sulphate 200mg OD with vitamin C) or IV iron if intolerant/malabsorption.',action:'Complete'},
]},
{id:'pancytopenia',title:'Pancytopenia Workup',icon:'pancyto',desc:'Systematic approach to investigating pancytopenia',
 steps:[
  {title:'Confirm Pancytopenia',text:'Definition: reduction in all 3 lineages — Hb, WBC/neutrophils, AND platelets below normal range. Check: is it new or chronic? Rate of decline? Drugs? Recent infections? B12/folate deficiency (reversible cause)?',action:'Initial investigations'},
  {title:'Urgent Bloods & Film',text:'FBC with reticulocyte count, blood film (essential — look for blasts, dysplasia, leukoerythroblastic features, fragments), LDH, haptoglobin, B12, folate, ferritin, TFTs, HIV, hepatitis serology, autoimmune screen (ANA, dsDNA). Reticulocyte count: low = underproduction, raised = peripheral destruction.',action:'Assess blood film'},
  {title:'Blood Film Assessment',text:'Key findings: BLASTS → urgent haematology (acute leukaemia until proven otherwise). Dysplastic features → MDS. Leukoerythroblastic → marrow infiltration (fibrosis, metastases, lymphoma). Megaloblastic changes → B12/folate. Fragments → microangiopathy (TTP/HUS/DIC).', action:'Calculate HScore if febrile',calcId:'hscore'},
  {title:'Bone Marrow',text:'Bone marrow aspirate + trephine biopsy is usually required unless a clear reversible cause is identified (B12/folate deficiency, drug-induced). Send: morphology, flow cytometry, cytogenetics, molecular (NGS panel). Trephine: assess cellularity, fibrosis, infiltration.',action:'Interpret results'},
  {title:'Diagnosis & Management',text:'Common diagnoses: MDS (→ IPSS-R), aplastic anaemia (→ Camitta severity), acute leukaemia (→ ELN risk), B12/folate deficiency (treat and repeat FBC), hypersplenism, HIV/viral, drug-related, HLH. Rare: hairy cell leukaemia, systemic mastocytosis, storage diseases.',action:'Risk stratify',calcId:'ipssr'},
]},
{id:'neutsep',title:'Neutropenic Sepsis Pathway',icon:'neutsep',desc:'Haematology-specific management of febrile neutropenia',
 steps:[
  {title:'Recognition',text:'Neutropenic sepsis = temperature ≥38°C (or ≥38.3°C single reading) AND neutrophils <0.5 ×10⁹/L (or expected to fall). THIS IS A MEDICAL EMERGENCY. Time to antibiotics is the single most important factor — target DOOR-TO-NEEDLE <60 MINUTES.',action:'Calculate ANC',calcId:'anc'},
  {title:'Immediate Actions (Sepsis-6)',text:'Within 1 HOUR: (1) Blood cultures ×2 (peripheral + line if CVAD). (2) IV antibiotics per local protocol (typically piperacillin-tazobactam 4.5g or meropenem 1g if penicillin allergy/ESBL risk). (3) IV fluid bolus if hypotensive. (4) Lactate. (5) Urine output monitoring. (6) High-flow O₂ if SpO₂ <94%.',action:'Risk stratify with MASCC',calcId:'mascc'},
  {title:'MASCC Risk Assessment',text:'MASCC ≥21: LOW RISK — consider oral antibiotics (amoxicillin-clavulanate + ciprofloxacin) and early discharge IF: reliable patient, lives near hospital, carer available, no organ dysfunction. MASCC <21: HIGH RISK — admit for IV antibiotics. NOTE: haematology patients with expected prolonged neutropenia (>7 days) should generally be admitted regardless of MASCC score.',action:'Ongoing management'},
  {title:'48-72 Hour Review',text:'If improving: continue antibiotics until afebrile ≥48h AND neutrophils recovering (>0.5). If NOT improving by 48h: escalate antibiotics (add vancomycin if line infection suspected, antifungals if persistent fever >96h without source). CT chest for invasive fungal disease. Consider G-CSF. If deteriorating: ICU review, calculate SOFA score.',action:'Calculate SOFA if deteriorating',calcId:'sofa'},
  {title:'Antifungal Escalation',text:'Persistent fever >96h on broad-spectrum antibiotics without identified source: start empirical antifungal — liposomal amphotericin B or caspofungin. CT chest (HRCT) for pulmonary aspergillosis (halo sign). Galactomannan (serum + BAL). Beta-D-glucan. If proven/probable IFI: switch to targeted antifungal per local protocol.',action:'Complete'},
]},
{id:'thrombocytopenia',title:'Thrombocytopenia Workup',icon:'thrombo',desc:'Systematic approach to isolated thrombocytopenia',
 steps:[
  {title:'Confirm True Thrombocytopenia',text:'FIRST: exclude pseudothrombocytopenia (EDTA-induced platelet clumping). Request citrate sample or blood film review. If confirmed low: assess severity — mild (100-150), moderate (50-100), severe (<50), critical (<20). Is it isolated or part of pancytopenia?',action:'Assess acuity and context'},
  {title:'Acute vs Chronic',text:'ACUTE (<3 months): drug-induced (common — check new medications within 2 weeks), infection-associated (viral: EBV, CMV, HIV, hepatitis), immune (ITP), microangiopathic (TTP/HUS — check film for fragments), DIC, HIT (if on heparin). CHRONIC: ITP, MDS, liver disease/hypersplenism, bone marrow disorder.',action:'Check blood film'},
  {title:'Critical Investigations',text:'Blood film (MANDATORY — fragments? blasts? clumps?), reticulocytes, LDH, haptoglobin, bilirubin (haemolysis screen), coagulation screen, fibrinogen (DIC?), liver function, HIV, hepatitis B/C, autoimmune screen. If on heparin: 4Ts score.',action:'Calculate 4Ts if on heparin',calcId:'fourts'},
  {title:'Microangiopathy Screen',text:'If blood film shows fragments + thrombocytopenia: URGENT — this may be TTP. Calculate PLASMIC score immediately. If PLASMIC ≥6: START PLASMA EXCHANGE before ADAMTS13 result. Do NOT delay. Also consider: HUS (check creatinine), DIC (check fibrinogen, D-dimer), HELLP (if pregnant).',action:'Calculate PLASMIC',calcId:'plasmic'},
  {title:'ITP Diagnosis & Management',text:'ITP is a diagnosis of exclusion. No specific diagnostic test. Assess bleeding with ITP-BAT score. Treatment thresholds: plt <20-30 or significant bleeding. First-line: corticosteroids (prednisolone 1mg/kg or dexamethasone 40mg ×4 days). IVIg if rapid response needed. If refractory: TPO-RA (romiplostim/eltrombopag), rituximab, or splenectomy.',action:'Score bleeding',calcId:'itpbat'},
]},
{id:'ttp_tma',title:'TTP / Thrombotic Microangiopathy',icon:'ttp',desc:'Diagnosis and management of TMA including TTP, atypical HUS, and secondary causes',
 steps:[
  {title:'Recognise TMA',text:'Suspect TMA if: microangiopathic haemolytic anaemia (MAHA) + thrombocytopenia on blood film. Key film findings: schistocytes/fragments (>2 per HPF significant). Check: LDH (markedly elevated), haptoglobin (undetectable), unconjugated bilirubin (elevated), reticulocytes (elevated), DAT (typically negative in TMA). Assess organ involvement: renal (creatinine, urine dip), neurological (GCS, focal signs), cardiac (troponin).',action:'Classify TMA subtype'},
  {title:'PLASMIC Score',text:'Calculate PLASMIC score to stratify probability of severe ADAMTS13 deficiency (≤10%) which confirms TTP. Score ≥6 = HIGH probability of TTP (sensitivity ~99%, specificity ~65%). Do NOT wait for ADAMTS13 result before starting treatment if PLASMIC ≥6.',action:'Calculate PLASMIC',calcId:'plasmic'},
  {title:'ADAMTS13 Workup',text:'Send BEFORE plasma exchange if possible but do NOT delay treatment: ADAMTS13 activity (severe deficiency ≤10% = TTP), ADAMTS13 inhibitor titre (IgG), anti-ADAMTS13 antibody. Also send: renal profile, STEC screen (stool culture, E. coli O157 toxin — important if diarrhoeal prodrome for HUS), complement screen (C3, C4, CH50, factor H — atypical HUS). ADAMTS13 result takes 24–48 hours.',action:'Start treatment immediately'},
  {title:'Plasma Exchange (PEX)',text:'PLASMIC ≥6 or confirmed TTP: START PLASMA EXCHANGE IMMEDIATELY. Target: 1–1.5× plasma volume daily. Use FFP (or pathogen-reduced FFP). Do NOT use cryoprecipitate-depleted plasma (cryo-poor) as first-line. Continue daily until: platelet count >150 ×10⁹/L for ≥2 consecutive days AND LDH normalising. Steroids: methylprednisolone 1mg/kg/day IV or prednisolone 1mg/kg/day PO. Caplacizumab: consider in confirmed immune TTP (ADAMTS13 ≤10%) — reduces time to platelet response, reduces refractory/relapse risk. Add rituximab (375mg/m²) in confirmed immune TTP to prevent relapse.',action:'Ongoing monitoring'},
  {title:'Caplacizumab & Steroid Protocol',text:'Caplacizumab (anti-VWF nanobody): 10mg IV bolus on Day 1 before PEX, then 10mg SC daily during PEX and for 30 days after last PEX. Platelet transfusion: AVOID in TTP unless life-threatening haemorrhage — paradoxically worsens thrombosis. Monitor daily: platelets, LDH, creatinine, neurological status. Rebound thrombocytopenia after stopping caplacizumab is well recognised — continue to monitor for 4 weeks post-treatment. Rituximab: 375mg/m² weekly ×4 doses for confirmed immune TTP.',action:'Complete / follow-up'},
]},
{id:'myeloma_response',title:'Myeloma Response Assessment',icon:'myeloma_r',desc:'IMWG response criteria and MRD assessment for myeloma monitoring',
 steps:[
  {title:'IMWG Response Framework',text:'Multiple myeloma response is assessed per International Myeloma Working Group (IMWG) 2016 criteria. Responses are evaluated after each treatment cycle and at key decision points. The key responses are: sCR (stringent complete response), CR (complete response), VGPR (very good partial response), PR (partial response), MR (minimal response — RRMM only), SD (stable disease), PD (progressive disease). MRD-negative status is now a key endpoint in clinical trials.',action:'Define baseline M-protein'},
  {title:'sCR & CR Criteria',text:'sCR: serum and urine M-protein undetectable by immunofixation, FLC ratio normal, AND no clonal PCs in bone marrow by immunohistochemistry or 2-colour flow cytometry. CR: serum and urine M-protein undetectable by immunofixation (IFE), <5% plasma cells in BM, AND disappearance of any soft tissue plasmacytomas. Both require confirmation at ≥6 weeks. If sCR/CR achieved, consider MRD testing.',action:'Assess MRD'},
  {title:'VGPR & PR',text:'VGPR: ≥90% reduction in serum M-protein AND urine M-protein <100mg/24h. PR: ≥50% reduction in serum M-protein AND ≥90% reduction in urine M-protein OR urine M-protein <200mg/24h. For non-secretory myeloma: ≥50% reduction in involved:uninvolved FLC ratio (requires involved FLC ≥100mg/L). Assess plasmacytoma response separately — ≥50% reduction required for PR.',action:'Assess MRD if VGPR or better'},
  {title:'MRD Assessment',text:'MRD testing is recommended at suspected CR/sCR. Methods: (1) Next-generation flow cytometry (NGF) — sensitivity 10⁻⁵ to 10⁻⁶; (2) Next-generation sequencing (NGS) — sensitivity 10⁻⁵ to 10⁻⁶; (3) PET-CT — functional imaging for extramedullary disease. MRD-negative (10⁻⁵) = no evidence of clonal plasma cells at that sensitivity. MRD-negative (10⁻⁶) = deeper response. MRD negativity is associated with improved PFS and OS in multiple myeloma trials (e.g. FORTE, MAIA, GMMG-CONCEPT). Sustained MRD negativity (×2, ≥12 months apart) is a key endpoint.',action:'Interpret and plan'},
  {title:'Progressive Disease & Relapse',text:'Progressive Disease (PD): any one of: ≥25% increase in serum M-protein (absolute ≥5g/L); ≥25% increase in urine M-protein (absolute ≥200mg/24h); ≥25% increase in FLC (absolute ≥100mg/L); ≥25% increase in BM plasma cell % (absolute ≥10%); new/enlarging bone lesion or soft-tissue plasmacytoma; new hypercalcaemia. Biochemical relapse: PD without symptoms. Clinical relapse: PD + CRAB criteria (Calcium, Renal, Anaemia, Bone) or soft tissue plasmacytoma. Treatment decision depends on: time since last therapy (>12 months preferred), prior lines, fitness, and donor availability if allo-SCT planned.',action:'Complete'},
]},
{id:'polycythaemia',title:'Polycythaemia / Erythrocytosis Pathway',icon:'poly',desc:'GP pre-referral and haematology management pathway for polycythaemia — distinguishing PV from secondary and relative causes (Barnsley NHSFT, Dr M Mohsin)',
 steps:[
  {title:'Step 1 — Confirm True Erythrocytosis',text:'Repeat FBC after 2–3 weeks to exclude dehydration or haemoconcentration before acting. Thresholds for investigation: Men — Hct >0.52; Women — Hct >0.48. True erythrocytosis is confirmed when the raised Hct persists on a repeat fasting sample. Coexisting iron deficiency can mask a raised Hct in PV — check ferritin in all patients.',action:'Rule out secondary causes'},
  {title:'Step 2 — Rule Out Secondary & Relative Causes',text:'History: smoking (commonest cause), alcohol, high-altitude exposure. OSA symptoms (snoring, daytime somnolence — consider overnight oximetry or sleep study). Chronic lung or cardiac disease. Recent thrombosis. Medications: testosterone / anabolic steroids, SGLT-2 inhibitors (dapagliflozin, empagliflozin), EPO or analogues, danazol, diuretics (relative). Examination: obesity, cyanosis, clubbing, splenomegaly, signs of cardiopulmonary disease. Investigations in primary care: O₂ saturation (resting ± overnight), U&E, LFTs, urate, ferritin, glucose, urine dipstick (renal disease), abdominal USS (renal/hepatic lesion if suspected), serum EPO level (low in PV, high/normal in secondary causes). Note: JAK2 V617F should only be sent from primary care if pre-agreed with a named haematology consultant.',action:'Apply referral criteria'},
  {title:'Step 3 — Referral Criteria',text:'EMERGENCY — Discuss with haematologist on-call via switchboard: Hct >0.60 (male) or >0.56 (female) in absence of congenital cyanotic heart disease or chronic hypoxia.\n\nURGENT REFERRAL — Hct >0.52 (male) or >0.48 (female) PLUS any of: recent arterial/venous thrombosis (DVT, PE, CVA/TIA, MI, unstable angina, PVD); neurological symptoms; visual loss; abnormal bleeding; splenomegaly; elevated WCC or platelets.\n\nROUTINE REFERRAL — Persistent unexplained elevated Hct. Secondary causes identified but requiring specialist input (cardiac, endocrine, renal/hepatic tumour, drug-related).\n\nDO NOT REFER if: Clear secondary cause identified (COPD, OSA, testosterone therapy, SGLT-2 inhibitor, renal disease, dehydration); JAK2 negative + EPO normal/high + stable counts + no red-flag features.',action:'Haematology assessment'},
  {title:'Step 4 — Haematology Assessment',text:'Full history, examination, and repeat FBC + blood film. Essential investigations: JAK2 V617F mutation (positive in ~95% PV); serum EPO (suppressed = PV, elevated = secondary); ferritin (iron deficiency common in PV — may mask erythrocytosis); red cell mass (isotope dilution if borderline erythrocytosis). If JAK2 negative but high clinical suspicion: JAK2 exon 12 mutation; consider bone marrow biopsy (PV features: hypercellular, plethoric megakaryocytes, reticulin ±). Confirm WHO 2022 criteria for PV: major criteria = BM biopsy showing panmyelosis, Hb ≥185g/L male or ≥165g/L female (or raised RCM), JAK2 V617F or exon 12 positive. Minor criterion = subnormal EPO. Diagnosis requires all 3 major OR major 1+2 and minor.',action:'Check ferritin / iron status',calcId:'ferritin'},
  {title:'Step 5 — Management',text:'POLYCYTHAEMIA VERA: (1) Venesection to maintain Hct <0.45 (men and women) — reduces thrombosis risk. (2) Low-dose aspirin 75mg daily unless contraindicated. (3) Cytoreduction if: age ≥60, prior thrombosis, poor venesection tolerance, symptomatic splenomegaly, or platelets >1500 — first-line hydroxycarbamide. (4) Ruxolitinib (JAK inhibitor) for hydroxycarbamide failure or intolerance. (5) Monitor FBC every 3 months and annual bone marrow review if MF transformation suspected (new splenomegaly, worsening counts, leukoerythroblastic film). Risk-stratify for MF/blast transformation using PV DIPSS.\n\nSECONDARY POLYCYTHAEMIA — GP Monitoring: Repeat FBC every 6 months. Optimise underlying condition: smoking cessation; CPAP for OSA; stop/reduce testosterone or SGLT-2 if possible; control COPD/cardiac/renal disease; lifestyle (hydration, exercise, reduce alcohol). Venesection threshold for secondary: Hct >0.60 (men) or >0.56 (women), OR symptomatic hyperviscosity (headaches, dizziness, visual disturbance, pruritus), OR history of thrombosis + persistent high Hct. Target Hct with venesection: <0.55 (consider lower if thrombotic history). SGLT-2 inhibitors: consider venesection if Hct >0.60 or symptomatic. Re-refer to haematology if: persistent Hct despite optimisation; new thrombosis; rapidly rising counts.',action:'PV DIPSS risk stratification',calcId:'pvdipss'},
]},
{id:'splenomegaly_pathway',title:'Asymptomatic Mild Splenomegaly Pathway',icon:'spleen_path',desc:'GP and secondary care management pathway for incidental asymptomatic mild splenomegaly (<15 cm) — risk stratification and referral criteria (Barnsley NHSFT, Dr M Mohsin)',
 steps:[
  {title:'Step 1 — Confirm & Characterise',text:'Mild splenomegaly is defined as a spleen >12 cm but <15 cm on ultrasound. This is a common incidental finding and most often reflects benign causes (metabolic, hepatic, reactive). Define: Is it truly asymptomatic? Any constitutional symptoms (weight loss, night sweats, fever)? Any cytopenias on FBC? Any lymphadenopathy? Recent infections?\n\nAbdominal ultrasound should characterise: exact spleen size (cm); liver morphology (fatty liver, cirrhosis, hepatomegaly); portal and hepatic vein Doppler; hilar lymphadenopathy; presence of ascites. If spleen ≥15 cm: refer to haematology regardless of other findings.',action:'Initial investigations'},
  {title:'Step 2 — Initial Investigations (Primary Care)',text:'Mandatory in all patients: FBC + blood film (ESSENTIAL — look for cytopenias, lymphocytosis, monocytosis, blasts, leukoerythroblastic features), LFTs and liver synthetic function, LDH and uric acid (raised = haematological malignancy), ferritin and CRP (inflammatory/reactive cause), HIV serology, hepatitis B and C serology, FBC + reticulocyte count.\n\nIf clinically indicated: JAK2 V617F + BCR::ABL1 PCR (if neutrophilia or basophilia — possible MPN or CML); CMV and EBV serology (acute infection); serum immunoglobulins + protein electrophoresis (lymphoproliferative); autoimmune screen — ANA, dsDNA (if systemic autoimmune disease suspected); monospot test; malaria film + antigen (if travel history).\n\nNote: Abdominal USS is mandatory if not already done.',action:'Risk stratify by USS findings'},
  {title:'Step 3A — Mild Splenomegaly + Fatty Liver (Metabolic)',text:'If: FBC and blood film are normal (no cytopenias, no abnormal cells) AND ultrasound shows fatty liver as sole finding (no portal hypertension, no hepatomegaly, no lymphadenopathy) — manage in PRIMARY CARE:\n\n(1) Lifestyle advice: weight reduction, alcohol cessation, exercise, Mediterranean diet. (2) Metabolic risk factor management: optimise diabetes, dyslipidaemia, hypertension. (3) Calculate FIB-4 score to assess liver fibrosis risk (age × AST / [platelets × √ALT]). (4) Repeat abdominal USS at 12 months. (5) Repeat FBC + LFTs + LDH annually.\n\nREFER TO HAEMATOLOGY if any of the following develop: cytopenias or abnormal blood film; persistent polycythaemia, leucocytosis (neutrophilia, monocytosis, lymphocytosis >10×10⁹/L), or thrombocytosis for >3 months; raised LDH or uric acid; positive JAK2/CALR/MPL/BCR::ABL1 on subsequent testing; B symptoms (weight loss, night sweats, fever).',action:'Step 3B — If not simple fatty liver'},
  {title:'Step 3B — Other Causes of Mild Splenomegaly',text:'If FBC abnormal, or splenomegaly NOT explained by fatty liver alone, or USS shows portal hypertension/hepatomegaly/lymphadenopathy — the following are the key differentials to consider:\n\nHAEMATOLOGICAL: Lymphoma (NHL/HL — lymphadenopathy, B symptoms, LDH elevated); MPN (CML — raised WBC with basophilia; PV — raised Hct; ET; early MF); CLL/SLL (lymphocytosis, smear cells); hairy cell leukaemia (pancytopenia, dry tap); early myelofibrosis (leukoerythroblastic film, raised LDH).\n\nHEPATIC/PORTAL: Cirrhosis — portal hypertension; viral hepatitis (B/C); alcohol-related liver disease; Budd-Chiari syndrome or portal vein thrombosis (note: check JAK2 in all unexplained portal vein thrombosis).\n\nINFECTIVE: EBV/CMV mononucleosis; malaria; visceral leishmaniasis (kala-azar); brucellosis.\n\nAUTOIMMUNE: SLE, sarcoidosis, Felty syndrome (RA + neutropenia + splenomegaly).\n\nMETABOLIC/STORAGE: Gaucher disease (check β-glucocerebrosidase enzyme assay if splenomegaly + bone pain + anaemia). If early MF suspected (leukoerythroblastic film, dry tap, raised LDH) — apply DIPSS for risk stratification.',action:'If MPN/MF suspected: DIPSS',calcId:'dipss'},
  {title:'Step 4 — Haematology Investigation & Discharge Criteria',text:'HAEMATOLOGY WORKUP (if referred): CT chest/abdomen/pelvis with contrast (staging, lymphadenopathy, vascular anatomy); bone marrow aspirate + trephine + cytogenetics + molecular panel if haematological malignancy suspected (dry tap → MF likely); JAK2 V617F, CALR, MPL (if MPN suspected); BCR::ABL1 PCR; direct antiglobulin test (if haemolysis); serum immunoglobulins + electrophoresis; ADAMTS13 (if TTP suspected); beta-glucocerebrosidase (if Gaucher suspected).\n\nDISCHARGE CRITERIA from specialist clinic (all must be met): Spleen <15 cm and stable on repeat imaging at 12 months; Normal FBC, blood film, LDH, and uric acid; No cytopenias or B symptoms; Underlying cause identified and managed (or benign/metabolic confirmed). GP follow-up with annual FBC + LFTs + LDH + repeat USS in 1–2 years for all patients with any degree of splenomegaly until stable for ≥2 years.',action:'Complete'},
]},
{id:'mgus_smm',title:'MGUS / SMM Surveillance',icon:'mgus',desc:'Mayo risk stratification and surveillance intervals for MGUS and smouldering myeloma',
 steps:[
  {title:'Confirm Diagnosis',text:'MGUS: serum M-protein <30g/L, BM plasma cells <10%, NO CRAB criteria (Calcium>2.75, Renal creatinine>177, Anaemia Hb<100, Bone lytic lesions), no end-organ damage. SMM (Smouldering Multiple Myeloma): serum M-protein ≥30g/L OR BM plasma cells 10–60%, NO CRAB or SLiM criteria. Key test at diagnosis: whole-body MRI or PET-CT to exclude lytic bone lesions or focal lesions (changes staging). If ≥1 focal MRI lesion: repeat in 3–6 months to confirm SMM rather than active myeloma.',action:'Risk stratify'},
  {title:'MGUS Risk Stratification (Mayo 2005)',text:'Three risk factors: (1) M-protein ≥15g/L; (2) Non-IgG subtype (IgA, IgM, light-chain); (3) Abnormal FLC ratio (<0.26 or >1.65). Low risk (0 factors): 5% progression at 20 years. Low-intermediate (1 factor): 21%. High-intermediate (2 factors): 37%. High risk (3 factors): 58%. 20-year risk of progression to myeloma or related disorder. For IgM MGUS: higher risk of Waldenström, lymphoma — refer to haematology if symptomatic.',action:'Set surveillance interval'},
  {title:'MGUS Surveillance Intervals',text:'Low-risk MGUS (IgG, M-protein <15g/L, normal FLC ratio): serum protein electrophoresis + FLC at 6 months, then ANNUAL if stable. If stable at 3 years with no progression signs, can extend to every 2–3 years in non-frail patients. High-risk MGUS (≥2 risk factors): 6-monthly for first 2 years, then annually. Any of the following requires urgent haematology referral: M-protein increase ≥5g/L (evolving MGUS), plasma cells increasing on BM, new/worsening anaemia, renal impairment, hypercalcaemia, lytic bone lesions, new neuropathy.',action:'Refer triggers'},
  {title:'SMM Risk Stratification (Mayo 2018)',text:'20/2/20 model for SMM: Risk factors: (1) M-protein ≥20g/L; (2) BM plasma cells ≥20%; (3) FLC ratio ≥20 (involved:uninvolved). Low risk (0 factors): 10% progression at 2 years. Intermediate risk (1 factor): 18% at 2 years. High risk (≥2 factors): 44% at 2 years. Ultra-high risk SMM: BM plasma cells ≥60%, FLC ratio ≥100, or ≥2 focal MRI lesions → reclassify as active myeloma (SLiM criteria) and treat. For high-risk SMM: consider enrolment in clinical trials (CESAR, ECOG-ACRIN E3A06, AQUILA — daratumumab-based treatment).',action:'Plan surveillance or treat'},
  {title:'Triggers for Referral / Treatment',text:'REFER URGENTLY if: M-protein ≥30g/L (possible SMM), BM plasma cells ≥10%, new or worsening CRAB, SLiM criteria met (BM PCs ≥60%, FLC ratio ≥100, ≥2 MRI focal lesions). SLiM-CRAB criteria define active myeloma requiring treatment: Sixty percent or more BM plasma cells; Light chain FLC ratio ≥100; MRI ≥2 focal lesions ≥5mm; PLUS classic CRAB criteria. Symptomatic progression: start standard myeloma induction (e.g. VRd or Dara-VRd in transplant-eligible). Annual checks for MGUS/low-risk SMM: FBC, calcium, creatinine, protein electrophoresis, FLC, Hb, LDH.',action:'Complete'},
]},
];

// ─── DIAGNOSTIC INTERPRETATION MODULES ───────────────────────────────────────
const DIAGNOSTICS=[
{id:'pancyto_ddx',title:'Pancytopenia Differential',icon:'pancyto',
 sections:[
  {heading:'Decreased Production (Marrow Failure)',items:['MDS / Acute Leukaemia — blasts on film, dysplasia','Aplastic Anaemia — hypocellular marrow, young patient','B12 / Folate Deficiency — megaloblastic, reversible','Drug-induced — chemotherapy, methotrexate, carbamazepine, co-trimoxazole','Viral — HIV, hepatitis, parvovirus B19, EBV','Infiltration — lymphoma, myelofibrosis, metastatic carcinoma, storage diseases','Hairy Cell Leukaemia — splenomegaly, dry tap, CD103/CD25+']},
  {heading:'Increased Destruction / Consumption',items:['Hypersplenism — cirrhosis, portal hypertension, massive splenomegaly','HLH/MAS — fever, hyperferritinaemia, hypertriglyceridaemia (→ HScore)','DIC — coagulopathy, fragments, sepsis/malignancy trigger','TTP/HUS — fragments, renal impairment (→ PLASMIC)']},
  {heading:'Key Investigations',items:['Blood film (ESSENTIAL — never skip this)','Reticulocyte count (low = underproduction)','B12, folate, ferritin, TFTs, HIV, hepatitis','Bone marrow biopsy (aspirate + trephine) if no reversible cause found','Flow cytometry, cytogenetics, molecular panel on marrow']},
]},
{id:'aptt_prolonged',title:'Prolonged APTT Algorithm',icon:'aptt',
 sections:[
  {heading:'Step 1: Is the Patient Bleeding?',items:['YES + prolonged APTT → factor deficiency likely (haemophilia A/B, vWD, acquired inhibitor)','NO bleeding + prolonged APTT → may be lupus anticoagulant (paradoxically prothrombotic, not bleeding risk)']},
  {heading:'Step 2: Mixing Study (50:50 mix)',items:['CORRECTS → factor deficiency (VIII, IX, XI, XII). Request individual factor levels','DOES NOT CORRECT → inhibitor present. Two types:','→ Immediate non-correction: lupus anticoagulant (confirm with DRVVT/SCT)','→ Time-dependent (incubate 2h): acquired haemophilia (anti-factor VIII inhibitor — rare but serious)']},
  {heading:'Step 3: Common Causes',items:['Heparin contamination (most common in hospital — check anti-Xa or thrombin time)','Lupus anticoagulant — antiphospholipid syndrome (check anti-cardiolipin, anti-β2GP1)','Factor XII deficiency — prolonged APTT but NO bleeding risk (incidental finding)','vWD type 2N or severe type 1 — low FVIII secondary to low vWF','Acquired haemophilia A — elderly, post-partum, autoimmune (high titre FVIII inhibitor, severe bleeding)']},
  {heading:'Key Tests',items:['Mixing study (50:50) ± 2-hour incubation','Factor VIII, IX, XI, XII levels','vWF antigen + activity (Ristocetin cofactor)','Lupus anticoagulant screen (DRVVT + SCT)','Thrombin time (excludes heparin / fibrinogen abnormality)']},
]},
{id:'haemolysis_workup',title:'Haemolysis Workup',icon:'haemolysis',
 sections:[
  {heading:'Confirm Haemolysis (All 3 should be abnormal)',items:['LDH ↑ (released from lysed RBCs)','Haptoglobin ↓ or undetectable (consumed binding free Hb)','Unconjugated (indirect) bilirubin ↑','Also: reticulocytes ↑↑ (marrow compensating), spherocytes or fragments on film']},
  {heading:'Intravascular vs Extravascular',items:['INTRAVASCULAR (RBCs destroyed in circulation): haemoglobinuria (dark/red urine), very low haptoglobin, raised free plasma Hb. Causes: TTP, HUS, DIC, PNH, ABO incompatibility, mechanical (valve, ECMO), cold agglutinins, G6PD crisis','EXTRAVASCULAR (RBCs destroyed in spleen/liver): splenomegaly, spherocytes on film. Causes: autoimmune (warm AIHA), hereditary spherocytosis, hypersplenism']},
  {heading:'DAT (Direct Antiglobulin Test / Coombs)',items:['DAT POSITIVE → Autoimmune haemolytic anaemia (AIHA)','→ IgG positive: warm AIHA (steroids first-line, rituximab if refractory)','→ C3d positive (IgG negative): cold agglutinin disease (avoid cold, rituximab ± complement inhibitor)','→ IgG + C3d: mixed (worse prognosis)','DAT NEGATIVE → Non-immune causes: PNH (flow cytometry for GPI-anchored proteins), microangiopathy (TTP/HUS/DIC → check film for fragments, PLASMIC score), mechanical, G6PD, hereditary spherocytosis, sickle cell']},
  {heading:'Key Investigations',items:['FBC + reticulocytes + blood film (MANDATORY)','LDH, haptoglobin, bilirubin (unconjugated), urinalysis','DAT (direct Coombs test)','If DAT negative: PNH screen (flow cytometry), G6PD assay, Hb electrophoresis','If fragments on film: PLASMIC score for TTP, DIC screen, renal function']},
]},
{id:'hyperferritinaemia_ddx',title:'Hyperferritinaemia Differential',icon:'ferritin',
 sections:[
  {heading:'Ferritin >300 µg/L — Broad Differential',items:['Inflammation / infection (CRP usually raised — most common cause in hospital)','Liver disease (hepatitis, cirrhosis, NAFLD, alcohol)','Metabolic syndrome / obesity','Iron overload (hereditary haemochromatosis, transfusional)','Malignancy (hepatoma, lymphoma, leukaemia)','Renal failure (reduced clearance)']},
  {heading:'Ferritin >1000 µg/L — Narrower Differential',items:['Still\'s disease (Adult-onset Still\'s — rash, arthralgia, quotidian fever)','HLH / MAS (→ calculate HScore immediately if fever + cytopenias)','Severe hepatic necrosis / hepatitis','Haemochromatosis (check transferrin saturation >45%)','Transfusional iron overload (>20 lifetime units)','Renal failure + dialysis']},
  {heading:'Ferritin >10,000 µg/L — URGENT',items:['HLH/MAS (most likely if fever + cytopenias + splenomegaly — HScore)','Adult-onset Still\'s disease (glycosylated ferritin <20%)','Fulminant hepatic failure','Rarely: catastrophic antiphospholipid syndrome (cAPS)']},
  {heading:'Key Discriminating Tests',items:['Transferrin saturation (>45% = true iron overload → HFE genotyping)','CRP (raised = inflammatory/reactive ferritin)','Glycosylated ferritin (<20% suggests HLH or Still\'s disease)','Liver MRI T2*/FerriScan (gold standard for liver iron quantification)','If HLH suspected: HScore, sCD25/sIL-2R, triglycerides, fibrinogen']},
]},
{id:'lymphadenopathy_ddx',title:'Lymphadenopathy Differential',icon:'lymph',
 sections:[
  {heading:'Step 1: Characterise the Node(s)',items:['Site: localised (single region) vs generalised (≥2 non-contiguous regions)','Size: nodes >1 cm axilla/groin or >0.5 cm epitrochlear warrant investigation; >2 cm → biopsy strongly considered','Character: hard/fixed/matted → malignancy; soft/tender/mobile → reactive/infective','Duration: >4–6 weeks without resolving → biopsy; >8 weeks unexplained → urgent referral (2WW in UK)','B symptoms: drenching night sweats, weight loss >10%, fever → strongly suggests lymphoma']},
  {heading:'Localised Lymphadenopathy — Common Causes by Site',items:['Cervical: URTI, EBV (infectious mononucleosis), dental/tonsillar infection, head & neck SCC, thyroid cancer, lymphoma (HL most common in young adults)','Axillary: breast pathology (malignancy, mastitis), cat-scratch disease (Bartonella), melanoma, lymphoma','Inguinal: STIs (syphilis, LGV, HSV), lower limb infections, melanoma/anal/vulval cancer, lymphoma','Mediastinal: sarcoidosis, lymphoma (HL often mediastinal), tuberculosis, thymoma','Supraclavicular (always significant): Left = Virchow\'s (abdominal/pelvic malignancy); Right = lung/mediastinal/oesophageal']},
  {heading:'Generalised Lymphadenopathy — Differential',items:['Infective: EBV, CMV, HIV (acute seroconversion), toxoplasmosis, brucellosis, TB','Haematological malignancy: lymphoma (HL/NHL), CLL, ALL, hairy cell leukaemia','Autoimmune: SLE, rheumatoid arthritis, Sjögren\'s, sarcoidosis','Drugs: phenytoin, allopurinol, carbamazepine (drug hypersensitivity)','Other: Kikuchi-Fujimoto disease (self-limiting, young women), Castleman disease (rare, check HHV-8, IL-6)']},
  {heading:'Key Investigations',items:['FBC + film (lymphocytosis → CLL/viral; atypical lymphocytes → EBV; blasts → leukaemia)','Monospot / EBV serology + CMV, HIV (4th gen), toxoplasma IgM/IgG','LDH, uric acid, CRP, ESR, LFTs','CT chest/abdomen/pelvis (staging CT) if malignancy suspected','PET-CT preferred if lymphoma likely — superior for staging and biopsy site selection','Excision biopsy (not FNA) for suspected lymphoma — FNA insufficient for architecture','Bone marrow biopsy if systemic haematological malignancy suspected']},
  {heading:'Red Flags Requiring Urgent Action',items:['Node >2 cm + B symptoms → 2-week-wait urgent haematology referral','Supraclavicular lymphadenopathy at any size','Rapidly enlarging node(s) over days','Compression symptoms (SVC obstruction, airway compromise)','Lymphadenopathy + splenomegaly + FBC abnormality → haematology same day']},
]},
{id:'splenomegaly_ddx',title:'Splenomegaly Differential',icon:'spleen',
 sections:[
  {heading:'Degree of Splenomegaly',items:['Mild: <5 cm below costal margin — usually infective or haematological','Moderate: 5–10 cm — portal hypertension, lymphoma, myeloproliferative','Massive (>10 cm or crossing midline): Myelofibrosis, CML, visceral leishmaniasis (kala-azar), Gaucher disease, malaria — limited DDx','Tip only: Common finding on USS — often normal variant or mild portal hypertension']},
  {heading:'Haematological Causes (most common in haematology clinic)',items:['Lymphoma (HL and NHL) — commonly moderate','Chronic Lymphocytic Leukaemia (CLL) — progressive splenomegaly','Myeloproliferative neoplasms: CML (can be massive), PV, ET (variable), MF (massive — hallmark)','Haemolytic anaemias: HS, AIHA, sickle cell disease (acute splenic sequestration in young patients)','Hairy Cell Leukaemia — splenomegaly + pancytopenia + dry tap + CD103+ / CD25+','PNH — usually mild-moderate; presents with thrombosis, haemolysis']},
  {heading:'Non-Haematological Causes',items:['Infective: EBV (mononucleosis), malaria, kala-azar (visceral leishmaniasis), brucellosis, schistosomiasis, bacterial endocarditis','Liver disease / portal hypertension: cirrhosis, hepatic vein thrombosis (Budd-Chiari), portal vein thrombosis — check for occult MPN (JAK2 in PVT/BCS)','Inflammatory: SLE, sarcoidosis, Felty\'s syndrome (RA + neutropenia + splenomegaly)','Storage diseases: Gaucher disease (massive spleen, bone marrow infiltration — enzyme assay β-glucocerebrosidase)','Infiltrative: amyloidosis, haemophagocytic lymphohistiocytosis (HLH)']},
  {heading:'Key Investigations',items:['FBC + reticulocytes + blood film (ESSENTIAL)','LDH, uric acid, LFTs, hepatitis B/C serology','JAK2 V617F (mandatory if MPN suspected — also in unexplained portal vein or hepatic vein thrombosis)','BCR-ABL1 (PCR or FISH) if CML possible (massive spleen + high WCC)','CALR / MPL mutations if JAK2 negative + MPN suspected','CT abdomen + pelvis with contrast (assess size, porta hepatis, nodes)','Bone marrow aspirate + trephine if haematological malignancy suspected (dry tap → MF likely)','USS Doppler portal/hepatic veins if portal hypertension suspected']},
  {heading:'Urgent/Emergency Scenarios',items:['Acute splenic sequestration (sickle cell) — acute fall in Hb, enlarging spleen, urgent transfusion','Splenic rupture (EBV — avoid contact sports; trauma) — surgical emergency','Massive splenomegaly with respiratory compromise — urgent haematology assessment','CML with WBC >100×10⁹/L + massive spleen — risk of leucostasis, urgent cytoreduction']},
]},
{id:'coag_screen_abnormal',title:'Abnormal Coagulation Screen',icon:'coag',
 sections:[
  {heading:'Understand the Tests',items:['PT (Prothrombin Time): tests extrinsic pathway (Factor VII → X → II → fibrin) — reflects warfarin effect and liver synthesis','APTT (Activated Partial Thromboplastin Time): tests intrinsic pathway (XII → XI → IX → VIII → X → II → fibrin) — reflects heparin effect, haemophilia','Fibrinogen (Clauss): reflects final common pathway + acute phase reactant — low in DIC, liver failure, consumption','TT (Thrombin Time): tests fibrinogen → fibrin conversion — prolonged by heparin, direct thrombin inhibitors, low fibrinogen, dysfibrinogenaemia']},
  {heading:'Isolated Prolonged PT (APTT normal)',items:['Early warfarin / vitamin K deficiency (FVII shortest half-life — drops first)','Mild liver disease (FVII also drops first in early liver failure)','Factor VII deficiency (rare, autosomal recessive — check FVII level)','Early DIC (PT rises before APTT in some cases)','Action: Check drug history, nutrition, LFTs; if no cause → factor VII level']},
  {heading:'Isolated Prolonged APTT (PT normal)',items:['Heparin (UFH) contamination — most common in hospital setting (check anti-Xa or TT)','Lupus anticoagulant — paradoxically prothrombotic, NOT a bleeding risk; confirm with DRVVT/SCT','Haemophilia A (FVIII deficiency) or B (FIX deficiency) — males; FVIII/FIX levels','Acquired haemophilia A (FVIII inhibitor) — older patients, autoimmune; FVIII level + inhibitor screen','von Willebrand Disease — severe type 1 or type 2N lowers FVIII secondarily','Factor XI deficiency — mild bleeding (often post-surgery), common in Ashkenazi Jewish population','Factor XII deficiency — NO bleeding risk; incidental finding; do NOT give FFP','Action: Mixing study (50:50 with normal plasma) ± 2h incubation → see APTT Algorithm module']},
  {heading:'Both PT and APTT Prolonged',items:['DIC (most important — check urgently): D-dimer ↑↑, fibrinogen ↓, thrombocytopenia, fragments on film (→ DIC Score)','Severe liver disease: synthetic failure (PT prolonged first); check LFTs, albumin, FVII','Warfarin / DOAC effect: check drug history; anti-Xa for DOAC; PT most sensitive for warfarin','Vitamin K deficiency: malabsorption, NBM, antibiotics; responds to IV/PO vitamin K','Massive transfusion / dilutional coagulopathy: >1.5× blood volume replacement without FFP','Afibrinogenaemia / hypofibrinogenaemia: very rare congenital; check fibrinogen level','Combined factor deficiencies (rare): autoimmune, anticoagulant inhibitors, amyloid (FX)']},
  {heading:'Isolated Low Fibrinogen',items:['DIC (consumption) — usually combined with PT/APTT abnormality','Congenital hypofibrinogenaemia / afibrinogenaemia — check family history','Thrombolytic therapy (tPA, streptokinase) — check clinical context','L-asparaginase therapy in ALL — causes hypofibrinogenaemia; monitor closely','Severe liver failure — reduced synthesis']},
  {heading:'Key Rules and Practical Points',items:['Never give FFP for a prolonged APTT alone in an asymptomatic patient — investigate first','Lupus anticoagulant: 12-week repeat positive test required for APS diagnosis (not one-off)','Before any surgery/procedure: If PT/APTT >1.5× control + no obvious cause → haematology input before proceeding','Heparin contamination: commonest cause of unexplained APTT prolongation in hospital — check TT (normal TT excludes heparin)','DIC management: treat underlying cause; cryoprecipitate for fibrinogen <1.5 g/L; FFP for PT/APTT prolongation + active bleeding; platelets if <50 + bleeding']},
]},
];

// ─── ACUTE HAEMATOLOGY TOOLS ────────────────────────────────────────────────
const ACUTE_TOOLS=['hscore','plasmic','fourts','dic','tls','corr_ca','crcl','egfr','news2','sofa','mascc','anc'];

// ─── MOST USED DEFAULTS ─────────────────────────────────────────────────────
const MOST_USED=['hscore','ipi','cnsipi','ipssr','plasmic','iss','wells_pe','sofa','news2','corr_ca','mascc','khorana','crcl','calvert'];

// ─── UTILITY HOOKS ──────────────────────────────────────────────────────────
function useLocalStorage(key,init){
  const[val,setVal]=useState(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):init}catch{return init}});
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(val))}catch{}},[key,val]);
  return[val,setVal];
}

// ─── SESSION RESULT LOG ──────────────────────────────────────────────────────
function LogPage({log,setLog,openCalc,dark,navTo}){
  const[patientRef,setPatientRef]=useState('');

  const riskColors={
    low:{bg:dark?'bg-emerald-950/40 border-emerald-800':'bg-emerald-50 border-emerald-300',dot:'bg-emerald-500',text:dark?'text-emerald-400':'text-emerald-700'},
    int:{bg:dark?'bg-amber-950/40 border-amber-800':'bg-amber-50 border-amber-300',dot:'bg-amber-500',text:dark?'text-amber-400':'text-amber-700'},
    high:{bg:dark?'bg-red-950/40 border-red-800':'bg-red-50 border-red-300',dot:'bg-red-500',text:dark?'text-red-400':'text-red-700'},
    vhigh:{bg:dark?'bg-purple-950/40 border-purple-800':'bg-purple-50 border-purple-300',dot:'bg-purple-500',text:dark?'text-purple-400':'text-purple-700'},
  };
  const getColors=(risk)=>riskColors[risk]||{bg:dark?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200',dot:'bg-slate-400',text:dark?'text-slate-300':'text-slate-600'};

  const exportSessionPDF=(entries,ref)=>{
    const dtStr=new Date().toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const riskHex={low:'#059669',int:'#d97706',high:'#dc2626',vhigh:'#7c3aed'};
    const riskBg={low:'#f0fdf4',int:'#fffbeb',high:'#fef2f2',vhigh:'#faf5ff'};
    const entryCards=entries.map((e,i)=>{
      const col=riskHex[e.risk]||'#475569';
      const bg=riskBg[e.risk]||'#f8fafc';
      return`<div style="border:2px solid ${col};border-radius:10px;padding:16px;margin-bottom:14px;background:${bg};page-break-inside:avoid">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="width:46px;height:46px;border-radius:8px;background:${col};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px;flex-shrink:0;text-align:center">${e.score??'—'}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:2px">
              <span style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em">${e.time}</span>
              <span style="font-size:13px;font-weight:900;color:${col}">${e.label}</span>
            </div>
            <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:4px">${e.calcName}</div>
            ${e.next?`<p style="font-size:11px;line-height:1.5;color:#475569;margin:0">${e.next}</p>`:''}
          </div>
          <div style="flex-shrink:0;font-size:10px;font-weight:700;color:#94a3b8">#${i+1}</div>
        </div>
      </div>`;
    }).join('');
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>HaemCalc Pro — Patient Encounter Report</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;background:#fff;padding:30px 40px}@media print{.noprint{display:none!important}body{padding:15px 25px}}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1e293b;padding-bottom:10px;margin-bottom:18px">
  <div><span style="font-weight:900;font-size:20px;letter-spacing:-0.5px">HaemCalc<span style="color:#2563eb">Pro</span></span><span style="font-size:10px;margin-left:8px;color:#94a3b8">v${SITE_VERSION} · Patient Encounter Report</span></div>
  <div style="font-size:11px;color:#64748b">${dtStr}</div>
</div>
${ref?`<div style="background:#f1f5f9;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#475569"><strong style="color:#1e293b">Patient reference:</strong> ${ref} &nbsp;·&nbsp; <em style="color:#94a3b8">Session only — not stored</em></div>`:''}
<h2 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;margin-bottom:12px">${entries.length} calculator result${entries.length!==1?'s':''} this session</h2>
${entryCards}
<div style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:8px;font-size:10px;color:#94a3b8">
  <strong>Reviewer / Editor:</strong> ${REVIEWER}<br>
  <strong style="color:#ef4444">DISCLAIMER:</strong> These results are for educational and clinical decision-support purposes only. They do not replace specialist clinical judgement, institutional guidelines, or the original published scoring systems. Always verify results before acting on them. No patient data is stored or transmitted by HaemCalc Pro. Generated ${dtStr}.
</div>
<div class="noprint" style="text-align:center;margin-top:20px"><button onclick="window.print()" style="background:#1e293b;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer">Print / Save as PDF</button></div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
    const w=window.open('','_blank');
    if(w){w.document.write(html);w.document.close();}
  };

  return(
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24 space-y-4">
      {/* Header */}
      <div className={`rounded-2xl border p-5 ${dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark?'bg-slate-800':'bg-slate-100'}`}>
              <ListChecks size={20} className={dark?'text-slate-400':'text-slate-500'}/>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">Results Log</h1>
              <p className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>Session only · clears on page reload · no data stored</p>
            </div>
          </div>
          {log.length>0&&(
            <button onClick={()=>setLog([])} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${dark?'border-red-900/60 text-red-400 hover:bg-red-950/30':'border-red-200 text-red-600 hover:bg-red-50'}`}>
              <Trash2 size={12}/>Clear all
            </button>
          )}
        </div>
        {log.length>0&&(
          <div className={`mt-3 pt-3 border-t text-[11px] ${dark?'border-slate-800 text-slate-500':'border-slate-100 text-slate-400'}`}>
            {log.length} result{log.length!==1?'s':''} logged this session (max 20) · newest first
          </div>
        )}
      </div>

      {/* Patient reference + Export — only when log has entries */}
      {log.length>0&&(
        <div className={`rounded-2xl border p-4 space-y-3 ${dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200'}`}>
          <div>
            <label className={`block text-[11px] font-semibold mb-1.5 ${dark?'text-slate-400':'text-slate-500'}`}>Patient reference <span className={`font-normal ${dark?'text-slate-600':'text-slate-400'}`}>(optional · session only · not stored)</span></label>
            <input
              type="text"
              value={patientRef}
              onChange={e=>setPatientRef(e.target.value)}
              placeholder="e.g. Bed 4 · Ward 12 · or leave blank"
              maxLength={80}
              className={`w-full px-3 py-2 rounded-lg border text-xs ${dark?'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600':'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400'} outline-none focus:border-blue-500`}
            />
          </div>
          <button
            onClick={()=>exportSessionPDF(log,patientRef)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Printer size={15}/>Export Patient Encounter Report (PDF)
          </button>
        </div>
      )}

      {/* Empty state */}
      {log.length===0&&(
        <div className={`rounded-2xl border p-10 text-center ${dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200'}`}>
          <ListChecks size={32} className={`mx-auto mb-3 ${dark?'text-slate-700':'text-slate-300'}`}/>
          <p className={`text-sm font-semibold ${dark?'text-slate-400':'text-slate-500'}`}>No results logged yet</p>
          <p className={`text-xs mt-1 ${dark?'text-slate-600':'text-slate-400'}`}>Run any calculator and your results will appear here automatically.</p>
          <button onClick={()=>navTo&&navTo('browse')} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">Browse Calculators</button>
        </div>
      )}

      {/* Log entries */}
      <div className="space-y-3">
        {log.map((entry,i)=>{
          const col=getColors(entry.risk);
          return(
            <div key={i} className={`rounded-2xl border-2 p-4 ${col.bg} transition-all`}>
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-extrabold text-white flex-shrink-0 ${
                  entry.risk==='low'?'bg-emerald-600':entry.risk==='int'?'bg-amber-500':entry.risk==='high'?'bg-red-600':entry.risk==='vhigh'?'bg-purple-600':'bg-slate-500'
                }`}>
                  <span className="text-xs leading-none text-center px-0.5 break-all">{typeof entry.score==='number'?entry.score:entry.score||'—'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${dark?'text-slate-500':'text-slate-400'}`}>{entry.time}</span>
                    <span className={`text-xs font-extrabold ${col.text}`}>{entry.label}</span>
                  </div>
                  <div className={`text-sm font-semibold truncate mt-0.5 ${dark?'text-slate-200':'text-slate-800'}`}>{entry.calcName}</div>
                  {entry.next&&<p className={`text-xs mt-1 line-clamp-2 ${dark?'text-slate-400':'text-slate-500'}`}>{entry.next}</p>}
                </div>
                <button onClick={()=>openCalc(entry.id)} className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${dark?'border-slate-700 text-slate-300 hover:bg-slate-800':'border-slate-300 text-slate-600 hover:bg-white'}`}>
                  <RotateCcw size={10}/>Re-open
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {log.length>0&&(
        <p className={`text-center text-[10px] ${dark?'text-slate-700':'text-slate-400'}`}>Results are session-only and are not stored or transmitted. They clear when you reload the page.</p>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App(){
  const[page,setPage]=useState('home');
  const[calcId,setCalcId]=useState(null);
  const[pathId,setPathId]=useState(null);
  const[dark,setDark]=useLocalStorage('hc3_dark',false);
  const[favs,setFavs]=useLocalStorage('hc3_favs',[]);
  const[recent,setRecent]=useLocalStorage('hc3_recent',[]);
  const[search,setSearch]=useState(false);
  const[menu,setMenu]=useState(false);
  const[log,setLog]=useState([]);

  const addToLog=useCallback((entry)=>{setLog(l=>[entry,...l].slice(0,20))},[]);

  const openCalc=useCallback((id)=>{
    setCalcId(id);setPage('calc');setSearch(false);setMenu(false);window.scrollTo(0,0);
    setRecent(r=>{const f=r.filter(x=>x!==id);return[id,...f].slice(0,10)});
  },[]);
  const openPathway=(id)=>{setPathId(id);setPage('pathway');setMenu(false);window.scrollTo(0,0)};
  const toggleFav=(id)=>setFavs(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);
  const goHome=()=>{setPage('home');setMenu(false);window.scrollTo(0,0)};
  const navTo=(p)=>{setPage(p);setMenu(false);window.scrollTo(0,0)};

  const[showKeys,setShowKeys]=useState(false);
  const[installPrompt,setInstallPrompt]=useState(null);
  const[showInstall,setShowInstall]=useState(false);

  // PWA install prompt capture
  useEffect(()=>{
    const handler=(e)=>{e.preventDefault();setInstallPrompt(e);setShowInstall(true);};
    window.addEventListener('beforeinstallprompt',handler);
    return()=>window.removeEventListener('beforeinstallprompt',handler);
  },[]);
  const handleInstall=()=>{
    if(!installPrompt)return;
    installPrompt.prompt();
    installPrompt.userChoice.then(()=>{setInstallPrompt(null);setShowInstall(false);});
  };

  // Global keyboard shortcuts
  useEffect(()=>{
    const handler=(e)=>{
      const tag=document.activeElement?.tagName;
      if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA')return;
      if(e.key==='/'&&!search){e.preventDefault();setSearch(true);}
      if(e.key==='Escape'){setSearch(false);setShowKeys(false);setMenu(false);}
      if(e.key==='h'||e.key==='H'){goHome();}
      if(e.key==='b'||e.key==='B'){navTo('browse');}
      if(e.key==='l'||e.key==='L'){navTo('log');}
      if(e.key==='?'){setShowKeys(k=>!k);}
    };
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[search]);

  const themeClass=dark?'dark':'';

  return(
    <div className={`min-h-screen font-sans transition-colors duration-300 ${dark?'bg-slate-950 text-slate-100':'bg-slate-50 text-slate-900'}`}>
      {/* HEADER */}
      <header className={`fixed top-0 inset-x-0 z-50 ${dark?'bg-slate-900/98 border-slate-800':'bg-white/98 border-slate-200'} border-b backdrop-blur-md shadow-sm`}>
        <div className="max-w-[1400px] mx-auto flex items-center h-14 px-4 gap-3">
          <button onClick={()=>setMenu(!menu)} className={`lg:hidden p-2 -ml-1 rounded-lg ${dark?'hover:bg-slate-800':'hover:bg-slate-100'}`}><Menu size={20}/></button>
          <button onClick={goHome} className="flex items-center gap-2.5 mr-auto">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs tracking-tight shadow-sm ${dark?'bg-blue-600':'bg-slate-900'}`}>HC</div>
            <div className="leading-none">
              <span className="font-extrabold text-sm tracking-tight">HaemCalc</span>
              <span className="text-blue-600 font-extrabold text-sm">Pro</span>
              <span className={`text-[10px] ml-1.5 font-medium ${dark?'text-slate-500':'text-slate-400'}`}>v4.3</span>
            </div>
          </button>
          <button onClick={()=>setSearch(true)} title="Search (press /)" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] ${dark?'bg-slate-800 text-slate-400 hover:bg-slate-700':'bg-slate-100 text-slate-500 hover:bg-slate-200'} transition-colors`}>
            <Search size={14}/><span className="hidden sm:inline">Search…</span><kbd className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded ${dark?'bg-slate-700 text-slate-500':'bg-slate-200 text-slate-400'}`}>/</kbd>
          </button>
          <button onClick={()=>setShowKeys(k=>!k)} title="Keyboard shortcuts (?)" className={`hidden sm:flex p-2 rounded-lg text-[10px] font-bold border items-center justify-center w-7 h-7 ${dark?'border-slate-700 text-slate-500 hover:bg-slate-800':'border-slate-200 text-slate-400 hover:bg-slate-100'} transition-colors`}>?</button>
          <button onClick={()=>setDark(!dark)} className={`p-2 rounded-lg ${dark?'hover:bg-slate-800 text-slate-400':'hover:bg-slate-100 text-slate-500'} transition-colors`}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button>
          <span className={`hidden md:flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${dark?'bg-amber-900/30 text-amber-400 border border-amber-800/50':'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            <AlertTriangle size={10}/> Educational Use Only
          </span>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      {menu&&<div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={()=>setMenu(false)}/>}
      <nav className={`fixed top-14 left-0 bottom-0 w-72 z-40 overflow-y-auto transition-transform lg:hidden ${menu?'translate-x-0':'-translate-x-full'} ${dark?'bg-slate-900':'bg-white'} border-r ${dark?'border-slate-800':'border-slate-200'}`}>
        <SideNav {...{openCalc,openPathway,goHome,favs,toggleFav,dark,calcId,setPage,navTo,log}}/>
      </nav>

      {/* DESKTOP LAYOUT */}
      <div className="flex pt-14 max-w-[1400px] mx-auto">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex lg:flex-col w-64 fixed top-14 bottom-0 overflow-y-auto border-r ${dark?'border-slate-800 bg-slate-900':'border-slate-200 bg-white'}`}>
          <SideNav {...{openCalc,openPathway,goHome,favs,toggleFav,dark,calcId,setPage,navTo,log}}/>
        </aside>
        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-56px)]">
          {page==='home'&&<HomePage {...{openCalc,openPathway,favs,toggleFav,recent,dark,setPage,setSearch}}/>}
          {page==='browse'&&<BrowsePage {...{openCalc,favs,toggleFav,dark}}/>}
          {page==='calc'&&calcId&&<CalcView {...{calcId,openCalc,favs,toggleFav,dark,setPage,addToLog}}/>}
          {page==='pathway'&&pathId&&<PathwayView {...{pathId,openCalc,dark}}/>}
          {page==='about'&&<AboutPage dark={dark} navTo={navTo}/>}
          {page==='compliance'&&<CompliancePage dark={dark}/>}
          {page==='log'&&<LogPage {...{log,setLog,openCalc,dark,navTo}}/>}
          {page.startsWith('diag:')&&<DiagnosticView diagId={page.split(':')[1]} dark={dark}/>}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className={`fixed bottom-0 inset-x-0 z-30 lg:hidden border-t ${dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200'} flex`}>
        <button onClick={goHome} className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium ${page==='home'?'text-blue-600':'text-slate-400'}`}>
          <Home size={18}/><span className="mt-0.5">Home</span>
        </button>
        <button onClick={()=>navTo('log')} className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium relative ${page==='log'?'text-blue-600':'text-slate-400'}`}>
          <div className="relative inline-flex">
            <ListChecks size={18}/>
            {log.length>0&&<span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">{log.length>9?'9+':log.length}</span>}
          </div>
          <span className="mt-0.5">Log</span>
        </button>
        <button onClick={()=>navTo('pathways_list')} className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium ${page==='pathways_list'?'text-blue-600':'text-slate-400'}`}>
          <Route size={18}/><span className="mt-0.5">Pathways</span>
        </button>
        <button onClick={()=>navTo('about')} className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium ${page==='about'?'text-blue-600':'text-slate-400'}`}>
          <Shield size={18}/><span className="mt-0.5">Editorial</span>
        </button>
      </div>

      {/* SEARCH OVERLAY */}
      {search&&<SearchOverlay {...{openCalc,close:()=>setSearch(false),dark,recent}}/>}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showKeys&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={()=>setShowKeys(false)}>
          <div className="absolute inset-0 bg-black/50"/>
          <div onClick={e=>e.stopPropagation()} className={`relative rounded-2xl border shadow-2xl p-6 w-full max-w-sm ${dark?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-base tracking-tight">Keyboard Shortcuts</h2>
              <button onClick={()=>setShowKeys(false)} className={`p-1.5 rounded-lg ${dark?'hover:bg-slate-800 text-slate-400':'hover:bg-slate-100 text-slate-500'}`}><X size={16}/></button>
            </div>
            <div className="space-y-2">
              {[['/', 'Open search'],['Esc','Close search / modal'],['H','Go to Home'],['B','Go to Browse'],['L','Go to Results Log'],['?','Toggle this help panel']].map(([key,label])=>(
                <div key={key} className="flex items-center justify-between">
                  <span className={`text-sm ${dark?'text-slate-300':'text-slate-600'}`}>{label}</span>
                  <kbd className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${dark?'bg-slate-800 border-slate-700 text-slate-300':'bg-slate-100 border-slate-200 text-slate-700'}`}>{key}</kbd>
                </div>
              ))}
            </div>
            <p className={`text-[10px] mt-4 ${dark?'text-slate-600':'text-slate-400'}`}>Shortcuts are inactive when an input field is focused.</p>
          </div>
        </div>
      )}

      {/* PWA INSTALL BANNER */}
      {showInstall&&(
        <div className={`fixed bottom-16 lg:bottom-4 inset-x-4 lg:left-auto lg:right-4 lg:w-80 z-40 rounded-2xl border shadow-2xl p-4 flex items-center gap-3 ${dark?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0 ${dark?'bg-blue-600':'bg-slate-900'}`}>HC</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">Add to Home Screen</div>
            <div className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>Install HaemCalc Pro for offline access</div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleInstall} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">Install</button>
            <button onClick={()=>setShowInstall(false)} className={`px-2 py-1.5 rounded-lg text-xs ${dark?'text-slate-400 hover:bg-slate-800':'text-slate-500 hover:bg-slate-100'} transition-colors`}><X size={14}/></button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={`lg:ml-64 pb-20 lg:pb-0 border-t mt-8 ${dark?'border-slate-800 bg-slate-900/50':'border-slate-200 bg-slate-50/80'}`}>
        <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[10px] ${dark?'bg-blue-600':'bg-slate-900'}`}>HC</div>
              <span className={`font-extrabold text-sm tracking-tight ${dark?'text-slate-200':'text-slate-800'}`}>HaemCalc <span className="text-blue-600">Pro</span></span>
            </div>
            <p className={`text-[11px] leading-relaxed ${dark?'text-slate-500':'text-slate-400'}`}>Evidence-based haematology calculators, clinical pathways, and diagnostic modules for specialist practice and education.</p>
            <div className={`flex flex-wrap gap-2 mt-2`}>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${dark?'bg-slate-800 text-slate-500 border-slate-700':'bg-slate-100 text-slate-500 border-slate-200'}`}>v{SITE_VERSION}</span>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${dark?'bg-emerald-900/30 text-emerald-500 border-emerald-800/50':'bg-emerald-50 text-emerald-700 border-emerald-200'}`}><BadgeCheck size={8}/>Content reviewed {CONTENT_DATE}</span>
            </div>
          </div>
          {/* Links */}
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${dark?'text-slate-500':'text-slate-400'}`}>Platform</div>
            <div className="space-y-2">
              {[['Home',goHome],['Browse All',()=>navTo('browse')],['Clinical Pathways',()=>navTo('pathways_list')],['Diagnostic Modules',()=>navTo('diag:'+DIAGNOSTICS[0]?.id)],['About & Editorial',()=>navTo('about')],['Compliance & Privacy',()=>navTo('compliance')]].map(([label,fn])=>(
                <div key={label}><button onClick={fn} className={`text-[12px] ${dark?'text-slate-400 hover:text-slate-200':'text-slate-500 hover:text-slate-700'} transition-colors`}>{label}</button></div>
              ))}
            </div>
          </div>
          {/* Disclaimer */}
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${dark?'text-slate-500':'text-slate-400'}`}>Disclaimer</div>
            <p className={`text-[11px] leading-relaxed ${dark?'text-slate-500':'text-slate-400'}`}><strong className={dark?'text-slate-400':'text-slate-500'}>Educational &amp; Research Use Only.</strong> Does not replace clinical judgement, institutional guidelines, or specialist opinion. Always verify results against current local and national guidance.</p>
            <p className={`text-[10px] mt-3 ${dark?'text-slate-600':'text-slate-400'}`}>Built by Dr. Muhammad Mohsin · Consultant Haematologist · FRCPath (Haem)</p>
          </div>
        </div>
        <div className={`border-t px-6 py-3 text-center text-[10px] ${dark?'border-slate-800 text-slate-700':'border-slate-200 text-slate-400'}`}>
          © 2025 HaemCalc Pro v{SITE_VERSION} · Educational and clinical decision-support use only · No liability accepted for clinical outcomes · Content reviewed {CONTENT_DATE}
        </div>
      </footer>

      {/* PATHWAY LIST (mobile) */}
      {page==='pathways_list'&&(
        <div className="fixed inset-0 z-50 pt-14 pb-16 overflow-y-auto" style={{background:dark?'#020617':'#f8fafc'}}>
          <div className="max-w-lg mx-auto p-4 space-y-4">
            <div className="flex items-center gap-2"><Route size={16} className="text-blue-500"/><h2 className="text-lg font-bold">Clinical Pathways</h2></div>
            {PATHWAYS.map(p=>(
              <button key={p.id} onClick={()=>openPathway(p.id)} className={`w-full text-left p-4 rounded-xl border ${dark?'bg-slate-900 border-slate-800 hover:border-slate-700':'bg-white border-slate-200 hover:border-blue-300'} transition-colors flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${dark?'bg-blue-900/40':'bg-blue-50'}`}><Route size={18} className="text-blue-500"/></div>
                <div><div className="font-bold text-sm">{p.title}</div><div className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{p.desc}</div></div>
              </button>
            ))}
            <div className="flex items-center gap-2 pt-2"><GitBranch size={16} className="text-purple-500"/><h2 className="text-lg font-bold">Diagnostic Modules</h2></div>
            {DIAGNOSTICS.map(d=>(
              <button key={d.id} onClick={()=>setPage('diag:'+d.id)} className={`w-full text-left p-4 rounded-xl border ${dark?'bg-slate-900 border-slate-800 hover:border-slate-700':'bg-white border-slate-200 hover:border-purple-300'} transition-colors flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${dark?'bg-purple-900/40':'bg-purple-50'}`}><GitBranch size={18} className="text-purple-500"/></div>
                <div><div className="font-bold text-sm">{d.title}</div><div className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{d.sections.length} decision sections</div></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR NAV ─────────────────────────────────────────────────────────────
function SideNav({openCalc,openPathway,goHome,favs,toggleFav,dark,calcId,setPage,navTo,log}){
  // All collapsed by default — user expands what they need
  const[expanded,setExpanded]=useState({malignant:false,benign:false,general:false});
  const[subExp,setSubExp]=useState({});
  const[pathOpen,setPathOpen]=useState(false);
  const[diagOpen,setDiagOpen]=useState(false);
  const toggleCat=(id)=>setExpanded(e=>({...e,[id]:!e[id]}));
  const toggleSub=(id)=>setSubExp(e=>({...e,[id]:!e[id]}));

  // Auto-expand the category + subcategory containing the active calc
  useEffect(()=>{
    if(!calcId)return;
    for(const cat of CATS){
      const subs=SUBS[cat.id]||[];
      for(const sub of subs){
        if(sub.calcs.includes(calcId)){
          setExpanded(e=>({...e,[cat.id]:true}));
          setSubExp(e=>({...e,[sub.id]:true}));
          return;
        }
      }
    }
  },[calcId]);

  const divider=`border-t ${dark?'border-slate-800':'border-slate-100'}`;
  const sectionLabel=`px-3 text-[10px] font-semibold uppercase tracking-widest mb-1`;
  const rowBase=`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] transition-colors text-left`;
  const rowIdle=dark?'text-slate-400 hover:bg-slate-800 hover:text-slate-200':'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  const rowActive=dark?'bg-blue-900/30 text-blue-300':'bg-blue-50 text-blue-700 font-semibold';

  return(
    <div className="py-3 px-2 space-y-0.5 text-[12px]">

      {/* Home */}
      <button onClick={goHome} className={`${rowBase} font-medium ${dark?'text-slate-300 hover:bg-slate-800':'text-slate-700 hover:bg-slate-100'}`}>
        <Home size={14} className="flex-shrink-0"/><span>Home</span>
      </button>

      {/* Results Log */}
      <button onClick={()=>navTo&&navTo('log')} className={`${rowBase} font-medium mb-2 relative ${dark?'text-slate-300 hover:bg-slate-800':'text-slate-700 hover:bg-slate-100'}`}>
        <ListChecks size={14} className="flex-shrink-0"/>
        <span className="flex-1">Results Log</span>
        {log&&log.length>0&&<span className="ml-auto bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">{log.length>9?'9+':log.length}</span>}
      </button>

      {/* Favourites — only shown when there are some */}
      {favs.length>0&&(
        <div className={`pt-3 pb-1 ${divider}`}>
          <div className={`${sectionLabel} ${dark?'text-amber-500':'text-amber-600'}`}>Favourites</div>
          {favs.map(id=>{const c=C[id];return c?<NavItem key={id} c={c} active={calcId===id} onClick={()=>openCalc(id)} dark={dark}/>:null})}
        </div>
      )}

      {/* Clinical Pathways — collapsible */}
      <div className={`pt-3 ${divider}`}>
        <button onClick={()=>setPathOpen(o=>!o)} className={`w-full flex items-center justify-between px-3 py-1 mb-1 ${sectionLabel} ${dark?'text-blue-400 hover:text-blue-300':'text-blue-600 hover:text-blue-800'} transition-colors`}>
          <span>Clinical Pathways</span>
          <ChevronDown size={11} className={`transition-transform duration-200 ${pathOpen?'':'rotate-[-90deg]'}`}/>
        </button>
        {pathOpen&&PATHWAYS.map(p=>(
          <button key={p.id} onClick={()=>openPathway(p.id)} className={`${rowBase} ${rowIdle}`}>
            <Route size={12} className="flex-shrink-0 opacity-50"/><span className="truncate">{p.title}</span>
          </button>
        ))}
      </div>

      {/* Diagnostic Modules — collapsible */}
      <div className={`pt-3 ${divider}`}>
        <button onClick={()=>setDiagOpen(o=>!o)} className={`w-full flex items-center justify-between px-3 py-1 mb-1 ${sectionLabel} ${dark?'text-purple-400 hover:text-purple-300':'text-purple-600 hover:text-purple-800'} transition-colors`}>
          <span>Diagnostic Modules</span>
          <ChevronDown size={11} className={`transition-transform duration-200 ${diagOpen?'':'rotate-[-90deg]'}`}/>
        </button>
        {diagOpen&&DIAGNOSTICS.map(d=>(
          <button key={d.id} onClick={()=>setPage('diag:'+d.id)} className={`${rowBase} ${rowIdle}`}>
            <GitBranch size={12} className="flex-shrink-0 opacity-50"/><span className="truncate">{d.title}</span>
          </button>
        ))}
      </div>

      {/* Calculator Categories — all collapsed by default */}
      {CATS.map(cat=>{
        const subs=SUBS[cat.id]||[];
        const isOpen=!!expanded[cat.id];
        // Check if any calc in this category is active
        const catActive=subs.some(s=>s.calcs.includes(calcId));
        return(
          <div key={cat.id} className={`pt-3 ${divider}`}>
            {/* Category header */}
            <button onClick={()=>toggleCat(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-1 mb-1 rounded-lg transition-colors ${dark?'hover:bg-slate-800':'hover:bg-slate-100'}`}>
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${catActive?'':'opacity-80'}`} style={{color:cat.color}}>{cat.label}</span>
              <ChevronDown size={11} className={`transition-transform duration-200 flex-shrink-0 ${isOpen?'':'rotate-[-90deg]'}`} style={{color:cat.color,opacity:0.6}}/>
            </button>

            {/* Subcategories */}
            {isOpen&&subs.map(sub=>{
              const subOpen=!!subExp[sub.id];
              const hasActive=sub.calcs.includes(calcId);
              return(
                <div key={sub.id} className="mb-0.5">
                  <button onClick={()=>toggleSub(sub.id)}
                    className={`${rowBase} font-medium ${hasActive?(dark?'text-blue-300':'text-blue-700'):(dark?'text-slate-300 hover:bg-slate-800':'text-slate-600 hover:bg-slate-100')}`}>
                    <ChevronRight size={11} className={`flex-shrink-0 transition-transform duration-150 ${subOpen?'rotate-90':''} opacity-50`}/>
                    <span className="truncate flex-1">{sub.label}</span>
                  </button>

                  {/* Calculator list */}
                  {subOpen&&(
                    <div className={`ml-3 pl-2.5 border-l space-y-0.5 mb-1`} style={{borderColor:hasActive?(dark?'#3b82f6':'#bfdbfe'):(dark?'#1e293b':'#e2e8f0')}}>
                      {sub.calcs.map(id=>{
                        const c=C[id];
                        if(!c)return null;
                        return <NavItem key={id} c={c} active={calcId===id} onClick={()=>openCalc(id)} dark={dark}/>;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* About + Compliance */}
      <div className={`pt-3 ${divider}`}>
        <button onClick={()=>setPage('about')} className={`${rowBase} ${dark?'text-slate-500 hover:bg-slate-800 hover:text-slate-300':'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
          <User size={13} className="flex-shrink-0"/><span>About</span>
        </button>
        <button onClick={()=>setPage('compliance')} className={`${rowBase} ${dark?'text-slate-500 hover:bg-slate-800 hover:text-slate-300':'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
          <ShieldCheck size={13} className="flex-shrink-0"/><span>Compliance & Privacy</span>
        </button>
      </div>
    </div>
  );
}
function NavItem({c,active,onClick,dark}){
  return(
    <button onClick={onClick} className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-[11.5px] text-left transition-colors ${active?(dark?'bg-blue-900/30 text-blue-300 font-semibold':'bg-blue-50 text-blue-700 font-semibold'):(dark?'text-slate-400 hover:bg-slate-800 hover:text-slate-200':'text-slate-500 hover:bg-slate-100 hover:text-slate-800')}`}>
      <div className="min-w-0 flex-1 leading-snug">
        <span className="block font-medium truncate">{c.name}</span>
        <span className={`text-[10px] truncate ${dark?'text-slate-600':'text-slate-400'}`}>{c.disease}</span>
      </div>
    </button>
  );
}

// ─── CATEGORY COLOUR MAP ─────────────────────────────────────────────────────
const CAT_STYLE={
  malignant:{dot:'bg-rose-500',badge:' bg-rose-50 text-rose-700 border-rose-200',badgeDark:'bg-rose-900/40 text-rose-300 border-rose-800/50',label:'Malignant'},
  benign:   {dot:'bg-cyan-500', badge:'bg-cyan-50 text-cyan-700 border-cyan-200', badgeDark:'bg-cyan-900/40 text-cyan-300 border-cyan-800/50',label:'Benign'},
  general:  {dot:'bg-violet-500',badge:'bg-violet-50 text-violet-700 border-violet-200',badgeDark:'bg-violet-900/40 text-violet-300 border-violet-800/50',label:'General'},
};

// ─── EVIDENCE TYPE CLASSIFICATION ────────────────────────────────────────────
const EVTYPE={
  validated:  {label:'Validated Clinical Score',    badge:'bg-emerald-50 text-emerald-700 border-emerald-200',  badgeDark:'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'},
  guideline:  {label:'Guideline-Based Algorithm',   badge:'bg-blue-50 text-blue-700 border-blue-200',           badgeDark:'bg-blue-900/30 text-blue-400 border-blue-800/50'},
  derived:    {label:'Derived Clinical Tool',        badge:'bg-amber-50 text-amber-700 border-amber-200',        badgeDark:'bg-amber-900/30 text-amber-400 border-amber-800/50'},
  educational:{label:'Educational Reference Tool',  badge:'bg-slate-100 text-slate-600 border-slate-300',       badgeDark:'bg-slate-800 text-slate-400 border-slate-700'},
};

// ─── GOVERNANCE & EVIDENCE METADATA ──────────────────────────────────────────
// Supplements per-calculator evidence objects. Defaults applied for unlisted calcs.
const REVIEWER='Dr. Muhammad Mohsin, Consultant Haematologist · FRCPath (Haematology) · FRCP (London)';
const SITE_VERSION='4.2';
const CONTENT_DATE='April 2026';

const SITE_GOVERNANCE=`HaemCalc Pro applies a structured editorial process to all clinical content. Tools are included only where a PubMed-indexed derivation or validation study exists, or where an international guideline body has formally endorsed a scoring algorithm. Each calculator is classified by evidence tier (Validated / Guideline-Based / Derived / Educational), aligned to current ELN, BSH, NICE, ISTH, ASH, and WHO guidance, and assigned a named reviewer with a scheduled next-review date. Content is updated promptly following major guideline revisions and as a minimum annually. No commercial sponsorship, pharmaceutical funding, or advertising revenue is accepted; all editorial decisions are made solely on the basis of published evidence. The platform carries a clear educational-use disclaimer and does not replace specialist clinical judgement or local institutional protocols. Community peer review from NHS haematology consultants is actively invited to strengthen multi-site governance.`;

const GOV={
  // ── Malignant Haematology ──────────────────────────────────────────────────
  hscore:   {type:'validated',  population:'Adults (≥18 y) with suspected reactive/secondary HLH'},
  ipi:      {type:'validated',  population:'Adults with newly diagnosed aggressive NHL (predominantly DLBCL)'},
  ripi:     {type:'validated',  population:'Adults with DLBCL treated with R-CHOP in the Rituximab era'},
  cnsipi:   {type:'derived',    population:'Adults with DLBCL (CNS relapse risk stratification)'},
  nccnipi:  {type:'validated',  population:'Adults with DLBCL treated with R-CHOP (Rituximab era)'},
  flipi:    {type:'validated',  population:'Adults with newly diagnosed follicular lymphoma (pre-Rituximab derivation)'},
  flipi2:   {type:'validated',  population:'Adults with follicular lymphoma receiving Rituximab-based therapy'},
  primapi:  {type:'derived',    population:'Adults with newly diagnosed follicular lymphoma receiving immunochemotherapy'},
  ips:      {type:'validated',  population:'Adults with newly diagnosed classical Hodgkin lymphoma'},
  ghsg:     {type:'guideline',  population:'Adults with early-stage classical Hodgkin lymphoma (GHSG risk stratification)'},
  iss:      {type:'validated',  population:'Adults with newly diagnosed multiple myeloma (pre-novel agents)'},
  r2iss:    {type:'validated',  population:'Adults with newly diagnosed multiple myeloma (cytogenetics-integrated)'},
  mgus:     {type:'guideline',  population:'Adults with confirmed MGUS (Mayo stratification model)'},
  smm:      {type:'guideline',  population:'Adults with smouldering multiple myeloma (20/2/20 Mayo 2018 model)'},
  amyloid:  {type:'guideline',  population:'Adults with systemic AL amyloidosis (Mayo 2012 staging)'},
  ipss:     {type:'validated',  population:'Adults with primary MDS (excludes therapy-related MDS and CMML). NICE TA218 azacitidine eligibility criterion (Int-2/High).'},
  ipssr:    {type:'validated',  population:'Adults with primary MDS (excludes post-MPN/post-therapy MDS)'},
  ipssm:    {type:'validated',  population:'Adults with primary MDS with NGS molecular profiling (Bernard et al. 2022 — approximate implementation; verify at mds-risk-model.com)'},
  chrs:     {type:'validated',  population:'Adults with CHIP or CCUS on NGS (Weeks et al. NEJM Evidence 2023; verify at chrsapp.com)'},
  chipDiag: {type:'guideline',  population:'Adults with incidental somatic mutations or unexplained cytopenias (WHO 2022 / ICC 2022 criteria)'},
  elnAml:   {type:'guideline',  population:'Adults with newly diagnosed AML (ELN 2022 risk classification)'},
  sokal:    {type:'validated',  population:'Adults with CML treated with conventional chemotherapy (pre-imatinib era)'},
  hasford:  {type:'validated',  population:'Adults with CML treated with interferon-alpha therapy'},
  eutos:    {type:'validated',  population:'Adults with newly diagnosed CML'},
  elts:     {type:'validated',  population:'Adults with CML on first-line imatinib therapy'},
  elnCml:   {type:'guideline',  population:'Adults with CML on TKI therapy (ELN milestone assessment)'},
  dipss:    {type:'validated',  population:'Adults with primary or secondary myelofibrosis'},
  dipssplus:{type:'validated',  population:'Adults with myelofibrosis (DIPSS+ karyotype-integrated refinement)'},
  gipss:    {type:'validated',  population:'Adults with primary myelofibrosis (genetically integrated)'},
  mipss70:  {type:'validated',  population:'Adults aged ≤70 y with primary myelofibrosis being considered for SCT'},
  pvdipss:  {type:'validated',  population:'Adults with post-PV or post-ET myelofibrosis'},
  ipset:    {type:'validated',  population:'Adults with essential thrombocythaemia (thrombosis risk)'},
  rai:      {type:'validated',  population:'Adults with newly diagnosed CLL (North American centres)'},
  binet:    {type:'validated',  population:'Adults with newly diagnosed CLL (European centres)'},
  iwcll:    {type:'guideline',  population:'Adults with CLL — iwCLL 2018 treatment indication criteria'},
  cllipi:   {type:'validated',  population:'Adults with newly diagnosed CLL (international consortium validation)'},
  mipi:     {type:'validated',  population:'Adults with newly diagnosed mantle cell lymphoma'},
  mipib:    {type:'validated',  population:'Adults with mantle cell lymphoma (Ki-67-integrated MIPI-b)'},
  isswm:    {type:'validated',  population:'Adults with newly diagnosed Waldenström macroglobulinaemia'},
  pit:      {type:'validated',  population:'Adults with newly diagnosed peripheral T-cell lymphoma NOS'},
  ielsg:    {type:'validated',  population:'Adults with primary central nervous system DLBCL'},
  ielsg24:  {type:'validated',  population:'Adults with primary CNS DLBCL (post-consolidation response assessment)'},
  maltipi:  {type:'validated',  population:'Adults with MALT lymphoma at extranodal sites'},
  mzlipi:   {type:'validated',  population:'Adults with nodal marginal zone lymphoma'},
  burkitt:  {type:'guideline',  population:'Adults with Burkitt lymphoma (treatment decision criteria)'},
  pinke:    {type:'validated',  population:'Adults with extranodal NK/T-cell lymphoma (PINK-E score)'},
  dbl:      {type:'educational', population:'Adults with CLL or indolent lymphoma (lymphocyte doubling time)'},
  dri:      {type:'validated',  population:'Adults undergoing allogeneic haematopoietic stem cell transplantation'},
  ebmt:     {type:'validated',  population:'Adults undergoing allogeneic SCT (EBMT risk score)'},
  hctci:    {type:'validated',  population:'Adults being assessed for haematopoietic SCT (HCT-CI comorbidity index)'},
  crs:      {type:'guideline',  population:'Adults receiving CAR-T cell therapy (ASTCT 2019 consensus grading)'},
  // ── Benign Haematology ────────────────────────────────────────────────────
  plasmic:  {type:'validated',  population:'Adults with suspected TTP or acute TMA at presentation'},
  fourts:   {type:'validated',  population:'Adults with clinically suspected heparin-induced thrombocytopenia'},
  dic:      {type:'guideline',  population:'Adults with coagulopathy in acute/critical illness (ISTH overt DIC criteria)'},
  tls:      {type:'guideline',  population:'Adults receiving cytotoxic therapy at risk of tumour lysis (Cairo-Bishop criteria)'},
  itpbat:   {type:'guideline',  population:'Adults with suspected immune thrombocytopenia (primary ITP)'},
  ferritin: {type:'educational', population:'Adults (clinical ferritin interpretation framework)'},
  anc:      {type:'derived',    population:'Adults (absolute neutrophil count — formula-based)'},
  rpi:      {type:'derived',    population:'Adults with anaemia (reticulocyte production index)'},
  tsat:     {type:'derived',    population:'Adults undergoing iron deficiency assessment'},
  aasev:    {type:'guideline',  population:'Adults presenting with suspected acute aortic syndrome'},
  // ── VTE & Coagulation ─────────────────────────────────────────────────────
  wells_pe: {type:'validated',  population:'Adults with clinically suspected pulmonary embolism'},
  wellsdvt: {type:'validated',  population:'Adults with clinically suspected proximal DVT'},
  hasbled:  {type:'validated',  population:'Adults with atrial fibrillation on or being considered for anticoagulation'},
  chads:    {type:'validated',  population:'Adults with non-valvular atrial fibrillation (CHA₂DS₂-VASc)'},
  padua:    {type:'validated',  population:'Medical inpatients being assessed for pharmacological VTE prophylaxis'},
  caprini:  {type:'validated',  population:'Surgical inpatients being assessed for VTE prophylaxis'},
  geneva:   {type:'validated',  population:'Adults with suspected pulmonary embolism (revised Geneva score)'},
  khorana:  {type:'validated',  population:'Adults with solid or haematological malignancy receiving systemic chemotherapy'},
  improve:  {type:'validated',  population:'Medical inpatients for VTE risk stratification (IMPROVE VTE score)'},
  // ── Supportive & General ──────────────────────────────────────────────────
  mascc:    {type:'validated',  population:'Adults with febrile neutropenia following cytotoxic therapy'},
  karnofsky:{type:'validated',  population:'Adults with cancer (Karnofsky functional performance assessment)'},
  ecog:     {type:'validated',  population:'Adults with cancer (WHO/ECOG performance status scale)'},
  g8:       {type:'validated',  population:'Adults aged ≥70 y with cancer (G8 geriatric screening tool)'},
  cfs:      {type:'validated',  population:'Adults with suspected frailty (Rockwood Clinical Frailty Scale 2005)'},
  sofa:     {type:'validated',  population:'Adults in intensive care or high-dependency settings (Sepsis-3 criteria)'},
  news2:    {type:'guideline',  population:'Adult inpatients (NHS England mandatory National Early Warning Score 2)'},
  qsofa2:   {type:'validated',  population:'Adults with suspected infection outside intensive care'},
  apache:   {type:'validated',  population:'Adults admitted to intensive care units (APACHE II)'},
  charlson: {type:'validated',  population:'General inpatient population (Charlson Comorbidity Index)'},
  childpugh:{type:'validated',  population:'Adults with cirrhosis (hepatic reserve assessment)'},
  meld:     {type:'validated',  population:'Adults with chronic liver disease (transplant prioritisation)'},
  egfr:     {type:'validated',  population:'Adults aged ≥18 y (CKD-EPI 2021 creatinine-based eGFR)'},
  akikdigo: {type:'guideline',  population:'Adults with suspected or confirmed AKI (KDIGO 2012 staging)'},
  grace:    {type:'validated',  population:'Adults presenting with ACS or NSTEMI'},
  timi:     {type:'validated',  population:'Adults presenting with NSTEMI or unstable angina'},
  heart:    {type:'validated',  population:'Adults presenting to the emergency department with chest pain'},
  rcri:     {type:'validated',  population:'Adults undergoing non-cardiac surgery (Revised Cardiac Risk Index)'},
  maggic:   {type:'validated',  population:'Adults with stable heart failure (MAGGIC meta-analysis model)'},
  qrisk3:   {type:'validated',  population:'Adults aged 25–84 y without established CVD (QRISK3)'},
  // ── Dosing & Formulae ─────────────────────────────────────────────────────
  bsa:      {type:'derived',    population:'Adults and children receiving BSA-based therapy (Mosteller formula)'},
  crcl:     {type:'derived',    population:'Adults aged ≥18 y receiving renally dosed medications (Cockcroft-Gault)'},
  calvert:  {type:'derived',    population:'Adults receiving carboplatin chemotherapy (Calvert formula)'},
  chemodose:{type:'derived',    population:'Adults receiving body-surface-area-based chemotherapy regimens'},
  cisplatin:{type:'derived',    population:'Adults receiving cisplatin-based chemotherapy (nephrotoxicity guidance)'},
  steroid:  {type:'educational', population:'Adults requiring corticosteroid dose conversion (educational reference)'},
  corr_ca:  {type:'derived',    population:'Adults with albumin-corrected calcium interpretation'},
  corrna:   {type:'derived',    population:'Adults with hyperglycaemia and apparent hyponatraemia'},
  aniongap: {type:'derived',    population:'Adults with metabolic acidosis (Henderson-Hasselbalch framework)'},
  abg:      {type:'derived',    population:'Adults (systematic arterial blood gas interpretation framework)'},
  osmo:     {type:'derived',    population:'Adults (calculated serum osmolality — 2Na + glucose + urea formula)'},
  winters:  {type:'derived',    population:'Adults with metabolic acidosis (Winter\'s formula for expected respiratory compensation)'},
  ldlc:     {type:'derived',    population:'Adults (Friedewald LDL-cholesterol estimation — not valid with TG>4.5 mmol/L)'},
  mysecpm:  {type:'derived',    population:'Adults — see source documentation for population details'},
  _default: {type:'derived',    population:'General adult population'},
};
const gov=(id)=>({reviewer:REVIEWER,coReviewers:[],lastReviewed:CONTENT_DATE,nextReview:'April 2027',...GOV._default,...(GOV[id]||{})});

// ─── SEARCH OVERLAY ──────────────────────────────────────────────────────────
function SearchOverlay({openCalc,close,dark,recent}){
  const[q,setQ]=useState('');
  const[catFilter,setCatFilter]=useState('all');
  const ref=useRef();
  useEffect(()=>{ref.current?.focus()},[]);
  useEffect(()=>{
    const handler=(e)=>{if(e.key==='Escape')close()};
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[close]);

  const allCalcs=useMemo(()=>Object.values(C),[]);

  // Most-used = recent session calcs first, then fill with first-listed calcs
  const mostUsed=useMemo(()=>{
    const recentCalcs=(recent||[]).map(id=>C[id]).filter(Boolean);
    const recentIds=new Set((recent||[]).map(id=>id));
    const fallback=allCalcs.filter(c=>!recentIds.has(c.id)).slice(0,8-recentCalcs.length);
    return[...recentCalcs,...fallback].slice(0,8);
  },[recent,allCalcs]);

  const results=useMemo(()=>{
    const base=catFilter==='all'?allCalcs:allCalcs.filter(c=>c.cat===catFilter);
    if(!q.trim()){
      return catFilter==='all'?[]:base;
    }
    const t=q.toLowerCase();
    return base.filter(c=>
      c.name.toLowerCase().includes(t)||
      c.disease.toLowerCase().includes(t)||
      c.tags.some(tg=>tg.includes(t))||
      c.purpose.toLowerCase().includes(t)||
      (c.evidence?.source||'').toLowerCase().includes(t)||
      (c.evidence?.guideline||'').toLowerCase().includes(t)||
      (c.evidence?.pmid||'').toString().includes(t)
    );
  },[q,catFilter,allCalcs]);

  const showMostUsed=!q.trim()&&catFilter==='all';
  const displayList=showMostUsed?mostUsed:results;

  const cs=CAT_STYLE;

  const ResultRow=({c,badge})=>{
    const style=cs[c.cat];
    return(
      <button key={c.id} onClick={()=>{openCalc(c.id);close()}}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b
          ${dark?'hover:bg-slate-800 border-slate-800/50':'hover:bg-slate-50 border-slate-100'}`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${dark?'bg-slate-800':'bg-slate-100'}`}>
          <CIcon id={c.cat} size={16} className={dark?'text-slate-400':'text-slate-500'}/>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-sm ${dark?'text-white':'text-slate-900'}`}>{c.name}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${dark?style?.badgeDark:style?.badge}`}>{c.disease}</span>
            {badge&&<span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${dark?'bg-amber-900/30 text-amber-400 border border-amber-800/40':'bg-amber-50 text-amber-600 border border-amber-200'}`}>{badge}</span>}
          </div>
          <div className={`text-[11px] mt-0.5 line-clamp-1 ${dark?'text-slate-400':'text-slate-500'}`}>{c.purpose}</div>
        </div>
        <ChevronRight size={13} className={`flex-shrink-0 ${dark?'text-slate-600':'text-slate-300'}`}/>
      </button>
    );
  };

  return(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" onClick={close}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className={`relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl ${dark?'bg-slate-900 border border-slate-800':'bg-white border border-slate-200'}`} onClick={e=>e.stopPropagation()}>

        {/* Search input */}
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${dark?'border-slate-800':'border-slate-100'}`}>
          <Search size={17} className="text-slate-400 flex-shrink-0"/>
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Search by name, disease, guideline, PMID, tags…"
            className={`flex-1 bg-transparent outline-none text-sm ${dark?'text-white placeholder:text-slate-500':'text-slate-900 placeholder:text-slate-400'}`}/>
          {q&&<button onClick={()=>setQ('')} className="text-slate-400 hover:text-slate-600"><X size={15}/></button>}
          <kbd onClick={close} className={`cursor-pointer text-[10px] px-1.5 py-0.5 rounded ${dark?'bg-slate-800 text-slate-400 border border-slate-700':'bg-slate-100 text-slate-400 border border-slate-200'}`}>ESC</kbd>
        </div>

        {/* Category filter chips */}
        <div className={`flex gap-2 px-4 py-2 border-b ${dark?'border-slate-800':'border-slate-100'} overflow-x-auto`}>
          {[['all','All',null],...CATS.map(c=>[c.id,cs[c.id]?.label||c.label,c.id])].map(([id,label,catId])=>(
            <button key={id} onClick={()=>setCatFilter(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors
                ${catFilter===id
                  ?(dark?'bg-blue-600 text-white border-blue-600':'bg-blue-600 text-white border-blue-600')
                  :(dark?'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600':'bg-white text-slate-500 border-slate-200 hover:border-slate-300')}`}>
              {catId&&<span className={`w-1.5 h-1.5 rounded-full ${cs[catId]?.dot}`}/>}{label}
            </button>
          ))}
        </div>

        {/* Results list */}
        <div className="max-h-[400px] overflow-y-auto">
          {showMostUsed&&(
            <>
              <div className={`px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest ${dark?'text-slate-600':'text-slate-400'}`}>
                {(recent||[]).length>0?'Most recently used':'Popular calculators'}
              </div>
              {mostUsed.map(c=><ResultRow key={c.id} c={c} badge={(recent||[]).includes(c.id)?'recent':null}/>)}
            </>
          )}
          {!showMostUsed&&catFilter!=='all'&&!q.trim()&&(
            <>
              <div className={`px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest ${dark?'text-slate-600':'text-slate-400'}`}>
                All {cs[catFilter]?.label||catFilter} tools
              </div>
              {results.map(c=><ResultRow key={c.id} c={c}/>)}
            </>
          )}
          {q.trim()&&results.length===0&&(
            <div className="p-8 text-center text-sm text-slate-400">No calculators match your search.</div>
          )}
          {q.trim()&&results.length>0&&(
            <>
              <div className={`px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest ${dark?'text-slate-600':'text-slate-400'}`}>
                {results.length} result{results.length!==1?'s':''} found
              </div>
              {results.map(c=><ResultRow key={c.id} c={c}/>)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RICH CALC CARD (used in BrowsePage) ─────────────────────────────────────
function RichCalcCard({c,onClick,dark,fav,onToggleFav}){
  const cs=CAT_STYLE[c.cat]||{dot:'bg-slate-400',badge:'bg-slate-50 text-slate-700 border-slate-200',badgeDark:'bg-slate-800 text-slate-400 border-slate-700',label:'Other'};
  return(
    <div className={`relative group rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${dark?'bg-slate-900 border-slate-800 hover:border-slate-700':'bg-white border-slate-200 hover:border-blue-300'}`} onClick={onClick}>
      <button onClick={e=>{e.stopPropagation();onToggleFav()}} className={`absolute top-2.5 right-2.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${fav?'opacity-100 text-amber-500':'text-slate-300'}`}><Star size={13} fill={fav?'currentColor':'none'}/></button>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${dark?'bg-slate-800':'bg-slate-100'}`}>
          <CIcon id={c.cat} size={17} className={dark?'text-slate-400':'text-slate-500'}/>
        </div>
        <div className="flex-1 min-w-0 pr-5">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-bold text-sm">{c.name}</span>
            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${dark?cs.badgeDark:cs.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`}/>{c.disease}
            </span>
          </div>
          <p className={`text-[11px] leading-snug line-clamp-2 ${dark?'text-slate-400':'text-slate-500'}`}>{c.purpose}</p>
        </div>
      </div>
    </div>
  );
}

// ─── BROWSE PAGE ─────────────────────────────────────────────────────────────
function BrowsePage({openCalc,favs,toggleFav,dark}){
  const[catFilter,setCatFilter]=useState('all');
  const[subFilter,setSubFilter]=useState('all');
  const[q,setQ]=useState('');
  const hc=dark?'text-slate-400':'text-slate-500';
  const bc=dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200';

  const activeSubs=catFilter==='all'?[]:SUBS[catFilter]||[];

  const filtered=useMemo(()=>{
    let calcs=Object.values(C);
    if(catFilter!=='all')calcs=calcs.filter(c=>c.cat===catFilter);
    if(subFilter!=='all'){
      const sub=activeSubs.find(s=>s.id===subFilter);
      if(sub)calcs=calcs.filter(c=>sub.calcs.includes(c.id));
    }
    if(q.trim()){
      const t=q.toLowerCase();
      calcs=calcs.filter(c=>c.name.toLowerCase().includes(t)||c.disease.toLowerCase().includes(t)||c.tags.some(tg=>tg.includes(t)));
    }
    return calcs;
  },[catFilter,subFilter,q]);

  const cs=CAT_STYLE;

  return(
    <div className="max-w-3xl mx-auto p-4 sm:p-8 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">Browse Calculators</h1>
        <p className={`text-sm ${hc}`}>{Object.keys(C).length} evidence-based tools across malignant haematology, coagulation, VTE, transfusion, and general medicine.</p>
      </div>

      {/* Search bar */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-4 ${dark?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
        <Search size={15} className="text-slate-400 flex-shrink-0"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Filter by name, disease, or tag…"
          className={`flex-1 bg-transparent outline-none text-sm ${dark?'text-white placeholder:text-slate-500':'text-slate-900 placeholder:text-slate-400'}`}/>
        {q&&<button onClick={()=>setQ('')}><X size={14} className="text-slate-400"/></button>}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-3">
        {[['all','All calculators',null],...CATS.map(c=>[c.id,cs[c.id]?.label||c.label,c.id])].map(([id,label,catId])=>(
          <button key={id} onClick={()=>{setCatFilter(id);setSubFilter('all')}}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
              ${catFilter===id
                ?(dark?'bg-blue-600 text-white border-blue-600':'bg-blue-600 text-white border-blue-600')
                :(dark?'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500':'bg-white text-slate-500 border-slate-200 hover:border-slate-400')}`}>
            {catId&&<span className={`w-2 h-2 rounded-full ${cs[catId]?.dot}`}/>}{label}
          </button>
        ))}
      </div>

      {/* Sub-category chips (only when a category is selected) */}
      {activeSubs.length>0&&(
        <div className="flex gap-2 flex-wrap mb-5 pl-1 border-l-2 border-blue-500 ml-1">
          <button onClick={()=>setSubFilter('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors
              ${subFilter==='all'?(dark?'bg-slate-700 text-white border-slate-600':'bg-slate-800 text-white border-slate-800'):(dark?'bg-slate-800 text-slate-400 border-slate-700':'bg-white text-slate-500 border-slate-200 hover:border-slate-400')}`}>
            All
          </button>
          {activeSubs.map(s=>(
            <button key={s.id} onClick={()=>setSubFilter(s.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors
                ${subFilter===s.id?(dark?'bg-slate-700 text-white border-slate-600':'bg-slate-800 text-white border-slate-800'):(dark?'bg-slate-800 text-slate-400 border-slate-700':'bg-white text-slate-500 border-slate-200 hover:border-slate-400')}`}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className={`text-[11px] font-semibold mb-3 ${hc}`}>{filtered.length} calculator{filtered.length!==1?'s':''}</div>

      {/* Grid */}
      {filtered.length===0
        ?<div className={`rounded-xl border p-8 text-center ${bc}`}><p className={`text-sm ${hc}`}>No calculators match your filters.</p></div>
        :<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map(c=><RichCalcCard key={c.id} c={c} onClick={()=>openCalc(c.id)} dark={dark} fav={favs.includes(c.id)} onToggleFav={()=>toggleFav(c.id)}/>)}
        </div>
      }
    </div>
  );
}

// ─── FEATURED CALCULATORS ────────────────────────────────────────────────────
const FEATURED=[
  {id:'hscore',why:'First-line triage for suspected secondary HLH in any unwell adult with fever, cytopenias, and hyperferritinaemia.'},
  {id:'ipi',why:'Standard prognostic stratification for newly diagnosed DLBCL before initiating R-CHOP or trial enrolment.'},
  {id:'ipssr',why:'Defines MDS risk category and transplant eligibility according to current ELN/IPSS-R guidelines.'},
  {id:'plasmic',why:'Rapid bedside tool to differentiate TTP from other TMAs before ADAMTS13 results return.'},
  {id:'wells_pe',why:'Stratifies pre-test probability for PE to determine whether D-dimer or direct CTPA is appropriate.'},
  {id:'mascc',why:'Validated risk score for safe outpatient management of febrile neutropenia in selected low-risk patients.'},
];

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
function HomePage({openCalc,openPathway,favs,toggleFav,recent,dark,setPage,setSearch}){
  const bc=dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200';
  const hc=dark?'text-slate-400':'text-slate-500';
  const totalCalcs=Object.keys(C).length;

  return(
    <div className="max-w-2xl mx-auto p-4 sm:p-8 pb-24 space-y-10">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${bc}`}>
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"/>
        <div className="p-7 sm:p-10">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${dark?'bg-blue-600':'bg-slate-900'}`}>
              <Droplets size={19} className="text-white"/>
            </div>
            <div className="leading-none">
              <span className="font-extrabold text-xl tracking-tight">HaemCalc</span>
              <span className="text-blue-600 font-extrabold text-xl"> Pro</span>
              <span className={`text-[11px] ml-2 font-medium ${hc}`}>v4.3</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 leading-snug">
            Evidence-based haematology<br/>
            <span className="text-blue-600">calculators &amp; clinical pathways.</span>
          </h2>
          <p className={`text-sm leading-relaxed max-w-lg mb-6 ${hc}`}>
            A consultant-grade platform designed for haematologists, trainees, and acute physicians. Risk scores, prognostic indices, dosing tools, step-by-step clinical pathways, and diagnostic frameworks — all guideline-aligned and ready for the ward.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {[[totalCalcs+' Calculators',Calculator,'blue'],[PATHWAYS.length+' Clinical Pathways',Route,'indigo'],[DIAGNOSTICS.length+' Diagnostic Modules',GitBranch,'purple']].map(([label,Icon,col])=>(
              <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border
                ${col==='blue'?(dark?'bg-blue-900/30 border-blue-800/60 text-blue-300':'bg-blue-50 border-blue-200 text-blue-700'):
                  col==='indigo'?(dark?'bg-indigo-900/30 border-indigo-800/60 text-indigo-300':'bg-indigo-50 border-indigo-200 text-indigo-700'):
                  (dark?'bg-purple-900/30 border-purple-800/60 text-purple-300':'bg-purple-50 border-purple-200 text-purple-700')}`}>
                <Icon size={11}/>{label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={()=>setSearch(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              <Search size={14}/>Explore Calculators
            </button>
            <button onClick={()=>setPage('pathways_list')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors
              ${dark?'border-slate-700 text-slate-300 hover:bg-slate-800':'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <Route size={14}/>View Pathways
            </button>
          </div>
        </div>
      </div>

      {/* ── TRUST / AUTHORITY STRIP ──────────────────────────── */}
      <section>
        <div className={`rounded-2xl border p-5 ${dark?'bg-slate-900 border-slate-800':'bg-slate-50 border-slate-200'}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {icon:User,title:'Consultant-Authored',desc:'Written and maintained by Dr. Muhammad Mohsin, FRCPath (Haem)'},
              {icon:BadgeCheck,title:'Guideline-Aligned',desc:'ELN · NCCN · ESMO · BSH · ISTH · NICE · ASH · EBMT'},
              {icon:Stethoscope,title:'Clinical Practice',desc:'Designed for real ward use, not just academic reference'},
              {icon:Activity,title:'Regularly Updated',desc:'Reviewed against major guideline revisions and new evidence'},
            ].map(({icon:Icon,title,desc})=>(
              <div key={title} className="flex flex-col gap-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark?'bg-blue-900/30':'bg-blue-50'}`}>
                  <Icon size={15} className={dark?'text-blue-400':'text-blue-600'}/>
                </div>
                <div className={`text-xs font-bold ${dark?'text-slate-200':'text-slate-800'}`}>{title}</div>
                <div className={`text-[11px] leading-snug ${hc}`}>{desc}</div>
              </div>
            ))}
          </div>
          <div className={`mt-4 pt-4 border-t text-[11px] flex items-center gap-2 ${dark?'border-slate-800 text-slate-500':'border-slate-200 text-slate-400'}`}>
            <ShieldAlert size={11}/>
            <span>Designed for clinical education and decision support. Does not replace specialist judgement, local policy, or formal guidelines.</span>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INSIDE ────────────────────────────────────── */}
      <section>
        <h2 className={`text-[11px] font-semibold uppercase tracking-widest mb-4 ${hc}`}>What's Inside</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {title:'Calculators',desc:totalCalcs+' risk scores, prognostic indices, and dosing tools across malignant haematology, coagulation, VTE, transfusion, and general medicine.',icon:Calculator,accent:dark?'text-blue-400':'text-blue-600',bg:dark?'bg-blue-900/20 border-blue-800/40':'bg-blue-50 border-blue-100',action:()=>setSearch(true)},
            {title:'Clinical Pathways',desc:PATHWAYS.length+' step-by-step management algorithms — HLH, VTE, anaemia, pancytopenia, neutropenic sepsis, thrombocytopenia, TTP/TMA, myeloma response assessment, MGUS/SMM surveillance, polycythaemia/erythrocytosis, and mild splenomegaly.',icon:Route,accent:dark?'text-indigo-400':'text-indigo-600',bg:dark?'bg-indigo-900/20 border-indigo-800/40':'bg-indigo-50 border-indigo-100',action:()=>setPage('pathways_list')},
            {title:'Diagnostics',desc:'7 structured frameworks guiding workup and differential diagnosis — lymphadenopathy, splenomegaly, APTT, coagulation screen, haemolysis, pancytopenia, and hyperferritinaemia.',icon:GitBranch,accent:dark?'text-purple-400':'text-purple-600',bg:dark?'bg-purple-900/20 border-purple-800/40':'bg-purple-50 border-purple-100',action:()=>setPage('diag:'+DIAGNOSTICS[0]?.id)},
          ].map(({title,desc,icon:Icon,accent,bg,action})=>(
            <button key={title} onClick={action}
              className={`text-left p-5 rounded-xl border transition-all hover:shadow-md ${bc}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${bg}`}>
                <Icon size={17} className={accent}/>
              </div>
              <div className="font-bold text-sm mb-1.5">{title}</div>
              <div className={`text-[12px] leading-relaxed ${hc}`}>{desc}</div>
              <div className={`flex items-center gap-1 mt-3 text-[11px] font-semibold ${accent}`}>Open <ChevronRight size={12}/></div>
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURED CALCULATORS ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-[11px] font-semibold uppercase tracking-widest ${hc}`}>Featured Calculators</h2>
          <button onClick={()=>setSearch(true)} className={`text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1`}>View all <ChevronRight size={11}/></button>
        </div>
        <div className="space-y-2">
          {FEATURED.map(({id,why})=>{const c=C[id];return c?(
            <button key={id} onClick={()=>openCalc(id)}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-sm group ${bc} ${dark?'hover:border-slate-700':'hover:border-blue-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${dark?'bg-slate-800':'bg-slate-100'}`}>
                  <CIcon id={c.cat} size={15} className={dark?'text-slate-400':'text-slate-500'}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{c.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dark?'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50':'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>{c.evidence.guideline}</span>
                  </div>
                  <div className={`text-[11px] mt-0.5 font-medium ${dark?'text-slate-400':'text-slate-500'}`}>{c.disease}</div>
                  <div className={`text-[11px] mt-1 leading-snug ${hc}`}>{why}</div>
                </div>
                <ChevronRight size={14} className={`flex-shrink-0 mt-1 ${dark?'text-slate-600':'text-slate-300'} group-hover:text-blue-500 transition-colors`}/>
              </div>
            </button>
          ):null})}
        </div>
      </section>

      {/* ── ACUTE / EMERGENCY STRIP ──────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={13} className="text-red-500"/>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-red-500">Emergency &amp; Acute Tools</h2>
        </div>
        <div className={`rounded-xl border p-4 ${dark?'bg-red-950/10 border-red-900/40':'bg-red-50/60 border-red-200/80'}`}>
          <p className={`text-[11px] mb-3 ${dark?'text-red-400/60':'text-red-500/60'}`}>Time-critical calculators for acute haematology situations</p>
          <div className="flex flex-wrap gap-2">
            {ACUTE_TOOLS.map(id=>{const c=C[id];return c?(
              <button key={id} onClick={()=>openCalc(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                  ${dark?'bg-slate-900 border-red-900/50 text-red-300 hover:border-red-700 hover:bg-red-900/20':'bg-white border-red-200 text-red-700 hover:border-red-400 hover:shadow-sm'}`}>
                {c.name}
              </button>
            ):null})}
          </div>
        </div>
      </section>

      {/* ── EVIDENCE & METHODOLOGY ───────────────────────────── */}
      <section>
        <div className={`rounded-2xl border p-6 space-y-4 ${bc}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark?'bg-emerald-900/30':'bg-emerald-50'}`}>
              <BookOpen size={16} className={dark?'text-emerald-400':'text-emerald-600'}/>
            </div>
            <h2 className="font-bold text-base">Evidence &amp; Methodology</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {title:'Source Studies',desc:'Every calculator is derived from its original validation study with PubMed-indexed references, year of publication, and PMID displayed on each tool page.'},
              {title:'Guideline Alignment',desc:'Risk thresholds and clinical interpretations reflect current recommendations from ELN, NCCN, ESMO, BSH, ISTH, NICE, ASH, ASTCT, and EBMT.'},
              {title:'Clinical Interpretation',desc:'Results go beyond a number — each tool provides a clinical interpretation, risk category, and actionable next steps derived from the source literature.'},
              {title:'Limitations Disclosed',desc:'Every calculator includes explicit limitations, populations not validated, and common pitfalls — helping clinicians apply tools appropriately.'},
            ].map(({title,desc})=>(
              <div key={title} className={`rounded-xl p-4 ${dark?'bg-slate-800/60':'bg-slate-50'}`}>
                <div className={`text-xs font-bold mb-1 ${dark?'text-slate-200':'text-slate-700'}`}>{title}</div>
                <div className={`text-[11px] leading-relaxed ${hc}`}>{desc}</div>
              </div>
            ))}
          </div>
          <div className={`text-[11px] ${hc}`}>
            <span className="font-semibold">About the Author — </span>
            <button onClick={()=>setPage('about')} className="text-blue-600 hover:underline font-medium">Dr. Muhammad Mohsin, Consultant Haematologist</button>
            {' '}— MBBS · MRCP (UK) · FRCPath (Haematology) · FRCP (London)
          </div>
        </div>
      </section>

      {/* ── FAVOURITES ───────────────────────────────────────── */}
      {favs.length>0&&(
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Star size={13} className={dark?'text-amber-500':'text-amber-600'}/>
            <h2 className={`text-[11px] font-semibold uppercase tracking-widest ${dark?'text-amber-500':'text-amber-600'}`}>Favourites</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {favs.map(id=>{const c=C[id];return c?<CalcCard key={id} c={c} onClick={()=>openCalc(id)} dark={dark} fav onToggleFav={()=>toggleFav(id)}/>:null})}
          </div>
        </section>
      )}

      {/* ── RECENTLY USED ────────────────────────────────────── */}
      {recent.length>0&&(
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className={hc}/>
            <h2 className={`text-[11px] font-semibold uppercase tracking-widest ${hc}`}>Recently Used</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {recent.slice(0,4).map(id=>{const c=C[id];return c?<CalcCard key={id} c={c} onClick={()=>openCalc(id)} dark={dark} fav={favs.includes(id)} onToggleFav={()=>toggleFav(id)}/>:null})}
          </div>
        </section>
      )}
    </div>
  );
}

function CalcCard({c,onClick,dark,fav,onToggleFav}){
  const cs=CAT_STYLE[c.cat]||{dot:'bg-slate-400',badge:'bg-slate-50 text-slate-700 border-slate-200',badgeDark:'bg-slate-800 text-slate-400 border-slate-700'};
  return(
    <div className={`relative group rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md ${dark?'bg-slate-900 border-slate-800 hover:border-slate-700':'bg-white border-slate-200 hover:border-blue-300'}`} onClick={onClick}>
      <button onClick={e=>{e.stopPropagation();onToggleFav()}} className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${fav?'opacity-100 text-amber-500':'text-slate-300'}`}><Star size={12} fill={fav?'currentColor':'none'}/></button>
      <CIcon id={c.cat} size={16} className={`mb-1.5 ${dark?'text-slate-500':'text-slate-400'}`}/>
      <div className="font-bold text-xs pr-5">{c.name}</div>
      <span className={`inline-flex items-center gap-0.5 mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${dark?cs.badgeDark:cs.badge}`}>
        <span className={`w-1 h-1 rounded-full ${cs.dot}`}/>{c.disease}
      </span>
      <div className={`text-[10px] mt-1 line-clamp-2 ${dark?'text-slate-500':'text-slate-400'}`}>{c.purpose}</div>
    </div>
  );
}

// ─── CALCULATOR VIEW (GOLD-STANDARD TEMPLATE) ───────────────────────────────
function CalcView({calcId,openCalc,favs,toggleFav,dark,setPage,addToLog}){
  const c=C[calcId];
  const[vals,setVals]=useState({});
  const[result,setResult]=useState(null);
  const[copied,setCopied]=useState(false);
  const[tab,setTab]=useState('calc');

  useEffect(()=>{setVals({});setResult(null);setTab('calc')},[calcId]);

  if(!c)return<div className="p-8 text-center text-slate-400">Calculator not found.</div>;

  const g=gov(c.id);
  const et=EVTYPE[g.type]||EVTYPE.derived;

  const update=(id,v)=>setVals(p=>({...p,[id]:v}));
  const calculate=()=>{
    const r=c.calc(vals);
    setResult(r);
    if(r&&r.risk!=='info'&&addToLog){
      addToLog({id:c.id,calcName:c.name,score:r.score,label:r.label,risk:r.risk,next:r.next||'',time:new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})});
    }
  };
  const reset=()=>{setVals({});setResult(null)};
  const isFav=favs.includes(calcId);

  const riskColors={low:'emerald',int:'amber',high:'red',vhigh:'purple',info:'sky'};
  const rc=result?riskColors[result.risk]||'slate':'slate';

  const copyResult=()=>{
    if(!result)return;
    const txt=`[${new Date().toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}] ${c.name}: ${result.label}${result.score?` (Score: ${result.score}${result.max?'/'+result.max:''})`:''}.${result.stats?.length?' '+result.stats.map(s=>s[0]+': '+s[1]).join(', ')+'.':''} ${result.interp} Next steps: ${result.next}`;
    navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)});
  };

  const printResult=()=>{
    if(!result)return;
    const dtStr=new Date().toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const inputRows=c.inputs.filter(inp=>inp.type!=='section').map(inp=>{
      const v=vals[inp.id];
      let display='—';
      if(inp.type==='select'&&inp.opts){const found=inp.opts.find(([,val])=>val===v);display=found?found[0]:'—';}
      else if(inp.type==='check'){display=v?'Yes':'No';}
      else if(v!==undefined&&v!==''){display=String(v)+(inp.unit?' '+inp.unit:'');}
      return`<tr><td style="padding:5px 10px 5px 0;color:#555;font-size:12px;width:55%;border-bottom:1px solid #f0f0f0">${inp.label}</td><td style="padding:5px 0;font-size:12px;font-weight:600;border-bottom:1px solid #f0f0f0">${display}</td></tr>`;
    }).join('');
    const riskLabel=result.risk==='low'?'#059669':result.risk==='int'?'#d97706':result.risk==='high'?'#dc2626':result.risk==='vhigh'?'#7c3aed':'#475569';
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${c.name} — HaemCalc Pro</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;background:#fff;padding:30px 40px}@media print{.noprint{display:none!important}body{padding:15px 25px}}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1e293b;padding-bottom:10px;margin-bottom:18px">
  <div><span style="font-weight:900;font-size:18px;letter-spacing:-0.5px">HaemCalc<span style="color:#2563eb">Pro</span></span><span style="font-size:10px;margin-left:8px;color:#94a3b8">v${SITE_VERSION} · Educational Use Only</span></div>
  <div style="font-size:11px;color:#64748b">${dtStr}</div>
</div>
<h1 style="font-size:20px;font-weight:900;margin-bottom:4px">${c.name}</h1>
<p style="font-size:12px;color:#64748b;margin-bottom:18px">${c.purpose}</p>
<h2 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;margin-bottom:8px">Inputs Entered</h2>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px">${inputRows}</table>
<div style="border:2px solid ${riskLabel};border-radius:8px;padding:16px;margin-bottom:16px;background:${result.risk==='low'?'#f0fdf4':result.risk==='int'?'#fffbeb':result.risk==='high'?'#fef2f2':result.risk==='vhigh'?'#faf5ff':'#f8fafc'}">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <div style="width:52px;height:52px;border-radius:8px;background:${riskLabel};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:${String(result.score).length>3?'13':'18'}px">${result.score}${result.max?'<div style="font-size:9px;opacity:0.7">/' +result.max+'</div>':''}</div>
    <div><div style="font-size:18px;font-weight:900;color:${riskLabel}">${result.label}</div>${result.stats&&result.stats.length?'<div style="font-size:11px;margin-top:3px;color:#64748b">'+result.stats.map(([k,v])=>`<strong>${k}:</strong> ${v}`).join(' &nbsp;·&nbsp; ')+'</div>':''}</div>
  </div>
  <div style="background:rgba(255,255,255,0.7);border-radius:6px;padding:12px;margin-bottom:10px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#2563eb;margin-bottom:4px">What This Means</div><p style="font-size:13px;line-height:1.6;color:#1e293b">${result.interp}</p></div>
  ${result.next?`<div style="background:rgba(255,255,255,0.7);border-radius:6px;padding:12px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#059669;margin-bottom:4px">What To Do Next</div><p style="font-size:13px;line-height:1.6;color:#1e293b">${result.next}</p></div>`:''}
</div>
<div style="border-top:1px solid #e2e8f0;padding-top:12px;font-size:10px;color:#94a3b8">
  <strong>Source:</strong> ${c.evidence.source}${c.evidence.pmid?' · PMID '+c.evidence.pmid:''} · ${c.evidence.guideline} (${c.evidence.year})<br>
  <strong>Reviewer:</strong> ${REVIEWER}<br>
  <strong style="color:#ef4444">DISCLAIMER:</strong> This output is for educational and clinical decision-support purposes only. It does not replace specialist clinical judgement, institutional guidelines, or the original published source. Always verify results before acting on them. Generated ${dtStr}.
</div>
<div class="noprint" style="text-align:center;margin-top:20px"><button onclick="window.print()" style="background:#1e293b;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer">Print / Save as PDF</button></div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
    const w=window.open('','_blank');
    if(w){w.document.write(html);w.document.close();}
  };

  const bc=dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200';

  // Suggested related calculators + diagnostic modules
  const related=Object.values(C).filter(x=>x.id!==calcId&&(x.disease===c.disease||x.cat===c.cat)).slice(0,3);
  const relatedDiags=DIAGNOSTICS.filter(d=>c.tags.some(t=>d.id.includes(t)||d.title.toLowerCase().includes(t))).slice(0,2);

  return(
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24 space-y-4">
      {/* HEADER with evidence badge */}
      <div className={`rounded-2xl border ${bc} p-5`}>
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${dark?'bg-slate-800':'bg-slate-100'}`}><CIcon id={c.cat} size={22} className={dark?'text-slate-400':'text-slate-500'}/></div>
          <div className="flex-1 min-w-0">
            {/* Breadcrumb: category · disease */}
            {CAT_STYLE[c.cat]&&<div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${dark?'text-slate-500':'text-slate-400'}`}>{CAT_STYLE[c.cat].label}</span>
              <span className={dark?'text-slate-700':'text-slate-300'}>·</span>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${dark?CAT_STYLE[c.cat].badgeDark:CAT_STYLE[c.cat].badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${CAT_STYLE[c.cat].dot}`}/>{c.disease}
              </span>
            </div>}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold tracking-tight">{c.name}</h1>
              <button onClick={()=>toggleFav(calcId)} className={isFav?'text-amber-500':'text-slate-300'}><Star size={16} fill={isFav?'currentColor':'none'}/></button>
            </div>
            <p className={`text-sm mt-1 ${dark?'text-slate-400':'text-slate-500'}`}>{c.purpose}</p>
            {/* Evidence + Classification Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${dark?et.badgeDark:et.badge}`}><BadgeCheck size={10}/>{et.label}</span>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${dark?'bg-emerald-900/40 text-emerald-400 border-emerald-800':'bg-emerald-50 text-emerald-700 border-emerald-200'}`}><Shield size={9}/>{c.evidence.guideline}</span>
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${dark?'bg-slate-800 text-slate-400 border-slate-700':'bg-slate-100 text-slate-500 border-slate-200'}`}>{c.evidence.year}</span>
              {c.evidence.pmid&&<span className={`text-[9px] px-2 py-0.5 rounded-full border ${dark?'bg-slate-800 text-slate-400 border-slate-700':'bg-slate-100 text-slate-500 border-slate-200'}`}>PMID {c.evidence.pmid}</span>}
            </div>
          </div>
        </div>
        <div className={`mt-3 pt-3 border-t text-[10px] flex items-center gap-1.5 ${dark?'border-slate-800 text-slate-600':'border-slate-100 text-slate-400'}`}><ShieldAlert size={10}/>This tool supports but does not replace clinical judgement. Always verify against institutional guidelines.</div>
      </div>

      {/* WHEN TO USE — always visible context strip */}
      <div className={`rounded-xl border px-4 py-3 flex gap-3 ${dark?'bg-slate-900/60 border-slate-800':'bg-slate-50 border-slate-200'}`}>
        <Check size={14} className={`flex-shrink-0 mt-0.5 ${dark?'text-emerald-400':'text-emerald-600'}`}/>
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${dark?'text-emerald-400':'text-emerald-700'}`}>When to Use</div>
          <p className={`text-xs leading-relaxed ${dark?'text-slate-300':'text-slate-600'}`}>{c.whenUse}</p>
        </div>
      </div>

      {/* TABS */}
      <div className={`flex gap-1 p-1 rounded-xl ${dark?'bg-slate-900':'bg-slate-100'}`}>
        {[['calc','Calculator',Calculator],['evidence','Evidence & References',BookOpen],['notes','Limitations & Caveats',AlertTriangle]].map(([k,l,Ic])=>(
          <button key={k} onClick={()=>setTab(k)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${tab===k?(dark?'bg-slate-800 text-white':'bg-white text-slate-900 shadow-sm'):(dark?'text-slate-400':'text-slate-500')}`}><Ic size={13}/>{l}</button>
        ))}
      </div>

      {/* CALCULATOR TAB */}
      {tab==='calc'&&(<>
        <div className={`rounded-2xl border ${bc} p-4 space-y-2.5`}>
          {c.inputs.map(inp=>{
            if(inp.type==='section') return(
              <div key={inp.id} className={`pt-1 pb-0.5 border-t text-[10px] font-bold uppercase tracking-widest ${dark?'border-slate-700 text-slate-500':'border-slate-200 text-slate-400'}`}>{inp.label}</div>
            );
            return(
            <div key={inp.id}>
              <label className={`block text-[11px] font-semibold mb-1 ${dark?'text-slate-300':'text-slate-600'}`}>{inp.label}</label>
              {inp.type==='check'&&(
                <button onClick={()=>update(inp.id,!vals[inp.id])} className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${vals[inp.id]?(dark?'bg-blue-900/40 border-blue-700 text-blue-300':'bg-blue-50 border-blue-300 text-blue-700'):(dark?'bg-slate-800 border-slate-700 text-slate-300':'bg-slate-50 border-slate-200 text-slate-600')}`}>
                  <span className="mr-1.5">{vals[inp.id]?'☑':'☐'}</span>{vals[inp.id]?'Yes':'No'}
                </button>
              )}
              {inp.type==='select'&&(
                <select value={vals[inp.id]??''} onChange={e=>update(inp.id,Number(e.target.value))} className={`w-full px-3 py-1.5 rounded-lg border text-xs ${dark?'bg-slate-800 border-slate-700 text-slate-200':'bg-slate-50 border-slate-200 text-slate-700'} outline-none`}>
                  <option value="" disabled>Select…</option>
                  {inp.opts.map(([l,v])=><option key={l} value={v}>{l}</option>)}
                </select>
              )}
              {inp.type==='number'&&(
                <input type="number" value={vals[inp.id]??''} onChange={e=>update(inp.id,e.target.value===''?undefined:Number(e.target.value))} min={inp.min} max={inp.max} step={inp.step} placeholder={inp.placeholder||(inp.min!==undefined&&inp.max!==undefined?`${inp.min}–${inp.max}`:'')}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${dark?'bg-slate-800 border-slate-700 text-slate-200':'bg-slate-50 border-slate-200'} outline-none focus:border-blue-500`}/>
              )}
            </div>
            );
          })}
          <div className="flex gap-2 pt-2">
            <button onClick={calculate} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"><Calculator size={15}/>Calculate</button>
            <button onClick={reset} className={`px-4 py-3 rounded-xl border font-semibold text-sm ${dark?'border-slate-700 text-slate-400 hover:bg-slate-800':'border-slate-200 text-slate-500 hover:bg-slate-50'} transition-colors`}><RotateCcw size={14}/></button>
          </div>
        </div>

        {/* RESULT */}
        {result&&result.risk!=='info'&&(
          <div className={`rounded-2xl border-2 p-5 space-y-4 transition-all ${
            rc==='emerald'?(dark?'bg-emerald-950/30 border-emerald-800':'bg-emerald-50 border-emerald-300'):
            rc==='amber'?(dark?'bg-amber-950/30 border-amber-800':'bg-amber-50 border-amber-300'):
            rc==='red'?(dark?'bg-red-950/30 border-red-800':'bg-red-50 border-red-300'):
            rc==='purple'?(dark?'bg-purple-950/30 border-purple-800':'bg-purple-50 border-purple-300'):
            dark?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-300'
          }`}>
            {/* Score + Risk */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-extrabold text-white ${
                rc==='emerald'?'bg-emerald-600':rc==='amber'?'bg-amber-500':rc==='red'?'bg-red-600':rc==='purple'?'bg-purple-600':'bg-slate-500'
              }`}>
                <span className="text-lg leading-none">{typeof result.score==='number'?result.score:result.score}</span>
                {result.max&&<span className="text-[9px] opacity-70 mt-0.5">/{result.max}</span>}
              </div>
              <div>
                <div className={`text-lg font-extrabold ${
                  rc==='emerald'?'text-emerald-700':rc==='amber'?(dark?'text-amber-400':'text-amber-700'):rc==='red'?(dark?'text-red-400':'text-red-700'):rc==='purple'?(dark?'text-purple-400':'text-purple-700'):''
                }`}>{result.label}</div>
                {result.stats?.length>0&&<div className="flex flex-wrap gap-2 mt-1">{result.stats.map(([k,v])=>(
                  <span key={k} className={`text-xs px-2 py-0.5 rounded-full ${dark?'bg-white/10 text-white/70':'bg-black/5 text-black/60'}`}><strong>{k}:</strong> {v}</span>
                ))}</div>}
              </div>
            </div>

            {/* CLINICAL ACTION — primary focus for time-pressured use */}
            {result.next&&<div className={`rounded-xl p-4 border-l-4 ${
              rc==='emerald'?(dark?'bg-emerald-950/30 border-emerald-500':'bg-emerald-50 border-emerald-500'):
              rc==='amber'?(dark?'bg-amber-950/30 border-amber-500':'bg-amber-50 border-amber-500'):
              rc==='red'?(dark?'bg-red-950/30 border-red-500':'bg-red-50 border-red-500'):
              rc==='purple'?(dark?'bg-purple-950/30 border-purple-500':'bg-purple-50 border-purple-500'):
              (dark?'bg-slate-800 border-slate-500':'bg-slate-50 border-slate-400')
            }`}>
              <div className="flex items-center gap-2 mb-2"><ListChecks size={14} className={rc==='emerald'?'text-emerald-500':rc==='amber'?'text-amber-500':rc==='red'?'text-red-500':rc==='purple'?'text-purple-500':'text-slate-500'}/><span className={`text-[10px] font-bold uppercase tracking-wider ${rc==='emerald'?'text-emerald-600':rc==='amber'?'text-amber-600':rc==='red'?'text-red-600':rc==='purple'?'text-purple-600':'text-slate-500'}`}>Clinical Action</span></div>
              <p className={`text-sm font-medium leading-relaxed ${dark?'text-slate-100':'text-slate-800'}`}>{result.next}</p>
            </div>}

            {/* Interpretation — supporting clinical context */}
            <div className={`rounded-xl p-4 ${dark?'bg-black/20':'bg-white/60'}`}>
              <div className="flex items-center gap-2 mb-2"><Brain size={14} className="text-blue-500"/><span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Interpretation</span></div>
              <p className={`text-sm leading-relaxed ${dark?'text-slate-300':'text-slate-600'}`}>{result.interp}</p>
            </div>

            {/* Copy + Print row */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={copyResult} className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${copied?(dark?'bg-emerald-900/50 text-emerald-400':'bg-emerald-100 text-emerald-700'):(dark?'bg-white/10 text-white/60 hover:bg-white/20':'bg-black/5 text-black/50 hover:bg-black/10')}`}>
                {copied?<><Check size={12}/>Copied to clipboard</>:<><Copy size={12}/>Copy result</>}
              </button>
              <button onClick={printResult} className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${dark?'bg-white/10 text-white/60 hover:bg-white/20':'bg-black/5 text-black/50 hover:bg-black/10'}`}>
                <Printer size={12}/>Print / Save PDF
              </button>
            </div>
          </div>
        )}
        {result&&result.risk==='info'&&(
          <div className={`rounded-2xl border p-4 ${dark?'bg-sky-950/30 border-sky-800':'bg-sky-50 border-sky-200'}`}>
            <p className={`text-sm ${dark?'text-sky-300':'text-sky-700'}`}>{result.label}</p>
          </div>
        )}

        {/* Related Calculators + Diagnostic Modules */}
        {(related.length>0||relatedDiags.length>0)&&<div>
          <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${dark?'text-slate-500':'text-slate-400'}`}>Related Tools</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {related.map(r=>(
              <button key={r.id} onClick={()=>openCalc(r.id)} className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-medium ${dark?'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300':'bg-white border-slate-200 hover:border-blue-300'} transition-colors flex items-center gap-1.5`}>
                <CIcon id={r.cat} size={13} className="inline"/>{r.name}
              </button>
            ))}
            {relatedDiags.map(d=>(
              <button key={d.id} onClick={()=>setPage&&setPage('diag:'+d.id)} className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-medium ${dark?'bg-purple-950/30 border-purple-900/50 text-purple-300':'bg-purple-50 border-purple-200 text-purple-700'} transition-colors flex items-center gap-1.5`}>
                <GitBranch size={13}/>{d.title}
              </button>
            ))}
          </div>
        </div>}
      </>)}

      {/* EVIDENCE TAB */}
      {tab==='evidence'&&(
        <div className={`rounded-2xl border ${bc} p-5 space-y-5`}>

          {/* Evidence Classification */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border ${dark?et.badgeDark:et.badge}`}><BadgeCheck size={11}/>{et.label}</span>
          </div>

          {/* Primary Source */}
          <div>
            <div className="flex items-center gap-2 mb-2"><BookOpen size={14} className="text-blue-500"/><span className="text-xs font-bold uppercase tracking-wider text-blue-600">Primary Source</span></div>
            <p className={`text-sm leading-relaxed ${dark?'text-slate-300':'text-slate-600'}`}>{c.evidence.source}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {c.evidence.pmid&&<a href={`https://pubmed.ncbi.nlm.nih.gov/${c.evidence.pmid}`} target="_blank" rel="noreferrer"
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${dark?'bg-blue-900/40 text-blue-400 border-blue-800 hover:border-blue-600':'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400'} transition-colors`}>
                <ExternalLink size={9}/>PubMed PMID {c.evidence.pmid}
              </a>}
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${dark?'bg-slate-800 text-slate-400 border-slate-700':'bg-slate-100 text-slate-500 border-slate-200'}`}>Published {c.evidence.year}</span>
            </div>
          </div>

          {/* Guideline Alignment */}
          <div className={`rounded-xl p-4 ${dark?'bg-slate-800/60':'bg-slate-50'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${dark?'text-slate-400':'text-slate-500'}`}>Guideline Alignment</div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${dark?'bg-emerald-900/40 text-emerald-400 border-emerald-800':'bg-emerald-50 text-emerald-700 border-emerald-200'}`}><BadgeCheck size={10}/>{c.evidence.guideline}</span>
            </div>
            <p className={`text-xs leading-relaxed ${dark?'text-slate-300':'text-slate-600'}`}>
              Risk thresholds and clinical interpretations for <strong>{c.name}</strong> reflect recommendations from {c.evidence.guideline} at the time of development ({c.evidence.year}). Clinicians must verify against the current version of local and national guidelines before making treatment decisions.
            </p>
          </div>

          {/* Population */}
          <div className={`rounded-xl p-4 ${dark?'bg-slate-800/60':'bg-slate-50'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${dark?'text-slate-400':'text-slate-500'}`}>Population Validated In</div>
            <p className={`text-xs ${dark?'text-slate-300':'text-slate-600'}`}>{g.population}</p>
          </div>

          {/* Governance Panel */}
          <div className={`rounded-xl border overflow-hidden ${dark?'border-slate-700':'border-slate-200'}`}>
            <div className={`px-4 py-2.5 border-b flex items-center gap-2 ${dark?'bg-slate-800/80 border-slate-700':'bg-slate-100 border-slate-200'}`}>
              <Shield size={13} className={dark?'text-slate-400':'text-slate-500'}/>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${dark?'text-slate-400':'text-slate-500'}`}>Governance Record</span>
            </div>
            <div className={`divide-y ${dark?'divide-slate-800':'divide-slate-100'}`}>
              {[
                ['Evidence Type',    et.label],
                ['Guideline Source', c.evidence.guideline],
                ['Guideline Version',c.evidence.guideline+' ('+c.evidence.year+')'],
                ['Last Reviewed',    g.lastReviewed],
                ['Next Review Due',  g.nextReview],
                ['Reviewer / Editor',g.reviewer],
              ].map(([k,v])=>(
                <div key={k} className={`flex items-baseline gap-4 px-4 py-2.5 text-xs ${dark?'bg-slate-900':'bg-white'}`}>
                  <span className={`w-36 flex-shrink-0 font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>{k}</span>
                  <span className={dark?'text-slate-300':'text-slate-700'}>{v}</span>
                </div>
              ))}
              {/* Co-Reviewers row — always shown */}
              <div className={`flex items-baseline gap-4 px-4 py-2.5 text-xs ${dark?'bg-slate-900':'bg-white'}`}>
                <span className={`w-36 flex-shrink-0 font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>Co-Reviewers</span>
                {g.coReviewers&&g.coReviewers.length>0
                  ?<span className={dark?'text-slate-300':'text-slate-700'}>{g.coReviewers.join(' · ')}</span>
                  :<span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${dark?'bg-amber-900/30 text-amber-400 border border-amber-800/50':'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    <AlertTriangle size={9}/>Pending — community review invited
                  </span>
                }
              </div>
            </div>
          </div>

          <div className={`text-[10px] flex items-start gap-1.5 ${dark?'text-slate-600':'text-slate-400'}`}>
            <ShieldAlert size={10} className="flex-shrink-0 mt-0.5"/>
            Results support but do not replace clinical judgement. Always verify against institutional guidelines and the original source publication.
          </div>
        </div>
      )}

      {/* LIMITATIONS & CAVEATS TAB */}
      {tab==='notes'&&(
        <div className={`rounded-2xl border ${bc} p-5 space-y-4`}>
          <div className={`rounded-xl p-4 ${dark?'bg-red-950/20 border border-red-900/40':'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2"><X size={14} className="text-red-500"/><span className="text-xs font-bold uppercase tracking-wider text-red-600">When NOT to Use</span></div>
            <p className={`text-sm leading-relaxed ${dark?'text-red-200':'text-red-800'}`}>{c.whenNot}</p>
          </div>
          <div className={`rounded-xl p-4 ${dark?'bg-amber-950/20 border border-amber-900/40':'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-amber-500"/><span className="text-xs font-bold uppercase tracking-wider text-amber-600">Known Limitations</span></div>
            <p className={`text-sm leading-relaxed ${dark?'text-amber-200':'text-amber-800'}`}>{c.limits}</p>
          </div>
          <div className={`rounded-xl p-4 ${dark?'bg-slate-800/60':'bg-slate-50'}`}>
            <div className="flex items-center gap-2 mb-2"><Info size={14} className={dark?'text-slate-400':'text-slate-500'}/><span className={`text-xs font-bold uppercase tracking-wider ${dark?'text-slate-400':'text-slate-500'}`}>Disclaimer</span></div>
            <p className={`text-xs leading-relaxed ${dark?'text-slate-400':'text-slate-500'}`}>This tool is intended to support clinical decision-making and education. It does not replace specialist judgement, local policy, or formal guidelines. All clinical decisions must be made by qualified healthcare professionals in the context of individual patient circumstances.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PATHWAY VIEW ────────────────────────────────────────────────────────────
function PathwayView({pathId,openCalc,dark}){
  const p=PATHWAYS.find(x=>x.id===pathId);
  const[step,setStep]=useState(0);
  useEffect(()=>setStep(0),[pathId]);
  if(!p)return null;
  const bc=dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200';
  const s=p.steps[step];
  return(
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24 space-y-4">
      <div className={`rounded-2xl border ${bc} p-5`}>
        <div className="mb-2"><Route size={28} className="text-blue-500"/></div>
        <h1 className="text-xl font-extrabold">{p.title}</h1>
        <p className={`text-sm mt-1 ${dark?'text-slate-400':'text-slate-500'}`}>{p.desc}</p>
        {/* Progress */}
        <div className="flex gap-1 mt-4">{p.steps.map((_,i)=>(
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i<=step?'bg-blue-600':dark?'bg-slate-700':'bg-slate-200'}`}/>
        ))}</div>
        <div className={`text-xs mt-2 ${dark?'text-slate-500':'text-slate-400'}`}>Step {step+1} of {p.steps.length}</div>
      </div>

      {/* Current Step */}
      <div className={`rounded-2xl border-2 ${step===p.steps.length-1?'border-emerald-400':'border-blue-400'} p-5 space-y-3`}>
        <h2 className="text-lg font-bold">{s.title}</h2>
        <p className={`text-sm leading-relaxed ${dark?'text-slate-300':'text-slate-600'}`}>{s.text}</p>
        {s.calcId&&(
          <button onClick={()=>openCalc(s.calcId)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
            <Calculator size={15}/>Open {C[s.calcId]?.name||'Calculator'}<ArrowRight size={14}/>
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step>0&&<button onClick={()=>setStep(step-1)} className={`flex-1 py-3 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 ${dark?'border-slate-700 text-slate-300 hover:bg-slate-800':'border-slate-200 hover:bg-slate-50'}`}><ChevronLeft size={15}/>Previous</button>}
        {step<p.steps.length-1&&<button onClick={()=>setStep(step+1)} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">{s.action||'Next Step'}<ChevronRight size={15}/></button>}
        {step===p.steps.length-1&&<div className={`flex-1 py-3 rounded-xl text-center font-bold text-sm ${dark?'bg-emerald-900/30 text-emerald-400':'bg-emerald-50 text-emerald-700'}`}>✓ Pathway Complete</div>}
      </div>
    </div>
  );
}

// ─── DIAGNOSTIC MODULE VIEW ──────────────────────────────────────────────────
function DiagnosticView({diagId,dark}){
  const d=DIAGNOSTICS.find(x=>x.id===diagId);
  if(!d)return null;
  const bc=dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200';
  return(
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24 space-y-4">
      <div className={`rounded-2xl border ${bc} p-5`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dark?'bg-purple-900/40':'bg-purple-50'}`}><GitBranch size={20} className="text-purple-500"/></div>
          <div><h1 className="text-xl font-extrabold">{d.title}</h1>
          <p className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>Diagnostic interpretation module · Decision support</p></div>
        </div>
        <div className={`mt-3 pt-3 border-t text-[10px] flex items-center gap-1.5 ${dark?'border-slate-800 text-slate-600':'border-slate-100 text-slate-400'}`}><ShieldAlert size={10}/>Clinical correlation required. This module supports but does not replace clinical judgement.</div>
      </div>
      {d.sections.map((s,i)=>(
        <div key={i} className={`rounded-2xl border ${bc} p-5`}>
          <h2 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dark?'text-slate-200':'text-slate-800'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${dark?'bg-purple-900/40 text-purple-400':'bg-purple-100 text-purple-700'}`}>{i+1}</span>{s.heading}</h2>
          <ul className="space-y-1.5">
            {s.items.map((item,j)=>(
              <li key={j} className={`text-xs leading-relaxed pl-4 relative ${dark?'text-slate-300':'text-slate-600'}`}>
                <span className={`absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full ${item.startsWith('→')||item.startsWith('YES')||item.startsWith('NO')?'bg-blue-500':dark?'bg-slate-600':'bg-slate-300'}`}/>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── EDITORIAL STANDARDS & METHODOLOGY PAGE ─────────────────────────────────
function AboutPage({dark}){
  const bc=dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200';
  const hc=dark?'text-slate-400':'text-slate-500';
  const totalCalcs=Object.keys(C).length;
  const govCounts={
    validated:  Object.values(GOV).filter(g=>g&&g.type==='validated').length,
    guideline:  Object.values(GOV).filter(g=>g&&g.type==='guideline').length,
    derived:    Object.values(GOV).filter(g=>g&&g.type==='derived').length,
    educational:Object.values(GOV).filter(g=>g&&g.type==='educational').length,
  };
  return(
    <div className="max-w-2xl mx-auto p-4 sm:p-8 pb-24 space-y-6">

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Editorial Standards & Methodology</h1>
        <p className={`text-sm mt-1 ${hc}`}>HaemCalc Pro v{SITE_VERSION} · {CONTENT_DATE} · Clinical governance, evidence hierarchy, and editorial policy</p>
      </div>

      {/* SITE GOVERNANCE STATEMENT */}
      <div className={`rounded-2xl border overflow-hidden ${dark?'border-emerald-900/60':'border-emerald-200'}`}>
        <div className={`px-5 py-3 border-b flex items-center gap-2 ${dark?'bg-emerald-950/30 border-emerald-900/60':'bg-emerald-50 border-emerald-200'}`}>
          <BadgeCheck size={15} className={dark?'text-emerald-400':'text-emerald-600'}/>
          <span className={`text-[11px] font-bold uppercase tracking-widest ${dark?'text-emerald-400':'text-emerald-700'}`}>Governance Statement</span>
        </div>
        <div className={`px-5 py-4 ${dark?'bg-emerald-950/10':'bg-white'}`}>
          <p className={`text-[12px] leading-relaxed ${dark?'text-slate-300':'text-slate-600'}`}>{SITE_GOVERNANCE}</p>
        </div>
      </div>

      {/* AUTHOR & EDITOR CARD */}
      <div className={`rounded-2xl border overflow-hidden ${bc}`}>
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"/>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-extrabold text-white ${dark?'bg-blue-600':'bg-slate-900'}`}>MM</div>
            <div className="flex-1">
              <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${dark?'text-blue-400':'text-blue-600'}`}>Lead Author & Clinical Editor</div>
              <div className="font-extrabold text-lg leading-tight">Dr. Muhammad Mohsin</div>
              <div className={`text-sm font-semibold mt-0.5 ${dark?'text-slate-300':'text-slate-600'}`}>Consultant Haematologist · NHS United Kingdom</div>
              <div className={`flex flex-wrap gap-1.5 mt-2`}>
                {['MBBS','MRCP (UK)','FRCPath (Haematology)','FRCP (London)'].map(q=>(
                  <span key={q} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${dark?'bg-slate-800 border-slate-700 text-slate-300':'bg-slate-100 border-slate-200 text-slate-600'}`}>{q}</span>
                ))}
              </div>
              <p className={`text-[12px] leading-relaxed mt-3 ${hc}`}>
                Practising Consultant Haematologist in the NHS with broad experience across malignant haematology (lymphoma, myeloma, MDS, AML), benign haematology (coagulation disorders, haemolytic anaemias, ITP, HLH), haematopoietic stem cell transplantation, and CAR-T therapy. HaemCalc Pro is authored, clinically reviewed, and maintained by Dr. Mohsin as a specialist decision-support resource for haematology practice and education.
              </p>
            </div>
          </div>
          <div className={`mt-4 pt-4 border-t flex flex-wrap gap-4 text-[11px] ${dark?'border-slate-800':'border-slate-100'}`}>
            {[['Malignant Haematology','CircleDot'],['Benign & Coagulation','Droplets'],['Transplant & CAR-T','GitBranch'],['VTE & Thrombosis','Activity']].map(([label])=>(
              <span key={label} className={`flex items-center gap-1.5 ${dark?'text-slate-400':'text-slate-500'}`}>
                <BadgeCheck size={11} className={dark?'text-blue-400':'text-blue-600'}/>{label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* JOIN AS REVIEWER CTA */}
      <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${dark?'bg-blue-950/20 border-blue-900/50':'bg-blue-50 border-blue-200'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dark?'bg-blue-900/40':'bg-blue-100'}`}>
          <User size={18} className={dark?'text-blue-400':'text-blue-600'}/>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-extrabold mb-1 ${dark?'text-blue-300':'text-blue-800'}`}>Join as a Peer Reviewer</div>
          <p className={`text-[12px] leading-relaxed ${dark?'text-blue-200/70':'text-blue-700'}`}>
            HaemCalc Pro is actively seeking NHS haematology consultant co-reviewers to strengthen multi-site governance and clinical credibility. Reviewers are credited by name on each tool they validate. If you are a Consultant Haematologist with FRCPath and would like to contribute, please get in touch.
          </p>
        </div>
        <a href="mailto:muhdmohsin@gmail.com?subject=HaemCalc%20Pro%20Reviewer%20Application" className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${dark?'bg-blue-700 hover:bg-blue-600 text-white':'bg-blue-600 hover:bg-blue-700 text-white'}`}>
          Contact Dr. Mohsin
        </a>
      </div>

      {/* PLATFORM SCOPE SUMMARY */}
      <div className="grid grid-cols-3 gap-3">
        {[[totalCalcs,'Clinical Tools',Calculator,'blue'],[PATHWAYS.length,'Pathways',Route,'indigo'],[DIAGNOSTICS.length,'Diagnostic Modules',GitBranch,'purple']].map(([n,label,Icon,col])=>(
          <div key={label} className={`rounded-xl border p-4 text-center ${bc}`}>
            <div className={`text-2xl font-extrabold mb-0.5 ${col==='blue'?'text-blue-600':col==='indigo'?'text-indigo-600':'text-purple-600'}`}>{n}</div>
            <div className={`text-[11px] font-medium ${hc}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* EVIDENCE CLASSIFICATION BREAKDOWN */}
      <div className={`rounded-2xl border ${bc} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark?'bg-blue-900/30':'bg-blue-50'}`}><Layers size={15} className={dark?'text-blue-400':'text-blue-600'}/></div>
          <div>
            <h2 className="font-bold text-base">Evidence Classification</h2>
            <p className={`text-[11px] mt-0.5 ${hc}`}>All tools are categorised by evidence tier. Classification is conservative and based on published derivation/validation data.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            {type:'validated',  count:govCounts.validated,   desc:'Scoring systems with prospective derivation and/or external validation in relevant clinical populations.'},
            {type:'guideline',  count:govCounts.guideline,   desc:'Algorithms directly based on published international guideline criteria (ELN, BSH, ISTH, KDIGO, ASTCT).'},
            {type:'derived',    count:govCounts.derived,     desc:'Formula-based tools, dose calculators, and clinical indices derived from established equations.'},
            {type:'educational',count:govCounts.educational, desc:'Interpretive frameworks and reference tables. Not independently validated scoring systems.'},
          ].map(({type,count,desc})=>{
            const et=EVTYPE[type];
            return(
              <div key={type} className={`rounded-xl border p-4 ${dark?'bg-slate-800/40 border-slate-700':'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${dark?et.badgeDark:et.badge}`}><BadgeCheck size={9}/>{et.label}</span>
                  <span className={`text-lg font-extrabold ${dark?'text-slate-200':'text-slate-700'}`}>{count}</span>
                </div>
                <p className={`text-[10px] leading-relaxed ${hc}`}>{desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTENDED AUDIENCE */}
      <div className={`rounded-2xl border ${bc} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark?'bg-violet-900/30':'bg-violet-50'}`}><User size={15} className={dark?'text-violet-400':'text-violet-600'}/></div>
          <h2 className="font-bold text-base">Intended Audience</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {role:'Consultant Haematologists',desc:'Rapid, bedside access to evidence-based risk scoring, prognostic stratification, and dosing tools during ward rounds, MDT, and outpatient clinics.'},
            {role:'Haematology Trainees (ST3–ST7)',desc:'Structured learning tool aligned with JRCPTB curriculum competencies and current ELN, NICE, and BSH guidance. Supports examination preparation and clinical reasoning.'},
            {role:'Acute & General Physicians',desc:'Reliable haematology decision support for acute presentations — suspected HLH, TTP/TMA, febrile neutropenia, coagulopathy, and anaemia workup.'},
            {role:'Laboratory & Clinical Staff',desc:'Interpretive frameworks for abnormal coagulation screens, cytopenias, haemolysis investigations, and laboratory haematology referrals.'},
          ].map(({role,desc})=>(
            <div key={role} className={`rounded-xl p-4 ${dark?'bg-slate-800/60':'bg-slate-50'}`}>
              <div className={`text-xs font-bold mb-1 ${dark?'text-slate-200':'text-slate-700'}`}>{role}</div>
              <div className={`text-[11px] leading-relaxed ${hc}`}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* EDITORIAL STANDARDS & METHODOLOGY */}
      <div className={`rounded-2xl border ${bc} p-6 space-y-5`}>
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark?'bg-emerald-900/30':'bg-emerald-50'}`}><BadgeCheck size={15} className={dark?'text-emerald-400':'text-emerald-600'}/></div>
          <h2 className="font-bold text-base">Editorial Standards & Methodology</h2>
        </div>
        {[
          {
            title:'1. Selection Criteria',
            body:'Tools are included only where a PubMed-indexed derivation or validation study exists, or where a recognised international guideline body has formally endorsed a scoring algorithm. Calculators lacking published validation, or those formally deprecated by guideline authors, are excluded. Redundant tools where a superior or updated version exists are noted in the Limitations tab.',
          },
          {
            title:'2. Hierarchy of Evidence',
            body:'Tools are classified by four evidence tiers: (i) Validated Clinical Scores — derived and validated in prospective clinical cohorts; (ii) Guideline-Based Algorithms — directly reflecting published international guideline criteria; (iii) Derived Clinical Tools — established formulae and indices in routine clinical use; (iv) Educational Reference Tools — interpretive frameworks and dose conversion tables. Classification is conservative; evidence strength is not overstated.',
          },
          {
            title:'3. Clinical Interpretation Policy',
            body:'Every tool presents a result, a risk category or interpretation, and actionable clinical guidance. Results are never displayed as bare numerical outputs. Guidance is derived from the source publication and current guideline recommendations. Interpretation statements are written to reflect consultant-level clinical reasoning, not algorithmic templating.',
          },
          {
            title:'4. Guideline Alignment',
            body:'Risk thresholds, staging criteria, and management recommendations are aligned with current guidance from ELN, NCCN, ESMO, BSH, ISTH, NICE, ASH, ASTCT, EBMT, iwCLL, and WHO at the time of development. The guideline source and year are declared on every tool. Where guideline bodies have diverging recommendations, the most widely adopted position in UK haematology practice is used.',
          },
          {
            title:'5. Limitations Disclosure',
            body:'Each tool explicitly states when it should not be used, the populations in which it has not been formally validated, and known clinical pitfalls. This includes pre-Rituximab era tools, paediatric exclusions, and overlap conditions. Clinicians are expected to read the Limitations tab before applying any tool in non-standard clinical scenarios.',
          },
          {
            title:'6. Review & Update Schedule',
            body:'Content is reviewed annually as a minimum, or promptly following publication of major guideline revisions (e.g., ELN AML 2022, WHO Classification 2022, BSH Thrombocytopenia, ISTH DIC criteria). The review date and next scheduled review are recorded in the Governance Record on each tool. Discrepancies or updates may be reported via the feedback mechanism.',
          },
          {
            title:'7. Independence & Transparency',
            body:'HaemCalc Pro is an independent clinical resource. It does not receive commercial sponsorship, pharmaceutical funding, or advertising revenue. No content is influenced by commercial entities. All decisions regarding tool inclusion, interpretation, and guideline alignment are made solely by the clinical editor on the basis of published evidence.',
          },
        ].map(({title,body})=>(
          <div key={title} className={`border-l-2 pl-4 ${dark?'border-slate-700':'border-slate-200'}`}>
            <div className={`text-xs font-bold mb-1 ${dark?'text-slate-200':'text-slate-700'}`}>{title}</div>
            <p className={`text-[12px] leading-relaxed ${hc}`}>{body}</p>
          </div>
        ))}
      </div>

      {/* SCOPE — HAEMATOLOGY DOMAINS */}
      <div className={`rounded-2xl border ${bc} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark?'bg-rose-900/30':'bg-rose-50'}`}><Microscope size={15} className={dark?'text-rose-400':'text-rose-600'}/></div>
          <h2 className="font-bold text-base">Clinical Scope</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {[
            {domain:'Malignant Haematology',items:'Lymphoma (NHL, HL, PTCL, CNS), multiple myeloma, MDS, AML, CML, MPN, CLL, Waldenström\'s, amyloidosis'},
            {domain:'Benign Haematology',items:'HLH, TTP/TMA, ITP, HIT, DIC, aplastic anaemia, haemolytic anaemias, iron deficiency, haemostasis'},
            {domain:'Coagulation & VTE',items:'PE risk, DVT risk, bleeding risk (HAS-BLED), AF/stroke risk (CHA₂DS₂-VASc), VTE prophylaxis, malignancy-associated VTE'},
            {domain:'Transplant & Cellular Therapy',items:'SCT risk stratification (HCT-CI, DRI, EBMT), CRS grading, conditioning toxicity assessment, GVHD tools'},
            {domain:'Supportive & Perioperative',items:'Febrile neutropenia (MASCC), performance status (ECOG, KPS), frailty (CFS, G8), fitness for treatment'},
            {domain:'General & Laboratory',items:'Renal dosing (CrCl, eGFR), dose calculations (BSA, Calvert), acid-base, electrolytes, sepsis scoring'},
          ].map(({domain,items})=>(
            <div key={domain} className={`rounded-xl p-3.5 ${dark?'bg-slate-800/50':'bg-slate-50'}`}>
              <div className={`text-xs font-bold mb-1 ${dark?'text-slate-200':'text-slate-700'}`}>{domain}</div>
              <p className={`text-[10px] leading-relaxed ${hc}`}>{items}</p>
            </div>
          ))}
        </div>
      </div>

      {/* VERSION HISTORY */}
      <div className={`rounded-2xl border ${bc} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark?'bg-slate-800':'bg-slate-100'}`}><FileText size={15} className={dark?'text-slate-400':'text-slate-500'}/></div>
          <h2 className="font-bold text-base">Version History</h2>
        </div>
        <div className="space-y-3">
          {[
            {v:'v4.3',date:'April 2026', note:'Final polish — decision-grade clinical language across 23 calculators. Clinical Action panel moved above Interpretation in all results. Guideline Version added to governance panel. Generic escalation box removed — escalation guidance embedded within each calculator\'s specific clinical action. Explicit OS/mortality figures added throughout. Direct authoritative language replacing hedged phrasing. Calculators updated: HScore, IPI, FLIPI, ISS, IPSS, IPSS-R, DIPSS, Sokal, PLASMIC, 4Ts, CHA₂DS₂-VASc, HAS-BLED, NCCN-IPI, R-IPI, CNS-IPI, CLL-IPI, SOFA, NEWS2, qSOFA, IPS, GIPSS, IPSET, ELTS. Stat badges now dynamic.'},
            {v:'v4.2',date:'April 2026', note:'Multi-reviewer governance panel: Co-Reviewers row on all tools, SITE_GOVERNANCE statement, Join as Reviewer CTA. Session PDF Export: full patient encounter report from LogPage. Search improvements: author/PMID/purpose matching, category chips, Most Used section. Three new diagnostic modules: lymphadenopathy, splenomegaly, coag screen. Compliance page (DCB0129 lite, privacy, accessibility, version history). Three new calculators: DIPSS-Plus, MIPI, MYSEC-PM.'},
            {v:'v4.1',date:'April 2026', note:'Session Result Log (ward round tool, session-only, no PHI stored). Print/Save PDF per calculator. Progressive Web App: manifest, service worker, install banner. Three new pathways: TTP/TMA Management, Myeloma Response Assessment (IMWG), MGUS/SMM Surveillance. IPSS original (1997), IPSS-M molecular (2022), CHRS, CHIP/CCUS Diagnostic Tool added. Keyboard shortcuts (/, Esc, H, B, L, ?).'},
            {v:'v4.0',date:'Mar 2025', note:'Governance & Evidence panel added to all calculators. Evidence classification system (Validated / Guideline / Derived / Educational) implemented. Editorial Standards page formalised. Per-calculator governance records with population, review dates, and reviewer attribution. Gold-standard calculator template with clinical context strip, tabbed evidence/limitations view, and actionable next steps. Diagnostic modules, acute haematology mode, dark mode, search overlay, and favourites system.'},
            {v:'v3.1',date:'Jan 2025', note:'Transplant, CAR-T, and transfusion medicine tools added (GVHD, VOD, ICE score, irAE, blood volume, iron overload, CCI). Sidebar restructured with collapsible categories.'},
            {v:'v3.0',date:'Nov 2024', note:'Complete architectural redesign as a React/Vite SPA. Clinical pathways launched. Evidence badge system introduced.'},
            {v:'v2.0',date:'Sep 2024', note:'Major content expansion. Malignant haematology scoring systems, coagulation calculators, VTE tools, and acute medicine support added.'},
            {v:'v1.0',date:'Jul 2024', note:'Initial release. Core haematology calculators and basic interface.'},
          ].map(({v,date,note})=>(
            <div key={v} className="flex gap-3">
              <div className="flex-shrink-0 w-14">
                <span className={`text-[11px] font-extrabold ${dark?'text-blue-400':'text-blue-600'}`}>{v}</span>
                <div className={`text-[9px] ${dark?'text-slate-600':'text-slate-400'}`}>{date}</div>
              </div>
              <p className={`text-[11px] leading-relaxed ${hc}`}>{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className={`rounded-2xl border p-5 ${dark?'bg-amber-950/20 border-amber-900/40':'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center gap-2 mb-3"><AlertTriangle size={15} className="text-amber-500"/><span className={`text-xs font-bold uppercase tracking-wider ${dark?'text-amber-400':'text-amber-700'}`}>Medical Disclaimer</span></div>
        <p className={`text-xs leading-relaxed ${dark?'text-amber-200':'text-amber-800'}`}>
          HaemCalc Pro is intended for <strong>educational and clinical decision-support purposes only</strong>. It does not constitute medical advice and does not replace the clinical judgement of a qualified healthcare professional, institutional guidelines, or specialist opinion. All clinical decisions must be made by appropriately trained and registered clinicians in the context of individual patient circumstances, local protocols, and current national guidance. No liability is accepted for clinical outcomes arising from use of this platform. Scoring thresholds and interpretations should be verified against current source publications and the most recent version of applicable guidelines before making treatment decisions.
        </p>
        <p className={`text-[10px] mt-3 font-semibold ${dark?'text-amber-700':'text-amber-600'}`}>
          Registered users in the UK are reminded that clinical decision support tools are adjuncts to, not substitutes for, the professional responsibilities set out by the General Medical Council's Good Medical Practice (2024).
        </p>
      </div>

    </div>
  );
}

// ─── COMPLIANCE & PRIVACY PAGE ────────────────────────────────────────────────
function CompliancePage({dark}){
  const bc=dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200';
  const hc=dark?'text-slate-300':'text-slate-600';
  const head=dark?'text-slate-100':'text-slate-900';

  const Section=({icon:Icon,iconColor,title,children})=>(
    <div className={`rounded-2xl border ${bc} overflow-hidden`}>
      <div className={`px-5 py-3 border-b flex items-center gap-2.5 ${dark?'bg-slate-800/40 border-slate-700':'bg-slate-50 border-slate-100'}`}>
        <Icon size={15} className={iconColor}/>
        <span className={`text-[11px] font-bold uppercase tracking-widest ${dark?'text-slate-300':'text-slate-600'}`}>{title}</span>
      </div>
      <div className={`px-5 py-4 ${dark?'bg-slate-900':'bg-white'}`}>{children}</div>
    </div>
  );

  return(
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24 space-y-5">
      {/* Page header */}
      <div className={`rounded-2xl border ${bc} p-5`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dark?'bg-blue-900/30':'bg-blue-50'}`}>
            <ShieldCheck size={20} className="text-blue-500"/>
          </div>
          <div>
            <h1 className={`text-xl font-extrabold tracking-tight ${head}`}>Compliance &amp; Privacy</h1>
            <p className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>
              HaemCalc Pro v{SITE_VERSION} · Reviewed {CONTENT_DATE}
            </p>
          </div>
        </div>
        <p className={`text-[12px] mt-4 leading-relaxed ${hc}`}>
          This page sets out how HaemCalc Pro is designed and operated to meet NHS digital safety standards, UK data protection law, and WCAG 2.1 accessibility requirements. The platform is a clinical decision-support and educational tool and is not registered as a medical device under UK MDR 2002 / UKCA provisions.
        </p>
      </div>

      {/* DCB0129 Clinical Risk */}
      <Section icon={Shield} iconColor="text-emerald-500" title="Clinical Risk Management (DCB0129 Lite)">
        <div className="space-y-3">
          {[
            {label:'Hazard Identification','value':'All content is reviewed against PubMed-indexed source publications and named guideline bodies (ELN, BSH, NICE, ISTH, ASH, WHO). No calculator or pathway is added without a citable evidence source.'},
            {label:'Risk Classification','value':'HaemCalc Pro is classified as a low-risk decision-support tool. All outputs are labelled as educational only. The platform does not prescribe, order, or administer treatments.'},
            {label:'Clinical Safety Officer','value':REVIEWER},
            {label:'Residual Risk Mitigations','value':'Every calculator carries a "Medical Disclaimer" panel. Results panels include a contextual "next steps" field to prompt clinical correlation. No patient-identifiable data is collected or stored. Session log clears on reload.'},
            {label:'Review Cadence','value':'Annual minimum review cycle. Urgent update triggered by major guideline revision (e.g. ELN AML, BSH TTP). Next scheduled review: April 2027.'},
          ].map(({label,value})=>(
            <div key={label} className={`flex gap-4 py-2 border-b text-xs ${dark?'border-slate-800':'border-slate-100'} last:border-0`}>
              <span className={`w-40 flex-shrink-0 font-semibold ${dark?'text-slate-400':'text-slate-500'}`}>{label}</span>
              <span className={hc}>{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Data Privacy */}
      <Section icon={Lock} iconColor="text-purple-500" title="Data Privacy (UK GDPR / DPA 2018)">
        <div className="space-y-2.5">
          <p className={`text-xs leading-relaxed ${hc}`}>HaemCalc Pro is designed with privacy-by-default. No personal data, patient data, or NHS patient identifiers are collected, processed, or transmitted.</p>
          <div className="space-y-1.5">
            {[
              ['Data collected','None. HaemCalc Pro does not require registration or login.'],
              ['Local storage','Calculator favourites and recent history are stored in browser localStorage only — on your device, not on any server.'],
              ['Session result log','Held in memory (React state) for the duration of your browser session only. Cleared on page reload. Not transmitted or stored.'],
              ['Optional patient reference','Free-text field in the Session Log PDF export. Stored nowhere — present only in the printed/PDF document you generate.'],
              ['Cookies','No tracking cookies. No analytics. No advertising scripts.'],
              ['Third-party services','Lucide React (icon library, client-side only). No external API calls are made during normal use.'],
              ['Data controller','Dr. Muhammad Mohsin (personal educational project). Contact: muhdmohsin@gmail.com'],
            ].map(([k,v])=>(
              <div key={k} className={`flex gap-4 py-1.5 border-b text-xs ${dark?'border-slate-800':'border-slate-100'} last:border-0`}>
                <span className={`w-40 flex-shrink-0 font-semibold ${dark?'text-slate-400':'text-slate-500'}`}>{k}</span>
                <span className={hc}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Accessibility */}
      <Section icon={Globe} iconColor="text-sky-500" title="Accessibility (WCAG 2.1 AA)">
        <p className={`text-xs leading-relaxed mb-3 ${hc}`}>HaemCalc Pro is designed to meet WCAG 2.1 AA accessibility standards. The following provisions are implemented:</p>
        <div className="space-y-1.5">
          {[
            ['Colour contrast','Dark and light modes both maintain ≥4.5:1 text contrast ratio on primary text.'],
            ['Keyboard navigation','All interactive elements are reachable and operable via keyboard. / opens search; Esc closes overlays; H/B/L navigate sections.'],
            ['Text sizing','Base font size 13–14px. All relative units used for text scaling support.'],
            ['Screen reader support','Semantic HTML elements used throughout. Icon-only buttons carry aria-labels or visible text companions.'],
            ['Focus indicators','Visible focus ring retained on all interactive controls.'],
            ['Responsive design','Full functionality maintained from 320 px mobile width to widescreen. No horizontal scroll on content pages.'],
            ['Colour-blind safe','Risk categories use both colour and text labels. Red/amber/green are not the sole indicators of risk level.'],
          ].map(([k,v])=>(
            <div key={k} className={`flex gap-4 py-1.5 border-b text-xs ${dark?'border-slate-800':'border-slate-100'} last:border-0`}>
              <span className={`w-40 flex-shrink-0 font-semibold ${dark?'text-slate-400':'text-slate-500'}`}>{k}</span>
              <span className={hc}>{v}</span>
            </div>
          ))}
        </div>
        <p className={`text-[11px] mt-3 ${dark?'text-slate-500':'text-slate-400'}`}>
          To report an accessibility issue: <a href="mailto:muhdmohsin@gmail.com?subject=HaemCalc%20Accessibility" className="text-blue-500 hover:underline">muhdmohsin@gmail.com</a>
        </p>
      </Section>

      {/* Version History */}
      <Section icon={FileText} iconColor="text-slate-500" title="Version History">
        <div className="space-y-3">
          {[
            {v:'v4.3',date:'April 2026',note:'Decision-grade language across 23 calculators. Clinical Action above Interpretation. Guideline Version in governance. Explicit OS/mortality in all outputs. Direct authoritative language throughout.'},
            {v:'v4.2',date:'April 2026',note:'Multi-reviewer governance panel. Session PDF Export. Search improvements (PMID/guideline/source matching, Most Used). Three diagnostic modules added (lymphadenopathy, splenomegaly, coag screen). This Compliance page. Three new calculators (DIPSS-Plus, MIPI, MYSEC-PM).'},
            {v:'v4.1',date:'April 2026',note:'Session Result Log (ward round, session-only). Print/Save PDF per calculator. PWA install support. Three new clinical pathways (TTP/TMA, Myeloma Response, MGUS/SMM). IPSS, IPSS-M, CHRS, CHIP/CCUS calculators added. Keyboard shortcuts.'},
            {v:'v4.0',date:'Mar 2025',note:'Governance & Evidence panel on all calculators. Evidence classification system. Per-calculator governance records. Diagnostic modules, acute haematology mode, dark mode, search, favourites.'},
            {v:'v3.1',date:'Jan 2025',note:'Transplant, CAR-T, transfusion tools. GVHD, VOD, ICE, irAE, blood volume, iron overload, CCI added.'},
            {v:'v3.0',date:'Nov 2024',note:'React/Vite SPA architecture. Clinical pathways launched. Evidence badge system.'},
            {v:'v2.0',date:'Sep 2024',note:'Malignant haematology scoring, coagulation calculators, VTE tools, acute medicine support.'},
            {v:'v1.0',date:'Jul 2024',note:'Initial release. Core haematology calculators.'},
          ].map(({v,date,note})=>(
            <div key={v} className="flex gap-3">
              <div className="flex-shrink-0 w-14">
                <span className={`text-[11px] font-extrabold ${dark?'text-blue-400':'text-blue-600'}`}>{v}</span>
                <div className={`text-[9px] ${dark?'text-slate-600':'text-slate-400'}`}>{date}</div>
              </div>
              <p className={`text-[11px] leading-relaxed ${hc}`}>{note}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${dark?'bg-slate-900 border-slate-800':'bg-slate-50 border-slate-200'}`}>
        <div className="flex-1">
          <p className={`text-sm font-bold ${head}`}>Questions or concerns?</p>
          <p className={`text-xs mt-0.5 ${hc}`}>For accessibility issues, data privacy queries, or clinical content concerns, contact the platform editor.</p>
        </div>
        <a href="mailto:muhdmohsin@gmail.com?subject=HaemCalc%20Pro%20Compliance%20Query"
          className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
          Contact Dr. Mohsin
        </a>
      </div>

    </div>
  );
}
