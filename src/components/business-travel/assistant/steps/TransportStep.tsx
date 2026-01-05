import React from 'react';
import { Label } from "@/components/ui/label";
import { AssistantStepData } from "@/types/business-travel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Car, Train, Plane, Bus } from "lucide-react"; // Taxi entfernt, da es nicht existiert

interface TransportStepProps {
  data: AssistantStepData;
  updateData: (data: Partial<AssistantStepData>) => void;
}

const TransportStep: React.FC<TransportStepProps> = ({ data, updateData }) => {
  const handleTransportChange = (transport: string) => {
    updateData({ transport: transport as any });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Wie werden Sie reisen?</h2>
        <p className="text-gray-600 mb-6">
          Bitte wählen Sie das Transportmittel aus, das Sie für Ihre Reise bevorzugen.
        </p>
      </div>

      <RadioGroup defaultValue={data.transport || 'car'} className="space-y-2" onValueChange={handleTransportChange}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center justify-center p-4 rounded-md bg-white shadow-sm border cursor-pointer peer-checked:bg-primary/10 peer-checked:ring-1 peer-checked:ring-primary transition-colors">
            <RadioGroupItem value="car" id="car" className="sr-only peer" />
            <Car className="h-5 w-5 text-gray-500 peer-checked:text-primary" />
            <span className="ml-2 font-medium">Auto</span>
          </label>

          <label className="flex items-center justify-center p-4 rounded-md bg-white shadow-sm border cursor-pointer peer-checked:bg-primary/10 peer-checked:ring-1 peer-checked:ring-primary transition-colors">
            <RadioGroupItem value="train" id="train" className="sr-only peer" />
            <Train className="h-5 w-5 text-gray-500 peer-checked:text-primary" />
            <span className="ml-2 font-medium">Zug</span>
          </label>

          <label className="flex items-center justify-center p-4 rounded-md bg-white shadow-sm border cursor-pointer peer-checked:bg-primary/10 peer-checked:ring-1 peer-checked:ring-primary transition-colors">
            <RadioGroupItem value="plane" id="plane" className="sr-only peer" />
            <Plane className="h-5 w-5 text-gray-500 peer-checked:text-primary" />
            <span className="ml-2 font-medium">Flugzeug</span>
          </label>

          <label className="flex items-center justify-center p-4 rounded-md bg-white shadow-sm border cursor-pointer peer-checked:bg-primary/10 peer-checked:ring-1 peer-checked:ring-primary transition-colors">
            <RadioGroupItem value="public_transport" id="public_transport" className="sr-only peer" />
            <Bus className="h-5 w-5 text-gray-500 peer-checked:text-primary" />
            <span className="ml-2 font-medium">ÖPNV</span>
          </label>
        </div>
      </RadioGroup>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Hinweis</h3>
        <p className="text-sm text-blue-700">
          Die Wahl des Transportmittels kann Einfluss auf die Reisekosten und die Genehmigung haben. 
          Bitte wählen Sie das wirtschaftlichste und sinnvollste Transportmittel für Ihre Reise.
        </p>
      </div>
    </div>
  );
};

export default TransportStep;
