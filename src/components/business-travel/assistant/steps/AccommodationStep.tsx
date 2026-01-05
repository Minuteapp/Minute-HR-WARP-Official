
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { AssistantStepData } from "@/types/business-travel";

interface AccommodationStepProps {
  data: AssistantStepData;
  updateData: (data: Partial<AssistantStepData>) => void;
}

const AccommodationStep: React.FC<AccommodationStepProps> = ({ data, updateData }) => {
  const [hotelRequired, setHotelRequired] = useState<boolean>(
    data.hotel_required || false
  );
  const [hotelDetails, setHotelDetails] = useState<string>(
    data.hotel_details || ''
  );
  const [hotelType, setHotelType] = useState<string>(
    data.hotel_details?.includes('Standardhotel') ? 'standard' : 
    data.hotel_details?.includes('Businesshotel') ? 'business' : 
    data.hotel_details?.includes('Luxushotel') ? 'luxury' : 
    'standard'
  );

  const handleHotelRequiredChange = (value: boolean) => {
    setHotelRequired(value);
    updateData({ hotel_required: value });
    
    if (!value) {
      setHotelDetails('');
      updateData({ hotel_details: '' });
    }
  };

  const handleHotelTypeChange = (value: string) => {
    setHotelType(value);
    let newDetails = '';
    
    if (value === 'standard') {
      newDetails = 'Standardhotel (bis 100€/Nacht)';
    } else if (value === 'business') {
      newDetails = 'Businesshotel (bis 150€/Nacht)';
    } else if (value === 'luxury') {
      newDetails = 'Luxushotel (über 150€/Nacht)';
    }
    
    setHotelDetails(newDetails);
    updateData({ hotel_details: newDetails });
  };

  const handleHotelDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHotelDetails(e.target.value);
    updateData({ hotel_details: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Benötigen Sie eine Unterkunft?</h2>
        <p className="text-gray-600 mb-6">
          Wenn Ihre Reise eine Übernachtung erfordert, können Sie hier eine Unterkunft anfordern.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="hotel-required" 
          checked={hotelRequired}
          onCheckedChange={handleHotelRequiredChange}
        />
        <Label htmlFor="hotel-required">Ja, ich benötige eine Unterkunft</Label>
      </div>

      {hotelRequired && (
        <div className="space-y-4 pt-2 pl-2 border-l-2 border-gray-100">
          <div className="space-y-2">
            <Label>Hotelkategorie</Label>
            <RadioGroup 
              value={hotelType} 
              onValueChange={handleHotelTypeChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="standard" id="standard-hotel" />
                <Label htmlFor="standard-hotel" className="cursor-pointer">
                  <div className="font-medium">Standard</div>
                  <div className="text-xs text-gray-500">bis 100€/Nacht</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="business" id="business-hotel" />
                <Label htmlFor="business-hotel" className="cursor-pointer">
                  <div className="font-medium">Business</div>
                  <div className="text-xs text-gray-500">bis 150€/Nacht</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="luxury" id="luxury-hotel" />
                <Label htmlFor="luxury-hotel" className="cursor-pointer">
                  <div className="font-medium">Luxus</div>
                  <div className="text-xs text-gray-500">über 150€/Nacht</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel-details">Weitere Details zur Unterkunft (optional)</Label>
            <Textarea
              id="hotel-details"
              placeholder="z.B. spezieller Hotelname, Lage in der Nähe des Kunden, spezielle Anforderungen..."
              value={hotelDetails}
              onChange={handleHotelDetailsChange}
            />
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Hinweis zu Übernachtungen</h3>
        <p className="text-sm text-blue-700">
          Nach unserer Reiserichtlinie werden Unterkünfte bis max. 150€/Nacht (Standardkategorie) übernommen. 
          Höhere Kosten müssen separat begründet werden und benötigen eine zusätzliche Genehmigung.
        </p>
      </div>
    </div>
  );
};

export default AccommodationStep;
