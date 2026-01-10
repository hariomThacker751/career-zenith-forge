import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalProgressHeader } from "./GlobalProgressHeader";
import { WeeklyMissionCard } from "./WeeklyMissionCard";
import { ActivityFeed } from "./ActivityFeed";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Loader2, AlertCircle, Coins, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Demo data for when no user is authenticated
const demoTasks = [
  { id: "1", title: "Complete TypeScript fundamentals course", is_completed: false, sprint_id: "demo", sort_order: 0, created_at: new Date().toISOString(), completed_at: null, description: "Master the basics of TypeScript including types, interfaces, and generics" },
  { id: "2", title: "Build a REST API with Express", is_completed: false, sprint_id: "demo", sort_order: 1, created_at: new Date().toISOString(), completed_at: null, description: "Create a fully functional REST API with proper error handling" },
  { id: "3", title: "Implement authentication system", is_completed: false, sprint_id: "demo", sort_order: 2, created_at: new Date().toISOString(), completed_at: null, description: "Add JWT-based authentication with refresh tokens" },
  { id: "4", title: "Write unit tests for core functions", is_completed: false, sprint_id: "demo", sort_order: 3, created_at: new Date().toISOString(), completed_at: null, description: "Achieve 80%+ test coverage on business logic" },
  { id: "5", title: "Deploy to production environment", is_completed: false, sprint_id: "demo", sort_order: 4, created_at: new Date().toISOString(), completed_at: null, description: "Deploy using CI/CD pipeline with environment variables" },
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
    submitProject,
    unlockNextWeek,
  } = useDashboardData(userId);

  // Local state for demo mode
  const [demoTasksState, setDemoTasksState] = useState(demoTasks);
  const [demoPhase, setDemoPhase] = useState(1);
  const [demoWeek, setDemoWeek] = useState(1);

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

  // GitHub submit handler with enhanced demo
  const handleSubmitRepo = async (url: string) => {
    if (isDemo) {
      // Simulate AI evaluation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 7000));
      const passed = Math.random() > 0.2; // 80% pass rate in demo
      const score = passed ? Math.floor(Math.random() * 15) + 78 : Math.floor(Math.random() * 20) + 50;
      
      return {
        passed,
        score,
        feedback: passed
          ? "Excellent work! Your implementation demonstrates strong understanding of the week's concepts and follows industry best practices."
          : "Good progress, but there are key areas that need attention before moving forward. Review the feedback below.",
        strengths: passed ? [
          "Clean code structure with proper separation of concerns",
          "Effective use of TypeScript types for type safety",
          "Well-documented functions with clear naming",
          "Proper error handling patterns",
        ] : [
          "Good attempt at implementing core functionality",
          "Basic project structure is in place",
        ],
        improvements: passed ? [
          "Consider adding more comprehensive unit tests",
          "Some functions could benefit from additional documentation",
        ] : [
          "Error handling needs to be more robust",
          "Add input validation for user-facing functions",
          "Include proper documentation for public APIs",
          "Consider using more descriptive variable names",
        ],
        codeQuality: {
          structure: passed ? Math.floor(Math.random() * 12) + 82 : Math.floor(Math.random() * 20) + 55,
          readability: passed ? Math.floor(Math.random() * 10) + 85 : Math.floor(Math.random() * 18) + 58,
          bestPractices: passed ? Math.floor(Math.random() * 8) + 80 : Math.floor(Math.random() * 22) + 50,
          documentation: passed ? Math.floor(Math.random() * 15) + 75 : Math.floor(Math.random() * 25) + 45,
        },
        professionalReview: passed
          ? `Outstanding submission for Week ${currentWeek}! Your code demonstrates mature engineering practices and attention to detail.\n\nThe architecture choices are solid, and I can see you've put thought into maintainability. The TypeScript usage is effective, though there's room to leverage more advanced type features.\n\nFor next week, I'd recommend exploring testing strategies and continuous integration to further strengthen your development workflow. Keep up the excellent work!`
          : `This submission shows effort and understanding of the basic concepts, but there are several areas that need improvement before advancing.\n\nThe main concerns are around code robustness - specifically error handling and edge case management. Production code needs to gracefully handle unexpected inputs.\n\nI'd suggest revisiting the course materials on defensive programming and adding comprehensive error boundaries before resubmitting. You're on the right track!`,
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
          
          {!isDemo && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">{credits}</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
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
                    <p className="text-sm font-medium text-foreground">Demo Mode Active</p>
                    <p className="text-xs text-muted-foreground">Complete tasks and submit a repo to see the AI evaluation flow</p>
                  </div>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Progress Header */}
          <GlobalProgressHeader
            currentPhase={currentPhase}
            currentWeek={currentWeek}
            completionPercentage={completionPercentage}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Weekly Mission */}
            <div className="lg:col-span-2">
              <WeeklyMissionCard
                weekNumber={currentWeek}
                theme={sprintTheme}
                tasks={displayTasks.map(t => ({
                  id: t.id,
                  title: t.title,
                  description: t.description || undefined,
                  isCompleted: t.is_completed || false,
                }))}
                onTaskToggle={handleTaskToggle}
                onSubmitRepo={handleSubmitRepo}
                onNextWeek={handleNextWeek}
                isDemo={isDemo}
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

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8 border-t border-border/30"
          >
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Hackwell</span> — Mentorship-focused, technically rigorous, brutally honest.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
