import { motion } from "framer-motion";
import { Shield, Hammer, Rocket, Trophy } from "lucide-react";

interface GlobalProgressHeaderProps {
  currentPhase: number;
  currentWeek: number;
  completionPercentage: number;
}

const phases = [
  { id: 1, name: "Foundation", icon: Shield },
  { id: 2, name: "Forge", icon: Hammer },
  { id: 3, name: "Launch", icon: Rocket },
  { id: 4, name: "Master", icon: Trophy },
];

export const GlobalProgressHeader = ({
  currentPhase,
  currentWeek,
  completionPercentage,
}: GlobalProgressHeaderProps) => {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
      {/* Phase indicators */}
      <div className="flex items-center justify-between mb-6">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isCompleted = currentPhase > phase.id;
          const isActive = currentPhase === phase.id;

          return (
            <div key={phase.id} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col items-center ${
                  isActive ? "scale-110" : ""
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500/20 border-2 border-emerald-500"
                      : isActive
                      ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/30"
                      : "bg-muted/30 border border-border/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isCompleted
                        ? "text-emerald-500"
                        : isActive
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {phase.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activePhase"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                    initial={false}
                  />
                )}
              </motion.div>

              {index < phases.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-border/30" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-primary"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: isCompleted ? 1 : isActive ? 0.5 : 0,
                    }}
                    style={{ originX: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Week {currentWeek} of 24
          </span>
          <span className="text-sm font-semibold text-primary">
            {completionPercentage}% Complete
          </span>
        </div>
        <div className="h-3 bg-muted/30 rounded-full overflow-hidden relative">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-primary to-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/50 via-primary/50 to-cyan-400/50 rounded-full blur-sm"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};
