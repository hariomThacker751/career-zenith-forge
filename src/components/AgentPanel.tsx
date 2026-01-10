import { motion } from "framer-motion";
import { User, TrendingUp, Hammer, Shield, CheckCircle2 } from "lucide-react";

interface AgentPanelProps {
  answers: Record<number, string>;
  onAnalysisComplete: () => void;
}

const agents = [
  {
    id: "profiler",
    name: "THE PROFILER",
    icon: User,
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-secondary",
    bgColor: "bg-secondary/10",
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
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
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
    color: "text-red-400",
    bgColor: "bg-red-400/10",
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
  return (
    <div className="space-y-4">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-semibold text-center mb-6"
      >
        <span className="text-gradient-indigo">Multi-Agent Analysis</span>
      </motion.h3>
      
      {agents.map((agent, index) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.5, duration: 0.4 }}
          className="glass-card p-4"
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${agent.bgColor} flex items-center justify-center flex-shrink-0`}>
              <agent.icon className={`w-5 h-5 ${agent.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-bold ${agent.color}`}>{agent.name}</span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.5 + 0.3 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </motion.div>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.5 + 0.2 }}
                className="text-sm text-muted-foreground"
              >
                {agent.getInsight(answers)}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: agents.length * 0.5 + 0.3 }}
        className="pt-4"
      >
        <button
          onClick={onAnalysisComplete}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors glow-emerald"
        >
          View Your Personalized Roadmap →
        </button>
      </motion.div>
    </div>
  );
};

export default AgentPanel;