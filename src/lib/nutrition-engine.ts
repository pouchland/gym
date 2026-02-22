// ============================================================
// Nutrition Engine — Evidence-Based Nutrition Recommendations
// Pure TypeScript module. No React/Supabase imports.
// ============================================================

// --- Types ---

export type NutritionGoal =
  | "muscle_gain"
  | "strength"
  | "fat_loss"
  | "endurance"
  | "general_health";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Gender = "male" | "female" | "other";

export interface NutritionInput {
  gender: Gender;
  bodyweight_kg: number;
  height_cm: number;
  age: number;
  activity_level: ActivityLevel;
  current_program: string;
  goals: string | null;
}

export interface MacroTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Supplement {
  name: string;
  dose: string;
  timing: string;
  priority: "essential" | "recommended" | "optional";
  reason: string;
}

export interface MealTiming {
  meals_per_day: number;
  pre_workout: string;
  post_workout: string;
  protein_distribution: string;
  before_sleep: string;
}

export interface NutritionPlan {
  goal: NutritionGoal;
  goal_label: string;
  bmr: number;
  tdee: number;
  targets: MacroTargets;
  protein_per_kg: number;
  calorie_adjustment_percent: number;
  hydration_ml: number;
  supplements: Supplement[];
  meal_timing: MealTiming;
  tips: string[];
  summary: string;
}

// --- Constants ---

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (desk job)",
  light: "Light (1-3 days exercise)",
  moderate: "Moderate (3-5 days exercise)",
  active: "Active (6-7 days exercise)",
  very_active: "Very Active (athlete)",
};

export const GOAL_LABELS: Record<NutritionGoal, string> = {
  muscle_gain: "Muscle Gain",
  strength: "Strength",
  fat_loss: "Fat Loss",
  endurance: "Endurance",
  general_health: "General Health",
};

/** Maps training programs to their primary nutrition goal */
export const PROGRAM_TO_GOAL: Record<string, NutritionGoal> = {
  fullbody: "muscle_gain",
  ul: "muscle_gain",
  ppl: "muscle_gain",
  pplul: "muscle_gain",
  bro: "muscle_gain",
  gvt: "muscle_gain",
  "531": "strength",
  hyrox: "endurance",
};

// Goal-specific macro parameters
const GOAL_PARAMS: Record<
  NutritionGoal,
  {
    calorie_multiplier: number;
    protein_g_per_kg: number;
    fat_pct: number;
    max_deficit?: number;
  }
> = {
  muscle_gain: { calorie_multiplier: 1.15, protein_g_per_kg: 2.0, fat_pct: 0.25 },
  strength: { calorie_multiplier: 1.1, protein_g_per_kg: 2.0, fat_pct: 0.3 },
  fat_loss: { calorie_multiplier: 0.8, protein_g_per_kg: 2.2, fat_pct: 0.25, max_deficit: 500 },
  endurance: { calorie_multiplier: 1.05, protein_g_per_kg: 1.8, fat_pct: 0.25 },
  general_health: { calorie_multiplier: 1.0, protein_g_per_kg: 1.4, fat_pct: 0.3 },
};

// --- Supplement Database ---

const ALL_SUPPLEMENTS: Record<string, Supplement> = {
  creatine: {
    name: "Creatine Monohydrate",
    dose: "5g daily",
    timing: "Any time of day — consistency matters more than timing",
    priority: "essential",
    reason: "Most researched supplement in sports nutrition. Increases strength, power, and lean mass.",
  },
  caffeine: {
    name: "Caffeine",
    dose: "3-6 mg/kg bodyweight",
    timing: "60 minutes before training. Cut off 6+ hours before sleep.",
    priority: "recommended",
    reason: "Improves strength, endurance, and reduces perceived exertion.",
  },
  vitamin_d: {
    name: "Vitamin D3",
    dose: "2000 IU daily",
    timing: "With a meal containing fat for absorption",
    priority: "essential",
    reason: "Supports muscle function, immune health, and bone density. Most people are deficient.",
  },
  omega_3: {
    name: "Omega-3 (Fish Oil)",
    dose: "1000-2000mg EPA+DHA daily",
    timing: "With meals",
    priority: "recommended",
    reason: "Reduces inflammation, supports heart and brain health, may improve recovery.",
  },
  magnesium: {
    name: "Magnesium Glycinate",
    dose: "200-400mg daily",
    timing: "Evening / before bed",
    priority: "optional",
    reason: "Supports sleep quality, muscle function, and stress reduction. Many athletes are deficient.",
  },
  protein_powder: {
    name: "Whey/Plant Protein",
    dose: "20-40g per serving",
    timing: "Post-workout or to fill protein gaps between meals",
    priority: "recommended",
    reason: "Convenient way to hit daily protein targets. Not magic — whole food is equally effective.",
  },
};

