import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  UserCircle2, 
  TrendingUp, 
  Hammer, 
  Shield,
  Bot
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  agent_type: "system" | "profiler" | "pulse" | "forge" | "gatekeeper";
  message: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  userId?: string;
  activities?: ActivityItem[];
}

const agentConfig = {
  system: {
    icon: Bot,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    label: "System",
  },
  profiler: {
    icon: UserCircle2,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    label: "Profiler",
  },
  pulse: {
    icon: TrendingUp,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    label: "Pulse",
  },
  forge: {
    icon: Hammer,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    label: "Forge",
  },
  gatekeeper: {
    icon: Shield,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    label: "Gatekeeper",
  },
};

export const ActivityFeed = ({ userId, activities: initialActivities }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities || []);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to realtime activity updates
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_log",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newActivity = payload.new as ActivityItem;
          setActivities((prev) => [newActivity, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  console.log("[ActivityFeed] Rendering with", activities.length, "activities");
  
  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden h-full flex flex-col shadow-lg shadow-black/20">
      {/* Header */}
      <div className="p-4 border-b border-border/30 flex items-center gap-2 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">AI Feed</h3>
        <span className="ml-auto text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
          Live
        </span>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        <AnimatePresence initial={false}>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mb-3">
                <Bot className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                No activity yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                AI agents will post updates here
              </p>
            </div>
          ) : (
            activities.map((activity) => {
              const config = agentConfig[activity.agent_type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0 border border-${config.color.replace('text-', '')}/20`}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(activity.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {activity.message}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Realtime indicator */}
      <div className="p-3 border-t border-border/30 flex items-center justify-center gap-2 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          Listening for updates
        </span>
      </div>
    </div>
  );
};
