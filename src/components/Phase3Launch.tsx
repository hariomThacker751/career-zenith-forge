import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Calendar,
  BookOpen,
  Target,
  Send,
  CheckCircle2,
  PartyPopper,
  Github,
  Loader2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Code2,
  ListChecks,
  Youtube,
  Play,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePhase } from "@/contexts/PhaseContext";
import { useResume } from "@/contexts/ResumeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Phase3LaunchProps {
  answers: Record<number, string>;
}

interface KnowledgeSource {
  title: string;
  source: string;
  url: string;
  type: "youtube" | "course" | "documentation" | "tutorial" | "repository";
  instructor?: string;
}

interface ForgeObjective {
  milestone: string;
  deliverables: string[];
}

interface CalendarEvent {
  summary: string;
  description: string;
}

interface WeeklySprint {
  week: number;
  theme: string;
  knowledgeStack: KnowledgeSource[];
  forgeObjective: ForgeObjective;
  calendarEvent: CalendarEvent;
}

const Phase3Launch = ({ answers }: Phase3LaunchProps) => {
  const { phaseData, completePhase3 } = usePhase();
  const { resumeData } = useResume();
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sprints, setSprints] = useState<WeeklySprint[]>([]);
  const [totalWeeks, setTotalWeeks] = useState(24);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  const project = phaseData.phase2.project;

  const fetchSprints = async () => {
    if (!phaseData.agentInsights || !project) {
      setError("Missing project or agent insights.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-phase-content", {
        body: {
          phase: 3,
          agentInsights: phaseData.agentInsights,
          answers,
          resumeSkills: resumeData?.skills || [],
          resumeProjects: resumeData?.projects || [],
          selectedProject: {
            title: project.title,
            description: project.description,
            techStack: project.techStack,
            difficulty: project.difficulty,
          },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.sprints && Array.isArray(data.sprints)) {
        setSprints(data.sprints);
        setTotalWeeks(data.totalWeeks || 24);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to fetch sprints:", err);
      setError(err instanceof Error ? err.message : "Failed to generate roadmap");
      toast.error("Failed to generate weekly sprints");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, []);

  const getSourceIcon = (type: KnowledgeSource["type"]) => {
    switch (type) {
      case "youtube":
        return <Youtube className="w-3 h-3" />;
      case "course":
        return <GraduationCap className="w-3 h-3" />;
      case "documentation":
        return <BookOpen className="w-3 h-3" />;
      case "tutorial":
        return <Code2 className="w-3 h-3" />;
      case "repository":
        return <Github className="w-3 h-3" />;
    }
  };

  const getSourceColor = (type: KnowledgeSource["type"]) => {
    switch (type) {
      case "youtube":
        return "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20";
      case "course":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20";
      case "documentation":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20";
      case "tutorial":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20";
      case "repository":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20";
    }
  };

  const handleSubmit = () => {
    if (!submissionUrl) {
      toast.error("Please enter your project URL");
      return;
    }

    completePhase3(submissionUrl);
    setIsSubmitted(true);
    toast.success("Project submitted successfully! 🎉");
  };

  const toggleWeek = (week: number) => {
    setExpandedWeek(expandedWeek === week ? null : week);
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
          <Rocket className="w-4 h-4 text-primary" />
          <span>Phase 3: The Launch</span>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient-emerald">6-Month Sprint Roadmap</span>
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Your AI-generated weekly sprints are ready. Each week includes curated learning resources,
          project milestones, and calendar-ready challenges.
        </p>
      </motion.div>

      {/* Project Summary */}
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-wider">
                Target Project
              </p>
              <p className="font-bold">{project.title}</p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {totalWeeks} weeks total
            </div>
          </div>
        </motion.div>
      )}

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
            Generating your personalized weekly sprints...
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
            <p className="text-destructive font-medium mb-2">Failed to load roadmap</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchSprints} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </motion.div>
      )}

      {!isLoading && !error && (
        <>
          {/* Weekly Sprints */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Weekly Sprints</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                Showing {sprints.length} of {totalWeeks} weeks
              </span>
            </div>

            {sprints.map((sprint, index) => (
              <motion.div
                key={sprint.week}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card overflow-hidden"
              >
                {/* Week Header - Clickable */}
                <button
                  onClick={() => toggleWeek(sprint.week)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary border border-primary/20">
                    W{sprint.week}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{sprint.theme}</h4>
                    <p className="text-xs text-muted-foreground">
                      {sprint.knowledgeStack.length} resources • {sprint.forgeObjective.deliverables.length} deliverables
                    </p>
                  </div>
                  {expandedWeek === sprint.week ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedWeek === sprint.week && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 space-y-4">
                        {/* Knowledge Stack */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-violet-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                              Knowledge Stack
                            </span>
                          </div>
                          <div className="space-y-2">
                            {sprint.knowledgeStack.map((source, idx) => (
                              <a
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01] ${getSourceColor(source.type)}`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${source.type === 'youtube' ? 'bg-red-500/20' : 'bg-white/10'}`}>
                                  {getSourceIcon(source.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{source.title}</p>
                                  <div className="flex items-center gap-2 text-xs opacity-70">
                                    {source.type === 'youtube' && <Play className="w-3 h-3" />}
                                    <span>{source.instructor || source.source}</span>
                                  </div>
                                </div>
                                <ExternalLink className="w-4 h-4 opacity-50" />
                              </a>
                            ))}
                          </div>
                        </div>

                        {/* Forge Objective */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                              Forge Objective
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm font-medium text-amber-300 mb-2">
                              {sprint.forgeObjective.milestone}
                            </p>
                            <ul className="space-y-1">
                              {sprint.forgeObjective.deliverables.map((deliverable, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-amber-200/80">
                                  <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                                  <span>{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Calendar Event */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ListChecks className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                              Weekly Challenge
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-sm font-medium text-emerald-300 mb-2">
                              {sprint.calendarEvent.summary}
                            </p>
                            <pre className="text-xs text-emerald-200/70 whitespace-pre-wrap font-sans">
                              {sprint.calendarEvent.description}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* AI Generated Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Roadmap tailored to your project, skills, and learning style</span>
          </motion.div>

          {/* Submission Portal */}
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 space-y-4"
              >
                <h3 className="font-bold flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Submit Your Project
                </h3>
                <p className="text-sm text-muted-foreground">
                  Once you've completed your project, submit the GitHub repository or
                  deployed URL below.
                </p>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="https://github.com/username/project"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSubmit}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                    >
                      <Rocket className="w-4 h-4" />
                      Submit
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center"
                >
                  <PartyPopper className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold">
                  <span className="text-gradient-emerald">Mission Complete!</span>
                </h3>
                <p className="text-muted-foreground">
                  Your project has been submitted. You've completed all 3 phases of the
                  Hackwell Career Execution Engine.
                </p>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 inline-flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm">{submissionUrl}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Phase3Launch;