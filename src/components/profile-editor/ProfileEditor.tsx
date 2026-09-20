import { useCallback, useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Download, FlipHorizontal2, ImagePlus, Link2, Lock, RotateCw, RotateCcw, ShieldCheck, Sparkles, Trash2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exportPresets, overlayPresets } from "./editor-data";

const PREVIEW_SIZE = 620;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ImageState = { element: HTMLImageElement; name: string; url: string };
type Transform = { x: number; y: number; zoom: number; rotation: number; flip: boolean };
const initialTransform: Transform = { x: 0, y: 0, zoom: 1, rotation: 0, flip: false };

function drawCircularText(
  ctx: CanvasRenderingContext2D,
  text: string,
  center: number,
  radius: number,
  fontSize: number,
  color: string,
) {
  const phrase = `${text}  •  `;
  const repeated = phrase.repeat(Math.max(3, Math.ceil(30 / phrase.length)));
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `800 ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const circumference = Math.PI * 2 * radius;
  const spacing = circumference / repeated.length;
  for (let i = 0; i < repeated.length; i += 1) {
    const angle = -Math.PI / 2 + (i * spacing) / radius;
    ctx.save();
    ctx.translate(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(repeated[i] ?? "", 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function renderAvatar(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  transform: Transform,
  width: number,
  height: number,
  message: string,
  background: string,
  foreground: string,
  fontScale: number,
) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const ringWidth = size * 0.145;
  const photoRadius = size / 2 - ringWidth;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = background;
  ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoRadius + 1, 0, Math.PI * 2);
  ctx.clip();
  const coverScale = Math.max((photoRadius * 2) / image.width, (photoRadius * 2) / image.height) * transform.zoom;
  const drawW = image.width * coverScale;
  const drawH = image.height * coverScale;
  ctx.translate(cx + transform.x * size * 0.18, cy + transform.y * size * 0.18);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.flip ? -1 : 1, 1);
  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
  drawCircularText(ctx, message.toUpperCase(), cx, size / 2 - ringWidth / 2, ringWidth * 0.29 * fontScale, foreground);
  ctx.restore();
}

function bytesLabel(bytes: number | null) {
  if (bytes === null) return "Calculating…";
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function ProfileEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const [image, setImage] = useState<ImageState | null>(null);
  const [error, setError] = useState("");
  const [transform, setTransform] = useState(initialTransform);
  const [overlayId, setOverlayId] = useState("open");
  const [message, setMessage] = useState("#OPEN TO WORK");
  const [background, setBackground] = useState("#167a54");
  const [foreground, setForeground] = useState("#ffffff");
  const [fontScale, setFontScale] = useState(1);
  const [exportId, setExportId] = useState("linkedin");
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(400);
  const [ratioLocked, setRatioLocked] = useState(true);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [quality, setQuality] = useState(90);
  const [estimatedBytes, setEstimatedBytes] = useState<number | null>(null);

  const selectedExport = exportPresets.find((item) => item.id === exportId) ?? exportPresets[0];
  const maxBytes = selectedExport?.maxMb ? selectedExport.maxMb * 1024 * 1024 : null;
  const isOversize = estimatedBytes !== null && maxBytes !== null && estimatedBytes > maxBytes;

  const paintPreview = useCallback(() => {
    if (!canvasRef.current || !image) return;
    renderAvatar(canvasRef.current, image.element, transform, PREVIEW_SIZE, PREVIEW_SIZE, message, background, foreground, fontScale);
  }, [image, transform, message, background, foreground, fontScale]);

  useEffect(() => paintPreview(), [paintPreview]);

  useEffect(() => {
    if (!image) return;
    const timer = window.setTimeout(() => {
      const canvas = document.createElement("canvas");
      renderAvatar(canvas, image.element, transform, width, height, message, background, foreground, fontScale);
      canvas.toBlob((blob) => setEstimatedBytes(blob?.size ?? null), `image/${format}`, format === "jpeg" ? quality / 100 : undefined);
    }, 160);
    return () => window.clearTimeout(timer);
  }, [image, transform, width, height, message, background, foreground, fontScale, format, quality]);

  useEffect(() => () => {
    if (image) URL.revokeObjectURL(image.url);
  }, [image]);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("Choose an image smaller than 25 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    const element = new Image();
    element.onload = () => {
      if (image) URL.revokeObjectURL(image.url);
      setImage({ element, name: file.name, url });
      setTransform(initialTransform);
      setError("");
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      setError("That image could not be opened. Try another file.");
    };
    element.src = url;
  }

  function pickOverlay(id: string) {
    const preset = overlayPresets.find((item) => item.id === id);
    if (!preset) return;
    setOverlayId(id);
    setMessage(preset.text);
    setBackground(preset.background);
    setForeground(preset.foreground);
  }

  function pickExport(id: string) {
    const preset = exportPresets.find((item) => item.id === id);
    if (!preset) return;
    setExportId(id);
    setWidth(preset.size);
    setHeight(preset.size);
  }

  function updateWidth(next: number) {
    const safe = Math.min(4096, Math.max(64, next || 64));
    setWidth(safe);
    if (ratioLocked) setHeight(safe);
    setExportId("custom");
  }

  function updateHeight(next: number) {
    const safe = Math.min(4096, Math.max(64, next || 64));
    setHeight(safe);
    if (ratioLocked) setWidth(safe);
    setExportId("custom");
  }

  function pointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, startX: transform.x, startY: transform.y };
  }

  function pointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    setTransform((current) => ({
      ...current,
      x: Math.max(-1.5, Math.min(1.5, drag.startX + (event.clientX - drag.x) / 160)),
      y: Math.max(-1.5, Math.min(1.5, drag.startY + (event.clientY - drag.y) / 160)),
    }));
  }

  function download() {
    if (!image) return;
    const canvas = document.createElement("canvas");
    renderAvatar(canvas, image.element, transform, width, height, message, background, foreground, fontScale);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${exportId === "custom" ? "profile" : exportId}-avatar.${format === "jpeg" ? "jpg" : "png"}`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, `image/${format}`, format === "jpeg" ? quality / 100 : undefined);
  }

  function startOver() {
    if (image) URL.revokeObjectURL(image.url);
    setImage(null);
    setTransform(initialTransform);
    setEstimatedBytes(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><Sparkles size={18} aria-hidden="true" /></div>
            <span className="font-display text-xl font-bold">Profile Halo</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><ShieldCheck size={16} className="text-primary" aria-hidden="true" />Your photo never leaves this device</div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:py-10">
        <div className="mb-8 max-w-3xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Private by design</p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Make your profile picture say more.</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">Add a professional frame or your own inside joke. Edit and export entirely in your browser.</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <section className="lg:sticky lg:top-6">
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-lg border border-border bg-workspace p-5 sm:min-h-[620px] sm:p-10">
              <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
                <span className="text-xs font-semibold text-muted-foreground">LIVE PREVIEW</span>
                {image && <span className="max-w-[55%] truncate text-xs text-muted-foreground">{image.name}</span>}
              </div>
              {!image ? (
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full border border-dashed border-primary bg-primary/10 text-primary"><ImagePlus size={28} aria-hidden="true" /></div>
                  <h2 className="font-display text-2xl font-bold">Choose a profile photo</h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">JPG, PNG, or WebP up to 25 MB. The file stays in this browser tab.</p>
                  <Button className="mt-6" onClick={() => inputRef.current?.click()}><ImagePlus size={17} />Choose photo</Button>
                  {error && <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p>}
                </div>
              ) : (
                <div className="mt-10 w-full max-w-[560px]">
                  <canvas
                    ref={canvasRef}
                    aria-label="Profile picture preview. Drag to reposition your photo."
                    onPointerDown={pointerDown}
                    onPointerMove={pointerMove}
                    onPointerUp={() => { dragRef.current = null; }}
                    onPointerCancel={() => { dragRef.current = null; }}
                    className="aspect-square w-full cursor-grab touch-none rounded-full shadow-preview active:cursor-grabbing"
                  />
                  <p className="mt-4 text-center text-xs font-medium text-muted-foreground">Drag the photo to reposition</p>
                </div>
              )}
            </div>
            <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} />
          </section>

          <section className="space-y-7" aria-label="Editor controls">
            <ControlSection number="01" title="Photo">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={() => inputRef.current?.click()}><ImagePlus size={16} />{image ? "Replace" : "Choose photo"}</Button>
                <Button variant="icon" aria-label="Rotate left" title="Rotate left" disabled={!image} onClick={() => setTransform((value) => ({ ...value, rotation: value.rotation - 90 }))}><RotateCcw size={17} /></Button>
                <Button variant="icon" aria-label="Rotate right" title="Rotate right" disabled={!image} onClick={() => setTransform((value) => ({ ...value, rotation: value.rotation + 90 }))}><RotateCw size={17} /></Button>
                <Button variant="icon" aria-label="Flip horizontally" title="Flip horizontally" disabled={!image} onClick={() => setTransform((value) => ({ ...value, flip: !value.flip }))}><FlipHorizontal2 size={18} /></Button>
                <Button variant="ghost" disabled={!image} onClick={() => setTransform(initialTransform)}>Reset</Button>
              </div>
              <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Zoom <span className="float-right font-mono text-foreground">{Math.round(transform.zoom * 100)}%</span></label>
              <input aria-label="Photo zoom" type="range" min="1" max="3" step="0.01" value={transform.zoom} disabled={!image} onChange={(event) => setTransform((value) => ({ ...value, zoom: Number(event.target.value) }))} className="mt-2 w-full accent-primary" />
            </ControlSection>

            <ControlSection number="02" title="Pick a frame">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {overlayPresets.map((preset) => (
                  <Button key={preset.id} type="button" variant="secondary" onClick={() => pickOverlay(preset.id)} className={cn("h-auto min-h-20 flex-col items-stretch gap-0 p-2 text-left hover:border-primary", overlayId === preset.id ? "border-primary ring-2 ring-primary/20" : "border-border") }>
                    <span className="mb-2 block h-3 rounded-sm" style={{ backgroundColor: preset.background }} />
                    <span className="text-xs font-semibold">{preset.label}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground sm:col-span-2">Message<input maxLength={28} value={message} onChange={(event) => { setMessage(event.target.value || " "); setOverlayId("custom"); }} className="mt-2 h-10 w-full rounded-md border border-input bg-card px-3 text-sm font-semibold uppercase text-foreground outline-none focus:ring-2 focus:ring-ring" /></label>
                <ColorInput label="Ring" value={background} onChange={(value) => { setBackground(value); setOverlayId("custom"); }} />
                <ColorInput label="Text" value={foreground} onChange={(value) => { setForeground(value); setOverlayId("custom"); }} />
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground sm:col-span-2">Text size <span className="float-right font-mono text-foreground">{Math.round(fontScale * 100)}%</span><input aria-label="Frame text size" type="range" min="0.7" max="1.3" step="0.05" value={fontScale} onChange={(event) => setFontScale(Number(event.target.value))} className="mt-2 w-full accent-primary" /></label>
              </div>
            </ControlSection>

            <ControlSection number="03" title="Export">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Export platform">
                {exportPresets.map((preset) => <Button key={preset.id} variant={exportId === preset.id ? "primary" : "secondary"} className="h-9 px-3" onClick={() => pickExport(preset.id)}>{preset.label}</Button>)}
              </div>
              <div className="mt-4 rounded-md border border-border bg-muted/45 p-3">
                <p className="text-xs leading-5 text-muted-foreground">{selectedExport?.note}</p>
                {selectedExport?.source && <a href={selectedExport.source} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">View source <Link2 size={12} /></a>}
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                <NumberInput label="Width" value={width} onChange={updateWidth} />
                <Button variant="icon" className="mb-px size-10" aria-label={ratioLocked ? "Unlock aspect ratio" : "Lock aspect ratio"} title={ratioLocked ? "Unlock aspect ratio" : "Lock aspect ratio"} onClick={() => setRatioLocked((value) => !value)}>{ratioLocked ? <Lock size={15} /> : <Unlock size={15} />}</Button>
                <NumberInput label="Height" value={height} onChange={updateHeight} />
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Format<select value={format} onChange={(event) => setFormat(event.target.value as "png" | "jpeg")} className="mt-2 block h-10 rounded-md border border-input bg-card px-3 text-sm font-semibold text-foreground"><option value="png">PNG</option><option value="jpeg">JPG</option></select></label>
                {format === "jpeg" && <label className="min-w-44 flex-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Quality <span className="float-right font-mono text-foreground">{quality}%</span><input aria-label="JPG quality" type="range" min="30" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="mt-3 w-full accent-primary" /></label>}
              </div>
              <div className={cn("mt-4 flex items-center justify-between border-y border-border py-3 text-sm", isOversize && "text-destructive")}><span className="text-muted-foreground">Estimated file size</span><strong>{image ? bytesLabel(estimatedBytes) : "—"}{isOversize ? " · over limit" : ""}</strong></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                <Button disabled={!image} onClick={download}><Download size={17} />Download {width}×{height}</Button>
                <Button variant="ghost" disabled={!image} onClick={startOver}><Trash2 size={16} />Start over</Button>
              </div>
              <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">Requirements last checked September 2026. Exporting happens locally.</p>
            </ControlSection>
          </section>
        </div>
      </div>
    </main>
  );
}

function ControlSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <div className="border-t border-border pt-4"><div className="mb-4 flex items-baseline gap-3"><span className="font-mono text-xs text-primary">{number}</span><h2 className="font-display text-xl font-bold">{title}</h2></div>{children}</div>;
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}<span className="mt-2 flex h-10 items-center gap-2 rounded-md border border-input bg-card px-2"><input aria-label={`${label} color`} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="size-6 cursor-pointer border-0 bg-transparent p-0" /><span className="font-mono text-xs text-foreground">{value.toUpperCase()}</span></span></label>;
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}<span className="relative mt-2 block"><input type="number" min="64" max="4096" value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-10 w-full rounded-md border border-input bg-card px-3 pr-8 font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">px</span></span></label>;
}
