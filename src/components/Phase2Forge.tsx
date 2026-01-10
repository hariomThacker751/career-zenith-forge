import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Hammer,
  Sparkles,
  ChevronRight,
  FileText,
  Target,
  Clock,
  Code2,
  Zap,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/button";
import { usePhase, ProjectPRD } from "@/contexts/PhaseContext";
import { useResume } from "@/contexts/ResumeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Phase2ForgeProps {
  answers: Record<number, string>;
}

const Phase2Forge = ({ answers }: Phase2ForgeProps) => {
  const { completePhase2, phaseData } = usePhase();
  const { resumeData } = useResume();
  const [selectedProject, setSelectedProject] = useState<ProjectPRD | null>(null);
  const [showPRD, setShowPRD] = useState(false);
  const [projects, setProjects] = useState<ProjectPRD[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
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
          phase: 2,
          agentInsights: phaseData.agentInsights,
          answers,
          resumeSkills: resumeData?.skills || [],
          resumeProjects: resumeData?.projects || [],
          selectedLearningPaths: phaseData.phase1.selectedPaths,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.projects && Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError(err instanceof Error ? err.message : "Failed to generate projects");
      toast.error("Failed to generate project ideas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSelectProject = (project: ProjectPRD) => {
    setSelectedProject(project);
    setShowPRD(true);
  };

  const handleApprove = () => {
    if (selectedProject) {
      completePhase2(selectedProject);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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
          <Hammer className="w-4 h-4 text-primary" />
          <span>Phase 2: The Forge</span>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient-sunset">Build Your Industry Project</span>
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          No "Todo Apps" here. AI-generated 2026-relevant projects that showcase real
          engineering skills and solve actual problems.
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
            THE FORGE is crafting your project ideas...
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
            <p className="text-destructive font-medium mb-2">Failed to load projects</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchProjects} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </motion.div>
      )}

      {!isLoading && !error && !showPRD && (
        <>
          {/* Project Options */}
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <motion.button
                  onClick={() => handleSelectProject(project)}
                  className="w-full text-left card-elevated p-6 hover:border-primary/50 transition-all group"
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${getDifficultyColor(
                            project.difficulty
                          )}`}
                        >
                          {project.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {project.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.timeline}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {project.features.length} features
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
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
            <span>Generated by THE FORGE agent based on your profile</span>
          </motion.div>
        </>
      )}

      {!isLoading && !error && showPRD && selectedProject && (
        /* PRD View */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elevated p-6 space-y-6"
        >
          {/* PRD Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Product Requirement Document
              </p>
              <h3 className="text-xl font-bold">{selectedProject.title}</h3>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Project Overview
            </h4>
            <p className="text-muted-foreground">{selectedProject.description}</p>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              Technology Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedProject.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Core Features
            </h4>
            <div className="space-y-2">
              {selectedProject.features.map((feature, idx) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              <p className="font-bold">Estimated Timeline</p>
              <p className="text-sm text-muted-foreground">{selectedProject.timeline}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setShowPRD(false)}>
              ← Back to Projects
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleApprove}
                className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
              >
                <Sparkles className="w-4 h-4" />
                Approve & Unlock Phase 3
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Phase2Forge;