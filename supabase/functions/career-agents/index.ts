import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== LOVABLE AI CALL ==========

interface LovableAIResponse {
  success: boolean;
  text?: string;
  error?: string;
}

async function callLovableAI(
  systemPrompt: string,
  userPrompt: string
): Promise<LovableAIResponse> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured");
    return { success: false, error: "API key not configured" };
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (response.status === 429) {
      console.error("Lovable AI rate limited");
      return { success: false, error: "Rate limit exceeded. Please try again in a moment." };
    }

    if (response.status === 402) {
      console.error("Lovable AI payment required");
      return { success: false, error: "Payment required. Please add credits." };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lovable AI error: ${response.status} - ${errorText}`);
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (text) {
      return { success: true, text: text.trim() };
    }

    return { success: false, error: "No content in response" };
  } catch (error) {
    console.error("Lovable AI call failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// ========== CAREER MAPPING TYPES ==========

interface QuizAnswers {
  hobbies?: string[];
  interests?: string[];
  skills?: string[];
  academics?: string[];
}

interface CareerPath {
  id: string;
  title: string;
  icon: string;
  description: string;
  matchScore: number;
  justification: string;
  keySkills: string[];
  averageSalary: string;
  demandLevel: "High" | "Very High" | "Explosive";
}

function buildCareerMappingPrompt(answers: QuizAnswers): string {
  const hobbies = answers.hobbies?.join(", ") || "Not specified";
  const interests = answers.interests?.join(", ") || "Not specified";
  const skills = answers.skills?.join(", ") || "Not specified";
  const academics = answers.academics?.join(", ") || "Not specified";

  return `Analyze this user's profile and recommend TOP 3 career paths in tech.

## USER PROFILE:
- **Hobbies:** ${hobbies}
- **Core Interests:** ${interests}
- **Current Skills:** ${skills}
- **Academic Background:** ${academics}

Return a JSON object with this EXACT structure:
{
  "careers": [
    {
      "id": "kebab-case-id",
      "title": "Career Title",
      "icon": "cpu|palette|server|shield|gamepad|brain|globe",
      "description": "2-3 sentence description",
      "matchScore": 85,
      "justification": "Why this matches their profile",
      "keySkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "averageSalary": "$100,000 - $150,000",
      "demandLevel": "High|Very High|Explosive"
    }
  ]
}

Match scores: 70-98. Return EXACTLY 3 careers.`;
}

function getFallbackCareers(answers: QuizAnswers): CareerPath[] {
  return [
    {
      id: "fullstack-dev",
      title: "Full-Stack Developer",
      icon: "cpu",
      description: "Master both frontend and backend. The most versatile role in tech.",
      matchScore: 85,
      justification: "A full-stack role gives you flexibility to explore and find your niche.",
      keySkills: ["React", "Node.js", "SQL", "TypeScript", "Cloud"],
      averageSalary: "$80,000 - $140,000",
      demandLevel: "Very High"
    },
    {
      id: "ml-engineer",
      title: "Machine Learning Engineer",
      icon: "brain",
      description: "Design and deploy AI systems. The frontier of tech innovation.",
      matchScore: 80,
      justification: "Your analytical mindset aligns well with ML engineering demands.",
      keySkills: ["Python", "TensorFlow", "Math", "Statistics", "Cloud"],
      averageSalary: "$130,000 - $200,000",
      demandLevel: "Explosive"
    },
    {
      id: "backend-architect",
      title: "Backend Architect",
      icon: "server",
      description: "Design scalable systems that handle millions of users.",
      matchScore: 78,
      justification: "Strong foundation for high-performance systems.",
      keySkills: ["Go/Rust", "Databases", "Kubernetes", "System Design", "Performance"],
      averageSalary: "$120,000 - $180,000",
      demandLevel: "Very High"
    }
  ];
}

async function handleCareerMapping(quizAnswers: QuizAnswers): Promise<Response> {
  const prompt = buildCareerMappingPrompt(quizAnswers);
  const result = await callLovableAI(
    "You are an expert career advisor. Return JSON only, no markdown.",
    prompt
  );

  if (result.success && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.careers && Array.isArray(parsed.careers)) {
          return new Response(
            JSON.stringify({ careers: parsed.careers }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } catch (e) {
      console.log("JSON parse failed, using fallback");
    }
  }

  // Return fallback careers if AI fails
  console.log("AI career mapping failed, using fallback careers");
  return new Response(
    JSON.stringify({ careers: getFallbackCareers(quizAnswers) }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ========== AGENT PROMPTS (Concise one-liners) ==========

const AGENT_PROMPTS = {
  profiler: `You are THE PROFILER. Analyze the student and respond in EXACTLY this format (one line only):

🎯 [ARCHETYPE] → [Path] • [8-word max insight]

ARCHETYPES: The Builder | The Analyst | The Innovator | The Optimizer | The Creator
PATHS: Foundation Path (< 5 skills) | Precision Path (5+ skills)

ONE LINE ONLY. No paragraphs.`,

  pulse: `You are THE PULSE. Provide 2026 market intel in EXACTLY this format (one line only):

📈 [Top Role] @ [Company] • Learn: [One Tech] • Gap: [One Skill]

Use real companies: OpenAI, Anthropic, Stripe, Vercel, Google, Meta.

ONE LINE ONLY.`,

  forge: `You are THE FORGE. Generate ONE project idea in EXACTLY this format (one line only):

🔨 [Project Name] • [Tech Stack] • Ships in [X] weeks

NO todo apps. Must be 2026-relevant (AI, real-time, or automation).

ONE LINE ONLY.`,

  gatekeeper: `You are THE GATEKEEPER. Validate or warn in EXACTLY this format (one line only):

⚠️ [RISK]: [Problem] → [Fix]
OR
✅ VALIDATED: [Success factor]

ONE LINE ONLY.`,
};

interface AgentRequest {
  agentType: "profiler" | "pulse" | "forge" | "gatekeeper";
  answers: Record<number, string>;
  resumeSkills: string[];
  resumeProjects: string[];
  resumeExperience: string[];
}

function buildUserContext(data: AgentRequest): string {
  const year = data.answers[0] || "Not specified";
  const interest = data.answers[1] || "Not specified";
  const level = data.answers[2] || "Not specified";
  const hours = data.answers[3] || "Not specified";
  const goal = data.answers[4] || "Not specified";

  return `## USER DATA:
- Year: ${year}
- Interest: ${interest}
- Skill Level: ${level}
- Hours/Week: ${hours}
- Goal: ${goal}
- Resume Skills: ${data.resumeSkills.length > 0 ? data.resumeSkills.join(", ") : "None detected"}
- Resume Projects: ${data.resumeProjects.length > 0 ? data.resumeProjects.join(", ") : "None"}
- Experience: ${data.resumeExperience.length > 0 ? data.resumeExperience.join(", ") : "None"}

Respond in the EXACT format specified. ONE LINE ONLY.`;
}

// Fallback insights
function getFallbackAgentInsight(agentType: string, answers: Record<number, string>, resumeSkills: string[]): string {
  const year = answers[0] || "";
  const interest = answers[1] || "";
  const hours = answers[3] || "";

  switch (agentType) {
    case "profiler":
      if (resumeSkills.length >= 10) return `🎯 The Builder → Precision Path • ${resumeSkills.length} skills detected, ready to specialize.`;
      if (year.includes("1st") || year.includes("2nd")) return "🎯 The Learner → Foundation Path • Master CS fundamentals first.";
      return "🎯 The Achiever → Precision Path • Build production-grade portfolio.";

    case "pulse":
      if (interest.includes("AI")) return "📈 MLOps Engineer @ Anthropic • Learn: LangGraph • Gap: System Design";
      if (interest.includes("web")) return "📈 Design Engineer @ Vercel • Learn: Next.js 15 • Gap: TypeScript";
      return "📈 Platform Engineer @ Stripe • Learn: Kubernetes • Gap: Go/Rust";

    case "forge":
      if (interest.includes("AI")) return "🔨 PR Sentinel • LangChain + GitHub API • Ships in 3 weeks";
      return "🔨 Live Collab Editor • Next.js + WebSocket • Ships in 4 weeks";

    case "gatekeeper":
      if (resumeSkills.length > 0 && resumeSkills.length < 5) return "⚠️ SKILL GAP: Limited foundation → 2 weeks on fundamentals first.";
      if (hours.includes("30+")) return "⚠️ BURNOUT: 30+ hrs unsustainable → Schedule rest days.";
      return "✅ VALIDATED: Build in public for maximum visibility.";

    default:
      return "Analysis complete.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Handle career mapping requests
    if (body.quizAnswers) {
      return handleCareerMapping(body.quizAnswers);
    }

    // Handle agent analysis requests
    const { agentType, answers, resumeSkills, resumeProjects, resumeExperience }: AgentRequest = body;

    if (!agentType || !AGENT_PROMPTS[agentType]) {
      return new Response(
        JSON.stringify({ error: "Invalid agent type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = AGENT_PROMPTS[agentType];
    const userContext = buildUserContext({ agentType, answers, resumeSkills, resumeProjects, resumeExperience });

    const result = await callLovableAI(systemPrompt, userContext);

    if (result.success && result.text) {
      console.log(`Lovable AI success for ${agentType}`);
      return new Response(
        JSON.stringify({ insight: result.text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return fallback insight if AI fails
    console.log(`AI failed for ${agentType}, using fallback`);
    return new Response(
      JSON.stringify({ insight: getFallbackAgentInsight(agentType, answers, resumeSkills) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("career-agents error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
