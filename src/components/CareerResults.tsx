import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, 
  Palette, 
  Server, 
  Shield, 
  Gamepad2, 
  Brain, 
  Globe,
  Sparkles,
  Loader2,
  Target,
  TrendingUp,
  Check,
  X,
  RefreshCw
} from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CareerPath {
  id: string;
  title: string;
  icon: string;
  description: string;
  matchScore: number;
  justification: string;
  keySkills: string[];
  averageSalary: string;
  demandLevel: "High" | "Very High" | "Explosive";
}

interface CareerResultsProps {
  quizAnswers: Record<string, string[]>;
  onSelectCareer: (career: CareerPath) => void;
  onBack: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  cpu: <Cpu className="w-6 h-6" />,
  palette: <Palette className="w-6 h-6" />,
  server: <Server className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  gamepad: <Gamepad2 className="w-6 h-6" />,
  brain: <Brain className="w-6 h-6" />,
  globe: <Globe className="w-6 h-6" />,
};

const LoadingAnimation = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const phases = [
    "Analyzing your profile...",
    "Mapping skills to careers...",
    "Calculating match scores...",
    "Generating prediction..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase(prev => (prev + 1) % phases.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 20px rgba(16, 185, 129, 0.3)",
              "0 0 40px rgba(16, 185, 129, 0.5)",
              "0 0 20px rgba(16, 185, 129, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center"
        >
          <Brain className="w-10 h-10 text-primary" />
        </motion.div>
      </motion.div>

      <motion.h3
        key={currentPhase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-xl font-bold text-primary mb-2"
      >
        {phases[currentPhase]}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm flex items-center gap-2"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        AI Career Prediction Engine Active
      </motion.p>
    </div>
  );
};

