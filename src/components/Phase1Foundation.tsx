import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  Clock,
  CheckCircle2,
  GraduationCap,
  Target,
  Sparkles,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/button";
import { usePhase, LearningPath } from "@/contexts/PhaseContext";
import { useResume } from "@/contexts/ResumeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Phase1FoundationProps {
  answers: Record<number, string>;
}

const Phase1Foundation = ({ answers }: Phase1FoundationProps) => {
  const { completePhase1, phaseData } = usePhase();
  const { resumeData } = useResume();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLearningPaths = async () => {
    if (!phaseData.agentInsights) {
      setError("Agent insights not available. Please restart the analysis.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-phase-content", {
        body: {
          phase: 1,
          agentInsights: phaseData.agentInsights,
          answers,
          resumeSkills: resumeData?.skills || [],
          resumeProjects: resumeData?.projects || [],
          targetCareer: phaseData.targetCareer,
          exploreAnswers: phaseData.exploreAnswers,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.paths && Array.isArray(data.paths)) {
        setLearningPaths(data.paths);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to fetch learning paths:", err);
      setError(err instanceof Error ? err.message : "Failed to generate learning paths");
      toast.error("Failed to generate personalized learning paths");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const togglePath = (pathId: string) => {
    setSelectedPaths((prev) =>
      prev.includes(pathId)
        ? prev.filter((id) => id !== pathId)
        : [...prev, pathId]
    );
  };

  const handleComplete = () => {
    completePhase1(learningPaths, selectedPaths);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "text-emerald-500 bg-emerald-500/10";
      case "Intermediate":
        return "text-amber-500 bg-amber-500/10";
      case "Advanced":
        return "text-rose-500 bg-rose-500/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          className="pill-badge mb-4 mx-auto w-fit"
          whileHover={{ scale: 1.02 }}
        >
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Phase 1: The Foundation</span>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient-emerald">Close Your Skill Gaps</span>
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Based on your diagnostic and AI agent analysis, here are personalized
          learning paths to build your foundation. Select at least 2 to proceed.
        </p>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="text-muted-foreground text-sm">
            Generating personalized learning paths with AI...
          </p>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 space-y-4"
        >
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center max-w-md">
            <p className="text-destructive font-medium mb-2">Failed to load learning paths</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchLearningPaths} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Learning Paths Grid */}
      {!isLoading && !error && (
        <>
          <div className="space-y-4">
            {learningPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() => togglePath(path.id)}
                  className={`w-full text-left card-elevated p-5 transition-all ${
                    selectedPaths.includes(path.id)
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:border-primary/30"
                  }`}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="flex items-start gap-4">
                    {/* Selection Indicator */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedPaths.includes(path.id)
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {selectedPaths.includes(path.id) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <GraduationCap className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title & Source */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-foreground">{path.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {path.source}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${getLevelColor(
                              path.level
                            )}`}
                          >
                            {path.level}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            {path.duration}
                          </span>
                        </div>
                      </div>

                      {/* Modules */}
                      <div className="flex flex-wrap gap-2">
                        {path.modules.map((module, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground"
                          >
                            {module}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* AI Generated Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Generated by AI based on your agent insights</span>
          </motion.div>

          {/* Selection Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border"
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm">
                <span className="font-bold text-primary">{selectedPaths.length}</span>
                <span className="text-muted-foreground"> / {learningPaths.length} paths selected</span>
              </span>
            </div>
            {selectedPaths.length < 2 && (
              <span className="text-xs text-amber-500">Select at least 2 to continue</span>
            )}
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleComplete}
                disabled={selectedPaths.length < 2}
                className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 px-8 py-6"
              >
                <Sparkles className="w-5 h-5" />
                Unlock Phase 2: The Forge
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Phase1Foundation;