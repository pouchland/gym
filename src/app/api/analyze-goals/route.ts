import { type NextRequest, NextResponse } from "next/server";

// Kimi API configuration
const KIMI_API_KEY = process.env.KIMI_API_KEY || "";
const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";

export async function POST(request: NextRequest) {
  // Parse request body first so we have access to it in catch block
  let goals = "";
  let experience = "";
  let userStats = null;

  try {
    const body = await request.json();
    goals = body.goals || "";
    experience = body.experience || "";
    userStats = body.userStats || null;

    if (!KIMI_API_KEY) {
      // Fallback if no API key
      return NextResponse.json({
        recommendation: generateFallbackRecommendation(goals, userStats),
      });
    }

    const prompt = buildPrompt(goals, experience, userStats);

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
            content: `You are a fitness expert and programming specialist. Analyze user goals and recommend the best workout plan.

Available plans:
- ppl: Push/Pull/Legs (6 days/week) - Best for hypertrophy, high frequency
- ul: Upper/Lower (4 days/week) - Best for strength, balanced
- bro: Bro Split (5-6 days/week) - One muscle per day, bodybuilding
- fullbody: Full Body (3 days/week) - Best for beginners, strength
- hyrox: Hyrox Training (5-6 days/week) - Functional fitness + running
- phat: PHAT (5 days/week) - Power + hypertrophy hybrid
- 531: 5/3/1 (4 days/week) - Pure strength, powerlifting

Respond in JSON format:
{
  "plan": "plan_id",
  "reason": "Why this plan fits their goals (2-3 sentences)",
  "frequency": "X days per week",
  "duration": "XX-XX minutes",
  "focus": "Primary focus (e.g., hypertrophy, strength, endurance)"
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
      recommendation: generateFallbackRecommendation(goals, userStats),
    });
  }
}

function buildPrompt(goals: string, experience: string, userStats: any): string {
  return `Analyze this user's fitness goals and recommend a workout plan.

GOALS:
${goals}

EXPERIENCE:
${experience}

STATS:
- Gender: ${userStats?.gender || "not specified"}
- Bodyweight: ${userStats?.bodyweight || "not specified"}kg
- Training Experience: ${userStats?.trainingExperience || "not specified"}
- Bench Press 1RM: ${userStats?.bench1RM || "not tested"}kg
- Squat 1RM: ${userStats?.squat1RM || "not tested"}kg
- Deadlift 1RM: ${userStats?.deadlift1RM || "not tested"}kg

Recommend the best workout plan ID and explain why.`;
}

function generateFallbackRecommendation(goals: string, userStats: any): any {
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
