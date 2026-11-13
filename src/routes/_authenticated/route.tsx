import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined" || !window.localStorage.getItem("reva_demo_session")) {
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});
