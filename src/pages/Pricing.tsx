import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Shield, Code, Lightbulb, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";

const aboutValues = [
  {
    icon: Shield,
    title: "Technically Rigorous",
    description: "We don't cut corners. Our curriculum is built on real industry standards and best practices."
  },
  {
    icon: Code,
    title: "Project-First Approach",
    description: "Theory without practice is meaningless. Build real projects that matter to employers."
  },
  {
    icon: Lightbulb,
    title: "Brutally Honest",
    description: "No false promises. We tell you exactly what it takes to succeed in tech."
  },
  {
    icon: Heart,
    title: "Student-Centered",
    description: "Your goals drive everything. Personalized paths, not one-size-fits-all solutions."
  }
];

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  dropdown: {
    label: string;
    options: string[];
  };
  cta: string;
  highlight?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    description: "Get started with the basics at no cost.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["Basic roadmap", "Community access", "Self-paced learning"],
    dropdown: {
      label: "What's included",
      options: ["Career path overview", "Resource library", "Community forums"],
    },
    cta: "Get Started Free",
  },
  {
    name: "Operator",
    description: "Personalized guidance to accelerate your growth.",
    monthlyPrice: 499,
    annualPrice: 399,
    features: ["Personalized tracking", "Custom roadmaps", "Progress analytics", "Priority support"],
    dropdown: {
      label: "Advanced features",
      options: ["AI-powered insights", "Weekly progress reports", "Skill assessments"],
    },
    cta: "Upgrade to Operator",
    highlight: true,
  },
  {
    name: "Premium",
    description: "Elite experience with guaranteed results.",
    monthlyPrice: 1999,
    annualPrice: 1599,
    features: ["1-to-1 mentorship", "Personalized tracks & roadmaps", "Guaranteed goal achieved", "Direct mentor access"],
    dropdown: {
      label: "Elite benefits",
      options: ["Weekly 1:1 calls", "Career strategy sessions", "Network introductions", "Job placement support"],
    },
    cta: "Go Premium",
  },
];

const Pricing = () => {
  const [annualBilling, setAnnualBilling] = useState<Record<string, boolean>>({
    Free: false,
    Operator: true,
    Premium: true,
  });
  const navigate = useNavigate();

  const toggleBilling = (tierName: string) => {
    setAnnualBilling((prev) => ({
      ...prev,
      [tierName]: !prev[tierName],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Invest in your future. Choose the plan that accelerates your career.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl border p-6 ${
                  tier.highlight
                    ? "border-teal-500/50 bg-card shadow-lg shadow-teal-500/10"
                    : "border-border bg-card"
                }`}
              >
                {/* Tier Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-teal-500">
                      ₹{annualBilling[tier.name] ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  {tier.monthlyPrice > 0 && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={annualBilling[tier.name]}
                        onCheckedChange={() => toggleBilling(tier.name)}
                        className="data-[state=checked]:bg-teal-600"
                      />
                      <span className="text-sm text-muted-foreground">Annual</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  {tier.monthlyPrice === 0 
                    ? "Free forever" 
                    : annualBilling[tier.name] ? "billed annually" : "billed monthly"}
                </p>

                {/* CTA Button */}
                <Button
                  onClick={() => navigate("/auth")}
                  className={`w-full mb-6 font-semibold ${
                    tier.name === "Premium"
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      : tier.name === "Operator"
                      ? "bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600"
                      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  }`}
                >
                  {tier.cta}
                </Button>

                {/* Features */}
                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}

                  {/* Dropdown Feature */}
                  <Select defaultValue={tier.dropdown.options[0]}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder={tier.dropdown.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {tier.dropdown.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ))}
          </div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16"
          >
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4">
                About Hackwell
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Built by developers,{" "}
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  for developers
                </span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hackwell was born from frustration with scattered resources and generic advice. 
                We built the platform we wished existed—one that combines AI-powered personalization 
                with mentorship principles.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aboutValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="p-5 rounded-xl bg-card border border-border/50 hover:border-teal-500/30 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mb-3 group-hover:from-teal-500/30 group-hover:to-emerald-500/30 transition-colors">
                    <value.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
