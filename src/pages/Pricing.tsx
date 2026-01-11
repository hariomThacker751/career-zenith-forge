import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
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
    name: "Student",
    description: "For ambitious students building foundational skills.",
    monthlyPrice: 12,
    annualPrice: 9,
    features: ["Basic roadmaps", "Community access"],
    dropdown: {
      label: "Limited project feedback",
      options: ["2 projects/month", "Basic AI review", "Community support"],
    },
    cta: "Start your journey",
  },
  {
    name: "Professional",
    description: "For early-career professionals seeking rapid growth.",
    monthlyPrice: 39,
    annualPrice: 29,
    features: ["Personalized roadmaps", "Priority project review"],
    dropdown: {
      label: "Interview prep resources",
      options: ["Mock interviews", "Resume review", "LinkedIn optimization"],
    },
    cta: "Accelerate your growth",
    highlight: true,
  },
  {
    name: "Mentorship",
    description: "For those committed to achieving their dream role.",
    monthlyPrice: 129,
    annualPrice: 99,
    features: ["1-on-1 mentorship", "Unlimited project feedback"],
    dropdown: {
      label: "Career strategy sessions",
      options: ["Weekly calls", "Goal setting", "Network introductions"],
    },
    cta: "Achieve your dream role",
  },
];

const Pricing = () => {
  const [annualBilling, setAnnualBilling] = useState<Record<string, boolean>>({
    Student: true,
    Professional: true,
    Mentorship: true,
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
                      €{annualBilling[tier.name] ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={annualBilling[tier.name]}
                      onCheckedChange={() => toggleBilling(tier.name)}
                      className="data-[state=checked]:bg-teal-600"
                    />
                    <span className="text-sm text-muted-foreground">Annual</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  {annualBilling[tier.name] ? "billed annually" : "billed monthly"}
                </p>

                {/* CTA Button */}
                <Button
                  onClick={() => navigate("/auth")}
                  className={`w-full mb-6 font-semibold ${
                    tier.name === "Mentorship"
                      ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                      : "bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600"
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

          {/* University/Bootcamp Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                University / Bootcamp
              </p>
              <h3 className="text-2xl font-bold text-foreground">Custom</h3>
            </div>
            <Button
              variant="outline"
              className="border-teal-500 text-teal-500 hover:bg-teal-500/10"
            >
              Partner with us
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
