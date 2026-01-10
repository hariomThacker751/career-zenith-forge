import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ResumeData {
  fileName: string;
  fileType: "pdf" | "docx";
  extractedText: string;
  uploadedAt: Date;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
}

interface ResumeContextType {
  resumeData: ResumeData | null;
  isUploading: boolean;
  uploadProgress: number;
  isParsing: boolean;
  setResumeData: (data: ResumeData | null) => void;
  setIsUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setIsParsing: (parsing: boolean) => void;
  clearResume: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);

  const clearResume = () => {
    setResumeData(null);
    setUploadProgress(0);
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        isUploading,
        uploadProgress,
        isParsing,
        setResumeData,
        setIsUploading,
        setUploadProgress,
        setIsParsing,
        clearResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
};
