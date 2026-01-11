import { motion } from "framer-motion";
import { 
  Brain, 
  Target, 
  Rocket, 
  BookOpen, 
  GitBranch, 
  Trophy,
  Zap,
  Users
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Career Mapping",
    description: "Multi-agent AI analyzes your skills, interests, and goals to create a personalized career roadmap.",
    gradient: "from-teal-500 to-emerald-500"
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description: "Identify exactly what skills you need and get curated resources to fill the gaps efficiently.",
    gradient: "from-cyan-500 to-teal-500"
  },
  {
    icon: BookOpen,
    title: "Curated Learning Paths",
    description: "Access hand-picked courses, tutorials, and documentation tailored to your career goals.",
    gradient: "from-emerald-500 to-green-500"
  },
  {
    icon: GitBranch,
    title: "Project-Based Learning",
    description: "Build real-world projects with AI-guided feedback and GitHub integration for portfolio building.",
    gradient: "from-teal-600 to-cyan-500"
  },
  {
    icon: Rocket,
    title: "Weekly Sprints",
    description: "Structured weekly missions keep you on track with clear objectives and milestones.",
    gradient: "from-green-500 to-teal-500"
  },
  {
    icon: Trophy,
    title: "Progress Tracking",
    description: "Gamified progress system with achievements, streaks, and credits to keep you motivated.",
    gradient: "from-cyan-600 to-teal-600"
  },
  {
    icon: Zap,
    title: "Resume Integration",
    description: "Upload your resume for instant skill extraction and personalized recommendations.",
    gradient: "from-teal-400 to-emerald-400"
  },
  {
    icon: Users,
    title: "Interview Preparation",
    description: "AI-powered mock interviews and technical preparation aligned with your target roles.",
    gradient: "from-emerald-600 to-teal-500"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl opacity-10 bg-teal-500" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 bg-emerald-500" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              level up
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete career development platform that combines AI intelligence with proven learning methodologies.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="h-full p-6 rounded-2xl bg-card border border-border/50 hover:border-teal-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-teal-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
