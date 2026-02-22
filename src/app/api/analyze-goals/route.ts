import { type NextRequest, NextResponse } from "next/server";

// Kimi API configuration
const KIMI_API_KEY = process.env.KIMI_API_KEY || "";
const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";

// Evidence-based plan data from pt_complete_guide.md
const planData = {
  fullbody: {
    days: 3,
    science: "Best for beginners. Full body 3x/week produces faster technique improvement than 1x/week. Delivers 9-12 working sets per muscle per week.",
  },
  ul: {
    days: 4,
    science: "Upper/Lower produces ~85% of 5-day program gains with less time investment. Most efficient structure for intermediates.",
  },
  pplul: {
    days: 5,
    science: "PPLUL scores 9.0/10 on predictive hypertrophy modeling — highest of any 5-day format. Perfect middle ground.",
  },
  ppl: {
    days: 6,
    science: "6-day PPL provides twice-weekly frequency at high volume. Only works if all 6 sessions are completed consistently.",
  },
  bro: {
    days: 5,
    science: "Bro split provides high per-session intensity. Research favors 2x/week frequency, but intensity partially compensates.",
  },
  gvt: {
    days: 3,
    science: "German Volume Training: 10 sets of 10 at 60% 1RM. Extreme volume for breaking plateaus. Use as 6-8 week block only.",
  },
  hyrox: {
    days: 5,
    science: "Hyrox is fundamentally a running race (51 min avg vs 33 min on stations). VO₂max and running volume correlate strongest with finish times.",
  },
  "531": {
    days: 4,
    science: "5/3/1: Simple percentage-based progression. Gold standard for pure strength development with proven long-term results.",
  },
};

