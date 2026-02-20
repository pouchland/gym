// =============================================================================
// Bench Press Strength Progression: Evidence-Based Research & Programming
// =============================================================================
// Compiled from peer-reviewed literature on training frequency, volume,
// intensity, periodization, rest intervals, and autoregulation.
// =============================================================================

export interface Study {
  id: number;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi: string;
  pubmedUrl: string;
  topic: StudyTopic;
  sampleSize: number;
  durationWeeks: number;
  populationType: "trained" | "untrained" | "mixed";
  keyFindings: string[];
  protocol: StudyProtocol;
}

export type StudyTopic =
  | "frequency"
  | "volume"
  | "intensity"
  | "periodization"
  | "rest_intervals"
  | "autoregulation";

export interface StudyProtocol {
  frequency?: string;
  volume?: string;
  intensity?: string;
  repRanges?: string;
  restPeriods?: string;
  periodizationModel?: string;
  programDescription: string;
}

export interface WeekSchedule {
  week: number;
  phase: PhaseName;
  isDeload: boolean;
  days: TrainingDay[];
  notes: string;
}

export type PhaseName =
  | "Anatomical Adaptation"
  | "Hypertrophy Accumulation"
  | "Strength Intensification"
  | "Peaking"
  | "Deload";

export interface TrainingDay {
  dayOfWeek: "Monday" | "Wednesday" | "Friday";
  sessionType: "heavy" | "moderate" | "light";
  exercises: Exercise[];
  rpeTarget: number;
  estimatedDurationMinutes: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number | string; // e.g., 5 or "3-5"
  intensityPercent1RM: number | string; // e.g., 85 or "80-85"
  restSeconds: number;
  tempo?: string;
  notes?: string;
}

export interface ProgramMetadata {
  name: string;
  goal: string;
  totalWeeks: number;
  sessionsPerWeek: number;
  periodizationModel: string;
  targetLift: string;
  prerequisites: string[];
  equipmentNeeded: string[];
  evidenceSummary: string;
}

// =============================================================================
// THE 10 STUDIES
// =============================================================================

