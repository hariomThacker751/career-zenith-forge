import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalProgressHeader } from "./GlobalProgressHeader";
import { ActiveSprintTracker } from "./ActiveSprintTracker";
import { ActivityFeed } from "./ActivityFeed";
import { GitHubEvaluationTerminal } from "./GitHubEvaluationTerminal";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Loader2, AlertCircle, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

// Demo data for when no user is authenticated
const demoTasks = [
  { id: "1", title: "Complete TypeScript fundamentals course", is_completed: false, sprint_id: "demo", sort_order: 0, created_at: new Date().toISOString(), completed_at: null, description: null },
  { id: "2", title: "Build a REST API with Express", is_completed: false, sprint_id: "demo", sort_order: 1, created_at: new Date().toISOString(), completed_at: null, description: null },
  { id: "3", title: "Implement authentication system", is_completed: false, sprint_id: "demo", sort_order: 2, created_at: new Date().toISOString(), completed_at: null, description: null },
  { id: "4", title: "Write unit tests for core functions", is_completed: false, sprint_id: "demo", sort_order: 3, created_at: new Date().toISOString(), completed_at: null, description: null },
  { id: "5", title: "Deploy to production environment", is_completed: false, sprint_id: "demo", sort_order: 4, created_at: new Date().toISOString(), completed_at: null, description: null },
];

const demoActivities = [
  { id: "1", agent_type: "system" as const, message: "Welcome to Hackwell! Your 6-month journey begins now.", created_at: new Date(Date.now() - 3600000).toISOString(), user_id: "demo", metadata: null },
  { id: "2", agent_type: "profiler" as const, message: "Career profile analysis complete. Target: Full-Stack Developer", created_at: new Date(Date.now() - 7200000).toISOString(), user_id: "demo", metadata: null },
  { id: "3", agent_type: "forge" as const, message: "Project blueprint generated based on your skills and goals.", created_at: new Date(Date.now() - 10800000).toISOString(), user_id: "demo", metadata: null },
  { id: "4", agent_type: "pulse" as const, message: "Industry trend detected: TypeScript adoption increased 23% in Q4.", created_at: new Date(Date.now() - 14400000).toISOString(), user_id: "demo", metadata: null },
];

interface ProgressDashboardProps {
  userId?: string;
}

export const ProgressDashboard = ({ userId }: ProgressDashboardProps) => {
  const {
    progress,
    currentSprint,
    tasks,
    activities,
    isLoading,
    error,
    toggleTask,
    submitForReview,
    submitProject,
    unlockNextWeek,
  } = useDashboardData(userId);

  // Local state for demo mode
  const [demoTasksState, setDemoTasksState] = useState(demoTasks);
  const [demoPhase, setDemoPhase] = useState(1);
  const [demoWeek, setDemoWeek] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDemo = !userId;
  
  // Use real data or demo data
  const currentPhase = isDemo ? demoPhase : (progress?.current_phase || 1);
  const currentWeek = isDemo ? demoWeek : (progress?.current_week || 1);
  const credits = isDemo ? 0 : (progress?.credits || 0);
  const displayTasks = isDemo ? demoTasksState : tasks;
  const displayActivities = isDemo ? demoActivities : activities;
  const sprintTheme = isDemo ? "Backend Development Fundamentals" : (currentSprint?.theme || "Loading...");

  // Calculate completion percentage
  const completedWeeks = currentWeek - 1;
  const completionPercentage = Math.round((completedWeeks / 24) * 100);

  // Task toggle handler
  const handleTaskToggle = (taskId: string) => {
    if (isDemo) {
      setDemoTasksState(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
        )
      );
    } else {
      const task = tasks.find(t => t.id === taskId);
      if (task) toggleTask(taskId, task.is_completed || false);
    }
  };

  // Submit for review handler
  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    if (isDemo) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      await submitForReview();
    }
    setIsSubmitting(false);
  };

  // GitHub submit handler
  const handleGitHubSubmit = async (url: string) => {
    if (isDemo) {
      await new Promise(resolve => setTimeout(resolve, 4000));
      const passed = Math.random() > 0.3;
      return {
        passed,
        score: passed ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 40,
        feedback: passed
          ? "Excellent work! Your code structure is clean and follows best practices."
          : "Good effort, but there are areas that need improvement.",
      };
    }
    return submitProject(url);
  };

  // Next week handler
  const handleNextWeek = () => {
    if (isDemo) {
      const nextWeek = demoWeek + 1;
      if (nextWeek <= 24) {
        setDemoWeek(nextWeek);
        setDemoTasksState(demoTasks.map(t => ({ ...t, is_completed: false })));
        if (nextWeek > 8 && demoPhase === 1) setDemoPhase(2);
        else if (nextWeek > 16 && demoPhase === 2) setDemoPhase(3);
        else if (nextWeek > 22 && demoPhase === 3) setDemoPhase(4);
      }
    } else {
      unlockNextWeek();
    }
  };

  // Loading state
  if (isLoading && !isDemo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && !isDemo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/30 rounded-2xl p-8 max-w-md text-center"
        >
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Demo Banner */}
        <AnimatePresence>
          {isDemo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Demo Mode</p>
                  <p className="text-xs text-muted-foreground">Sign in to track your real progress</p>
                </div>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credits Display */}
        {!isDemo && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-end"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">{credits}</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </div>
          </motion.div>
        )}

        {/* Global Progress Header */}
        <GlobalProgressHeader
          currentPhase={currentPhase}
          currentWeek={currentWeek}
          completionPercentage={completionPercentage}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Active Sprint */}
          <div className="lg:col-span-2 space-y-6">
            <ActiveSprintTracker
              weekNumber={currentWeek}
              theme={sprintTheme}
              tasks={displayTasks.map(t => ({
                id: t.id,
                title: t.title,
                description: t.description || undefined,
                isCompleted: t.is_completed || false,
              }))}
              onTaskToggle={handleTaskToggle}
              onSubmitForReview={handleSubmitForReview}
              isSubmitting={isSubmitting}
            />

            {/* GitHub Evaluation Terminal */}
            <GitHubEvaluationTerminal
              onSubmit={handleGitHubSubmit}
              onNextWeek={handleNextWeek}
            />
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed
              userId={userId}
              activities={displayActivities.map(a => ({
                id: a.id,
                agent_type: a.agent_type as "system" | "profiler" | "pulse" | "forge" | "gatekeeper",
                message: a.message,
                created_at: a.created_at,
                metadata: a.metadata as Record<string, any> | undefined,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
