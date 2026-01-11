// ============= GEMINI API DIRECT INTEGRATION =============
// Uses Google's Gemini API directly with gemini-2.5-flash model

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface GeminiToolCall {
  functionCall: {
    name: string;
    args: Record<string, any>;
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text?: string; functionCall?: { name: string; args: any } }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface GeminiCallResult {
  success: boolean;
  data?: any;
  text?: string;
  toolCall?: { name: string; args: any };
  error?: string;
  statusCode?: number;
}

export interface GeminiTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface GeminiCallOptions {
  tools?: GeminiTool[];
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
}

// Convert OpenAI-style messages to Gemini format
function convertToGeminiMessages(
  messages: Array<{ role: string; content: string }>
): { systemInstruction?: string; contents: GeminiMessage[] } {
  let systemInstruction: string | undefined;
  const contents: GeminiMessage[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction = msg.content;
    } else {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
  }

  return { systemInstruction, contents };
}

// Convert tools to Gemini format
function convertToGeminiTools(tools: GeminiTool[]): any {
  return {
    functionDeclarations: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    })),
  };
}

export async function callGemini(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  options: GeminiCallOptions = {}
): Promise<GeminiCallResult> {
  const { tools, temperature = 0.7, maxOutputTokens = 2048, systemInstruction } = options;

  const { systemInstruction: extractedSystem, contents } = convertToGeminiMessages(messages);
  const finalSystemInstruction = systemInstruction || extractedSystem;

  const url = `${GEMINI_API_URL}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

  const body: any = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  if (finalSystemInstruction) {
    body.systemInstruction = { parts: [{ text: finalSystemInstruction }] };
  }

  if (tools && tools.length > 0) {
    body.tools = [convertToGeminiTools(tools)];
    body.toolConfig = {
      functionCallingConfig: {
        mode: "ANY",
      },
    };
  }

  try {
    console.log(`Calling Gemini API with model: ${DEFAULT_MODEL}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      console.error("Rate limited by Gemini API");
      return {
        success: false,
        error: "Rate limit exceeded. Please try again in a moment.",
        statusCode: 429,
      };
    }

    if (response.status === 403) {
      console.error("Invalid or missing API key");
      return {
        success: false,
        error: "Invalid API key. Please check your GEMINI_API_KEY.",
        statusCode: 403,
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${errorText}`);
      return {
        success: false,
        error: `Gemini API error: ${response.status}`,
        statusCode: response.status,
      };
    }

    const data: GeminiResponse = await response.json();
    console.log("Gemini API response received successfully");

    const candidate = data.candidates?.[0];
    if (!candidate) {
      return {
        success: false,
        error: "No response from Gemini",
        statusCode: 500,
      };
    }

    const parts = candidate.content?.parts || [];
    
    // Check for function call
    const functionCallPart = parts.find((p) => p.functionCall);
    if (functionCallPart?.functionCall) {
      return {
        success: true,
        toolCall: {
          name: functionCallPart.functionCall.name,
          args: functionCallPart.functionCall.args,
        },
        data,
      };
    }

    // Return text content
    const textPart = parts.find((p) => p.text);
    return {
      success: true,
      text: textPart?.text || "",
      data,
    };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      statusCode: 500,
    };
  }
}

// Helper to get API key from environment
export function getGeminiApiKey(): string | null {
  return Deno.env.get("GEMINI_API_KEY") || null;
}

// Helper to validate API key exists
export function requireGeminiApiKey(): string {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please add your API key.");
  }
  return apiKey;
}
