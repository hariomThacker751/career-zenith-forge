// ============= PERPLEXITY API INTEGRATION =============
// Fast AI-powered search and response generation using Sonar models

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const DEFAULT_MODEL = "sonar"; // Fast, lightweight search for everyday questions

export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PerplexityCallResult {
  success: boolean;
  text?: string;
  citations?: string[];
  error?: string;
  statusCode?: number;
}

export interface PerplexityCallOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  searchDomainFilter?: string[];
  searchRecencyFilter?: "day" | "week" | "month" | "year";
}

export async function callPerplexity(
  apiKey: string,
  messages: PerplexityMessage[],
  options: PerplexityCallOptions = {}
): Promise<PerplexityCallResult> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.2,
    maxTokens = 500,
    searchDomainFilter,
    searchRecencyFilter,
  } = options;

  const body: any = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (searchDomainFilter && searchDomainFilter.length > 0) {
    body.search_domain_filter = searchDomainFilter;
  }

  if (searchRecencyFilter) {
    body.search_recency_filter = searchRecencyFilter;
  }

  try {
    console.log(`Calling Perplexity API with model: ${model}`);

    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      console.error("Rate limited by Perplexity API");
      return {
        success: false,
        error: "Rate limit exceeded. Please try again in a moment.",
        statusCode: 429,
      };
    }

    if (response.status === 401 || response.status === 403) {
      console.error("Invalid or missing API key");
      return {
        success: false,
        error: "Invalid API key. Please check your PERPLEXITY_API_KEY.",
        statusCode: response.status,
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: ${response.status} ${errorText}`);
      return {
        success: false,
        error: `Perplexity API error: ${response.status}`,
        statusCode: response.status,
      };
    }

    const data: PerplexityResponse = await response.json();
    console.log("Perplexity API response received successfully");

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        error: "No response from Perplexity",
        statusCode: 500,
      };
    }

    return {
      success: true,
      text: content,
      citations: data.citations,
    };
  } catch (error) {
    console.error("Perplexity API call failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      statusCode: 500,
    };
  }
}

// Helper to get API key from environment
export function getPerplexityApiKey(): string | null {
  return Deno.env.get("PERPLEXITY_API_KEY") || null;
}

// Helper to validate API key exists
export function requirePerplexityApiKey(): string {
  const apiKey = getPerplexityApiKey();
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not configured. Please add your API key.");
  }
  return apiKey;
}

// Structured output extraction using JSON parsing
export async function callPerplexityWithStructuredOutput<T>(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  options: PerplexityCallOptions = {}
): Promise<{ success: boolean; data?: T; text?: string; error?: string }> {
  const messages: PerplexityMessage[] = [
    { role: "system", content: systemPrompt + "\n\nIMPORTANT: Respond with valid JSON only, no markdown formatting." },
    { role: "user", content: userPrompt },
  ];

  const result = await callPerplexity(apiKey, messages, options);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    // Try to extract JSON from response
    const jsonMatch = result.text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as T;
      return { success: true, data: parsed, text: result.text };
    }
    
    // If no JSON found, return the text
    return { success: true, text: result.text };
  } catch (e) {
    // Return text if JSON parsing fails
    return { success: true, text: result.text };
  }
}