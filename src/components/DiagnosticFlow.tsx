import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Orbit, 
  Lightbulb, 
  Layers, 
  Clock, 
  Target,
  ChevronRight,
} from "lucide-react";
import DiagnosticCard from "./DiagnosticCard";
import AgentPanel from "./AgentPanel";
import RoadmapView from "./RoadmapView";
import { Button } from "./ui/button";

interface Question {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  question: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    icon: <Orbit className="w-6 h-6" />,
    title: "Current Orbit",
    subtitle: "Academic Position",
    question: "What year of college are you in?",
    options: [
      "1st Year - Fresh start",
      "2nd Year - Building foundations",
      "3rd Year - Specializing",
      "4th Year / Final Year - Job hunting",
      "Graduate / Working professional"
    ]
  },
  {
    id: 2,
    icon: <Lightbulb className="w-6 h-6" />,
    title: "The Curiosity Core",
    subtitle: "Natural Interests",
    question: "If you had to build one thing to change your daily life, what would it be?",
    options: [
      "An AI assistant that understands me",
      "A beautiful web/mobile app",
      "A game or interactive experience",
      "A tool that automates boring tasks",
      "A system that handles massive data",
      "Something in cybersecurity"
    ]
  },
  {
    id: 3,
    icon: <Layers className="w-6 h-6" />,
    title: "The Stack Trace",
    subtitle: "Technical Level",
    question: "What is your current tech level?",
    options: [
      "I just learned what a loop is",
      "I can write basic programs",
      "I'm comfortable with one language",
      "I've built small projects before",
      "I can build full-stack apps with auth"
    ]
  },
  {
    id: 4,
    icon: <Clock className="w-6 h-6" />,
    title: "The Velocity",
    subtitle: "Time Commitment",
    question: "How many hours per week are you willing to dedicate to this Hackwell roadmap?",
    options: [
      "5-10 hours (Steady growth)",
      "10-20 hours (Serious commitment)",
      "20-30 hours (Intensive mode)",
      "30+ hours (Beast mode activated)"
    ]
  },
  {
    id: 5,
    icon: <Target className="w-6 h-6" />,
    title: "The Final Destination",
    subtitle: "Career Goal",
    question: "What's your primary goal?",
    options: [
      "2026 Internship at a top company",
      "High-paying full-time job",
      "Build a 'God-level' project to learn",
      "Start my own tech startup",
      "Transition into tech from another field"
    ]
  }
];

type FlowState = "questions" | "analysis" | "roadmap";

const DiagnosticFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flowState, setFlowState] = useState<FlowState>("questions");

  const handleSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: answer }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setFlowState("analysis");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setFlowState("questions");
  };

  const handleAnalysisComplete = () => {
    setFlowState("roadmap");
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <section className="relative py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            <span className="text-gradient-emerald">
              {flowState === "questions" && "Universal Diagnostic"}
              {flowState === "analysis" && "Analyzing Your Profile"}
              {flowState === "roadmap" && "Your Career Roadmap"}
            </span>
          </h2>
          <p className="text-muted-foreground">
            {flowState === "questions" && "5 critical questions to determine your Career Velocity"}
            {flowState === "analysis" && "Multi-agent system processing your responses..."}
            {flowState === "roadmap" && "Personalized path to career dominance"}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {flowState === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-mono">
                    Question {currentStep + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-primary font-mono">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                
                {/* Step indicators */}
                <div className="flex items-center justify-between mt-4">
                  {questions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono transition-all duration-300 ${
                        index < currentStep
                          ? "bg-primary text-primary-foreground"
                          : index === currentStep
                          ? "bg-primary/20 text-primary border border-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {index + 1}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <DiagnosticCard
                    icon={currentQuestion.icon}
                    title={currentQuestion.title}
                    subtitle={currentQuestion.subtitle}
                    question={currentQuestion.question}
                    options={currentQuestion.options}
                    selectedOption={answers[currentStep]}
                    onSelect={handleSelect}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between mt-8"
              >
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentStep]}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald"
                >
                  {currentStep === questions.length - 1 ? "Analyze" : "Continue"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {flowState === "analysis" && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6"
            >
              <AgentPanel answers={answers} onAnalysisComplete={handleAnalysisComplete} />
            </motion.div>
          )}

          {flowState === "roadmap" && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <RoadmapView answers={answers} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DiagnosticFlow;