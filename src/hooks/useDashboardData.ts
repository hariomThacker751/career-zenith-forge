import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, Json } from "@/integrations/supabase/types";

type UserProgress = Tables<"user_progress">;
type WeeklySprint = Tables<"weekly_sprints">;
type WeeklyTask = Tables<"weekly_tasks">;
type ActivityLog = Tables<"activity_log">;
type ProjectSubmission = Tables<"project_submissions">;

export interface DashboardState {
  progress: UserProgress | null;
  currentSprint: WeeklySprint | null;
  tasks: WeeklyTask[];
  activities: ActivityLog[];
  isLoading: boolean;
  error: string | null;
}

export interface UpdateObject {
  new_status: "locked" | "active" | "completed";
  credits_earned: number;
  next_steps: string;
  calendar_events?: Array<{ title: string; date: string; duration: number }>;
}

export function useDashboardData(userId?: string) {
  const { toast } = useToast();
  const [state, setState] = useState<DashboardState>({
    progress: null,
    currentSprint: null,
    tasks: [],
    activities: [],
    isLoading: true,
    error: null,
  });

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!userId) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (progressError) throw progressError;

      // If no progress exists, create initial record
      let progress = progressData;
      if (!progress) {
        const { data: newProgress, error: createError } = await supabase
          .from("user_progress")
          .insert({ user_id: userId })
          .select()
          .single();

        if (createError) throw createError;
        progress = newProgress;
      }

      // Fetch current sprint based on week
      const { data: sprintData, error: sprintError } = await supabase
        .from("weekly_sprints")
        .select("*")
        .eq("user_id", userId)
        .eq("week_number", progress.current_week)
        .maybeSingle();

      if (sprintError) throw sprintError;

      // Fetch tasks for current sprint
      let tasks: WeeklyTask[] = [];
      if (sprintData) {
        const { data: taskData, error: taskError } = await supabase
          .from("weekly_tasks")
          .select("*")
          .eq("sprint_id", sprintData.id)
          .order("sort_order", { ascending: true });

        if (taskError) throw taskError;
        tasks = taskData || [];
      }

      // Fetch recent activities
      const { data: activityData, error: activityError } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (activityError) throw activityError;

      setState({
        progress,
        currentSprint: sprintData,
        tasks,
        activities: activityData || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
      }));
    }
  }, [userId]);

  // Toggle task completion
  const toggleTask = useCallback(async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from("weekly_tasks")
        .update({
          is_completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null,
        })
        .eq("id", taskId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === taskId
            ? { ...t, is_completed: !isCompleted, completed_at: !isCompleted ? new Date().toISOString() : null }
            : t
        ),
      }));
    } catch (error) {
      console.error("Error toggling task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Submit sprint for review
  const submitForReview = useCallback(async () => {
    if (!userId || !state.currentSprint) return;

    try {
      const { error } = await supabase
        .from("weekly_sprints")
        .update({ status: "pending_review" })
        .eq("id", state.currentSprint.id);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: userId,
        agent_type: "gatekeeper",
        message: `Week ${state.currentSprint.week_number} submitted for review.`,
        metadata: { sprint_id: state.currentSprint.id } as unknown as Json,
      });

      setState(prev => ({
        ...prev,
        currentSprint: prev.currentSprint
          ? { ...prev.currentSprint, status: "pending_review" }
          : null,
      }));

      toast({
        title: "Submitted for Review",
        description: "The Gatekeeper AI is evaluating your progress...",
      });
    } catch (error) {
      console.error("Error submitting for review:", error);
      toast({
        title: "Error",
        description: "Failed to submit for review",
        variant: "destructive",
      });
    }
  }, [userId, state.currentSprint, toast]);

  // Submit GitHub project for evaluation
  const submitProject = useCallback(async (githubUrl: string): Promise<{
    passed: boolean;
    score: number;
    feedback: string;
    strengths?: string[];
    improvements?: string[];
    codeQuality?: {
      structure: number;
      readability: number;
      bestPractices: number;
      documentation: number;
    };
    professionalReview?: string;
  }> => {
    if (!userId || !state.currentSprint) {
      return { passed: false, score: 0, feedback: "No active sprint" };
    }

    try {
      // Create submission record
      const { data: submission, error: submitError } = await supabase
        .from("project_submissions")
        .insert({
          user_id: userId,
          sprint_id: state.currentSprint.id,
          github_url: githubUrl,
          status: "evaluating",
        })
        .select()
        .single();

      if (submitError) throw submitError;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: userId,
        agent_type: "gatekeeper",
        message: `Evaluating project submission: ${githubUrl.split("/").slice(-1)[0]}`,
        metadata: { submission_id: submission.id, github_url: githubUrl } as unknown as Json,
      });

      // Get task titles for context
      const taskTitles = state.tasks.map(t => t.title);

      // Call AI evaluation edge function
      const { data: evalResult, error: evalError } = await supabase.functions.invoke("evaluate-repo", {
        body: {
          githubUrl,
          weekNumber: state.currentSprint.week_number,
          weekTheme: state.currentSprint.theme,
          tasks: taskTitles,
        },
      });

      if (evalError) throw evalError;

      // Check for API errors in response
      if (evalResult.error) {
        toast({
          title: "Evaluation Error",
          description: evalResult.error,
          variant: "destructive",
        });
        return { passed: false, score: 0, feedback: evalResult.error };
      }

      const { passed, score, feedback, strengths, improvements, codeQuality, professionalReview } = evalResult;

      // Update submission with results
      await supabase
        .from("project_submissions")
        .update({
          status: passed ? "passed" : "failed",
          hackwell_score: score,
          ai_feedback: feedback,
          evaluated_at: new Date().toISOString(),
        })
        .eq("id", submission.id);

      // Log result
      await supabase.from("activity_log").insert({
        user_id: userId,
        agent_type: "gatekeeper",
        message: passed
          ? `🎉 Project passed with Hackwell Score: ${score}!`
          : `📝 Project needs work. Score: ${score}/100`,
        metadata: { submission_id: submission.id, score, passed, strengths, improvements } as unknown as Json,
      });

      return { passed, score, feedback, strengths, improvements, codeQuality, professionalReview };
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Evaluation Failed",
        description: "Could not evaluate repository. Please try again.",
        variant: "destructive",
      });
      return { passed: false, score: 0, feedback: "Evaluation failed. Please try again." };
    }
  }, [userId, state.currentSprint, state.tasks, toast]);

  // Unlock next week
  const unlockNextWeek = useCallback(async () => {
    if (!userId || !state.progress) return;

    const nextWeek = state.progress.current_week + 1;
    if (nextWeek > 24) return;

    try {
      // Calculate new phase
      let newPhase = state.progress.current_phase;
      if (nextWeek > 8 && newPhase === 1) newPhase = 2;
      else if (nextWeek > 16 && newPhase === 2) newPhase = 3;
      else if (nextWeek > 22 && newPhase === 3) newPhase = 4;

      // Update user progress
      const { error: progressError } = await supabase
        .from("user_progress")
        .update({
          current_week: nextWeek,
          current_phase: newPhase,
          credits: state.progress.credits + 10,
        })
        .eq("id", state.progress.id);

      if (progressError) throw progressError;

      // Mark current sprint as completed
      if (state.currentSprint) {
        await supabase
          .from("weekly_sprints")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", state.currentSprint.id);
      }

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: userId,
        agent_type: "system",
        message: `Week ${nextWeek} unlocked! +10 credits earned.`,
        metadata: { week: nextWeek, phase: newPhase } as unknown as Json,
      });

      toast({
        title: `Week ${nextWeek} Unlocked!`,
        description: "New missions and challenges await you.",
      });

      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error("Error unlocking next week:", error);
      toast({
        title: "Error",
        description: "Failed to unlock next week",
        variant: "destructive",
      });
    }
  }, [userId, state.progress, state.currentSprint, toast, fetchDashboardData]);

  // Apply AI update object
  const applyUpdateObject = useCallback(async (update: UpdateObject) => {
    if (!userId || !state.currentSprint) return;

    try {
      // Update sprint status
      await supabase
        .from("weekly_sprints")
        .update({ status: update.new_status })
        .eq("id", state.currentSprint.id);

      // Update credits
      if (update.credits_earned > 0 && state.progress) {
        await supabase
          .from("user_progress")
          .update({
            credits: state.progress.credits + update.credits_earned,
          })
          .eq("id", state.progress.id);
      }

      // Log next steps
      await supabase.from("activity_log").insert({
        user_id: userId,
        agent_type: "system",
        message: update.next_steps,
        metadata: { update } as unknown as Json,
      });

      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error("Error applying update:", error);
    }
  }, [userId, state.currentSprint, state.progress, fetchDashboardData]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!userId) return;

    // Subscribe to activity log changes
    const activityChannel = supabase
      .channel("dashboard-activities")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_log",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newActivity = payload.new as ActivityLog;
          setState(prev => ({
            ...prev,
            activities: [newActivity, ...prev.activities].slice(0, 50),
          }));
        }
      )
      .subscribe();

    // Subscribe to task changes
    const taskChannel = supabase
      .channel("dashboard-tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "weekly_tasks",
        },
        () => {
          // Refetch tasks on any change
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(taskChannel);
    };
  }, [userId, fetchDashboardData]);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...state,
    toggleTask,
    submitForReview,
    submitProject,
    unlockNextWeek,
    applyUpdateObject,
    refetch: fetchDashboardData,
  };
}
