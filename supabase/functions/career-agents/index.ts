import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== GEMINI API DIRECT INTEGRATION ==========
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash-preview-05-20";

interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text?: string; functionCall?: { name: string; args: any } }>;
      role: string;
    };
    finishReason: string;
  }>;
}

interface GeminiCallResult {
  success: boolean;
  text?: string;
  toolCall?: { name: string; args: any };
  error?: string;
  statusCode?: number;
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  options: { tools?: any[]; temperature?: number; maxOutputTokens?: number } = {}
): Promise<GeminiCallResult> {
  const { tools, temperature = 0.7, maxOutputTokens = 300 } = options;

  const url = `${GEMINI_API_URL}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  if (tools && tools.length > 0) {
    body.tools = [{
      functionDeclarations: tools.map((t: any) => ({
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters,
      })),
    }];
    body.toolConfig = { functionCallingConfig: { mode: "ANY" } };
  }

  try {
    console.log(`Calling Gemini: ${DEFAULT_MODEL}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      return { success: false, error: "Rate limit exceeded. Try again shortly.", statusCode: 429 };
    }

    if (response.status === 403) {
      return { success: false, error: "Invalid GEMINI_API_KEY.", statusCode: 403 };
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini error: ${response.status} ${errText}`);
      return { success: false, error: `API error: ${response.status}`, statusCode: response.status };
    }

    const data: GeminiResponse = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    const fnCall = parts.find((p) => p.functionCall);
    if (fnCall?.functionCall) {
      return { success: true, toolCall: { name: fnCall.functionCall.name, args: fnCall.functionCall.args } };
    }

    const textPart = parts.find((p) => p.text);
    return { success: true, text: textPart?.text || "" };
  } catch (error) {
    console.error("Gemini call failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error", statusCode: 500 };
  }
}

// ========== CAREER MAPPING TYPES & TOOLS ==========

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

const CAREER_MAPPING_TOOL = {
  type: "function",
  function: {
    name: "map_careers",
    description: "Analyze user's hobbies, interests, and skills to recommend top 3 career paths",
    parameters: {
      type: "object",
      properties: {
        careers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Unique kebab-case identifier" },
              title: { type: "string", description: "Career title" },
              icon: { type: "string", enum: ["cpu", "palette", "server", "shield", "gamepad", "brain", "globe"] },
              description: { type: "string", description: "2-3 sentence description" },
              matchScore: { type: "number", description: "Match percentage 70-98" },
              justification: { type: "string", description: "1-2 sentence explanation of WHY this matches their profile" },
              keySkills: { 
                type: "array", 
                items: { type: "string" },
                description: "5 key skills to master"
              },
              averageSalary: { type: "string", description: "Salary range like '$100,000 - $150,000'" },
              demandLevel: { type: "string", enum: ["High", "Very High", "Explosive"] }
            },
            required: ["id", "title", "icon", "description", "matchScore", "justification", "keySkills", "averageSalary", "demandLevel"]
          }
        }
      },
      required: ["careers"]
    }
  }
};

function buildCareerMappingPrompt(answers: QuizAnswers): string {
  const hobbies = answers.hobbies?.join(", ") || "Not specified";
  const interests = answers.interests?.join(", ") || "Not specified";
  const skills = answers.skills?.join(", ") || "Not specified";
  const academics = answers.academics?.join(", ") || "Not specified";

  return `Analyze the intersection of this user's profile to recommend TOP 3 career paths in tech.

## USER PROFILE:
- **Hobbies:** ${hobbies}
- **Core Interests:** ${interests}
- **Current Skills:** ${skills}
- **Academic Background:** ${academics}

## CAREER MAPPING LOGIC:
1. Gaming + Logic/Math → Game Engine Dev, Backend Architect
2. Gaming + Art → Game Designer, Technical Artist
3. Art + Coding → Creative Technologist, Frontend Engineer
4. Problem-solving + AI → ML Engineer, Data Scientist
5. Writing + Coding → Technical Writer, Developer Relations
6. FinTech + Math → Quant Developer, Blockchain Dev
7. Systems + Coding → Backend Architect, DevOps Engineer

## REQUIREMENTS:
1. Return EXACTLY 3 career paths ranked by match score (highest first)
2. Match scores: 70-98 (never 99-100)
3. Justification MUST reference specific items from their profile
4. Key skills = specific technologies
5. Salary: realistic 2026 US market rates`;
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
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY, using fallback careers");
    return new Response(
      JSON.stringify({ careers: getFallbackCareers(quizAnswers) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const prompt = buildCareerMappingPrompt(quizAnswers);

    const result = await callGemini(
      GEMINI_API_KEY,
      "You are an expert career advisor. Use the provided tool to structure your career recommendations.",
      prompt,
      { tools: [CAREER_MAPPING_TOOL], maxOutputTokens: 1000 }
    );

    if (!result.success) {
      console.log("AI call failed, using fallback careers");
      return new Response(
        JSON.stringify({ careers: getFallbackCareers(quizAnswers), error: result.error }),
        { status: result.statusCode === 429 ? 429 : 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (result.toolCall) {
      return new Response(
        JSON.stringify({ careers: result.toolCall.args.careers }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ careers: getFallbackCareers(quizAnswers) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Career mapping error:", error);
    return new Response(
      JSON.stringify({ careers: getFallbackCareers(quizAnswers) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// ========== AGENT PROMPTS (Concise one-liners) ==========

const AGENT_PROMPTS = {
  profiler: `You are THE PROFILER. Analyze the student and respond in EXACTLY this format (one line only):

🎯 [ARCHETYPE] → [Path] • [8-word max insight]

ARCHETYPES: The Builder | The Analyst | The Innovator | The Optimizer | The Creator
PATHS: Foundation Path (< 5 skills) | Precision Path (5+ skills)

EXAMPLES:
🎯 The Builder → Foundation Path • Master Python before building AI systems.
🎯 The Innovator → Precision Path • Your ML stack is interview-ready.

ONE LINE ONLY. No paragraphs.`,

  pulse: `You are THE PULSE. Provide 2026 market intel in EXACTLY this format (one line only):

📈 [Top Role] @ [Company] • Learn: [One Tech] • Gap: [One Skill]

Use real companies: OpenAI, Anthropic, Stripe, Vercel, Google, Meta.
Use real 2026 tech: Agentic AI, RAG, Next.js 15, Rust, Kubernetes.

EXAMPLES:
📈 MLOps Engineer @ Anthropic • Learn: LangGraph • Gap: System Design
📈 Platform Engineer @ Vercel • Learn: Rust • Gap: Kubernetes

ONE LINE ONLY. Dense value.`,

  forge: `You are THE FORGE. Generate ONE project idea in EXACTLY this format (one line only):

🔨 [Project Name] • [Tech Stack] • Ships in [X] weeks

NO todo apps, NO blogs. Must be 2026-relevant (AI, real-time, or automation).
Match to skill level: Beginner=CLI tools, Intermediate=Full-stack, Advanced=Distributed systems.

EXAMPLES:
🔨 PR Sentinel • LangChain + GitHub API • Ships in 3 weeks
🔨 Live Collab Editor • Next.js + WebSocket + GPT-4 • Ships in 4 weeks
🔨 Green Energy Tracker • Playwright + PostgreSQL • Ships in 2 weeks

ONE LINE ONLY. Make it memorable.`,

  gatekeeper: `You are THE GATEKEEPER. Validate or warn in EXACTLY this format (one line only):

⚠️ [RISK]: [Problem] → [Fix]
OR
✅ VALIDATED: [Success factor]

RISKS: Time | Skill Gap | Burnout | Focus | Portfolio
Be specific. Reference their actual data.

EXAMPLES:
⚠️ BURNOUT: 30+ hrs/week unsustainable → Schedule rest days.
⚠️ SKILL GAP: Advanced goals with basic skills → 2 weeks on fundamentals first.
✅ VALIDATED: Build in public for maximum recruiter visibility.

ONE LINE ONLY. Be direct.`,
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

Analyze this and respond in the EXACT format specified. ONE LINE ONLY.`;
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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured", insight: getFallbackAgentInsight(agentType, answers, resumeSkills) }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = AGENT_PROMPTS[agentType];
    const userContext = buildUserContext({ agentType, answers, resumeSkills, resumeProjects, resumeExperience });

    const result = await callGemini(
      GEMINI_API_KEY,
      systemPrompt,
      userContext,
      { maxOutputTokens: 150, temperature: 0.7 }
    );

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error, insight: getFallbackAgentInsight(agentType, answers, resumeSkills) }),
        { status: result.statusCode === 429 ? 429 : 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ insight: result.text || getFallbackAgentInsight(agentType, answers, resumeSkills) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("career-agents error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
