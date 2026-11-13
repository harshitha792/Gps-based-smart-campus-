import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NAV } from "@/lib/features";
import { useQuery } from "@tanstack/react-query";
import { notificationsOptions } from "@/lib/notification-queries";
import { useUser, displayName, initials } from "@/hooks/use-auth";
import { RevaLogo, FeatureIcon } from "./Brand";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCampusAccount } from "@/hooks/use-campus-account";
import { canAccessCampusTool } from "@/lib/account-types";

export function AppShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useUser();
  const account = useCampusAccount();
  const name = account.data?.fullName || displayName(user);
  const notifications = useQuery(notificationsOptions);
  const unread = notifications.data?.filter((n) => !n.read_at).length ?? 0;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    localStorage.removeItem("reva_demo_session");
    navigate({ to: "/", replace: true });
  };
  const sharedNav = NAV.filter((item) => item.to !== "/operations");
  const allowedNav = NAV.filter((item) => canAccessCampusTool(item.to, account));
  const matches = q.trim()
    ? allowedNav.filter((f) => f.title.toLowerCase().includes(q.toLowerCase()))
    : [];

  const sidebar = (
    <aside className="flex h-full w-56 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <RevaLogo />
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="px-1">
        <div className="text-lg font-semibold">REVA</div>
        <div className="-mt-1 text-sm font-medium text-muted-foreground">Smart Campus</div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {sharedNav.map((n) => {
          const active = path === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${active ? "bg-gradient-primary font-semibold text-primary-foreground shadow-lg" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
            >
              <n.icon className="h-4 w-4" />
              {n.title}
            </Link>
          );
        })}
        {(account.manager || account.admin || account.security) && <div className="mt-3 border-t border-sidebar-border pt-3">
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">Approved tools</p>
          {account.manager && <Link to="/management" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent">Events & Attendance</Link>}
          {canAccessCampusTool("/operations", account) && <Link to="/operations" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent">{account.admin ? "Campus Administration" : "Security Operations"}</Link>}
        </div>}
        <Link
          to="/management"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
        >
          My Account & Access
        </Link>
      </nav>
      <div className="glass flex items-center gap-3 p-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-medium text-primary-foreground">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">{account.label} · REVA</div>
          {account.data?.registrationNumber && <div className="truncate text-xs text-muted-foreground" title={account.data.registrationNumber}>{account.data.registrationNumber}</div>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          aria-label="Sign out"
          className="rounded-md p-1.5 hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen w-full">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/70 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="h-full w-56">
            {sidebar}
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-56">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/60 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="mr-auto flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {icon}
            <div className="min-w-0">
              <h1 className="break-words text-lg font-semibold leading-snug sm:text-[24px]">
                {title}
              </h1>
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="relative ml-auto hidden w-72 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for places, services, events…"
              className="w-full rounded-full border border-input bg-muted/60 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {matches.length > 0 && (
              <div className="glass absolute mt-2 w-full p-1">
                {matches.map((m) => (
                  <Link
                    key={m.to}
                    to={m.to}
                    onClick={() => setQ("")}
                    className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent"
                  >
                    <m.icon className="size-4 text-primary" />
                    {m.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Popover>
            <PopoverTrigger
              className="relative rounded-full p-2 hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                  {unread}
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent align="end" className="glass w-80">
              <div className="mb-2 text-sm font-semibold">Notifications</div>
              {notifications.data?.slice(0, 4).map((n) => (
                <Link
                  key={n.id}
                  to="/notifications"
                  className="block rounded-md p-2 hover:bg-accent"
                >
                  <div className="text-sm">{n.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString("en-IN")}
                  </div>
                </Link>
              ))}
              {!notifications.data?.length && (
                <p className="py-3 text-xs text-muted-foreground">
                  {notifications.error ? "Notifications unavailable." : "No notifications yet."}
                </p>
              )}
              <Link
                to="/notifications"
                className="block border-t border-border pt-3 text-xs text-primary"
              >
                View all notifications
              </Link>
            </PopoverContent>
          </Popover>
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground"
            title={name}
          >
            {initials(name)}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function DemoBadge() {
  return (
    <span className="rounded-md bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
      Demo data
    </span>
  );
}

export function PageHero({ image, title, text }: { image: string; title: string; text: string }) {
  return (
    <div className="relative mb-6 h-40 overflow-hidden rounded-2xl border border-border md:h-48">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1024}
        height={640}
      />
      <div className="absolute inset-0 bg-linear-to-r from-background via-background/70 to-transparent" />
      <div className="relative flex h-full flex-col justify-center p-6">
        <h2 className="text-lg font-semibold md:text-3xl">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