const GOAL_SUPPLEMENTS: Record<NutritionGoal, string[]> = {
  muscle_gain: ["creatine", "protein_powder", "vitamin_d", "omega_3", "magnesium"],
  strength: ["creatine", "caffeine", "vitamin_d", "protein_powder", "magnesium"],
  fat_loss: ["protein_powder", "caffeine", "omega_3", "vitamin_d", "magnesium"],
  endurance: ["caffeine", "creatine", "omega_3", "magnesium", "vitamin_d"],
  general_health: ["omega_3", "vitamin_d", "magnesium", "creatine"],
};

// --- Meal Timing Data ---

const MEAL_TIMING_DATA: Record<NutritionGoal, MealTiming> = {
  muscle_gain: {
    meals_per_day: 4,
    pre_workout: "20-40g protein + 0.5-1g/kg carbs, 1-2 hours before training",
    post_workout: "20-40g protein + moderate carbs within 2 hours after training",
    protein_distribution: "Spread protein across 4 meals (~0.4g/kg per meal) every 3-4 hours",
    before_sleep: "30-40g casein protein or cottage cheese 30 min before bed for overnight recovery",
  },
  strength: {
    meals_per_day: 4,
    pre_workout: "Carb-rich meal (40-60g carbs + 20-30g protein) 2 hours before heavy lifts",
    post_workout: "30-40g protein + carbs to replenish glycogen within 2 hours",
    protein_distribution: "Spread protein across 4 meals, prioritize pre and post workout meals",
    before_sleep: "Casein protein or Greek yogurt before bed for sustained amino acid delivery",
  },
  fat_loss: {
    meals_per_day: 3,
    pre_workout: "20-30g protein + small carb source 1-2 hours before training",
    post_workout: "30-40g protein — prioritize protein over carbs during a cut",
    protein_distribution: "High protein at every meal (40-50g). Protein keeps you full and preserves muscle.",
    before_sleep: "Casein protein if hungry — protein is the most satiating macronutrient",
  },
  endurance: {
    meals_per_day: 4,
    pre_workout: "Carb-focused meal (60-100g carbs) 2-3 hours before long sessions",
    post_workout: "3:1 carb-to-protein ratio within 30 min for glycogen-depleting sessions",
    protein_distribution: "4 meals with protein, emphasize carbs around training windows",
    before_sleep: "Light protein + complex carbs for next-day glycogen stores",
  },
  general_health: {
    meals_per_day: 3,
    pre_workout: "Balanced meal 1-2 hours before exercise — nothing complicated needed",
    post_workout: "Normal balanced meal within a couple hours — no rush",
    protein_distribution: "Include protein at each meal. Aim for variety and whole food sources.",
    before_sleep: "Avoid heavy meals close to bedtime. Herbal tea and light protein if hungry.",
  },
};

// --- Tips & Tricks ---

