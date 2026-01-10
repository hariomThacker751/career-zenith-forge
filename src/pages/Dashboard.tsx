import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressDashboard } from "@/components/dashboard/ProgressDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Allow demo mode (no auth redirect) but log the state
    console.log("[Dashboard] Auth state:", { user: user?.email, isLoading });
  }, [user, isLoading]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Initializing Career OS...</p>
        </motion.div>
      </div>
    );
  }

  // Pass userId to ProgressDashboard (null for demo mode)
  return <ProgressDashboard userId={user?.id} />;
};

export default Dashboard;
