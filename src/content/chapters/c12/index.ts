/**
 * Chapter 12 — Fields and Seasons (world-bible §6). Management acts through
 * the mechanisms of earlier chapters, and outcomes are G×E×M; on the rules in
 * `src/sim/twin-fields.ts` and `src/sim/compaction.ts`.
 * Deviations, recorded: the season wheel is a panel bench on `c12-twin-fields`
 * rather than its own `c12-season-wheel` plate; the two expected cause chains
 * and the indicator-versus-model lens playground wait for a later pass.
 */
import type { ChapterBundle, CodexEntry, Fact, Mission, OpenQuestion, Scene } from "../../schema";
import { c12, c12Rumors } from "./chapter";

const F = {
  aggregates: {
    id: "c12-aggregates",
    text: "Tillage breaks aggregates apart and exposes the organic matter they protected to decomposers.",
    confidence: "firm",
    sources: ["six-2004"],
  },
  cover: {
    id: "c12-cover-nitrate",
    text: "Cover crops grown in place of a bare winter fallow take up nitrate that would otherwise leach; non-legume covers cut leaching more than legumes.",
    confidence: "estimate",
    sources: ["tonitto-2006"],
    simplification:
      "The bench cuts leaching by a fixed share per cover; real cuts vary with growth and weather.",
  },
  rotation: {
    id: "c12-rotation",
    text: "A crop grown too often in the same field tends to yield less than in a longer rotation; soil-borne pathogens and plant–soil feedbacks are part of the cause.",
    confidence: "firm",
    sources: ["bennett-2012", "van-der-putten-2013"],
    simplification: "The bench folds every cause of rotation yield decline into one disease index.",
  },
  pittelkow: {
    id: "c12-pittelkow",
    text: "Across 5,463 paired comparisons, no-till yielded on average about 5.7 % less than conventional tillage. In dry climates, with residue kept and crops rotated, the gap closed or reversed.",
    confidence: "firm",
    evidence: "measured",
    sources: ["pittelkow-2015"],
  },
  gxexm: {
    id: "c12-gxexm",
    text: "Outcomes depend on genotype, environment and management together (G×E×M): the same practice can help in one field and hurt in the next.",
    confidence: "firm",
    sources: ["pittelkow-2015", "ogle-2019"],
  },
  ogle: {
    id: "c12-ogle",
    text: "Whether no-till stores carbon depends on climate and soil: gains in some places, little or none in others.",
    confidence: "firm",
    sources: ["ogle-2019"],
  },
  redistribution: {
    id: "c12-redistribution",
    text: "Much of the extra carbon found near the surface under no-till is carbon that ploughing would have placed deeper. Sampled to depth, the gain is often small.",
    confidence: "estimate",
    sources: ["powlson-2014", "ogle-2019"],
    simplification: "The bench has two depths, 0–10 cm and 10–60 cm, and ignores carbon below 60 cm.",
  },
  esm: {
    id: "c12-esm",
    text: "A fair stock comparison samples the whole rooted profile and compares an equivalent soil mass, because tillage changes how dense the soil is.",
    confidence: "firm",
    sources: ["powlson-2014"],
  },
  poeplau: {
    id: "c12-poeplau",
    text: "A meta-analysis of field studies estimated that cover crops add about 0.32 ± 0.08 t of carbon per hectare a year to the topsoil.",
    confidence: "contested",
    evidence: "measured",
    sources: ["poeplau-don-2015"],
  },
  chaplot: {
    id: "c12-chaplot",
    text: "A later analysis argues that cover-crop carbon gains are much smaller than claimed, because of how many studies sampled and compared stocks.",
    confidence: "contested",
    sources: ["chaplot-smith-2023"],
  },
  wetWheel: {
    id: "c12-wet-wheel",
    text: "The same wheel compacts wet soil more than dry soil. The large pores collapse first, so water and air move more slowly and rain ponds.",
    confidence: "firm",
    sources: ["hamza-anderson-2005", "keller-2019"],
  },
  heavier: {
    id: "c12-heavier",
    text: "Farm machinery has grown much heavier over the last century, and wheel stresses now reach the subsoil, where compaction can persist for decades.",
    confidence: "estimate",
    sources: ["keller-2019", "hamza-anderson-2005"],
  },
  roots: {
    id: "c12-roots",
    text: "Root elongation is strongly restricted once penetrometer resistance passes about 2 MPa.",
    confidence: "firm",
    sources: ["bengough-2011"],
  },
  rip: {
    id: "c12-rip",
    text: "Deep ripping can loosen a compacted layer, but loosened soil compacts again if heavy traffic on wet soil continues.",
    confidence: "estimate",
    sources: ["hamza-anderson-2005"],
  },
  drainage: {
    id: "c12-drainage",
    text: "Poor drainage keeps soil wet and short of oxygen. That favours microbes that live without air, and it stresses roots.",
    confidence: "firm",
    sources: ["keiluweit-2017", "weil-brady-2017"],
  },
  shares: {
    id: "c12-shares",
    text: "Sequencing gives each group's share of the reads, not its amount. A share can rise because other groups fell.",
    confidence: "firm",
    sources: ["gloor-2017"],
  },
  indicators: {
    id: "c12-indicators",
    text: "Soil health indicators describe a soil against a reference; they do not by themselves say what to do.",
    confidence: "firm",
    sources: ["lehmann-2020"],
  },
} satisfies Record<string, Fact>;

