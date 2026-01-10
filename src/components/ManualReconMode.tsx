import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Code,
  Sparkles,
  GraduationCap,
  FolderGit2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Wand2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useResume, ResumeData } from "@/contexts/ResumeContext";

interface ManualReconModeProps {
  onComplete: () => void;
}

interface ReconStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const reconSteps: ReconStep[] = [
  {
    id: 1,
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Year of Study",
    subtitle: "Academic Position",
  },
  {
    id: 2,
    icon: <Code className="w-5 h-5" />,
    title: "Technical Skills",
    subtitle: "Your Arsenal",
  },
  {
    id: 3,
    icon: <Sparkles className="w-5 h-5" />,
    title: "Top 3 Interests",
    subtitle: "Passion Areas",
  },
  {
    id: 4,
    icon: <FolderGit2 className="w-5 h-5" />,
    title: "Recent Projects",
    subtitle: "Your Portfolio",
  },
];

const yearOptions = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year / Final Year",
  "Graduate / Working",
];

const skillSuggestions = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js",
  "Java", "C++", "SQL", "Git", "Docker", "AWS", "Machine Learning",
  "Data Analysis", "REST APIs", "MongoDB", "PostgreSQL",
];

const interestSuggestions = [
  "AI/Machine Learning", "Web Development", "Mobile Apps",
  "Cloud Computing", "Cybersecurity", "Data Science",
  "DevOps", "Blockchain", "Game Development", "IoT",
];

const ManualReconMode = ({ onComplete }: ManualReconModeProps) => {
  const { setResumeData } = useResume();
  const [currentStep, setCurrentStep] = useState(0);
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [projectInput, setProjectInput] = useState("");

  const handleAddSkill = (skill: string) => {
    if (skill && !skills.includes(skill) && skills.length < 15) {
      setSkills([...skills, skill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleToggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else if (interests.length < 3) {
      setInterests([...interests, interest]);
    }
  };

  const handleAddProject = () => {
    if (projectInput && !projects.includes(projectInput) && projects.length < 5) {
      setProjects([...projects, projectInput]);
      setProjectInput("");
    }
  };

  const handleRemoveProject = (project: string) => {
    setProjects(projects.filter((p) => p !== project));
  };

  const handleNext = () => {
    if (currentStep < reconSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    const reconData: ResumeData = {
      fileName: "Manual Recon",
      fileType: "pdf",
      extractedText: `Year: ${yearOfStudy}, Skills: ${skills.join(", ")}, Interests: ${interests.join(", ")}, Projects: ${projects.join(", ")}`,
      uploadedAt: new Date(),
      skills,
      experience: [yearOfStudy],
      education: [yearOfStudy],
      projects,
    };
    setResumeData(reconData);
    onComplete();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return yearOfStudy !== "";
      case 1:
        return skills.length >= 2;
      case 2:
        return interests.length >= 1;
      case 3:
        return true; // Projects are optional
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / reconSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Recon Mode Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 mb-4"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-semibold">Manual Recon Mode</span>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient-sunset">Let's Build Your Profile</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          Resume parsing failed — no problem! Answer a few questions to unlock your roadmap.
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep + 1} of {reconSteps.length}
          </span>
          <span className="text-primary font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="xp-bar">
          <motion.div
            className="xp-bar-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Glassmorphic Step Card */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="card-elevated p-6 backdrop-blur-xl"
        >
          {/* Step Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
              {reconSteps[currentStep].icon}
            </div>
            <div>
              <h3 className="text-lg font-bold">{reconSteps[currentStep].title}</h3>
              <p className="text-sm text-muted-foreground">
                {reconSteps[currentStep].subtitle}
              </p>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 0 && (
            <div className="grid grid-cols-1 gap-3">
              {yearOptions.map((year) => (
                <motion.button
                  key={year}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setYearOfStudy(year)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    yearOfStudy === year
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="font-medium">{year}</span>
                </motion.button>
              ))}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill(skillInput)}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleAddSkill(skillInput)}
                  disabled={!skillInput}
                  variant="outline"
                >
                  Add
                </Button>
              </div>

              {/* Selected Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  {skills.map((skill) => (
                    <motion.span
                      key={skill}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions
                    .filter((s) => !skills.includes(s))
                    .slice(0, 8)
                    .map((skill) => (
                      <motion.button
                        key={skill}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddSkill(skill)}
                        className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm hover:bg-accent hover:text-foreground transition-colors"
                      >
                        + {skill}
                      </motion.button>
                    ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {skills.length}/15 skills added (minimum 2)
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select up to 3 areas you're most passionate about:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {interestSuggestions.map((interest) => (
                  <motion.button
                    key={interest}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleInterest(interest)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      interests.includes(interest)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    {interests.includes(interest) && "✓ "}
                    {interest}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {interests.length}/3 selected
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe a project you've worked on..."
                  value={projectInput}
                  onChange={(e) => setProjectInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddProject()}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddProject}
                  disabled={!projectInput}
                  variant="outline"
                >
                  Add
                </Button>
              </div>

              {/* Added Projects */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  {projects.map((project, idx) => (
                    <motion.div
                      key={project}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-accent border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-primary" />
                        <span className="text-sm">{project}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveProject(project)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                {projects.length}/5 projects added (optional)
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
          >
            {currentStep === reconSteps.length - 1 ? (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Roadmap
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ManualReconMode;
