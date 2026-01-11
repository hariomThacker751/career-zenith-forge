import { motion } from "framer-motion";
import { Shield, Code, Lightbulb, Heart } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Technically Rigorous",
    description: "We don't cut corners. Our curriculum is built on real industry standards and best practices."
  },
  {
    icon: Code,
    title: "Project-First Approach",
    description: "Theory without practice is meaningless. Build real projects that matter to employers."
  },
  {
    icon: Lightbulb,
    title: "Brutally Honest",
    description: "No false promises. We tell you exactly what it takes to succeed in tech."
  },
  {
    icon: Heart,
    title: "Student-Centered",
    description: "Your goals drive everything. Personalized paths, not one-size-fits-all solutions."
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(20, 184, 166, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
              About Hackwell
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Built by developers,{" "}
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                for developers
              </span>
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Hackwell was born from frustration. We watched countless students struggle with 
                scattered resources, unclear paths, and generic advice that didn't account for 
                their unique situations.
              </p>
              <p>
                We built the platform we wished existed—one that combines AI-powered personalization 
                with mentorship principles. Every feature is designed to bridge the gap between 
                where you are and where you want to be.
              </p>
              <p>
                Our mission is simple: <span className="text-foreground font-medium">help you become 
                job-ready faster</span>, with less wasted time and more meaningful progress.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  12+
                </div>
                <div className="text-sm text-muted-foreground">Week Program</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  3
                </div>
                <div className="text-sm text-muted-foreground">Learning Phases</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  AI
                </div>
                <div className="text-sm text-muted-foreground">Powered Agents</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Values */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-teal-500/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:from-teal-500/30 group-hover:to-emerald-500/30 transition-colors">
                  <value.icon className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
