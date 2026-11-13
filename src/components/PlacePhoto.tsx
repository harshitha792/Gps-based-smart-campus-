import { useState } from "react";
import { ImageOff } from "lucide-react";

export function PlacePhoto({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return <div className={`relative overflow-hidden bg-muted ${className}`}>
    {src && failedSrc !== src ? <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className="absolute inset-0 h-full w-full object-cover" /> :
      <div role="img" aria-label={`${alt}: photo unavailable`} className="absolute inset-0 grid place-items-center text-muted-foreground"><ImageOff className="h-6 w-6" aria-hidden="true" /></div>}
  </div>;
}