export const benchPressStudies: Study[] = [
  // ---- STUDY 1: Frequency Meta-Analysis (Grgic et al.) ----
  {
    id: 1,
    title:
      "Effect of Resistance Training Frequency on Gains in Muscular Strength: A Systematic Review and Meta-Analysis",
    authors: [
      "Jozo Grgic",
      "Brad J. Schoenfeld",
      "Timothy B. Davies",
      "Bruno Lazinica",
      "James W. Krieger",
      "Zeljko Pedisic",
    ],
    year: 2018,
    journal: "Sports Medicine",
    doi: "10.1007/s40279-018-0872-x",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/29470825/",
    topic: "frequency",
    sampleSize: 1252,
    durationWeeks: 0, // meta-analysis
    populationType: "mixed",
    keyFindings: [
      "Significant effect of RT frequency on muscular strength (p = 0.003), with effect sizes of 0.74, 0.82, 0.93, and 1.08 for 1, 2, 3, and 4+ days/week respectively.",
      "Upper body strength showed a significant frequency effect (p = 0.004), while lower body did not reach significance (p = 0.07).",
      "When volume was equated between groups, no significant effect of frequency was observed (p = 0.421), suggesting frequency benefits are partly mediated by total volume.",
      "Multi-joint exercises showed a significant frequency effect (p <= 0.001), but single-joint exercises did not (p = 0.324).",
    ],
    protocol: {
      frequency: "Compared 1, 2, 3, and 4+ sessions per week per muscle group",
      programDescription:
        "Meta-analysis of 22 studies. Concluded that training a muscle group 2-3 times per week is optimal for strength when accounting for practical constraints. The frequency advantage is strongest for upper body pressing movements like the bench press.",
    },
  },

  // ---- STUDY 2: Volume Meta-Analysis (Ralston et al.) ----
  {
    id: 2,
    title: "The Effect of Weekly Set Volume on Strength Gain: A Meta-Analysis",
    authors: [
      "Grant W. Ralston",
      "Lon Kilgore",
      "Frank B. Wyatt",
      "Julien S. Baker",
    ],
    year: 2017,
    journal: "Sports Medicine",
    doi: "10.1007/s40279-017-0762-7",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/28755103/",
    topic: "volume",
    sampleSize: 0, // meta-analysis
    durationWeeks: 0,
    populationType: "mixed",
    keyFindings: [
      "Higher weekly set volumes (5+ sets per exercise per week) led to approximately 20% larger strength gains than lower volumes (<5 sets).",
      "Mean effect size for low weekly sets (<5) was 0.81, vs 1.00 for high weekly sets (5+), a modest but meaningful difference (ES = 0.18).",
      "Intensity remains a larger driver of strength gains than volume over short-to-moderate training periods.",
      "For multi-joint exercises like bench press, 5-10 weekly sets per exercise appear to be the practical sweet spot for trained individuals.",
    ],
    protocol: {
      volume:
        "Compared low (<5 sets/exercise/week) vs medium (5-9) vs high (10+) weekly set volumes",
      programDescription:
        "Meta-analysis of studies comparing weekly set volumes for strength. Recommended 5-10 hard sets per exercise per week for trained lifters, distributed across 2-3 sessions. More volume helps but with diminishing returns, and intensity is the stronger driver of 1RM gains.",
    },
  },

  // ---- STUDY 3: Linear vs DUP (Rhea et al.) ----
  {
    id: 3,
    title:
      "A Comparison of Linear and Daily Undulating Periodized Programs with Equated Volume and Intensity for Strength",
    authors: [
      "Matthew R. Rhea",
      "Steven D. Ball",
      "Wayne T. Phillips",
      "Lee N. Burkett",
    ],
    year: 2002,
    journal: "Journal of Strength and Conditioning Research",
    doi: "10.1519/1533-4287(2002)016<0250:ACOLAD>2.0.CO;2",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/11991778/",
    topic: "periodization",
    sampleSize: 20,
    durationWeeks: 12,
    populationType: "trained",
    keyFindings: [
      "Daily undulating periodization (DUP) produced 28.8% bench press improvement vs 14.4% for linear periodization, nearly double the gains.",
      "DUP leg press improvement was 55.8% vs 25.7% for LP.",
      "Volume and intensity were equated between groups; only the distribution pattern differed.",
      "Daily variation in rep ranges (8RM, 6RM, 4RM across the week) outperformed monthly progression through the same rep ranges.",
    ],
    protocol: {
      frequency: "3 days/week (Mon, Wed, Fri)",
      volume: "3 sets per exercise per session (9 weekly sets)",
      repRanges: "8RM, 6RM, and 4RM rotated",
      periodizationModel: "Daily Undulating Periodization vs Linear",
      programDescription:
        "LP group: weeks 1-4 at 8RM, weeks 5-8 at 6RM, weeks 9-12 at 4RM. DUP group: Monday 8RM, Wednesday 6RM, Friday 4RM each week. Both performed bench press and leg press, 3 sets each session. The DUP approach of varying rep zones within each week proved far superior to the traditional linear block approach.",
    },
  },

  // ---- STUDY 4: Periodized vs Non-Periodized (Williams et al.) ----
  {
    id: 4,
    title:
      "Comparison of Periodized and Non-Periodized Resistance Training on Maximal Strength: A Meta-Analysis",
    authors: [
      "Tyler D. Williams",
      "Danilo V. Tolusso",
      "Michael V. Fedewa",
      "Michael R. Esco",
    ],
    year: 2017,
    journal: "Sports Medicine",
    doi: "10.1007/s40279-017-0734-y",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/28497285/",
    topic: "periodization",
    sampleSize: 0, // meta-analysis, 18 studies, 81 effects
    durationWeeks: 0,
    populationType: "mixed",
    keyFindings: [
      "Periodized training produced significantly greater 1RM gains than non-periodized training with a moderate effect size (d = 0.43).",
      "Undulating periodization models showed larger effects than linear periodization models (moderator beta = 0.51, p = 0.001).",
      "Higher training frequency and longer study duration were associated with larger improvements in 1RM.",
      "Results were consistent across bench press, squat, and leg press exercises.",
    ],
    protocol: {
      periodizationModel:
        "Compared periodized (linear and undulating) vs non-periodized (constant loading)",
      programDescription:
        "Meta-analysis of 18 studies (81 effect sizes). Periodized programs systematically vary training variables (sets, reps, intensity) across mesocycles. The analysis confirmed that any form of periodization outperforms constant loading, with undulating models showing the strongest advantage for trained individuals seeking maximal strength.",
    },
  },

  // ---- STUDY 5: Heavy vs Moderate Loads (Schoenfeld et al.) ----
  {
    id: 5,
    title:
      "Differential Effects of Heavy Versus Moderate Loads on Measures of Strength and Hypertrophy in Resistance-Trained Men",
    authors: [
      "Brad J. Schoenfeld",
      "Bret Contreras",
      "Andrew D. Vigotsky",
      "Mark Peterson",
    ],
    year: 2016,
    journal: "Journal of Sports Science and Medicine",
    doi: "N/A",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/27928218/",
    topic: "intensity",
    sampleSize: 19,
    durationWeeks: 8,
    populationType: "trained",
    keyFindings: [
      "Heavy loads (2-4RM) produced significantly greater 1RM squat strength gains than moderate loads (8-12RM) despite lower total volume load.",
      "Hypertrophy was similar or slightly favored moderate loads, suggesting volume load matters more for muscle growth.",
      "Heavy load training is essential for maximizing 1RM bench press and squat strength due to neural and skill-specific adaptations.",
      "Participants in the heavy-load group showed signs of joint stress, suggesting heavy training should be periodized rather than maintained continuously.",
    ],
    protocol: {
      frequency: "3 days/week (total body)",
      volume: "3 sets per exercise, 7 exercises per session",
      intensity: "HEAVY group: 2-4RM; MODERATE group: 8-12RM",
      repRanges: "2-4 reps (heavy) vs 8-12 reps (moderate)",
      restPeriods: "3 minutes between sets",
      programDescription:
        "8-week program, 3 total-body sessions per week, 7 exercises per session. The heavy group trained at 2-4RM while the moderate group used 8-12RM. Both groups performed 3 sets per exercise. Results demonstrated that for 1RM strength, heavy load training is superior, reinforcing the principle of specificity in strength training.",
    },
  },

  // ---- STUDY 6: High vs Low Load Meta-Analysis (Schoenfeld et al.) ----
  {
    id: 6,
    title:
      "Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training: A Systematic Review and Meta-analysis",
    authors: [
      "Brad J. Schoenfeld",
      "Jozo Grgic",
      "Dan Ogborn",
      "James W. Krieger",
    ],
    year: 2017,
    journal: "Journal of Strength and Conditioning Research",
    doi: "10.1519/JSC.0000000000002200",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/28834797/",
    topic: "intensity",
    sampleSize: 0, // 21 studies in meta-analysis
    durationWeeks: 0,
    populationType: "mixed",
    keyFindings: [
      "1RM strength gains were significantly greater with high-load (>60% 1RM) vs low-load (<=60% 1RM) training.",
      "Muscle hypertrophy was similar across loading ranges when sets were taken to or near failure.",
      "For bench press 1RM specifically, training at >60% 1RM is clearly superior to lighter loads.",
      "The principle of specificity strongly supports heavy training for 1RM improvement: you must practice lifting heavy to get better at lifting heavy.",
    ],
    protocol: {
      intensity:
        "High-load: >60% 1RM (typically 1-12 reps); Low-load: <=60% 1RM (typically 15-40+ reps)",
      programDescription:
        "Meta-analysis of 21 studies comparing low vs high load resistance training. All included studies required training to muscular failure. Confirmed that maximal strength requires heavy loading (>60% 1RM), with the practical recommendation that the majority of training for 1RM strength should occur in the 70-90% 1RM range (roughly 3-10 reps).",
    },
  },

  // ---- STUDY 7: Rest Intervals (Schoenfeld et al.) ----
  {
    id: 7,
    title:
      "Longer Interset Rest Periods Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men",
    authors: [
      "Brad J. Schoenfeld",
      "Zachary K. Pope",
      "Franklin M. Benik",
      "Garrett M. Hester",
      "John Sellers",
      "Josh L. Nooner",
      "Jessica A. Schnaiter",
      "Katherine E. Bond-Williams",
      "Ashlee S. Carter",
      "Corbin L. Ross",
      "Brittany L. Just",
      "Menno Henselmans",
      "James W. Krieger",
    ],
    year: 2016,
    journal: "Journal of Strength and Conditioning Research",
    doi: "10.1519/JSC.0000000000001272",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/26605807/",
    topic: "rest_intervals",
    sampleSize: 21,
    durationWeeks: 8,
    populationType: "trained",
    keyFindings: [
      "3-minute rest intervals produced significantly greater gains in 1RM bench press and squat compared to 1-minute rest intervals.",
      "Muscle thickness increases in the quadriceps and triceps were greater with 3-minute rest.",
      "Longer rest allows greater neuromuscular recovery, enabling higher quality sets and greater total volume load across the session.",
      "This challenged the traditional bodybuilding dogma that short rest intervals (60-90s) are optimal for hypertrophy.",
    ],
    protocol: {
      frequency: "3 days/week (total body)",
      volume: "3 sets of 8-12RM, 7 exercises per session",
      restPeriods:
        "SHORT group: 1 minute; LONG group: 3 minutes between all sets",
      programDescription:
        "8-week study with 21 trained men performing 3 total-body workouts per week. Both groups did identical exercises, sets, and reps (3x 8-12RM across 7 exercises). The only difference was rest interval length. The 3-minute group outperformed on all strength and most hypertrophy measures, establishing 3+ minutes as the evidence-based minimum for strength-focused training.",
    },
  },

  // ---- STUDY 8: Bench Press Rest Period Study (Janicijevic et al.) ----
  {
    id: 8,
    title:
      "Effect of Inter-Set Rest Period Length on Bench Press Mechanical Performance",
    authors: [
      "Danica Janicijevic",
      "Alejandro Perez-Castilla",
      "Amador Garcia-Ramos",
    ],
    year: 2023,
    journal: "Journal of Sports Sciences",
    doi: "10.1080/02640414.2023.2247506",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/37602397/",
    topic: "rest_intervals",
    sampleSize: 15,
    durationWeeks: 0, // acute study
    populationType: "trained",
    keyFindings: [
      "5-minute rest periods are necessary to maintain bench press mechanical performance when sets are taken close to failure.",
      "3-minute rest may suffice when sets are terminated farther from failure (2-3 RIR).",
      "Velocity loss across sets was significantly lower with 5-minute vs 2-minute rest intervals.",
      "Rest period requirements increase as proximity to failure increases, supporting the use of longer rest for heavy, high-RPE sets.",
    ],
    protocol: {
      restPeriods:
        "Compared 2, 3, and 5 minute rest intervals across multiple sets of bench press at various intensities",
      programDescription:
        "Acute crossover design examining bench press performance with different rest intervals. Practical takeaway: for heavy bench press sets at RPE 8-10, use 3-5 minutes rest. For moderate sets at RPE 6-7, 2-3 minutes is adequate. This aligns with the DUP model where heavier days demand longer rest.",
    },
  },

  // ---- STUDY 9: Periodization Volume-Equated Meta-Analysis (Grgic et al.) ----
  {
    id: 9,
    title:
      "Effects of Periodization on Strength and Muscle Hypertrophy in Volume-Equated Resistance Training Programs: A Systematic Review and Meta-analysis",
    authors: [
      "Jozo Grgic",
      "Enes Mikulic",
      "Brad J. Schoenfeld",
      "David J. Bishop",
      "Zeljko Pedisic",
    ],
    year: 2022,
    journal: "Sports Medicine",
    doi: "10.1007/s40279-021-01636-1",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/35044672/",
    topic: "periodization",
    sampleSize: 0, // meta-analysis
    durationWeeks: 0,
    populationType: "mixed",
    keyFindings: [
      "Even when volume is equated, periodized training produces greater 1RM strength gains than non-periodized training.",
      "Undulating periodization (UP) outperformed linear periodization (LP) for 1RM strength in trained individuals.",
      "The UP advantage over LP was specific to trained populations; untrained individuals responded similarly to both models.",
      "Periodization did not significantly affect muscle hypertrophy in volume-equated programs, confirming it is primarily a strength-specific strategy.",
    ],
    protocol: {
      periodizationModel:
        "Compared undulating (daily and weekly) vs linear vs non-periodized, all volume-equated",
      programDescription:
        "Meta-analysis isolating the pure effect of periodization by controlling for total training volume. The finding that undulating periodization beats linear periodization for trained lifters is particularly relevant for bench press programming. Recommends alternating heavy (1-5 rep), moderate (6-8 rep), and light (8-12 rep) days within each week rather than progressing through them in monthly blocks.",
    },
  },

  // ---- STUDY 10: RPE Autoregulation (Helms et al.) ----
  {
    id: 10,
    title:
      "RPE vs. Percentage 1RM Loading in Periodized Programs Matched for Sets and Repetitions",
    authors: [
      "Eric R. Helms",
      "Scott R. Brown",
      "Matt R. Cross",
      "Adam Storey",
      "John B. Cronin",
      "Michael C. Zourdos",
    ],
    year: 2018,
    journal: "Frontiers in Physiology",
    doi: "10.3389/fphys.2018.00247",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/29628895/",
    topic: "autoregulation",
    sampleSize: 21,
    durationWeeks: 8,
    populationType: "trained",
    keyFindings: [
      "RPE-based autoregulation produced slightly greater (non-significant) strength gains in both squat and bench press compared to fixed percentage-based loading.",
      "RPE-based lifters trained at a higher average intensity than the percentage-based group, naturally self-selecting heavier loads over the 8-week period.",
      "RPE diverged from prescribed percentages by week 2 for bench press and week 4 for squat, with the RPE group progressively loading more aggressively.",
      "Autoregulation allows athletes to train harder on good days and pull back on bad days, potentially reducing injury risk while maintaining stimulus quality.",
    ],
    protocol: {
      frequency: "3 days/week (non-consecutive)",
      volume: "Squat and bench press each session",
      intensity:
        "RPE group used RIR-based RPE targets; %1RM group used fixed percentages",
      periodizationModel:
        "Daily undulating periodization for both groups (hypertrophy, power, strength sessions)",
      programDescription:
        "8-week DUP program with squats and bench press 3x/week. Each session had a different focus: hypertrophy (higher reps, lower RPE), power (moderate reps, explosive), strength (low reps, high RPE). The RPE group self-selected loads based on RIR-based RPE targets, while the %1RM group used prescribed percentages. Both groups used identical sets and reps. Supports using RPE as a primary or complementary loading strategy in periodized bench press programs.",
    },
  },
];

