import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
export function QrScanner({ onScan }: { onScan: (value: string) => void }) {
  const id = useId().replace(/:/g, "");
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let scanner: import("html5-qrcode").Html5Qrcode | undefined;
    import("html5-qrcode").then(async ({ Html5Qrcode }) => {
      if (cancelled) return;
      scanner = new Html5Qrcode(id);
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 220 },
          (value) => {
            onScan(value);
            setActive(false);
          },
          () => {},
        );
        if (cancelled && scanner.isScanning) await scanner.stop();
      } catch {
        if (!cancelled) {
          setError("Camera unavailable or permission denied. Enter the scanned code instead.");
          setActive(false);
        }
      }
    });
    return () => {
      cancelled = true;
      if (scanner?.isScanning) scanner.stop().catch(() => {});
    };
  }, [active, id, onScan]);
  return (
    <div className="my-4 max-w-sm">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setError("");
          setActive(!active);
        }}
      >
        {active ? "Stop camera" : "Scan QR with camera"}
      </Button>
      <div
        id={id}
        className={
          active ? "mt-3 aspect-square overflow-hidden rounded-md border border-border" : "hidden"
        }
      />
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
