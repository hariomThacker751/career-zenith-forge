import React, { createContext, useContext, useState, ReactNode } from "react";

export interface LearningPath {
  id: string;
  title: string;
  source: string;
  modules: string[];
  duration: string;
  level: string;
}

export interface ProjectPRD {
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  timeline: string;
  difficulty: string;
}

export interface SprintEvent {
  day: number;
  title: string;
  description: string;
  duration: string;
  type: "design" | "coding" | "testing" | "review";
}

export interface AgentInsights {
  profiler: string;
  pulse: string;
  forge: string;
  gatekeeper: string;
}

export interface PhaseData {
  agentInsights: AgentInsights | null;
  phase1: {
    completed: boolean;
    learningPaths: LearningPath[];
    selectedPaths: string[];
  };
  phase2: {
    completed: boolean;
    project: ProjectPRD | null;
    approved: boolean;
  };
  phase3: {
    completed: boolean;
    schedule: SprintEvent[];
    submissionUrl: string | null;
    submitted: boolean;
  };
}

interface PhaseContextType {
  currentPhase: 1 | 2 | 3;
  phaseData: PhaseData;
  setCurrentPhase: (phase: 1 | 2 | 3) => void;
  setAgentInsights: (insights: AgentInsights) => void;
  completePhase1: (paths: LearningPath[], selected: string[]) => void;
  completePhase2: (project: ProjectPRD) => void;
  completePhase3: (url: string) => void;
  resetPhases: () => void;
  isPhaseUnlocked: (phase: 1 | 2 | 3) => boolean;
}

const initialPhaseData: PhaseData = {
  agentInsights: null,
  phase1: {
    completed: false,
    learningPaths: [],
    selectedPaths: [],
  },
  phase2: {
    completed: false,
    project: null,
    approved: false,
  },
  phase3: {
    completed: false,
    schedule: [],
    submissionUrl: null,
    submitted: false,
  },
};

const PhaseContext = createContext<PhaseContextType | undefined>(undefined);

export const PhaseProvider = ({ children }: { children: ReactNode }) => {
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);
  const [phaseData, setPhaseData] = useState<PhaseData>(initialPhaseData);

  const setAgentInsights = (insights: AgentInsights) => {
    setPhaseData(prev => ({
      ...prev,
      agentInsights: insights,
    }));
  };

  const completePhase1 = (paths: LearningPath[], selected: string[]) => {
    setPhaseData(prev => ({
      ...prev,
      phase1: {
        completed: true,
        learningPaths: paths,
        selectedPaths: selected,
      },
    }));
    setCurrentPhase(2);
  };

  const completePhase2 = (project: ProjectPRD) => {
    setPhaseData(prev => ({
      ...prev,
      phase2: {
        completed: true,
        project,
        approved: true,
      },
    }));
    setCurrentPhase(3);
  };

  const completePhase3 = (url: string) => {
    setPhaseData(prev => ({
      ...prev,
      phase3: {
        ...prev.phase3,
        completed: true,
        submissionUrl: url,
        submitted: true,
      },
    }));
  };

  const resetPhases = () => {
    setCurrentPhase(1);
    setPhaseData(initialPhaseData);
  };

  const isPhaseUnlocked = (phase: 1 | 2 | 3): boolean => {
    if (phase === 1) return true;
    if (phase === 2) return phaseData.phase1.completed;
    if (phase === 3) return phaseData.phase2.completed;
    return false;
  };

  return (
    <PhaseContext.Provider
      value={{
        currentPhase,
        phaseData,
        setCurrentPhase,
        setAgentInsights,
        completePhase1,
        completePhase2,
        completePhase3,
        resetPhases,
        isPhaseUnlocked,
      }}
    >
      {children}
    </PhaseContext.Provider>
  );
};

export const usePhase = () => {
  const context = useContext(PhaseContext);
  if (!context) {
    throw new Error("usePhase must be used within a PhaseProvider");
  }
  return context;
};
