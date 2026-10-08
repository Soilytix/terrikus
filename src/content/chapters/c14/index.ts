/**
 * Chapter 14 — What Does the Sample Tell Us? (world-bible §6, capstone). What
 * can be claimed, and how confidently; on the lab instruments in
 * `src/sim/measure.ts` and the claim rules in `src/sim/claims.ts`.
 * Deviations, recorded: the squeezing jar and the honest report are panel
 * benches on `c14-bench` rather than their own `c14-jar` and `c14-report`
 * plates; "Same soil, three labs", "One core or five?" and "What else could
 * explain it?" (c14-m1, m2 and m6 in the world bible) wait for a later pass,
 * and the ghost-DNA mission is folded into the pipeline bench. Mission ids
 * here are this chapter's own and do not follow the world bible's numbering.
 * The lab is generic and the report is a teaching mock-up, never a product.
 */
import type {
  BudgetCase,
  ChapterBundle,
  Choice,
  CodexEntry,
  Fact,
  LabReport,
  Mission,
  ReportBlock,
  ClaimRung,
  Scene,
  Statement,
} from "../../schema";
import { c14, c14Rumors } from "./chapter";

const F = {
  patchy: {
    id: "c14-patchy",
    text: "Soil bacterial communities vary over centimetres as well as metres, so where and how many cores are taken changes the sample.",
    confidence: "firm",
    sources: ["obrien-2016"],
  },
  sieve: {
    id: "c14-sieve",
    text: "Standard soil analyses are run on the fine earth that passes a 2 mm sieve; stones and roots are left out.",
    confidence: "firm",
    sources: ["kellogg-lab-methods"],
  },
  relic: {
    id: "c14-relic",
    text: "Across many soils, about 40 % of the DNA extracted came from dead cells (relic DNA), and it inflated richness estimates by up to 55 %.",
    confidence: "estimate",
    evidence: "measured",
    sources: ["carini-2016"],
  },
  copies: {
    id: "c14-copies",
    text: "Bacteria carry from about 1 to 15 or more copies of the 16S gene per genome. Correcting reads with database estimates of copy number remains unreliable.",
    confidence: "firm",
    sources: ["louca-2018"],
  },
  closed: {
    id: "c14-closed",
    text: "Sequencing returns a fixed number of reads, so it gives each group's share, not its amount. One group's share can rise only if others fall.",
    confidence: "firm",
    sources: ["gloor-2017"],
  },
  spike: {
    id: "c14-spike",
    text: "A known amount of added DNA (a spike-in) lets reads be turned into estimated amounts per gram. The spike has its own extraction and amplification bias.",
    confidence: "firm",
    sources: ["smets-2016"],
    simplification:
      "The bench recovers a fixed 85 % of the spike; a real recovery varies from sample to sample.",
  },
  frames: {
    id: "c14-frames",
    text: "Ratios between groups can show which group rose against another without absolute counts.",
    confidence: "firm",
    sources: ["morton-2019"],
  },
  dormant: {
    id: "c14-dormant",
    text: "Typically only about 0.1–2 % of microbial biomass is active at any moment.",
    confidence: "estimate",
    evidence: "inferred",
    sources: ["blagodatskaya-kuzyakov-2013"],
  },
  predicted: {
    id: "c14-predicted",
    text: "Functions predicted from marker genes are inferences from reference genomes, not measured functions.",
    confidence: "firm",
    sources: ["douglas-2020"],
  },
  indicators: {
    id: "c14-indicators",
    text: "Soil health indicators describe a soil against a reference; they do not by themselves say what to do.",
    confidence: "firm",
    sources: ["lehmann-2020"],
  },
  unknown: {
    id: "c14-unknown",
    text: "Most soil microbes are unnamed and uncultured, and what many of them do is not known.",
    confidence: "firm",
    sources: ["fierer-2017"],
  },
  reference: {
    id: "c14-reference",
    text: "An indicator is read against a reference set of soils. Change the reference set and the same number can read as high or as typical.",
    confidence: "firm",
    sources: ["cornell-cash-manual", "lehmann-2020"],
  },
  depth: {
    id: "c14-depth",
    text: "Organic matter is usually most concentrated near the surface, so a shallower sample of the same soil tends to read higher.",
    confidence: "firm",
    sources: ["weil-brady-2017"],
  },
} satisfies Record<string, Fact>;

