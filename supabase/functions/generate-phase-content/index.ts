import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
              id: { type: "string", description: "Unique kebab-case identifier" },
              title: { type: "string", description: "Course/resource title" },
              source: { type: "string", description: "Platform or provider name" },
              modules: { 
                type: "array", 
                items: { type: "string" },
                description: "4-6 key learning modules"
              },
              duration: { type: "string", description: "Estimated time like '4 weeks'" },
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
              title: { type: "string", description: "Catchy project name" },
              description: { type: "string", description: "2-3 sentence overview" },
              techStack: { 
                type: "array", 
                items: { type: "string" },
                description: "5-6 technologies"
              },
              features: { 
                type: "array", 
                items: { type: "string" },
                description: "5 core features"
              },
              timeline: { type: "string", description: "Estimated completion time" },
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
    name: "generate_sprint_schedule",
    description: "Generate a 7-day sprint schedule for the project",
    parameters: {
      type: "object",
      properties: {
        schedule: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number", description: "Day number 1-7" },
              title: { type: "string", description: "Activity title" },
              description: { type: "string", description: "Detailed description" },
              duration: { type: "string", description: "Hours like '4 hours'" },
              type: { type: "string", enum: ["design", "coding", "testing", "review"] }
            },
            required: ["day", "title", "description", "duration", "type"]
          }
        }
      },
      required: ["schedule"]
    }
  }
};

function buildPhase1Prompt(data: RequestData): string {
  return `You are an expert career advisor. Based on the following AI agent insights and user profile, generate 3-5 highly personalized learning paths to close skill gaps.

## Agent Insights:
- PROFILER: ${data.agentInsights.profiler}
- PULSE (Industry Trends): ${data.agentInsights.pulse}
- GATEKEEPER (Risks): ${data.agentInsights.gatekeeper}

## User Profile:
- Year: ${data.answers[0] || "Not specified"}
- Interest: ${data.answers[1] || "Not specified"}
- Skill Level: ${data.answers[2] || "Not specified"}
- Available Hours/Week: ${data.answers[3] || "Not specified"}
- Goal: ${data.answers[4] || "Not specified"}
- Current Skills: ${data.resumeSkills.join(", ") || "None detected"}
- Past Projects: ${data.resumeProjects.join(", ") || "None"}

## Requirements:
1. Each path should address a specific skill gap identified by the agents
2. Include real courses from platforms like Coursera, edX, Udemy, fast.ai, etc.
3. Order by priority (most critical gap first)
4. Consider their available time when setting durations
5. Match difficulty to their current skill level`;
}

function buildPhase2Prompt(data: RequestData): string {
  return `You are THE FORGE - an expert project architect. Generate 2-3 high-impact, 2026-relevant project ideas.

## Agent Insights:
- FORGE: ${data.agentInsights.forge}
- PULSE (Industry Trends): ${data.agentInsights.pulse}
- PROFILER: ${data.agentInsights.profiler}

## User Profile:
- Interest: ${data.answers[1] || "Not specified"}
- Skill Level: ${data.answers[2] || "Not specified"}
- Goal: ${data.answers[4] || "Not specified"}
- Current Skills: ${data.resumeSkills.join(", ") || "None"}
- Selected Learning Paths: ${data.selectedLearningPaths?.join(", ") || "None"}

## Requirements:
1. NO todo apps, weather apps, or basic CRUD - these are INDUSTRY projects
2. Each project should solve a REAL problem
3. Include modern 2024-2026 tech stacks (AI, real-time, etc.)
4. Projects should be completable in 4-8 weeks
5. Include at least one AI/ML project if user showed interest
6. Features should be specific and impressive for portfolio`;
}

function buildPhase3Prompt(data: RequestData): string {
  const project = data.selectedProject;
  return `You are a senior engineering manager. Create a detailed 7-day sprint schedule for this project.

## Project:
- Title: ${project?.title || "Unknown"}
- Description: ${project?.description || "Unknown"}
- Tech Stack: ${project?.techStack?.join(", ") || "Unknown"}
- Difficulty: ${project?.difficulty || "Unknown"}

## User Context:
- Available Hours/Week: ${data.answers[3] || "10-15 hours"}
- Skill Level: ${data.answers[2] || "Intermediate"}
- Gatekeeper Warning: ${data.agentInsights.gatekeeper}

## Requirements:
1. Day 1 should focus on architecture and setup
2. Days 2-5 should be core feature development
3. Day 6 should be testing and bug fixes
4. Day 7 should be polish and deployment
5. Total hours should be realistic for the user
6. Consider the difficulty level when allocating time
7. Each day should have clear, actionable tasks`;
}