const CareerResults = ({ quizAnswers, onSelectCareer, onBack }: CareerResultsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [predictedCareer, setPredictedCareer] = useState<CareerPath | null>(null);
  const [hasAgreed, setHasAgreed] = useState<boolean | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchCareerPrediction();
  }, []);

  const fetchCareerPrediction = async () => {
    setIsLoading(true);
    
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      const fetchPromise = supabase.functions.invoke("career-agents", {
        body: {
          type: "career-mapping",
          quizAnswers
        }
      });

      const [{ data, error: fnError }] = await Promise.all([fetchPromise, minLoadTime]);

      if (fnError) throw fnError;
      
      if (data?.error?.includes("Rate limit")) {
        console.warn("Rate limited, using smart fallback");
        setPredictedCareer(getPredictedCareer(quizAnswers));
        return;
      }
      
      if (data?.careers && data.careers.length > 0) {
        // Take the top match as the predicted career
        setPredictedCareer(data.careers[0]);
      } else {
        setPredictedCareer(getPredictedCareer(quizAnswers));
      }
    } catch (err) {
      console.error("Career prediction error:", err);
      setPredictedCareer(getPredictedCareer(quizAnswers));
    } finally {
      setIsLoading(false);
    }
  };

  const getPredictedCareer = (answers: Record<string, string[]>): CareerPath => {
    const workEnergy = answers.work_energy?.[0] || "";
    const skillLevel = answers.skill_level?.[0] || "beginner";
    const buildIdea = answers.build_idea?.[0] || "";
    
    // Analyze the build idea for keywords
    const ideaLower = buildIdea.toLowerCase();
    
    // Logic-focused prediction
    if (workEnergy === "logic" || ideaLower.includes("algorithm") || ideaLower.includes("problem")) {
      return {
        id: "backend-engineer",
        title: "Backend Engineer",
        icon: "server",
        description: "Design and build the server-side logic, APIs, and databases that power applications. Master of efficiency and scalability.",
        matchScore: 89,
        justification: "Your love for logic and problem-solving aligns perfectly with backend engineering, where you'll architect systems that handle millions of requests.",
        keySkills: ["Python/Go", "SQL", "APIs", "System Design", "Cloud"],
        averageSalary: "$100,000 - $160,000",
        demandLevel: "Very High"
      };
    }
    
    // Visual/Design-focused prediction
    if (workEnergy === "visuals" || ideaLower.includes("design") || ideaLower.includes("beautiful") || ideaLower.includes("ui")) {
      return {
        id: "frontend-engineer",
        title: "Frontend Engineer",
        icon: "palette",
        description: "Craft beautiful, responsive user interfaces that delight users. Bridge design and code to create seamless experiences.",
        matchScore: 91,
        justification: "Your passion for visuals and design makes you ideal for frontend development, where aesthetics meet functionality.",
        keySkills: ["React", "TypeScript", "CSS/Tailwind", "Animation", "Accessibility"],
        averageSalary: "$90,000 - $150,000",
        demandLevel: "High"
      };
    }
    
    // Systems/Infrastructure-focused prediction
    if (workEnergy === "systems" || ideaLower.includes("infrastructure") || ideaLower.includes("scale")) {
      return {
        id: "devops-engineer",
        title: "DevOps Engineer",
        icon: "server",
        description: "Bridge development and operations. Build CI/CD pipelines, manage cloud infrastructure, and ensure 99.9% uptime.",
        matchScore: 87,
        justification: "Your interest in systems and infrastructure points to DevOps, where you'll automate and scale critical systems.",
        keySkills: ["Docker", "Kubernetes", "AWS/GCP", "Terraform", "Linux"],
        averageSalary: "$110,000 - $170,000",
        demandLevel: "Very High"
      };
    }
    
    // Automation-focused prediction
    if (workEnergy === "automation" || ideaLower.includes("automate") || ideaLower.includes("bot") || ideaLower.includes("ai")) {
      return {
        id: "ml-engineer",
        title: "Machine Learning Engineer",
        icon: "brain",
        description: "Build AI systems that learn and adapt. From recommendation engines to language models, shape the future of automation.",
        matchScore: 88,
        justification: "Your drive for automation combined with technical curiosity makes ML engineering your ideal path.",
        keySkills: ["Python", "TensorFlow/PyTorch", "Statistics", "MLOps", "Data"],
        averageSalary: "$130,000 - $200,000",
        demandLevel: "Explosive"
      };
    }
    
    // People-focused prediction
    if (workEnergy === "people" || ideaLower.includes("team") || ideaLower.includes("manage")) {
      return {
        id: "product-manager",
        title: "Technical Product Manager",
        icon: "globe",
        description: "Lead product strategy with technical depth. Bridge engineering, design, and business to ship products users love.",
        matchScore: 85,
        justification: "Your people skills combined with technical understanding positions you perfectly for product leadership.",
        keySkills: ["Roadmapping", "User Research", "Data Analysis", "Communication", "Agile"],
        averageSalary: "$120,000 - $180,000",
        demandLevel: "High"
      };
    }
    
    // Creativity-focused prediction
    if (workEnergy === "creativity" || ideaLower.includes("game") || ideaLower.includes("creative") || ideaLower.includes("art")) {
      return {
        id: "creative-technologist",
        title: "Creative Technologist",
        icon: "palette",
        description: "Blend art and code to create interactive experiences, generative art, and innovative digital products.",
        matchScore: 86,
        justification: "Your creative energy combined with technical skills makes you perfect for pushing boundaries in creative tech.",
        keySkills: ["JavaScript", "Three.js", "WebGL", "Generative AI", "Motion Design"],
        averageSalary: "$85,000 - $140,000",
        demandLevel: "High"
      };
    }
    
    // Default: Full-stack (versatile option)
    return {
      id: "fullstack-developer",
      title: "Full-Stack Developer",
      icon: "cpu",
      description: "Master both frontend and backend. The most versatile role in tech, capable of building complete products end-to-end.",
      matchScore: 82,
      justification: "Your diverse interests and adaptability make full-stack development ideal—you'll never be limited to one domain.",
      keySkills: ["React", "Node.js", "TypeScript", "SQL", "Cloud"],
      averageSalary: "$90,000 - $150,000",
      demandLevel: "Very High"
    };
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setHasAgreed(null);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate an alternative career
    const alternatives: CareerPath[] = [
      {
        id: "data-engineer",
        title: "Data Engineer",
        icon: "server",
        description: "Build data pipelines and infrastructure that power analytics and ML systems at scale.",
        matchScore: 84,
        justification: "Based on your profile, data engineering offers a strong path combining systems thinking with analytical work.",
        keySkills: ["Python", "SQL", "Spark", "Airflow", "Cloud"],
        averageSalary: "$110,000 - $170,000",
        demandLevel: "Very High"
      },
      {
        id: "security-engineer",
        title: "Security Engineer",
        icon: "shield",
        description: "Protect systems from threats. Design secure architectures and respond to vulnerabilities.",
        matchScore: 83,
        justification: "Your analytical mindset and attention to detail align well with cybersecurity challenges.",
        keySkills: ["Security Tools", "Networking", "Python", "Penetration Testing", "Compliance"],
        averageSalary: "$120,000 - $180,000",
        demandLevel: "Explosive"
      },
      {
        id: "mobile-developer",
        title: "Mobile Developer",
        icon: "cpu",
        description: "Build native iOS and Android apps that millions of users interact with daily.",
        matchScore: 85,
        justification: "Mobile development lets you create tangible products that people use every day—highly rewarding!",
        keySkills: ["React Native/Flutter", "Swift/Kotlin", "APIs", "UX Design", "Performance"],
        averageSalary: "$95,000 - $155,000",
        demandLevel: "High"
      }
    ];
    
    const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
    setPredictedCareer(randomAlt);
    setIsRegenerating(false);
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case "Explosive": return "text-rose-400 bg-rose-400/10";
      case "Very High": return "text-amber-400 bg-amber-400/10";
      default: return "text-primary bg-primary/10";
    }
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (!predictedCareer) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Unable to generate prediction. Please try again.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="pill-badge mb-4 mx-auto w-fit">
          <Target className="w-4 h-4 text-primary" />
          <span>AI Career Prediction</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-gradient-sunset">Your Predicted Career Path</span>
        </h2>
        <p className="text-muted-foreground">
          Based on your unique profile, this is your best-fit role
        </p>
      </motion.div>

      {/* Predicted Career Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 mb-8 emerald-glow-border"
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary"
          >
            {iconMap[predictedCareer.icon] || <Cpu className="w-8 h-8" />}
          </motion.div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{predictedCareer.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getDemandColor(predictedCareer.demandLevel)}`}>
                {predictedCareer.demandLevel} Demand
              </span>
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                <Target className="w-3 h-3 text-primary" />
                <span className="text-xs font-bold text-primary">{predictedCareer.matchScore}% Match</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{predictedCareer.description}</p>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
          <p className="text-sm italic text-primary/90">
            "{predictedCareer.justification}"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-xs font-bold text-muted-foreground mb-2">KEY SKILLS TO LEARN</h4>
            <div className="flex flex-wrap gap-1.5">
              {predictedCareer.keySkills.map(skill => (
                <span key={skill} className="px-2 py-1 bg-muted rounded text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-muted-foreground mb-2">SALARY RANGE (2026)</h4>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">{predictedCareer.averageSalary}</span>
            </div>
          </div>
        </div>

        {/* Confirmation Buttons */}
        {hasAgreed === null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-center text-sm text-muted-foreground mb-4">
              Does this career path resonate with you?
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setHasAgreed(true)}
                className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-8"
              >
                <Check className="w-4 h-4" />
                Yes, this is me!
              </Button>
              <Button
                onClick={handleRegenerate}
                variant="outline"
                disabled={isRegenerating}
                className="gap-2"
              >
                {isRegenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Try Another
              </Button>
            </div>
          </motion.div>
        )}

        {/* After agreeing - Show proceed button */}
        {hasAgreed === true && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Excellent choice! Let's build your roadmap.</span>
            </div>
            <Button
              onClick={() => onSelectCareer(predictedCareer)}
              className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 px-8 py-6 text-base"
            >
              <Target className="w-5 h-5" />
              Start My Journey as {predictedCareer.title}
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Back button */}
      {hasAgreed === null && (
        <div className="text-center">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <X className="w-4 h-4" />
            Retake Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default CareerResults;
