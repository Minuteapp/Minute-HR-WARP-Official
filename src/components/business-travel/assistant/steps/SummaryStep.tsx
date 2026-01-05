
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  CalendarRange, 
  Building, 
  Home, 
  Plane, 
  Car, 
  Train, 
  Bus,
  Users,
  Hotel,
  FileText,
  BadgeDollarSign
} from "lucide-react";
import { AssistantStepData, TransportType } from "@/types/business-travel";
import { formatCurrency } from "@/utils/currencyUtils";

interface SummaryStepProps {
  data: AssistantStepData;
  updateData: (data: Partial<AssistantStepData>) => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ data }) => {
  // Funktion zum Anzeigen des passenden Transport-Icons
  const getTransportIcon = (type?: TransportType) => {
    switch (type) {
      case 'plane':
        return <Plane className="h-5 w-5" />;
      case 'car':
        return <Car className="h-5 w-5" />;
      case 'train':
        return <Train className="h-5 w-5" />;
      case 'public_transport':
        return <Bus className="h-5 w-5" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Zusammenfassung Ihrer Reise</h2>
        <p className="text-gray-600 mb-6">
          Bitte überprüfen Sie alle Details Ihrer Reiseplanung. Nach dem Absenden wird Ihr Antrag zur Genehmigung weitergeleitet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Reiseziel</h3>
                  <p className="text-gray-600">{data.destination || 'Nicht angegeben'}</p>
                  {data.destination_address && (
                    <p className="text-sm text-gray-500 mt-1">{data.destination_address}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Reisezweck</h3>
                  <p className="text-gray-600">{data.purpose || 'Nicht angegeben'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {data.purpose_type === 'customer_meeting' && 'Kundentermin'}
                    {data.purpose_type === 'trade_fair' && 'Messe'}
                    {data.purpose_type === 'training' && 'Schulung'}
                    {data.purpose_type === 'internal_meeting' && 'Interne Besprechung'}
                    {data.purpose_type === 'other' && 'Sonstiges'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <CalendarRange className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Zeitraum</h3>
                  {data.start_date && data.end_date ? (
                    <p className="text-gray-600">
                      {new Date(data.start_date).toLocaleDateString()} bis {new Date(data.end_date).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-gray-600">Nicht angegeben</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  {getTransportIcon(data.transport)}
                </div>
                <div>
                  <h3 className="font-medium">Transport</h3>
                  <p className="text-gray-600">
                    {data.transport === 'car' && 'Auto'}
                    {data.transport === 'train' && 'Bahn'}
                    {data.transport === 'plane' && 'Flugzeug'}
                    {data.transport === 'public_transport' && 'ÖPNV'}
                    {data.transport === 'taxi' && 'Taxi'}
                    {data.transport === 'rental_car' && 'Mietwagen'}
                    {!data.transport && 'Nicht angegeben'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.hotel_required && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Hotel className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Unterkunft</h3>
                    <p className="text-gray-600">{data.hotel_details || 'Hotel erforderlich (keine Details)'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.fellow_travelers && data.fellow_travelers.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Mitreisende ({data.fellow_travelers.length})</h3>
                    <p className="text-gray-600">{data.fellow_travelers.join(', ')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.budget_id || data.project_id || data.cost_center && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <BadgeDollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Budget</h3>
                    {data.budget_id && <p className="text-gray-600">Budget: {data.budget_id}</p>}
                    {data.project_id && <p className="text-gray-600">Projekt: {data.project_id}</p>}
                    {data.cost_center && <p className="text-gray-600">Kostenstelle: {data.cost_center}</p>}
                    {data.estimated_cost && (
                      <p className="text-gray-600 font-medium mt-1">
                        Geschätzte Kosten: {formatCurrency(data.estimated_cost, 'EUR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.documents && data.documents.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Dokumente ({data.documents.length})</h3>
                    <ul className="text-gray-600 text-sm mt-1">
                      {data.documents.map((doc: File, index: number) => (
                        <li key={index} className="flex items-center gap-1">
                          <FileText className="h-3 w-3" /> {doc.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-amber-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-amber-800 mb-2">Hinweis</h3>
        <p className="text-sm text-amber-700">
          Nach dem Absenden wird Ihr Antrag zur Genehmigung an Ihren Vorgesetzten weitergeleitet. 
          Sie werden per E-Mail über den Status informiert.
        </p>
      </div>
    </div>
  );
};

export default SummaryStep;