export const NUTRITION_TIPS: Record<NutritionGoal, string[]> = {
  muscle_gain: [
    "You can't build muscle without enough calories. A 10-20% surplus is the sweet spot — more just adds fat.",
    "Distribute protein across 4+ meals for maximum muscle protein synthesis throughout the day.",
    "Creatine monohydrate (5g/day) is the most proven supplement for muscle and strength gains.",
    "Sleep 7-9 hours. Growth hormone peaks during deep sleep — this is when you actually grow.",
    "Track your bodyweight weekly. Aim for 0.25-0.5% bodyweight gain per week.",
    "Post-workout protein is helpful but not magic. Total daily protein matters far more than timing.",
    "Carbs are not the enemy — they fuel your training and help with recovery.",
    "Stay hydrated. Even 2% dehydration impairs strength and performance.",
    "Don't skip meals. Consistency beats perfection. A missed meal is a missed growth opportunity.",
    "If you're not gaining weight, you're not eating enough. It's that simple.",
    "Whole eggs > egg whites. The yolk contains healthy fats, vitamins, and half the protein.",
    "Aim for 10-20 sets per muscle group per week for optimal hypertrophy stimulus.",
  ],
  strength: [
    "Carbs are rocket fuel for heavy lifts. Don't cut carbs when chasing strength PRs.",
    "Caffeine (3-6mg/kg) taken 60 min before training reliably improves max strength.",
    "A moderate surplus (+5-15%) fuels strength gains without excessive fat gain.",
    "Creatine increases your phosphocreatine stores — directly powering your 1-5 rep sets.",
    "Pre-workout meal matters more for strength than hypertrophy. Eat 2 hours before.",
    "Progressive overload requires adequate recovery. Eat enough to recover from heavy sessions.",
    "Protein timing matters less than you think. Just hit your daily 2g/kg target.",
    "Deload weeks are when adaptation happens. Don't cut calories during deloads.",
    "Bodyweight fluctuations are normal. Track weekly averages, not daily weigh-ins.",
    "Vitamin D deficiency is linked to reduced strength. Supplement 2000 IU/day year-round.",
  ],
  fat_loss: [
    "A deficit of 500 kcal/day loses ~0.5kg/week. Larger deficits sacrifice muscle. Be patient.",
    "Keep protein HIGH during a cut (2.0-2.4g/kg). This is the #1 rule for preserving muscle.",
    "Resistance training during a cut is non-negotiable. It signals your body to keep muscle.",
    "High-volume, low-calorie foods (vegetables, lean proteins) keep you full on fewer calories.",
    "Don't eliminate any food group. Sustainability beats perfection every time.",
    "Diet breaks (1-2 weeks at maintenance) every 6-8 weeks reduce metabolic adaptation.",
    "Caffeine suppresses appetite and boosts metabolism slightly. Use it strategically.",
    "Sleep deprivation increases hunger hormones. Prioritize 7-9 hours during a cut.",
    "Weigh yourself daily but look at weekly averages. Water weight masks true fat loss.",
    "Protein is the most satiating macronutrient. Front-load your protein earlier in the day.",
    "A slower cut (-20% TDEE) preserves more muscle than a crash diet. Play the long game.",
    "If strength drops more than 10%, you're cutting too aggressively. Ease off.",
  ],
  endurance: [
    "Carbs are your primary fuel for endurance. 5-8g/kg/day for serious training.",
    "Carb-load 24-36 hours before race day (6-8g/kg). Start the race with full glycogen stores.",
    "During sessions >90 min, consume 30-60g carbs per hour (gels, drinks, bananas).",
    "Post-session: 3:1 carb-to-protein ratio within 30 min for glycogen-depleting workouts.",
    "Hydration impacts endurance more than strength. Drink 5-7ml/kg 2-4 hours before exercise.",
    "Electrolytes matter for sessions >60 min. Add sodium (500-700mg/L) to your drink.",
    "Don't experiment with new foods on race day. Practice your nutrition strategy in training.",
    "Iron deficiency is common in endurance athletes. Get tested if performance plateaus.",
    "Caffeine (3-6mg/kg) improves endurance performance by 2-4%. Time it 60 min pre-race.",
    "Recovery nutrition is where endurance athletes often fail. Don't skip post-workout fueling.",
  ],
  general_health: [
    "A Mediterranean-style diet reduces depression risk by 32-45%. Eat fish, olive oil, vegetables.",
    "Omega-3 fatty acids (EPA+DHA) support brain health and reduce inflammation. Aim for 1-2g/day.",
    "Fiber (25-35g/day) from whole grains, vegetables, and legumes supports gut health and mood.",
    "Magnesium supports 300+ enzymatic reactions. Most people don't get enough from food alone.",
    "Limit ultra-processed foods. They're linked to worse mental and physical health outcomes.",
    "Hydration affects cognition. Even mild dehydration impairs focus and mood.",
    "Eating regular meals at consistent times supports circadian rhythm and sleep quality.",
    "Vitamin D supports immune function. Deficiency is linked to fatigue and low mood.",
    "Alcohol impairs sleep quality, recovery, and muscle protein synthesis. Moderate or avoid.",
    "Whole foods over supplements. Get your nutrients from real food first, supplement gaps.",
    "Social eating matters. Shared meals improve mental health and adherence to good nutrition.",
  ],
};

// --- Core Calculation Functions ---

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.
 * For "other" gender, averages male and female results.
 */
export function calculateBMR(
  gender: Gender,
  weight_kg: number,
  height_cm: number,
  age: number,
): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;

  if (gender === "male") return Math.round(base + 5);
  if (gender === "female") return Math.round(base - 161);
  // "other" — average of male and female
  return Math.round(base + (5 + -161) / 2);
}

/**
 * Calculate Total Daily Energy Expenditure.
 */
export function calculateTDEE(bmr: number, activity_level: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity_level]);
}

/**
 * Determine nutrition goal from training program and optional goals text.
 * Goals text keywords can override the program default.
 */
export function determineNutritionGoal(
  program: string,
  goals_text: string | null,
): NutritionGoal {
  const text = (goals_text || "").toLowerCase();

  // Keyword overrides (user intent > program default)
  if (/\b(lose|cut|lean|shred|fat loss|weight loss|slim|drop)\b/.test(text)) {
    return "fat_loss";
  }
  if (/\b(health|mental|wellness|feel better|anxiety|depression|longevity)\b/.test(text)) {
    return "general_health";
  }

  return PROGRAM_TO_GOAL[program] || "muscle_gain";
}

/**
 * Calculate macronutrient targets based on TDEE, goal, and bodyweight.
 */
