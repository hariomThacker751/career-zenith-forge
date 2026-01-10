import { motion, AnimatePresence } from "framer-motion";
import { User, TrendingUp, Hammer, Shield, CheckCircle2, Sparkles, Loader2, FileCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useResume } from "@/contexts/ResumeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AgentPanelProps {
  answers: Record<number, string>;
  onAnalysisComplete: () => void;
}

type AgentType = "profiler" | "pulse" | "forge" | "gatekeeper";

interface Agent {
  id: AgentType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  description: string;
}

const agents: Agent[] = [
  {
    id: "profiler",
    name: "THE PROFILER",
    icon: User,
    gradient: "from-primary to-emerald-400",
    bgGradient: "from-primary/10 to-emerald-400/10",
    description: "Analyzing your Student Persona...",
  },
  {
    id: "pulse",
    name: "THE PULSE",
    icon: TrendingUp,
    gradient: "from-secondary to-indigo-400",
    bgGradient: "from-secondary/10 to-indigo-400/10",
    description: "Injecting 2026 industry trends...",
  },
  {
    id: "forge",
    name: "THE FORGE",
    icon: Hammer,
    gradient: "from-amber-500 to-orange-400",
    bgGradient: "from-amber-500/10 to-orange-400/10",
    description: "Generating dynamic project...",
  },
  {
    id: "gatekeeper",
    name: "THE GATEKEEPER",
    icon: Shield,
    gradient: "from-rose-500 to-pink-400",
    bgGradient: "from-rose-500/10 to-pink-400/10",
    description: "Validating roadmap...",
  },
];

