import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Terminal, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("[Auth] Attempting email auth:", { isLogin, email });

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        console.log("[Auth] Login successful");
        toast.success("Welcome back, Operator!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        console.log("[Auth] Signup successful");
        toast.success("Account created! Initializing your Career OS...");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("[Auth] Error:", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    console.log("[Auth] Initiating Google OAuth");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      console.error("[Auth] Google OAuth error:", error.message);
      toast.error(error.message);
    }
  };

  const handleGitHubAuth = async () => {
    console.log("[Auth] Initiating GitHub OAuth");
    toast.info("GitHub OAuth coming soon - essential for repo evaluation!");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        {/* Floating gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--secondary) / 0.1) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Auth Card with System Boot Animation */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative w-full max-w-md"
      >
        {/* Pulsing emerald border glow */}
        <motion.div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--secondary) / 0.2), hsl(var(--primary) / 0.4))',
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Glassmorphic Card */}
        <div 
          className="relative rounded-2xl p-8 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card) / 0.8) 0%, hsl(var(--card) / 0.6) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid hsl(var(--primary) / 0.3)',
            boxShadow: '0 25px 50px -12px hsl(var(--primary) / 0.15), inset 0 1px 0 hsl(var(--background) / 0.3)',
          }}
        >
          {/* Header with Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Logo */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))',
                boxShadow: '0 8px 32px hsl(var(--primary) / 0.4)',
              }}
              animate={{
                boxShadow: [
                  '0 8px 32px hsl(160 84% 39% / 0.4)',
                  '0 8px 48px hsl(160 84% 39% / 0.6)',
                  '0 8px 32px hsl(160 84% 39% / 0.4)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Terminal className="w-8 h-8 text-primary-foreground" />
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              <span className="text-gradient-emerald">Hackwell</span>
            </h1>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Initialize Your Career OS
            </p>
          </motion.div>

          {/* Social Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-3 mb-6"
          >
            {/* Google Button */}
            <motion.button
              onClick={handleGoogleAuth}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300"
              style={{
                background: 'hsl(0 0% 100%)',
                color: 'hsl(0 0% 15%)',
                boxShadow: '0 2px 8px hsl(0 0% 0% / 0.1)',
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            {/* GitHub Button */}
            <motion.button
              onClick={handleGitHubAuth}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 0 24px hsl(var(--primary) / 0.4)',
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300"
              style={{
                background: 'hsl(215 28% 12%)',
                color: 'hsl(0 0% 95%)',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Essential
              </span>
            </motion.button>
          </motion.div>

          {/* Separator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative my-6"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </motion.div>

          {/* Email Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            onSubmit={handleEmailAuth}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@hackwell.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(175 70% 35%))',
                  boxShadow: '0 4px 16px hsl(var(--primary) / 0.3)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Terminal className="w-5 h-5 mr-2" />
                    {isLogin ? "Access Command Center" : "Initialize Account"}
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Toggle Login/Signup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 text-center"
          >
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {isLogin ? (
                <>
                  New operator? <span className="text-primary font-medium">Create account</span>
                </>
              ) : (
                <>
                  Already initialized? <span className="text-primary font-medium">Sign in</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Boot sequence text animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-xs text-muted-foreground/60 font-mono">
          HACKWELL v1.0 • Career OS • Secure Connection
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
