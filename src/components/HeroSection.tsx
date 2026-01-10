import { motion } from "framer-motion";
import { Zap, Code2, Rocket } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(210 40% 96% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(210 40% 96% / 0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass-card border-glow"
        >
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Full-Spectrum Career Engineering
          </span>
        </motion.div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-foreground">Welcome to </span>
          <span className="text-gradient-emerald">Hack</span>
          <span className="text-gradient-indigo">well</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
          Your personal well of career hacks.
        </p>
        <p className="text-base text-muted-foreground/70 max-w-xl mx-auto mb-12">
          Built by an elite ex-Google Principal Engineer to craft adaptive, autonomous roadmaps for your tech career.
        </p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">CS Fundamentals</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
            <Rocket className="w-4 h-4 text-secondary" />
            <span className="text-sm text-foreground">Industry Specialization</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;