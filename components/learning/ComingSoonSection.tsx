import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface ComingSoonSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ComingSoonSection({ icon, title, description }: ComingSoonSectionProps) {
  return <EmptyState icon={icon} title={title} description={description} className="py-16" />;
}
