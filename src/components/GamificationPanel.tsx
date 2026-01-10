import { motion } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Zap, 
  TrendingUp, 
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

export interface CodeReviewResult {
  complexity: number;
  innovation: number;
  marketReadiness: number;
  overallScore: number;
  feedback: string[];
  creditsEarned: number;
  discountTier: "bronze" | "silver" | "gold" | "platinum";
}

interface GamificationPanelProps {
  credits: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  reviewResult?: CodeReviewResult;
  showReview?: boolean;
}

const tierConfig = {
  bronze: {
    label: "Bronze",
    discount: "5%",
    minCredits: 0,
    maxCredits: 499,
    color: "from-amber-700 to-amber-600",
  },
  silver: {
    label: "Silver",
    discount: "10%",
    minCredits: 500,
    maxCredits: 999,
    color: "from-gray-400 to-gray-300",
  },
  gold: {
    label: "Gold",
    discount: "20%",
    minCredits: 1000,
    maxCredits: 2499,
    color: "from-yellow-500 to-amber-400",
  },
  platinum: {
    label: "Platinum",
    discount: "35%",
    minCredits: 2500,
    maxCredits: Infinity,
    color: "from-cyan-400 to-blue-500",
  },
};

const GamificationPanel = ({ 
  credits, 
  tier, 
  reviewResult,
  showReview = false 
}: GamificationPanelProps) => {
  const currentTier = tierConfig[tier];
  const nextTier = tier === "bronze" ? tierConfig.silver 
                 : tier === "silver" ? tierConfig.gold 
                 : tier === "gold" ? tierConfig.platinum 
                 : null;

  const progressToNextTier = nextTier 
    ? Math.min(100, ((credits - currentTier.minCredits) / (nextTier.minCredits - currentTier.minCredits)) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Credits & Tier Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-400/20 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Trophy className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <p className="text-sm text-muted-foreground">Hackwell Credits</p>
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={credits}
                  initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                  animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                  className="text-3xl font-bold"
                >
                  {credits.toLocaleString()}
                </motion.span>
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div className={`tier-badge ${tier}`}>
            <Award className="w-4 h-4" />
            {currentTier.label}
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress to {nextTier.label}
              </span>
              <span className="text-primary font-medium">
                {nextTier.minCredits - credits} credits to go
              </span>
            </div>
            <div className="xp-bar">
              <motion.div
                className="xp-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextTier}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Discount Display */}
        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm">
              <span className="font-bold text-primary">{currentTier.discount}</span>
              {" "}discount on all Hackwell Pro features
            </span>
          </div>
        </div>
      </motion.div>

      {/* Semantic Code Review Results */}
      {showReview && reviewResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="code-review-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Semantic Code Review</h3>
          </div>

          {/* Metrics */}
          <div className="space-y-1 mb-6">
            <MetricRow label="Complexity" value={reviewResult.complexity} />
            <MetricRow label="Innovation" value={reviewResult.innovation} />
            <MetricRow label="Market Readiness" value={reviewResult.marketReadiness} />
          </div>

          {/* Overall Score */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-400/10 border border-primary/20">
            <div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="text-2xl font-bold text-primary">
                {reviewResult.overallScore}/100
              </p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
              className="credits-badge"
            >
              +{reviewResult.creditsEarned} <Zap className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Feedback */}
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Review Feedback:</p>
            {reviewResult.feedback.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start gap-2 text-sm"
              >
                {item.startsWith("✓") || item.includes("excellent") || item.includes("strong") ? (
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-muted-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const MetricRow = ({ label, value }: { label: string; value: number }) => (
  <div className="code-review-metric">
    <span className="text-sm text-foreground">{label}</span>
    <div className="flex items-center gap-3">
      <div className="metric-bar">
        <motion.div
          className="metric-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className="text-sm font-medium text-primary w-8">{value}%</span>
    </div>
  </div>
);

export default GamificationPanel;
