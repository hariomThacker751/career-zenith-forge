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

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/30 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">AI Feed</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          Live
        </span>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bot className="w-10 h-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No activity yet
              </p>
              <p className="text-xs text-muted-foreground/70">
                AI agents will post updates here
              </p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const config = agentConfig[activity.agent_type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium ${config.color}`}>
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
      <div className="p-3 border-t border-border/30 flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs text-muted-foreground">
          Listening for updates
        </span>
      </div>
    </div>
  );
};
