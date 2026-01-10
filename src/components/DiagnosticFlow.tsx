import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Orbit, 
  Lightbulb, 
  Layers, 
  Clock, 
  Target,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flame,
  FileCheck,
  Zap,
  AlertTriangle,
  Brain,
  Compass,
  Rocket
} from "lucide-react";
import DiagnosticCard from "./DiagnosticCard";
import AgentPanel from "./AgentPanel";
import ResumeUpload from "./ResumeUpload";
import ManualReconMode from "./ManualReconMode";
import PhaseIndicator from "./PhaseIndicator";
import Phase1Foundation from "./Phase1Foundation";
import Phase2Forge from "./Phase2Forge";
import Phase3Launch from "./Phase3Launch";
import InitialDiscovery from "./InitialDiscovery";
import ExploreQuiz from "./ExploreQuiz";
import CareerResults from "./CareerResults";
import ProjectSelection from "./ProjectSelection";
import LiveReasoningLog, { ReasoningEntry } from "./LiveReasoningLog";
import GamificationPanel from "./GamificationPanel";
import { Button } from "./ui/button";
import { useResume } from "@/contexts/ResumeContext";
import { usePhase } from "@/contexts/PhaseContext";

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

type FlowState = "discovery" | "explore-quiz" | "career-results" | "project-selection" | "resume" | "manual-recon" | "questions" | "analysis" | "phases";
type PathType = "targeted" | "explore";

