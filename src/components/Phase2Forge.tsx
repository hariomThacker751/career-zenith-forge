import { useState } from "react";
import { motion } from "framer-motion";
import {
  Hammer,
  Sparkles,
  ChevronRight,
  FileText,
  Target,
  Clock,
  Code2,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { usePhase, ProjectPRD } from "@/contexts/PhaseContext";
import { useResume } from "@/contexts/ResumeContext";

interface Phase2ForgeProps {
  answers: Record<number, string>;
}

const generateProjects = (
  answers: Record<number, string>,
  skills: string[]
): ProjectPRD[] => {
  const interest = answers[1] || "";
  const goal = answers[4] || "";

  const projects: ProjectPRD[] = [];

  if (interest.includes("AI")) {
    projects.push({
      title: "LLM-Powered Legal Document Auditor",
      description:
        "Build an AI system that analyzes legal contracts, identifies risky clauses, and suggests improvements. Uses RAG architecture with a vector database for context retrieval.",
      techStack: ["Python", "LangChain", "Pinecone", "FastAPI", "React", "GPT-4"],
      features: [
        "PDF/DOCX contract upload and parsing",
        "Clause-by-clause risk analysis",
        "Suggested revisions with AI explanations",
        "Comparison with industry-standard templates",
        "Export audit report as PDF",
      ],
      timeline: "4-6 weeks",
      difficulty: "Advanced",
    });

    projects.push({
      title: "Autonomous Web Scraper for Green Energy Credits",
      description:
        "Create an intelligent scraping system that monitors renewable energy credit markets, tracks prices across exchanges, and predicts optimal buying/selling times using ML.",
      techStack: ["Python", "Playwright", "PostgreSQL", "Scikit-learn", "Next.js", "Chart.js"],
      features: [
        "Multi-source data aggregation",
        "Real-time price tracking dashboard",
        "ML-based price prediction model",
        "Alert system for price thresholds",
        "Historical trend analysis",
      ],
      timeline: "5-7 weeks",
      difficulty: "Advanced",
    });
  }

  if (interest.includes("web") || interest.includes("app") || !interest.includes("AI")) {
    projects.push({
      title: "Real-Time Collaborative Code Review Platform",
      description:
        "Build a platform where developers can share code snippets, get real-time feedback, and conduct pair programming sessions with WebRTC-powered video.",
      techStack: ["Next.js 15", "TypeScript", "Supabase", "WebRTC", "Monaco Editor", "Tailwind"],
      features: [
        "Live code sharing with syntax highlighting",
        "Real-time cursor tracking",
        "Video/audio chat integration",
        "Code annotation and commenting",
        "Session recording and playback",
      ],
      timeline: "5-6 weeks",
      difficulty: "Advanced",
    });

    projects.push({
      title: "Developer Portfolio with AI-Generated Case Studies",
      description:
        "A next-gen portfolio site that uses AI to generate detailed case studies from your GitHub repos, complete with architecture diagrams and impact metrics.",
      techStack: ["Next.js 15", "TypeScript", "OpenAI API", "Mermaid.js", "Framer Motion"],
      features: [
        "GitHub integration for repo analysis",
        "AI-generated project descriptions",
        "Auto-generated architecture diagrams",
        "Visitor analytics dashboard",
        "Contact form with smart filtering",
      ],
      timeline: "3-4 weeks",
      difficulty: "Intermediate",
    });
  }

  if (interest.includes("automates") || interest.includes("data")) {
    projects.push({
      title: "Personal Finance AI with Bank Integration",
      description:
        "Build a comprehensive finance tracker that connects to bank accounts via Plaid, categorizes transactions using ML, and provides personalized saving recommendations.",
      techStack: ["React", "Node.js", "Plaid API", "TensorFlow.js", "PostgreSQL", "D3.js"],
      features: [
        "Secure bank account linking",
        "Smart transaction categorization",
        "Spending pattern analysis",
        "Budget recommendations with AI",
        "Investment tracking dashboard",
      ],
      timeline: "6-8 weeks",
      difficulty: "Advanced",
    });
  }

  // Fallback project
  if (projects.length < 2) {
    projects.push({
      title: "Full-Stack SaaS Starter with Payments",
      description:
        "Create a production-ready SaaS boilerplate with authentication, team management, Stripe subscriptions, and a beautiful landing page.",
      techStack: ["Next.js 15", "Supabase", "Stripe", "Tailwind", "Resend", "Vercel"],
      features: [
        "Email/social authentication",
        "Team invitations and roles",
        "Stripe subscription handling",
        "Usage-based billing support",
        "Admin dashboard",
      ],
      timeline: "4-5 weeks",
      difficulty: "Intermediate",
    });
  }

  return projects.slice(0, 3);
};

const Phase2Forge = ({ answers }: Phase2ForgeProps) => {
  const { completePhase2 } = usePhase();
  const { resumeData } = useResume();
  const [selectedProject, setSelectedProject] = useState<ProjectPRD | null>(null);
  const [showPRD, setShowPRD] = useState(false);

  const projects = generateProjects(answers, resumeData?.skills || []);

  const handleSelectProject = (project: ProjectPRD) => {
    setSelectedProject(project);
    setShowPRD(true);
  };

  const handleApprove = () => {
    if (selectedProject) {
      completePhase2(selectedProject);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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
          <Hammer className="w-4 h-4 text-primary" />
          <span>Phase 2: The Forge</span>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient-sunset">Build Your Industry Project</span>
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          No "Todo Apps" here. Choose a 2026-relevant project that showcases real
          engineering skills and solves actual problems.
        </p>
      </motion.div>

      {!showPRD ? (
        <>
          {/* Project Options */}
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <motion.button
                  onClick={() => handleSelectProject(project)}
                  className="w-full text-left card-elevated p-6 hover:border-primary/50 transition-all group"
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${getDifficultyColor(
                            project.difficulty
                          )}`}
                        >
                          {project.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {project.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.timeline}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {project.features.length} features
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        /* PRD View */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elevated p-6 space-y-6"
        >
          {/* PRD Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Product Requirement Document
              </p>
              <h3 className="text-xl font-bold">{selectedProject?.title}</h3>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Project Overview
            </h4>
            <p className="text-muted-foreground">{selectedProject?.description}</p>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              Technology Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedProject?.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Core Features
            </h4>
            <div className="space-y-2">
              {selectedProject?.features.map((feature, idx) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              <p className="font-bold">Estimated Timeline</p>
              <p className="text-sm text-muted-foreground">{selectedProject?.timeline}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setShowPRD(false)}>
              ← Back to Projects
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleApprove}
                className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
              >
                <Sparkles className="w-4 h-4" />
                Approve & Unlock Phase 3
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Phase2Forge;
