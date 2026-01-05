import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Laptop, Check } from "lucide-react";
import type { RemoteEquipment, RemoteEquipmentItem } from "@/integrations/supabase/hooks/useEmployeeRemoteWork";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { RequestEquipmentDialog } from "./dialogs/RequestEquipmentDialog";

interface RemoteEquipmentCardProps {
  equipment?: RemoteEquipment;
  items?: RemoteEquipmentItem[];
}

export const RemoteEquipmentCard = ({ equipment, items }: RemoteEquipmentCardProps) => {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  
  if (!equipment) return null;

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'partially_used':
        return 'bg-yellow-500';
      case 'fully_used':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBudgetStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Verfügbar';
      case 'partially_used':
        return 'Teilweise genutzt';
      case 'fully_used':
        return 'Vollständig genutzt';
      default:
        return status;
    }
  };

  return (
    <Card className="bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Remote-Ausstattung</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Für Ausstattung & Möbel</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Homeoffice-Budget</span>
            <Badge className={`${getBudgetStatusColor(equipment.budget_status)} text-white`}>
              {getBudgetStatusLabel(equipment.budget_status)}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {equipment.budget_amount.toFixed(2)} {equipment.budget_currency}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {equipment.budget_type === 'one_time' ? '/ einmalig' : '/ jährlich'}
          </div>
          {equipment.budget_status !== 'available' && (
            <div className="mt-3 pt-3 border-t text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Genutzt:</span>
                <span className="font-medium">{equipment.budget_used.toFixed(2)} {equipment.budget_currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verbleibend:</span>
                <span className="font-medium">{equipment.budget_remaining.toFixed(2)} {equipment.budget_currency}</span>
              </div>
            </div>
          )}
        </div>
        
        {items && items.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Zugewiesene Ausstattung</h4>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-3 flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.item_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Zugewiesen: {format(new Date(item.assigned_date), 'MMM yyyy', { locale: de })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button variant="outline" className="w-full" size="sm" onClick={() => setRequestDialogOpen(true)}>
          Zusätzliche Ausstattung beantragen
        </Button>

        <RequestEquipmentDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          employeeId={equipment.employee_id}
          budget={{
            amount: equipment.budget_amount,
            used: equipment.budget_used,
            remaining: equipment.budget_remaining,
            currency: equipment.budget_currency,
          }}
        />
      </CardContent>
    </Card>
  );
};
