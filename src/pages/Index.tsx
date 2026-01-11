import { useState } from "react";
import Navbar from "@/components/Navbar";
import LandingHero from "@/components/LandingHero";
import FeaturesSection from "@/components/FeaturesSection";
import RoadmapSection from "@/components/RoadmapSection";
import AboutSection from "@/components/AboutSection";
import DiagnosticFlow from "@/components/DiagnosticFlow";
import ResumeSyncBadge from "@/components/ResumeSyncBadge";
import { ResumeProvider } from "@/contexts/ResumeContext";

const Index = () => {
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const handleGetStarted = () => {
    setShowDiagnostic(true);
    // Scroll to diagnostic section
    setTimeout(() => {
      const diagnosticSection = document.getElementById("diagnostic-section");
      if (diagnosticSection) {
        diagnosticSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <ResumeProvider>
      <div className="min-h-screen bg-background relative transition-colors duration-500">
        {/* Navigation */}
        <Navbar />
        
        {/* Resume Sync Badge - fixed position */}
        <ResumeSyncBadge />
        
        <main className="relative z-10">
          {/* Landing Hero */}
          <LandingHero onGetStarted={handleGetStarted} />
          
          {/* Features Section */}
          <FeaturesSection />
          
          {/* Roadmap Section */}
          <RoadmapSection />
          
          {/* About Section */}
          <AboutSection />
          
          {/* Diagnostic Flow - shown after clicking Get Started */}
          {showDiagnostic && (
            <div id="diagnostic-section">
              <DiagnosticFlow />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-8 px-6 border-t border-border/50 transition-colors duration-500">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent font-semibold">Hackwell</span> — Mentorship-focused, technically rigorous, brutally honest.
            </p>
          </div>
        </footer>
      </div>
    </ResumeProvider>
  );
};

export default Index;
