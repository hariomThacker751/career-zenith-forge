import { motion } from "framer-motion";
import { FileCheck, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useResume } from "@/contexts/ResumeContext";

const ResumeSyncBadge = () => {
  const { resumeData, clearResume } = useResume();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!resumeData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="card-elevated overflow-hidden">
        {/* Header */}
        <div 
          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary">Resume Synced</p>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {resumeData.fileName}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearResume();
              }}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>
        
        {/* Expanded content */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 pt-2 border-t border-border">
            <div className="space-y-3">
              {/* Skills count */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Skills Detected</span>
                <span className="font-bold text-foreground">{resumeData.skills.length}</span>
              </div>
              
              {/* Experience count */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Experience Entries</span>
                <span className="font-bold text-foreground">{resumeData.experience.length}</span>
              </div>
              
              {/* Projects count */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Projects Found</span>
                <span className="font-bold text-foreground">{resumeData.projects.length}</span>
              </div>
              
              {/* Top skills */}
              {resumeData.skills.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Top Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResumeSyncBadge;
