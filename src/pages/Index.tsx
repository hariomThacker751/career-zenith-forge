import HeroSection from "@/components/HeroSection";
import DiagnosticFlow from "@/components/DiagnosticFlow";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <main className="relative z-10">
        <HeroSection />
        <DiagnosticFlow />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            <span className="text-gradient-emerald font-semibold">Hackwell</span> — Mentorship-focused, technically rigorous, brutally honest.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;