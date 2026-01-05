import { HomeofficeAgreementCard } from "./remote-work/HomeofficeAgreementCard";
import { RemoteEquipmentCard } from "./remote-work/RemoteEquipmentCard";
import { OfficeWorkspaceCard } from "./remote-work/OfficeWorkspaceCard";
import { FlexibleWorkTimeCard } from "./remote-work/FlexibleWorkTimeCard";
import { WorkationCard } from "./remote-work/WorkationCard";
import { RemoteWorkStatsCard } from "./remote-work/RemoteWorkStatsCard";
import { ConnectivitySupportCard } from "./remote-work/ConnectivitySupportCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Plus, Info, Save } from "lucide-react";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useHomeofficeAgreement,
  useRemoteEquipment,
  useRemoteEquipmentItems,
  useDeskBooking,
  useDeskBookingEntries,
  useWorkTimeModel,
  useWorkations,
  useWorkationSummary,
  useRemoteWorkStats,
  useConnectivitySupport,
  useUpsertHomeofficeAgreement,
} from "@/integrations/supabase/hooks/useEmployeeRemoteWork";

interface RemoteWorkTabProps {
  employeeId: string;
}

export const RemoteWorkTab = ({ employeeId }: RemoteWorkTabProps) => {
  const currentYear = new Date().getFullYear();
  const { canCreate, canEdit, permissions, isLoading: permissionsLoading } = useEnterprisePermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state for new agreement
  const [formData, setFormData] = useState({
    model_type: 'hybrid' as const,
    days_per_week: 2,
    remote_percentage: 40,
    office_percentage: 60,
    preferred_home_days: [] as string[],
    office_days: [] as string[],
    core_hours_start: '09:00',
    core_hours_end: '17:00',
    badge_color: 'blue',
  });
  
  // Admin, HR Admin und Manager sollten Remote Work anlegen können
  const hasRemoteWorkPermission = canCreate('employee_remote_work') || 
    canCreate('employees') || 
    canEdit('employees');
  
  const { data: homeofficeAgreementData, isLoading: loadingAgreement } = useHomeofficeAgreement(employeeId);
  const { data: remoteEquipmentData } = useRemoteEquipment(employeeId);
  const { data: equipmentItemsData } = useRemoteEquipmentItems(employeeId);
  const { data: deskBookingData } = useDeskBooking(employeeId);
  const { data: bookingEntriesData } = useDeskBookingEntries(employeeId);
  const { data: workTimeModelData } = useWorkTimeModel(employeeId);
  const { data: workationsData } = useWorkations(employeeId, currentYear);
  const { data: workationSummaryData } = useWorkationSummary(employeeId, currentYear);
  const { data: remoteWorkStatsData } = useRemoteWorkStats(employeeId, currentYear);
  const { data: connectivityData } = useConnectivitySupport(employeeId);

  const upsertAgreement = useUpsertHomeofficeAgreement();

  const homeofficeAgreement = homeofficeAgreementData || null;
  const remoteEquipment = remoteEquipmentData || null;
  const equipmentItems = equipmentItemsData || [];
  const deskBooking = deskBookingData || null;
  const bookingEntries = bookingEntriesData || [];
  const workTimeModel = workTimeModelData || null;
  const workations = workationsData || [];
  const workationSummary = workationSummaryData || null;
  const remoteWorkStats = remoteWorkStatsData || null;
  const connectivity = connectivityData || null;

  // Prüfen ob überhaupt Daten vorhanden sind
  const hasAnyData = homeofficeAgreement || remoteEquipment || deskBooking || 
                     workTimeModel || workations.length > 0 || remoteWorkStats || connectivity;

  const handleSaveAgreement = async () => {
    try {
      await upsertAgreement.mutateAsync({
        employee_id: employeeId,
        ...formData,
        valid_since: new Date().toISOString().split('T')[0],
      });
      toast.success('Homeoffice-Vereinbarung gespeichert');
      setShowAddDialog(false);
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const AddAgreementDialog = () => (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Homeoffice-Vereinbarung hinzufügen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Modell-Typ</Label>
            <Select 
              value={formData.model_type} 
              onValueChange={(val: any) => setFormData(prev => ({ ...prev, model_type: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="2_days_week">2 Tage/Woche</SelectItem>
                <SelectItem value="3_days_week">3 Tage/Woche</SelectItem>
                <SelectItem value="4_days_week">4 Tage/Woche</SelectItem>
                <SelectItem value="full_remote">Full Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Homeoffice-Tage/Woche</Label>
              <Input 
                type="number" 
                min={0} 
                max={5}
                value={formData.days_per_week}
                onChange={(e) => setFormData(prev => ({ ...prev, days_per_week: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Remote-Anteil (%)</Label>
              <Input 
                type="number" 
                min={0} 
                max={100}
                value={formData.remote_percentage}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    remote_percentage: val,
                    office_percentage: 100 - val
                  }));
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kernzeit Start</Label>
              <Input 
                type="time"
                value={formData.core_hours_start}
                onChange={(e) => setFormData(prev => ({ ...prev, core_hours_start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Kernzeit Ende</Label>
              <Input 
                type="time"
                value={formData.core_hours_end}
                onChange={(e) => setFormData(prev => ({ ...prev, core_hours_end: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveAgreement} disabled={upsertAgreement.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {upsertAgreement.isPending ? 'Speichert...' : 'Speichern'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!loadingAgreement && !hasAnyData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Remote Work</h2>
          {hasRemoteWorkPermission && (
            <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4" />
              Homeoffice-Vereinbarung hinzufügen
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Home className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Remote Work Daten vorhanden</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Für diesen Mitarbeiter wurden noch keine Remote Work Vereinbarungen hinterlegt.
            </p>
            {hasRemoteWorkPermission && (
              <Button className="mt-6 gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4" />
                Homeoffice-Vereinbarung hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
        
        <AddAgreementDialog />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Add-Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Remote Work</h2>
        {hasRemoteWorkPermission && (
          <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4" />
            Homeoffice-Vereinbarung hinzufügen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HomeofficeAgreementCard agreement={homeofficeAgreement} />
        <RemoteEquipmentCard equipment={remoteEquipment} items={equipmentItems} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OfficeWorkspaceCard deskBooking={deskBooking} bookingEntries={bookingEntries} />
        <FlexibleWorkTimeCard workTimeModel={workTimeModel} />
      </div>
      <WorkationCard summary={workationSummary} workations={workations} />
      <RemoteWorkStatsCard stats={remoteWorkStats} />
      <ConnectivitySupportCard connectivity={connectivity} />

      {/* Info Footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Remote Work Daten werden aus den entsprechenden HR-Systemen geladen.</span>
          </div>
        </CardContent>
      </Card>
      
      <AddAgreementDialog />
    </div>
  );
};