// =============================================================================
// SYNTHESIZED EVIDENCE SUMMARY
// =============================================================================

export const evidenceSynthesis = {
  frequency: {
    recommendation: "Bench press 3 times per week",
    confidence: "High",
    rationale:
      "Grgic et al. (2018) showed a dose-response favoring higher frequencies for upper body pressing (ES from 0.74 to 1.08 across 1-4x/week). The effect is partly volume-mediated, but distributing sets across 3 sessions also improves motor learning and reduces per-session fatigue.",
  },
  volume: {
    recommendation: "8-10 hard sets of bench press per week",
    confidence: "High",
    rationale:
      "Ralston et al. (2017) found 5+ weekly sets outperformed fewer sets by ES 0.18. For trained lifters, 8-10 weekly sets (distributed across 3 sessions as ~3 sets each) balances stimulus with recovery. Volume is secondary to intensity for pure strength.",
  },
  intensity: {
    recommendation:
      "Primary work at 70-90% 1RM, with periodic exposure to 90%+ and lighter 60-70% sessions",
    confidence: "Very High",
    rationale:
      "Schoenfeld et al. (2016, 2017) demonstrated that heavy loads (>60% 1RM) are essential for 1RM gains due to the principle of specificity. The DUP model distributes intensity across sessions: heavy (85-95%), moderate (75-82%), and light/hypertrophy (65-75%).",
  },
  periodization: {
    recommendation: "Daily undulating periodization (DUP)",
    confidence: "High",
    rationale:
      "Rhea et al. (2002) showed DUP produced nearly double the bench press gains vs linear periodization. Grgic et al. (2022) confirmed UP outperforms LP in trained populations when volume is equated. Williams et al. (2017) showed all periodization outperforms non-periodized training (d=0.43).",
  },
  repRanges: {
    recommendation:
      "Mix of 1-5 reps (strength), 6-8 reps (strength-hypertrophy), and 8-12 reps (hypertrophy) across the week",
    confidence: "High",
    rationale:
      "The DUP model from Rhea et al. alternated 8RM, 6RM, and 4RM within each week. Schoenfeld et al. (2017) confirmed heavier loading is superior for 1RM. Combining rep ranges within the week develops both neural and morphological adaptations.",
  },
  restPeriods: {
    recommendation:
      "3-5 minutes for heavy sets (RPE 8-10), 2-3 minutes for moderate sets (RPE 6-7)",
    confidence: "High",
    rationale:
      "Schoenfeld et al. (2016) showed 3-minute rest outperformed 1-minute for both strength and hypertrophy. Janicijevic et al. (2023) demonstrated 5 minutes is needed near failure but 3 minutes suffices at moderate effort. Scale rest to intensity and proximity to failure.",
  },
  autoregulation: {
    recommendation:
      "Use RPE/RIR targets alongside percentage guidelines; adjust daily loads based on readiness",
    confidence: "Moderate-High",
    rationale:
      "Helms et al. (2018) showed RPE-based loading produced comparable or slightly better results than fixed percentages. Experienced lifters can use RIR-based RPE to auto-regulate load, especially on heavy days. Percentage ranges provide guardrails; RPE fine-tunes within them.",
  },
};

