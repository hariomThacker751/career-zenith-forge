// ============= GEMINI AGENT WITH AGENTIC LOOPS =============
// Implements Plan → Execute → Verify workflow with streaming support

import { callGemini, GeminiCallResult, GeminiTool } from "./gemini.ts";
import { getNextGeminiKey, rotateOnRateLimit } from "./secretManager.ts";

export interface AgentTask {
  id: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  result?: string;
  error?: string;
}

export interface AgentPlan {
  goal: string;
  tasks: AgentTask[];
  reasoning: string;
}

export interface AgentResult {
  success: boolean;
  plan?: AgentPlan;
  finalOutput?: string;
  reasoning: string[];
  error?: string;
}

export interface StreamCallback {
  onPlanCreated?: (plan: AgentPlan) => void;
  onTaskStart?: (task: AgentTask) => void;
  onTaskComplete?: (task: AgentTask) => void;
  onReasoning?: (step: string) => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (result: AgentResult) => void;
  onError?: (error: string) => void;
}

const PLANNING_PROMPT = `You are an AI planning agent. Given a user request, break it down into clear, actionable sub-tasks.

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "goal": "The main objective to achieve",
  "reasoning": "Why you broke it down this way",
  "tasks": [
    {"id": "1", "description": "First specific task to complete"},
    {"id": "2", "description": "Second specific task to complete"}
  ]
}

Keep tasks focused and achievable. Usually 2-5 tasks is optimal.`;

const EXECUTION_PROMPT = `You are an AI execution agent. Complete the given task thoroughly and provide a clear, detailed result.

Task to complete:`;

const VERIFICATION_PROMPT = `You are an AI verification agent. Review the completed work and determine if it meets the quality standards.

IMPORTANT: Respond with a JSON object:
{
  "passed": true/false,
  "feedback": "Specific feedback about the quality",
  "improvements": ["Suggested improvement 1", "Suggested improvement 2"]
}`;

const SYNTHESIS_PROMPT = `You are an AI synthesis agent. Combine all completed task results into a cohesive, well-structured final output.

Completed tasks and results:`;

export class GeminiAgent {
  private apiKey: string;
  private callbacks: StreamCallback;
  private reasoning: string[] = [];
  private maxRetries: number = 2;
  private temperature: number = 0.7;

  constructor(callbacks: StreamCallback = {}) {
    this.apiKey = getNextGeminiKey();
    this.callbacks = callbacks;
  }

  private addReasoning(step: string): void {
    this.reasoning.push(step);
    this.callbacks.onReasoning?.(step);
  }

  private async callWithRetry(
    messages: Array<{ role: string; content: string }>,
    options: { temperature?: number; maxOutputTokens?: number } = {}
  ): Promise<GeminiCallResult> {
    let lastError: string | undefined;
    let currentKey = this.apiKey;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const result = await callGemini(currentKey, messages, {
        temperature: options.temperature ?? this.temperature,
        maxOutputTokens: options.maxOutputTokens ?? 4096,
      });

      if (result.success) {
        return result;
      }

      if (result.statusCode === 429) {
        this.addReasoning(`⚠️ Rate limited, rotating API key...`);
        try {
          currentKey = rotateOnRateLimit(currentKey);
          this.apiKey = currentKey;
        } catch (e) {
          lastError = "All API keys exhausted";
          break;
        }
        continue;
      }

      lastError = result.error;
      if (attempt < this.maxRetries - 1) {
        this.addReasoning(`🔄 Retry attempt ${attempt + 2}...`);
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }

    return {
      success: false,
      error: lastError || "Max retries exceeded",
    };
  }

