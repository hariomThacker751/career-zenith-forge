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
    name: "generate_weekly_sprints",
    description: "Generate a 6-month (24-week) roadmap broken into weekly sprints",
    parameters: {
      type: "object",
      properties: {
        sprints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              week: { type: "number", description: "Week number 1-24" },
              theme: { type: "string", description: "Clear title for the week, e.g., 'Mastering Asynchronous State Management'" },
              knowledgeStack: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Resource title" },
                    source: { type: "string", description: "Platform like MIT OCW, CS50, official docs, GitHub" },
                    url: { type: "string", description: "Direct URL to the resource" },
                    type: { type: "string", enum: ["course", "documentation", "tutorial", "repository"] }
                  },
                  required: ["title", "source", "url", "type"]
                },
                description: "2-3 free, reliable learning sources"
              },
              forgeObjective: {
                type: "object",
                properties: {
                  milestone: { type: "string", description: "Specific project milestone for the week" },
                  deliverables: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 major tasks/deliverables for this milestone"
                  }
                },
                required: ["milestone", "deliverables"]
              },
              calendarEvent: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Calendar event title" },
                  description: { type: "string", description: "Event description with to-do list" }
                },
                required: ["summary", "description"]
              }
            },
            required: ["week", "theme", "knowledgeStack", "forgeObjective", "calendarEvent"]
          }
        },
        totalWeeks: { type: "number", description: "Total number of weeks in the roadmap" }
      },
      required: ["sprints", "totalWeeks"]
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
  const skillLevel = data.answers[2] || "Intermediate";
  const interest = data.answers[1] || "Web Development";
  const year = data.answers[0] || "2nd year";
  
  return `You are THE HACKWELL DYNAMIC ORCHESTRATOR - the world's most advanced Career Intelligence Agent. Create a 6-month (24-week) learning and project execution roadmap using WEEKLY SPRINTS.

## Target Project:
- Title: ${project?.title || "Unknown"}
- Description: ${project?.description || "Unknown"}
- Tech Stack: ${project?.techStack?.join(", ") || "Unknown"}
- Difficulty: ${project?.difficulty || "Unknown"}

## User Profile:
- Year: ${year}
- Interest Area: ${interest}
- Skill Level: ${skillLevel}
- Available Hours/Week: ${data.answers[3] || "10-15 hours"}
- Current Skills: ${data.resumeSkills?.join(", ") || "Not specified"}
- Goal: ${data.answers[4] || "Build portfolio projects"}

## Agent Insights:
- PROFILER: ${data.agentInsights.profiler}
- PULSE (Industry Trends): ${data.agentInsights.pulse}
- FORGE: ${data.agentInsights.forge}
- GATEKEEPER (Risks): ${data.agentInsights.gatekeeper}

## CRITICAL REQUIREMENTS:
Generate 8 weekly sprints (representing the first 2 months of the 6-month journey). Each week MUST include:

1. **Theme**: A clear, inspiring title (e.g., "Week 4: Mastering Asynchronous State Management")

2. **Knowledge Stack (2-3 sources)**: 
   - Find REAL, FREE, high-quality resources
   - Use: MIT OCW, CS50, University of Helsinki MOOC, official documentation, freeCodeCamp, The Odin Project, high-authority GitHub repos
   - For a ${year} student in ${interest}, match difficulty appropriately
   - Example: For Python basics → "University of Helsinki's Python MOOC - Part 2"

3. **Forge Objective**:
   - Define a specific PROJECT MILESTONE that builds toward the final 6-month goal
   - Projects must be industry-relevant (e.g., "Implement JWT Auth for your ${project?.title || 'API'}")
   - Include 3 specific deliverables for the week

4. **Calendar Event**:
   - Create a single "Weekly Challenge" summary
   - Description should include a to-do list covering the 3 major tasks

Make the progression logical: start with fundamentals, build complexity, integrate AI/modern tools later.`;
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

