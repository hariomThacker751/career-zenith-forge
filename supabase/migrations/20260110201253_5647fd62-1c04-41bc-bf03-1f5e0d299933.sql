-- Create user progress tracking table
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_phase INTEGER NOT NULL DEFAULT 1 CHECK (current_phase >= 1 AND current_phase <= 4),
  current_week INTEGER NOT NULL DEFAULT 1 CHECK (current_week >= 1 AND current_week <= 24),
  credits INTEGER NOT NULL DEFAULT 0,
  target_career TEXT,
  roadmap_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create weekly sprints table
CREATE TABLE public.weekly_sprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 24),
  phase INTEGER NOT NULL CHECK (phase >= 1 AND phase <= 4),
  theme TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'in_progress', 'pending_review', 'completed')),
  knowledge_stack JSONB DEFAULT '[]'::jsonb,
  forge_objective JSONB,
  calendar_synced BOOLEAN DEFAULT false,
  feedback_log TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number)
);

-- Create weekly tasks table
CREATE TABLE public.weekly_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID NOT NULL REFERENCES public.weekly_sprints(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity log table for real-time feed
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('system', 'profiler', 'pulse', 'forge', 'gatekeeper')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project submissions table
CREATE TABLE public.project_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sprint_id UUID REFERENCES public.weekly_sprints(id),
  github_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'passed', 'failed')),
  hackwell_score INTEGER,
  ai_feedback TEXT,
  evaluated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for weekly_sprints
CREATE POLICY "Users can view their own sprints" ON public.weekly_sprints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sprints" ON public.weekly_sprints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sprints" ON public.weekly_sprints FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for weekly_tasks
CREATE POLICY "Users can view tasks from their sprints" ON public.weekly_tasks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.weekly_sprints ws WHERE ws.id = sprint_id AND ws.user_id = auth.uid()));
CREATE POLICY "Users can insert tasks to their sprints" ON public.weekly_tasks FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.weekly_sprints ws WHERE ws.id = sprint_id AND ws.user_id = auth.uid()));
CREATE POLICY "Users can update tasks in their sprints" ON public.weekly_tasks FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.weekly_sprints ws WHERE ws.id = sprint_id AND ws.user_id = auth.uid()));

-- RLS Policies for activity_log
CREATE POLICY "Users can view their own activity" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for project_submissions
CREATE POLICY "Users can view their own submissions" ON public.project_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own submissions" ON public.project_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own submissions" ON public.project_submissions FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_weekly_sprints_updated_at BEFORE UPDATE ON public.weekly_sprints FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for activity log
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_sprints;