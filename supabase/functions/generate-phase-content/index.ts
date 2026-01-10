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
  targetCareer?: string; // From Explore Mode
  exploreAnswers?: Record<string, string[]>; // Quiz answers from Explore Mode
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
    description: "Generate a 6-month (24-week) roadmap broken into weekly sprints with verified, working resource links",
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
                    title: { type: "string", description: "Exact resource/playlist title" },
                    source: { type: "string", description: "Platform: YouTube, MIT OCW, CS50, freeCodeCamp, Coursera, official docs" },
                    url: { type: "string", description: "VERIFIED working URL - must be real and accessible" },
                    type: { type: "string", enum: ["youtube", "course", "documentation", "tutorial", "repository"] },
                    instructor: { type: "string", description: "Channel name or instructor (for YouTube)" }
                  },
                  required: ["title", "source", "url", "type"]
                },
                description: "2-3 BEST-IN-CLASS free learning sources including YouTube playlists"
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
  const targetCareerSection = data.targetCareer 
    ? `\n## TARGET CAREER (from Explore Mode): ${data.targetCareer}
This user has already selected their target career. All learning paths MUST be specifically tailored to help them become a ${data.targetCareer}.`
    : "";

  const exploreContext = data.exploreAnswers
    ? `\n## Explore Mode Quiz Answers:
- Hobbies: ${data.exploreAnswers.hobbies?.join(", ") || "Not specified"}
- Interests: ${data.exploreAnswers.interests?.join(", ") || "Not specified"}  
- Current Skills: ${data.exploreAnswers.skills?.join(", ") || "Not specified"}
- Branch/Major: ${data.exploreAnswers.branch?.join(", ") || "Not specified"}
- Year: ${data.exploreAnswers.year?.join(", ") || "Not specified"}`
    : "";

  return `You are an expert career advisor. Based on the following AI agent insights and user profile, generate 3-5 highly personalized learning paths to close skill gaps.
${targetCareerSection}
${exploreContext}

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
1. Each path should address a specific skill gap for ${data.targetCareer || "their goal"}
2. Include real courses from platforms like Coursera, edX, Udemy, fast.ai, etc.
3. Order by priority (most critical gap first)
4. Consider their available time when setting durations
5. Match difficulty to their current skill level
6. ${data.targetCareer ? `FOCUS ALL PATHS on skills needed for ${data.targetCareer}` : "Focus on closing skill gaps identified by agents"}`;
}

function buildPhase2Prompt(data: RequestData): string {
  const targetCareerSection = data.targetCareer 
    ? `\n## TARGET CAREER: ${data.targetCareer}
All projects MUST be specifically designed for someone pursuing a career as ${data.targetCareer}. The projects should directly build portfolio pieces relevant to ${data.targetCareer} roles.`
    : "";

  return `You are THE FORGE - an expert project architect. Generate 2-3 high-impact, 2026-relevant project ideas.
${targetCareerSection}

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
2. Each project should solve a REAL problem ${data.targetCareer ? `relevant to ${data.targetCareer}` : ""}
3. Include modern 2024-2026 tech stacks (AI, real-time, etc.)
4. Projects should be completable in 4-8 weeks
5. ${data.targetCareer ? `Projects MUST be impressive for ${data.targetCareer} job applications` : "Include at least one AI/ML project if user showed interest"}
6. Features should be specific and impressive for portfolio`;
}