const c14Scenes: Scene[] = [
  {
    id: "c14-bench",
    chapter: "c14",
    title: "The lab bench",
    scale: "field",
    recipe: "c14-bench",
    seed: 141,
    scaleBar: { metres: 0.5, label: "50 cm" },
    description:
      "A plain lab bench against a pale wall, drawn in flat lines. Left to right: three soil cores, a sieve with a heap of crumbs, a rack of extraction tubes, a closed PCR block, a tall sequencer with a blank panel, and a glass jar filled to the brim with coloured bands of reads. A shelf of plain bottles runs above.",
    truth: {
      drawnFrom: ["Generic soil and molecular lab equipment"],
      schematic: [
        "The instruments are drawn as simple shapes, not any make or model",
        "The jar of reads stands for a sequencing run; no real lab keeps one",
        "Readouts come from the teaching lab model, not from any lab",
      ],
      invented: ["This lab, its samples and both reports"],
      notSimulated: ["Primer bias", "Contamination", "Bioinformatics choices after sequencing"],
    },
    up: "valley-map",
    objects: [
      {
        id: "cores",
        label: "Soil cores",
        kind: "scan",
        anchor: { x: 0.2, y: 0.6 },
        portrait: { x: 0.2, y: 0.41 },
        scan: "Three cores from one field, taken a few paces apart. Their colour already differs.",
        facts: [F.patchy],
      },
      {
        id: "sieve",
        label: "The sieve",
        kind: "scan",
        anchor: { x: 0.3, y: 0.62 },
        portrait: { x: 0.5, y: 0.43 },
        scan: "Crumbs are pushed through a 2 mm mesh. What passes is now called the sample.",
        facts: [F.sieve],
      },
      {
        id: "tubes",
        label: "Extraction tubes",
        kind: "scan",
        anchor: { x: 0.4, y: 0.6 },
        portrait: { x: 0.8, y: 0.41 },
        scan: "Cells are broken open and their DNA pulled out, along with DNA left behind by cells long dead.",
        facts: [F.relic],
      },
      {
        id: "pcr",
        label: "The PCR block",
        kind: "scan",
        anchor: { x: 0.5, y: 0.6 },
        portrait: { x: 0.2, y: 0.62 },
        scan: "One gene is copied millions of times. Some genomes carry one copy of it, some fifteen.",
        facts: [F.copies],
      },
      {
        id: "sequencer",
        label: "The sequencer",
        kind: "scan",
        anchor: { x: 0.6, y: 0.56 },
        portrait: { x: 0.5, y: 0.6 },
        scan: "It reads a fixed number of sequences, however much DNA went in.",
        facts: [F.closed],
      },
      {
        id: "jar",
        label: "The jar of reads",
        kind: "scan",
        anchor: { x: 0.7, y: 0.59 },
        portrait: { x: 0.8, y: 0.6 },
        scan: "A jar that always fills to the brim. If one band grows, another must shrink.",
        facts: [F.closed, F.spike],
      },
      {
        id: "free-bench",
        label: "The lab bench, free play",
        kind: "portal",
        anchor: { x: 0.45, y: 0.82 },
        to: "#/bench/lab-bench",
        requires: "c14-m2-done",
      },
    ],
    reviewStatus: "draft",
  },
];

