import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

interface DiagnosticCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  question: string;
  options: string[];
  selectedOption?: string;
  onSelect: (option: string) => void;
}

const DiagnosticCard = ({
  icon,
  title,
  subtitle,
  question,
  options,
  selectedOption,
  onSelect,
}: DiagnosticCardProps) => {
  return (
    <div className="card-elevated p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <motion.div 
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary flex-shrink-0 border border-primary/10"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {icon}
        </motion.div>
        <div>
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {subtitle}
          </span>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>
      </div>

      {/* Question */}
      <p className="text-lg text-foreground mb-6 font-medium">{question}</p>

      {/* Options with enhanced interactivity */}
      <div className="space-y-3">
      {options.map((option, index) => {
          const isSelected = selectedOption === option;
          return (
            <motion.button
              key={option}
              onClick={() => onSelect(option)}
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.08, 
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              whileHover={{ x: 8, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className={`option-card w-full text-left flex items-center gap-4 group ${
                isSelected ? "selected" : ""
              }`}
            >
              {/* Radio indicator */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30 group-hover:border-primary/50"
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
              </div>
              
              {/* Option text */}
              <span className={`text-sm md:text-base transition-colors ${
                isSelected ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
              }`}>
                {option}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-auto"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DiagnosticCard;
