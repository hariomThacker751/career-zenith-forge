import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  CheckCircle2,
  Circle,
  Github,
  Scan,
  ChevronRight,
  Loader2,
  Trophy,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Code2,
  FileText,
  Shield,
  BookOpen,
  XCircle,
  ArrowRight,
  Rocket,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ============================================================================
// HACKWELL SENIOR DEBUG SYSTEM - Self-healing state machine
// Built by ex-Google Principal Engineers
// ============================================================================

const DEBUG_MODE = true; // Enable detailed logging
const SELF_HEAL_ENABLED = true; // Auto-fix invalid states

// State machine for the weekly mission flow
type MissionPhase = 
  | "tasks"      // Complete weekly tasks
  | "submit"     // Submit GitHub repo
  | "evaluating" // AI is reviewing
  | "results"    // Show pass/fail results
  | "unlocked";  // Week completed, ready for next

// Valid phase transitions (state machine guard)
const VALID_TRANSITIONS: Record<MissionPhase, MissionPhase[]> = {
  tasks: ["submit"],
  submit: ["tasks", "evaluating"],
  evaluating: ["results"],
  results: ["submit", "unlocked"], // Can retry (submit) or proceed (unlocked)
  unlocked: ["tasks"], // Reset for new week
};

interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

interface CodeQuality {
  structure: number;
  readability: number;
  bestPractices: number;
  documentation: number;
}

interface EvaluationResult {
  passed: boolean;
  score: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
  codeQuality?: CodeQuality;
  professionalReview?: string;
}

interface WeeklyMissionCardProps {
  weekNumber: number;
  theme: string;
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  onSubmitRepo: (url: string) => Promise<EvaluationResult>;
  onNextWeek: () => void;
  isDemo?: boolean;
}

// Debug logger with timestamp
const debugLog = (component: string, action: string, data?: unknown) => {
  if (!DEBUG_MODE) return;
  const timestamp = new Date().toISOString().slice(11, 23);
  console.log(`%c[${timestamp}] [${component}] ${action}`, 'color: #10B981; font-weight: bold;', data || '');
};

// Debug error with stack trace
const debugError = (component: string, error: string, data?: unknown) => {
  console.error(`%c[HACKWELL ERROR] [${component}] ${error}`, 'color: #EF4444; font-weight: bold;', data || '');
};

// Debug warn for self-healing actions
const debugWarn = (component: string, message: string, data?: unknown) => {
  console.warn(`%c[HACKWELL SELF-HEAL] [${component}] ${message}`, 'color: #F59E0B; font-weight: bold;', data || '');
};

// Helper function for quality labels
const getQualityLabel = (score: number) => {
  if (score >= 90) return { label: "Excellent", color: "text-primary" };
  if (score >= 75) return { label: "Good", color: "text-green-400" };
  if (score >= 60) return { label: "Fair", color: "text-yellow-400" };
  return { label: "Needs Work", color: "text-red-400" };
};

// Quality bar component - moved outside to fix ref warning
interface QualityBarProps {
  label: string;
  score: number;
  icon: LucideIcon;
}

