import { motion } from "framer-motion";
import { 
  BookOpen, 
  Code2, 
  Rocket, 
  Trophy, 
  ExternalLink,
  Youtube,
  FileText,
  GraduationCap,
  Zap,
  Target,
  Sparkles,
  Check,
  ArrowLeft
} from "lucide-react";

interface RoadmapViewProps {
  answers: Record<number, string>;
  onReset: () => void;
}

interface RoadmapNode {
  id: string;
  phase: string;
  title: string;
  duration: string;
  skills: string[];
  milestone: string;
  icon: React.ReactNode;
}

interface Resource {
  title: string;
  type: "video" | "article" | "course";
  url: string;
  platform: string;
}

const getRoadmap = (answers: Record<number, string>): RoadmapNode[] => {
  const level = answers[2] || "";
  const interest = answers[1] || "";
  
  if (level.includes("loop") || level.includes("basic")) {
    return [
      {
        id: "1",
        phase: "Phase 1",
        title: "Logic Foundations",
        duration: "Weeks 1-4",
        skills: ["Variables & Types", "Control Flow", "Functions", "Basic Data Structures"],
        milestone: "Build a CLI Calculator with History",
        icon: <BookOpen className="w-5 h-5" />
      },
      {
        id: "2",
        phase: "Phase 2",
        title: "Problem Solving",
        duration: "Weeks 5-8",
        skills: ["Arrays & Strings", "Recursion", "Time Complexity", "LeetCode Easy"],
        milestone: "Solve 30 LeetCode Easy Problems",
        icon: <Code2 className="w-5 h-5" />
      },
      {
        id: "3",
        phase: "Phase 3",
        title: "First Real Project",
        duration: "Weeks 9-12",
        skills: ["File I/O", "APIs", "Git Basics", "Documentation"],
        milestone: "CLI Study Scheduler with Analytics",
        icon: <Rocket className="w-5 h-5" />
      },
      {
        id: "4",
        phase: "Phase 4",
        title: "Web Fundamentals",
        duration: "Weeks 13-16",
        skills: ["HTML/CSS", "JavaScript DOM", "React Basics", "Responsive Design"],
        milestone: "Personal Portfolio Website",
        icon: <Trophy className="w-5 h-5" />
      }
    ];
  }
  
  if (interest.includes("AI")) {
    return [
      {
        id: "1",
        phase: "Phase 1",
        title: "ML Foundations",
        duration: "Weeks 1-4",
        skills: ["Python for ML", "NumPy/Pandas", "Scikit-learn", "Model Evaluation"],
        milestone: "Build 3 ML Models from Scratch",
        icon: <BookOpen className="w-5 h-5" />
      },
      {
        id: "2",
        phase: "Phase 2",
        title: "Deep Learning",
        duration: "Weeks 5-10",
        skills: ["PyTorch", "Neural Networks", "CNNs", "Transformers"],
        milestone: "Fine-tune a Language Model",
        icon: <Code2 className="w-5 h-5" />
      },
      {
        id: "3",
        phase: "Phase 3",
        title: "LLM Engineering",
        duration: "Weeks 11-14",
        skills: ["LangChain", "RAG Architecture", "Prompt Engineering", "Vector DBs"],
        milestone: "AI Agent with Tool Calling",
        icon: <Rocket className="w-5 h-5" />
      },
      {
        id: "4",
        phase: "Phase 4",
        title: "Production AI",
        duration: "Weeks 15-18",
        skills: ["MLOps", "Model Deployment", "Monitoring", "Cost Optimization"],
        milestone: "Deploy AI Product with 100+ Users",
        icon: <Trophy className="w-5 h-5" />
      }
    ];
  }
  
  // Default: Full-stack web
  return [
    {
      id: "1",
      phase: "Phase 1",
      title: "Frontend Mastery",
      duration: "Weeks 1-4",
      skills: ["React 19", "TypeScript", "Tailwind CSS", "State Management"],
      milestone: "Build a Dashboard with Charts",
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: "2",
      phase: "Phase 2",
      title: "Backend & APIs",
      duration: "Weeks 5-8",
      skills: ["Node.js/Deno", "REST & GraphQL", "Auth/Sessions", "Database Design"],
      milestone: "Full-Stack CRUD App with Auth",
      icon: <Code2 className="w-5 h-5" />
    },
    {
      id: "3",
      phase: "Phase 3",
      title: "Advanced Patterns",
      duration: "Weeks 9-12",
      skills: ["Real-time (WebSockets)", "Caching", "Testing", "CI/CD"],
      milestone: "Real-time Collaborative App",
      icon: <Rocket className="w-5 h-5" />
    },
    {
      id: "4",
      phase: "Phase 4",
      title: "Ship to Production",
      duration: "Weeks 13-16",
      skills: ["Cloud Deployment", "Monitoring", "SEO", "Performance"],
      milestone: "Launch Product with Real Users",
      icon: <Trophy className="w-5 h-5" />
    }
  ];
};

