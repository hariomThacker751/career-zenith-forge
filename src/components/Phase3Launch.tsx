import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Target,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Code2,
  Trophy,
} from "lucide-react";
import { Button } from "./ui/button";
import { usePhase } from "@/contexts/PhaseContext";
import { useResume } from "@/contexts/ResumeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sprints, setSprints] = useState<WeeklySprint[]>([]);
  const [totalWeeks, setTotalWeeks] = useState(24);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const project = phaseData.phase2.project;

  const fetchSprints = async () => {
    const hasAgentInsights = !!phaseData.agentInsights;
    const hasExploreData = !!phaseData.targetCareer && !!phaseData.exploreAnswers;
    
    if ((!hasAgentInsights && !hasExploreData) || !project) {
      setError("Missing project or profile data.");
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

  const handleStartJourney = async () => {
    if (!user) {
      // Redirect to auth if not logged in
      toast.error("Please log in to start your journey");
      navigate("/auth");
      return;
    }

    if (sprints.length === 0) {
      toast.error("Roadmap not generated yet");
      return;
    }

    setIsSaving(true);

    try {
      // Save sprints to database one by one
      for (const sprint of sprints) {
        // Check if sprint already exists
        const { data: existingSprint } = await supabase
          .from("weekly_sprints")
          .select("id")
          .eq("user_id", user.id)
          .eq("week_number", sprint.week)
          .single();

        if (existingSprint) {
          // Update existing sprint
          await supabase.from("weekly_sprints").update({
            phase: 3,
            theme: sprint.theme,
            knowledge_stack: JSON.parse(JSON.stringify(sprint.knowledgeStack)),
            forge_objective: JSON.parse(JSON.stringify(sprint.forgeObjective)),
            status: sprint.week === 1 ? "active" : "locked",
          }).eq("id", existingSprint.id);
        } else {
          // Insert new sprint
          const { error: insertError } = await supabase.from("weekly_sprints").insert({
            user_id: user.id,
            week_number: sprint.week,
            phase: 3,
            theme: sprint.theme,
            knowledge_stack: JSON.parse(JSON.stringify(sprint.knowledgeStack)),
            forge_objective: JSON.parse(JSON.stringify(sprint.forgeObjective)),
            status: sprint.week === 1 ? "active" : "locked",
          });
          
          if (insertError) {
            console.error("Sprint insert error:", insertError);
          }
        }

        // Create tasks for the first sprint
        if (sprint.week === 1) {
          const { data: sprintData } = await supabase
            .from("weekly_sprints")
            .select("id")
            .eq("user_id", user.id)
            .eq("week_number", sprint.week)
            .single();

          if (sprintData) {
            // Create tasks from forge objective deliverables
            for (let i = 0; i < sprint.forgeObjective.deliverables.length; i++) {
              const { data: existingTask } = await supabase
                .from("weekly_tasks")
                .select("id")
                .eq("sprint_id", sprintData.id)
                .eq("title", sprint.forgeObjective.deliverables[i])
                .single();

              if (!existingTask) {
                await supabase.from("weekly_tasks").insert({
                  sprint_id: sprintData.id,
                  title: sprint.forgeObjective.deliverables[i],
                  sort_order: i + 1,
                  is_completed: false,
                });
              }
            }
          }
        }
      }

      // Update user progress
      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingProgress) {
        await supabase.from("user_progress").update({
          current_phase: 3,
          current_week: 1,
          target_career: phaseData.targetCareer || null,
          roadmap_generated_at: new Date().toISOString(),
        }).eq("id", existingProgress.id);
      } else {
        await supabase.from("user_progress").insert({
          user_id: user.id,
          current_phase: 3,
          current_week: 1,
          target_career: phaseData.targetCareer || null,
          roadmap_generated_at: new Date().toISOString(),
        });
      }

      completePhase3("");
      toast.success("Your journey has begun! 🚀");
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to save roadmap:", err);
      toast.error("Failed to start journey. Please try again.");
    } finally {
      setIsSaving(false);
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
          <Rocket className="w-4 h-4 text-primary" />
          <span>Phase 3: The Launch</span>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient-emerald">Your Roadmap is Ready</span>
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          We've created a personalized {totalWeeks}-week sprint roadmap tailored to your skills, 
          goals, and project. Your dashboard awaits with weekly missions and AI-powered guidance.
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
            Generating your personalized roadmap...
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
            <p className="text-destructive font-medium mb-2">Failed to generate roadmap</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchSprints} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Success State - Show CTA */}
      {!isLoading && !error && sprints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{totalWeeks}</p>
              <p className="text-sm text-muted-foreground">Weekly Sprints</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <Code2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-500">{project?.title}</p>
              <p className="text-sm text-muted-foreground">Target Project</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-violet-500">AI-Powered</p>
              <p className="text-sm text-muted-foreground">Code Reviews</p>
            </motion.div>
          </div>

          {/* What's Included */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              What's Waiting in Your Dashboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Weekly learning missions with curated resources",
                "AI-powered code review when you submit projects",
                "Progress tracking and achievement badges",
                "Personalized feedback based on your code",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* First Week Preview */}
          {sprints[0] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 border-primary/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary border border-primary/20">
                  W1
                </div>
                <div>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">Week 1 Preview</p>
                  <p className="font-bold">{sprints[0].theme}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {sprints[0].forgeObjective.milestone}
              </p>
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center pt-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleStartJourney}
                disabled={isSaving}
                size="lg"
                className="gap-3 px-8 py-6 text-lg bg-gradient-to-r from-primary to-emerald-500 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Preparing Dashboard...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Start Your Journey
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
            <p className="text-xs text-muted-foreground mt-3">
              Your weekly missions and resources will be ready in your dashboard
            </p>
          </motion.div>

          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Roadmap tailored to your project, skills, and learning style</span>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-xs text-muted-foreground pt-4"
      >
        Hackwell — Mentorship-focused, technically rigorous, brutally honest.
      </motion.p>
    </div>
  );
};

export default Phase3Launch;
