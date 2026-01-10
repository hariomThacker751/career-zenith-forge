import { motion } from "framer-motion";
import { Target, Compass, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "./ui/button";

type PathType = "targeted" | "explore";

interface InitialDiscoveryProps {
  onSelectPath: (path: PathType) => void;
}

const InitialDiscovery = ({ onSelectPath }: InitialDiscoveryProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      className="max-w-3xl mx-auto"
    >
      {/* System Status Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="credits-badge mb-6 mx-auto w-fit">
          <Zap className="w-4 h-4" />
          <span>Hackwell Intelligence Online</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="text-gradient-sunset">Initial Discovery</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Choose your path to career acceleration. Both options unlock the full power of our multi-agent system.
        </p>
      </motion.div>

      {/* Path Selection Cards */}
      <div className="bento-grid">
        {/* Targeted Path - Option 1 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectPath("targeted")}
          className="glass-card emerald-glow-border p-8 cursor-pointer group"
        >
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-400/20 flex items-center justify-center border border-primary/30"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <Target className="w-7 h-7 text-primary" />
            </motion.div>
            <div>
              <span className="tier-badge gold mb-2 inline-block">RECOMMENDED</span>
              <h3 className="text-xl font-bold text-foreground">
                Targeted Path
              </h3>
            </div>
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            You have a <span className="text-primary font-semibold">specific role</span> in mind 
            (e.g., "SWE Internship at Google 2026"). We'll reverse-engineer the exact skills, 
            projects, and timeline to get you there.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-foreground/80">Precision skill gap analysis</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-foreground/80">Company-specific project suggestions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-foreground/80">6-month focused execution plan</span>
            </div>
          </div>

          <Button className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 group-hover:shadow-primary/40">
            <Target className="w-4 h-4" />
            Start Targeted Path
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {/* Explore Mode - Option 2 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectPath("explore")}
          className="glass-card p-8 cursor-pointer group"
        >
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-indigo-400/20 flex items-center justify-center border border-secondary/30"
              whileHover={{ rotate: -5, scale: 1.05 }}
            >
              <Compass className="w-7 h-7 text-secondary" />
            </motion.div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                DISCOVERY MODE
              </span>
              <h3 className="text-xl font-bold text-foreground">
                Explore Mode
              </h3>
            </div>
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            You're <span className="text-secondary font-semibold">open to possibilities</span>. 
            Let our AI agents analyze your profile and reveal career paths you might not have 
            considered based on your unique strengths.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-foreground/80">Discover hidden strengths</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-foreground/80">Explore trending 2026 roles</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-foreground/80">Flexible roadmap generation</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full gap-2 border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary group-hover:shadow-lg group-hover:shadow-secondary/10"
          >
            <Compass className="w-4 h-4" />
            Start Explore Mode
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>

      {/* Bottom Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        💡 Both paths use the same AI agents. Choose based on how clear your goal is.
      </motion.p>
    </motion.div>
  );
};

export default InitialDiscovery;