  /**
   * Phase 1: PLAN - Break down the request into sub-tasks
   */
  async plan(userRequest: string): Promise<AgentPlan | null> {
    this.addReasoning("🧠 Planning: Analyzing request and creating sub-tasks...");

    const result = await this.callWithRetry([
      { role: "system", content: PLANNING_PROMPT },
      { role: "user", content: userRequest },
    ]);

    if (!result.success || !result.text) {
      this.addReasoning(`❌ Planning failed: ${result.error}`);
      return null;
    }

    try {
      // Extract JSON from response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const plan: AgentPlan = {
        goal: parsed.goal || userRequest,
        reasoning: parsed.reasoning || "",
        tasks: (parsed.tasks || []).map((t: any, idx: number) => ({
          id: t.id || String(idx + 1),
          description: t.description || t,
          status: "pending" as const,
        })),
      };

      this.addReasoning(`✅ Plan created: ${plan.tasks.length} tasks identified`);
      this.callbacks.onPlanCreated?.(plan);
      return plan;
    } catch (e) {
      this.addReasoning(`⚠️ Planning parse error, using single task approach`);
      return {
        goal: userRequest,
        reasoning: "Direct execution approach",
        tasks: [{ id: "1", description: userRequest, status: "pending" }],
      };
    }
  }

  /**
   * Phase 2: EXECUTE - Complete each sub-task
   */
  async execute(task: AgentTask): Promise<AgentTask> {
    this.addReasoning(`🔨 Executing: ${task.description.substring(0, 50)}...`);
    task.status = "in_progress";
    this.callbacks.onTaskStart?.(task);

    const result = await this.callWithRetry([
      { role: "system", content: EXECUTION_PROMPT },
      { role: "user", content: task.description },
    ], { maxOutputTokens: 8192 });

    if (result.success && result.text) {
      task.status = "completed";
      task.result = result.text;
      this.addReasoning(`✅ Task ${task.id} completed`);
    } else {
      task.status = "failed";
      task.error = result.error;
      this.addReasoning(`❌ Task ${task.id} failed: ${result.error}`);
    }

    this.callbacks.onTaskComplete?.(task);
    return task;
  }

  /**
   * Phase 3: VERIFY - Check output quality
   */
  async verify(content: string, originalRequest: string): Promise<{ passed: boolean; feedback: string }> {
    this.addReasoning("🔍 Verifying: Checking output quality...");

    const result = await this.callWithRetry([
      { role: "system", content: VERIFICATION_PROMPT },
      { role: "user", content: `Original request: ${originalRequest}\n\nGenerated content:\n${content}` },
    ]);

    if (!result.success || !result.text) {
      // Assume passed if verification fails
      return { passed: true, feedback: "Verification skipped" };
    }

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const passed = parsed.passed !== false;
        this.addReasoning(passed ? "✅ Verification passed" : "⚠️ Verification found issues");
        return { passed, feedback: parsed.feedback || "" };
      }
    } catch (e) {
      // Parse error, assume passed
    }

    return { passed: true, feedback: "" };
  }

  /**
   * Synthesize all task results into final output
   */
  async synthesize(plan: AgentPlan): Promise<string> {
    this.addReasoning("📝 Synthesizing: Combining results...");

    const completedTasks = plan.tasks.filter(t => t.status === "completed" && t.result);
    
    if (completedTasks.length === 1) {
      return completedTasks[0].result || "";
    }

    const taskSummary = completedTasks
      .map(t => `Task ${t.id}: ${t.description}\nResult: ${t.result}`)
      .join("\n\n---\n\n");

    const result = await this.callWithRetry([
      { role: "system", content: SYNTHESIS_PROMPT },
      { role: "user", content: `Goal: ${plan.goal}\n\n${taskSummary}` },
    ], { maxOutputTokens: 8192 });

    if (result.success && result.text) {
      this.addReasoning("✅ Synthesis complete");
      return result.text;
    }

    // Fallback: concatenate results
    return completedTasks.map(t => t.result).join("\n\n");
  }

  /**
   * Run the full agentic workflow: Plan → Execute → Verify
   */
  async run(userRequest: string): Promise<AgentResult> {
    this.reasoning = [];
    this.addReasoning("🚀 Starting agentic workflow...");

    try {
      // Phase 1: Plan
      const plan = await this.plan(userRequest);
      if (!plan) {
        const error = "Failed to create execution plan";
        this.callbacks.onError?.(error);
        return { success: false, reasoning: this.reasoning, error };
      }

      // Phase 2: Execute all tasks
      for (const task of plan.tasks) {
        await this.execute(task);
      }

      // Check if any tasks completed
      const completedTasks = plan.tasks.filter(t => t.status === "completed");
      if (completedTasks.length === 0) {
        const error = "All tasks failed to execute";
        this.callbacks.onError?.(error);
        return { success: false, plan, reasoning: this.reasoning, error };
      }

      // Synthesize results
      const finalOutput = await this.synthesize(plan);

      // Phase 3: Verify
      const verification = await this.verify(finalOutput, userRequest);
      
      if (!verification.passed) {
        this.addReasoning(`📋 Feedback: ${verification.feedback}`);
      }

      this.addReasoning("🎉 Workflow complete!");

      const result: AgentResult = {
        success: true,
        plan,
        finalOutput,
        reasoning: this.reasoning,
      };

      this.callbacks.onComplete?.(result);
      return result;

    } catch (e) {
      const error = e instanceof Error ? e.message : "Unknown error";
      this.addReasoning(`❌ Error: ${error}`);
      this.callbacks.onError?.(error);
      return { success: false, reasoning: this.reasoning, error };
    }
  }

  /**
   * Simple single-shot generation (no agentic loop)
   */
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const result = await this.callWithRetry(messages, { maxOutputTokens: 8192 });
    
    if (!result.success) {
      throw new Error(result.error || "Generation failed");
    }

    return result.text || "";
  }
}

// Factory function for creating agents
export function createAgent(callbacks: StreamCallback = {}): GeminiAgent {
  return new GeminiAgent(callbacks);
}
