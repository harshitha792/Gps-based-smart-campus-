import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-auth";
import { accountLabel, canManageCampus } from "@/lib/account-types";

export function useCampusAccount() {
  const { user } = useUser();
  const query = useQuery({
    queryKey: ["campus-account", user?.id],
    enabled: Boolean(user && !user.id.startsWith("demo-")),
    queryFn: async () => {
      if (!user) throw new Error("Not signed in");
      const [profile, roles, capabilities] = await Promise.all([
        supabase.from("profiles").select("account_type,full_name,registration_number").eq("id", user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("campus_permissions").select("capability").eq("user_id", user.id),
      ]);
      if (profile.error) throw profile.error;
      if (roles.error) throw roles.error;
      if (capabilities.error) throw capabilities.error;
      const admin = capabilities.data.some((c) => c.capability === "admin");
      return {
        accountType: profile.data.account_type,
        fullName: profile.data.full_name,
        registrationNumber: profile.data.registration_number,
        manager: admin || canManageCampus(roles.data.map((row) => row.role)),
        admin,
        security: admin || capabilities.data.some((c) => c.capability === "security"),
      };
    },
  });
  const demoAccount = user?.id.startsWith("demo-") ? {
    accountType: (user.user_metadata?.["account_type"] as string) || "student",
    fullName: (user.user_metadata?.["full_name"] as string) || user.email?.split("@")[0] || "Student",
    registrationNumber: null,
    manager: false,
    admin: false,
    security: false,
  } : undefined;
  const data = query.data ?? demoAccount;
  return {
    ...query,
    data,
    label: accountLabel(data?.accountType),
    manager: data?.manager === true,
    admin: data?.admin === true,
    security: data?.security === true,
  };
}
