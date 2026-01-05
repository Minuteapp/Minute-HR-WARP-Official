import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CalendarSidebarProps {
  children: ReactNode;
  className?: string;
}

export function CalendarSidebar({ children, className }: CalendarSidebarProps) {
  return (
    <div
      className={cn(
        "w-[260px] border-r bg-card overflow-y-auto flex-shrink-0",
        className
      )}
    >
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

interface SidebarSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SidebarSection({ title, children, className }: SidebarSectionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      )}
      {children}
    </div>
  );
}
