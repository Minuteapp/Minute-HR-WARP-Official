import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";
import { employeeOrgService } from "@/services/employeeOrgService";
import { RefreshCw, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MigrateEmployeesButtonProps {
  onMigrationComplete?: () => void;
}

export const MigrateEmployeesButton = ({ onMigrationComplete }: MigrateEmployeesButtonProps) => {
  const { companyId } = useCompanyId();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleMigration = async () => {
    if (!companyId) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Keine Firma ausgewählt",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await employeeOrgService.migrateExistingEmployees(companyId);
      
      if (result.migrated > 0) {
        toast({
          title: "Migration erfolgreich",
          description: `${result.migrated} Mitarbeiter wurden dem Organigramm hinzugefügt.${result.failed > 0 ? ` ${result.failed} konnten nicht zugeordnet werden.` : ''}`,
        });
        onMigrationComplete?.();
      } else if (result.failed > 0) {
        toast({
          variant: "destructive",
          title: "Migration fehlgeschlagen",
          description: `${result.failed} Mitarbeiter konnten keiner Abteilung zugeordnet werden. Stellen Sie sicher, dass passende Organisationseinheiten existieren.`,
        });
      } else {
        toast({
          title: "Keine Migration nötig",
          description: "Alle Mitarbeiter sind bereits im Organigramm verknüpft oder haben keine Abteilung.",
        });
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Migration konnte nicht durchgeführt werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Users className="h-4 w-4 mr-2" />
          )}
          Mitarbeiter synchronisieren
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mitarbeiter ins Organigramm übernehmen?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Aktion verknüpft alle bestehenden Mitarbeiter mit passenden Organisationseinheiten 
            basierend auf deren Abteilungsnamen. Mitarbeiter, die bereits verknüpft sind, werden übersprungen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleMigration}>
            Synchronisieren
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
