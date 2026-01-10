import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Highly optimized system prompts for each agent
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentType, answers, resumeSkills, resumeProjects, resumeExperience }: AgentRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = AGENT_PROMPTS[agentType];
    if (!systemPrompt) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    const userContext = buildUserContext({ agentType, answers, resumeSkills, resumeProjects, resumeExperience });

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
          { role: "user", content: userContext },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content?.trim() || "Analysis complete.";

    return new Response(
      JSON.stringify({ insight, agentType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Career agents error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
