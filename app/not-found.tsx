import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Abstract Glowing Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Animated Icon Container */}
        <div className="relative inline-flex items-center justify-center p-5 bg-muted/40 border border-border/60 rounded-2xl mb-8 shadow-2xl backdrop-blur-sm group hover:border-border transition-colors">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <Compass className="w-12 h-12 text-muted-foreground group-hover:text-foreground transition-colors duration-500" />
        </div>
        
        {/* Giant 404 Typography */}
        <h1 className="text-[7rem] sm:text-[12rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground/30 opacity-90 mb-4 select-none">
          404
        </h1>
        
        {/* Subtitles */}
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-4">
          Off the grid.
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto mb-10 text-base sm:text-lg leading-relaxed">
          The node you&apos;re looking for has been disconnected or never existed. You&apos;ve wandered from first principles into an undocumented sector.
        </p>

        {/* Call to action */}
        <Button asChild size="lg" className="rounded-full px-8 h-12 gap-2 shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Return to Basecamp
          </Link>
        </Button>
      </div>

      {/* Cyber Grid Overlay (CSS drawn) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />
    </div>
  );
}
