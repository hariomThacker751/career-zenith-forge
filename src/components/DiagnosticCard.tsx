import { motion } from "framer-motion";
import { Check } from "lucide-react";

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
    <div className="glass-card border-glow p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div>
          <span className="text-xs font-mono text-secondary uppercase tracking-wider">
            {subtitle}
          </span>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>
      </div>

      {/* Question */}
      <p className="text-lg text-foreground mb-6">{question}</p>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption === option;
          return (
            <motion.button
              key={option}
              onClick={() => onSelect(option)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center gap-3 group ${
                isSelected
                  ? "bg-primary/10 border-primary text-foreground"
                  : "bg-muted/30 border-border hover:border-primary/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-muted-foreground group-hover:border-primary/50"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className="text-sm md:text-base">{option}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DiagnosticCard;