import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlobalProgressHeader } from "./GlobalProgressHeader";
import { ActiveSprintTracker } from "./ActiveSprintTracker";
import { ActivityFeed } from "./ActivityFeed";
import { GitHubEvaluationTerminal } from "./GitHubEvaluationTerminal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Demo data for display
const demoTasks = [
  { id: "1", title: "Complete TypeScript fundamentals course", isCompleted: false },
  { id: "2", title: "Build a REST API with Express", isCompleted: false },
  { id: "3", title: "Implement authentication system", isCompleted: false },
  { id: "4", title: "Write unit tests for core functions", isCompleted: false },
  { id: "5", title: "Deploy to production environment", isCompleted: false },
];

const demoActivities = [
  {
    id: "1",
    agent_type: "system" as const,
    message: "Welcome to Hackwell! Your 6-month journey begins now.",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    agent_type: "profiler" as const,
    message: "Career profile analysis complete. Target: Full-Stack Developer",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    agent_type: "forge" as const,
    message: "Project blueprint generated based on your skills and goals.",
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "4",
    agent_type: "pulse" as const,
    message: "Industry trend detected: TypeScript adoption increased 23% in Q4.",
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

export const ProgressDashboard = () => {
  const [tasks, setTasks] = useState(demoTasks);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Calculate completion percentage
  const completedWeeks = currentWeek - 1;
  const completionPercentage = Math.round((completedWeeks / 24) * 100);

  const handleTaskToggle = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    toast({
      title: "Submitted for Review",
      description: "The Gatekeeper AI is evaluating your progress...",
    });
  };

  const handleGitHubSubmit = async (url: string) => {
    // Simulate evaluation
    await new Promise((resolve) => setTimeout(resolve, 4000));
    
    // Random pass/fail for demo
    const passed = Math.random() > 0.3;
    return {
      passed,
      score: passed ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 40,
      feedback: passed
        ? "Excellent work! Your code structure is clean and follows best practices. All project requirements have been met."
        : "Good effort, but there are some areas that need improvement. Focus on error handling and code documentation.",
    };
  };

  const handleNextWeek = () => {
    if (currentWeek < 24) {
      setCurrentWeek((prev) => prev + 1);
      setTasks(demoTasks.map((t) => ({ ...t, isCompleted: false })));
      
      // Update phase based on week
      if (currentWeek >= 8 && currentPhase === 1) setCurrentPhase(2);
      else if (currentWeek >= 16 && currentPhase === 2) setCurrentPhase(3);
      else if (currentWeek >= 22 && currentPhase === 3) setCurrentPhase(4);
      
      toast({
        title: `Week ${currentWeek + 1} Unlocked!`,
        description: "New missions and challenges await you.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
              theme="Backend Development Fundamentals"
              tasks={tasks}
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
            <ActivityFeed activities={demoActivities} />
          </div>
        </div>
      </div>
    </div>
  );
};
