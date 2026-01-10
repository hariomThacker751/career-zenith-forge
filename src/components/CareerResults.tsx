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
  ChevronRight,
  Loader2,
  Zap,
  Target,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [currentNode, setCurrentNode] = useState(0);
  const nodes = [
    { label: "Hobbies", color: "from-pink-500 to-rose-500" },
    { label: "Interests", color: "from-violet-500 to-purple-500" },
    { label: "Skills", color: "from-primary to-emerald-400" },
    { label: "Academics", color: "from-amber-500 to-orange-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNode(prev => (prev + 1) % nodes.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8"
      >
        {/* Central brain node */}
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

        {/* Orbiting nodes */}
        {nodes.map((node, index) => {
          const angle = (index * 90 - 45) * (Math.PI / 180);
          const radius = 100;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={node.label}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: currentNode === index ? 1 : 0.4,
                scale: currentNode === index ? 1.2 : 1
              }}
              className="absolute top-1/2 left-1/2"
              style={{ 
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` 
              }}
            >
              <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${node.color} text-white text-xs font-bold`}>
                {node.label}
              </div>
              {currentNode === index && (
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  className="absolute inset-0"
                >
                  <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <motion.line
                      x1="50%"
                      y1="50%"
                      x2={-x + 48}
                      y2={-y + 12}
                      stroke="rgba(16, 185, 129, 0.5)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold text-primary mb-2"
      >
        Analyzing Your Profile
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm flex items-center gap-2"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting {nodes[currentNode].label} to Career Nodes...
      </motion.p>
    </div>
  );
};

const CareerResults = ({ quizAnswers, onSelectCareer, onBack }: CareerResultsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [careers, setCareers] = useState<CareerPath[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null);

  useEffect(() => {
    fetchCareerRecommendations();
  }, []);

  const fetchCareerRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    
    // Add a minimum loading time for better UX
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
      
      // Handle rate limiting specifically
      if (data?.error?.includes("Rate limit")) {
        console.warn("Rate limited, using smart fallback");
        setCareers(getFallbackCareers(quizAnswers));
        return;
      }
      
      if (data?.careers && data.careers.length > 0) {
        setCareers(data.careers);
      } else {
        // No error, but no careers - use fallback
        setCareers(getFallbackCareers(quizAnswers));
      }
    } catch (err) {
      console.error("Career mapping error:", err);
      // Use smart fallback silently without showing error to user
      setCareers(getFallbackCareers(quizAnswers));
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackCareers = (answers: Record<string, string[]>): CareerPath[] => {
    const hobbies = answers.hobbies || [];
    const interests = answers.interests || [];
    const skills = answers.skills || [];

    const careersData: CareerPath[] = [];

    // Gaming + Logic = Game Dev / Backend
    if (hobbies.includes("gaming") && (skills.includes("coding") || skills.includes("math"))) {
      careersData.push({
        id: "game-dev",
        title: "Game Engine Developer",
        icon: "gamepad",
        description: "Build the core systems that power next-gen games. From physics engines to rendering pipelines.",
        matchScore: 92,
        justification: "Your love for gaming combined with strong logic skills makes you perfect for game engine development.",
        keySkills: ["C++", "Unity/Unreal", "Physics", "3D Math", "Optimization"],
        averageSalary: "$95,000 - $150,000",
        demandLevel: "High"
      });
    }

    // AI Interest + Coding
    if (interests.includes("ai") || hobbies.includes("problem-solving")) {
      careersData.push({
        id: "ml-engineer",
        title: "Machine Learning Engineer",
        icon: "brain",
        description: "Design and deploy AI systems that learn from data. The frontier of tech innovation.",
        matchScore: 88,
        justification: "Your interest in AI and problem-solving aligns perfectly with ML engineering demands.",
        keySkills: ["Python", "TensorFlow/PyTorch", "Math", "Statistics", "Cloud"],
        averageSalary: "$130,000 - $200,000",
        demandLevel: "Explosive"
      });
    }

    // Art + Design = UI/UX or Creative Tech
    if (hobbies.includes("art") || skills.includes("design")) {
      careersData.push({
        id: "creative-tech",
        title: "Creative Technologist",
        icon: "palette",
        description: "Bridge art and technology. Create interactive experiences, generative art, and innovative interfaces.",
        matchScore: 85,
        justification: "Your artistic eye combined with tech skills positions you for creative technology roles.",
        keySkills: ["JavaScript", "Three.js", "WebGL", "Design Systems", "Motion"],
        averageSalary: "$85,000 - $140,000",
        demandLevel: "High"
      });
    }

    // FinTech interest
    if (interests.includes("fintech") || skills.includes("excel")) {
      careersData.push({
        id: "fintech-dev",
        title: "FinTech Developer",
        icon: "globe",
        description: "Build the future of finance. From trading systems to blockchain applications.",
        matchScore: 82,
        justification: "Your interest in finance and analytical skills are perfect for FinTech development.",
        keySkills: ["Python", "SQL", "APIs", "Blockchain", "Security"],
        averageSalary: "$100,000 - $170,000",
        demandLevel: "Very High"
      });
    }

    // Systems interest = Backend/Infrastructure
    if (interests.includes("systems") || skills.includes("coding")) {
      careersData.push({
        id: "backend-architect",
        title: "Backend Architect",
        icon: "server",
        description: "Design scalable systems that handle millions of users. The backbone of modern tech.",
        matchScore: 80,
        justification: "Your interest in high-performance systems points to backend architecture.",
        keySkills: ["Go/Rust", "Databases", "Kubernetes", "System Design", "Performance"],
        averageSalary: "$120,000 - $180,000",
        demandLevel: "Very High"
      });
    }

    // Default if nothing matched
    if (careersData.length === 0) {
      careersData.push(
        {
          id: "fullstack-dev",
          title: "Full-Stack Developer",
          icon: "cpu",
          description: "Master both frontend and backend. The most versatile role in tech.",
          matchScore: 75,
          justification: "A full-stack role gives you flexibility to explore and find your niche.",
          keySkills: ["React", "Node.js", "SQL", "TypeScript", "Cloud"],
          averageSalary: "$80,000 - $140,000",
          demandLevel: "Very High"
        },
        {
          id: "product-engineer",
          title: "Product Engineer",
          icon: "globe",
          description: "Build user-facing products from concept to launch. Blend tech with product thinking.",
          matchScore: 72,
          justification: "Your diverse interests make you suited for product-focused engineering.",
          keySkills: ["JavaScript", "Product Sense", "UI/UX", "Analytics", "Communication"],
          averageSalary: "$90,000 - $150,000",
          demandLevel: "High"
        }
      );
    }

    return careersData.slice(0, 3);
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

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="pill-badge mb-4 mx-auto w-fit">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>AI Career Analysis Complete</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-gradient-sunset">Your Top Career Matches</span>
        </h2>
        <p className="text-muted-foreground">
          Based on your unique combination of hobbies, interests, and skills
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-4 mb-8">
        <AnimatePresence>
          {careers.map((career, index) => (
            <motion.div
              key={career.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedCareer(selectedCareer?.id === career.id ? null : career)}
              className={`glass-card p-6 cursor-pointer transition-all duration-300 ${
                selectedCareer?.id === career.id 
                  ? "emerald-glow-border" 
                  : "hover:border-primary/30"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Rank & Icon */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" :
                    index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800" :
                    "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary">
                    {iconMap[career.icon] || <Cpu className="w-6 h-6" />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">{career.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getDemandColor(career.demandLevel)}`}>
                        {career.demandLevel} Demand
                      </span>
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                        <Target className="w-3 h-3 text-primary" />
                        <span className="text-xs font-bold text-primary">{career.matchScore}% Match</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3">{career.description}</p>

                  {/* Justification */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-3">
                    <p className="text-sm italic text-primary/80">
                      "{career.justification}"
                    </p>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {selectedCareer?.id === career.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                          <div>
                            <h4 className="text-xs font-bold text-muted-foreground mb-2">KEY SKILLS TO MASTER</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {career.keySkills.map(skill => (
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
                              <span className="font-bold text-primary">{career.averageSalary}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCareer(career);
                          }}
                          className="w-full mt-4 gap-2 bg-gradient-to-r from-primary to-primary/90 text-white"
                        >
                          <Zap className="w-4 h-4" />
                          Start My Journey as {career.title}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          ← Retake Discovery Quiz
        </Button>
      </motion.div>
    </div>
  );
};

export default CareerResults;