const getResources = (answers: Record<number, string>): Resource[] => {
  const interest = answers[1] || "";
  
  if (interest.includes("AI")) {
    return [
      { title: "Andrej Karpathy - Neural Networks: Zero to Hero", type: "video", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", platform: "YouTube" },
      { title: "Fast.ai Practical Deep Learning", type: "course", url: "https://course.fast.ai/", platform: "Fast.ai" },
      { title: "LangChain Documentation", type: "article", url: "https://python.langchain.com/docs/", platform: "LangChain" },
      { title: "Hugging Face NLP Course", type: "course", url: "https://huggingface.co/learn/nlp-course", platform: "Hugging Face" },
      { title: "MLOps Zoomcamp", type: "course", url: "https://github.com/DataTalksClub/mlops-zoomcamp", platform: "DataTalks" },
    ];
  }
  
  return [
    { title: "The Odin Project", type: "course", url: "https://www.theodinproject.com/", platform: "Free Course" },
    { title: "JavaScript.info", type: "article", url: "https://javascript.info/", platform: "Tutorial" },
    { title: "Fireship - 100 Seconds Series", type: "video", url: "https://www.youtube.com/@Fireship", platform: "YouTube" },
    { title: "React Documentation", type: "article", url: "https://react.dev/", platform: "Official Docs" },
    { title: "Full Stack Open", type: "course", url: "https://fullstackopen.com/", platform: "University of Helsinki" },
  ];
};

const RoadmapView = ({ answers, onReset }: RoadmapViewProps) => {
  const roadmap = getRoadmap(answers);
  const resources = getResources(answers);
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video": return <Youtube className="w-4 h-4" />;
      case "course": return <GraduationCap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div 
          className="pill-badge mb-4 mx-auto w-fit"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <Target className="w-4 h-4 text-primary" />
          <span>Your Personalized Roadmap</span>
        </motion.div>
        <h2 className="text-2xl font-bold">
          <span className="text-gradient-emerald">Career Velocity</span>
          <span className="text-foreground"> Activated</span>
        </h2>
      </motion.div>

      {/* Skill Tree Roadmap */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-7 top-8 bottom-8 w-1 rounded-full bg-gradient-to-b from-primary via-secondary to-primary/30" />
        
        <div className="space-y-6">
          {roadmap.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
              className="relative pl-20"
            >
              {/* Node marker */}
              <motion.div 
                className={`absolute left-0 w-14 h-14 rounded-2xl flex items-center justify-center z-10 ${
                  index === 0 
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30" 
                    : "bg-card border-2 border-border text-primary"
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {node.icon}
                {index === 0 && (
                  <motion.div
                    className="absolute -inset-1 rounded-2xl border-2 border-primary/30"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              {/* Node content */}
              <motion.div 
                className="card-elevated p-5"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                      {node.phase}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{node.title}</h3>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                    {node.duration}
                  </span>
                </div>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {node.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      whileHover={{ scale: 1.05 }}
                      className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground font-medium cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
                
                {/* Milestone */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">Milestone</span>
                    <p className="text-sm text-foreground font-medium">{node.milestone}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resources Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-elevated p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-secondary" />
          <span className="text-gradient-indigo">Curated Resources</span>
          <Sparkles className="w-4 h-4 text-primary" />
        </h3>
        
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <motion.a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ x: 6, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {resource.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{resource.platform}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Reset button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pt-4"
      >
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" />
          Retake Diagnostic
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RoadmapView;
