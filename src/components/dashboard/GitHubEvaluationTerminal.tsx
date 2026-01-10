import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Scan,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  Trophy,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Code2,
  FileText,
  Shield,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type SubmissionStatus = "idle" | "scanning" | "success" | "failed";

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

interface GitHubEvaluationTerminalProps {
  onSubmit: (url: string) => Promise<EvaluationResult>;
  onNextWeek?: () => void;
  weekNumber?: number;
  weekTheme?: string;
  tasks?: string[];
}

export const GitHubEvaluationTerminal = ({
  onSubmit,
  onNextWeek,
  weekNumber = 1,
  weekTheme = "Development Sprint",
  tasks = [],
}: GitHubEvaluationTerminalProps) => {
  const [githubUrl, setGithubUrl] = useState("");
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [currentScanMsg, setCurrentScanMsg] = useState(0);

  const scanningMessages = [
    "Cloning repository...",
    "Analyzing code structure...",
    "Evaluating best practices...",
    "Checking documentation...",
    "Running AI code review...",
    "Generating professional feedback...",
  ];

  const handleSubmit = async () => {
    if (!githubUrl.includes("github.com")) return;

    setStatus("scanning");
    setResult(null);

    try {
      const evalResult = await onSubmit(githubUrl);
      setResult(evalResult);
      setStatus(evalResult.passed ? "success" : "failed");
    } catch (error) {
      setStatus("failed");
      setResult({
        passed: false,
        score: 0,
        feedback: "Failed to evaluate repository. Please try again.",
      });
    }
  };

  // Cycle through scanning messages when scanning
  useEffect(() => {
    if (status === "scanning") {
      setCurrentScanMsg(0);
      const interval = setInterval(() => {
        setCurrentScanMsg((prev) => (prev + 1) % scanningMessages.length);
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [status]);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden"
    >
      {/* Terminal Header */}
      <div className="bg-slate-900 dark:bg-slate-950 px-4 py-3 flex items-center gap-2 border-b border-border/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-sm text-slate-400 font-mono">
          hackwell-ai-reviewer v2.0
        </span>
        {status === "scanning" && (
          <div className="ml-auto flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
            <span className="text-xs text-cyan-400">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Terminal Content */}
      <div className="bg-slate-900 dark:bg-slate-950 p-6 font-mono text-sm text-slate-100">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-muted-foreground">$</span>
                <span>hackwell evaluate --repo --week {weekNumber}</span>
              </div>

              <div className="text-xs text-muted-foreground mb-2">
                Submit your GitHub repository for AI-powered professional code review
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="pl-10 bg-muted/20 border-border/50 font-mono text-sm"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!githubUrl.includes("github.com")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Initialize AI Review
                </Button>
              </div>
            </motion.div>
          )}

          {status === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-cyan-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Code Review in Progress...</span>
              </div>

              <div className="bg-muted/10 rounded-lg p-4 border border-border/30">
                <div className="space-y-2">
                  {scanningMessages.map((msg, index) => (
                    <motion.div
                      key={msg}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: index <= currentScanMsg ? 1 : 0.3,
                        x: 0,
                      }}
                      className="flex items-center gap-2"
                    >
                      {index < currentScanMsg ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : index === currentScanMsg ? (
                        <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                      )}
                      <span
                        className={
                          index <= currentScanMsg
                            ? "text-foreground/80"
                            : "text-muted-foreground/50"
                        }
                      >
                        {msg}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Animated scan line */}
              <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          )}

          {status === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span>AI Review Complete - PASSED</span>
              </div>

              {/* Score Card */}
              <div className="bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Trophy className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        Hackwell Score
                      </h4>
                      <p className="text-sm text-emerald-400">
                        Week {weekNumber} Passed!
                      </p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-emerald-400">
                    {result.score}
                  </div>
                </div>

                <p className="text-sm text-foreground/80 mb-4 font-sans">
                  {result.feedback}
                </p>
              </div>

              {/* Code Quality Metrics */}
              {result.codeQuality && (
                <div className="bg-muted/10 rounded-xl p-4 border border-border/30 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Code Quality Breakdown
                  </h5>
                  <QualityBar label="Structure" score={result.codeQuality.structure} icon={Code2} />
                  <QualityBar label="Readability" score={result.codeQuality.readability} icon={FileText} />
                  <QualityBar label="Best Practices" score={result.codeQuality.bestPractices} icon={Shield} />
                  <QualityBar label="Documentation" score={result.codeQuality.documentation} icon={BookOpen} />
                </div>
              )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.strengths && result.strengths.length > 0 && (
                  <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                      <ThumbsUp className="w-4 h-4" />
                      What You Did Well
                    </h5>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 font-sans">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.improvements && result.improvements.length > 0 && (
                  <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                      <ThumbsDown className="w-4 h-4" />
                      Areas to Improve
                    </h5>
                    <ul className="space-y-2">
                      {result.improvements.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 font-sans">
                          <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
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
                  <h5 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-3">
                    💼 Senior Engineer Review
                  </h5>
                  <p className="text-sm text-foreground/80 font-sans whitespace-pre-line leading-relaxed">
                    {result.professionalReview}
                  </p>
                </div>
              )}

              <Button
                onClick={onNextWeek}
                className="w-full bg-gradient-to-r from-emerald-500 to-primary hover:shadow-lg"
              >
                Unlock Week {weekNumber + 1}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>

              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Repository
              </a>
            </motion.div>
          )}

          {status === "failed" && result && (
            <motion.div
              key="failed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span>AI Review Complete - NEEDS IMPROVEMENT</span>
              </div>

              <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        Review Feedback
                      </h4>
                      <p className="text-sm text-red-400">
                        Score: {result.score}/100 (Need 70+ to pass)
                      </p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-red-400">
                    {result.score}
                  </div>
                </div>

                <p className="text-sm text-foreground/80 mb-4 font-sans">
                  {result.feedback}
                </p>
              </div>

              {/* Code Quality Metrics */}
              {result.codeQuality && (
                <div className="bg-muted/10 rounded-xl p-4 border border-border/30 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Code Quality Breakdown
                  </h5>
                  <QualityBar label="Structure" score={result.codeQuality.structure} icon={Code2} />
                  <QualityBar label="Readability" score={result.codeQuality.readability} icon={FileText} />
                  <QualityBar label="Best Practices" score={result.codeQuality.bestPractices} icon={Shield} />
                  <QualityBar label="Documentation" score={result.codeQuality.documentation} icon={BookOpen} />
                </div>
              )}

              {/* Improvements Required */}
              {result.improvements && result.improvements.length > 0 && (
                <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 mb-3">
                    <AlertCircle className="w-4 h-4" />
                    Required Improvements
                  </h5>
                  <ul className="space-y-2">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 font-sans">
                        <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Professional Review */}
              {result.professionalReview && (
                <div className="bg-violet-500/5 rounded-xl p-4 border border-violet-500/20">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-3">
                    💼 Senior Engineer Feedback
                  </h5>
                  <p className="text-sm text-foreground/80 font-sans whitespace-pre-line leading-relaxed">
                    {result.professionalReview}
                  </p>
                </div>
              )}

              <Button
                onClick={() => {
                  setStatus("idle");
                  setGithubUrl("");
                }}
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};