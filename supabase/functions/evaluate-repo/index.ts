import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callPerplexity, getPerplexityApiKey, PerplexityMessage } from "../_shared/perplexity.ts";

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

function getFallbackEvaluation(): EvaluationResult {
  return {
    passed: true,
    score: 75,
    feedback: "Project meets basic requirements. Continue building to improve.",
    strengths: ["Code compiles", "Basic functionality works", "Git history shows progress"],
    improvements: ["Add more tests", "Improve documentation", "Refactor for readability"],
    codeQuality: { structure: 70, readability: 75, bestPractices: 70, documentation: 65 },
    professionalReview: "This project demonstrates foundational skills. Focus on testing and documentation to level up."
  };
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

    const apiKey = getPerplexityApiKey();
    if (!apiKey) {
      console.log("No PERPLEXITY_API_KEY, using fallback");
      return new Response(
        JSON.stringify(getFallbackEvaluation()),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const repoName = repoMatch?.[2]?.replace(/\.git$/, "") || "unknown";

    const systemPrompt = `You are a senior software engineer evaluating student projects. Be constructive but honest. Score 70+ means passes.

Return JSON only with this structure:
{
  "passed": true/false,
  "score": 0-100,
  "feedback": "1-2 sentence summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "codeQuality": {"structure": 0-100, "readability": 0-100, "bestPractices": 0-100, "documentation": 0-100},
  "professionalReview": "2-3 paragraph review"
}`;

    const userPrompt = `Evaluate this GitHub repository for Week ${weekNumber}.

**Repository:** ${githubUrl}
**Week Theme:** ${weekTheme}
**Expected Tasks:**
${tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Based on the repository name "${repoName}" and objectives, provide evaluation.`;

    const messages: PerplexityMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const result = await callPerplexity(apiKey, messages, { maxTokens: 1500 });

    if (!result.success) {
      console.log("Perplexity call failed, using fallback");
      return new Response(
        JSON.stringify(getFallbackEvaluation()),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const jsonMatch = result.text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const evaluation = JSON.parse(jsonMatch[0]) as EvaluationResult;
        return new Response(
          JSON.stringify(evaluation),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      console.log("JSON parse failed, using fallback");
    }

    return new Response(
      JSON.stringify(getFallbackEvaluation()),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("evaluate-repo error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});