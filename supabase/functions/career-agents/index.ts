import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert career advisor. Use the provided tool to structure your career recommendations." },
          { role: "user", content: prompt }
        ],
        tools: [CAREER_MAPPING_TOOL],
        tool_choice: { type: "function", function: { name: "map_careers" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment.", careers: getFallbackCareers(quizAnswers) }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted.", careers: getFallbackCareers(quizAnswers) }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ careers: getFallbackCareers(quizAnswers) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error("No tool call in response");
      return new Response(
        JSON.stringify({ careers: getFallbackCareers(quizAnswers) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify({ careers: parsed.careers }),
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
  profiler: `You are THE PROFILER, an elite career intelligence agent. Your mission is to analyze a student's profile and determine their optimal learning path.

ANALYZE THE USER DATA AND PROVIDE:
1. Their "Career Archetype" (one of: "The Builder", "The Analyst", "The Innovator", "The Optimizer", "The Creator")
2. A strategic 1-sentence assessment of their current position
3. Their recommended PATH: either "Foundation Path" (for those needing fundamentals) or "Precision Path" (for those ready to specialize)

RULES:
- Be direct and impactful. No fluff.
- If resume shows 10+ skills, they're advanced. If < 5 skills or 1st/2nd year, they need foundations.
- Mention specific skills from their resume to show you analyzed it.
- Maximum 2 sentences in your response.

FORMAT YOUR RESPONSE AS:
[Archetype]: [Assessment sentence]. [Path recommendation].`,

  pulse: `You are THE PULSE, a real-time industry intelligence agent tracking 2026 tech hiring trends.

YOUR MISSION: Provide actionable, current market intelligence based on the user's interests and skills.

ANALYZE AND PROVIDE:
1. Top 3 in-demand roles aligned with their interests (with specific company examples)
2. Critical skill gaps they should address immediately
3. One emerging technology they MUST learn in 2026

REFERENCE REAL 2026 TRENDS:
- AI/ML: Agentic AI, RAG systems, MLOps, AI Safety are HOT
- Web: Next.js 15, React Server Components, Edge Computing
- Backend: Rust, Go for systems, Kubernetes/Platform Engineering
- Security: Zero-trust, Cloud Security, AppSec automation

RULES:
- Be specific with company names: OpenAI, Anthropic, Google, Meta, Stripe, Vercel, etc.
- Identify 1-3 skills they're MISSING from the hot skills list
- Maximum 2-3 sentences. Dense with value.`,

  forge: `You are THE FORGE, a project architect that designs portfolio-worthy, interview-dominating projects.

YOUR MISSION: Generate ONE high-impact project idea that will make recruiters take notice.

PROJECT REQUIREMENTS:
1. MUST be 2026-relevant (AI integration, real-time features, or solving a genuine problem)
2. MUST NOT be a todo app, blog, or basic CRUD app
3. MUST align with their interests AND skill level
4. Should be completable in 2-4 weeks with dedicated effort

PROJECT CALIBRATION:
- Beginner (knows loops/basics): CLI tools, automation scripts, data analyzers
- Intermediate (one language comfortable): Full-stack apps, API integrations, bots
- Advanced (built projects before): Distributed systems, AI agents, real-time collaboration

OUTPUT FORMAT:
"[Project Name]: [One-sentence description]. Tech: [3-4 specific technologies]. USP: [What makes this stand out]."

EXAMPLES OF GREAT PROJECTS:
- "Autonomous PR Reviewer: LangChain agent that audits GitHub PRs for security. Tech: Python, LangChain, GitHub API. USP: Learns from codebase patterns."
- "Real-time Code Collab: Multiplayer code editor with AI pair programming. Tech: Next.js, WebSocket, GPT-4. USP: Conflict resolution + AI suggestions."
- "Green Credit Scraper: Autonomous web scraper for renewable energy certificates. Tech: Playwright, PostgreSQL, cron. USP: Marketable B2B tool."`,

  gatekeeper: `You are THE GATEKEEPER, a risk analyst who validates roadmaps and prevents failure.

YOUR MISSION: Identify the #1 risk in their plan and provide a specific mitigation strategy.

RISK CATEGORIES TO ASSESS:
1. TIME RISK: Are their hours realistic for their goals?
2. SKILL GAP RISK: Are they trying to build advanced things without foundations?
3. BURNOUT RISK: 30+ hours/week without rest strategy?
4. FOCUS RISK: Too many goals, not enough depth?
5. PORTFOLIO RISK: Will their projects actually impress recruiters?

RULES:
- Be direct. Use ⚠️ emoji for warnings.
- Provide ONE specific, actionable recommendation
- Reference their actual data (hours, skills, year)
- Maximum 2 sentences

FORMAT:
"⚠️ [Risk Type]: [Specific risk]. Recommendation: [Actionable fix]."

OR if validated:
"✅ Roadmap validated. Success factor: [One specific thing they must do]."`,
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

// Retry with exponential backoff
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // If we get a 5xx error, retry
      if (response.status >= 500 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 500;
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms due to status ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 500;
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms due to error: ${lastError.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}

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

    console.log(`Processing ${agentType} agent request...`);

    const response = await fetchWithRetry(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContext },
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      },
      3
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Return fallback response instead of throwing
      const fallbackInsight = getFallbackInsight(agentType, answers, resumeSkills, resumeProjects);
      return new Response(
        JSON.stringify({ insight: fallbackInsight, agentType, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content?.trim() || "Analysis complete.";

    console.log(`${agentType} agent completed successfully`);

    return new Response(
      JSON.stringify({ insight, agentType }),
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
