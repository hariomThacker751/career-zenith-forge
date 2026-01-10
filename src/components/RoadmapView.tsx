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
  Target
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
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full glass-card">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Your Personalized Roadmap</span>
        </div>
        <h2 className="text-2xl font-bold">
          <span className="text-gradient-emerald">Career Velocity</span>
          <span className="text-foreground"> Activated</span>
        </h2>
      </motion.div>

      {/* Skill Tree Roadmap */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary/30" />
        
        <div className="space-y-6">
          {roadmap.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="relative pl-16"
            >
              {/* Node marker */}
              <div className={`absolute left-0 w-12 h-12 rounded-xl flex items-center justify-center z-10 ${
                index === 0 ? "bg-primary text-primary-foreground glow-emerald" : "glass-card text-primary"
              }`}>
                {node.icon}
              </div>
              
              {/* Node content */}
              <div className="glass-card p-5 border-glow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono text-secondary uppercase">{node.phase}</span>
                    <h3 className="text-lg font-bold text-foreground">{node.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {node.duration}
                  </span>
                </div>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {node.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                {/* Milestone */}
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium">Milestone:</span>
                  <span className="text-muted-foreground">{node.milestone}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resources Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-secondary" />
          <span className="text-gradient-indigo">Curated Resources</span>
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
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
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
        className="text-center"
      >
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retake Diagnostic
        </button>
      </motion.div>
    </div>
  );
};

export default RoadmapView;