/** The ghost question (c14-m1): DNA is not the same as living, active cells. */
const GHOST: Choice[] = [
  {
    id: "relic",
    label: "Not necessarily: its reads came from DNA left by dead cells",
    ok: true,
    feedback:
      "Yes. Remove the free DNA and the group vanishes from the reads. A read shows DNA was there, not that a cell was alive.",
  },
  {
    id: "alive",
    label: "Yes: the sequencer found its DNA",
    ok: false,
    feedback: "Run it again with the free DNA removed first. Does the group stay?",
    misconception: "M23",
  },
  {
    id: "active",
    label: "Yes, and it is active, because its DNA is abundant",
    ok: false,
    feedback: "Most cells in soil at any moment are dormant, and some DNA belongs to no cell at all.",
    misconception: "M23",
  },
];

const STATEMENTS: Statement[] = [
  {
    id: "ph",
    text: "pH 6.4, measured in water with a glass electrode.",
    layer: "measurement",
    feedback: "A reading, with its method. In a salt solution the same soil reads lower.",
  },
  {
    id: "reads",
    text: "20,000 reads, 1,240 of them assigned to spore formers.",
    layer: "measurement",
    feedback: "Counts straight off the sequencer.",
  },
  {
    id: "respiration",
    text: "1.2 mg CO₂-C per kg of soil per day, in a 7-day lab incubation.",
    layer: "measurement",
    feedback: "Measured, under lab conditions that are part of the result.",
  },
  {
    id: "per-gram",
    text: "Spore-former gene copies per gram, from their reads divided by spike reads times the spike added.",
    layer: "derived",
    feedback: "Calculated from measurements with a formula you can see.",
  },
  {
    id: "stock",
    text: "Carbon stock of 42 t/ha to 30 cm, from carbon concentration × bulk density × depth.",
    layer: "derived",
    feedback: "Three measurements combined. Each one's error carries into it.",
  },
  {
    id: "indicator",
    text: "This field's organic carbon sits in the top quarter of fields on the same soil type.",
    layer: "derived",
    feedback:
      "An indicator: it describes the field against a reference set. It does not say why, or what to do.",
  },
  {
    id: "stress",
    text: "The rise in the share of spore formers suggests the community went through a stress.",
    layer: "interpretation",
    feedback: "A reading of the evidence, worded as one. Other explanations stay open.",
  },
  {
    id: "fewer-active",
    text: "The lower respiration after the drought most likely means fewer active microbes.",
    layer: "interpretation",
    feedback: "Likely, not shown. Less food would lower respiration too.",
  },
  {
    id: "function",
    text: "A function-prediction tool estimates that the community carries nitrification genes.",
    layer: "prediction",
    feedback: "Inferred from reference genomes. Nobody measured nitrification.",
  },
  {
    id: "yield-model",
    text: "A model expects this field to yield 5–10 % less in a dry year.",
    layer: "prediction",
    feedback: "A model predicts, and its range matters. An indicator would only describe.",
  },
  {
    id: "resample",
    text: "Sample again after rewetting, with five cores and a spike-in, before changing anything on the field.",
    layer: "recommendation",
    feedback: "What to do next. Measuring before acting is a recommendation too.",
  },
  {
    id: "residue",
    text: "Leave the residue on this field and check aggregate stability next spring.",
    layer: "recommendation",
    feedback: "An action, with a check on whether it worked.",
  },
];

const LADDER: ClaimRung[] = [
  {
    id: "detection",
    evidence: "Reads of the group in a sequencing run",
    claim: "The group's DNA is in this sample.",
    overclaim: "Overclaim: no reads of the group were found.",
  },
  {
    id: "abundance",
    evidence: "Amounts per gram from a spike-in or a counted standard",
    claim: "There is more of the group per gram than before.",
    overclaim: "Overclaim: reads give shares, not amounts. A larger share is not a larger amount.",
  },
  {
    id: "activity",
    evidence: "A rate of the process measured on the soil",
    claim: "The process the group can carry out is running faster in this soil.",
    overclaim: "Overclaim: DNA includes dormant and dead cells. Nothing measured the process.",
  },
  {
    id: "controlled",
    evidence: "A controlled test where only the treatment differs",
    claim: "In a controlled test, the treatment raised the rate.",
    overclaim: "Overclaim: moving together is not cause. Nothing held everything else equal.",
  },
  {
    id: "field",
    evidence: "Field trials across sites and seasons",
    claim: "The treatment raises the rate in fields like this across sites and years.",
    overclaim: "Overclaim: one test is one place and one season. Fields differ.",
  },
];

