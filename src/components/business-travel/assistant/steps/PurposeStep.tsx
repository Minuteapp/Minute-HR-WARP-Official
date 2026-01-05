
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AssistantStepData, PurposeType } from "@/types/business-travel";
import { Building, Users, GraduationCap, Briefcase } from "lucide-react";

interface PurposeStepProps {
  data: AssistantStepData;
  updateData: (data: Partial<AssistantStepData>) => void;
}

const PurposeStep: React.FC<PurposeStepProps> = ({ data, updateData }) => {
  const [purposeType, setPurposeType] = useState<PurposeType>(
    data.purpose_type || 'customer_meeting'
  );
  const [purpose, setPurpose] = useState(data.purpose || '');

  const handlePurposeTypeChange = (value: PurposeType) => {
    setPurposeType(value);
    updateData({ purpose_type: value });
  };

  const handlePurposeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPurpose(e.target.value);
    updateData({ purpose: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Was ist der Grund Ihrer Reise?</h2>
        <p className="text-gray-600 mb-6">
          Bitte geben Sie den Zweck der Reise an, damit Ihre Führungskraft die Reise entsprechend einordnen kann.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="purpose-type">Art des Reisezwecks</Label>
          <RadioGroup 
            value={purposeType} 
            onValueChange={(value) => handlePurposeTypeChange(value as PurposeType)}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="customer_meeting" id="customer_meeting" />
              <Label htmlFor="customer_meeting" className="flex items-center cursor-pointer">
                <Building className="h-4 w-4 mr-2 text-blue-500" />
                Kundentermin
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="internal_meeting" id="internal_meeting" />
              <Label htmlFor="internal_meeting" className="flex items-center cursor-pointer">
                <Users className="h-4 w-4 mr-2 text-indigo-500" />
                Internes Meeting
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="training" id="training" />
              <Label htmlFor="training" className="flex items-center cursor-pointer">
                <GraduationCap className="h-4 w-4 mr-2 text-green-500" />
                Schulung / Training
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="trade_fair" id="trade_fair" />
              <Label htmlFor="trade_fair" className="flex items-center cursor-pointer">
                <Briefcase className="h-4 w-4 mr-2 text-amber-500" />
                Messe / Konferenz
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors md:col-span-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="cursor-pointer">
                Sonstiges
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Beschreibung des Reisezwecks</Label>
          <Textarea
            id="purpose"
            placeholder="z.B. Projektpräsentation bei Kunde ABC, Teilnahme an Schulung XYZ..."
            value={purpose}
            onChange={handlePurposeChange}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tipp für Ihre Genehmigung</h3>
        <p className="text-sm text-blue-700">
          Eine detaillierte Beschreibung des Reisezwecks erhöht die Wahrscheinlichkeit, 
          dass Ihre Reise schnell genehmigt wird. Geben Sie wenn möglich konkrete 
          Projektnamen, Kundennamen oder Veranstaltungen an.
        </p>
      </div>
    </div>
  );
};

export default PurposeStep;
