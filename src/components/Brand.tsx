export function RevaLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="leading-tight">
        <div className="text-lg font-semibold">REVA</div>
        <div className="text-xs font-medium text-muted-foreground">UNIVERSITY</div>
        <div className="text-[9px] text-muted-foreground">Bengaluru, Karnataka</div>
      </div>
    </div>
  );
}

export function FeatureIcon({ icon: Icon, tone, size = "md" }: { icon: React.ComponentType<{ className?: string }>; tone: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const i = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className={`relative grid shrink-0 ${s} place-items-center rounded-lg bg-linear-to-br ${tone} ring-1 ring-foreground/10`}>
      <Icon className={`relative ${i} text-primary-foreground drop-shadow`} />
    </div>
  );
}