const DiagnosticFlow = () => {
  const { resumeData } = useResume();
  const { currentPhase, resetPhases, setTargetCareer } = usePhase();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flowState, setFlowState] = useState<FlowState>("discovery");
  const [parseError, setParseError] = useState(false);
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);
  const [reasoningEntries, setReasoningEntries] = useState<ReasoningEntry[]>([]);
  const [isReasoningActive, setIsReasoningActive] = useState(false);
  const [hackwellCredits, setHackwellCredits] = useState(0);
  const [discountTier, setDiscountTier] = useState<"bronze" | "silver" | "gold" | "platinum">("bronze");

  const addReasoningEntry = useCallback((agent: string, thought: string, type: ReasoningEntry["type"]) => {
    const entry: ReasoningEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      agent,
      thought,
      type,
    };
    setReasoningEntries(prev => [...prev, entry]);
  }, []);

  // Store explore quiz answers for career analysis
  const [exploreAnswers, setExploreAnswers] = useState<Record<string, string[]>>({});
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<{ title: string; techStack: string[] } | null>(null);

  const handlePathSelect = (path: PathType) => {
    setSelectedPath(path);
    if (path === "explore") {
      addReasoningEntry("ORCHESTRATOR", "User selected Explore Mode. Launching discovery quiz to map interests to careers...", "decision");
      setFlowState("explore-quiz");
    } else {
      addReasoningEntry("ORCHESTRATOR", "User selected Targeted Path. Initializing profile extraction...", "decision");
      setFlowState("resume");
    }
  };

  const handleExploreQuizComplete = (quizAnswers: Record<string, string[]>) => {
    setExploreAnswers(quizAnswers);
    addReasoningEntry("PROFILER", "Quiz responses captured. Analyzing interest-skill intersection...", "analysis");
    addReasoningEntry("PULSE", "Mapping hobbies and skills to high-demand career paths...", "analysis");
    setFlowState("career-results");
  };

  const handleExploreQuizBack = () => {
    setFlowState("discovery");
    setExploreAnswers({});
  };

  const handleCareerSelect = (career: { title: string; keySkills?: string[] }) => {
    setSelectedCareer(career.title);
    // Store the target career in the phase context for use in generating personalized content
    setTargetCareer(career.title, exploreAnswers);
    addReasoningEntry("ORCHESTRATOR", `Career path locked: ${career.title}. Proceeding to project selection...`, "decision");
    addReasoningEntry("FORGE", `Curating projects tailored for ${career.title}...`, "analysis");
    // Go to project selection (Explore Mode specific flow)
    setFlowState("project-selection");
  };

  const handleCareerResultsBack = () => {
    setFlowState("explore-quiz");
  };

  const handleProjectSelect = (project: { id: string; title: string; techStack: string[]; estimatedWeeks: number }) => {
    setSelectedProject({ title: project.title, techStack: project.techStack });
    addReasoningEntry("ORCHESTRATOR", `Project selected: ${project.title}. Generating resources and weekly roadmap...`, "decision");
    addReasoningEntry("FORGE", `Building ${project.estimatedWeeks}-week execution plan with milestones...`, "action");
    // Skip Phase 1 (skills), go directly to Phase 2 (resources/project) with the selected project context
    // Then Phase 3 will have the weekly planning
    setFlowState("phases");
  };

  const handleProjectSelectionBack = () => {
    setFlowState("career-results");
  };

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
    setFlowState("discovery");
    setParseError(false);
    setSelectedPath(null);
    setReasoningEntries([]);
    setIsReasoningActive(false);
    setExploreAnswers({});
    setSelectedCareer(null);
    resetPhases();
  };

  const handleAnalysisComplete = () => {
    setIsReasoningActive(false);
    addReasoningEntry("ORCHESTRATOR", "Analysis complete. Transitioning to 3-Phase Execution Engine.", "action");
    // Award credits for completing analysis
    setHackwellCredits(prev => prev + 50);
    setFlowState("phases");
  };

  const handleStartDiagnostic = () => {
    addReasoningEntry("PROFILER", "Resume data captured. Beginning diagnostic questionnaire...", "analysis");
    setFlowState("questions");
  };

  const handleManualReconComplete = () => {
    addReasoningEntry("PROFILER", "Manual profile data captured. Proceeding with diagnostic...", "analysis");
    setFlowState("questions");
  };

  const handleTriggerManualRecon = () => {
    setParseError(true);
    setFlowState("manual-recon");
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <section className="relative py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Live Reasoning Log - Always visible during active states */}
        {(flowState === "analysis" || flowState === "questions" || flowState === "phases" || flowState === "career-results") && reasoningEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <LiveReasoningLog 
              entries={reasoningEntries} 
              isActive={isReasoningActive || flowState === "analysis"} 
            />
          </motion.div>
        )}

        {/* Section header - hide for discovery, explore-quiz, and career-results (they have their own headers) */}
        {flowState !== "discovery" && flowState !== "explore-quiz" && flowState !== "career-results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div 
              className="pill-badge mb-4 mx-auto w-fit"
              whileHover={{ scale: 1.02 }}
            >
              {flowState === "resume" && <Zap className="w-4 h-4 text-primary" />}
              {flowState === "questions" && <Sparkles className="w-4 h-4 text-primary" />}
              {flowState === "analysis" && <Brain className="w-4 h-4 text-primary" />}
              {flowState === "manual-recon" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              {flowState === "phases" && <Target className="w-4 h-4 text-primary" />}
              <span>
                {flowState === "resume" && "Step 1: Upload Resume (Optional)"}
                {flowState === "questions" && `${answeredCount}/5 Questions Answered`}
                {flowState === "analysis" && "AI Analysis in Progress"}
                {flowState === "manual-recon" && "Manual Recon Mode"}
                {flowState === "phases" && "Execution Engine Active"}
              </span>
            </motion.div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="text-gradient-sunset">
                {flowState === "resume" && "Accelerate Your Analysis"}
                {flowState === "questions" && "Universal Diagnostic"}
                {flowState === "analysis" && "Analyzing Your Profile"}
                {flowState === "manual-recon" && "Build Your Profile"}
                {flowState === "phases" && "6-Month Execution Plan"}
              </span>
            </h2>
            <p className="text-muted-foreground">
              {flowState === "resume" && "Upload your resume to let our AI agents personalize your roadmap"}
              {flowState === "questions" && "5 critical questions to determine your Career Velocity"}
              {flowState === "analysis" && "Multi-agent system processing your responses..."}
              {flowState === "manual-recon" && "Answer a few questions to unlock your roadmap"}
              {flowState === "phases" && "Foundation → Forge → Launch"}
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {flowState === "discovery" && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <InitialDiscovery onSelectPath={handlePathSelect} />
            </motion.div>
          )}

          {flowState === "explore-quiz" && (
            <motion.div
              key="explore-quiz"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <ExploreQuiz 
                onComplete={handleExploreQuizComplete} 
                onBack={handleExploreQuizBack} 
              />
            </motion.div>
          )}

          {flowState === "project-selection" && (
            <motion.div
              key="project-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <ProjectSelection 
                targetCareer={selectedCareer || ""}
                exploreAnswers={exploreAnswers}
                onSelectProject={handleProjectSelect}
                onBack={handleProjectSelectionBack}
              />
            </motion.div>
          )}

          {flowState === "career-results" && (
            <motion.div
              key="career-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <CareerResults 
                quizAnswers={exploreAnswers}
                onSelectCareer={handleCareerSelect}
                onBack={handleCareerResultsBack}
              />
            </motion.div>
          )}

          {flowState === "resume" && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="space-y-6"
            >
              <ResumeUpload onParseError={handleTriggerManualRecon} />
              
              {/* Resume synced indicator */}
              {resumeData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <FileCheck className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-primary">Resume Intelligence Active</p>
                    <p className="text-xs text-muted-foreground">
                      Agents will use your {resumeData.skills.length} detected skills to personalize recommendations
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-col items-center gap-4 pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleStartDiagnostic}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/25 px-8 py-6 text-base"
                  >
                    <Sparkles className="w-5 h-5" />
                    {resumeData ? "Continue with Resume Intelligence" : "Skip & Start Diagnostic"}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
                
                {!resumeData && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Having trouble with your resume?
                    </p>
                    <Button
                      variant="ghost"
                      onClick={handleTriggerManualRecon}
                      className="text-primary hover:text-primary/80 text-sm gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Enter Details Manually
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {flowState === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Career target badge for Explore Mode users */}
              {selectedCareer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 mb-6 w-fit mx-auto"
                >
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary">Target: {selectedCareer}</span>
                  <Compass className="w-4 h-4 text-primary/60" />
                </motion.div>
              )}

              {/* Resume mini badge if uploaded */}
              {resumeData && !selectedCareer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 mb-6 w-fit mx-auto"
                >
                  <FileCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Resume Synced: {resumeData.fileName}</span>
                </motion.div>
              )}
              
              {/* XP-style Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-medium">
                    Question {currentStep + 1} of {questions.length}
                  </span>
                  <motion.span 
                    key={progress}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-sm text-primary font-bold"
                  >
                    {Math.round(progress)}% Complete
                  </motion.span>
                </div>
                <div className="xp-bar">
                  <motion.div
                    className="xp-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                
                {/* Step indicators */}
                <div className="flex items-center justify-between mt-6">
                  {questions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        index < currentStep
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : index === currentStep
                          ? "bg-gradient-to-br from-primary/20 to-secondary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.08, type: "spring" }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {index < currentStep ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          ✓
                        </motion.div>
                      ) : (
                        index + 1
                      )}
                      {index === currentStep && (
                        <motion.div
                          className="absolute -inset-1 rounded-xl border-2 border-primary/30"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Question card */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -60, scale: 0.95 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.34, 1.56, 0.64, 1],
                    opacity: { duration: 0.3 }
                  }}
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
                  className="text-muted-foreground hover:text-foreground gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleNext}
                    disabled={!answers[currentStep]}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/25 px-6"
                  >
                    {currentStep === questions.length - 1 ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze My Profile
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {flowState === "analysis" && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="card-elevated p-6"
            >
              <AgentPanel answers={answers} onAnalysisComplete={handleAnalysisComplete} />
            </motion.div>
          )}

          {flowState === "manual-recon" && (
            <motion.div
              key="manual-recon"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <ManualReconMode onComplete={handleManualReconComplete} />
            </motion.div>
          )}

          {flowState === "phases" && (
            <motion.div
              key="phases"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="space-y-8"
            >
              <PhaseIndicator />
              
              <AnimatePresence mode="wait">
                {currentPhase === 1 && (
                  <motion.div key="phase1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Phase1Foundation answers={answers} />
                  </motion.div>
                )}
                {currentPhase === 2 && (
                  <motion.div key="phase2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Phase2Forge answers={answers} />
                  </motion.div>
                )}
                {currentPhase === 3 && (
                  <motion.div key="phase3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Phase3Launch answers={answers} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DiagnosticFlow;
