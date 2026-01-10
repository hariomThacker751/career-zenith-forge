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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SubmissionStatus = "idle" | "scanning" | "success" | "failed";

interface GitHubEvaluationTerminalProps {
  onSubmit: (url: string) => Promise<{ passed: boolean; score: number; feedback: string }>;
  onNextWeek?: () => void;
}

export const GitHubEvaluationTerminal = ({
  onSubmit,
  onNextWeek,
}: GitHubEvaluationTerminalProps) => {
  const [githubUrl, setGithubUrl] = useState("");
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    feedback: string;
  } | null>(null);

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

  const scanningMessages = [
    "Initializing scan...",
    "Analyzing repository structure...",
    "Evaluating code quality...",
    "Checking project requirements...",
    "Calculating Hackwell Score...",
  ];

  const [currentScanMsg, setCurrentScanMsg] = useState(0);

  // Cycle through scanning messages when scanning
  useEffect(() => {
    if (status === "scanning") {
      setCurrentScanMsg(0);
      const interval = setInterval(() => {
        setCurrentScanMsg((prev) => (prev + 1) % scanningMessages.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status, scanningMessages.length]);

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
          github-evaluation-terminal
        </span>
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
                <span>hackwell evaluate --repo</span>
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
                  Initialize Scan
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
                <span>Scanning Codebase...</span>
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
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span>Evaluation Complete - PASSED</span>
              </div>

              <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        Hackwell Score
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Project meets all requirements
                      </p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-emerald-400">
                    {result.score}
                  </div>
                </div>

                <p className="text-sm text-foreground/80 mb-4">
                  {result.feedback}
                </p>

                <Button
                  onClick={onNextWeek}
                  className="w-full bg-gradient-to-r from-emerald-500 to-primary hover:shadow-lg"
                >
                  Next Week Unlocked
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span>Evaluation Complete - NEEDS WORK</span>
              </div>

              <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">
                      Review Feedback
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Score: {result.score}/100
                    </p>
                  </div>
                </div>

                <p className="text-sm text-foreground/80 mb-4">
                  {result.feedback}
                </p>

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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