// =============================================================================
// 12-WEEK BENCH PRESS PROGRESSION PROGRAM
// =============================================================================

export const programMetadata: ProgramMetadata = {
  name: "Evidence-Based 12-Week Bench Press Builder",
  goal: "Increase bench press 1RM through daily undulating periodization with progressive overload",
  totalWeeks: 12,
  sessionsPerWeek: 3,
  periodizationModel: "Daily Undulating Periodization (DUP) with Block Overlay",
  targetLift: "Barbell Bench Press",
  prerequisites: [
    "Minimum 6 months of consistent bench press training",
    "Able to bench press at least 1.0x bodyweight",
    "No current shoulder, elbow, or wrist injuries",
    "Knowledge of RPE/RIR scale",
    "Known or recently tested bench press 1RM",
  ],
  equipmentNeeded: [
    "Barbell and bench press station",
    "Dumbbells",
    "Weight plates (increments of 2.5 lbs / 1.25 kg minimum)",
    "Optional: resistance bands, chains for accommodating resistance",
  ],
  evidenceSummary:
    "This program synthesizes findings from 10 peer-reviewed studies and meta-analyses. It uses daily undulating periodization (Rhea 2002, Grgic 2022), trains the bench press 3x/week (Grgic 2018), accumulates 9 hard sets per week (Ralston 2017), employs heavy loading at 70-90% 1RM (Schoenfeld 2016, 2017), prescribes 3-5 minute rest for heavy sets (Schoenfeld 2016, Janicijevic 2023), and incorporates RPE-based autoregulation (Helms 2018). Deload weeks are placed every 4th week to manage fatigue.",
};

// Intensity percentages are based on the lifter's tested or estimated 1RM
// at the START of the program. Autoregulate with RPE as the primary guide.