function getFallbackPhase3(): { sprints: any[], totalWeeks: number } {
  return {
    totalWeeks: 24,
    sprints: [
      {
        week: 1,
        theme: "Week 1: Foundation & Environment Setup",
        knowledgeStack: [
          { title: "CS50's Introduction to Computer Science", source: "Harvard/edX", url: "https://cs50.harvard.edu/x/", type: "course" },
          { title: "Git & GitHub Fundamentals", source: "GitHub", url: "https://docs.github.com/en/get-started", type: "documentation" },
          { title: "Developer Environment Setup Guide", source: "freeCodeCamp", url: "https://www.freecodecamp.org/news/how-to-set-up-your-development-environment/", type: "tutorial" }
        ],
        forgeObjective: {
          milestone: "Initialize project repository and development environment",
          deliverables: ["Set up Git repository with proper .gitignore", "Configure IDE and linting tools", "Create initial project structure and README"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 1 Challenge: Foundation Setup",
          description: "Weekly To-Do:\n1. Complete Git & GitHub tutorial\n2. Set up development environment\n3. Initialize project repository with documentation"
        }
      },
      {
        week: 2,
        theme: "Week 2: Core Language Mastery",
        knowledgeStack: [
          { title: "Python Programming MOOC", source: "University of Helsinki", url: "https://programming-24.mooc.fi/", type: "course" },
          { title: "JavaScript.info - Modern JavaScript Tutorial", source: "JavaScript.info", url: "https://javascript.info/", type: "tutorial" },
          { title: "TypeScript Handbook", source: "Microsoft", url: "https://www.typescriptlang.org/docs/handbook/", type: "documentation" }
        ],
        forgeObjective: {
          milestone: "Build core utility functions and data models",
          deliverables: ["Implement data validation utilities", "Create type definitions/models", "Write unit tests for utilities"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 2 Challenge: Core Language Skills",
          description: "Weekly To-Do:\n1. Complete language fundamentals module\n2. Implement utility functions\n3. Set up testing framework"
        }
      },
      {
        week: 3,
        theme: "Week 3: API Design & Backend Foundations",
        knowledgeStack: [
          { title: "RESTful API Design Best Practices", source: "Microsoft", url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design", type: "documentation" },
          { title: "FastAPI Tutorial", source: "FastAPI", url: "https://fastapi.tiangolo.com/tutorial/", type: "documentation" },
          { title: "Database Design Course", source: "MIT OCW", url: "https://ocw.mit.edu/courses/6-830-database-systems-fall-2010/", type: "course" }
        ],
        forgeObjective: {
          milestone: "Design and implement core API endpoints",
          deliverables: ["Design database schema", "Implement CRUD endpoints", "Set up API documentation (Swagger/OpenAPI)"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 3 Challenge: Backend Architecture",
          description: "Weekly To-Do:\n1. Complete API design tutorial\n2. Implement database schema\n3. Build and test core endpoints"
        }
      },
      {
        week: 4,
        theme: "Week 4: Authentication & Security",
        knowledgeStack: [
          { title: "OWASP Security Guidelines", source: "OWASP", url: "https://owasp.org/www-project-web-security-testing-guide/", type: "documentation" },
          { title: "JWT Authentication Deep Dive", source: "Auth0", url: "https://auth0.com/learn/json-web-tokens/", type: "tutorial" },
          { title: "OAuth 2.0 Simplified", source: "OAuth.net", url: "https://oauth.net/2/", type: "documentation" }
        ],
        forgeObjective: {
          milestone: "Implement secure authentication system",
          deliverables: ["Set up JWT-based authentication", "Implement user registration/login flows", "Add role-based access control"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 4 Challenge: Security Implementation",
          description: "Weekly To-Do:\n1. Study JWT and OAuth concepts\n2. Implement authentication endpoints\n3. Add protected routes and RBAC"
        }
      }
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