const CASES: BudgetCase[] = [
  {
    id: "detected",
    scenario:
      "A sequencing run of one field finds reads of a group of ammonia oxidisers. That is all the lab has.",
    held: ["detection"],
  },
  {
    id: "spiked",
    scenario:
      "Five pooled cores, sequenced with a spike-in before and after a cover crop. The ammonia oxidisers' copies per gram rose.",
    held: ["detection", "abundance"],
  },
  {
    id: "pots",
    scenario:
      "As above, plus a nitrification rate measured in incubations, plus a pot test: soil given cover-crop residue nitrified faster than the same soil without. One soil, one season.",
    held: ["detection", "abundance", "activity", "controlled"],
  },
];

const REPORTS: LabReport[] = [
  {
    id: "a",
    title: "Report A",
    result: "Organic carbon 3.4 %: high, in the top quarter of the benchmark.",
    benchmark: "Benchmark: fields across the region, all soil types.",
    method: ["One core per field", "Sampled 0–10 cm deep", "Spring, before sowing"],
  },
  {
    id: "b",
    title: "Report B",
    result: "Organic carbon 2.1 %: typical, in the middle of the benchmark.",
    benchmark: "Benchmark: arable fields on the same clay soil.",
    method: ["Ten cores pooled", "Sampled 0–30 cm deep", "Spring, before sowing"],
  },
];

const DISAGREE: Choice[] = [
  {
    id: "method",
    label: "They sampled to different depths and read the number against different sets of fields",
    ok: true,
    feedback:
      "Yes. The soil is the same; the depth and the benchmark are not. Each report is true about its own sample and its own reference.",
  },
  {
    id: "changed",
    label: "The field's carbon changed between the two visits",
    ok: false,
    feedback: "Both sampled the same spring. Read the method lines side by side: what differs?",
  },
  {
    id: "mistake",
    label: "One of the labs made a mistake",
    ok: false,
    feedback:
      "Each followed its own method. What would you have to fix before the two numbers could be compared?",
    misconception: "M22",
  },
];