export function calculateMacros(
  tdee: number,
  goal: NutritionGoal,
  bodyweight_kg: number,
): MacroTargets {
  const params = GOAL_PARAMS[goal];

  let calories = Math.round(tdee * params.calorie_multiplier);

  // Enforce max deficit for fat loss
  if (goal === "fat_loss" && params.max_deficit) {
    calories = Math.max(calories, tdee - params.max_deficit);
  }

  const protein_g = Math.round(bodyweight_kg * params.protein_g_per_kg);
  const fat_g = Math.round((calories * params.fat_pct) / 9);

  // Carbs fill the remaining calories
  const protein_cals = protein_g * 4;
  const fat_cals = fat_g * 9;
  const carbs_g = Math.max(0, Math.round((calories - protein_cals - fat_cals) / 4));

  // Recalculate actual calories from macros for precision
  const actual_calories = protein_g * 4 + carbs_g * 4 + fat_g * 9;

  return {
    calories: actual_calories,
    protein_g,
    carbs_g,
    fat_g,
  };
}

/**
 * Get ordered supplement recommendations for a nutrition goal.
 */
export function getSupplements(goal: NutritionGoal): Supplement[] {
  const keys = GOAL_SUPPLEMENTS[goal];
  return keys.map((key) => ALL_SUPPLEMENTS[key]).filter(Boolean);
}

/**
 * Calculate daily hydration target in milliliters.
 * Baseline: 35ml per kg bodyweight.
 */
export function calculateHydration(bodyweight_kg: number): number {
  return Math.round(bodyweight_kg * 35);
}

/**
 * Get meal timing recommendations for a goal.
 */
export function getMealTiming(goal: NutritionGoal): MealTiming {
  return MEAL_TIMING_DATA[goal];
}

/**
 * Generate a human-readable summary of the nutrition plan.
 */
export function generateSummary(
  goal: NutritionGoal,
  program: string,
  targets: MacroTargets,
): string {
  const goalLabel = GOAL_LABELS[goal];
  const proteinStr = `${targets.protein_g}g protein`;

  const programNames: Record<string, string> = {
    fullbody: "Full Body",
    ul: "Upper/Lower",
    ppl: "Push/Pull/Legs",
    pplul: "PPLUL",
    bro: "Bro Split",
    gvt: "German Volume Training",
    "531": "5/3/1 Strength",
    hyrox: "Hyrox",
  };
  const planName = programNames[program] || program;

  switch (goal) {
    case "muscle_gain":
      return `Your ${planName} program needs a calorie surplus and high protein to fuel muscle growth. Aim for ${targets.calories} kcal/day with ${proteinStr} spread across 4 meals.`;
    case "strength":
      return `Your ${planName} program demands adequate fuel for heavy lifts. A moderate surplus of ${targets.calories} kcal/day with ${proteinStr} and plenty of carbs (${targets.carbs_g}g) will maximize strength gains.`;
    case "fat_loss":
      return `To lose fat while preserving muscle, eat ${targets.calories} kcal/day with elevated protein (${proteinStr}). Keep training hard — resistance exercise is what tells your body to hold on to muscle.`;
    case "endurance":
      return `Your ${planName} training needs carbs for fuel. ${targets.calories} kcal/day with ${targets.carbs_g}g carbs will keep glycogen stores topped up. Don't neglect ${proteinStr} for recovery.`;
    case "general_health":
      return `For balanced health and wellbeing, maintain ${targets.calories} kcal/day with ${proteinStr}. Focus on whole foods, omega-3 rich fish, vegetables, and fiber. Quality matters more than quantity.`;
  }
}

/**
 * Main entry point — generates a complete nutrition plan from user inputs.
 * Returns null if required data is missing.
 */
export function generateNutritionPlan(input: NutritionInput): NutritionPlan | null {
  if (!input.bodyweight_kg || !input.height_cm || !input.age) {
    return null;
  }

  const bmr = calculateBMR(input.gender, input.bodyweight_kg, input.height_cm, input.age);
  const tdee = calculateTDEE(bmr, input.activity_level);
  const goal = determineNutritionGoal(input.current_program, input.goals);
  const targets = calculateMacros(tdee, goal, input.bodyweight_kg);
  const params = GOAL_PARAMS[goal];
  const adjustmentPct = Math.round((params.calorie_multiplier - 1) * 100);

  return {
    goal,
    goal_label: GOAL_LABELS[goal],
    bmr,
    tdee,
    targets,
    protein_per_kg: params.protein_g_per_kg,
    calorie_adjustment_percent: adjustmentPct,
    hydration_ml: calculateHydration(input.bodyweight_kg),
    supplements: getSupplements(goal),
    meal_timing: getMealTiming(goal),
    tips: NUTRITION_TIPS[goal],
    summary: generateSummary(goal, input.current_program, targets),
  };
}