export async function POST(request: NextRequest) {
  // Parse request body first so we have access to it in catch block
  let goals = "";
  let experience = "";
  let userStats = null;

  try {
    const body = await request.json();
    goals = body.goals || "";
    experience = body.experience || "";
    const availableDays = body.availableDays || 4;
    userStats = body.userStats || null;

    if (!KIMI_API_KEY) {
      // Fallback if no API key
      return NextResponse.json({
        recommendation: generateFallbackRecommendation(goals, userStats),
      });
    }

    const prompt = buildPrompt(goals, experience, availableDays, userStats);

    const response = await fetch(KIMI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "kimi-latest",
        messages: [
          {
            role: "system",
            content: `You are an expert personal trainer using evidence-based programming from peer-reviewed research.

CRITICAL RULES:
1. Client can only train ${availableDays} days per week. ONLY recommend plans that fit this constraint.
2. Adherence is the #1 variable. The best program is one the client will actually follow.

AVAILABLE PLANS (only recommend those with days <= ${availableDays}):
- fullbody (3 days): Full body 3x/week. Best for beginners. Fast technique improvement. 9-12 sets/muscle/week.
- ul (4 days): Upper/Lower split. Produces ~85% of 5-day gains. Most efficient intermediate structure.
- pplul (5 days): Push/Pull/Legs/Upper/Lower. Highest-rated 5-day format (9.0/10 hypertrophy score).
- ppl (6 days): Push/Pull/Legs x2. High volume, but requires strict consistency.
- bro (5 days): One muscle per day. High intensity, good for recovery days between muscle groups.
- gvt (3 days): German Volume Training. 10x10 at 60% 1RM. Extreme volume for plateaus. Advanced only.
- hyrox (5 days): For Hyrox competition. Running-focused (51 min) + functional stations (33 min).
- 531 (4 days): Jim Wendler's strength program. Percentage-based waves. Gold standard for pure strength.

PROGRAMMING PRINCIPLES FROM RESEARCH:
- Volume drives hypertrophy. 10-20 sets/muscle/week optimal.
- Frequency matters: 2x/week > 1x/week when volume equated.
- Progressive overload is non-negotiable.
- Rep ranges: 1-6 strength, 6-15 hypertrophy, 15+ endurance.
- Train 1-3 reps from failure on most sets.

DECISION TREE:
1. Days available (hard constraint)
2. Goals (hypertrophy, strength, endurance, sport-specific)
3. Experience (beginner = full body, intermediate = upper/lower, advanced = specialized)

Respond in JSON:
{
  "plan": "plan_id",
  "reason": "2-3 sentences explaining WHY this fits their goals, days available, and experience. Mention specific science.",
  "frequency": "X days per week",
  "duration": "XX-XX minutes",
  "focus": "Primary focus (strength/hypertrophy/endurance/hybrid)"
}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from Kimi");
    }

    const recommendation = JSON.parse(content);
    
    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error("Goal analysis error:", error);
    
    // Return fallback recommendation
    return NextResponse.json({
      recommendation: generateFallbackRecommendation(goals, availableDays, userStats),
    });
  }
}

function buildPrompt(goals: string, experience: string, availableDays: number, userStats: any): string {
  return `You are an expert personal trainer. Recommend a workout plan based on this client profile.

CONSTRAINT: Client can ONLY train ${availableDays} days per week. This is non-negotiable.

CLIENT GOALS:
${goals}

TRAINING EXPERIENCE:
${experience}

CLIENT STATS:
- Days available: ${availableDays}
- Gender: ${userStats?.gender || "not specified"}
- Bodyweight: ${userStats?.bodyweight || "not specified"}kg
- Training Experience: ${userStats?.trainingExperience || "not specified"}
- Bench Press 1RM: ${userStats?.bench1RM || "not tested"}kg
- Squat 1RM: ${userStats?.squat1RM || "not tested"}kg
- Deadlift 1RM: ${userStats?.deadlift1RM || "not tested"}kg

RULES:
1. ONLY recommend plans that are ${availableDays} days or less
2. Prioritize adherence - what will they actually stick to?
3. Use scientific reasoning in your explanation
4. Match complexity to their experience level

What plan do you recommend and why?`;
}

function generateFallbackRecommendation(goals: string, availableDays: number, userStats: any): any {
  const goalsLower = goals.toLowerCase();
  
  // Simple keyword matching fallback
  if (goalsLower.includes("marathon") || goalsLower.includes("run") || goalsLower.includes("hyrox")) {
    return {
      plan: "hyrox",
      reason: "Your endurance and functional fitness goals align perfectly with Hyrox-style training.",
      frequency: "5-6 days per week",
      duration: "45-75 minutes",
      focus: "Endurance and functional fitness",
    };
  }
  
  if (goalsLower.includes("strength") || goalsLower.includes("power") || userStats?.trainingExperience === "advanced") {
    return {
      plan: "531",
      reason: "For serious strength goals, 5/3/1 provides proven progression and measurable results.",
      frequency: "4 days per week",
      duration: "45-60 minutes",
      focus: "Maximal strength development",
    };
  }
  
  if (goalsLower.includes("beginner") || userStats?.trainingExperience === "beginner") {
    return {
      plan: "fullbody",
      reason: "Full body training 3x/week is perfect for beginners to build a foundation and practice movements frequently.",
      frequency: "3 days per week",
      duration: "45-60 minutes",
      focus: "Foundation building and strength",
    };
  }
  
  if (goalsLower.includes("size") || goalsLower.includes("mass") || goalsLower.includes("bodybuilding")) {
    return {
      plan: "ppl",
      reason: "Push/Pull/Legs offers the frequency and volume needed for maximum muscle growth.",
      frequency: "6 days per week",
      duration: "60-75 minutes",
      focus: "Muscle hypertrophy",
    };
  }
  
  // Default
  return {
    plan: "ul",
    reason: "Upper/Lower split offers the perfect balance of frequency and recovery for consistent progress.",
    frequency: "4 days per week",
    duration: "45-60 minutes",
    focus: "Balanced strength and hypertrophy",
  };
}