const AgentPanel = ({ answers, onAnalysisComplete }: AgentPanelProps) => {
  const { resumeData } = useResume();
  const { toast } = useToast();
  const [agentInsights, setAgentInsights] = useState<Record<AgentType, string>>({} as Record<AgentType, string>);
  const [processingAgents, setProcessingAgents] = useState<Set<AgentType>>(new Set());
  const [completedAgents, setCompletedAgents] = useState<Set<AgentType>>(new Set());
  const [failedAgents, setFailedAgents] = useState<Set<AgentType>>(new Set());
  const [allComplete, setAllComplete] = useState(false);

  const resumeSkills = resumeData?.skills || [];
  const resumeProjects = resumeData?.projects || [];
  const resumeExperience = resumeData?.experience || [];

  const analyzeWithAgent = useCallback(async (agentType: AgentType): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("career-agents", {
      body: {
        agentType,
        answers,
        resumeSkills,
        resumeProjects,
        resumeExperience,
      },
    });

    if (error) {
      console.error(`Agent ${agentType} error:`, error);
      throw new Error(error.message || "Analysis failed");
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data?.insight || "Analysis complete.";
  }, [answers, resumeSkills, resumeProjects, resumeExperience]);

  const runAgentAnalysis = useCallback(async (agent: Agent, delay: number) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setProcessingAgents(prev => new Set([...prev, agent.id]));

    try {
      const insight = await analyzeWithAgent(agent.id);
      
      setAgentInsights(prev => ({ ...prev, [agent.id]: insight }));
      setCompletedAgents(prev => new Set([...prev, agent.id]));
      setFailedAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agent.id);
        return newSet;
      });
    } catch (error) {
      console.error(`Failed to analyze with ${agent.name}:`, error);
      setFailedAgents(prev => new Set([...prev, agent.id]));
      
      // Set fallback insight
      setAgentInsights(prev => ({
        ...prev,
        [agent.id]: getFallbackInsight(agent.id, answers, resumeSkills, resumeProjects),
      }));
      setCompletedAgents(prev => new Set([...prev, agent.id]));
    } finally {
      setProcessingAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agent.id);
        return newSet;
      });
    }
  }, [analyzeWithAgent, answers, resumeSkills, resumeProjects]);

  const retryAgent = useCallback(async (agentType: AgentType) => {
    const agent = agents.find(a => a.id === agentType);
    if (!agent) return;

    setCompletedAgents(prev => {
      const newSet = new Set(prev);
      newSet.delete(agentType);
      return newSet;
    });
    setFailedAgents(prev => {
      const newSet = new Set(prev);
      newSet.delete(agentType);
      return newSet;
    });

    await runAgentAnalysis(agent, 0);
  }, [runAgentAnalysis]);

  useEffect(() => {
    // Run all agents with staggered delays
    agents.forEach((agent, index) => {
      runAgentAnalysis(agent, index * 800);
    });
  }, [runAgentAnalysis]);

  useEffect(() => {
    if (completedAgents.size === agents.length) {
      setTimeout(() => setAllComplete(true), 500);
    }
  }, [completedAgents.size]);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-gradient-sunset">
          AI-Powered Multi-Agent Analysis
        </h3>
        <Sparkles className="w-5 h-5 text-secondary" />
      </motion.div>

      {/* Resume sync indicator */}
      {resumeData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 mb-4"
        >
          <FileCheck className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">
            Resume data synchronized • {resumeSkills.length} skills detected
          </span>
        </motion.div>
      )}

      {agents.map((agent, index) => {
        const isProcessing = processingAgents.has(agent.id);
        const isComplete = completedAgents.has(agent.id);
        const hasFailed = failedAgents.has(agent.id);
        const insight = agentInsights[agent.id];

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              delay: index * 0.18,
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="card-interactive p-4"
          >
            <div className="flex items-start gap-4">
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.bgGradient} flex items-center justify-center flex-shrink-0 border border-border`}
                animate={isComplete && !hasFailed ? { scale: [1, 1.15, 1], rotate: [0, 5, 0] } : {}}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <agent.icon className="w-5 h-5 text-primary" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-bold bg-gradient-to-r ${agent.gradient} bg-clip-text text-transparent`}>
                    {agent.name}
                  </span>
                  {isComplete && !hasFailed && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                  {isComplete && hasFailed && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => retryAgent(agent.id)}
                      className="flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <RefreshCw className="w-3 h-3" />
                    </motion.button>
                  )}
                  {isProcessing && (
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  )}
                </div>

                {isProcessing && !insight && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                    <div className="shimmer h-4 rounded w-3/4" />
                  </div>
                )}

                {isComplete && insight && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {insight}
                    </p>
                  </motion.div>
                )}

                {!isProcessing && !isComplete && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Waiting...</p>
                    <div className="shimmer h-4 rounded w-1/2" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="pt-4"
          >
            <motion.button
              onClick={onAnalysisComplete}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              View Your Personalized Roadmap
              <span className="text-lg">→</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Fallback insights when AI fails
function getFallbackInsight(
  agentType: AgentType,
  answers: Record<number, string>,
  resumeSkills: string[],
  resumeProjects: string[]
): string {
  const year = answers[0] || "";
  const interest = answers[1] || "";
  const level = answers[2] || "";
  const hours = answers[3] || "";

  switch (agentType) {
    case "profiler":
      if (resumeSkills.length >= 10) {
        return `The Builder: Advanced profile with ${resumeSkills.length} skills detected. Precision Path recommended—focus on industry specialization.`;
      }
      if (year.includes("1st") || year.includes("2nd")) {
        return "The Learner: Foundation Path detected. Focus on CS fundamentals and building your first meaningful projects.";
      }
      return "The Achiever: Precision Path detected. Focus on specialization and production-grade portfolio building.";

    case "pulse":
      if (interest.includes("AI")) {
        return "Hot roles: MLOps Engineer, Agentic AI Developer, AI Safety Researcher. Companies: OpenAI, Anthropic, Google. Must-learn: LangChain + RAG architecture.";
      }
      if (interest.includes("web")) {
        return "Hot roles: Full-Stack Engineer, Design Engineer. Companies: Vercel, Stripe, Linear. Must-learn: Next.js 15, React Server Components.";
      }
      return "Hot roles: Platform Engineer, SRE, Data Engineer. Must-learn: Kubernetes, Go/Rust for systems, observability tools.";

    case "forge":
      if (level.includes("loop") || level.includes("basic")) {
        return "CLI Study Scheduler: Automated Pomodoro timer with analytics. Tech: Python, JSON, matplotlib. USP: Learn file I/O and data visualization.";
      }
      if (interest.includes("AI")) {
        return "Autonomous PR Reviewer: LangChain agent that audits GitHub PRs. Tech: Python, LangChain, GitHub API, ChromaDB. USP: Learns from codebase patterns.";
      }
      return "Real-time Collab Editor: Multiplayer code editor with AI pair programming. Tech: Next.js, WebSocket, GPT-4. USP: Conflict resolution + live cursors.";

    case "gatekeeper":
      if (resumeSkills.length > 0 && resumeSkills.length < 5) {
        return "⚠️ Skill Gap Risk: Limited foundation detected. Recommendation: Spend 2 weeks on fundamentals before diving into advanced projects.";
      }
      if (hours.includes("5-10")) {
        return "⚠️ Velocity Risk: 5-10 hours may slow progress. Recommendation: Focus on ONE skill deeply rather than spreading thin.";
      }
      if (hours.includes("30+")) {
        return "⚠️ Burnout Risk: 30+ hours needs rest strategy. Recommendation: Schedule mandatory rest days. Consistency > intensity.";
      }
      return "✅ Roadmap validated. Success factor: Build in public, document your journey, and seek feedback early.";

    default:
      return "Analysis complete.";
  }
}

export default AgentPanel;