interface ToolDefinition {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

async function callAI(systemPrompt: string, tool: ToolDefinition): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are an expert career advisor and project architect. Always use the provided tool to structure your response." },
        { role: "user", content: systemPrompt }
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } }
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI credits depleted. Please add credits to continue.");
    }
    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall) {
    throw new Error("No tool call in response");
  }

  return JSON.parse(toolCall.function.arguments);
}

// Fallback content when AI fails
function getFallbackPhase1(): { paths: any[] } {
  return {
    paths: [
      {
        id: "cs-fundamentals",
        title: "Computer Science Fundamentals",
        source: "MIT OpenCourseWare",
        modules: ["Data Structures", "Algorithms", "System Design", "Databases"],
        duration: "8 weeks",
        level: "Intermediate"
      },
      {
        id: "modern-web-dev",
        title: "Modern Web Development",
        source: "Frontend Masters",
        modules: ["React 19", "TypeScript", "Next.js 15", "Tailwind CSS"],
        duration: "6 weeks",
        level: "Intermediate"
      },
      {
        id: "ai-ml-basics",
        title: "AI & Machine Learning Basics",
        source: "fast.ai + DeepLearning.AI",
        modules: ["Python for ML", "Neural Networks", "LLM Fundamentals", "Prompt Engineering"],
        duration: "6 weeks",
        level: "Intermediate"
      }
    ]
  };
}

function getFallbackPhase2(): { projects: any[] } {
  return {
    projects: [
      {
        title: "AI-Powered Code Review Assistant",
        description: "Build an intelligent code review tool that analyzes pull requests, suggests improvements, and learns from your codebase patterns using RAG architecture.",
        techStack: ["Python", "LangChain", "FastAPI", "React", "PostgreSQL", "ChromaDB"],
        features: [
          "GitHub integration for PR analysis",
          "AI-powered code suggestions",
          "Custom coding standards enforcement",
          "Learning from team feedback",
          "Slack/Discord notifications"
        ],
        timeline: "5-6 weeks",
        difficulty: "Advanced"
      },
      {
        title: "Real-Time Collaborative Whiteboard",
        description: "Create a Figma-like collaborative canvas with real-time cursors, shape tools, and AI-assisted diagram generation.",
        techStack: ["Next.js 15", "TypeScript", "Supabase", "WebRTC", "Canvas API", "Framer Motion"],
        features: [
          "Real-time collaboration with cursors",
          "Shape and drawing tools",
          "AI diagram generation from text",
          "Export to multiple formats",
          "Team workspace management"
        ],
        timeline: "4-5 weeks",
        difficulty: "Intermediate"
      }
    ]
  };
}

function getFallbackPhase3(): { schedule: any[] } {
  return {
    schedule: [
      { day: 1, title: "Architecture & Setup", description: "Define system architecture, set up project structure, configure development environment", duration: "4 hours", type: "design" },
      { day: 2, title: "Core Backend", description: "Set up API routes, database schema, and authentication", duration: "5 hours", type: "coding" },
      { day: 3, title: "Feature Dev - Part 1", description: "Implement primary features and core business logic", duration: "6 hours", type: "coding" },
      { day: 4, title: "Feature Dev - Part 2", description: "Complete remaining features, integrate external APIs", duration: "6 hours", type: "coding" },
      { day: 5, title: "Frontend Polish", description: "Refine UI components, add animations, improve UX", duration: "5 hours", type: "coding" },
      { day: 6, title: "Testing", description: "Write tests, fix bugs, handle edge cases", duration: "5 hours", type: "testing" },
      { day: 7, title: "Deploy & Review", description: "Code review, documentation, deploy to production", duration: "4 hours", type: "review" }
    ]
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: RequestData = await req.json();
    const { phase, agentInsights } = data;

    if (!agentInsights) {
      throw new Error("Agent insights are required");
    }

    let result: any;

    if (phase === 1) {
      const prompt = buildPhase1Prompt(data);
      try {
        result = await callAI(prompt, PHASE1_TOOL);
      } catch (error) {
        console.error("Phase 1 AI error, using fallback:", error);
        result = getFallbackPhase1();
      }
    } else if (phase === 2) {
      const prompt = buildPhase2Prompt(data);
      try {
        result = await callAI(prompt, PHASE2_TOOL);
      } catch (error) {
        console.error("Phase 2 AI error, using fallback:", error);
        result = getFallbackPhase2();
      }
    } else if (phase === 3) {
      const prompt = buildPhase3Prompt(data);
      try {
        result = await callAI(prompt, PHASE3_TOOL);
      } catch (error) {
        console.error("Phase 3 AI error, using fallback:", error);
        result = getFallbackPhase3();
      }
    } else {
      throw new Error("Invalid phase number");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-phase-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});