/** The honest report on the drought samples (c14-m5): one block per tier. */
const BLOCKS: ReportBlock[] = [
  {
    id: "share",
    tier: "measured",
    text: "Spore formers made up a larger share of the reads after the drought than before.",
    benchmark: [
      {
        id: "before",
        label: "The same field before the drought, by the same method",
        ok: true,
        feedback: "Same field, same method: only the drought differs.",
      },
      {
        id: "national",
        label: "A national survey that used a different extraction",
        ok: false,
        feedback: "Then a difference could be the extraction, not the field.",
      },
      {
        id: "none",
        label: "None needed: the number speaks for itself",
        ok: false,
        feedback: "Without a reference, a share is neither high nor low.",
      },
    ],
    confidence: [
      {
        id: "moderate",
        label: "Moderate: five pooled cores per date, one season",
        ok: true,
        feedback: "Pooled cores narrow the spread; one season is still one season.",
      },
      {
        id: "certain",
        label: "Certain: it is a lab measurement",
        ok: false,
        feedback:
          "A lab number is the truth about that sample, by that method. Another set of cores would differ.",
      },
    ],
    provenance: [
      {
        id: "method",
        label: "Five cores, 0–10 cm, pooled; free DNA removed; 20,000 reads; same lab both dates",
        ok: true,
        feedback: "Another lab could repeat it from this line.",
      },
      {
        id: "lab",
        label: "Lab result",
        ok: false,
        feedback: "Which cores, how deep, which method? Nobody could repeat it from this.",
      },
    ],
  },
  {
    id: "amount",
    tier: "derived",
    text: "Spore-former gene copies per gram fell after the drought (reads ÷ spike reads × spike added).",
    benchmark: [
      {
        id: "before",
        label: "The same field before the drought, with the same spike",
        ok: true,
        feedback: "Same spike, same method: the direction can be compared.",
      },
      {
        id: "others",
        label: "The other groups in the same sample",
        ok: false,
        feedback: "That is a share again. The spike was added to get away from shares.",
      },
    ],
    confidence: [
      {
        id: "direction",
        label: "Moderate for the direction, low for the size: the spike has its own bias",
        ok: true,
        feedback:
          "Yes. A biased spike moves both dates alike, so the direction holds better than the number.",
      },
      {
        id: "exact",
        label: "High: absolute counts are exact",
        ok: false,
        feedback: "The spike is extracted and amplified too, with its own losses.",
      },
    ],
    provenance: [
      {
        id: "formula",
        label: "Known spike added before extraction; formula shown above",
        ok: true,
        feedback: "Anyone can check the arithmetic.",
      },
      {
        id: "estimated",
        label: "Estimated",
        ok: false,
        feedback: "Estimated how? Show the formula and what went into it.",
      },
    ],
  },
  {
    id: "survived",
    tier: "interpreted",
    text: "Spore formers survived the drought better than the other groups did.",
    benchmark: [
      {
        id: "blocks",
        label: "Read against the share and the amount above, both against the same field before",
        ok: true,
        feedback: "The interpretation rests on the two blocks above, and says so.",
      },
      {
        id: "elsewhere",
        label: "A report from a different field",
        ok: false,
        feedback: "Different soil, different history: it cannot stand in for this field.",
      },
    ],
    confidence: [
      {
        id: "low",
        label: "Low to moderate: DNA does not show which cells are alive",
        ok: true,
        feedback: "Yes. Dead cells' DNA lingers, and dormant cells are counted with active ones.",
      },
      {
        id: "high",
        label: "High: the data show it",
        ok: false,
        feedback: "The data show DNA amounts. Survival is a reading of them.",
        misconception: "M23",
      },
    ],
    provenance: [
      {
        id: "inferred",
        label: "Inferred from the two blocks above; not measured directly",
        ok: true,
        feedback: "Honest about what kind of statement it is.",
      },
      {
        id: "measured",
        label: "Measured",
        ok: false,
        feedback: "Nothing measured survival. Which tier is this block?",
      },
    ],
  },
  {
    id: "next",
    tier: "would-measure",
    text: "If spore formers survived better, then their living cells would fall less than other groups' after a drought, because their spores resist drying. Count living cells, free DNA removed, before and after the next dry spell.",
    benchmark: [
      {
        id: "own",
        label: "Each group's own count before the dry spell",
        ok: true,
        feedback: "Each group against itself: no shares involved.",
      },
      {
        id: "none",
        label: "None: it is only a plan",
        ok: false,
        feedback: "A plan still needs to say what it will compare against, or its result will mean nothing.",
      },
    ],
    confidence: [
      {
        id: "untested",
        label: "Not yet known: this is a test to run",
        ok: true,
        feedback: "We cannot tell yet; measure this. That is a legitimate answer.",
      },
      {
        id: "high",
        label: "High: it is what the reads already suggest",
        ok: false,
        feedback: "A test that already knows its answer is not a test.",
      },
    ],
    provenance: [
      {
        id: "proposed",
        label: "Proposed next step; nothing measured yet",
        ok: true,
        feedback: "Clear about where it stands.",
      },
      {
        id: "file",
        label: "Results on file",
        ok: false,
        feedback: "There are none yet. Say so.",
      },
    ],
  },
];

