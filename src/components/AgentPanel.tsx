import { motion, AnimatePresence } from "framer-motion";
import { User, TrendingUp, Hammer, Shield, CheckCircle2, Sparkles, Loader2, FileCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useResume } from "@/contexts/ResumeContext";
import { usePhase, AgentInsights } from "@/contexts/PhaseContext";
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
  const { setAgentInsights } = usePhase();
  const { toast } = useToast();
  const [agentInsights, setLocalAgentInsights] = useState<Record<AgentType, string>>({} as Record<AgentType, string>);
  const [processingAgents, setProcessingAgents] = useState<Set<AgentType>>(new Set());
  const [completedAgents, setCompletedAgents] = useState<Set<AgentType>>(new Set());
  const [failedAgents, setFailedAgents] = useState<Set<AgentType>>(new Set());
  const [allComplete, setAllComplete] = useState(false);

  const resumeSkills = resumeData?.skills || [];
  const resumeProjects = resumeData?.projects || [];
  const resumeExperience = resumeData?.experience || [];

  const analyzeWithAgent = useCallback(async (agentType: AgentType, retries = 2): Promise<string> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
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
          // If rate limited, wait and retry
          if (data.error.includes("Rate limit") && attempt < retries) {
            console.log(`Rate limited on ${agentType}, retrying in 2s...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw new Error(data.error);
        }

        return data?.insight || "Analysis complete.";
      } catch (err) {
        if (attempt < retries) {
          console.log(`Retrying ${agentType} after error...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        throw err;
      }
    }
    throw new Error("Max retries exceeded");
  }, [answers, resumeSkills, resumeProjects, resumeExperience]);

  const runSingleAgent = useCallback(async (agent: Agent): Promise<void> => {
    setProcessingAgents(prev => new Set([...prev, agent.id]));

    try {
      const insight = await analyzeWithAgent(agent.id);
      
      setLocalAgentInsights(prev => ({ ...prev, [agent.id]: insight }));
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
      setLocalAgentInsights(prev => ({
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

    await runSingleAgent(agent);
  }, [runSingleAgent]);

  // Run agents SEQUENTIALLY to avoid rate limits
  useEffect(() => {
    let cancelled = false;

    const runAllAgentsSequentially = async () => {
      for (const agent of agents) {
        if (cancelled) break;
        await runSingleAgent(agent);
        // Wait 1.5 seconds between agents to respect rate limits
        if (!cancelled) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    };

    runAllAgentsSequentially();

    return () => {
      cancelled = true;
    };
  }, [runSingleAgent]);

  useEffect(() => {
    if (completedAgents.size === agents.length) {
      // Save all insights to PhaseContext for use by Phase components
      const insights: AgentInsights = {
        profiler: agentInsights.profiler || "",
        pulse: agentInsights.pulse || "",
        forge: agentInsights.forge || "",
        gatekeeper: agentInsights.gatekeeper || "",
      };
      setAgentInsights(insights);
      setTimeout(() => setAllComplete(true), 500);
    }
  }, [completedAgents.size, agentInsights, setAgentInsights]);

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
              <div className="flex-1 min-w-0 min-h-[60px]">
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

                <div className="min-h-[40px]">
                  {isProcessing && !insight && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                      <div className="shimmer h-4 rounded w-3/4" />
                    </div>
                  )}

                  {isComplete && insight && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
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

// Fallback insights when AI fails - concise one-liners
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
        return `🎯 The Builder → Precision Path • ${resumeSkills.length} skills detected, ready to specialize.`;
      }
      if (year.includes("1st") || year.includes("2nd")) {
        return "🎯 The Learner → Foundation Path • Master CS fundamentals first.";
      }
      return "🎯 The Achiever → Precision Path • Build production-grade portfolio.";

    case "pulse":
      if (interest.includes("AI")) {
        return "📈 MLOps Engineer @ Anthropic • Learn: LangGraph • Gap: System Design";
      }
      if (interest.includes("web")) {
        return "📈 Design Engineer @ Vercel • Learn: Next.js 15 • Gap: TypeScript";
      }
      return "📈 Platform Engineer @ Stripe • Learn: Kubernetes • Gap: Go/Rust";

    case "forge":
      if (level.includes("loop") || level.includes("basic")) {
        return "🔨 CLI Study Timer • Python + Rich CLI • Ships in 2 weeks";
      }
      if (interest.includes("AI")) {
        return "🔨 PR Sentinel • LangChain + GitHub API • Ships in 3 weeks";
      }
      return "🔨 Live Collab Editor • Next.js + WebSocket • Ships in 4 weeks";

    case "gatekeeper":
      if (resumeSkills.length > 0 && resumeSkills.length < 5) {
        return "⚠️ SKILL GAP: Limited foundation → 2 weeks on fundamentals first.";
      }
      if (hours.includes("5-10")) {
        return "⚠️ FOCUS: 5-10 hrs spreads thin → Deep-dive ONE skill instead.";
      }
      if (hours.includes("30+")) {
        return "⚠️ BURNOUT: 30+ hrs unsustainable → Schedule rest days.";
      }
      return "✅ VALIDATED: Build in public for maximum visibility.";

    default:
      return "Analysis complete.";
  }
}

export default AgentPanel;
