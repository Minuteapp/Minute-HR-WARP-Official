import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Info } from "lucide-react";
import { EditableField } from "../../shared/EditableField";
import { EmployeeTabEditProps } from "@/types/employee-tab-props.types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BehaviorTabProps extends EmployeeTabEditProps {}

export const BehaviorTab = ({ 
  employeeId,
  isEditing = false,
  onFieldChange,
  pendingChanges
}: BehaviorTabProps) => {
  const hasNoData = !pendingChanges?.behavior?.teamwork && 
                    !pendingChanges?.behavior?.communication && 
                    !pendingChanges?.behavior?.punctuality;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Verhalten
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasNoData && !isEditing && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Es liegen noch keine Verhaltensbewertungen für diesen Mitarbeiter vor.
              Bewertungen können im Bearbeitungsmodus hinzugefügt werden.
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <EditableField
            label="Teamfähigkeit"
            value={pendingChanges?.behavior?.teamwork ?? ""}
            isEditing={isEditing}
            onChange={(val) => onFieldChange?.('behavior', 'teamwork', val)}
            type="select"
            placeholder="Noch nicht bewertet"
            options={[
              { value: '', label: 'Noch nicht bewertet' },
              { value: 'Ausgezeichnet', label: 'Ausgezeichnet' },
              { value: 'Sehr gut', label: 'Sehr gut' },
              { value: 'Gut', label: 'Gut' },
              { value: 'Befriedigend', label: 'Befriedigend' },
              { value: 'Verbesserungsbedarf', label: 'Verbesserungsbedarf' }
            ]}
          />
          <EditableField
            label="Kommunikation"
            value={pendingChanges?.behavior?.communication ?? ""}
            isEditing={isEditing}
            onChange={(val) => onFieldChange?.('behavior', 'communication', val)}
            type="select"
            placeholder="Noch nicht bewertet"
            options={[
              { value: '', label: 'Noch nicht bewertet' },
              { value: 'Ausgezeichnet', label: 'Ausgezeichnet' },
              { value: 'Sehr gut', label: 'Sehr gut' },
              { value: 'Gut', label: 'Gut' },
              { value: 'Befriedigend', label: 'Befriedigend' },
              { value: 'Verbesserungsbedarf', label: 'Verbesserungsbedarf' }
            ]}
          />
          <EditableField
            label="Pünktlichkeit"
            value={pendingChanges?.behavior?.punctuality ?? ""}
            isEditing={isEditing}
            onChange={(val) => onFieldChange?.('behavior', 'punctuality', val)}
            type="select"
            placeholder="Noch nicht bewertet"
            options={[
              { value: '', label: 'Noch nicht bewertet' },
              { value: 'Ausgezeichnet', label: 'Ausgezeichnet' },
              { value: 'Sehr gut', label: 'Sehr gut' },
              { value: 'Gut', label: 'Gut' },
              { value: 'Befriedigend', label: 'Befriedigend' },
              { value: 'Verbesserungsbedarf', label: 'Verbesserungsbedarf' }
            ]}
          />
          <EditableField
            label="Anmerkungen"
            value={pendingChanges?.behavior?.notes ?? ""}
            isEditing={isEditing}
            onChange={(val) => onFieldChange?.('behavior', 'notes', val)}
            type="textarea"
            placeholder="Anmerkungen zum Verhalten..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
