import WaveGenerator from "@/components/wave-generator";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Home() {
  return (
    <div className="container min-h-screen flex flex-col justify-between mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-mono font-bold mb-2">wave-generator</h1>
        <p className="text-muted-foreground">
          An advanced binaural sound generator for brainwave entrainment
        </p>
      </header>
      <main className="grid place-items-center">
        <TooltipProvider>
          <WaveGenerator />
        </TooltipProvider>
      </main>
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <p>
          Best experienced with headphones. Binaural sounds require stereo audio
          to be effective.
        </p>
      </footer>
    </div>
  );
}
