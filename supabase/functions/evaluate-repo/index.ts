import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvaluationRequest {
  githubUrl: string;
  weekNumber: number;
  weekTheme: string;
  tasks: string[];
}

interface EvaluationResult {
  passed: boolean;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  codeQuality: {
    structure: number;
    readability: number;
    bestPractices: number;
    documentation: number;
  };
  professionalReview: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { githubUrl, weekNumber, weekTheme, tasks }: EvaluationRequest = await req.json();

    if (!githubUrl || !githubUrl.includes("github.com")) {
      return new Response(
        JSON.stringify({ error: "Invalid GitHub URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Extract repo info from URL
    const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const repoOwner = repoMatch?.[1] || "unknown";
    const repoName = repoMatch?.[2]?.replace(/\.git$/, "") || "unknown";

    const systemPrompt = `You are a senior software engineer and code reviewer at a top tech company. 
You evaluate student projects with professional rigor but constructive feedback.
You provide detailed, actionable feedback that helps developers grow.
Be encouraging but honest. Highlight both strengths and areas for improvement.
Score fairly - a passing score (70+) means the project meets requirements, not perfection.`;

    const userPrompt = `Evaluate this GitHub repository for Week ${weekNumber} of a developer training program.

**Repository:** ${githubUrl}
**Week Theme:** ${weekTheme}
**Expected Tasks Completed:**
${tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Based on the repository name "${repoName}" and the week's objectives, provide a professional code review.

Evaluate the following aspects (score each 0-100):
1. **Code Structure** - Organization, modularity, file structure
2. **Readability** - Naming conventions, clarity, comments
3. **Best Practices** - Design patterns, error handling, security
4. **Documentation** - README, inline docs, commit messages

Provide your evaluation using the evaluate_repository function.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate_repository",
              description: "Submit the evaluation results for the repository",
              parameters: {
                type: "object",
                properties: {
                  passed: {
                    type: "boolean",
                    description: "Whether the project passes (true if overall score >= 70)",
                  },
                  score: {
                    type: "number",
                    description: "Overall score from 0-100",
                  },
                  feedback: {
                    type: "string",
                    description: "Brief 1-2 sentence summary of the evaluation",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific things done well",
                  },
                  improvements: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific actionable improvements",
                  },
                  codeQuality: {
                    type: "object",
                    properties: {
                      structure: { type: "number", description: "Score 0-100" },
                      readability: { type: "number", description: "Score 0-100" },
                      bestPractices: { type: "number", description: "Score 0-100" },
                      documentation: { type: "number", description: "Score 0-100" },
                    },
                    required: ["structure", "readability", "bestPractices", "documentation"],
                  },
                  professionalReview: {
                    type: "string",
                    description: "A 2-3 paragraph professional review as if from a senior engineer mentor",
                  },
                },
                required: ["passed", "score", "feedback", "strengths", "improvements", "codeQuality", "professionalReview"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "evaluate_repository" } },
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
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI evaluation failed");
    }

    const aiResponse = await response.json();
    
    // Extract the function call arguments
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "evaluate_repository") {
      throw new Error("Invalid AI response format");
    }

    const evaluation: EvaluationResult = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(evaluation),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("evaluate-repo error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});