// ============= AGENTIC CHAT EDGE FUNCTION =============
// Handles streaming chat with agentic workflow support using Perplexity

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAgent, GeminiAgent, AgentResult } from "../_shared/geminiAgent.ts";
import { getPerplexityApiKey } from "../_shared/perplexity.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  mode: "simple" | "agentic";
  stream?: boolean;
}

function createSSEMessage(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

async function handleAgenticChat(
  messages: ChatMessage[],
  stream: boolean
): Promise<Response> {
  const userMessage = messages[messages.length - 1]?.content || "";
  
  if (stream) {
    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(createSSEMessage(event, data)));
        };

        const agent = createAgent({
          onPlanCreated: (plan) => {
            sendEvent("plan", { goal: plan.goal, tasks: plan.tasks.length });
          },
          onTaskStart: (task) => {
            sendEvent("task_start", { id: task.id, description: task.description });
          },
          onTaskComplete: (task) => {
            sendEvent("task_complete", { id: task.id, status: task.status });
          },
          onReasoning: (step) => {
            sendEvent("reasoning", { step });
          },
          onComplete: (result) => {
            sendEvent("complete", { 
              success: result.success, 
              output: result.finalOutput 
            });
          },
          onError: (error) => {
            sendEvent("error", { message: error });
          },
        });

        try {
          await agent.run(userMessage);
        } catch (e) {
          sendEvent("error", { message: e instanceof Error ? e.message : "Unknown error" });
        }

        controller.close();
      },
    });

    return new Response(streamResponse, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  const agent = createAgent();
  const result = await agent.run(userMessage);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleSimpleChat(messages: ChatMessage[]): Promise<Response> {
  const agent = createAgent();
  
  const systemMessage = messages.find(m => m.role === "system");
  const conversationHistory = messages
    .filter(m => m.role !== "system")
    .map(m => `${m.role}: ${m.content}`)
    .join("\n\n");

  const prompt = conversationHistory || messages[messages.length - 1]?.content || "";
  
  try {
    const response = await agent.generate(prompt, systemMessage?.content);
    
    return new Response(JSON.stringify({ 
      success: true,
      content: response,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ 
      success: false,
      error: e instanceof Error ? e.message : "Generation failed",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ChatRequest = await req.json();
    const { messages, mode = "simple", stream = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if we have API key configured
    const apiKey = getPerplexityApiKey();
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "No API keys configured. Please add PERPLEXITY_API_KEY to your secrets.",
        keyCount: 0,
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "agentic") {
      return handleAgenticChat(messages, stream);
    }

    return handleSimpleChat(messages);

  } catch (e) {
    console.error("Chat function error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});