import WaveGenerator from "@/components/wave-generator";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Wave Generator</h1>
        <p className="text-muted-foreground">
          An advanced binaural sound generator for brainwave entrainment
        </p>
      </header>
      
      <main className="grid place-items-center">
        <WaveGenerator />
      </main>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Best experienced with headphones. Binaural beats require stereo audio
          to be effective.
        </p>
      </footer>
    </div>
  );
}
