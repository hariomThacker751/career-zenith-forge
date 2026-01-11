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
  const { tools, maxOutputTokens = 1500 } = options;

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

const EVALUATION_TOOL = {
  type: "function",
  function: {
    name: "evaluate_repository",
    description: "Submit the evaluation results for the repository",
    parameters: {
      type: "object",
      properties: {
        passed: { type: "boolean", description: "Whether the project passes (true if overall score >= 70)" },
        score: { type: "number", description: "Overall score from 0-100" },
        feedback: { type: "string", description: "Brief 1-2 sentence summary of the evaluation" },
        strengths: { type: "array", items: { type: "string" }, description: "3-5 specific things done well" },
        improvements: { type: "array", items: { type: "string" }, description: "3-5 specific actionable improvements" },
        codeQuality: {
          type: "object",
          properties: {
            structure: { type: "number" },
            readability: { type: "number" },
            bestPractices: { type: "number" },
            documentation: { type: "number" },
          },
          required: ["structure", "readability", "bestPractices", "documentation"],
        },
        professionalReview: { type: "string", description: "A 2-3 paragraph professional review" },
      },
      required: ["passed", "score", "feedback", "strengths", "improvements", "codeQuality", "professionalReview"],
    },
  },
};

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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const repoName = repoMatch?.[2]?.replace(/\.git$/, "") || "unknown";

    const systemPrompt = `You are a senior software engineer and code reviewer at a top tech company. 
You evaluate student projects with professional rigor but constructive feedback.
Be encouraging but honest. Score fairly - 70+ means the project meets requirements.`;

    const userPrompt = `Evaluate this GitHub repository for Week ${weekNumber}.

**Repository:** ${githubUrl}
**Week Theme:** ${weekTheme}
**Expected Tasks:**
${tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Based on the repository name "${repoName}" and objectives, provide evaluation.

Evaluate:
1. **Code Structure** (0-100)
2. **Readability** (0-100)
3. **Best Practices** (0-100)
4. **Documentation** (0-100)`;

    const result = await callGemini(
      GEMINI_API_KEY,
      systemPrompt,
      userPrompt,
      { tools: [EVALUATION_TOOL], maxOutputTokens: 1500 }
    );

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.statusCode === 429 ? 429 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!result.toolCall) {
      throw new Error("Invalid AI response format");
    }

    const evaluation: EvaluationResult = result.toolCall.args;

    return new Response(
      JSON.stringify(evaluation),
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
