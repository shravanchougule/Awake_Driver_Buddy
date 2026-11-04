import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CameraDetector } from "@/components/CameraDetector";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Driver Drowsiness Detection System" },
      { name: "description", content: "Python, OpenCV and MediaPipe system that detects prolonged eye closure using Eye Aspect Ratio and raises alerts." },
      { property: "og:title", content: "AI Driver Drowsiness Detection System" },
      { property: "og:description", content: "Real-time EAR-based drowsiness detection with visual and audible alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const nav = ["live", "overview", "objectives", "demo", "methodology", "tech", "run", "limitations", "future"];

function Section({ id, title, kicker, children }: { id: string; title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-20 border-t">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">{kicker}</p>
      <h2 className="mt-2 text-3xl md:text-4xl font-bold">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border bg-card p-6">{children}</div>;
}

function Eye({ open }: { open: number }) {
  return (
    <svg viewBox="0 0 100 50" className="w-28">
      <ellipse cx="50" cy="25" rx="40" ry={Math.max(1, 20 * open)} fill="none" stroke="currentColor" strokeWidth="3" />
      {open > 0.25 && <circle cx="50" cy="25" r={Math.min(10, 20 * open)} fill="currentColor" />}
    </svg>
  );
}

function Simulator() {
  const [ear, setEar] = useState(0.3);
  const [threshold, setThreshold] = useState(0.22);
  const [duration, setDuration] = useState(1.5);
  const [below, setBelow] = useState(0);
  const [sound, setSound] = useState(false);
  const ctx = useRef<AudioContext | null>(null);
  const alert = below >= duration;

  useEffect(() => {
    const t = setInterval(() => setBelow((b) => (ear < threshold ? b + 0.1 : 0)), 100);
    return () => clearInterval(t);
  }, [ear, threshold]);

  useEffect(() => {
    if (!alert || !sound) return;
    ctx.current ??= new AudioContext();
    const o = ctx.current.createOscillator();
    o.frequency.value = 880; o.type = "square";
    o.connect(ctx.current.destination); o.start();
    return () => o.stop();
  }, [alert, sound]);

  const open = Math.min(1, ear / 0.35);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className={`rounded-lg border bg-card p-8 flex flex-col items-center justify-center gap-6 transition ${alert ? "alert-pulse border-destructive" : ""}`}>
        <div className={`flex gap-6 ${alert ? "text-destructive" : "text-accent"}`}><Eye open={open} /><Eye open={open} /></div>
        <div className="font-mono text-center">
          <div className="text-5xl font-bold">{ear.toFixed(3)}</div>
          <div className="text-xs text-muted-foreground mt-1">AVERAGE EAR</div>
        </div>
        <div className={`rounded-md px-4 py-2 font-mono text-sm font-bold ${alert ? "bg-destructive text-foreground" : ear < threshold ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
          {alert ? "⚠ DROWSINESS ALERT!" : ear < threshold ? `EYES CLOSED ${below.toFixed(1)}s` : "AWAKE"}
        </div>
      </div>
      <Card>
        {[
          ["Eye openness (EAR)", ear, setEar, 0.05, 0.4, 0.005],
          ["EAR threshold", threshold, setThreshold, 0.1, 0.35, 0.005],
          ["Duration (s)", duration, setDuration, 0.5, 5, 0.1],
        ].map(([l, v, s, min, max, step]) => (
          <label key={l as string} className="block mb-6">
            <div className="flex justify-between text-sm mb-2"><span>{l as string}</span><span className="font-mono text-primary">{(v as number).toFixed(step === 0.1 ? 1 : 3)}</span></div>
            <input type="range" min={min as number} max={max as number} step={step as number} value={v as number}
              onChange={(e) => (s as (n: number) => void)(+e.target.value)} className="w-full accent-[var(--primary)]" />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> Play alarm sound</label>
        <p className="mt-4 text-sm text-muted-foreground">Slide eye openness below the threshold and hold it there longer than the duration to trigger the alert — exactly as the Python program does with live webcam frames.</p>
      </Card>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <a href="#" className="font-display font-bold"><span className="text-primary">●</span> DrowsyGuard</a>
          <nav className="hidden md:flex gap-5 text-sm text-muted-foreground">
            {nav.map((n) => <a key={n} href={`#${n}`} className="capitalize hover:text-primary">{n}</a>)}
          </nav>
        </div>
      </header>

      <section className="grid-bg">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Computer vision · Driver safety research</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold leading-tight max-w-4xl">AI Driver <span className="text-primary">Drowsiness</span> Detection System</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">A Python application that watches your eyes through a webcam, measures the Eye Aspect Ratio in real time, and sounds an alarm when your eyes stay closed too long.</p>
          <div className="mt-10 flex gap-3">
            <a href="#live" className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground glow">Start live detection</a>
            <a href="#run" className="rounded-md border px-6 py-3 font-semibold hover:bg-secondary">How to run</a>
          </div>
        </div>
      </section>

      <Section id="overview" kicker="01 — Overview" title="Project overview">
        <p className="max-w-3xl text-lg text-muted-foreground">The AI Driver Drowsiness Detection System is a Python-based computer vision application that monitors eye movements through a webcam and detects prolonged eye closure. It provides a visual warning and audible alert when a potential drowsiness event is detected.</p>
      </Section>

      <Section id="objectives" kicker="02 — Objectives" title="What it sets out to do">
        <div className="grid gap-4 md:grid-cols-3">
          {["Detect facial and eye landmarks in real time.", "Calculate the Eye Aspect Ratio (EAR).", "Identify prolonged eye closure.", "Generate visual and audible alerts.", "Demonstrate the use of computer vision for driver-safety research."].map((o, i) => (
            <Card key={o}><div className="font-mono text-primary text-sm">0{i + 1}</div><p className="mt-2">{o}</p></Card>
          ))}
        </div>
      </Section>

      <Section id="live" kicker="Live" title="Live eye detection (webcam)">
        <CameraDetector />
      </Section>

      <Section id="demo" kicker="03 — Interactive" title="EAR alert simulator">
        <Simulator />
      </Section>

      <Section id="methodology" kicker="04 — Methodology" title="How detection works">
        <div className="grid gap-4 md:grid-cols-4">
          {[["Capture", "The webcam captures video frames."], ["Landmarks", "MediaPipe extracts facial landmarks around both eyes."], ["EAR", "EAR is calculated for each eye and averaged."], ["Alert", "If EAR stays below the threshold for the set duration, a warning shows and an alarm plays."]].map(([t, d], i) => (
            <Card key={t}><div className="font-mono text-accent text-sm">STEP {i + 1}</div><h3 className="mt-2 text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></Card>
          ))}
        </div>
        <div className="mt-6 rounded-lg border bg-card p-6 font-mono text-center">
          <div className="text-xl md:text-2xl">EAR = (‖p2 − p6‖ + ‖p3 − p5‖) / (2 · ‖p1 − p4‖)</div>
          <p className="mt-3 text-sm text-muted-foreground font-sans">Vertical eye distances divided by horizontal width. Open eyes ≈ 0.3; closed eyes drop toward 0.</p>
        </div>
      </Section>

      <Section id="tech" kicker="05 — Stack" title="Technologies & requirements">
        <div className="grid gap-6 md:grid-cols-2">
          <Card><h3 className="font-semibold mb-4">Technologies used</h3><div className="flex flex-wrap gap-2">{["Python", "OpenCV", "MediaPipe", "NumPy", "Visual Studio Code"].map((t) => <span key={t} className="rounded-full border px-3 py-1 text-sm font-mono">{t}</span>)}</div></Card>
          <Card><h3 className="font-semibold mb-4">System requirements</h3><ul className="space-y-2 text-muted-foreground"><li>✓ macOS, Windows or Linux</li><li>✓ Python environment compatible with the dependencies</li><li>✓ Webcam</li><li>✗ Microphone is not required</li></ul></Card>
        </div>
      </Section>

      <Section id="run" kicker="06 — Setup" title="How to run">
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="border-b px-4 py-2 font-mono text-xs text-muted-foreground">terminal</div>
          <pre className="p-6 font-mono text-sm leading-7 overflow-x-auto"><span className="text-muted-foreground"># 1. Create and activate a virtual environment</span>{"\n"}python -m venv venv{"\n"}source venv/bin/activate  <span className="text-muted-foreground"># Windows: venv\Scripts\activate</span>{"\n\n"}<span className="text-muted-foreground"># 2. Install dependencies</span>{"\n"}python -m pip install -r requirements.txt{"\n\n"}<span className="text-muted-foreground"># 3. Run the app</span>{"\n"}<span className="text-primary">python main.py</span></pre>
        </div>
        <p className="mt-4 text-muted-foreground">Allow webcam access if prompted. Press <kbd className="rounded border px-2 font-mono text-primary">Q</kbd> to close the application.</p>
      </Section>

      <Section id="limitations" kicker="07 — Limitations" title="Know the limits">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 max-w-3xl">
          <p>The system may produce false alerts due to lighting, glasses, camera position, individual facial differences, or landmark-detection errors.</p>
          <p className="mt-3 font-semibold text-destructive">It is an educational prototype, not a certified driver-safety device.</p>
        </div>
      </Section>

      <Section id="future" kicker="08 — Roadmap" title="Future scope">
        <div className="grid gap-4 md:grid-cols-4">
          {["Yawning detection", "Event logging and reporting", "Improved calibration", "Integration with a vehicle warning interface"].map((f) => <Card key={f}><p className="font-semibold">{f}</p></Card>)}
        </div>
      </Section>

      <Section id="conclusion" kicker="09 — Conclusion" title="Conclusion">
        <p className="max-w-3xl text-lg text-muted-foreground">This project demonstrates how computer vision can identify a potential sign of driver drowsiness and provide a timely warning in a controlled demonstration environment.</p>
      </Section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">AI Driver Drowsiness Detection System · Educational prototype</footer>
    </div>
  );
}
