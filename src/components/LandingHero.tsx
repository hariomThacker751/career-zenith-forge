import { motion } from "framer-motion";
import { Star, Settings, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductMockup from "./ProductMockup";

interface LandingHeroProps {
  onGetStarted?: () => void;
}

const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-background to-slate-50/30 dark:from-teal-950/20 dark:via-background dark:to-slate-950/20" />
      
      {/* Soft gradient blobs */}
      <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-teal-200 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20" />
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-slate-200 to-teal-100 dark:from-slate-800/30 dark:to-teal-900/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-card border border-border shadow-sm">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span className="text-muted-foreground">Career OS that replaces 7+ tools</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className="text-foreground">Forge skills,</span>
                <br />
                <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  Shape futures.
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Hackwell helps students build job-ready skills through personalized roadmaps, 
              real learning resources, and hands-on projects—aligned with their goals, 
              interests, and resume.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                onClick={onGetStarted}
                size="lg"
                className="group bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 dark:from-slate-200 dark:to-slate-100 dark:hover:from-white dark:hover:to-slate-50 dark:text-slate-900 text-white font-semibold px-8 py-6 text-lg shadow-xl shadow-slate-900/20 dark:shadow-slate-500/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
              >
                Start Forging Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Feature bullets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-3 pt-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Star className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-foreground font-medium">Learn industry-ready skills for free</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-foreground font-medium">One solution for all the JOB Hustle</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Product mockup */}
          <div className="hidden lg:block">
            <ProductMockup />
          </div>
        </div>

        {/* Mobile mockup - below content on smaller screens */}
        <div className="lg:hidden mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <ProductMockup />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-2.5 rounded-full bg-teal-500"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LandingHero;
