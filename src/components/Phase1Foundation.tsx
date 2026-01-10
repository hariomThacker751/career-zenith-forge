import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  Clock,
  CheckCircle2,
  GraduationCap,
  Target,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { usePhase, LearningPath } from "@/contexts/PhaseContext";
import { useResume } from "@/contexts/ResumeContext";

interface Phase1FoundationProps {
  answers: Record<number, string>;
}

const generateLearningPaths = (
  answers: Record<number, string>,
  resumeSkills: string[]
): LearningPath[] => {
  const interest = answers[1] || "";
  const level = answers[2] || "";
  const goal = answers[4] || "";

  // Determine skill gaps
  const isAIInterested = interest.includes("AI");
  const isWebInterested = interest.includes("web") || interest.includes("app");
  const isBeginner = level.includes("loop") || level.includes("basic");
  const hasReactSkill = resumeSkills.some((s) =>
    s.toLowerCase().includes("react")
  );
  const hasPythonSkill = resumeSkills.some((s) =>
    s.toLowerCase().includes("python")
  );

  const paths: LearningPath[] = [];

  // Logic Foundations for beginners
  if (isBeginner) {
    paths.push({
      id: "cs50",
      title: "Harvard CS50: Introduction to Computer Science",
      source: "edX / Harvard University",
      modules: [
        "Scratch & Computational Thinking",
        "C Programming Fundamentals",
        "Arrays & Algorithms",
        "Memory & Data Structures",
        "Python Introduction",
        "SQL & Web Development",
      ],
      duration: "12 weeks",
      level: "Beginner",
    });
  }

  // Python for ML if AI interested and no Python
  if (isAIInterested && !hasPythonSkill) {
    paths.push({
      id: "python-ml",
      title: "Python for Machine Learning",
      source: "Kaggle + Fast.ai",
      modules: [
        "Python Basics & NumPy",
        "Pandas for Data Manipulation",
        "Data Visualization (Matplotlib/Seaborn)",
        "Scikit-learn Fundamentals",
        "Model Training & Evaluation",
      ],
      duration: "6 weeks",
      level: "Intermediate",
    });
  }

  // React for web developers without React
  if ((isWebInterested || !isAIInterested) && !hasReactSkill) {
    paths.push({
      id: "react-official",
      title: "React 19: The Official Documentation",
      source: "react.dev",
      modules: [
        "Describing the UI",
        "Adding Interactivity",
        "Managing State",
        "Escape Hatches & Refs",
        "Server Components (React 19)",
      ],
      duration: "4 weeks",
      level: "Intermediate",
    });
  }

  // LLM Engineering for AI enthusiasts
  if (isAIInterested) {
    paths.push({
      id: "llm-engineering",
      title: "LLM Engineering & RAG Architecture",
      source: "DeepLearning.AI + LangChain",
      modules: [
        "Prompt Engineering Mastery",
        "LangChain Fundamentals",
        "Vector Databases (Pinecone/Weaviate)",
        "RAG Pipeline Construction",
        "AI Agent Development",
      ],
      duration: "5 weeks",
      level: "Advanced",
    });
  }

  // TypeScript for serious developers
  if (!isBeginner) {
    paths.push({
      id: "typescript-deep",
      title: "TypeScript Deep Dive",
      source: "TypeScript Handbook + Matt Pocock",
      modules: [
        "Type System Fundamentals",
        "Generics & Utility Types",
        "Type Guards & Narrowing",
        "Advanced Patterns",
        "Type-Safe API Design",
      ],
      duration: "3 weeks",
      level: "Intermediate",
    });
  }

  // System Design for job seekers
  if (goal.includes("job") || goal.includes("Internship")) {
    paths.push({
      id: "system-design",
      title: "System Design for Interviews",
      source: "Educative + Alex Xu",
      modules: [
        "Scalability Basics",
        "Load Balancing & Caching",
        "Database Sharding",
        "Microservices Architecture",
        "Real-world Case Studies",
      ],
      duration: "4 weeks",
      level: "Advanced",
    });
  }

  return paths.slice(0, 5); // Return max 5 paths
};

const Phase1Foundation = ({ answers }: Phase1FoundationProps) => {
  const { completePhase1 } = usePhase();
  const { resumeData } = useResume();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  const learningPaths = generateLearningPaths(
    answers,
    resumeData?.skills || []
  );

  const togglePath = (pathId: string) => {
    setSelectedPaths((prev) =>
      prev.includes(pathId)
        ? prev.filter((id) => id !== pathId)
        : [...prev, pathId]
    );
  };

  const handleComplete = () => {
    const selected = learningPaths.filter((p) => selectedPaths.includes(p.id));
    completePhase1(learningPaths, selectedPaths);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "text-emerald-500 bg-emerald-500/10";
      case "Intermediate":
        return "text-amber-500 bg-amber-500/10";
      case "Advanced":
        return "text-rose-500 bg-rose-500/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          className="pill-badge mb-4 mx-auto w-fit"
          whileHover={{ scale: 1.02 }}
        >
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Phase 1: The Foundation</span>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient-emerald">Close Your Skill Gaps</span>
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Based on your diagnostic and resume analysis, here are verified
          learning paths to build your foundation. Select at least 2 to proceed.
        </p>
      </motion.div>

      {/* Learning Paths Grid */}
      <div className="space-y-4">
        {learningPaths.map((path, index) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.button
              onClick={() => togglePath(path.id)}
              className={`w-full text-left card-elevated p-5 transition-all ${
                selectedPaths.includes(path.id)
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "hover:border-primary/30"
              }`}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-start gap-4">
                {/* Selection Indicator */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedPaths.includes(path.id)
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {selectedPaths.includes(path.id) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title & Source */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-foreground">{path.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {path.source}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${getLevelColor(
                          path.level
                        )}`}
                      >
                        {path.level}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {path.duration}
                      </span>
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="flex flex-wrap gap-2">
                    {path.modules.map((module, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Selection Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border"
      >
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <span className="text-sm">
            <span className="font-bold text-primary">{selectedPaths.length}</span>
            <span className="text-muted-foreground"> / {learningPaths.length} paths selected</span>
          </span>
        </div>
        {selectedPaths.length < 2 && (
          <span className="text-xs text-amber-500">Select at least 2 to continue</span>
        )}
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleComplete}
            disabled={selectedPaths.length < 2}
            className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 px-8 py-6"
          >
            <Sparkles className="w-5 h-5" />
            Unlock Phase 2: The Forge
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Phase1Foundation;