const c14Missions: Mission[] = [
  {
    id: "c14-m1",
    chapter: "c14",
    title: "From soil to reads",
    tier: "T3",
    learningObjective:
      "The sample is the first measurement, and each step from core to reads loses or adds something; DNA includes dormant and dead cells.",
    misconceptionsTargeted: ["M23"],
    scene: "c14-bench",
    steps: [
      {
        kind: "notice",
        text: "Two reports about the same field disagree. Before reading either, follow one sample through the lab.",
      },
      {
        kind: "scan",
        text: "Look at each station on the bench, from the cores to the sequencer.",
        objects: ["cores", "sieve", "tubes", "pcr", "sequencer"],
      },
      {
        kind: "sample",
        bench: "pipeline",
        text: "Send one sample through the lab. Then send it again with the free DNA removed first.",
        resultText:
          "Each step changed the sample: cores caught a patch of the field, extraction missed some cells and picked up DNA from dead ones, and the sequencer returned the same number of reads either way. Last season's bloom was in the reads only while dead cells' DNA came along.",
        facts: [F.patchy, F.relic, F.copies],
      },
      {
        kind: "explain-choice",
        id: "c14-m1-ghost",
        question: "Last season's bloom showed up in the reads. Is it alive in the field?",
        choices: GHOST,
      },
      {
        kind: "discover",
        text: "A lab number is the truth about that sample, by that method.",
        discoveries: ["d-c14-method"],
        codex: ["cx-c14-pipeline"],
      },
    ],
    sources: [
      "obrien-2016",
      "kellogg-lab-methods",
      "carini-2016",
      "louca-2018",
      "blagodatskaya-kuzyakov-2013",
    ],
    simplificationNotes: [
      "The community is five groups with teaching values: copy numbers inside the 1–15 range and relic DNA near the 40 % average.",
      "Primer bias, contamination and the choices made after sequencing are left out.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c14-m2",
    chapter: "c14",
    title: "The squeezing jar",
    tier: "T4",
    learningObjective:
      "Sequencing gives relative composition; a spike-in estimates amounts, with its own bias.",
    misconceptionsTargeted: ["M24"],
    scene: "c14-bench",
    steps: [
      {
        kind: "predict-choice",
        id: "c14-m2-predict",
        question:
          "After a drought, spore formers make up a larger share of the reads. What happened to the spore formers in the soil?",
        choices: [
          {
            id: "grew",
            label: "They grew",
            ok: false,
            feedback: "Keep this prediction. The jar will show shares; the spike-in will show amounts.",
            misconception: "M24",
          },
          {
            id: "fell-less",
            label: "They may have fallen, just less than the others",
            ok: true,
            feedback: "Keep this prediction. The jar will show shares; the spike-in will show amounts.",
          },
          {
            id: "cannot",
            label: "The shares alone cannot tell",
            ok: true,
            feedback: "Keep this prediction. The jar will show shares; the spike-in will show amounts.",
          },
        ],
      },
      {
        kind: "sample",
        bench: "jar",
        text: "Read the field before and after the drought. Then add a known amount of spike to both samples.",
        resultText:
          "Every group had fewer living cells after the drought; spore formers lost the least. In a jar that always fills, their share rose while their amount fell.",
        facts: [F.closed, F.spike, F.frames],
      },
      {
        kind: "explain-choice",
        id: "c14-m2-why",
        question: "Why did the spore formers' share rise while their amount fell?",
        choices: [
          {
            id: "closure",
            label: "The other groups fell further, and the reads always add up to the same total",
            ok: true,
            feedback: "Yes. A share is relative to everything else in the jar.",
          },
          {
            id: "error",
            label: "The sequencer miscounted",
            ok: false,
            feedback: "The counts were fine. Look at what the total of the reads does before and after.",
          },
          {
            id: "grew",
            label: "They grew, and the spike-in is wrong",
            ok: false,
            feedback:
              "The spike has a bias, but it is the same at both dates. Which way does it say they moved?",
            misconception: "M24",
          },
        ],
      },
      {
        kind: "discover",
        text: "Relative is not absolute.",
        discoveries: ["d-c14-relative"],
        codex: ["cx-c14-jar"],
      },
    ],
    sources: ["gloor-2017", "smets-2016", "morton-2019"],
    simplificationNotes: [
      "The drought keeps 60 % of spore formers and 20 % of every other group: teaching values.",
      "The spike is recovered at a fixed 85 %; a real recovery varies.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c14-m3",
    chapter: "c14",
    title: "Sort the statement",
    tier: "T4",
    learningObjective:
      "Measurement, derived evidence, interpretation, prediction and recommendation are kept apart; indicators describe, models predict.",
    misconceptionsTargeted: ["M22"],
    scene: "c14-bench",
    steps: [
      {
        kind: "sample",
        bench: "layers",
        text: "Twelve statements from soil reports. Put each into its layer.",
        resultText:
          "Measurements carry a method; derived numbers carry a formula; interpretations say how sure they are; predictions come from a model; recommendations say what to do. An indicator describes a field against a reference. It does not predict, and it does not say what to do.",
        facts: [F.indicators, F.predicted],
        statements: STATEMENTS,
      },
      {
        kind: "explain-choice",
        id: "c14-m3-indicator",
        question: "A field's indicator is in the bottom quarter of its benchmark. What does that tell you?",
        choices: [
          {
            id: "describes",
            label: "Where the field sits against those fields, by that method; not why, and not what to do",
            ok: true,
            feedback: "Yes. It is a description. Why, and what to do, need more evidence.",
          },
          {
            id: "act",
            label: "Which practice to change",
            ok: false,
            feedback: "Which practice? The indicator does not say what put the field there.",
            misconception: "M22",
          },
          {
            id: "yield",
            label: "That next year's yield will be low",
            ok: false,
            feedback: "That is a prediction, and an indicator is not a model.",
            misconception: "M22",
          },
        ],
      },
      {
        kind: "discover",
        text: "Indicators describe; models predict.",
        discoveries: ["d-c14-layers"],
        codex: ["cx-c14-layers"],
      },
    ],
    sources: ["lehmann-2020", "douglas-2020"],
    simplificationNotes: ["The twelve statements are invented examples, not from any real report."],
    reviewStatus: "draft",
  },
  {
    id: "c14-m4",
    chapter: "c14",
    title: "Claim budget",
    tier: "T4",
    learningObjective:
      "Each rung of the evidence ladder is a different claim; write the strongest claim the evidence supports, and no stronger.",
    misconceptionsTargeted: ["M25", "M23"],
    scene: "c14-bench",
    steps: [
      {
        kind: "sample",
        bench: "budget",
        text: "Three cases, each with its evidence. For each, choose the strongest claim the evidence supports.",
        resultText:
          "Every case allowed a claim, and each claim was smaller than the exciting one. No case reached field trials across sites, so none could say the treatment works in fields like yours.",
        facts: [F.dormant, F.closed, F.unknown],
        ladder: LADDER,
        cases: CASES,
      },
      {
        kind: "discover",
        text: "The strongest honest claim is often smaller than the exciting one.",
        discoveries: ["d-c14-budget"],
        codex: ["cx-c14-ladder"],
      },
    ],
    sources: ["blagodatskaya-kuzyakov-2013", "gloor-2017", "fierer-2017"],
    simplificationNotes: [
      "The ladder has five rungs; real evidence is messier, and a rung can be reached by more than one kind of study.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c14-m5",
    chapter: "c14",
    title: "Two reports disagree",
    tier: "T4",
    learningObjective:
      "Every result carries a benchmark, a confidence and a provenance; two true numbers can disagree because of how they were made.",
    misconceptionsTargeted: ["M22"],
    scene: "c14-bench",
    steps: [
      {
        kind: "sample",
        bench: "reports",
        text: "Here are the two reports about the same field. Open how each was measured.",
        resultText:
          "Same field, same spring. Report A took one shallow core and compared it with every soil in the region; Report B pooled ten cores to 30 cm and compared them with fields on the same clay.",
        facts: [F.depth, F.reference],
        reports: REPORTS,
      },
      {
        kind: "explain-choice",
        id: "c14-m5-why",
        question: "Why do the two reports disagree?",
        choices: DISAGREE,
      },
      {
        kind: "sample",
        bench: "report",
        text: "Now write a small honest report on the drought samples. A block goes in only once it carries a benchmark, a confidence and a provenance.",
        resultText:
          "Four blocks, each with its tier, its benchmark, how sure it is and where it came from. The last says what is not known yet and how to find out.",
        facts: [F.reference, F.spike, F.relic],
        blocks: BLOCKS,
      },
      {
        kind: "discover",
        text: "The two reports differ by sampling depth and benchmark, not by soil.",
        discoveries: ["d-c14-reports"],
        codex: ["cx-c14-report"],
        onComplete: { rumors: { "r-c14": "explained" } },
      },
    ],
    sources: ["weil-brady-2017", "cornell-cash-manual", "lehmann-2020"],
    simplificationNotes: [
      "Both reports and their numbers are invented teaching values.",
      "The report is a teaching mock-up, not a real report format and not any company's product.",
    ],
    reviewStatus: "draft",
  },
];

const c14Codex: CodexEntry[] = [
  {
    id: "cx-c14-pipeline",
    title: "From soil to reads",
    chapter: "c14",
    body: [
      "A sample is taken somewhere, at some depth, as some number of cores. Sieving, extraction, PCR and sequencing each lose or add something on the way to the reads.",
      "DNA from dead cells comes along, genomes carry different numbers of the gene read, and the sequencer returns a fixed number of reads. A lab number is the truth about that sample, by that method.",
    ],
    facts: [F.patchy, F.sieve, F.relic, F.copies],
    reviewStatus: "draft",
  },
  {
    id: "cx-c14-jar",
    title: "The squeezing jar",
    chapter: "c14",
    body: [
      "Sequencing fills a jar of fixed size. If one group's band grows, others must shrink, whatever happened in the soil.",
      "A spike-in of known size turns shares into estimated amounts, and ratios between groups can show direction. Neither is free of bias.",
    ],
    facts: [F.closed, F.spike, F.frames],
    reviewStatus: "draft",
  },
  {
    id: "cx-c14-layers",
    title: "Five layers of a result",
    chapter: "c14",
    body: [
      "A measurement, a number derived from it, an interpretation, a model's prediction and a recommendation are five different statements. An honest report keeps them apart.",
      "Indicators describe a soil against a reference. Models predict. Predicted functions are not measured functions.",
    ],
    facts: [F.indicators, F.predicted],
    reviewStatus: "draft",
  },
  {
    id: "cx-c14-ladder",
    title: "The evidence ladder",
    chapter: "c14",
    body: [
      "Detection, amount, activity, effect in a controlled test, effect in field trials across environments: each rung is a different claim, and each needs its own evidence.",
      "We cannot tell yet; measure this, is a legitimate answer.",
    ],
    facts: [F.dormant, F.closed, F.unknown],
    reviewStatus: "draft",
  },
  {
    id: "cx-c14-report",
    title: "An honest report",
    chapter: "c14",
    body: [
      "Every result carries a benchmark, a confidence and a provenance. Without the benchmark it is neither high nor low; without the confidence it sounds surer than it is; without the provenance nobody can repeat it.",
      "Two reports on one field disagreed because they sampled to different depths and compared against different fields. Both were true about their own samples.",
    ],
    facts: [F.depth, F.reference],
    simplification: "The report builder is a teaching mock-up, not a real report format.",
    reviewStatus: "draft",
  },
];

export const c14Bundle: ChapterBundle = {
  chapter: c14,
  scenes: c14Scenes,
  missions: c14Missions,
  codex: c14Codex,
  rumors: c14Rumors,
};
