
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import React from "react";

export interface IntegrationCardProps {
  title: string;
  description: string;
  status?: "connected" | "not_connected" | "beta" | "coming_soon";
  onSetup?: () => void;
  docsUrl?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  ctaLabel?: string;
}

const statusLabel: Record<NonNullable<IntegrationCardProps["status"]>, string> = {
  connected: "Verbunden",
  not_connected: "Nicht verbunden",
  beta: "Beta",
  coming_soon: "Demnächst",
};

export default function IntegrationCard({
  title,
  description,
  status = "not_connected",
  onSetup,
  docsUrl,
  icon,
  disabled = false,
  ctaLabel = "Einrichten",
}: IntegrationCardProps) {
  return (
    <Card className={cn("h-full flex flex-col")}> 
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {icon && <div className="shrink-0">{icon}</div>}
            <CardTitle className="text-base leading-tight">{title}</CardTitle>
          </div>
          <Badge variant={status === "connected" ? "default" : status === "beta" ? "outline" : "secondary"}>
            {statusLabel[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-auto flex items-center gap-2">
          <Button size="sm" onClick={onSetup} disabled={disabled} variant="outline">
            {ctaLabel}
          </Button>
          {docsUrl && (
            <Button size="sm" asChild variant="ghost">
              <a href={docsUrl} target="_blank" rel="noreferrer">
                Doku <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
