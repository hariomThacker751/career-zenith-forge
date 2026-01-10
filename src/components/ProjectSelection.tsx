import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  BookOpen, 
  Clock, 
  Star,
  ChevronRight,
  Loader2,
  Sparkles,
  Target,
  Layers,
  Zap,
  ExternalLink
} from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedWeeks: number;
  techStack: string[];
  learningOutcomes: string[];
}

interface ProjectSelectionProps {
  targetCareer: string;
  exploreAnswers: Record<string, string[]>;
  onSelectProject: (project: Project) => void;
  onBack: () => void;
}

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mb-6"
      >
        <Rocket className="w-10 h-10 text-primary" />
      </motion.div>
      <h3 className="text-xl font-bold text-primary mb-2">Curating Projects...</h3>
      <p className="text-muted-foreground text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Finding the perfect build challenges for you
      </p>
    </div>
  );
};

const ProjectSelection = ({ targetCareer, exploreAnswers, onSelectProject, onBack }: ProjectSelectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    generateProjects();
  }, []);

  const generateProjects = async () => {
    setIsLoading(true);
    
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const skillLevel = exploreAnswers.skill_level?.[0] || "beginner";
      const constraints = exploreAnswers.constraints?.[0] || "flexible";
      const buildIdea = exploreAnswers.build_idea?.[0] || "";
      
      // Try to get AI-generated projects
      const fetchPromise = supabase.functions.invoke("generate-phase-content", {
        body: {
          phase: "project-selection",
          targetCareer,
          exploreAnswers,
          context: {
            skillLevel,
            constraints,
            buildIdea
          }
        }
      });

      const [{ data, error }] = await Promise.all([fetchPromise, minLoadTime]);

      if (error || !data?.projects) {
        // Use fallback projects
        setProjects(getFallbackProjects(targetCareer, skillLevel));
      } else {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("Project generation error:", err);
      setProjects(getFallbackProjects(targetCareer, exploreAnswers.skill_level?.[0] || "beginner"));
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackProjects = (career: string, skillLevel: string): Project[] => {
    const careerLower = career.toLowerCase();
    
    // Backend Engineer projects
    if (careerLower.includes("backend")) {
      return [
        {
          id: "rest-api",
          title: "RESTful API with Authentication",
          description: "Build a complete REST API with user authentication, CRUD operations, and database integration.",
          difficulty: skillLevel === "beginner" ? "Beginner" : "Intermediate",
          estimatedWeeks: 3,
          techStack: ["Node.js", "Express", "PostgreSQL", "JWT"],
          learningOutcomes: ["API Design", "Database Modeling", "Authentication", "Error Handling"]
        },
        {
          id: "task-queue",
          title: "Distributed Task Queue System",
          description: "Create a job queue system that processes background tasks with retry logic and monitoring.",
          difficulty: "Intermediate",
          estimatedWeeks: 4,
          techStack: ["Python", "Redis", "Celery", "Docker"],
          learningOutcomes: ["Async Processing", "Queue Systems", "Containerization", "System Design"]
        },
        {
          id: "realtime-chat",
          title: "Real-time Chat Backend",
          description: "Build a scalable WebSocket-based chat server supporting multiple rooms and message persistence.",
          difficulty: "Advanced",
          estimatedWeeks: 5,
          techStack: ["Go", "WebSockets", "Redis", "PostgreSQL"],
          learningOutcomes: ["Real-time Systems", "Concurrency", "Scaling", "Performance"]
        }
      ];
    }
    
    // Frontend Engineer projects
    if (careerLower.includes("frontend")) {
      return [
        {
          id: "portfolio",
          title: "Interactive Portfolio Website",
          description: "Create a stunning portfolio with animations, dark mode, and a contact form.",
          difficulty: "Beginner",
          estimatedWeeks: 2,
          techStack: ["React", "Tailwind CSS", "Framer Motion"],
          learningOutcomes: ["Component Design", "CSS Animation", "Responsive Design", "Forms"]
        },
        {
          id: "dashboard",
          title: "Analytics Dashboard",
          description: "Build a data visualization dashboard with charts, filters, and real-time updates.",
          difficulty: "Intermediate",
          estimatedWeeks: 4,
          techStack: ["React", "TypeScript", "Recharts", "TanStack Query"],
          learningOutcomes: ["Data Visualization", "State Management", "API Integration", "Performance"]
        },
        {
          id: "design-system",
          title: "Component Design System",
          description: "Create a reusable component library with documentation and accessibility.",
          difficulty: "Advanced",
          estimatedWeeks: 5,
          techStack: ["React", "Storybook", "TypeScript", "Testing Library"],
          learningOutcomes: ["Design Systems", "Documentation", "Testing", "Accessibility"]
        }
      ];
    }
    
    // ML Engineer projects
    if (careerLower.includes("machine learning") || careerLower.includes("ml")) {
      return [
        {
          id: "sentiment",
          title: "Sentiment Analysis API",
          description: "Build an ML model that analyzes text sentiment and serve it via an API.",
          difficulty: "Beginner",
          estimatedWeeks: 3,
          techStack: ["Python", "scikit-learn", "FastAPI", "Docker"],
          learningOutcomes: ["NLP Basics", "Model Training", "API Development", "Deployment"]
        },
        {
          id: "recommender",
          title: "Product Recommendation Engine",
          description: "Create a collaborative filtering system that suggests products based on user behavior.",
          difficulty: "Intermediate",
          estimatedWeeks: 4,
          techStack: ["Python", "PyTorch", "PostgreSQL", "Redis"],
          learningOutcomes: ["Recommender Systems", "Deep Learning", "Feature Engineering", "Evaluation"]
        },
        {
          id: "computer-vision",
          title: "Object Detection System",
          description: "Build a real-time object detection system with a web interface.",
          difficulty: "Advanced",
          estimatedWeeks: 6,
          techStack: ["Python", "YOLO", "OpenCV", "React"],
          learningOutcomes: ["Computer Vision", "Model Optimization", "Real-time Processing", "Full-stack"]
        }
      ];
    }
    
    // Full-stack / Default projects
    return [
      {
        id: "todo-app",
        title: "Full-Stack Task Manager",
        description: "Build a complete task management app with user accounts, due dates, and notifications.",
        difficulty: "Beginner",
        estimatedWeeks: 3,
        techStack: ["React", "Node.js", "PostgreSQL", "Tailwind"],
        learningOutcomes: ["Full-stack Basics", "CRUD Operations", "User Auth", "Deployment"]
      },
      {
        id: "saas-starter",
        title: "SaaS Starter Template",
        description: "Create a subscription-based SaaS app with payments, dashboards, and team features.",
        difficulty: "Intermediate",
        estimatedWeeks: 5,
        techStack: ["Next.js", "Supabase", "Stripe", "TypeScript"],
        learningOutcomes: ["SaaS Architecture", "Payments", "Multi-tenancy", "Production Setup"]
      },
      {
        id: "social-platform",
        title: "Social Media Platform",
        description: "Build a social network with posts, follows, likes, and real-time notifications.",
        difficulty: "Advanced",
        estimatedWeeks: 6,
        techStack: ["React", "GraphQL", "PostgreSQL", "Redis", "WebSockets"],
        learningOutcomes: ["Complex Systems", "Graph Databases", "Real-time", "Scaling"]
      }
    ];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-400 bg-green-400/10";
      case "Intermediate": return "text-amber-400 bg-amber-400/10";
      case "Advanced": return "text-rose-400 bg-rose-400/10";
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
          <Rocket className="w-4 h-4 text-primary" />
          <span>Project Selection</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-gradient-sunset">Choose Your Build Challenge</span>
        </h2>
        <p className="text-muted-foreground">
          Select a project to master your skills as a <span className="text-primary font-semibold">{targetCareer}</span>
        </p>
      </motion.div>

      {/* Projects Grid */}
      <div className="space-y-4 mb-8">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
            className={`glass-card p-6 cursor-pointer transition-all duration-300 ${
              selectedProject?.id === project.id 
                ? "emerald-glow-border" 
                : "hover:border-primary/30"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  index === 0 ? "bg-gradient-to-br from-green-500/20 to-green-500/5" :
                  index === 1 ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5" :
                  "bg-gradient-to-br from-rose-500/20 to-rose-500/5"
                }`}>
                  <Layers className={`w-6 h-6 ${
                    index === 0 ? "text-green-400" :
                    index === 1 ? "text-amber-400" :
                    "text-rose-400"
                  }`} />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{project.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{project.estimatedWeeks} weeks</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                
                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.techStack.map(tech => (
                    <span key={tech} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {selectedProject?.id === project.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2">
                          <Star className="w-3 h-3" />
                          WHAT YOU'LL LEARN
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {project.learningOutcomes.map(outcome => (
                            <div key={outcome} className="flex items-center gap-2 text-sm">
                              <Zap className="w-3 h-3 text-primary" />
                              <span>{outcome}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(project);
                          }}
                          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 text-white"
                        >
                          <Sparkles className="w-4 h-4" />
                          Start This Project
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Career Selection
        </Button>
      </div>
    </div>
  );
};

export default ProjectSelection;