export const weeklySchedule: WeekSchedule[] = [
  // ===== PHASE 1: ANATOMICAL ADAPTATION (Weeks 1-3) =====
  // Purpose: Build work capacity, groove technique, establish baseline volume
  {
    week: 1,
    phase: "Anatomical Adaptation",
    isDeload: false,
    notes:
      "Introduction week. Focus on bar speed and technique. All sets should feel controlled. Use this week to calibrate RPE accuracy.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "moderate",
        rpeTarget: 6,
        estimatedDurationMinutes: 55,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: 67,
            restSeconds: 180,
            notes: "Focus on consistent bar path and tight setup",
          },
          {
            name: "Close-Grip Bench Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: 58,
            restSeconds: 120,
            notes: "Tricep emphasis; elbows tucked",
          },
          {
            name: "Dumbbell Incline Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 120,
            notes: "Moderate load; upper pec development",
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 5,
        estimatedDurationMinutes: 45,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: 60,
            restSeconds: 150,
            notes: "Technique day; pause 1 second on chest each rep",
          },
          {
            name: "Dumbbell Flat Press",
            sets: 3,
            reps: 12,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
            notes: "Full ROM; controlled eccentric",
          },
          {
            name: "Push-Ups (Weighted or Bodyweight)",
            sets: 3,
            reps: "15-20",
            intensityPercent1RM: "N/A",
            restSeconds: 60,
            notes: "Pump work for recovery and blood flow",
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 7,
        estimatedDurationMinutes: 60,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 5,
            intensityPercent1RM: 75,
            restSeconds: 210,
            notes: "Heavier but still manageable; build confidence under load",
          },
          {
            name: "Spoto Press (Pause 1 inch off chest)",
            sets: 3,
            reps: 6,
            intensityPercent1RM: 68,
            restSeconds: 150,
            notes: "Strengthens the bottom position",
          },
          {
            name: "Dumbbell Flye or Cable Flye",
            sets: 3,
            reps: 12,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
            notes: "Isolation work for pec development",
          },
        ],
      },
    ],
  },
  {
    week: 2,
    phase: "Anatomical Adaptation",
    isDeload: false,
    notes:
      "Small increase in intensity. Maintain form quality. Begin tracking bar speed mentally or with a velocity tracker if available.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "moderate",
        rpeTarget: 7,
        estimatedDurationMinutes: 55,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: 70,
            restSeconds: 180,
            notes: "Slight load increase from week 1",
          },
          {
            name: "Close-Grip Bench Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: 60,
            restSeconds: 120,
          },
          {
            name: "Dumbbell Incline Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 120,
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 6,
        estimatedDurationMinutes: 45,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: 62,
            restSeconds: 150,
            notes: "Paused reps; focus on explosive drive off chest",
          },
          {
            name: "Dumbbell Flat Press",
            sets: 3,
            reps: 12,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
          {
            name: "Push-Ups (Weighted or Bodyweight)",
            sets: 3,
            reps: "15-20",
            intensityPercent1RM: "N/A",
            restSeconds: 60,
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 7,
        estimatedDurationMinutes: 60,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 5,
            intensityPercent1RM: 77,
            restSeconds: 210,
          },
          {
            name: "Spoto Press (Pause 1 inch off chest)",
            sets: 3,
            reps: 6,
            intensityPercent1RM: 70,
            restSeconds: 150,
          },
          {
            name: "Dumbbell Flye or Cable Flye",
            sets: 3,
            reps: 12,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
        ],
      },
    ],
  },
  {
    week: 3,
    phase: "Anatomical Adaptation",
    isDeload: false,
    notes:
      "Peak of the adaptation phase. Push RPE slightly. Last hard week before the first deload.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "moderate",
        rpeTarget: 7,
        estimatedDurationMinutes: 55,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: 72,
            restSeconds: 180,
          },
          {
            name: "Close-Grip Bench Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: 63,
            restSeconds: 120,
            notes: "Dropped to 8 reps; slight intensity increase",
          },
          {
            name: "Dumbbell Incline Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 120,
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 6,
        estimatedDurationMinutes: 45,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: 63,
            restSeconds: 150,
          },
          {
            name: "Dumbbell Flat Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
          {
            name: "Push-Ups (Weighted or Bodyweight)",
            sets: 3,
            reps: "15-20",
            intensityPercent1RM: "N/A",
            restSeconds: 60,
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 8,
        estimatedDurationMinutes: 60,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 5,
            intensityPercent1RM: 80,
            restSeconds: 240,
          },
          {
            name: "Spoto Press (Pause 1 inch off chest)",
            sets: 3,
            reps: 5,
            intensityPercent1RM: 72,
            restSeconds: 150,
          },
          {
            name: "Dumbbell Flye or Cable Flye",
            sets: 3,
            reps: 12,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
        ],
      },
    ],
  },

  // ===== DELOAD WEEK 4 =====
  {
    week: 4,
    phase: "Deload",
    isDeload: true,
    notes:
      "Reduce volume by ~40% and intensity by ~10%. Maintain frequency. Focus on recovery, mobility, and technique refinement. This is NOT an off week.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "light",
        rpeTarget: 4,
        estimatedDurationMinutes: 35,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 2,
            reps: 8,
            intensityPercent1RM: 60,
            restSeconds: 150,
            notes: "Smooth and fast; focus on perfect technique",
          },
          {
            name: "Dumbbell Incline Press",
            sets: 2,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 4,
        estimatedDurationMinutes: 30,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 2,
            reps: 6,
            intensityPercent1RM: 62,
            restSeconds: 150,
          },
          {
            name: "Push-Ups (Bodyweight)",
            sets: 2,
            reps: 15,
            intensityPercent1RM: "N/A",
            restSeconds: 60,
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "light",
        rpeTarget: 5,
        estimatedDurationMinutes: 35,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 2,
            reps: 5,
            intensityPercent1RM: 67,
            restSeconds: 180,
            notes: "Keep the nervous system primed for heavy work next week",
          },
          {
            name: "Close-Grip Bench Press",
            sets: 2,
            reps: 8,
            intensityPercent1RM: 55,
            restSeconds: 120,
          },
        ],
      },
    ],
  },

  // ===== PHASE 2: HYPERTROPHY ACCUMULATION (Weeks 5-7) =====
  // Purpose: Build muscle mass in pressing muscles to support heavier loads later
  {
    week: 5,
    phase: "Hypertrophy Accumulation",
    isDeload: false,
    notes:
      "Increased volume across the week. Moderate loads with more total reps. This phase builds the structural base for the heavy work ahead.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "moderate",
        rpeTarget: 7,
        estimatedDurationMinutes: 60,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 4,
            reps: 6,
            intensityPercent1RM: 75,
            restSeconds: 180,
            notes: "Volume increase: 4 sets. Moderate weight, quality reps.",
          },
          {
            name: "Close-Grip Bench Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: 65,
            restSeconds: 120,
          },
          {
            name: "Dumbbell Incline Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 120,
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 6,
        estimatedDurationMinutes: 50,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: 65,
            restSeconds: 150,
            notes: "Paused reps; controlled tempo 3-1-2",
            tempo: "3-1-2",
          },
          {
            name: "Dumbbell Flat Press",
            sets: 3,
            reps: 12,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
          {
            name: "Cable Flye or Pec Deck",
            sets: 3,
            reps: 15,
            intensityPercent1RM: "N/A",
            restSeconds: 60,
            notes: "High rep pump work for pec hypertrophy",
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 8,
        estimatedDurationMinutes: 65,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 4,
            reps: 4,
            intensityPercent1RM: 82,
            restSeconds: 240,
            notes: "Heavy day; 4 sets of 4. Accumulate quality heavy volume.",
          },
          {
            name: "Spoto Press (Pause 1 inch off chest)",
            sets: 3,
            reps: 5,
            intensityPercent1RM: 73,
            restSeconds: 180,
          },
          {
            name: "Dumbbell Flye or Cable Flye",
            sets: 3,
            reps: 12,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
        ],
      },
    ],
  },
  {
    week: 6,
    phase: "Hypertrophy Accumulation",
    isDeload: false,
    notes:
      "Progressive overload via small intensity increase across all sessions. Weekly bench volume remains at ~11 hard sets.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "moderate",
        rpeTarget: 7,
        estimatedDurationMinutes: 60,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 4,
            reps: 6,
            intensityPercent1RM: 77,
            restSeconds: 180,
          },
          {
            name: "Close-Grip Bench Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: 67,
            restSeconds: 120,
          },
          {
            name: "Dumbbell Incline Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 120,
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 7,
        estimatedDurationMinutes: 50,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: 67,
            restSeconds: 150,
            tempo: "3-1-2",
          },
          {
            name: "Dumbbell Flat Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
          {
            name: "Cable Flye or Pec Deck",
            sets: 3,
            reps: 15,
            intensityPercent1RM: "N/A",
            restSeconds: 60,
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 8,
        estimatedDurationMinutes: 65,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 4,
            reps: 4,
            intensityPercent1RM: 84,
            restSeconds: 270,
          },
          {
            name: "Spoto Press (Pause 1 inch off chest)",
            sets: 3,
            reps: 5,
            intensityPercent1RM: 75,
            restSeconds: 180,
          },
          {
            name: "Dumbbell Flye or Cable Flye",
            sets: 3,
            reps: 12,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
        ],
      },
    ],
  },
  {
    week: 7,
    phase: "Hypertrophy Accumulation",
    isDeload: false,
    notes:
      "Final hard week of the accumulation phase. Push intensity slightly. This is the highest volume week in the program.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "moderate",
        rpeTarget: 8,
        estimatedDurationMinutes: 65,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 4,
            reps: 6,
            intensityPercent1RM: 78,
            restSeconds: 180,
          },
          {
            name: "Close-Grip Bench Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: 68,
            restSeconds: 120,
          },
          {
            name: "Dumbbell Incline Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 120,
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 7,
        estimatedDurationMinutes: 50,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: 70,
            restSeconds: 150,
            notes: "Paused reps; rep range drops from 10 to 8 as intensity rises",
          },
          {
            name: "Dumbbell Flat Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
          {
            name: "Cable Flye or Pec Deck",
            sets: 3,
            reps: 15,
            intensityPercent1RM: "N/A",
            restSeconds: 60,
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 8,
        estimatedDurationMinutes: 65,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 4,
            reps: 3,
            intensityPercent1RM: 85,
            restSeconds: 270,
            notes: "Triples at 85%; approach with confidence",
          },
          {
            name: "Spoto Press (Pause 1 inch off chest)",
            sets: 3,
            reps: 4,
            intensityPercent1RM: 76,
            restSeconds: 180,
          },
          {
            name: "Dumbbell Flye or Cable Flye",
            sets: 3,
            reps: 12,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
        ],
      },
    ],
  },

  // ===== DELOAD WEEK 8 =====
  {
    week: 8,
    phase: "Deload",
    isDeload: true,
    notes:
      "Critical deload before the intensification phase. Reduce volume by ~50% and intensity by ~10%. Sleep and nutrition are paramount this week.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "light",
        rpeTarget: 4,
        estimatedDurationMinutes: 30,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 2,
            reps: 6,
            intensityPercent1RM: 65,
            restSeconds: 150,
          },
          {
            name: "Dumbbell Incline Press",
            sets: 2,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 4,
        estimatedDurationMinutes: 25,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 2,
            reps: 5,
            intensityPercent1RM: 68,
            restSeconds: 150,
          },
          {
            name: "Push-Ups (Bodyweight)",
            sets: 2,
            reps: 15,
            intensityPercent1RM: "N/A",
            restSeconds: 60,
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "light",
        rpeTarget: 5,
        estimatedDurationMinutes: 30,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 2,
            reps: 3,
            intensityPercent1RM: 75,
            restSeconds: 210,
            notes: "Brief heavy exposure to maintain neural readiness",
          },
          {
            name: "Close-Grip Bench Press",
            sets: 2,
            reps: 6,
            intensityPercent1RM: 60,
            restSeconds: 120,
          },
        ],
      },
    ],
  },

  // ===== PHASE 3: STRENGTH INTENSIFICATION (Weeks 9-11) =====
  // Purpose: Convert accumulated volume into maximal strength via higher intensity
  {
    week: 9,
    phase: "Strength Intensification",
    isDeload: false,
    notes:
      "Intensity ramps up. Volume per session decreases but load increases. Heavy day approaches competition-like intensity. Rest periods lengthen.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "moderate",
        rpeTarget: 8,
        estimatedDurationMinutes: 60,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 4,
            reps: 5,
            intensityPercent1RM: 80,
            restSeconds: 210,
            notes: "Fives at 80%; strong and controlled",
          },
          {
            name: "Close-Grip Bench Press",
            sets: 3,
            reps: 6,
            intensityPercent1RM: 70,
            restSeconds: 150,
          },
          {
            name: "Dumbbell Incline Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: "N/A",
            restSeconds: 120,
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 6,
        estimatedDurationMinutes: 45,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: 68,
            restSeconds: 150,
            notes: "Active recovery day; technique focus with paused reps",
          },
          {
            name: "Dumbbell Flat Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
          {
            name: "Cable Flye or Pec Deck",
            sets: 2,
            reps: 15,
            intensityPercent1RM: "N/A",
            restSeconds: 60,
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 9,
        estimatedDurationMinutes: 65,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 5,
            reps: 3,
            intensityPercent1RM: 87,
            restSeconds: 300,
            notes:
              "Heavy triples; 5 sets. Full 5-minute rest between sets. RPE 9 target.",
          },
          {
            name: "Spoto Press (Pause 1 inch off chest)",
            sets: 3,
            reps: 3,
            intensityPercent1RM: 78,
            restSeconds: 210,
          },
        ],
      },
    ],
  },
  {
    week: 10,
    phase: "Strength Intensification",
    isDeload: false,
    notes:
      "Intensity continues climbing. Doubles introduced on heavy day. Total weekly bench sets: 10-12 (with accessories).",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "moderate",
        rpeTarget: 8,
        estimatedDurationMinutes: 60,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 4,
            reps: 4,
            intensityPercent1RM: 83,
            restSeconds: 240,
          },
          {
            name: "Close-Grip Bench Press",
            sets: 3,
            reps: 5,
            intensityPercent1RM: 73,
            restSeconds: 150,
          },
          {
            name: "Dumbbell Incline Press",
            sets: 3,
            reps: 8,
            intensityPercent1RM: "N/A",
            restSeconds: 120,
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 6,
        estimatedDurationMinutes: 40,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 6,
            intensityPercent1RM: 70,
            restSeconds: 150,
            notes: "Moderate recovery session; speed emphasis",
          },
          {
            name: "Dumbbell Flat Press",
            sets: 3,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 9,
        estimatedDurationMinutes: 65,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 5,
            reps: 2,
            intensityPercent1RM: 90,
            restSeconds: 300,
            notes:
              "Heavy doubles at 90%. Full rest. Focus on maximal intent each rep.",
          },
          {
            name: "Spoto Press (Pause 1 inch off chest)",
            sets: 3,
            reps: 3,
            intensityPercent1RM: 80,
            restSeconds: 210,
          },
        ],
      },
    ],
  },
  {
    week: 11,
    phase: "Strength Intensification",
    isDeload: false,
    notes:
      "Peak intensity week. Singles introduced. This is the hardest week of the program. Manage fatigue carefully via RPE; if RPE exceeds targets, reduce load.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "moderate",
        rpeTarget: 8,
        estimatedDurationMinutes: 55,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 4,
            intensityPercent1RM: 85,
            restSeconds: 240,
          },
          {
            name: "Close-Grip Bench Press",
            sets: 3,
            reps: 5,
            intensityPercent1RM: 75,
            restSeconds: 150,
          },
          {
            name: "Dumbbell Incline Press",
            sets: 2,
            reps: 8,
            intensityPercent1RM: "N/A",
            restSeconds: 120,
            notes: "Reduced accessory volume to manage fatigue",
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 6,
        estimatedDurationMinutes: 35,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 5,
            intensityPercent1RM: 72,
            restSeconds: 150,
            notes: "Recovery session; smooth and fast",
          },
          {
            name: "Dumbbell Flat Press",
            sets: 2,
            reps: 10,
            intensityPercent1RM: "N/A",
            restSeconds: 90,
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 9,
        estimatedDurationMinutes: 60,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 3,
            reps: 1,
            intensityPercent1RM: 93,
            restSeconds: 300,
            notes:
              "Heavy singles at 93%. Three singles with full rest. RPE 9 (1 rep in reserve). Do NOT exceed RPE 9.5.",
          },
          {
            name: "Barbell Bench Press (Back-off)",
            sets: 2,
            reps: 3,
            intensityPercent1RM: 83,
            restSeconds: 240,
            notes: "Back-off sets to accumulate a few more quality reps",
          },
        ],
      },
    ],
  },

  // ===== PHASE 4: PEAKING / TEST WEEK (Week 12) =====
  {
    week: 12,
    phase: "Peaking",
    isDeload: false,
    notes:
      "Peaking week. Monday is a light opener session. Wednesday is off or very light. Friday is test day. Get adequate sleep all week. Eat at maintenance or slight surplus. Hydrate well.",
    days: [
      {
        dayOfWeek: "Monday",
        sessionType: "light",
        rpeTarget: 5,
        estimatedDurationMinutes: 30,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 2,
            reps: 3,
            intensityPercent1RM: 75,
            restSeconds: 180,
            notes:
              "Opener session; light and fast. Reinforce confidence and bar path.",
          },
          {
            name: "Barbell Bench Press (Singles)",
            sets: 2,
            reps: 1,
            intensityPercent1RM: 82,
            restSeconds: 180,
            notes: "Two easy singles to feel heavy weight without fatigue",
          },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        sessionType: "light",
        rpeTarget: 3,
        estimatedDurationMinutes: 20,
        exercises: [
          {
            name: "Barbell Bench Press",
            sets: 2,
            reps: 5,
            intensityPercent1RM: 55,
            restSeconds: 120,
            notes:
              "Optional session. Bar work only. If feeling any residual fatigue, skip entirely and rest.",
          },
        ],
      },
      {
        dayOfWeek: "Friday",
        sessionType: "heavy",
        rpeTarget: 10,
        estimatedDurationMinutes: 45,
        exercises: [
          {
            name: "Barbell Bench Press (Warm-up to 1RM Attempt)",
            sets: 1,
            reps: 1,
            intensityPercent1RM: "100-103",
            restSeconds: 300,
            notes:
              "1RM TEST DAY. Warm-up protocol: empty bar x10, 40% x5, 55% x3, 70% x2, 80% x1, 87% x1, 93% x1, then attempt new 1RM at 100-103%. Take 3-5 minutes between warm-up singles. You get up to 3 max attempts.",
          },
        ],
      },
    ],
  },
];

