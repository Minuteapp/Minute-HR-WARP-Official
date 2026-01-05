
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AssistantStepData } from "@/types/business-travel";
import { X, Plus, UserCircle } from "lucide-react";

interface TravelersStepProps {
  data: AssistantStepData;
  updateData: (data: Partial<AssistantStepData>) => void;
}

const TravelersStep: React.FC<TravelersStepProps> = ({ data, updateData }) => {
  const [fellowTravelers, setFellowTravelers] = useState<string[]>(
    data.fellow_travelers || []
  );
  const [newTraveler, setNewTraveler] = useState('');

  const handleAddTraveler = () => {
    if (newTraveler.trim()) {
      const updatedTravelers = [...fellowTravelers, newTraveler.trim()];
      setFellowTravelers(updatedTravelers);
      updateData({ fellow_travelers: updatedTravelers });
      setNewTraveler('');
    }
  };

  const handleRemoveTraveler = (index: number) => {
    const updatedTravelers = [...fellowTravelers];
    updatedTravelers.splice(index, 1);
    setFellowTravelers(updatedTravelers);
    updateData({ fellow_travelers: updatedTravelers });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTraveler();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Reisen weitere Personen mit?</h2>
        <p className="text-gray-600 mb-6">
          Falls andere Kolleginnen oder Kollegen an dieser Reise teilnehmen, können Sie diese hier hinzufügen.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="new-traveler" className="sr-only">Mitreisender</Label>
            <Input
              id="new-traveler"
              placeholder="Name des Mitreisenden eingeben"
              value={newTraveler}
              onChange={(e) => setNewTraveler(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button 
            type="button" 
            onClick={handleAddTraveler}
            disabled={!newTraveler.trim()}
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
          </Button>
        </div>

        {fellowTravelers.length > 0 && (
          <div className="space-y-2 mt-4">
            <Label>Mitreisende Personen:</Label>
            <ul className="space-y-2">
              {fellowTravelers.map((traveler, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{traveler}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTraveler(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {fellowTravelers.length === 0 && (
        <div className="text-center py-6 border border-dashed rounded-md">
          <UserCircle className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">Keine Mitreisenden ausgewählt</p>
          <p className="text-sm text-gray-400 mt-1">Fügen Sie Mitreisende hinzu, falls vorhanden</p>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Gut zu wissen</h3>
        <p className="text-sm text-blue-700">
          Mitreisende sollten separat ihre eigene Reisegenehmigung beantragen. 
          Diese Information hilft nur bei der Koordination von gemeinsamen Unterkünften und Transportmitteln.
        </p>
      </div>
    </div>
  );
};

export default TravelersStep;
