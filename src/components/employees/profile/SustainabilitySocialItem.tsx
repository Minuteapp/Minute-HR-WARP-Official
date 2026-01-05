
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface SustainabilitySocialItemProps {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: number;
}

export const SustainabilitySocialItem = ({
  icon: Icon,
  iconClass,
  label,
  value,
}: SustainabilitySocialItemProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Icon className={iconClass} />
        <span>{label}</span>
      </div>
      <Badge variant="secondary">{value}%</Badge>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);

