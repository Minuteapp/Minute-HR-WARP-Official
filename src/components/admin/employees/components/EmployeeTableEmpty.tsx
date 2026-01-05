
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface EmployeeTableEmptyProps {
  onAddEmployee?: () => void;
}

export const EmployeeTableEmpty = ({ onAddEmployee }: EmployeeTableEmptyProps) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-primary/10 p-3">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium">Keine Mitarbeiter gefunden</h3>
        <p className="text-muted-foreground max-w-md">
          Es wurden noch keine Mitarbeiter für diese Firma angelegt. Fügen Sie einen neuen Mitarbeiter hinzu, um zu beginnen.
        </p>
        {onAddEmployee && (
          <Button onClick={onAddEmployee} className="mt-4">
            <UserPlus className="mr-2 h-4 w-4" />
            Mitarbeiter hinzufügen
          </Button>
        )}
      </div>
    </div>
  );
};
