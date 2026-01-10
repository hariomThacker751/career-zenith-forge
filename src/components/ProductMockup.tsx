import { motion } from "framer-motion";
import { User, Calendar, CheckCircle2, Clock, FileText, MoreHorizontal } from "lucide-react";

interface TaskCardProps {
  title: string;
  assignee: string;
  date: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
}

const TaskCard = ({ title, assignee, date, priority = "medium", tags = [] }: TaskCardProps) => {
  const priorityColors = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-rose-100 text-rose-700",
  };

  return (
    <motion.div 
      className="bg-card rounded-lg p-3 shadow-sm border border-border/50 hover:shadow-md transition-shadow cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-foreground line-clamp-2">{title}</h4>
        <button className="p-1 hover:bg-muted rounded">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-muted-foreground">{assignee}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[priority]}`}>
          {priority}
        </span>
      </div>
    </motion.div>
  );
};

interface ColumnProps {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}

const Column = ({ title, count, color, children }: ColumnProps) => (
  <div className="flex-shrink-0 w-64 bg-muted/30 rounded-xl p-3">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
    </div>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const ProductMockup = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, rotateY: -10 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      className="relative"
    >
      {/* Outer glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-teal-400/10 to-teal-600/20 rounded-3xl blur-2xl" />
      
      {/* Main frame */}
      <div className="relative bg-card rounded-2xl border-4 border-teal-500 shadow-2xl shadow-teal-500/20 overflow-hidden">
        {/* Browser header */}
        <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background/80 rounded-lg px-4 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500/30" />
              app.hackwell.io/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 bg-background min-h-[400px]">
          {/* Dashboard header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Career Roadmap</h2>
              <p className="text-xs text-muted-foreground">Track your progress</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-2 border-background flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">+5</span>
            </div>
          </div>

          {/* Kanban board */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Column title="TO DO" count={3} color="bg-slate-400">
              <TaskCard 
                title="Complete DSA Fundamentals" 
                assignee="You" 
                date="Jan 15" 
                priority="high"
                tags={["Algorithms"]}
              />
              <TaskCard 
                title="System Design Basics" 
                assignee="You" 
                date="Jan 20" 
                priority="medium"
                tags={["Architecture"]}
              />
            </Column>

            <Column title="IN PROGRESS" count={2} color="bg-teal-500">
              <TaskCard 
                title="Build Portfolio Project" 
                assignee="You" 
                date="Jan 12" 
                priority="high"
                tags={["React", "TypeScript"]}
              />
              <TaskCard 
                title="Mock Interview Prep" 
                assignee="You" 
                date="Jan 18" 
                priority="medium"
              />
            </Column>

            <Column title="REVIEW" count={1} color="bg-amber-500">
              <TaskCard 
                title="Resume Review" 
                assignee="Mentor" 
                date="Jan 10" 
                priority="low"
                tags={["Career"]}
              />
            </Column>

            <Column title="DONE" count={4} color="bg-emerald-500">
              <TaskCard 
                title="JavaScript Mastery" 
                assignee="You" 
                date="Jan 5" 
                priority="low"
                tags={["Completed"]}
              />
            </Column>
          </div>

          {/* Progress bar */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Weekly Progress</span>
              <span className="text-sm font-bold text-teal-600">68%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "68%" }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute -top-4 -right-4 bg-card rounded-lg p-3 shadow-lg border border-border"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-xs font-medium text-foreground">Task Completed!</p>
            <p className="text-xs text-muted-foreground">+50 XP earned</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-4 -left-4 bg-card rounded-lg p-3 shadow-lg border border-border"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-500" />
          <div>
            <p className="text-xs font-medium text-foreground">Daily Streak</p>
            <p className="text-xs text-teal-600 font-bold">🔥 7 days</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductMockup;
