import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, Circle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

interface ActiveSprintTrackerProps {
  weekNumber: number;
  theme: string;
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  onSubmitForReview: () => void;
  isSubmitting?: boolean;
}

export const ActiveSprintTracker = ({
  weekNumber,
  theme,
  tasks,
  onTaskToggle,
  onSubmitForReview,
  isSubmitting = false,
}: ActiveSprintTrackerProps) => {
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const allCompleted = tasks.length > 0 && completedCount === tasks.length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-emerald-500/10 to-cyan-500/10 p-6 border-b border-border/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Active Mission: Week {weekNumber}
            </h3>
            <p className="text-sm text-muted-foreground">{theme}</p>
          </div>
        </div>

        {/* Mini progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {completedCount}/{tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredTask(task.id)}
              onMouseLeave={() => setHoveredTask(null)}
              onClick={() => onTaskToggle(task.id)}
              className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                task.isCompleted
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : hoveredTask === task.id
                  ? "bg-muted/50 border border-border"
                  : "bg-transparent border border-transparent"
              }`}
            >
              <motion.div
                animate={{
                  scale: task.isCompleted ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className="mt-0.5"
              >
                {task.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium transition-all ${
                    task.isCompleted
                      ? "text-emerald-500 line-through"
                      : "text-foreground"
                  }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {task.description}
                  </p>
                )}
              </div>

              {task.isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <span className="text-xs text-emerald-500 font-medium">
                    Done
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <div className="p-4 pt-0">
        <Button
          onClick={onSubmitForReview}
          disabled={!allCompleted || isSubmitting}
          className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
            allCompleted
              ? "bg-gradient-to-r from-emerald-500 to-primary hover:shadow-lg hover:shadow-primary/30"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit for Review
            </>
          )}
        </Button>
        {!allCompleted && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Complete all tasks to submit for review
          </p>
        )}
      </div>
    </motion.div>
  );
};
