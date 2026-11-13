import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import type LeafletMapT from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));
type Props = ComponentProps<typeof LeafletMapT>;

export function MapClient(props: Props) {
  const fallback = <div className="grid animate-pulse place-items-center rounded-xl bg-muted text-sm text-muted-foreground" style={{ height: props.height ?? 480 }}>Loading map…</div>;
  return <ClientOnly fallback={fallback}><Suspense fallback={fallback}><LeafletMap {...props} /></Suspense></ClientOnly>;
}