function buildPhase3Prompt(data: RequestData): string {
  const project = data.selectedProject;
  const skillLevel = data.answers[2] || "Intermediate";
  const interest = data.answers[1] || "Web Development";
  const year = data.answers[0] || "2nd year";
  
  const targetCareerSection = data.targetCareer 
    ? `\n## TARGET CAREER: ${data.targetCareer}
This roadmap is specifically for someone pursuing a career as ${data.targetCareer}. All learning resources and milestones should directly contribute to landing a job as ${data.targetCareer}.`
    : "";

  return `You are THE HACKWELL DYNAMIC ORCHESTRATOR - the world's most advanced Career Intelligence Agent. Create a 6-month (24-week) learning roadmap using WEEKLY SPRINTS with THE BEST learning resources available.
${targetCareerSection}

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
- Goal: ${data.targetCareer ? `Become a ${data.targetCareer}` : (data.answers[4] || "Build portfolio projects")}

## Agent Insights:
- PROFILER: ${data.agentInsights.profiler}
- PULSE (Industry Trends): ${data.agentInsights.pulse}
- FORGE: ${data.agentInsights.forge}
- GATEKEEPER (Risks): ${data.agentInsights.gatekeeper}

## CRITICAL REQUIREMENTS FOR KNOWLEDGE STACK:
Generate 8 weekly sprints. For each week's Knowledge Stack, you MUST use ONLY these VERIFIED, WORKING resources:

### PREMIUM YOUTUBE CHANNELS (use exact playlist URLs):
- **Traversy Media**: https://www.youtube.com/@TraversyMedia/playlists
- **Fireship**: https://www.youtube.com/@Fireship/playlists  
- **The Coding Train**: https://www.youtube.com/@TheCodingTrain/playlists
- **Net Ninja**: https://www.youtube.com/@NetNinja/playlists
- **Corey Schafer** (Python): https://www.youtube.com/@coreyms/playlists
- **Web Dev Simplified**: https://www.youtube.com/@WebDevSimplified/playlists
- **Tech With Tim**: https://www.youtube.com/@TechWithTim/playlists
- **freeCodeCamp.org**: https://www.youtube.com/@freecodecamp/playlists
- **Academind**: https://www.youtube.com/@academind/playlists
- **Programming with Mosh**: https://www.youtube.com/@programmingwithmosh/playlists

### VERIFIED COURSE PLATFORMS (use exact course URLs):
- **CS50**: https://cs50.harvard.edu/x/
- **MIT OCW**: https://ocw.mit.edu/
- **freeCodeCamp**: https://www.freecodecamp.org/learn/
- **The Odin Project**: https://www.theodinproject.com/
- **University of Helsinki Python**: https://programming-24.mooc.fi/
- **Full Stack Open**: https://fullstackopen.com/en/
- **Scrimba**: https://scrimba.com/learn/

### OFFICIAL DOCUMENTATION (always working):
- React: https://react.dev/learn
- TypeScript: https://www.typescriptlang.org/docs/handbook/
- Python: https://docs.python.org/3/tutorial/
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Learn

## EACH WEEK MUST INCLUDE:

1. **Theme**: Clear, inspiring title (e.g., "Week 4: Mastering Asynchronous State Management")

2. **Knowledge Stack (2-3 sources)**: 
   - Include at least ONE YouTube playlist from the verified list above
   - Include ONE official documentation or course
   - ALL URLs must be REAL and WORKING - no made-up links
   - Include the instructor/channel name for YouTube resources
   - Match difficulty to ${year} ${skillLevel} level

3. **Forge Objective**:
   - Specific PROJECT MILESTONE building toward ${project?.title || 'the final project'}
   - Include 3 specific deliverables

4. **Calendar Event**:
   - Single "Weekly Challenge" summary with to-do list

Make progression logical: fundamentals → intermediate concepts → advanced integrations.`;
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
          { title: "CS50's Introduction to Computer Science 2024", source: "Harvard", url: "https://cs50.harvard.edu/x/", type: "course", instructor: "David J. Malan" },
          { title: "Git and GitHub for Beginners - Crash Course", source: "YouTube", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", type: "youtube", instructor: "freeCodeCamp.org" },
          { title: "VS Code Tutorial for Beginners", source: "YouTube", url: "https://www.youtube.com/watch?v=VqCgcpAypFQ", type: "youtube", instructor: "Traversy Media" }
        ],
        forgeObjective: {
          milestone: "Initialize project repository and development environment",
          deliverables: ["Set up Git repository with proper .gitignore", "Configure VS Code with essential extensions", "Create initial project structure and README"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 1 Challenge: Foundation Setup",
          description: "Weekly To-Do:\n1. Complete Git & GitHub crash course\n2. Set up VS Code development environment\n3. Initialize project repository with documentation"
        }
      },
      {
        week: 2,
        theme: "Week 2: Core Language Mastery",
        knowledgeStack: [
          { title: "JavaScript Full Course for Beginners", source: "YouTube", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", type: "youtube", instructor: "freeCodeCamp.org" },
          { title: "Python Programming MOOC 2024", source: "University of Helsinki", url: "https://programming-24.mooc.fi/", type: "course", instructor: "University of Helsinki" },
          { title: "TypeScript Tutorial for Beginners", source: "YouTube", url: "https://www.youtube.com/watch?v=BwuLxPH8IDs", type: "youtube", instructor: "Academind" }
        ],
        forgeObjective: {
          milestone: "Build core utility functions and data models",
          deliverables: ["Implement data validation utilities", "Create TypeScript type definitions", "Write unit tests for utilities"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 2 Challenge: Core Language Skills",
          description: "Weekly To-Do:\n1. Complete JavaScript/Python fundamentals\n2. Implement utility functions with TypeScript\n3. Set up Jest testing framework"
        }
      },
      {
        week: 3,
        theme: "Week 3: API Design & Backend Foundations",
        knowledgeStack: [
          { title: "Node.js and Express.js Full Course", source: "YouTube", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", type: "youtube", instructor: "freeCodeCamp.org" },
          { title: "REST API Design Best Practices", source: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design", type: "documentation" },
          { title: "FastAPI Full Course", source: "YouTube", url: "https://www.youtube.com/watch?v=7t2alSnE2-I", type: "youtube", instructor: "freeCodeCamp.org" }
        ],
        forgeObjective: {
          milestone: "Design and implement core API endpoints",
          deliverables: ["Design database schema with ERD", "Implement RESTful CRUD endpoints", "Set up Swagger/OpenAPI documentation"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 3 Challenge: Backend Architecture",
          description: "Weekly To-Do:\n1. Complete REST API course\n2. Implement database schema\n3. Build and test core endpoints"
        }
      },
      {
        week: 4,
        theme: "Week 4: Authentication & Security",
        knowledgeStack: [
          { title: "JWT Authentication Tutorial", source: "YouTube", url: "https://www.youtube.com/watch?v=mbsmsi7l3r4", type: "youtube", instructor: "Web Dev Simplified" },
          { title: "OWASP Top 10 Security Risks", source: "OWASP", url: "https://owasp.org/www-project-top-ten/", type: "documentation" },
          { title: "Node.js Authentication From Scratch", source: "YouTube", url: "https://www.youtube.com/watch?v=F-sFp_AvHc8", type: "youtube", instructor: "Traversy Media" }
        ],
        forgeObjective: {
          milestone: "Implement secure authentication system",
          deliverables: ["Implement JWT-based authentication", "Add password hashing with bcrypt", "Create protected API routes"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 4 Challenge: Security Implementation",
          description: "Weekly To-Do:\n1. Complete JWT authentication tutorial\n2. Implement user registration & login\n3. Add route protection middleware"
        }
      },
      {
        week: 5,
        theme: "Week 5: React Fundamentals & Component Architecture",
        knowledgeStack: [
          { title: "React Full Course 2024", source: "YouTube", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", type: "youtube", instructor: "freeCodeCamp.org" },
          { title: "React Official Tutorial", source: "React.dev", url: "https://react.dev/learn", type: "documentation" },
          { title: "React Hooks Explained", source: "YouTube", url: "https://www.youtube.com/watch?v=TNhaISOUy6Q", type: "youtube", instructor: "Fireship" }
        ],
        forgeObjective: {
          milestone: "Build reusable React component library",
          deliverables: ["Create atomic UI components (Button, Input, Card)", "Implement component composition patterns", "Add Storybook documentation"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 5 Challenge: React Components",
          description: "Weekly To-Do:\n1. Complete React fundamentals course\n2. Build 10+ reusable components\n3. Document components in Storybook"
        }
      },
      {
        week: 6,
        theme: "Week 6: State Management & Data Fetching",
        knowledgeStack: [
          { title: "React Query (TanStack Query) Tutorial", source: "YouTube", url: "https://www.youtube.com/watch?v=r8Dg0KVnfMA", type: "youtube", instructor: "Web Dev Simplified" },
          { title: "Zustand State Management", source: "YouTube", url: "https://www.youtube.com/watch?v=fZPgBnL2x-Q", type: "youtube", instructor: "Fireship" },
          { title: "Full Stack Open - State Management", source: "University of Helsinki", url: "https://fullstackopen.com/en/part6", type: "course", instructor: "University of Helsinki" }
        ],
        forgeObjective: {
          milestone: "Implement global state and API integration",
          deliverables: ["Set up TanStack Query for data fetching", "Implement Zustand for global state", "Add optimistic updates and caching"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 6 Challenge: State & Data",
          description: "Weekly To-Do:\n1. Complete state management tutorials\n2. Integrate API with React Query\n3. Implement error handling and loading states"
        }
      },
      {
        week: 7,
        theme: "Week 7: Database & Backend Integration",
        knowledgeStack: [
          { title: "PostgreSQL Full Course", source: "YouTube", url: "https://www.youtube.com/watch?v=qw--VYLpxG4", type: "youtube", instructor: "freeCodeCamp.org" },
          { title: "Supabase Crash Course", source: "YouTube", url: "https://www.youtube.com/watch?v=7uKQBl9uZ00", type: "youtube", instructor: "Traversy Media" },
          { title: "Database Design Course", source: "MIT OCW", url: "https://ocw.mit.edu/courses/6-830-database-systems-fall-2010/", type: "course" }
        ],
        forgeObjective: {
          milestone: "Complete database layer and real-time features",
          deliverables: ["Design normalized database schema", "Implement database migrations", "Add real-time subscriptions"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 7 Challenge: Database Mastery",
          description: "Weekly To-Do:\n1. Complete PostgreSQL fundamentals\n2. Set up Supabase backend\n3. Implement real-time data sync"
        }
      },
      {
        week: 8,
        theme: "Week 8: Testing & Quality Assurance",
        knowledgeStack: [
          { title: "React Testing Library Tutorial", source: "YouTube", url: "https://www.youtube.com/watch?v=7dTTFW7yACQ", type: "youtube", instructor: "freeCodeCamp.org" },
          { title: "Jest Crash Course", source: "YouTube", url: "https://www.youtube.com/watch?v=7r4xVDI2vho", type: "youtube", instructor: "Traversy Media" },
          { title: "Testing JavaScript Applications", source: "The Odin Project", url: "https://www.theodinproject.com/lessons/node-path-javascript-testing-basics", type: "course" }
        ],
        forgeObjective: {
          milestone: "Achieve 80%+ test coverage",
          deliverables: ["Write unit tests for all utilities", "Add integration tests for API endpoints", "Implement E2E tests with Playwright"]
        },
        calendarEvent: {
          summary: "[Hackwell] Week 8 Challenge: Testing Excellence",
          description: "Weekly To-Do:\n1. Complete testing tutorials\n2. Write comprehensive test suite\n3. Set up CI/CD with test automation"
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