const COVER_SOC: OpenQuestion = {
  claim: "How much carbon do cover crops add to soil?",
  sides: [
    "About 0.32 ± 0.08 t C per hectare a year in the topsoil, from a meta-analysis of field studies (Poeplau & Don 2015).",
    "Much less than claimed, once how the studies sampled and compared stocks is accounted for (Chaplot & Smith 2023).",
  ],
  sources: ["poeplau-don-2015", "chaplot-smith-2023"],
};

const c12Scenes: Scene[] = [
  {
    id: "c12-twin-fields",
    chapter: "c12",
    title: "Twin fields",
    scale: "field",
    recipe: "c12-twin-fields",
    seed: 97,
    scaleBar: { metres: 20, label: "20 m" },
    notToScale: 20,
    description:
      "Two spinach fields side by side under one sky, split by a grass track. The left field is freshly ploughed into bare furrows; the right still wears last winter's cover crop as a brown mulch. Below the surface a cutaway runs under both: crumbs, roots and worm channels, looser and darker under the mulch.",
    truth: {
      drawnFrom: ["Tillage and cover-crop field trials as photographed and described in the literature"],
      schematic: [
        "The cutaway is drawn about 20× deeper than the fields around it",
        "Readouts come from the twin-fields teaching model, not from any trial",
      ],
      invented: ["These two fields, their history and their weather"],
      notSimulated: ["Weeds", "Pests above ground", "Day-to-day weather"],
    },
    up: "valley",
    objects: [
      {
        id: "subject-field",
        label: "The ploughed field",
        kind: "scan",
        anchor: { x: 0.25, y: 0.45 },
        scan: "Bare furrows, turned a hand's depth. Last year's residue is buried under the slice.",
        facts: [F.aggregates],
      },
      {
        id: "comparison-field",
        label: "The field under mulch",
        kind: "scan",
        anchor: { x: 0.62, y: 0.45 },
        scan: "Brown stems of a grass cover crop lie on the surface. Nobody has turned this soil this year.",
        facts: [F.cover],
      },
      {
        id: "below",
        label: "Under both fields",
        kind: "scan",
        anchor: { x: 0.5, y: 0.8 },
        scan: "Under the furrows, crumbs are broken and the worm channels cut. Under the mulch, channels run unbroken from the surface.",
        facts: [F.aggregates, F.redistribution],
      },
      {
        id: "wheel-portal",
        label: "Down to a wheel track",
        kind: "portal",
        anchor: { x: 0.5, y: 0.55 },
        to: "c12-wheel",
        requires: "c12-m3-done",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c12-wheel",
    chapter: "c12",
    title: "Under the wheel",
    scale: "aggregate",
    recipe: "c12-wheel",
    seed: 101,
    scaleBar: { metres: 0.05, label: "5 cm" },
    description:
      "A slice of soil under a tractor tyre. To the left, loose crumbs with wide dark pores between them. Under the tyre the crumbs are pressed into flat plates with almost no pores. Lower down a dense, pale band runs across the slice, and a root that grew down to it turns sideways along its top.",
    truth: {
      drawnFrom: ["Compacted soil and plough-pan descriptions and thin-section images"],
      schematic: [
        "The tyre, the crumbs and the pan are drawn in one frame at very different true depths",
        "Pore sizes follow the compaction teaching model",
      ],
      invented: ["This slice and this wheel"],
      notSimulated: ["Water flow through the pores", "Freeze–thaw and worms loosening the soil again"],
    },
    up: "c12-twin-fields",
    objects: [
      {
        id: "loose",
        label: "Crumbs beside the track",
        kind: "scan",
        anchor: { x: 0.2, y: 0.45 },
        scan: "Rounded crumbs with dark gaps between them, wide enough for water to drain and air to follow.",
        facts: [F.wetWheel],
      },
      {
        id: "track",
        label: "Under the tyre",
        kind: "scan",
        anchor: { x: 0.62, y: 0.4 },
        scan: "The crumbs are pressed into flat plates. The wide gaps are gone; only fine pores remain.",
        facts: [F.wetWheel, F.heavier],
      },
      {
        id: "pan",
        label: "The dense band below",
        kind: "scan",
        anchor: { x: 0.5, y: 0.72 },
        scan: "A plough pan: years of wheels and the plough's sole pressed this band dense.",
        facts: [F.roots, F.heavier],
      },
      {
        id: "root",
        label: "A root at the pan",
        kind: "scan",
        anchor: { x: 0.3, y: 0.66 },
        scan: "The root grew straight down, met the band and turned to run along its top.",
        facts: [F.roots],
      },
      {
        id: "fields-portal",
        label: "Back up to the fields",
        kind: "portal",
        anchor: { x: 0.2, y: 0.24 },
        to: "c12-twin-fields",
      },
    ],
    reviewStatus: "draft",
  },
];

const SEASON = [
  {
    id: "sow",
    label: "Sow spinach",
    below: "Roots push between the crumbs; sugars leaking from them wake the microbes nearby.",
  },
  {
    id: "harvest",
    label: "Harvest",
    below: "The roots stop feeding the soil around them. Dead roots and leaves become food for decomposers.",
  },
  {
    id: "plough",
    label: "Plough",
    below:
      "Hyphae tear, crumbs break and worm channels are cut. Carbon the crumbs protected is suddenly within reach.",
  },
  {
    id: "cover",
    label: "Sow a cover crop",
    below:
      "New roots and hyphae grow through the winter and take up nitrate before the rain carries it down.",
  },
  {
    id: "end-cover",
    label: "End the cover crop",
    below:
      "Its residue lies on the surface as a mulch. Microbes borrow nitrogen to eat it, and worms pull it down.",
  },
  {
    id: "wheels",
    label: "Spread manure on wet ground",
    below: "The wheels press the wet soil flat in their tracks. The big pores close and stay closed.",
  },
];

const c12Missions: Mission[] = [
  {
    id: "c12-m1",
    chapter: "c12",
    title: "Twin fields",
    tier: "T2",
    learningObjective:
      "Tillage, cover crops, rotation and traffic each act through a mechanism met in earlier chapters; change one practice and compare.",
    misconceptionsTargeted: [],
    scene: "c12-twin-fields",
    steps: [
      {
        kind: "fields",
        bench: "season",
        text: "Turn the field's year once round and watch what happens below.",
        resultText:
          "Every field operation reaches underground: roots feed microbes, the plough tears hyphae and crumbs, covers catch nitrate, wheels close pores.",
        facts: [F.aggregates, F.cover],
        events: SEASON,
      },
      {
        kind: "fields",
        bench: "twin",
        text: "Two fields, one weather. Change one practice on the first field, keep the second as it is, and run ten years.",
        resultText:
          "One change, and every difference between the fields traces back to it: through crumbs, through nitrate, or through what builds up when the same crop comes back.",
        facts: [F.aggregates, F.cover, F.rotation],
      },
      {
        kind: "explain-choice",
        id: "c12-m1-one",
        question: "Why change only one practice at a time?",
        choices: [
          {
            id: "trace",
            label: "So any difference between the fields can be traced to that practice",
            ok: true,
            feedback: "Yes. Change two at once and the fields cannot say which one did it.",
          },
          {
            id: "others",
            label: "Because the other practices do not matter",
            ok: false,
            feedback: "Try changing the rotation instead. Did nothing move?",
          },
          {
            id: "biggest",
            label: "To get the biggest effect",
            ok: false,
            feedback: "Several changes at once might move more. Would you know which one moved it?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Each practice works through a mechanism.",
        discoveries: ["d-c12-mechanism"],
        codex: ["cx-c12-mechanisms"],
      },
    ],
    sources: ["six-2004", "tonitto-2006", "bennett-2012", "van-der-putten-2013"],
    simplificationNotes: [
      "Ten years compressed into a slider; every year has the same weather.",
      "Readouts are teaching indices, not field measurements.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c12-m2",
    chapter: "c12",
    title: "Context flips the answer",
    tier: "T3",
    learningObjective:
      "Outcomes are G×E×M: the same management change can raise yield in one environment and lower it in another.",
    misconceptionsTargeted: [],
    scene: "c12-twin-fields",
    steps: [
      {
        kind: "predict-choice",
        id: "c12-m2-predict",
        question: "A farm switches from ploughing to reduced tillage. What happens to yield?",
        choices: [
          { id: "depends", label: "It depends on the field", ok: true, feedback: "Run it in four fields." },
          { id: "up", label: "It rises", ok: false, feedback: "Run it in four fields." },
          { id: "down", label: "It falls", ok: false, feedback: "Run it in four fields." },
        ],
      },
      {
        kind: "fields",
        bench: "flip",
        text: "Make the same change in four fields: a dry or a humid climate, on sand or on clay.",
        resultText:
          "In the dry fields reduced tillage yielded more; in the humid ones, less, and least on clay. Same change, opposite sign.",
        facts: [F.pittelkow, F.gxexm],
      },
      {
        kind: "explain-choice",
        id: "c12-m2-why",
        question: "Why did the sign flip?",
        choices: [
          {
            id: "water",
            label:
              "In a dry climate the surface residue keeps water in; in a humid one, on clay, the soil stays wet and cold",
            ok: true,
            feedback: "That is the mechanism the bench uses, and the pattern the field comparisons found.",
          },
          {
            id: "noise",
            label: "The model is noisy",
            ok: false,
            feedback:
              "Run the same field again: the bench gives the same answer every time. What differs between the fields?",
          },
          {
            id: "better",
            label: "Reduced tillage is simply better; the humid fields were managed badly",
            ok: false,
            feedback: "Every field had the same management. What else changed?",
          },
        ],
      },
      {
        kind: "discover",
        text: "A practice is a hypothesis about this field.",
        discoveries: ["d-c12-hypothesis"],
        codex: ["cx-c12-gxexm"],
      },
    ],
    sources: ["pittelkow-2015", "ogle-2019"],
    simplificationNotes: [
      "Four contexts stand for the range of climates and soils in the field comparisons.",
      "The yield index is relative to ploughing in the same context; it predicts no real harvest.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c12-m3",
    chapter: "c12",
    title: "What would you measure?",
    tier: "T4",
    learningObjective:
      "Claims about soil carbon depend on how deep the samples go; some, like cover-crop carbon, are contested.",
    misconceptionsTargeted: ["M21", "M22"],
    scene: "c12-twin-fields",
    steps: [
      {
        kind: "fields",
        bench: "depth",
        text: "Ten years on, sample both fields: first the top 10 cm, then the whole profile to 60 cm.",
        resultText:
          "The top 10 cm says reduced tillage gained about 9 t of carbon per hectare. The whole profile says about 1: most of it was carbon the plough would have buried deeper.",
        facts: [F.redistribution, F.esm, F.ogle],
      },
      {
        kind: "claim-sort",
        text: "Sort these claims by how well the evidence supports them.",
        evidence: COVER_SOC,
        claims: [
          {
            id: "cover-always",
            text: "Cover crops always store a lot of carbon.",
            verdict: "unsupported",
            feedback: "Neither study says always, and one says much less than claimed.",
          },
          {
            id: "cover-some",
            text: "Cover crops can add some topsoil carbon; how much is contested.",
            verdict: "supported",
            feedback: "Both sides agree on the direction in the topsoil; they disagree on the size.",
          },
          {
            id: "no-till-lots",
            text: "No-till sequesters a lot of carbon.",
            verdict: "weak",
            feedback: "Shallow samples suggest it; sampled to depth, much of it is carbon moved, not gained.",
          },
        ],
        facts: [F.poeplau, F.chaplot],
      },
      {
        kind: "explain-choice",
        id: "c12-m3-measure",
        question:
          "A farm reports more soil carbon after five years of reduced tillage. What would you measure before believing it?",
        choices: [
          {
            id: "profile",
            label: "Carbon and bulk density to at least 60 cm, before and after, compared at equal soil mass",
            ok: true,
            feedback:
              "If the gain holds to depth at equal soil mass, then it is a gain, because moved carbon would cancel out over the whole profile.",
          },
          {
            id: "top",
            label: "The top 10 cm again, more often",
            ok: false,
            feedback:
              "More samples at the same depth repeat the same blind spot. Where did the carbon below go?",
          },
          {
            id: "score",
            label: "A soil health indicator for the field",
            ok: false,
            feedback:
              "An indicator describes the field against others. Does it say whether carbon was gained, or where it went?",
            misconception: "M22",
          },
        ],
      },
      {
        kind: "discover",
        text: "The answer depends on depth.",
        discoveries: ["d-c12-depth"],
        codex: ["cx-c12-depth", "cx-c12-cover"],
      },
    ],
    sources: ["powlson-2014", "ogle-2019", "poeplau-don-2015", "chaplot-smith-2023", "lehmann-2020"],
    simplificationNotes: [
      "Two depths only; the bench compares fixed depths and leaves equal-soil-mass correction to the codex.",
      "The cover-crop numbers are the two studies' own, shown side by side; the bench does not decide between them.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c12-m4",
    chapter: "c12",
    title: "Heavy wheels",
    tier: "T2",
    learningObjective:
      "Machinery on wet soil collapses the large pores; the next rain ponds, roots bend at the pan, and the damage persists.",
    misconceptionsTargeted: [],
    scene: "c12-wheel",
    steps: [
      { kind: "go", text: "Go down under a wheel track.", scene: "c12-wheel", object: "wheel-portal" },
      {
        kind: "fields",
        bench: "wheel",
        text: "Drive the same loaded wheel over the soil when it is dry, and again when it is wet. Then let it rain.",
        resultText:
          "On dry soil the pores mostly survived and the rain soaked in. On wet soil the big pores collapsed, the pan passed 2 MPa so roots turned sideways, and the rain ponded.",
        facts: [F.wetWheel, F.roots, F.heavier],
      },
      {
        kind: "explain-choice",
        id: "c12-m4-rip",
        question: "The wet track ponds. Will one deep rip fix it?",
        choices: [
          {
            id: "again",
            label:
              "It may loosen the pan for a while, but it compacts again if heavy wheels keep running on wet soil",
            ok: true,
            feedback: "Yes. The cause is the wheel on wet soil; ripping treats the result.",
          },
          {
            id: "once",
            label: "Yes: once ripped, it stays loose",
            ok: false,
            feedback: "What happens the next time the same wheel crosses wet soil?",
          },
          {
            id: "itself",
            label: "No need: compaction is gone by next season",
            ok: false,
            feedback: "Look at the recovery for the subsoil. Is that one season?",
          },
        ],
      },
      {
        kind: "discover",
        text: "A heavy wheel on wet soil crushed the big pores, and the next rain ponded.",
        discoveries: ["d-c12-wheels"],
        codex: ["cx-c12-wheels"],
      },
    ],
    sources: ["hamza-anderson-2005", "keller-2019", "bengough-2011"],
    simplificationNotes: [
      "One pass of one load; real compaction builds up pass by pass.",
      "Recovery is a fixed number of years per depth.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c12-m5",
    chapter: "c12",
    title: "Same seed, two fields",
    tier: "T3",
    learningObjective:
      "Separate an environment effect from a management effect: a shared cause (drainage) can drive both a microbial signal and yield.",
    misconceptionsTargeted: [],
    scene: "c12-twin-fields",
    steps: [
      { kind: "go", text: "Climb back up to the fields.", scene: "c12-twin-fields", object: "fields-portal" },
      {
        kind: "fields",
        bench: "same-seed",
        text: "One spinach variety in two fields. North was ploughed, South under reduced tillage. Each zone was sequenced for a microbial signal and harvested.",
        resultText:
          "Zones with more of the signal yielded less, and South yielded less than North. Grouped by drainage, both patterns vanish: the poorly drained zones carry the signal and the low yield, and South simply has more of them.",
        facts: [F.drainage, F.shares, F.indicators],
      },
      {
        kind: "explain-choice",
        id: "c12-m5-cause",
        question: "What explains the low-yield zones?",
        choices: [
          {
            id: "drainage",
            label: "Drainage: poorly drained zones have more of the signal and less yield",
            ok: true,
            feedback:
              "Yes. Drainage drives both. The signal is associated with low yield, and here it does not cause it.",
          },
          {
            id: "microbes",
            label: "The microbes behind the signal lower yield",
            ok: false,
            feedback:
              "Sequencing shows the group is associated with low yield. Hold drainage equal: is it still?",
          },
          {
            id: "tillage",
            label: "Reduced tillage in South lowered yield",
            ok: false,
            feedback: "Compare only the well-drained zones of both fields. Do they differ?",
          },
          {
            id: "variety",
            label: "The variety does better in North",
            ok: false,
            feedback: "Both fields grew the same seed.",
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c12-m5-next",
        question: "What would you measure next to test it?",
        choices: [
          {
            id: "water",
            label:
              "The water table in every zone through the season, then compare signal and yield within each drainage class",
            ok: true,
            feedback:
              "If the signal still tracks yield among zones that drain alike, then it may matter in its own right, because drainage would no longer explain it.",
          },
          {
            id: "deeper",
            label: "Sequence deeper to find the microbe responsible",
            ok: false,
            feedback:
              "More reads describe the signal better. Would they tell you whether drainage drives both?",
          },
          {
            id: "score",
            label: "Rank the zones on a soil health indicator",
            ok: false,
            feedback: "An indicator describes the zones. Does it separate drainage from tillage?",
            misconception: "M22",
          },
        ],
      },
      {
        kind: "discover",
        text: "Two things moving together may share a cause.",
        discoveries: ["d-c12-shared"],
        codex: ["cx-c12-confounder"],
        onComplete: { rumors: { "r-c12": "explained" } },
      },
    ],
    sources: ["keiluweit-2017", "weil-brady-2017", "gloor-2017", "lehmann-2020"],
    simplificationNotes: [
      "The zones, the signal and the yields are invented teaching values with seeded measurement noise.",
      "One confounder; real fields carry several at once.",
      "Generic spinach crop; no real field, variety or trial.",
    ],
    reviewStatus: "draft",
  },
];

const c12Codex: CodexEntry[] = [
  {
    id: "cx-c12-mechanisms",
    title: "Practices act through mechanisms",
    chapter: "c12",
    body: [
      "No practice acts by magic. Tillage breaks aggregates and exposes the carbon they protected. A cover crop takes up nitrate over winter. A short rotation lets pathogens of that crop build up.",
      "Each is a mechanism from an earlier chapter, and each depends on the field it acts in.",
    ],
    facts: [F.aggregates, F.cover, F.rotation],
    reviewStatus: "draft",
  },
  {
    id: "cx-c12-gxexm",
    title: "Genotype × environment × management",
    chapter: "c12",
    body: [
      "On average across thousands of comparisons, no-till yields a little less than ploughing. In dry climates, with residue kept and crops rotated, it can match or beat it.",
      "An average hides the sign. A practice is a hypothesis about a particular field.",
    ],
    facts: [F.pittelkow, F.gxexm, F.ogle],
    reviewStatus: "draft",
  },
  {
    id: "cx-c12-depth",
    title: "Carbon and sampling depth",
    chapter: "c12",
    body: [
      "Under no-till, carbon collects near the surface; under the plough, it is buried deeper. Sample only the top and no-till looks like a carbon store.",
      "A fair comparison samples the whole rooted profile at an equivalent soil mass.",
    ],
    facts: [F.redistribution, F.esm, F.ogle],
    reviewStatus: "draft",
  },
  {
    id: "cx-c12-cover",
    title: "Cover crops and soil carbon",
    chapter: "c12",
    body: [
      "A meta-analysis found cover crops add topsoil carbon. A later analysis argues the gains are much smaller than claimed.",
      "Both are shown here; neither is settled.",
    ],
    facts: [F.poeplau, F.chaplot],
    openQuestion: COVER_SOC,
    reviewStatus: "draft",
  },
  {
    id: "cx-c12-wheels",
    title: "Compaction",
    chapter: "c12",
    body: [
      "A wheel on wet soil closes the large pores that drain water and let air in. The next rain ponds, and roots turn aside at a dense pan.",
      "Topsoil recovers in years; subsoil compaction can last decades. A deep rip treats the result, not the cause.",
    ],
    facts: [F.wetWheel, F.heavier, F.roots, F.rip],
    simplification: "The bench has one pass, one load and fixed recovery times.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c12-confounder",
    title: "A shared cause",
    chapter: "c12",
    body: [
      "Across a field map, a microbial signal and yield moved together. Drainage drove both: wet zones favour microbes that live without air and stress roots.",
      "Group the zones by the shared cause and the association disappears. An indicator describes a field; it does not, by itself, say what caused what or what to do.",
    ],
    facts: [F.drainage, F.shares, F.indicators],
    reviewStatus: "draft",
  },
];

export const c12Bundle: ChapterBundle = {
  chapter: c12,
  scenes: c12Scenes,
  missions: c12Missions,
  codex: c12Codex,
  rumors: c12Rumors,
};
