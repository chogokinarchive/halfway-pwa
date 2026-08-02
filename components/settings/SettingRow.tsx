import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  control: ReactNode;
}

export function SettingRow({ icon: Icon, label, description, control }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {control}
    </div>
  );
}