// =============================================================================
// PROGRESSIVE OVERLOAD SCHEME
// =============================================================================

export const progressiveOverloadScheme = {
  description:
    "Progressive overload is achieved through three concurrent mechanisms across the 12 weeks, based on the DUP model from Rhea et al. (2002) and the autoregulation findings from Helms et al. (2018).",
  mechanisms: [
    {
      name: "Intensity Progression",
      description:
        "Percentage of 1RM increases by 2-3% per week within each phase. Heavy day progresses from 75% (Week 1) to 93% (Week 11). Moderate day from 67% to 85%. Light day from 60% to 72%.",
    },
    {
      name: "Volume Manipulation",
      description:
        "Volume increases from Phase 1 (9 bench sets/week) to Phase 2 (11 bench sets/week), then decreases in Phase 3 (8-10 sets/week) as intensity peaks. This inverse relationship between volume and intensity is the core principle of block periodization overlaid on the DUP framework.",
    },
    {
      name: "RPE-Based Autoregulation",
      description:
        "Prescribed percentages serve as guidelines. RPE targets are the primary load prescription tool. If a set at 80% feels like RPE 9+, reduce load. If it feels like RPE 6, consider adding 2-5 lbs. This accounts for daily readiness fluctuations (Helms et al. 2018).",
    },
  ],
  weeklyLoadIncrements: {
    heavyDay: "2-3% 1RM per week (approximately 5 lbs / 2.5 kg for most lifters)",
    moderateDay: "1-2% 1RM per week (approximately 2.5-5 lbs / 1.25-2.5 kg)",
    lightDay: "1% 1RM per week (approximately 2.5 lbs / 1.25 kg)",
  },
};

