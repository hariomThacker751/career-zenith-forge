import { motion } from "framer-motion";
import { Zap, Code2, Rocket, Sparkles, Trophy, Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[65vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Soft gradient background blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-30" 
           style={{ background: "linear-gradient(135deg, hsl(158 64% 85%), hsl(158 84% 90%))" }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-25" 
           style={{ background: "linear-gradient(135deg, hsl(243 75% 90%), hsl(243 75% 95%))" }} />
      
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Star className="w-4 h-4 text-primary" />
      </motion.div>
      <motion.div
        className="absolute top-32 right-16 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center"
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Sparkles className="w-5 h-5 text-secondary" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-20 w-6 h-6 rounded-full bg-primary/20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Streak Badge - Gamification element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
          className="streak-badge mb-6 mx-auto w-fit"
        >
          <Trophy className="w-4 h-4" />
          <span>Build Your Career Streak</span>
          <span className="text-white/80">🔥</span>
        </motion.div>

        {/* Main Pill Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="pill-badge mb-8 mx-auto"
        >
          <Zap className="w-4 h-4 text-primary" />
          <span>Full-Spectrum Career Engineering</span>
        </motion.div>

        {/* Main heading with gradient */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-foreground">Welcome to </span>
          <motion.span 
            className="text-gradient-emerald"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Hack
          </motion.span>
          <motion.span 
            className="text-gradient-indigo"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            well
          </motion.span>
        </h1>

        {/* Subheading */}
        <motion.p 
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Your personal well of career hacks.
        </motion.p>
        <motion.p 
          className="text-base text-muted-foreground/80 max-w-xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Built by an elite ex-Google Principal Engineer to craft adaptive, autonomous roadmaps for your tech career.
        </motion.p>

        {/* Feature pills with hover effects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent cursor-pointer transition-shadow hover:shadow-lg hover:shadow-primary/10"
          >
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">CS Fundamentals</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer transition-shadow hover:shadow-lg hover:shadow-secondary/10"
            style={{ background: "hsl(243 75% 97%)" }}
          >
            <Rocket className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">Industry Specialization</span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 mx-auto flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-2.5 rounded-full bg-primary"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
