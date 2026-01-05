import { Plane } from "lucide-react";

interface EmployeeBusinessTravelTabContentProps {
  employeeId: string;
}

export const EmployeeBusinessTravelTabContent = ({ employeeId }: EmployeeBusinessTravelTabContentProps) => {
  // Keine Daten vorhanden - zeige leeren Zustand
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4">
        <Plane className="h-16 w-16 text-muted-foreground mx-auto" />
        <div>
          <h3 className="text-lg font-semibold">Keine Geschäftsreisen vorhanden</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Für diesen Mitarbeiter wurden noch keine Geschäftsreisen angelegt.
          </p>
        </div>
      </div>
    </div>
  );
};