// =============================================================================
// RPE GUIDELINES
// =============================================================================

export const rpeGuidelines = {
  scale: [
    { rpe: 10, description: "Maximum effort. No reps left in reserve. True 1RM or absolute failure.", repsInReserve: 0 },
    { rpe: 9.5, description: "Could maybe do 1 more rep but not confident.", repsInReserve: 0.5 },
    { rpe: 9, description: "Could definitely do 1 more rep. Last rep was hard but controlled.", repsInReserve: 1 },
    { rpe: 8.5, description: "Could definitely do 1, maybe 2 more reps.", repsInReserve: 1.5 },
    { rpe: 8, description: "Could do 2 more reps. Weight is challenging but manageable.", repsInReserve: 2 },
    { rpe: 7, description: "Could do 3 more reps. Moving well with good bar speed.", repsInReserve: 3 },
    { rpe: 6, description: "Could do 4 more reps. Feels like a solid warm-up weight.", repsInReserve: 4 },
    { rpe: 5, description: "Could do 5+ more reps. Light speed work or technique focus.", repsInReserve: 5 },
    { rpe: 4, description: "Very light. Deload-appropriate effort. Primarily for blood flow and recovery.", repsInReserve: 6 },
  ],
  programUsage: {
    heavyDays: "RPE 8-9. Heavy days should feel hard but not grinding. If bar speed drops dramatically or you miss the groove, reduce load by 2-5%.",
    moderateDays: "RPE 7-8. These should be challenging but you should leave the session feeling like you could have done more. Building volume without excessive fatigue.",
    lightDays: "RPE 5-6. Light days are recovery sessions. The purpose is technique refinement, blood flow, and maintaining frequency without adding meaningful fatigue.",
    deloadWeeks: "RPE 4-5. Everything should feel light and easy. Resist the urge to push harder. The deload only works if you actually deload.",
  },
  autoregulationRules: [
    "If prescribed RPE 8 but the set felt like RPE 9+, reduce weight by 5% for remaining sets.",
    "If prescribed RPE 8 but the set felt like RPE 6, add 2.5-5 lbs for the next set.",
    "If you cannot hit the prescribed minimum reps at the target RPE, the load is too heavy. Drop 5-10% and complete the session.",
    "On days when everything feels heavy (RPE is 1-2 points higher than normal for the same weight), consider it a signal of accumulated fatigue. Complete the session at reduced intensity and ensure recovery before the next heavy session.",
    "Trust RPE over percentages. Your 1RM fluctuates daily by 3-7%. Percentages are a starting point; RPE is the real-time adjustment.",
  ],
};

