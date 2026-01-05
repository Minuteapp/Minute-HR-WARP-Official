
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export const EmployeeStatusBadge = ({ 
  status, 
  showIcon = true,
  size = "md" 
}: EmployeeStatusBadgeProps) => {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return "success";
      case 'inactive':
        return "secondary";
      case 'pending':
        return "warning";
      default:
        return "secondary";
    }
  };

  const getIcon = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle2 className={cn("mr-1", {
          "h-3 w-3": size === "sm",
          "h-4 w-4": size === "md",
          "h-5 w-5": size === "lg"
        })} />;
      case 'inactive':
        return <XCircle className={cn("mr-1", {
          "h-3 w-3": size === "sm",
          "h-4 w-4": size === "md",
          "h-5 w-5": size === "lg"
        })} />;
      case 'pending':
        return <Clock className={cn("mr-1", {
          "h-3 w-3": size === "sm",
          "h-4 w-4": size === "md",
          "h-5 w-5": size === "lg"
        })} />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Aktiv';
      case 'inactive':
        return 'Inaktiv';
      case 'pending':
        return 'Ausstehend';
      default:
        return status;
    }
  };

  const variant = getVariant();

  return (
    <Badge 
      variant={variant as any}
      className={cn("flex items-center", {
        "px-2 py-0 text-xs": size === "sm",
        "px-2.5 py-0.5 text-sm": size === "md",
        "px-3 py-1 text-base": size === "lg"
      })}
    >
      {showIcon && getIcon()}
      {getLabel()}
    </Badge>
  );
};