const QualityBar = ({ label, score, icon: Icon }: QualityBarProps) => {
  const quality = getQualityLabel(score);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        <span className={`font-medium ${quality.color}`}>{score}/100</span>
      </div>
      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export const WeeklyMissionCard = ({
  weekNumber,
  theme,
  tasks,
  onTaskToggle,
  onSubmitRepo,
  onNextWeek,
  isDemo = false,
}: WeeklyMissionCardProps) => {
  const [phase, setPhase] = useState<MissionPhase>("tasks");
  const [githubUrl, setGithubUrl] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  
  // Refs for self-healing
  const lastWeekRef = useRef(weekNumber);
  const phaseHistoryRef = useRef<MissionPhase[]>(["tasks"]);
  const evalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const allTasksCompleted = tasks.length > 0 && completedCount === tasks.length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const scanSteps = [
    { label: "Cloning repository...", icon: Github },
    { label: "Analyzing code structure...", icon: Code2 },
    { label: "Evaluating best practices...", icon: Shield },
    { label: "Checking documentation...", icon: BookOpen },
    { label: "Running AI code review...", icon: Scan },
    { label: "Generating professional feedback...", icon: FileText },
  ];

  // ============================================================================
  // SELF-HEALING STATE MACHINE
  // ============================================================================

  // Safe phase transition with validation
  const safeSetPhase = useCallback((nextPhase: MissionPhase, reason: string) => {
    setPhase(currentPhase => {
      // Validate transition
      const allowedTransitions = VALID_TRANSITIONS[currentPhase];
      
      if (!allowedTransitions.includes(nextPhase)) {
        // Self-heal: Log warning and determine correct action
        if (SELF_HEAL_ENABLED) {
          debugWarn('StateMachine', `Invalid transition: ${currentPhase} → ${nextPhase}. Reason: ${reason}`);
          
          // Self-healing logic based on context
          if (nextPhase === "tasks" && currentPhase !== "unlocked") {
            // Always allow going back to tasks (safe reset)
            debugWarn('StateMachine', 'Self-healing: Allowing reset to tasks');
            phaseHistoryRef.current.push("tasks");
            return "tasks";
          }
          
          // Stay in current phase for invalid transitions
          debugWarn('StateMachine', `Self-healing: Staying in ${currentPhase}`);
          return currentPhase;
        }
        
        debugError('StateMachine', `Blocked invalid transition: ${currentPhase} → ${nextPhase}`);
        return currentPhase;
      }

      debugLog('StateMachine', `Transition: ${currentPhase} → ${nextPhase}`, { reason });
      phaseHistoryRef.current.push(nextPhase);
      return nextPhase;
    });
  }, []);

  // ============================================================================
  // WEEK CHANGE DETECTION (Critical for proper reset)
  // ============================================================================
  
  useEffect(() => {
    if (weekNumber !== lastWeekRef.current) {
      debugLog('WeekChange', `Week changed: ${lastWeekRef.current} → ${weekNumber}`, {
        previousPhase: phase,
        resettingTo: 'tasks'
      });
      
      // Clear any pending evaluation timeouts
      if (evalTimeoutRef.current) {
        clearTimeout(evalTimeoutRef.current);
        evalTimeoutRef.current = null;
        debugWarn('Cleanup', 'Cleared pending evaluation timeout');
      }
      
      // Full reset for new week
      setPhase("tasks");
      setGithubUrl("");
      setResult(null);
      setScanStep(0);
      phaseHistoryRef.current = ["tasks"];
      
      lastWeekRef.current = weekNumber;
    }
  }, [weekNumber, phase]);

  // ============================================================================
  // SELF-HEALING: Stuck state detection
  // ============================================================================
  
  useEffect(() => {
    // Detect stuck in evaluating phase (timeout after 60 seconds)
    if (phase === "evaluating") {
      evalTimeoutRef.current = setTimeout(() => {
        debugWarn('SelfHeal', 'Evaluation stuck for 60s, auto-recovering...');
        setResult({
          passed: false,
          score: 0,
          feedback: "Evaluation timed out. Please try again.",
        });
        setPhase("results");
      }, 60000);

      return () => {
        if (evalTimeoutRef.current) {
          clearTimeout(evalTimeoutRef.current);
        }
      };
    }
  }, [phase]);

  // ============================================================================
  // SELF-HEALING: Invalid state detection on mount/update
  // ============================================================================
  
  useEffect(() => {
    // Detect invalid states and self-heal
    if (SELF_HEAL_ENABLED) {
      // Case 1: In "results" but no result data
      if (phase === "results" && !result) {
        debugWarn('SelfHeal', 'In results phase but no result data, resetting to tasks');
        setPhase("tasks");
        return;
      }
      
      // Case 2: In "unlocked" but somehow still showing (should trigger onNextWeek)
      if (phase === "unlocked") {
        debugLog('SelfHeal', 'In unlocked phase, ready for next week transition');
      }
      
      // Case 3: Tasks not loaded but not in tasks phase
      if (tasks.length === 0 && phase !== "tasks") {
        debugWarn('SelfHeal', 'No tasks loaded, resetting to tasks phase');
        setPhase("tasks");
        return;
      }
    }
  }, [phase, result, tasks.length]);

  // Log phase transitions for debugging
  useEffect(() => {
    debugLog('PhaseUpdate', `Current phase: ${phase}`, {
      weekNumber,
      tasksCompleted: `${completedCount}/${tasks.length}`,
      hasResult: !!result,
      phaseHistory: phaseHistoryRef.current
    });
  }, [phase, weekNumber, completedCount, tasks.length, result]);

  // ============================================================================
  // ACTION HANDLERS (with validation)
  // ============================================================================

  const handleProceedToSubmit = useCallback(() => {
    if (!allTasksCompleted) {
      debugWarn('Validation', 'Attempted to proceed without completing all tasks', {
        completed: completedCount,
        total: tasks.length
      });
      return;
    }
    
    debugLog('Action', 'Proceeding to submit phase');
    safeSetPhase("submit", "User completed all tasks");
  }, [allTasksCompleted, completedCount, tasks.length, safeSetPhase]);

  const handleSubmitRepo = useCallback(async () => {
    // Validate GitHub URL
    const isValidUrl = githubUrl.includes("github.com") && 
                       (githubUrl.includes("github.com/") && githubUrl.split("/").length >= 5);
    
    if (!isValidUrl) {
      debugWarn('Validation', 'Invalid GitHub URL format', { url: githubUrl });
      return;
    }
    
    debugLog('Action', 'Starting evaluation', { url: githubUrl });
    safeSetPhase("evaluating", "User submitted repo for evaluation");
    setScanStep(0);

    // Animate through scan steps
    const stepInterval = setInterval(() => {
      setScanStep((prev) => {
        if (prev >= scanSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    try {
      const evalResult = await onSubmitRepo(githubUrl);
      clearInterval(stepInterval);
      
      // Validate result
      if (!evalResult || typeof evalResult.score !== 'number') {
        debugError('Evaluation', 'Invalid result format', evalResult);
        throw new Error('Invalid evaluation result');
      }
      
      debugLog('Action', 'Evaluation complete', { 
        score: evalResult.score, 
        passed: evalResult.passed 
      });
      
      setResult(evalResult);
      setPhase("results"); // Direct set since we're transitioning from evaluating
      
    } catch (error) {
      clearInterval(stepInterval);
      debugError('Evaluation', 'Evaluation failed', error);
      
      setResult({
        passed: false,
        score: 0,
        feedback: error instanceof Error 
          ? `Evaluation failed: ${error.message}` 
          : "Failed to evaluate. Please try again.",
      });
      setPhase("results");
    }
  }, [githubUrl, onSubmitRepo, scanSteps.length, safeSetPhase]);

  const handleTryAgain = useCallback(() => {
    debugLog('Action', 'User retrying submission');
    setGithubUrl("");
    setResult(null);
    setScanStep(0);
    safeSetPhase("submit", "User clicked try again");
  }, [safeSetPhase]);

  const handleBackToTasks = useCallback(() => {
    debugLog('Action', 'User going back to tasks');
    setGithubUrl("");
    setResult(null);
    setPhase("tasks"); // Always allow going back to tasks
  }, []);

  const handleUnlockNext = useCallback(() => {
    if (!result?.passed) {
      debugWarn('Validation', 'Attempted to unlock next week without passing');
      return;
    }
    
    debugLog('Action', 'Unlocking next week', { 
      currentWeek: weekNumber,
      nextWeek: weekNumber + 1 
    });
    
    setPhase("unlocked");
    
    // Small delay to show celebration before transitioning
    setTimeout(() => {
      onNextWeek();
    }, 100);
  }, [result?.passed, weekNumber, onNextWeek]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-lg shadow-black/20"
    >
      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Week {weekNumber} Mission
              </h3>
              <p className="text-sm text-muted-foreground">{theme}</p>
            </div>
          </div>
          
          {/* Phase Indicator */}
          <div className="flex items-center gap-2">
            {(["tasks", "submit", "evaluating", "results"] as const).map((p, i) => {
              const phaseOrder = ["tasks", "submit", "evaluating", "results"] as const;
              const currentPhaseIndex = phaseOrder.indexOf(phase as typeof phaseOrder[number]);
              return (
                <motion.div
                  key={p}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: phase === p ? 1.1 : 1,
                    opacity: phase === p ? 1 : 0.5 
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    phase === p
                      ? "w-6 bg-primary shadow-md shadow-primary/50"
                      : i < currentPhaseIndex
                      ? "w-2 bg-primary/60"
                      : "w-2 bg-muted-foreground/30"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        {phase === "tasks" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3"
          >
            <div className="flex-1 h-2.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full shadow-sm shadow-primary/30"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-bold text-foreground min-w-[3rem] text-right">
              {completedCount}/{tasks.length}
            </span>
          </motion.div>
        )}
      </div>

      {/* Content - Changes based on phase */}
      <AnimatePresence mode="wait">
        {/* PHASE 1: Tasks */}
        {phase === "tasks" && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-4 md:p-6"
          >
            <div className="space-y-2 mb-4">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                  onClick={() => onTaskToggle(task.id)}
                  className={`group flex items-start gap-3 p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    task.isCompleted
                      ? "bg-primary/10 border border-primary/30 shadow-sm shadow-primary/10"
                      : hoveredTask === task.id
                      ? "bg-muted/60 border border-border"
                      : "bg-transparent border border-transparent hover:bg-muted/30"
                  }`}
                >
                  <motion.div
                    animate={{ scale: task.isCompleted ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-0.5 shrink-0"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${task.isCompleted ? "text-primary line-through" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={handleProceedToSubmit}
              disabled={!allTasksCompleted}
              className={`w-full h-12 rounded-xl font-semibold transition-all ${
                allTasksCompleted
                  ? "bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/30 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {allTasksCompleted ? (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Ready to Submit Project
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>Complete all tasks to continue</>
              )}
            </Button>
          </motion.div>
        )}

        {/* PHASE 2: Submit Repo */}
        {phase === "submit" && (
          <motion.div
            key="submit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 md:p-8"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-lg shadow-primary/10">
                <Github className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Submit Your Project</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Paste your GitHub repository URL for AI-powered professional code review
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="relative">
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="pl-12 h-12 bg-muted/30 border-border/50 text-base focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBackToTasks}
                  className="flex-1 h-12 border-border/50 hover:bg-muted/50"
                >
                  Back to Tasks
                </Button>
                <Button
                  onClick={handleSubmitRepo}
                  disabled={!githubUrl.includes("github.com")}
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Start AI Review
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: Evaluating */}
        {phase === "evaluating" && (
          <motion.div
            key="evaluating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 md:p-8"
          >
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center mx-auto mb-4 border border-primary/20"
              >
                <Scan className="w-8 h-8 text-primary" />
              </motion.div>
              <h4 className="text-lg font-bold text-foreground mb-2">AI Review in Progress</h4>
              <p className="text-sm text-muted-foreground">
                Our AI is analyzing your code like a senior engineer
              </p>
            </div>

            <div className="bg-muted/20 rounded-xl p-4 space-y-3 border border-border/30">
              {scanSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0.3, x: -10 }}
                    animate={{
                      opacity: index <= scanStep ? 1 : 0.3,
                      x: 0,
                    }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {index < scanStep ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : index === scanStep ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                    )}
                    <StepIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className={`text-sm ${index <= scanStep ? "text-foreground" : "text-muted-foreground/50"}`}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/70 shadow-sm shadow-primary/30"
                animate={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {/* PHASE 4: Results */}
        {phase === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 md:p-6 space-y-5"
          >
            {/* Score Header */}
            <div className={`rounded-xl p-5 ${result.passed ? "bg-primary/10 border border-primary/30" : "bg-red-500/10 border border-red-500/30"}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center ${result.passed ? "bg-primary/20 shadow-lg shadow-primary/20" : "bg-red-500/20"}`}>
                    {result.passed ? (
                      <Trophy className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                    ) : (
                      <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-lg md:text-xl font-bold ${result.passed ? "text-primary" : "text-red-400"}`}>
                      {result.passed ? "Week Passed!" : "Needs Improvement"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {result.passed ? "Great work on completing this week's mission" : "Score 70+ required to pass"}
                    </p>
                  </div>
                </div>
                <div className={`text-4xl md:text-5xl font-bold ${result.passed ? "text-primary" : "text-red-400"}`}>
                  {result.score}
                </div>
              </div>
              <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{result.feedback}</p>
            </div>

            {/* Code Quality */}
            {result.codeQuality && (
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30 space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Code Quality Breakdown
                </h5>
                <QualityBar label="Structure" score={result.codeQuality.structure} icon={Code2} />
                <QualityBar label="Readability" score={result.codeQuality.readability} icon={FileText} />
                <QualityBar label="Best Practices" score={result.codeQuality.bestPractices} icon={Shield} />
                <QualityBar label="Documentation" score={result.codeQuality.documentation} icon={BookOpen} />
              </div>
            )}

            {/* Strengths & Improvements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.strengths && result.strengths.length > 0 && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase text-primary mb-3">
                    <ThumbsUp className="w-4 h-4" /> Strengths
                  </h5>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.improvements && result.improvements.length > 0 && (
                <div className={`${result.passed ? "bg-amber-500/5 border-amber-500/20" : "bg-red-500/5 border-red-500/20"} rounded-xl p-4 border`}>
                  <h5 className={`flex items-center gap-2 text-xs font-bold uppercase mb-3 ${result.passed ? "text-amber-400" : "text-red-400"}`}>
                    <ThumbsDown className="w-4 h-4" /> Areas to Improve
                  </h5>
                  <ul className="space-y-2">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                        {result.passed ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                        )}
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Professional Review */}
            {result.professionalReview && (
              <div className="bg-violet-500/5 rounded-xl p-4 border border-violet-500/20">
                <h5 className="text-xs font-bold uppercase text-violet-400 mb-3">
                  💼 Senior Engineer Review
                </h5>
                <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                  {result.professionalReview}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {result.passed ? (
              <Button
                onClick={handleUnlockNext}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Unlock Week {weekNumber + 1}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleTryAgain} className="flex-1 h-12 border-border/50">
                  Try Again
                </Button>
                <Button
                  onClick={() => window.open(githubUrl, "_blank")}
                  variant="outline"
                  className="flex-1 h-12 border-border/50"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View Repo
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* PHASE 5: Unlocked - Brief celebration before transition */}
        {phase === "unlocked" && (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30"
            >
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <h4 className="text-2xl font-bold text-primary mb-2">Week {weekNumber} Complete!</h4>
            <p className="text-muted-foreground">
              +10 credits earned. Loading Week {weekNumber + 1}...
            </p>
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
