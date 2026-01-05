
import { Link, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <Card className="p-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Link className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Keine Verknüpfungen</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Erstellen Sie Verknüpfungen zu anderen Modulen, um Ihre Projektressourcen besser zu organisieren.
        </p>
        <Button 
          onClick={onCreateClick}
          className="mt-4"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Erste Verknüpfung erstellen
        </Button>
      </div>
    </Card>
  );
}
