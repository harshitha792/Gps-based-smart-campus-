import { GraduationCap, BookOpen, Briefcase } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ACCOUNT_TYPES, type AccountType } from "@/lib/account-types";

const icons = { student: GraduationCap, teacher: BookOpen, staff: Briefcase };

export function AccountTypeSelector({ value, onChange, disabled = false }: { value: AccountType; onChange: (value: AccountType) => void; disabled?: boolean }) {
  return <ToggleGroup type="single" value={value} disabled={disabled} onValueChange={(next) => {
    const choice = ACCOUNT_TYPES.find((item) => item.value === next);
    if (choice) onChange(choice.value);
  }} aria-label="Account type" variant="outline" className="grid w-full grid-cols-3 gap-2">
    {ACCOUNT_TYPES.map((item) => {
      const Icon = icons[item.value];
      return <ToggleGroupItem key={item.value} value={item.value} aria-label={item.label} className="h-16 min-w-0 flex-col gap-1 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
        <Icon className="size-4" />{item.value === "teacher" ? "Teacher" : item.value === "staff" ? "Staff" : "Student"}
      </ToggleGroupItem>;
    })}
  </ToggleGroup>;
}