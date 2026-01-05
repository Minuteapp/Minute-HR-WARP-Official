import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, ChevronDown, Settings, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PayrollHeaderProps {
  employeeCount: number;
  isLoading?: boolean;
}

export const PayrollHeader = ({ employeeCount, isLoading }: PayrollHeaderProps) => {
  const currentMonth = format(new Date(), "MMMM yyyy", { locale: de });

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Lohn & Gehalt</h1>
          <Badge variant="secondary" className="flex items-center gap-1.5 px-2.5 py-1">
            <Users className="h-3.5 w-3.5" />
            <span className="font-semibold">
              {isLoading ? "..." : employeeCount.toLocaleString("de-DE")} MA
            </span>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Minute HR Payroll • Abrechnungsmonat: <span className="font-medium">{currentMonth}</span>
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            Admin
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2">
            <Settings className="h-4 w-4" />
            Einstellungen
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Hilfe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
