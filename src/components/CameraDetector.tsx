import { useEffect, useRef, useState } from "react";

const L = [33, 160, 158, 133, 153, 144];
const R = [362, 385, 387, 263, 373, 380];
type P = { x: number; y: number };
const d = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);
const ear = (lm: P[], i: number[]) => {
  const [p1, p2, p3, p4, p5, p6] = i.map((k) => lm[k]!) as [P, P, P, P, P, P];
  return (d(p2, p6) + d(p3, p5)) / (2 * d(p1, p4));
};

export function CameraDetector() {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "error">("idle");
  const [err, setErr] = useState("");
  const [value, setValue] = useState(0);
  const [closedFor, setClosedFor] = useState(0);
  const [face, setFace] = useState(true);
  const [threshold, setThreshold] = useState(0.22);
  const [duration, setDuration] = useState(1.5);
  const cfg = useRef({ threshold, duration });
  cfg.current = { threshold, duration };
  const stopRef = useRef<() => void>(() => {});
  const alert = closedFor >= duration;

  useEffect(() => () => stopRef.current(), []);

  useEffect(() => {
    if (!alert) return;
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    o.type = "square"; o.frequency.value = 880;
    o.connect(ctx.destination); o.start();
    return () => { o.stop(); ctx.close(); };
  }, [alert]);

  async function start() {
    setStatus("loading"); setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      const v = video.current!;
      v.srcObject = stream; await v.play();
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const files = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
      const fl = await FaceLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task", delegate: "GPU" },
        runningMode: "VIDEO", numFaces: 1,
      });
      let raf = 0, closedStart: number | null = null, last = -1;
      const loop = () => {
        if (v.currentTime !== last) {
          last = v.currentTime;
          const now = performance.now();
          const res = fl.detectForVideo(v, now);
          const c = canvas.current!, g = c.getContext("2d")!;
          c.width = v.videoWidth; c.height = v.videoHeight;
          g.clearRect(0, 0, c.width, c.height);
          const lm = res.faceLandmarks[0];
          if (lm) {
            setFace(true);
            const e = (ear(lm, L) + ear(lm, R)) / 2;
            setValue(e);
            if (e < cfg.current.threshold) { closedStart ??= now; setClosedFor((now - closedStart) / 1000); }
            else { closedStart = null; setClosedFor(0); }
            g.fillStyle = e < cfg.current.threshold ? "#ff5050" : "#4ee6ff";
            [...L, ...R].forEach((k) => { g.beginPath(); g.arc(lm[k]!.x * c.width, lm[k]!.y * c.height, 3, 0, 7); g.fill(); });
          } else { setFace(false); closedStart = null; setClosedFor(0); }
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
      setStatus("running");
      stopRef.current = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); fl.close(); };
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e)); setStatus("error");
    }
  }

  function stop() { stopRef.current(); stopRef.current = () => {}; setStatus("idle"); setClosedFor(0); setValue(0); }

  return (
    <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
      <div className={`relative rounded-lg border bg-card overflow-hidden aspect-[4/3] ${alert ? "alert-pulse border-destructive" : ""}`}>
        <video ref={video} playsInline muted className="absolute inset-0 h-full w-full object-cover -scale-x-100" />
        <canvas ref={canvas} className="absolute inset-0 h-full w-full object-cover -scale-x-100" />
        {status !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card p-6 text-center">
            <p className="text-muted-foreground">{status === "loading" ? "Starting camera and loading face model…" : "Your video stays on your device — nothing is uploaded."}</p>
            {status !== "loading" && <button onClick={start} className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground glow">Enable camera</button>}
            {err && <p className="text-sm text-destructive">Couldn't start camera: {err}</p>}
          </div>
        )}
        {status === "running" && alert && (
          <div className="absolute inset-x-0 top-4 mx-auto w-fit rounded-md bg-destructive px-4 py-2 font-mono font-bold">⚠ DROWSINESS ALERT!</div>
        )}
      </div>
      <div className="rounded-lg border bg-card p-6">
        <div className="font-mono">
          <div className="text-5xl font-bold">{value.toFixed(3)}</div>
          <div className="text-xs text-muted-foreground">LIVE AVERAGE EAR</div>
        </div>
        <div className={`mt-4 w-fit rounded-md px-4 py-2 font-mono text-sm font-bold ${alert ? "bg-destructive" : closedFor > 0 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
          {status !== "running" ? "CAMERA OFF" : !face ? "NO FACE DETECTED" : alert ? "WAKE UP!" : closedFor > 0 ? `EYES CLOSED ${closedFor.toFixed(1)}s` : "AWAKE"}
        </div>
        {([["EAR threshold", threshold, setThreshold, 0.1, 0.35, 0.005], ["Duration (s)", duration, setDuration, 0.5, 5, 0.1]] as const).map(([l, v, s, min, max, step]) => (
          <label key={l} className="mt-6 block">
            <div className="mb-2 flex justify-between text-sm"><span>{l}</span><span className="font-mono text-primary">{v.toFixed(step === 0.1 ? 1 : 3)}</span></div>
            <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => s(+e.target.value)} className="w-full accent-[var(--primary)]" />
          </label>
        ))}
        {status === "running" && <button onClick={stop} className="mt-6 rounded-md border px-4 py-2 text-sm hover:bg-secondary">Stop camera</button>}
        <p className="mt-4 text-sm text-muted-foreground">Close your eyes longer than the duration to hear the alarm. Adjust the threshold if alerts trigger too easily.</p>
      </div>
    </div>
  );
}
