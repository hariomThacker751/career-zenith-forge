import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export interface ReasoningEntry {
  id: string;
  timestamp: Date;
  agent: string;
  thought: string;
  type: "analysis" | "insight" | "decision" | "action";
}

interface LiveReasoningLogProps {
  entries: ReasoningEntry[];
  isActive: boolean;
  title?: string;
}

const getTypeStyles = (type: ReasoningEntry["type"]) => {
  switch (type) {
    case "analysis":
      return "bg-secondary/20 text-secondary";
    case "insight":
      return "bg-amber-500/20 text-amber-400";
    case "decision":
      return "bg-primary/20 text-primary";
    case "action":
      return "bg-rose-500/20 text-rose-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const LiveReasoningLog = ({ entries, isActive, title = "Live Reasoning Log" }: LiveReasoningLogProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const displayedEntries = showAll ? entries : entries.slice(-5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="reasoning-log"
    >
      <div className="reasoning-log-header">
        <motion.div
          animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain className="w-5 h-5 text-primary" />
        </motion.div>
        <span className="font-bold text-foreground flex-1">{title}</span>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-primary font-medium">LIVE</span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </motion.div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {entries.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p>Initializing reasoning engine...</p>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {displayedEntries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="reasoning-log-entry"
                      >
                        <div className="reasoning-dot" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeStyles(entry.type)}`}>
                              {entry.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entry.agent}
                            </span>
                            <span className="text-xs text-muted-foreground/60 ml-auto">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {entry.thought}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {entries.length > 5 && (
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="w-full py-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      {showAll ? "Show Less" : `View ${entries.length - 5} More Entries`}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveReasoningLog;
