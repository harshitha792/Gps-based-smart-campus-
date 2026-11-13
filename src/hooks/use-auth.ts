import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

type DemoUser = { id: string; email: string; name: string; accountType: string };
function readDemoUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem("reva_demo_session");
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch { return null; }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const demo = readDemoUser();
    setUser(demo ? ({ id: demo.id, email: demo.email, user_metadata: { full_name: demo.name, account_type: demo.accountType } } as User) : null);
    setLoading(false);
  }, []);
  return { user, loading };
}

export function displayName(user: User | null) {
  const m = user?.user_metadata ?? {};
  return (m["full_name"] as string) || (m["name"] as string) || user?.email?.split("@")[0] || "Student";
}
export function initials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
