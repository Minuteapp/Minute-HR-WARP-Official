
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShiftConflict } from '@/hooks/useAbsenceShiftManagement';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertCircle, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import { useShiftPlanning } from '@/hooks/useShiftPlanning';

interface ShiftConflictResolutionProps {
  conflicts: ShiftConflict[];
  onResolutionChange: (method: 'auto' | 'manual' | 'unplan', assignments?: Record<string, string>) => void;
  isLoading?: boolean;
}

export const ShiftConflictResolution: React.FC<ShiftConflictResolutionProps> = ({
  conflicts,
  onResolutionChange,
  isLoading = false,
}) => {
  const [resolutionMethod, setResolutionMethod] = useState<'auto' | 'manual' | 'unplan'>('auto');
  const [manualAssignments, setManualAssignments] = useState<Record<string, string>>({});
  const { shiftTypes } = useShiftPlanning();

  // Initialisiere manuelle Zuweisungen mit leeren Werten für alle Konflikte
  useEffect(() => {
    const initialAssignments: Record<string, string> = {};
    conflicts.forEach(conflict => {
      initialAssignments[conflict.shift.id] = '';
    });
    setManualAssignments(initialAssignments);
  }, [conflicts]);

  // Aktualisiere die übergeordnete Komponente, wenn sich die Auflösungsmethode ändert
  useEffect(() => {
    onResolutionChange(
      resolutionMethod,
      resolutionMethod === 'manual' ? manualAssignments : undefined
    );
  }, [resolutionMethod, manualAssignments, onResolutionChange]);

  // Handler für die Änderung eines manuellen Ersatzes
  const handleReplacementChange = (shiftId: string, employeeId: string) => {
    setManualAssignments(prev => ({
      ...prev,
      [shiftId]: employeeId
    }));
  };

  // Finde den Schichttyp-Namen
  const getShiftTypeName = (shiftTypeId: string) => {
    const shiftType = shiftTypes.find(type => type.id === shiftTypeId);
    return shiftType ? shiftType.name : 'Unbekannte Schicht';
  };

  // Zeigt die Ersatzoptionen für eine Schicht an
  const renderReplacementOptions = (conflict: ShiftConflict) => {
    if (conflict.replacementOptions.length === 0) {
      return (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Keine Ersatzmitarbeiter verfügbar</AlertTitle>
          <AlertDescription>
            Für diese Schicht stehen keine qualifizierten Ersatzmitarbeiter zur Verfügung.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Select
        value={manualAssignments[conflict.shift.id] || ''}
        onValueChange={(value) => handleReplacementChange(conflict.shift.id, value)}
        disabled={resolutionMethod !== 'manual' || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Ersatzmitarbeiter auswählen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Niemand (Schicht entplanen)</SelectItem>
          {conflict.replacementOptions.map(employee => (
            <SelectItem key={employee.id} value={employee.id}>
              {employee.name} ({employee.department})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center text-orange-900">
          <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
          Schichtkonflikte gefunden
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-800 mb-4">
          Im ausgewählten Zeitraum sind {conflicts.length} Schicht(en) geplant, 
          die mit der Abwesenheit kollidieren. Wie möchten Sie diese Konflikte behandeln?
        </p>

        <RadioGroup
          value={resolutionMethod}
          onValueChange={(value) => setResolutionMethod(value as any)}
          className="space-y-3 mb-4"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto" className="font-medium cursor-pointer">
              Automatisch Ersatz zuweisen
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual" className="font-medium cursor-pointer">
              Manuell Ersatz auswählen
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unplan" id="unplan" />
            <Label htmlFor="unplan" className="font-medium cursor-pointer">
              Alle betroffenen Schichten entplanen
            </Label>
          </div>
        </RadioGroup>

        <div className="space-y-4 mt-2">
          {conflicts.map((conflict) => (
            <div key={conflict.shift.id} className="border rounded-md p-3 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-600" />
                    {getShiftTypeName(conflict.shift.type)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(conflict.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
                {conflict.replacementEmployee && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center">
                    <UserCheck className="h-3 w-3 mr-1" />
                    {conflict.autoAssigned ? 'Automatisch zugewiesen' : 'Ersatz gewählt'}
                  </div>
                )}
              </div>

              {resolutionMethod === 'manual' && (
                <div className="mt-3">
                  <Label htmlFor={`replacement-${conflict.shift.id}`} className="text-sm mb-1 block">
                    Ersatzmitarbeiter
                  </Label>
                  {renderReplacementOptions(conflict)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-gray-500 italic">
          Hinweis: Alle betroffenen Mitarbeiter werden automatisch über die Änderungen informiert.
        </p>
      </CardFooter>
    </Card>
  );
};
