// ============= PERPLEXITY AGENT WITH AGENTIC LOOPS =============
// Implements Plan → Execute → Verify workflow with streaming support

import { callPerplexity, getPerplexityApiKey, PerplexityMessage } from "./perplexity.ts";

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

Keep tasks focused. Usually 2-4 tasks is optimal.`;

const EXECUTION_PROMPT = `You are an AI execution agent. Complete the given task thoroughly and provide a clear, detailed result.

Task to complete:`;

const SYNTHESIS_PROMPT = `You are an AI synthesis agent. Combine all completed task results into a cohesive, well-structured final output.

Completed tasks and results:`;

export class GeminiAgent {
  private apiKey: string;
  private callbacks: StreamCallback;
  private reasoning: string[] = [];
  private maxRetries: number = 2;

  constructor(callbacks: StreamCallback = {}) {
    this.apiKey = getPerplexityApiKey() || "";
    this.callbacks = callbacks;
  }

  private addReasoning(step: string): void {
    this.reasoning.push(step);
    this.callbacks.onReasoning?.(step);
  }

  private async callWithRetry(
    systemPrompt: string,
    userPrompt: string,
    options: { maxTokens?: number } = {}
  ): Promise<{ success: boolean; text?: string; error?: string }> {
    const messages: PerplexityMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const result = await callPerplexity(this.apiKey, messages, {
        maxTokens: options.maxTokens ?? 1000,
        temperature: 0.3
      });

      if (result.success) {
        return { success: true, text: result.text };
      }

      if (result.statusCode === 429) {
        this.addReasoning(`⚠️ Rate limited, retrying in ${(attempt + 1)}s...`);
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }

      return { success: false, error: result.error };
    }

    return { success: false, error: "Max retries exceeded" };
  }

  /**
   * Phase 1: PLAN - Break down the request into sub-tasks
   */
  async plan(userRequest: string): Promise<AgentPlan | null> {
    this.addReasoning("🧠 Planning: Analyzing request...");

    const result = await this.callWithRetry(PLANNING_PROMPT, userRequest, { maxTokens: 500 });

    if (!result.success || !result.text) {
      this.addReasoning(`❌ Planning failed: ${result.error}`);
      return null;
    }

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");

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

      this.addReasoning(`✅ Plan created: ${plan.tasks.length} tasks`);
      this.callbacks.onPlanCreated?.(plan);
      return plan;
    } catch (e) {
      this.addReasoning(`⚠️ Using single task approach`);
      return {
        goal: userRequest,
        reasoning: "Direct execution",
        tasks: [{ id: "1", description: userRequest, status: "pending" }],
      };
    }
  }

  /**
   * Phase 2: EXECUTE - Complete each sub-task
   */
  async execute(task: AgentTask): Promise<AgentTask> {
    this.addReasoning(`🔨 Executing: ${task.description.substring(0, 40)}...`);
    task.status = "in_progress";
    this.callbacks.onTaskStart?.(task);

    const result = await this.callWithRetry(
      EXECUTION_PROMPT,
      task.description,
      { maxTokens: 2000 }
    );

    if (result.success && result.text) {
      task.status = "completed";
      task.result = result.text;
      this.addReasoning(`✅ Task ${task.id} done`);
    } else {
      task.status = "failed";
      task.error = result.error;
      this.addReasoning(`❌ Task ${task.id} failed`);
    }

    this.callbacks.onTaskComplete?.(task);
    return task;
  }

  /**
   * Synthesize all task results into final output
   */
  async synthesize(plan: AgentPlan): Promise<string> {
    this.addReasoning("📝 Synthesizing results...");

    const completedTasks = plan.tasks.filter(t => t.status === "completed" && t.result);
    
    if (completedTasks.length === 1) {
      return completedTasks[0].result || "";
    }

    const taskSummary = completedTasks
      .map(t => `Task ${t.id}: ${t.description}\nResult: ${t.result}`)
      .join("\n\n---\n\n");

    const result = await this.callWithRetry(
      SYNTHESIS_PROMPT,
      `Goal: ${plan.goal}\n\n${taskSummary}`,
      { maxTokens: 2000 }
    );

    if (result.success && result.text) {
      this.addReasoning("✅ Synthesis complete");
      return result.text;
    }

    return completedTasks.map(t => t.result).join("\n\n");
  }

  /**
   * Run the full agentic workflow: Plan → Execute → Synthesize
   */
  async run(userRequest: string): Promise<AgentResult> {
    this.reasoning = [];
    this.addReasoning("🚀 Starting workflow...");

    if (!this.apiKey) {
      const error = "PERPLEXITY_API_KEY not configured";
      this.callbacks.onError?.(error);
      return { success: false, reasoning: this.reasoning, error };
    }

    try {
      // Phase 1: Plan
      const plan = await this.plan(userRequest);
      if (!plan) {
        const error = "Failed to create plan";
        this.callbacks.onError?.(error);
        return { success: false, reasoning: this.reasoning, error };
      }

      // Phase 2: Execute all tasks
      for (const task of plan.tasks) {
        await this.execute(task);
      }

      const completedTasks = plan.tasks.filter(t => t.status === "completed");
      if (completedTasks.length === 0) {
        const error = "All tasks failed";
        this.callbacks.onError?.(error);
        return { success: false, plan, reasoning: this.reasoning, error };
      }

      // Synthesize results
      const finalOutput = await this.synthesize(plan);

      this.addReasoning("🎉 Complete!");

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
    const result = await this.callWithRetry(
      systemPrompt || "You are a helpful assistant.",
      prompt,
      { maxTokens: 2000 }
    );
    
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