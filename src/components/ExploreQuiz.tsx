import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  Palette, 
  Brain, 
  PenTool, 
  Globe, 
  Banknote,
  Server,
  Code,
  Calculator,
  Sparkles,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Zap
} from "lucide-react";
import { Button } from "./ui/button";

interface ExploreQuestion {
  id: string;
  category: string;
  question: string;
  icon: React.ReactNode;
  options: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
  multiSelect?: boolean;
}

const exploreQuestions: ExploreQuestion[] = [
  {
    id: "hobbies",
    category: "Your Hobbies",
    question: "What do you enjoy doing in your free time?",
    icon: <Gamepad2 className="w-6 h-6" />,
    multiSelect: true,
    options: [
      { label: "Gaming", value: "gaming", icon: <Gamepad2 className="w-5 h-5" /> },
      { label: "Art & Design", value: "art", icon: <Palette className="w-5 h-5" /> },
      { label: "Problem-solving & Puzzles", value: "problem-solving", icon: <Brain className="w-5 h-5" /> },
      { label: "Writing & Storytelling", value: "writing", icon: <PenTool className="w-5 h-5" /> },
    ]
  },
  {
    id: "interests",
    category: "Core Interests",
    question: "What area excites you the most?",
    icon: <Globe className="w-6 h-6" />,
    multiSelect: true,
    options: [
      { label: "Social Impact", value: "social-impact", icon: <Globe className="w-5 h-5" /> },
      { label: "FinTech & Finance", value: "fintech", icon: <Banknote className="w-5 h-5" /> },
      { label: "High-Performance Systems", value: "systems", icon: <Server className="w-5 h-5" /> },
      { label: "AI & Automation", value: "ai", icon: <Brain className="w-5 h-5" /> },
    ]
  },
  {
    id: "skills",
    category: "Basic Skills",
    question: "What skills do you already have?",
    icon: <Code className="w-6 h-6" />,
    multiSelect: true,
    options: [
      { label: "Coding Languages", value: "coding", icon: <Code className="w-5 h-5" /> },
      { label: "Excel & Data", value: "excel", icon: <Calculator className="w-5 h-5" /> },
      { label: "Design & UI/UX", value: "design", icon: <Palette className="w-5 h-5" /> },
      { label: "Math & Logic", value: "math", icon: <Brain className="w-5 h-5" /> },
    ]
  },
  {
    id: "branch",
    category: "Branch / Major",
    question: "What's your field of study?",
    icon: <GraduationCap className="w-6 h-6" />,
    multiSelect: false,
    options: [
      { label: "Computer Science / IT", value: "cs", icon: <Code className="w-5 h-5" /> },
      { label: "Engineering (Non-CS)", value: "engineering", icon: <Server className="w-5 h-5" /> },
      { label: "Business / Commerce", value: "business", icon: <Banknote className="w-5 h-5" /> },
      { label: "Arts / Humanities", value: "arts", icon: <Palette className="w-5 h-5" /> },
    ]
  },
  {
    id: "year",
    category: "Current Year",
    question: "What year are you in?",
    icon: <GraduationCap className="w-6 h-6" />,
    multiSelect: false,
    options: [
      { label: "1st Year", value: "1st", icon: <Sparkles className="w-5 h-5" /> },
      { label: "2nd Year", value: "2nd", icon: <Sparkles className="w-5 h-5" /> },
      { label: "3rd Year", value: "3rd", icon: <Sparkles className="w-5 h-5" /> },
      { label: "4th Year / Final", value: "4th", icon: <GraduationCap className="w-5 h-5" /> },
    ]
  }
];

interface ExploreQuizProps {
  onComplete: (answers: Record<string, string[]>) => void;
  onBack: () => void;
}

const ExploreQuiz = ({ onComplete, onBack }: ExploreQuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [displayedText, setDisplayedText] = useState("");
  
  const currentQuestion = exploreQuestions[currentStep];
  const progress = ((currentStep + 1) / exploreQuestions.length) * 100;

  // Typewriter effect for question
  useEffect(() => {
    setDisplayedText("");
    let index = 0;
    const text = currentQuestion.question;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [currentStep, currentQuestion.question]);

  const toggleOption = (value: string) => {
    const current = answers[currentQuestion.id] || [];
    if (currentQuestion.multiSelect) {
      if (current.includes(value)) {
        setAnswers({ ...answers, [currentQuestion.id]: current.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [currentQuestion.id]: [...current, value] });
      }
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: [value] });
    }
  };

  const isSelected = (value: string) => {
    return (answers[currentQuestion.id] || []).includes(value);
  };

  const canProceed = (answers[currentQuestion.id] || []).length > 0;

  const handleNext = () => {
    if (currentStep < exploreQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="pill-badge mb-4 mx-auto w-fit">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Explore Mode • Discovery Quiz</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-gradient-sunset">Let's Find Your Path</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          {currentQuestion.multiSelect ? "Select all that apply" : "Choose one option"}
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium">
            {currentQuestion.category}
          </span>
          <span className="text-sm text-primary font-bold">
            {currentStep + 1}/{exploreQuestions.length}
          </span>
        </div>
        <div className="xp-bar">
          <motion.div
            className="xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question Card - Floating Card Style */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 50, rotateX: -10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -50, rotateX: 10 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.34, 1.56, 0.64, 1]
          }}
          className="glass-card p-8 mb-8"
        >
          {/* Question icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto emerald-glow-border"
          >
            <span className="text-primary">{currentQuestion.icon}</span>
          </motion.div>

          {/* Typewriter question */}
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 min-h-[3rem]">
            {displayedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-6 bg-primary ml-1 align-middle"
            />
          </h3>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => toggleOption(option.value)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                  isSelected(option.value)
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isSelected(option.value) 
                      ? "bg-primary text-white" 
                      : "bg-muted text-muted-foreground group-hover:text-primary"
                  }`}>
                    {option.icon}
                  </div>
                  <span className={`font-medium ${
                    isSelected(option.value) ? "text-primary" : "text-foreground"
                  }`}>
                    {option.label}
                  </span>
                </div>
                
                {/* Selection indicator */}
                {isSelected(option.value) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between"
      >
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 px-8"
        >
          {currentStep === exploreQuestions.length - 1 ? (
            <>
              <Zap className="w-4 h-4" />
              Analyze My Profile
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {exploreQuestions.map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep
                ? "w-8 bg-primary"
                : index < currentStep
                ? "bg-primary/50"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ExploreQuiz;
