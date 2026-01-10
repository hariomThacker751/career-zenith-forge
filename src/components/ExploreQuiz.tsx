import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Gauge, 
  Zap, 
  Clock, 
  Lightbulb,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Brain
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ExploreQuestion {
  id: string;
  category: string;
  question: string;
  icon: React.ReactNode;
  options?: {
    label: string;
    value: string;
  }[];
  isOpenEnded?: boolean;
  placeholder?: string;
}

// Hard-locked 5 questions - ONLY for Explore Mode
const exploreQuestions: ExploreQuestion[] = [
  {
    id: "academic_position",
    category: "Academic Position",
    question: "Where are you in your journey right now?",
    icon: <GraduationCap className="w-6 h-6" />,
    options: [
      { label: "1st Year Student", value: "1st_year" },
      { label: "2nd Year Student", value: "2nd_year" },
      { label: "3rd Year Student", value: "3rd_year" },
      { label: "4th Year / Final Year", value: "4th_year" },
      { label: "Recent Graduate", value: "graduate" },
      { label: "Working Professional", value: "professional" },
    ]
  },
  {
    id: "skill_level",
    category: "Self-Assessment",
    question: "How would you rate your current technical skill level?",
    icon: <Gauge className="w-6 h-6" />,
    options: [
      { label: "Beginner — Just starting out, learning basics", value: "beginner" },
      { label: "Intermediate — Built some projects, comfortable coding", value: "intermediate" },
      { label: "Advanced — Deep expertise, production experience", value: "advanced" },
    ]
  },
  {
    id: "work_energy",
    category: "Work Style",
    question: "What type of work energizes you the most?",
    icon: <Zap className="w-6 h-6" />,
    options: [
      { label: "Logic & Problem-Solving", value: "logic" },
      { label: "Visuals & Design", value: "visuals" },
      { label: "Building Systems & Infrastructure", value: "systems" },
      { label: "Automation & Efficiency", value: "automation" },
      { label: "Working with People & Communication", value: "people" },
      { label: "Creative Expression & Innovation", value: "creativity" },
    ]
  },
  {
    id: "constraints",
    category: "Real Constraints",
    question: "What real constraints are you facing right now?",
    icon: <Clock className="w-6 h-6" />,
    options: [
      { label: "Limited time (< 10 hrs/week available)", value: "limited_time" },
      { label: "Urgency — Need results in 3-6 months", value: "urgency" },
      { label: "Financial pressure — Need income soon", value: "financial" },
      { label: "No major constraints — Flexible timeline", value: "flexible" },
    ]
  },
  {
    id: "build_idea",
    category: "Your Vision",
    question: "If you had to build one thing to improve your daily life, what would it be?",
    icon: <Lightbulb className="w-6 h-6" />,
    isOpenEnded: true,
    placeholder: "Describe something you'd love to build... (e.g., an app that tracks my habits, a tool that automates my email responses, a game that helps me learn...)"
  }
];

interface ExploreQuizProps {
  onComplete: (answers: Record<string, string[]>) => void;
  onBack: () => void;
}

const ExploreQuiz = ({ onComplete, onBack }: ExploreQuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [openEndedText, setOpenEndedText] = useState("");
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
    }, 25);
    return () => clearInterval(interval);
  }, [currentStep, currentQuestion.question]);

  const selectOption = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: [value] });
  };

  const isSelected = (value: string) => {
    return (answers[currentQuestion.id] || []).includes(value);
  };

  const canProceed = () => {
    if (currentQuestion.isOpenEnded) {
      return openEndedText.trim().length >= 10;
    }
    return (answers[currentQuestion.id] || []).length > 0;
  };

  const handleNext = () => {
    // Save open-ended answer before proceeding
    if (currentQuestion.isOpenEnded && openEndedText.trim()) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: [openEndedText.trim()] }));
    }

    if (currentStep < exploreQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Include the open-ended answer in final submission
      const finalAnswers = currentQuestion.isOpenEnded 
        ? { ...answers, [currentQuestion.id]: [openEndedText.trim()] }
        : answers;
      onComplete(finalAnswers);
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
          <Brain className="w-4 h-4 text-primary" />
          <span>Explore Mode • Career Discovery</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-gradient-sunset">Building Your Career Profile</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          5 essential questions to predict your perfect career path
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

      {/* Question Card */}
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

          {/* Options or Open-ended input */}
          {currentQuestion.isOpenEnded ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Textarea
                value={openEndedText}
                onChange={(e) => setOpenEndedText(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="min-h-[150px] text-base bg-card/50 border-border/50 focus:border-primary/50 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {openEndedText.length < 10 
                  ? `Minimum 10 characters (${10 - openEndedText.length} more needed)`
                  : "✓ Great! Your response will help us find the perfect career match"
                }
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-3">
              {currentQuestion.options?.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  onClick={() => selectOption(option.value)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                    isSelected(option.value)
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected(option.value) 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/50"
                    }`}>
                      {isSelected(option.value) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </div>
                    <span className={`font-medium ${
                      isSelected(option.value) ? "text-primary" : "text-foreground"
                    }`}>
                      {option.label}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
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
          disabled={!canProceed()}
          className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 px-8"
        >
          {currentStep === exploreQuestions.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4" />
              Predict My Career
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
