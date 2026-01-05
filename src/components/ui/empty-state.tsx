import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
  size = "md"
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: {
      container: "py-8 px-4",
      icon: "h-8 w-8",
      iconWrapper: "p-2.5 mb-3",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12 px-4",
      icon: "h-10 w-10",
      iconWrapper: "p-3 mb-4",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16 px-6",
      icon: "h-12 w-12",
      iconWrapper: "p-4 mb-5",
      title: "text-xl",
      description: "text-base",
    },
  };

  const styles = sizeClasses[size];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      styles.container,
      className
    )}>
      <div className={cn(
        "rounded-full bg-muted",
        styles.iconWrapper
      )}>
        <Icon className={cn(styles.icon, "text-muted-foreground")} />
      </div>
      <h3 className={cn(
        "font-semibold text-foreground mb-2",
        styles.title
      )}>
        {title}
      </h3>
      {description && (
        <p className={cn(
          "text-muted-foreground max-w-sm mb-4",
          styles.description
        )}>
          {description}
        </p>
      )}
      {action ? (
        <div className="mt-2">
          {action}
        </div>
      ) : actionLabel && onAction ? (
        <Button
          onClick={onAction}
          variant="default"
          size={size === "sm" ? "sm" : "default"}
          className="mt-2"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
