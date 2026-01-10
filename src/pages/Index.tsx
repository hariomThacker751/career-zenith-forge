import HeroSection from "@/components/HeroSection";
import DiagnosticFlow from "@/components/DiagnosticFlow";
import ResumeSyncBadge from "@/components/ResumeSyncBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ResumeProvider } from "@/contexts/ResumeContext";

const Index = () => {
  return (
    <ResumeProvider>
      <div className="min-h-screen bg-background relative transition-colors duration-500">
        {/* Top gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none transition-opacity duration-500" />
        
        {/* Theme Toggle - fixed position top right */}
        <div className="fixed top-4 left-4 z-50">
          <ThemeToggle />
        </div>
        
        {/* Resume Sync Badge - fixed position */}
        <ResumeSyncBadge />
        
        <main className="relative z-10">
          <HeroSection />
          <DiagnosticFlow />
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-8 px-6 border-t border-border/50 transition-colors duration-500">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              <span className="text-gradient-emerald font-semibold">Hackwell</span> — Mentorship-focused, technically rigorous, brutally honest.
            </p>
          </div>
        </footer>
      </div>
    </ResumeProvider>
  );
};

export default Index;
