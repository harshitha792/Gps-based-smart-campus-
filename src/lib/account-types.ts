export const ACCOUNT_TYPES = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher / Faculty" },
  { value: "staff", label: "Working Staff" },
] as const;
export type AccountType = typeof ACCOUNT_TYPES[number]["value"];
export function accountLabel(value: unknown) {
  return ACCOUNT_TYPES.find((type) => type.value === value)?.label ?? "Student";
}
// Self-declared account types never grant management permission.
export function canManageCampus(roles: readonly string[]) {
  return roles.includes("campus_manager");
}

// Presentation follows provisioned permissions, never the self-declared type.
export function canAccessCampusTool(path: string, access: { manager: boolean; admin: boolean; security: boolean }) {
  if (path === "/operations") return access.admin || access.security;
  return true;
}