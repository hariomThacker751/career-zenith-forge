import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Calendar,
  Clock,
  Code2,
  TestTube,
  FileCheck,
  Send,
  CheckCircle2,
  Copy,
  ExternalLink,
  PartyPopper,
  Github,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePhase, SprintEvent } from "@/contexts/PhaseContext";
import { toast } from "sonner";

const generateSprintSchedule = (): SprintEvent[] => {
  return [
    {
      day: 1,
      title: "Architecture & Design",
      description: "Define system architecture, create database schema, set up project structure",
      duration: "4 hours",
      type: "design",
    },
    {
      day: 2,
      title: "Core Backend Setup",
      description: "Set up API routes, authentication, and database connections",
      duration: "5 hours",
      type: "coding",
    },
    {
      day: 3,
      title: "Feature Development - Part 1",
      description: "Implement primary features and core business logic",
      duration: "6 hours",
      type: "coding",
    },
    {
      day: 4,
      title: "Feature Development - Part 2",
      description: "Complete remaining features, integrate external APIs",
      duration: "6 hours",
      type: "coding",
    },
    {
      day: 5,
      title: "Frontend Polish & UX",
      description: "Refine UI components, add animations, improve accessibility",
      duration: "5 hours",
      type: "coding",
    },
    {
      day: 6,
      title: "Testing & Bug Fixes",
      description: "Write tests, fix bugs, handle edge cases",
      duration: "5 hours",
      type: "testing",
    },
    {
      day: 7,
      title: "Final Review & Deployment",
      description: "Code review, documentation, deploy to production",
      duration: "4 hours",
      type: "review",
    },
  ];
};

const Phase3Launch = () => {
  const { phaseData, completePhase3 } = usePhase();
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const schedule = generateSprintSchedule();
  const project = phaseData.phase2.project;

  const getTypeIcon = (type: SprintEvent["type"]) => {
    switch (type) {
      case "design":
        return <FileCheck className="w-4 h-4" />;
      case "coding":
        return <Code2 className="w-4 h-4" />;
      case "testing":
        return <TestTube className="w-4 h-4" />;
      case "review":
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: SprintEvent["type"]) => {
    switch (type) {
      case "design":
        return "bg-violet-500/10 text-violet-500 border-violet-500/20";
      case "coding":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "testing":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "review":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  // Generate Google Calendar API compatible JSON
  const generateCalendarJson = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start tomorrow

    const events = schedule.map((event, index) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + index);

      return {
        summary: `[Hackwell] ${event.title}`,
        description: `${event.description}\n\nProject: ${project?.title}\nDuration: ${event.duration}`,
        start: {
          dateTime: `${eventDate.toISOString().split("T")[0]}T09:00:00`,
          timeZone: "America/New_York",
        },
        end: {
          dateTime: `${eventDate.toISOString().split("T")[0]}T${
            9 + parseInt(event.duration)
          }:00:00`,
          timeZone: "America/New_York",
        },
        colorId: event.type === "coding" ? "1" : event.type === "design" ? "3" : "5",
      };
    });

    return JSON.stringify(events, null, 2);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(generateCalendarJson());
    setCopiedJson(true);
    toast.success("Sprint schedule copied to clipboard!");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleSubmit = () => {
    if (!submissionUrl) {
      toast.error("Please enter your project URL");
      return;
    }

    completePhase3(submissionUrl);
    setIsSubmitted(true);
    toast.success("Project submitted successfully! 🎉");
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
          <Rocket className="w-4 h-4 text-primary" />
          <span>Phase 3: The Launch</span>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient-indigo">Schedule & Ship</span>
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Your 7-day sprint schedule is ready. Follow the plan, build the project,
          and submit your work.
        </p>
      </motion.div>

      {/* Project Summary */}
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-wider">
                Your Project
              </p>
              <p className="font-bold">{project.title}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sprint Schedule */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card-elevated p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            7-Day Sprint Schedule
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            className="gap-2"
          >
            {copiedJson ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copiedJson ? "Copied!" : "Copy JSON"}
          </Button>
        </div>

        <div className="space-y-3">
          {schedule.map((event, index) => (
            <motion.div
              key={event.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`flex items-start gap-4 p-4 rounded-xl border ${getTypeColor(
                event.type
              )}`}
            >
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-sm">
                D{event.day}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getTypeIcon(event.type)}
                  <span className="font-bold">{event.title}</span>
                </div>
                <p className="text-sm opacity-80">{event.description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium opacity-70">
                <Clock className="w-3 h-3" />
                {event.duration}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* JSON Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card-elevated p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-bold text-muted-foreground">
            Google Calendar API Format (JSON)
          </span>
        </div>
        <pre className="p-4 rounded-lg bg-muted/50 overflow-x-auto text-xs font-mono text-muted-foreground max-h-40">
          {generateCalendarJson().slice(0, 500)}...
        </pre>
      </motion.div>

      {/* Submission Portal */}
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card-elevated p-6 space-y-4"
          >
            <h3 className="font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Submit Your Project
            </h3>
            <p className="text-sm text-muted-foreground">
              Once you've completed your project, submit the GitHub repository or
              deployed URL below.
            </p>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="https://github.com/username/project"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSubmit}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                >
                  <Rocket className="w-4 h-4" />
                  Submit
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-elevated p-8 text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center"
            >
              <PartyPopper className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold">
              <span className="text-gradient-emerald">Mission Complete!</span>
            </h3>
            <p className="text-muted-foreground">
              Your project has been submitted. You've completed all 3 phases of the
              Hackwell Career Execution Engine.
            </p>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 inline-flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm">{submissionUrl}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Phase3Launch;
