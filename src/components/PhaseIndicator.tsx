import { motion } from "framer-motion";
import { Lock, Unlock, BookOpen, Hammer, Rocket, Check } from "lucide-react";
import { usePhase } from "@/contexts/PhaseContext";

interface PhaseInfo {
  id: 1 | 2 | 3;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const phases: PhaseInfo[] = [
  {
    id: 1,
    title: "THE FOUNDATION",
    subtitle: "What to Learn",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "THE FORGE",
    subtitle: "Industry Project",
    icon: <Hammer className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "THE LAUNCH",
    subtitle: "Schedule & Submit",
    icon: <Rocket className="w-5 h-5" />,
  },
];

const PhaseIndicator = () => {
  const { currentPhase, phaseData, isPhaseUnlocked, setCurrentPhase } = usePhase();

  const getPhaseStatus = (phase: 1 | 2 | 3) => {
    if (phase === 1 && phaseData.phase1.completed) return "completed";
    if (phase === 2 && phaseData.phase2.completed) return "completed";
    if (phase === 3 && phaseData.phase3.completed) return "completed";
    if (phase === currentPhase) return "active";
    if (isPhaseUnlocked(phase)) return "unlocked";
    return "locked";
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-2 relative">
        {/* Connection Line */}
        <div className="absolute top-7 left-[10%] right-[10%] h-1 bg-border rounded-full -z-10" />
        <motion.div
          className="absolute top-7 left-[10%] h-1 bg-gradient-to-r from-primary via-primary to-primary/50 rounded-full -z-10"
          initial={{ width: "0%" }}
          animate={{
            width:
              phaseData.phase3.completed
                ? "80%"
                : phaseData.phase2.completed
                ? "53%"
                : phaseData.phase1.completed
                ? "27%"
                : "0%",
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {phases.map((phase) => {
          const status = getPhaseStatus(phase.id);
          const isClickable = isPhaseUnlocked(phase.id);

          return (
            <motion.button
              key={phase.id}
              disabled={!isClickable}
              onClick={() => isClickable && setCurrentPhase(phase.id)}
              className={`flex flex-col items-center flex-1 group ${
                isClickable ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              whileHover={isClickable ? { scale: 1.02 } : {}}
              whileTap={isClickable ? { scale: 0.98 } : {}}
            >
              {/* Phase Node */}
              <motion.div
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 ${
                  status === "completed"
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30"
                    : status === "active"
                    ? "bg-gradient-to-br from-primary/20 to-secondary/20 text-primary border-2 border-primary"
                    : status === "unlocked"
                    ? "bg-card border-2 border-border text-muted-foreground hover:border-primary/50"
                    : "bg-muted/50 text-muted-foreground/50"
                }`}
              >
                {status === "completed" ? (
                  <Check className="w-6 h-6" />
                ) : status === "locked" ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  phase.icon
                )}

                {/* Active Pulse */}
                {status === "active" && (
                  <motion.div
                    className="absolute -inset-1 rounded-2xl border-2 border-primary/30"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Lock Icon Overlay */}
                {status === "locked" && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </motion.div>
                )}
              </motion.div>

              {/* Phase Label */}
              <div className="text-center">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${
                    status === "completed" || status === "active"
                      ? "text-primary"
                      : status === "unlocked"
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {phase.title}
                </p>
                <p
                  className={`text-xs ${
                    status === "locked" ? "text-muted-foreground/30" : "text-muted-foreground"
                  }`}
                >
                  {phase.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PhaseIndicator;
