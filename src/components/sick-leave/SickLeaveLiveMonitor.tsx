import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, Activity, CheckCircle2, MoreVertical } from 'lucide-react';
import { SickLeaveDetailsDialog } from './SickLeaveDetailsDialog';
import { ApprovalDialog } from './ApprovalDialog';
import type { SickLeave } from '@/types/sick-leave';

const KPICard = ({ title, value, icon, subtitle, iconColor }: any) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold mb-1">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg ${iconColor}`}>{icon}</div>
    </div>
  </Card>
);

export const SickLeaveLiveMonitor = () => {
  const [selectedSickLeave, setSelectedSickLeave] = useState<SickLeave | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  
  // Echte Daten aus Datenbank - zunächst leeres Array
  const [pendingLeaves, setPendingLeaves] = useState<SickLeave[]>([]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPICard 
            title="Ausstehende Genehmigungen" 
            value={pendingLeaves.length} 
            subtitle="Unternehmensweite Genehmigungen" 
            icon={<FileText className="w-5 h-5 text-orange-600" />} 
            iconColor="bg-orange-50" 
          />
          <KPICard 
            title="Durchschnittliche Bearbeitungszeit" 
            value="-" 
            subtitle="Keine Daten" 
            icon={<Activity className="w-5 h-5 text-green-600" />} 
            iconColor="bg-green-50" 
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Genehmigungspipeline</h2>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Ausstehende Genehmigungen ({pendingLeaves.length})</h3>
            {pendingLeaves.length === 0 ? (
              <Card className="p-8 bg-green-50 border-green-200">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-green-900 mb-2">Keine ausstehenden Genehmigungen</h4>
                  <p className="text-sm text-green-700">Alle Krankmeldungen wurden bearbeitet. Großartige Arbeit!</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map((sl) => (
                  <Card key={sl.id} className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-yellow-100 text-yellow-700">
                          {sl.employee_name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sl.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{sl.department}</p>
                      </div>
                      <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Ausstehend</Badge>
                      <Button 
                        size="sm" 
                        onClick={() => { 
                          setSelectedSickLeave(sl); 
                          setApprovalAction('approve'); 
                          setApprovalDialogOpen(true); 
                        }} 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Genehmigen
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => { 
                          setSelectedSickLeave(sl); 
                          setApprovalAction('reject'); 
                          setApprovalDialogOpen(true); 
                        }} 
                        className="border-red-200 text-red-700"
                      >
                        Ablehnen
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => { 
                          setSelectedSickLeave(sl); 
                          setDetailsDialogOpen(true); 
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <SickLeaveDetailsDialog 
          open={detailsDialogOpen} 
          onOpenChange={setDetailsDialogOpen} 
          sickLeave={selectedSickLeave} 
          canApprove={true} 
          onApprove={(sl) => { 
            setSelectedSickLeave(sl); 
            setApprovalAction('approve'); 
            setDetailsDialogOpen(false); 
            setApprovalDialogOpen(true); 
          }} 
          onReject={(sl) => { 
            setSelectedSickLeave(sl); 
            setApprovalAction('reject'); 
            setDetailsDialogOpen(false); 
            setApprovalDialogOpen(true); 
          }} 
        />
        <ApprovalDialog 
          open={approvalDialogOpen} 
          onOpenChange={setApprovalDialogOpen} 
          sickLeave={selectedSickLeave} 
          action={approvalAction} 
          onSuccess={() => { 
            setApprovalDialogOpen(false); 
            if (selectedSickLeave) {
              setPendingLeaves(prev => prev.filter(l => l.id !== selectedSickLeave.id)); 
            }
          }} 
        />
      </div>
    </div>
  );
};

export default SickLeaveLiveMonitor;