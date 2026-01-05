import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DepartmentCost {
  id: string;
  department: string;
  employeeCount: number;
  totalCosts: number;
  averageCostPerEmployee: number;
  trendPercentage: number;
}

interface DepartmentCostsTableProps {
  departments: DepartmentCost[];
  isLoading?: boolean;
}

export const DepartmentCostsTable = ({
  departments,
  isLoading,
}: DepartmentCostsTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value === 0) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-3 w-3" />
          <span className="text-sm">0%</span>
        </span>
      );
    }

    const isPositive = value > 0;
    return (
      <span
        className={cn(
          "flex items-center gap-1",
          isPositive ? "text-red-600" : "text-emerald-600"
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span className="text-sm font-medium">
          {isPositive ? "+" : ""}
          {value.toFixed(1)}%
        </span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Abteilungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-4 bg-muted rounded flex-1" />
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (departments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Abteilungen
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Keine Abteilungsdaten vorhanden</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" />
          Abteilungen
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Abteilung</TableHead>
              <TableHead className="text-right">MA</TableHead>
              <TableHead className="text-right">Kosten</TableHead>
              <TableHead className="text-right">Ø/MA</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.department}</TableCell>
                <TableCell className="text-right">{dept.employeeCount}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(dept.totalCosts)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(dept.averageCostPerEmployee)}
                </TableCell>
                <TableCell className="text-right">
                  <TrendIndicator value={dept.trendPercentage} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
