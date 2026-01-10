import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  FileText, 
  Check, 
  X, 
  Loader2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { useResume } from "@/contexts/ResumeContext";
import { parseResume } from "@/lib/resumeParser";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
  variant?: "hero" | "compact";
  className?: string;
  onParseError?: () => void;
}

const ResumeUpload = ({ variant = "hero", className, onParseError }: ResumeUploadProps) => {
  const { 
    resumeData, 
    isUploading, 
    uploadProgress, 
    isParsing,
    setResumeData, 
    setIsUploading, 
    setUploadProgress,
    setIsParsing,
    clearResume 
  } = useResume();
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const validExtensions = [".pdf", ".docx"];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidType && !hasValidExtension) {
      setError("Please upload a PDF or DOCX file");
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size must be less than 10MB");
      return false;
    }
    
    return true;
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    if (!validateFile(file)) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress >= 90) {
        clearInterval(progressInterval);
        setUploadProgress(90);
      } else {
        setUploadProgress(progress);
      }
    }, 100);
    
    try {
      setIsParsing(true);
      const parsed = await parseResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setResumeData({
        fileName: file.name,
        fileType: file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx",
        extractedText: parsed.text,
        uploadedAt: new Date(),
        skills: parsed.skills,
        experience: parsed.experience,
        education: parsed.education,
        projects: parsed.projects,
      });
      
    } catch (err) {
      console.error("Error parsing resume:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to parse resume.";
      setError(`${errorMessage} Try Manual Mode instead.`);
      clearResume();
      // Notify parent about parse error for Manual Recon Mode
      onParseError?.();
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  }, [setResumeData, setIsUploading, setUploadProgress, setIsParsing, clearResume]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Compact variant for sidebar/dashboard
  if (variant === "compact" && resumeData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl bg-accent border border-primary/20",
          className
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Check className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary">Resume Synced</p>
          <p className="text-xs text-muted-foreground truncate">{resumeData.fileName}</p>
        </div>
        <button
          onClick={clearResume}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </motion.div>
    );
  }

  // Already uploaded state
  if (resumeData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("card-elevated p-6", className)}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Check className="w-7 h-7 text-primary" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-primary">Resume Synced</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{resumeData.fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {resumeData.skills.length} skills detected • {resumeData.experience.length} experiences found
            </p>
          </div>
          <button
            onClick={clearResume}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        
        {/* Detected skills preview */}
        {resumeData.skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Detected Skills</p>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {skill}
                </span>
              ))}
              {resumeData.skills.length > 8 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  +{resumeData.skills.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Upload/parsing state
  if (isUploading || isParsing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("card-elevated p-8 text-center", className)}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center"
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
        <h3 className="text-lg font-bold text-foreground mb-2">
          {isParsing ? "Parsing Resume..." : "Uploading..."}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isParsing 
            ? "Extracting skills, experience, and projects" 
            : "Securely uploading your resume"
          }
        </p>
        
        {/* Progress bar */}
        <div className="xp-bar max-w-xs mx-auto">
          <motion.div
            className="xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{uploadProgress}%</p>
      </motion.div>
    );
  }

  // Default upload zone
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative", className)}
    >
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "card-elevated p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group",
          isDragOver && "border-primary bg-accent scale-[1.02]",
          "hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          className="sr-only"
        />
        
        <motion.div
          animate={isDragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow"
        >
          <UploadCloud className="w-8 h-8 text-primary" />
        </motion.div>
        
        <h3 className="text-lg font-bold text-foreground mb-1">
          {isDragOver ? "Drop your resume here" : "Upload Your Resume"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Drag & drop or click to browse
        </p>
        
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">PDF or DOCX (max 10MB)</span>
        </div>
        
        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={isDragOver ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            boxShadow: "0 0 40px hsl(158 64% 42% / 0.2), inset 0 0 20px hsl(158 64% 42% / 0.05)"
          }}
        />
      </label>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 rounded hover:bg-destructive/10"
            >
              <X className="w-4 h-4 text-destructive" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResumeUpload;
