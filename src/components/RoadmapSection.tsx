import { motion } from "framer-motion";
import { BookOpen, Hammer, Rocket, ChevronRight } from "lucide-react";

const phases = [
  {
    phase: 1,
    name: "Foundation",
    weeks: "Weeks 1-4",
    icon: BookOpen,
    color: "from-cyan-500 to-teal-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    description: "Build your core knowledge base with CS fundamentals, programming essentials, and industry context.",
    milestones: [
      "Programming fundamentals mastery",
      "Data structures & algorithms basics",
      "Version control with Git & GitHub",
      "Career path clarity & goal setting"
    ]
  },
  {
    phase: 2,
    name: "Forge",
    weeks: "Weeks 5-10",
    icon: Hammer,
    color: "from-teal-500 to-emerald-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    description: "Apply your knowledge through hands-on projects, deepening expertise in your chosen specialization.",
    milestones: [
      "Build 3-4 portfolio-worthy projects",
      "Deep dive into chosen tech stack",
      "Code reviews & best practices",
      "Open source contributions"
    ]
  },
  {
    phase: 3,
    name: "Launch",
    weeks: "Weeks 11-12+",
    icon: Rocket,
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "Prepare for the job market with interview prep, resume optimization, and networking strategies.",
    milestones: [
      "Technical interview mastery",
      "Resume & LinkedIn optimization",
      "Behavioral interview prep",
      "Job application strategy"
    ]
  }
];

const RoadmapSection = () => {
  return (
    <section id="roadmap" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 bg-teal-500" />
      <div className="absolute bottom-1/3 left-0 w-80 h-80 rounded-full blur-3xl opacity-10 bg-emerald-500" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4">
            The Journey
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Your 12-week{" "}
            <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              transformation
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A structured path from fundamentals to job-ready, with clear milestones and measurable progress.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 opacity-20 -translate-y-1/2" />

          <div className="grid lg:grid-cols-3 gap-8">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {/* Phase card */}
                <div className={`h-full p-6 rounded-2xl bg-card border ${phase.borderColor} hover:border-teal-500/50 transition-all duration-300 group`}>
                  {/* Phase number & icon */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <phase.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phase {phase.phase}
                      </span>
                      <h3 className="text-xl font-bold text-foreground">{phase.name}</h3>
                    </div>
                  </div>

                  {/* Weeks badge */}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${phase.bgColor} text-teal-400 mb-4`}>
                    {phase.weeks}
                  </span>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    {phase.description}
                  </p>

                  {/* Milestones */}
                  <div className="space-y-2">
                    {phase.milestones.map((milestone, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/80">{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow connector - desktop only */}
                {index < phases.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 w-8 h-8 items-center justify-center z-10">
                    <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