// =============================================================================
// PHASE SUMMARIES
// =============================================================================

export const phaseSummaries = [
  {
    phase: "Anatomical Adaptation" as PhaseName,
    weeks: "1-3",
    goal: "Build work capacity, establish movement patterns, calibrate RPE",
    weeklyBenchSets: 9,
    intensityRange: "60-80% 1RM",
    keyPrinciple:
      "Start conservatively. The best predictor of long-term strength gain is consistency, and consistency requires avoiding early burnout or injury.",
  },
  {
    phase: "Deload" as PhaseName,
    weeks: "4",
    goal: "Dissipate fatigue, allow supercompensation",
    weeklyBenchSets: 6,
    intensityRange: "55-67% 1RM",
    keyPrinciple:
      "Reduce volume by 40-50% and intensity by 10%. Maintain frequency. The strength gains from weeks 1-3 are realized during this recovery period.",
  },
  {
    phase: "Hypertrophy Accumulation" as PhaseName,
    weeks: "5-7",
    goal: "Build pressing muscle mass to support future heavy loads",
    weeklyBenchSets: 11,
    intensityRange: "65-85% 1RM",
    keyPrinciple:
      "Higher total volume with moderate loads. The muscle built here provides the structural foundation for the heavy loads in the intensification phase.",
  },
  {
    phase: "Deload" as PhaseName,
    weeks: "8",
    goal: "Recover before the most demanding phase",
    weeklyBenchSets: 6,
    intensityRange: "60-75% 1RM",
    keyPrinciple:
      "Critical recovery point. The intensification phase demands a fresh, recovered state. Do not skip or shortchange this deload.",
  },
  {
    phase: "Strength Intensification" as PhaseName,
    weeks: "9-11",
    goal: "Convert accumulated work into maximal strength via heavy loading",
    weeklyBenchSets: "8-10",
    intensityRange: "68-93% 1RM",
    keyPrinciple:
      "Intensity is king for 1RM strength (Schoenfeld 2016, 2017). Volume decreases as intensity climbs. Heavy singles and doubles build neural drive and skill under maximal loads.",
  },
  {
    phase: "Peaking" as PhaseName,
    weeks: "12",
    goal: "Express accumulated strength in a 1RM test",
    weeklyBenchSets: "4-5",
    intensityRange: "55-103% 1RM",
    keyPrinciple:
      "Minimal fatigue, maximal readiness. Monday is openers, Wednesday is optional light work, Friday is test day. You are not building strength this week; you are expressing what you have built.",
  },
];
