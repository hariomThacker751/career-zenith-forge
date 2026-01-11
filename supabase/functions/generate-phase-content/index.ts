import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== GEMINI API DIRECT INTEGRATION ==========
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash-preview-05-20";

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
  options: { tools?: any[]; maxOutputTokens?: number } = {}
): Promise<GeminiCallResult> {
  const { tools, maxOutputTokens = 4000 } = options;

  const url = `${GEMINI_API_URL}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { temperature: 0.7, maxOutputTokens },
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
      return { success: false, error: "Rate limit exceeded.", statusCode: 429 };
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

interface AgentInsights {
  profiler: string;
  pulse: string;
  forge: string;
  gatekeeper: string;
}

interface RequestData {
  phase: 1 | 2 | 3;
  agentInsights: AgentInsights;
  answers: Record<number, string>;
  resumeSkills: string[];
  resumeProjects: string[];
  selectedLearningPaths?: string[];
  selectedProject?: {
    title: string;
    description: string;
    techStack: string[];
    difficulty: string;
  };
  targetCareer?: string;
  exploreAnswers?: Record<string, string[]>;
}

const PHASE1_TOOL = {
  type: "function",
  function: {
    name: "generate_learning_paths",
    description: "Generate 3-5 personalized learning paths based on skill gap analysis",
    parameters: {
      type: "object",
      properties: {
        paths: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              source: { type: "string" },
              modules: { type: "array", items: { type: "string" } },
              duration: { type: "string" },
              level: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] }
            },
            required: ["id", "title", "source", "modules", "duration", "level"]
          }
        }
      },
      required: ["paths"]
    }
  }
};

const PHASE2_TOOL = {
  type: "function",
  function: {
    name: "generate_projects",
    description: "Generate 2-3 industry-relevant project PRDs",
    parameters: {
      type: "object",
      properties: {
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              techStack: { type: "array", items: { type: "string" } },
              features: { type: "array", items: { type: "string" } },
              timeline: { type: "string" },
              difficulty: { type: "string", enum: ["Intermediate", "Advanced"] }
            },
            required: ["title", "description", "techStack", "features", "timeline", "difficulty"]
          }
        }
      },
      required: ["projects"]
    }
  }
};

const PHASE3_TOOL = {
  type: "function",
  function: {
    name: "generate_weekly_sprints",
    description: "Generate 8 weekly sprints with learning resources",
    parameters: {
      type: "object",
      properties: {
        sprints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              week: { type: "number" },
              theme: { type: "string" },
              knowledgeStack: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    source: { type: "string" },
                    url: { type: "string" },
                    type: { type: "string", enum: ["youtube", "course", "documentation", "tutorial", "repository"] },
                    instructor: { type: "string" }
                  },
                  required: ["title", "source", "url", "type"]
                }
              },
              forgeObjective: {
                type: "object",
                properties: {
                  milestone: { type: "string" },
                  deliverables: { type: "array", items: { type: "string" } }
                },
                required: ["milestone", "deliverables"]
              },
              calendarEvent: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  description: { type: "string" }
                },
                required: ["summary", "description"]
              }
            },
            required: ["week", "theme", "knowledgeStack", "forgeObjective", "calendarEvent"]
          }
        },
        totalWeeks: { type: "number" }
      },
      required: ["sprints", "totalWeeks"]
    }
  }
};

function buildPhase1Prompt(data: RequestData): string {
  const targetCareerSection = data.targetCareer 
    ? `TARGET CAREER: ${data.targetCareer}. All paths MUST be specifically tailored for ${data.targetCareer}.`
    : "";

  return `Generate 3-5 personalized learning paths.
${targetCareerSection}

## Agent Insights:
- PROFILER: ${data.agentInsights.profiler}
- PULSE: ${data.agentInsights.pulse}
- GATEKEEPER: ${data.agentInsights.gatekeeper}

## User Profile:
- Year: ${data.answers[0] || "Not specified"}
- Interest: ${data.answers[1] || "Not specified"}
- Skill Level: ${data.answers[2] || "Not specified"}
- Hours/Week: ${data.answers[3] || "Not specified"}
- Skills: ${data.resumeSkills.join(", ") || "None"}

Requirements:
1. Address specific skill gaps
2. Use real courses (Coursera, edX, Udemy, fast.ai)
3. Order by priority
4. Match difficulty to skill level`;
}

function buildPhase2Prompt(data: RequestData): string {
  const targetCareerSection = data.targetCareer 
    ? `TARGET CAREER: ${data.targetCareer}. Projects must be portfolio pieces for ${data.targetCareer} roles.`
    : "";

  return `Generate 2-3 high-impact, 2026-relevant project ideas.
${targetCareerSection}

## Agent Insights:
- FORGE: ${data.agentInsights.forge}
- PULSE: ${data.agentInsights.pulse}

## User Profile:
- Interest: ${data.answers[1] || "Not specified"}
- Skill Level: ${data.answers[2] || "Not specified"}
- Skills: ${data.resumeSkills.join(", ") || "None"}
- Learning Paths: ${data.selectedLearningPaths?.join(", ") || "None"}

Requirements:
1. NO todo apps, weather apps, or basic CRUD
2. Solve REAL problems
3. Modern 2024-2026 tech stacks (AI, real-time)
4. Completable in 4-8 weeks`;
}

function buildPhase3Prompt(data: RequestData): string {
  const project = data.selectedProject;
  const targetCareerSection = data.targetCareer 
    ? `TARGET CAREER: ${data.targetCareer}. Roadmap for landing a job as ${data.targetCareer}.`
    : "";

  return `Create 8 weekly sprints with THE BEST free learning resources.
${targetCareerSection}

## Target Project:
- Title: ${project?.title || "Unknown"}
- Tech Stack: ${project?.techStack?.join(", ") || "Unknown"}
- Difficulty: ${project?.difficulty || "Unknown"}

## User Profile:
- Year: ${data.answers[0]}
- Skill Level: ${data.answers[2]}
- Hours/Week: ${data.answers[3] || "10-15"}
- Skills: ${data.resumeSkills?.join(", ") || "Not specified"}

## VERIFIED YOUTUBE CHANNELS (use these):
- Traversy Media, Fireship, Net Ninja, freeCodeCamp.org, Web Dev Simplified, Academind

## VERIFIED COURSES (use these):
- CS50: https://cs50.harvard.edu/x/
- Full Stack Open: https://fullstackopen.com/en/
- The Odin Project: https://www.theodinproject.com/

Each week needs: theme, 2-3 knowledge stack resources, forge objective with 3 deliverables, calendar event.`;
}

interface ToolDefinition {
  type: string;
  function: { name: string; description: string; parameters: object };
}

async function callAI(systemPrompt: string, tool: ToolDefinition): Promise<any> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const result = await callGemini(
    GEMINI_API_KEY,
    "You are an expert career advisor and project architect. Always use the provided tool to structure your response.",
    systemPrompt,
    { tools: [tool], maxOutputTokens: 4000 }
  );

  if (!result.success) {
    throw new Error(result.error || "AI call failed");
  }

  if (!result.toolCall) {
    throw new Error("No tool call in response");
  }

  return result.toolCall.args;
}

// Fallback content
function getFallbackPhase1(): { paths: any[] } {
  return {
    paths: [
      { id: "cs-fundamentals", title: "Computer Science Fundamentals", source: "MIT OpenCourseWare", modules: ["Data Structures", "Algorithms", "System Design", "Databases"], duration: "8 weeks", level: "Intermediate" },
      { id: "modern-web-dev", title: "Modern Web Development", source: "Frontend Masters", modules: ["React 19", "TypeScript", "Next.js 15", "Tailwind CSS"], duration: "6 weeks", level: "Intermediate" },
      { id: "ai-ml-basics", title: "AI & Machine Learning Basics", source: "fast.ai", modules: ["Python for ML", "Neural Networks", "LLM Fundamentals", "Prompt Engineering"], duration: "6 weeks", level: "Intermediate" }
    ]
  };
}

function getFallbackPhase2(): { projects: any[] } {
  return {
    projects: [
      { title: "AI-Powered Code Review Assistant", description: "Build an intelligent code review tool using RAG architecture.", techStack: ["Python", "LangChain", "FastAPI", "React", "PostgreSQL"], features: ["GitHub integration", "AI suggestions", "Custom standards", "Team feedback", "Notifications"], timeline: "5-6 weeks", difficulty: "Advanced" },
      { title: "Real-Time Collaborative Whiteboard", description: "Create a Figma-like collaborative canvas with real-time cursors.", techStack: ["Next.js 15", "TypeScript", "Supabase", "WebRTC", "Canvas API"], features: ["Real-time cursors", "Drawing tools", "AI diagrams", "Export", "Workspaces"], timeline: "4-5 weeks", difficulty: "Intermediate" }
    ]
  };
}

function getFallbackPhase3(): { sprints: any[], totalWeeks: number } {
  return {
    totalWeeks: 8,
    sprints: [
      { week: 1, theme: "Week 1: Foundation & Environment Setup", knowledgeStack: [{ title: "CS50 Introduction", source: "Harvard", url: "https://cs50.harvard.edu/x/", type: "course", instructor: "David Malan" }, { title: "Git Crash Course", source: "YouTube", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", type: "youtube", instructor: "freeCodeCamp" }], forgeObjective: { milestone: "Initialize project repository", deliverables: ["Set up Git repo", "Configure VS Code", "Create README"] }, calendarEvent: { summary: "[Hackwell] Week 1", description: "Git & environment setup" } },
      { week: 2, theme: "Week 2: Core Language Mastery", knowledgeStack: [{ title: "JavaScript Full Course", source: "YouTube", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", type: "youtube", instructor: "freeCodeCamp" }], forgeObjective: { milestone: "Build utility functions", deliverables: ["Data validation", "Type definitions", "Unit tests"] }, calendarEvent: { summary: "[Hackwell] Week 2", description: "Language fundamentals" } },
      { week: 3, theme: "Week 3: API Design & Backend", knowledgeStack: [{ title: "Node.js Full Course", source: "YouTube", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", type: "youtube", instructor: "freeCodeCamp" }], forgeObjective: { milestone: "Implement core API", deliverables: ["Database schema", "CRUD endpoints", "API docs"] }, calendarEvent: { summary: "[Hackwell] Week 3", description: "Backend architecture" } },
      { week: 4, theme: "Week 4: Authentication & Security", knowledgeStack: [{ title: "JWT Authentication", source: "YouTube", url: "https://www.youtube.com/watch?v=mbsmsi7l3r4", type: "youtube", instructor: "Web Dev Simplified" }], forgeObjective: { milestone: "Implement auth system", deliverables: ["JWT auth", "Password hashing", "Protected routes"] }, calendarEvent: { summary: "[Hackwell] Week 4", description: "Security implementation" } },
      { week: 5, theme: "Week 5: React Fundamentals", knowledgeStack: [{ title: "React Full Course", source: "YouTube", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", type: "youtube", instructor: "freeCodeCamp" }], forgeObjective: { milestone: "Build component library", deliverables: ["UI components", "Composition patterns", "Storybook docs"] }, calendarEvent: { summary: "[Hackwell] Week 5", description: "React components" } },
      { week: 6, theme: "Week 6: State Management", knowledgeStack: [{ title: "React Query Tutorial", source: "YouTube", url: "https://www.youtube.com/watch?v=r8Dg0KVnfMA", type: "youtube", instructor: "Web Dev Simplified" }], forgeObjective: { milestone: "Implement global state", deliverables: ["TanStack Query", "Zustand state", "Optimistic updates"] }, calendarEvent: { summary: "[Hackwell] Week 6", description: "State & data" } },
      { week: 7, theme: "Week 7: Database Integration", knowledgeStack: [{ title: "PostgreSQL Course", source: "YouTube", url: "https://www.youtube.com/watch?v=qw--VYLpxG4", type: "youtube", instructor: "freeCodeCamp" }], forgeObjective: { milestone: "Complete database layer", deliverables: ["Schema design", "Migrations", "Real-time sync"] }, calendarEvent: { summary: "[Hackwell] Week 7", description: "Database mastery" } },
      { week: 8, theme: "Week 8: Testing & Deployment", knowledgeStack: [{ title: "React Testing Library", source: "YouTube", url: "https://www.youtube.com/watch?v=7dTTFW7yACQ", type: "youtube", instructor: "freeCodeCamp" }], forgeObjective: { milestone: "Achieve 80%+ test coverage", deliverables: ["Unit tests", "Integration tests", "CI/CD setup"] }, calendarEvent: { summary: "[Hackwell] Week 8", description: "Testing excellence" } }
    ]
  };
}

function buildExploreInsights(targetCareer: string, exploreAnswers: Record<string, string[]>): AgentInsights {
  const academicPosition = exploreAnswers.academic_position?.[0] || "student";
  const skillLevel = exploreAnswers.skill_level?.[0] || "beginner";
  const workEnergy = exploreAnswers.work_energy?.[0] || "logic";
  const constraints = exploreAnswers.constraints?.[0] || "flexible";
  const buildIdea = exploreAnswers.build_idea?.[0] || "a useful tool";
  
  return {
    profiler: `User is a ${academicPosition} at ${skillLevel} level. Work energy: ${workEnergy}. Build idea: "${buildIdea}". Target: ${targetCareer}.`,
    pulse: `${targetCareer} roles are in high demand. Focus on AI, cloud-native, and real-time systems.`,
    forge: `Projects for ${targetCareer}: Build portfolio pieces demonstrating ${workEnergy} skills.`,
    gatekeeper: `Constraints: ${constraints}. Start with fundamentals. Build incrementally.`
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: RequestData = await req.json();
    let { phase, agentInsights, targetCareer, exploreAnswers } = data;

    if (!agentInsights && targetCareer && exploreAnswers) {
      agentInsights = buildExploreInsights(targetCareer, exploreAnswers);
      data.agentInsights = agentInsights;
    }

    if (!agentInsights) {
      throw new Error("Agent insights are required");
    }

    let result: any;

    if (phase === 1) {
      try {
        result = await callAI(buildPhase1Prompt(data), PHASE1_TOOL);
      } catch (error) {
        console.error("Phase 1 AI error:", error);
        result = getFallbackPhase1();
      }
    } else if (phase === 2) {
      try {
        result = await callAI(buildPhase2Prompt(data), PHASE2_TOOL);
      } catch (error) {
        console.error("Phase 2 AI error:", error);
        result = getFallbackPhase2();
      }
    } else if (phase === 3) {
      try {
        result = await callAI(buildPhase3Prompt(data), PHASE3_TOOL);
      } catch (error) {
        console.error("Phase 3 AI error:", error);
        result = getFallbackPhase3();
      }
    } else {
      throw new Error("Invalid phase number");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
