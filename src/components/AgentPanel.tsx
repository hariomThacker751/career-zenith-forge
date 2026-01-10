import { motion } from "framer-motion";
import { User, TrendingUp, Hammer, Shield, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface AgentPanelProps {
  answers: Record<number, string>;
  onAnalysisComplete: () => void;
}

const agents = [
  {
    id: "profiler",
    name: "THE PROFILER",
    icon: User,
    gradient: "from-primary to-emerald-400",
    bgGradient: "from-primary/10 to-emerald-400/10",
    description: "Analyzing your Student Persona...",
    getInsight: (answers: Record<number, string>) => {
      const year = answers[0] || "";
      if (year.includes("1st") || year.includes("2nd")) {
        return "Foundation Path detected. Focus: CS Fundamentals, problem-solving mindset, and building your first real projects.";
      }
      return "Precision Path detected. Focus: Industry specialization, interview prep, and production-grade portfolio.";
    }
  },
  {
    id: "pulse",
    name: "THE PULSE",
    icon: TrendingUp,
    gradient: "from-secondary to-indigo-400",
    bgGradient: "from-secondary/10 to-indigo-400/10",
    description: "Injecting 2026 industry trends...",
    getInsight: (answers: Record<number, string>) => {
      const interest = answers[1] || "";
      if (interest.includes("AI")) {
        return "Hot roles: MLOps Engineer, Agentic AI Developer, AI Safety Researcher. Companies hiring: OpenAI, Anthropic, Google DeepMind.";
      }
      if (interest.includes("web") || interest.includes("mobile")) {
        return "Hot roles: Full-Stack Engineer, Mobile Lead, Design Engineer. Focus on Next.js 15, React Native, and AI-enhanced UX.";
      }
      if (interest.includes("cybersecurity")) {
        return "Hot roles: Cloud Security Engineer, AppSec Specialist, Red Team Lead. Zero-trust architecture is non-negotiable.";
      }
      return "Hot roles: Platform Engineer, DevOps/SRE, Data Engineer. Cloud-native skills are table stakes for 2026.";
    }
  },
  {
    id: "forge",
    name: "THE FORGE",
    icon: Hammer,
    gradient: "from-amber-500 to-orange-400",
    bgGradient: "from-amber-500/10 to-orange-400/10",
    description: "Generating dynamic project...",
    getInsight: (answers: Record<number, string>) => {
      const level = answers[2] || "";
      const interest = answers[1] || "";
      
      if (level.includes("loop") || level.includes("basic")) {
        return "Project: CLI-based Automated Study Scheduler with Pomodoro Analytics. Learn file I/O, data structures, and time management algorithms.";
      }
      if (interest.includes("AI")) {
        return "Project: Autonomous AI Agent that audits GitHub PRs for security vulnerabilities using LangChain + RAG architecture.";
      }
      if (interest.includes("web")) {
        return "Project: Real-time collaborative code editor with AI pair programming, WebSocket sync, and conflict resolution.";
      }
      return "Project: Distributed task queue system with observability dashboard, retry logic, and dead-letter handling.";
    }
  },
  {
    id: "gatekeeper",
    name: "THE GATEKEEPER",
    icon: Shield,
    gradient: "from-rose-500 to-pink-400",
    bgGradient: "from-rose-500/10 to-pink-400/10",
    description: "Validating roadmap...",
    getInsight: (answers: Record<number, string>) => {
      const hours = answers[3] || "";
      if (hours.includes("5-10")) {
        return "⚠️ Risk: Slow progress may cause frustration. Recommendation: Focus on ONE skill deeply rather than spreading thin.";
      }
      if (hours.includes("30+")) {
        return "⚠️ Risk: Burnout. Recommendation: Schedule mandatory rest days. Consistency beats intensity.";
      }
      return "Roadmap validated. Key success factor: Build in public, document your journey, and seek feedback early.";
    }
  }
];

const AgentPanel = ({ answers, onAnalysisComplete }: AgentPanelProps) => {
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());
  const [allComplete, setAllComplete] = useState(false);

  useEffect(() => {
    agents.forEach((agent, index) => {
      setTimeout(() => {
        setCompletedAgents(prev => new Set([...prev, agent.id]));
      }, (index + 1) * 600);
    });

    setTimeout(() => {
      setAllComplete(true);
    }, agents.length * 600 + 500);
  }, []);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-gradient-sunset">
          Multi-Agent Analysis
        </h3>
        <Sparkles className="w-5 h-5 text-secondary" />
      </motion.div>
      
      {agents.map((agent, index) => {
        const isComplete = completedAgents.has(agent.id);
        
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
            className="card-interactive p-4"
          >
            <div className="flex items-start gap-4">
              <motion.div 
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.bgGradient} flex items-center justify-center flex-shrink-0 border border-border`}
                animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <agent.icon className={`w-5 h-5 bg-gradient-to-r ${agent.gradient} bg-clip-text`} style={{ color: 'hsl(var(--primary))' }} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-bold bg-gradient-to-r ${agent.gradient} bg-clip-text text-transparent`}>
                    {agent.name}
                  </span>
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  ) : (
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={isComplete ? { opacity: 1, height: "auto" } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {agent.getInsight(answers)}
                  </p>
                </motion.div>
                {!isComplete && (
                  <div className="shimmer h-4 rounded w-3/4 mt-1" />
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

// Need to import AnimatePresence
import { AnimatePresence } from "framer-motion";

export default AgentPanel;
