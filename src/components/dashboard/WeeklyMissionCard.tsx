import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

// State machine for the weekly mission flow
type MissionPhase = 
  | "tasks"      // Complete weekly tasks
  | "submit"     // Submit GitHub repo
  | "evaluating" // AI is reviewing
  | "results"    // Show pass/fail results
  | "unlocked";  // Week completed, ready for next

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

  const handleProceedToSubmit = () => {
    setPhase("submit");
  };

  const handleSubmitRepo = async () => {
    if (!githubUrl.includes("github.com")) return;
    
    setPhase("evaluating");
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
      setResult(evalResult);
      setPhase("results");
    } catch (error) {
      clearInterval(stepInterval);
      setResult({
        passed: false,
        score: 0,
        feedback: "Failed to evaluate. Please try again.",
      });
      setPhase("results");
    }
  };

  const handleTryAgain = () => {
    setGithubUrl("");
    setResult(null);
    setPhase("submit");
  };

  const handleUnlockNext = () => {
    setPhase("unlocked");
    onNextWeek();
  };

  const getQualityLabel = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-emerald-400" };
    if (score >= 75) return { label: "Good", color: "text-green-400" };
    if (score >= 60) return { label: "Fair", color: "text-yellow-400" };
    return { label: "Needs Work", color: "text-red-400" };
  };

  const QualityBar = ({ label, score, icon: Icon }: { label: string; score: number; icon: any }) => {
    const quality = getQualityLabel(score);
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="w-3 h-3" />
            {label}
          </span>
          <span className={quality.color}>{score}/100</span>
        </div>
        <Progress value={score} className="h-1.5" />
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden"
    >
      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-primary/10 via-emerald-500/10 to-cyan-500/10 p-6 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-emerald-500/30 flex items-center justify-center">
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
            {["tasks", "submit", "evaluating", "results"].map((p, i) => (
              <div
                key={p}
                className={`w-2 h-2 rounded-full transition-all ${
                  phase === p
                    ? "w-6 bg-primary"
                    : i < ["tasks", "submit", "evaluating", "results"].indexOf(phase)
                    ? "bg-emerald-500"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {phase === "tasks" && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground">
              {completedCount}/{tasks.length}
            </span>
          </div>
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
            className="p-4"
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
                  className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    task.isCompleted
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : hoveredTask === task.id
                      ? "bg-muted/50 border border-border"
                      : "bg-transparent border border-transparent hover:bg-muted/30"
                  }`}
                >
                  <motion.div
                    animate={{ scale: task.isCompleted ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-0.5"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.isCompleted ? "text-emerald-500 line-through" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
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
                  ? "bg-gradient-to-r from-primary to-emerald-500 hover:shadow-lg hover:shadow-primary/30"
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
            className="p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <Github className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Submit Your Project</h4>
              <p className="text-sm text-muted-foreground">
                Paste your GitHub repository URL for AI-powered code review
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="pl-12 h-12 bg-muted/20 border-border/50 text-base"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPhase("tasks")}
                  className="flex-1 h-12"
                >
                  Back to Tasks
                </Button>
                <Button
                  onClick={handleSubmitRepo}
                  disabled={!githubUrl.includes("github.com")}
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-emerald-500"
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
            className="p-6"
          >
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-primary/20 flex items-center justify-center mx-auto mb-4"
              >
                <Scan className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <h4 className="text-lg font-bold text-foreground mb-2">AI Review in Progress</h4>
              <p className="text-sm text-muted-foreground">
                Our AI is analyzing your code like a senior engineer
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 space-y-3">
              {scanSteps.map((step, index) => (
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : index === scanStep ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/30" />
                  )}
                  <span className={`text-sm font-mono ${index <= scanStep ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 h-1.5 bg-muted/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
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
            className="p-6 space-y-5"
          >
            {/* Score Header */}
            <div className={`rounded-xl p-5 ${result.passed ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${result.passed ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    {result.passed ? (
                      <Trophy className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xl font-bold ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
                      {result.passed ? "Week Passed!" : "Needs Improvement"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {result.passed ? "Great work on completing this week's mission" : "Score 70+ required to pass"}
                    </p>
                  </div>
                </div>
                <div className={`text-5xl font-bold ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
                  {result.score}
                </div>
              </div>
              <p className="mt-4 text-sm text-foreground/80">{result.feedback}</p>
            </div>

            {/* Code Quality */}
            {result.codeQuality && (
              <div className="bg-muted/10 rounded-xl p-4 border border-border/30 space-y-3">
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
                <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-400 mb-3">
                    <ThumbsUp className="w-4 h-4" /> Strengths
                  </h5>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
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
                          <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
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
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-primary hover:shadow-lg"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Unlock Week {weekNumber + 1}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleTryAgain} className="flex-1 h-12">
                  Try Again
                </Button>
                <Button
                  onClick={() => window.open(githubUrl, "_blank")}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View Repo
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* PHASE 5: Unlocked */}
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
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center mx-auto mb-4"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            <h4 className="text-2xl font-bold text-emerald-400 mb-2">Week {weekNumber} Complete!</h4>
            <p className="text-muted-foreground mb-6">
              +10 credits earned. Week {weekNumber + 1} is now unlocked.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-primary to-emerald-500"
            >
              Continue to Week {weekNumber + 1}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
