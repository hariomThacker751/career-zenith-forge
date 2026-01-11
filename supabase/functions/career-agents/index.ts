import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== MULTI-MODEL FALLBACK CONFIGURATION ==========
// Models ordered by preference: fastest/newest first, then fallbacks
const MODEL_PRIORITY = [
  "google/gemini-3-flash-preview",  // Latest, fastest
  "google/gemini-2.5-flash",        // Balanced performance
  "google/gemini-2.5-flash-lite",   // Lightweight fallback
  "google/gemini-2.5-pro",          // Heavy-duty fallback
];

interface ModelCallResult {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
  modelUsed?: string;
}

// Intelligent model caller with automatic fallback
async function callWithModelFallback(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  options: {
    tools?: any[];
    tool_choice?: any;
    max_tokens?: number;
    temperature?: number;
  } = {}
): Promise<ModelCallResult> {
  const { tools, tool_choice, max_tokens = 200, temperature = 0.7 } = options;
  
  for (let i = 0; i < MODEL_PRIORITY.length; i++) {
    const model = MODEL_PRIORITY[i];
    console.log(`Attempting model ${i + 1}/${MODEL_PRIORITY.length}: ${model}`);
    
    try {
      const body: any = {
        model,
        messages,
        max_tokens,
        temperature,
      };
      
      if (tools) body.tools = tools;
      if (tool_choice) body.tool_choice = tool_choice;
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      
      // Handle rate limits - try next model
      if (response.status === 429) {
        console.log(`Rate limited on ${model}, trying next model...`);
        // Add small delay before trying next model
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      // Payment required - can't fallback, return error
      if (response.status === 402) {
        return {
          success: false,
          error: "AI credits depleted. Please add credits to continue.",
          statusCode: 402,
        };
      }
      
      // Server error - try next model
      if (response.status >= 500) {
        console.log(`Server error on ${model}: ${response.status}, trying next model...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        continue;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error on ${model}: ${response.status} ${errorText}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`Success with model: ${model}`);
      
      return {
        success: true,
        data,
        modelUsed: model,
      };
    } catch (error) {
      console.error(`Exception on ${model}:`, error);
      // Try next model on network/parse errors
      await new Promise(resolve => setTimeout(resolve, 300));
      continue;
    }
  }
  
  // All models failed
  return {
    success: false,
    error: "All AI models are currently unavailable. Please try again later.",
    statusCode: 503,
  };
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

  return `You are THE HACKWELL CAREER INTELLIGENCE ENGINE. Analyze the intersection of this user's hobbies, interests, and skills to recommend their TOP 3 most fitting career paths in tech.

## USER PROFILE:
- **Hobbies:** ${hobbies}
- **Core Interests:** ${interests}
- **Current Skills:** ${skills}
- **Academic Background:** ${academics}

## CAREER MAPPING LOGIC:
Use these combinations to determine careers:

1. **Gaming + Logic/Math → Game Engine Dev, Backend Architect**
2. **Gaming + Art → Game Designer, Technical Artist**
3. **Art + Coding → Creative Technologist, Frontend Engineer, UI/UX Developer**
4. **Problem-solving + AI → ML Engineer, Data Scientist, AI Researcher**
5. **Writing + Coding → Technical Writer, Developer Relations, Content Engineer**
6. **FinTech + Math → Quant Developer, FinTech Engineer, Blockchain Dev**
7. **Systems + Coding → Backend Architect, DevOps Engineer, SRE**
8. **Social Impact + Any → Product Engineer (Impact), EdTech Developer, HealthTech Engineer**

## REQUIREMENTS:
1. Return EXACTLY 3 career paths ranked by match score (highest first)
2. Match scores should range from 70-98 (never 99-100 - stay realistic)
3. Justification MUST reference specific items from their profile (e.g., "Your love for gaming combined with...")
4. Key skills should be specific technologies and concepts
5. Salary ranges should be realistic 2026 US market rates
6. Demand levels: High (steady jobs), Very High (many openings), Explosive (new/emerging field)

Be creative and specific in matching hobbies to unexpected but logical career paths!`;
}

function getFallbackCareers(answers: QuizAnswers): CareerPath[] {
  const hobbies = answers.hobbies || [];
  const interests = answers.interests || [];
  const skills = answers.skills || [];

  const careers: CareerPath[] = [];

  if (hobbies.includes("gaming") && (skills.includes("coding") || skills.includes("math"))) {
    careers.push({
      id: "game-dev",
      title: "Game Engine Developer",
      icon: "gamepad",
      description: "Build the core systems that power next-gen games. From physics engines to rendering pipelines.",
      matchScore: 92,
      justification: "Your love for gaming combined with strong logic skills makes you perfect for game engine development.",
      keySkills: ["C++", "Unity/Unreal", "Physics", "3D Math", "Optimization"],
      averageSalary: "$95,000 - $150,000",
      demandLevel: "High"
    });
  }

  if (interests.includes("ai") || hobbies.includes("problem-solving")) {
    careers.push({
      id: "ml-engineer",
      title: "Machine Learning Engineer",
      icon: "brain",
      description: "Design and deploy AI systems that learn from data. The frontier of tech innovation.",
      matchScore: 88,
      justification: "Your interest in AI and problem-solving aligns perfectly with ML engineering demands.",
      keySkills: ["Python", "TensorFlow/PyTorch", "Math", "Statistics", "Cloud"],
      averageSalary: "$130,000 - $200,000",
      demandLevel: "Explosive"
    });
  }

  if (hobbies.includes("art") || skills.includes("design")) {
    careers.push({
      id: "creative-tech",
      title: "Creative Technologist",
      icon: "palette",
      description: "Bridge art and technology. Create interactive experiences and innovative interfaces.",
      matchScore: 85,
      justification: "Your artistic eye combined with tech skills positions you for creative technology roles.",
      keySkills: ["JavaScript", "Three.js", "WebGL", "Design Systems", "Motion"],
      averageSalary: "$85,000 - $140,000",
      demandLevel: "High"
    });
  }

  if (interests.includes("fintech") || skills.includes("excel")) {
    careers.push({
      id: "fintech-dev",
      title: "FinTech Developer",
      icon: "globe",
      description: "Build the future of finance. From trading systems to blockchain applications.",
      matchScore: 82,
      justification: "Your interest in finance and analytical skills are perfect for FinTech development.",
      keySkills: ["Python", "SQL", "APIs", "Blockchain", "Security"],
      averageSalary: "$100,000 - $170,000",
      demandLevel: "Very High"
    });
  }

  if (interests.includes("systems") || skills.includes("coding")) {
    careers.push({
      id: "backend-architect",
      title: "Backend Architect",
      icon: "server",
      description: "Design scalable systems that handle millions of users. The backbone of modern tech.",
      matchScore: 80,
      justification: "Your interest in high-performance systems points to backend architecture.",
      keySkills: ["Go/Rust", "Databases", "Kubernetes", "System Design", "Performance"],
      averageSalary: "$120,000 - $180,000",
      demandLevel: "Very High"
    });
  }

  // Default careers if nothing matched
  if (careers.length < 3) {
    careers.push({
      id: "fullstack-dev",
      title: "Full-Stack Developer",
      icon: "cpu",
      description: "Master both frontend and backend. The most versatile role in tech.",
      matchScore: 75,
      justification: "A full-stack role gives you flexibility to explore and find your niche.",
      keySkills: ["React", "Node.js", "SQL", "TypeScript", "Cloud"],
      averageSalary: "$80,000 - $140,000",
      demandLevel: "Very High"
    });
  }

  return careers.slice(0, 3);
}

async function handleCareerMapping(quizAnswers: QuizAnswers): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.log("No API key, using fallback careers");
    return new Response(
      JSON.stringify({ careers: getFallbackCareers(quizAnswers) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const prompt = buildCareerMappingPrompt(quizAnswers);

    const result = await callWithModelFallback(
      LOVABLE_API_KEY,
      [
        { role: "system", content: "You are an expert career advisor. Use the provided tool to structure your career recommendations." },
        { role: "user", content: prompt }
      ],
      {
        tools: [CAREER_MAPPING_TOOL],
        tool_choice: { type: "function", function: { name: "map_careers" } },
        max_tokens: 1000,
        temperature: 0.7,
      }
    );

    if (!result.success) {
      if (result.statusCode === 402) {
        return new Response(
          JSON.stringify({ error: result.error, careers: getFallbackCareers(quizAnswers) }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("AI call failed, using fallback careers");
      return new Response(
        JSON.stringify({ careers: getFallbackCareers(quizAnswers) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toolCall = result.data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error("No tool call in response");
      return new Response(
        JSON.stringify({ careers: getFallbackCareers(quizAnswers) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify({ careers: parsed.careers, modelUsed: result.modelUsed }),
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

// ========== ORIGINAL AGENT LOGIC ==========

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
  const { answers, resumeSkills, resumeProjects, resumeExperience } = data;
  
  return `
USER PROFILE DATA:
- Year of study: ${answers[0] || "Not specified"}
- Primary interest: ${answers[1] || "Not specified"}
- Technical level: ${answers[2] || "Not specified"}
- Weekly hours available: ${answers[3] || "Not specified"}
- Career goal: ${answers[4] || "Not specified"}

RESUME ANALYSIS:
- Skills detected (${resumeSkills.length}): ${resumeSkills.slice(0, 15).join(", ") || "None provided"}
- Past projects: ${resumeProjects.slice(0, 5).join("; ") || "None listed"}
- Experience: ${resumeExperience.slice(0, 3).join("; ") || "None listed"}

Analyze this profile and provide your expert assessment.`;
}

// Note: fetchWithRetry replaced by callWithModelFallback for better rate limit handling

// Fallback insights when AI fails
function getFallbackInsight(
  agentType: string,
  answers: Record<number, string>,
  resumeSkills: string[],
  resumeProjects: string[]
): string {
  const year = answers?.[0] || "";
  const interest = answers?.[1] || "";
  const level = answers?.[2] || "";
  const hours = answers?.[3] || "";

  switch (agentType) {
    case "profiler":
      if (resumeSkills?.length >= 10) {
        return `The Builder: Advanced profile with ${resumeSkills.length} skills detected. Precision Path recommended—focus on industry specialization and production-grade projects.`;
      }
      if (year.includes("1st") || year.includes("2nd")) {
        return "The Learner: Foundation Path detected. Focus on CS fundamentals, problem-solving mindset, and building your first meaningful projects.";
      }
      return "The Achiever: Precision Path detected. Focus on specialization, interview prep, and production-grade portfolio building.";

    case "pulse":
      if (interest.includes("AI")) {
        return "Hot roles: MLOps Engineer, Agentic AI Developer, AI Safety Researcher. Companies: OpenAI, Anthropic, Google DeepMind. Must-learn: LangChain + RAG architecture for 2026.";
      }
      if (interest.includes("web") || interest.includes("app")) {
        return "Hot roles: Full-Stack Engineer, Design Engineer, Platform Lead. Companies: Vercel, Stripe, Linear. Must-learn: Next.js 15, React Server Components, Edge Computing.";
      }
      return "Hot roles: Platform Engineer, SRE, Data Engineer. Companies: Datadog, Snowflake, HashiCorp. Must-learn: Kubernetes, Go/Rust for systems, observability.";

    case "forge":
      if (level.includes("loop") || level.includes("basic")) {
        return "CLI Study Scheduler: Automated Pomodoro timer with analytics and streak tracking. Tech: Python, JSON, matplotlib, argparse. USP: Learn file I/O, data viz, and CLI design.";
      }
      if (interest.includes("AI")) {
        return "Autonomous PR Reviewer: LangChain agent that audits GitHub PRs for security vulnerabilities. Tech: Python, LangChain, GitHub API, ChromaDB. USP: Learns from codebase patterns.";
      }
      return "Real-time Collab Editor: Multiplayer code editor with AI pair programming. Tech: Next.js, WebSocket, GPT-4, Yjs. USP: Conflict resolution + live cursors + AI suggestions.";

    case "gatekeeper":
      if (resumeSkills?.length > 0 && resumeSkills.length < 5) {
        return "⚠️ Skill Gap Risk: Limited foundation detected with only " + resumeSkills.length + " skills. Recommendation: Spend 2 weeks on fundamentals before diving into advanced projects.";
      }
      if (hours.includes("5-10")) {
        return "⚠️ Velocity Risk: 5-10 hours/week may slow progress significantly. Recommendation: Focus on ONE skill deeply rather than spreading thin across multiple technologies.";
      }
      if (hours.includes("30+")) {
        return "⚠️ Burnout Risk: 30+ hours/week needs a rest strategy. Recommendation: Schedule mandatory rest days. Consistency beats intensity—sustainable pace wins.";
      }
      return "✅ Roadmap validated. Success factor: Build in public, document your journey on Twitter/LinkedIn, and seek feedback from experienced developers early.";

    default:
      return "Analysis complete. Proceed to the next phase.";
  }
}

// ========== MAIN HANDLER ==========

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Handle career mapping requests
    if (body.type === "career-mapping") {
      return await handleCareerMapping(body.quizAnswers);
    }
    
    // Handle original agent requests
    const { agentType, answers, resumeSkills, resumeProjects, resumeExperience }: AgentRequest = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = AGENT_PROMPTS[agentType];
    if (!systemPrompt) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    const userContext = buildUserContext({ agentType, answers, resumeSkills, resumeProjects, resumeExperience });

    console.log(`Processing ${agentType} agent request with multi-model fallback...`);

    const result = await callWithModelFallback(
      LOVABLE_API_KEY,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContext },
      ],
      {
        max_tokens: 200,
        temperature: 0.7,
      }
    );

    if (!result.success) {
      if (result.statusCode === 402) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Return fallback response for other errors
      const fallbackInsight = getFallbackInsight(agentType, answers, resumeSkills, resumeProjects);
      return new Response(
        JSON.stringify({ insight: fallbackInsight, agentType, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const insight = result.data.choices?.[0]?.message?.content?.trim() || "Analysis complete.";

    console.log(`${agentType} agent completed successfully using ${result.modelUsed}`);

    return new Response(
      JSON.stringify({ insight, agentType, modelUsed: result.modelUsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Career agents error:", error);
    
    // Try to parse request for fallback
    try {
      const body = await req.clone().json();
      const { agentType, answers, resumeSkills, resumeProjects } = body;
      const fallbackInsight = getFallbackInsight(agentType, answers, resumeSkills, resumeProjects);
      
      return new Response(
        JSON.stringify({ insight: fallbackInsight, agentType, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
});
