import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Calendar, TrendingUp, FileText, Filter, Download, MoreVertical, 
  ChevronDown, FileCheck, TrendingDown 
} from 'lucide-react';
import { AdvancedFilterDialog } from './AdvancedFilterDialog';
import { TeamStatusOverviewDialog } from './TeamStatusOverviewDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { SickLeaveDetailsDialog } from './SickLeaveDetailsDialog';
import { ApprovalDialog } from './ApprovalDialog';
import type { SickLeave } from '@/types/sick-leave';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: string;
  iconColor: string;
}

const KPICard = ({ title, value, icon, subtitle, trend, iconColor }: KPICardProps) => (
  <Card className="p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend.startsWith('↓') ? 'text-red-600' : 'text-green-600'}`}>
            {trend}
          </p>
        )}
      </div>
      <div className={`p-2 rounded-lg ${iconColor}`}>{icon}</div>
    </div>
  </Card>
);

const mockSickLeaves: SickLeave[] = [];

const mockTeamMembers: { name: string; role: string; status: string; avatar: string }[] = [];

export const TeamSickLeaveOverview = () => {
  const [selectedSickLeave, setSelectedSickLeave] = useState<SickLeave | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedDepartment, setSelectedDepartment] = useState('Alle Abteilungen');
  const [selectedStatus, setSelectedStatus] = useState('Alle Status');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [teamStatusOpen, setTeamStatusOpen] = useState(false);

  const getDaysCount = (startDate: string, endDate?: string) => {
    if (!endDate) return 1;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  const getStatusBadge = (status: string, hasDoctor: boolean) => {
    if (status === 'approved') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Genehmigt</Badge>;
    }
    if (status === 'pending' && !hasDoctor) {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Attest erforderlich</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Ausstehend</Badge>;
  };

  const activeCount = mockTeamMembers.filter(m => m.status === 'active').length;
  const sickCount = mockTeamMembers.filter(m => m.status === 'sick').length;
  const vacationCount = mockTeamMembers.filter(m => m.status === 'vacation').length;
  const totalCount = mockTeamMembers.length;
  const activePercentage = Math.round((activeCount / totalCount) * 100);

  // Heatmap data - initially empty
  const heatmapData: { week: string; days: number[] }[] = [];

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value === 1) return 'bg-blue-200';
    if (value === 2) return 'bg-blue-400';
    if (value === 3) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard 
          title="Team Krankmeldungen" 
          value={mockSickLeaves.length} 
          subtitle="Aktueller Monat • Mein Team" 
          icon={<Activity className="w-5 h-5 text-red-600" />} 
          iconColor="bg-red-50" 
        />
        <KPICard 
          title="Durchschnittliche Dauer" 
          value="-" 
          subtitle="Keine Daten" 
          icon={<Calendar className="w-5 h-5 text-orange-600" />} 
          iconColor="bg-orange-50" 
        />
        <KPICard 
          title="Team Krankenquote" 
          value="-" 
          subtitle="Keine Daten" 
          icon={<TrendingUp className="w-5 h-5 text-teal-600" />} 
          iconColor="bg-teal-50" 
        />
        <KPICard 
          title="Offene Atteste" 
          value="0" 
          subtitle="Noch nicht eingereicht" 
          icon={<FileText className="w-5 h-5 text-purple-600" />} 
          iconColor="bg-purple-50" 
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Zeitraum wählen */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Zeitraum wählen
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Schnellauswahl</h4>
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start">Heute</Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Gestern</Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Letzte 7 Tage</Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Letzte 30 Tage</Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Dieser Monat</Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Letzter Monat</Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Dieses Jahr</Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Benutzerdefinierter Zeitraum</h4>
                  <p className="text-xs text-gray-500 mb-2">Wählen Sie Start- und Enddatum</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Von</label>
                      <Button variant="outline" size="sm" className="w-full justify-start text-gray-500">
                        Nicht gewählt
                      </Button>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Bis</label>
                      <Button variant="outline" size="sm" className="w-full justify-start text-gray-500">
                        Nicht gewählt
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Startdatum</label>
                      <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} className="pointer-events-auto" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Enddatum</label>
                      <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} className="pointer-events-auto" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">Zurücksetzen</Button>
                    <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700">Anwenden</Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Alle Abteilungen */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {selectedDepartment}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedDepartment('Alle Abteilungen')}>Alle Abteilungen</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedDepartment('Marketing')}>Marketing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedDepartment('IT')}>IT</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedDepartment('Vertrieb')}>Vertrieb</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedDepartment('Produktion')}>Produktion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Alle Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {selectedStatus}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedStatus('Alle Status')}>Alle Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('Genehmigt')}>Genehmigt</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('Ausstehend')}>Ausstehend</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('Attest erforderlich')}>Attest erforderlich</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="gap-2" onClick={() => setAdvancedFilterOpen(true)}>
            <Filter className="w-4 h-4" />
            Mehr Filter
          </Button>

          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Layout: Liste + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Spalte: Krankmeldungen Liste (2/3) */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Team Krankmeldungen</h3>
          
          {mockSickLeaves.map((sl) => (
            <Card key={sl.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedSickLeave(sl); setDetailsDialogOpen(true); }}>
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">
                    {sl.employee_name?.split(' ').map(n => n[0]).join('') || '??'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">{sl.employee_name}</span>
                    {sl.has_contacted_doctor && <FileCheck className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                  <p className="text-xs text-gray-600">
                    {sl.department} • {format(new Date(sl.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(sl.end_date || sl.start_date), 'dd.MM.yyyy', { locale: de })} • {getDaysCount(sl.start_date, sl.end_date)} Tage
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(sl.status, sl.has_contacted_doctor || false)}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedSickLeave(sl); setDetailsDialogOpen(true); }}>Details anzeigen</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedSickLeave(sl); setApprovalAction('approve'); setApprovalDialogOpen(true); }}>Genehmigen</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedSickLeave(sl); setApprovalAction('reject'); setApprovalDialogOpen(true); }}>Ablehnen</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Rechte Spalte: Team Status Sidebar (1/3) */}
        <div className="space-y-4">
          {/* Team Status Card */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Team Status</h3>
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{activePercentage}% anwesend</Badge>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">{activeCount}</div>
                <div className="text-xs text-green-600">Anwesend</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-700">{sickCount}</div>
                <div className="text-xs text-red-600">Krank</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{vacationCount}</div>
                <div className="text-xs text-blue-600">Urlaub</div>
              </div>
            </div>

            {/* Team Members List */}
            <div className="space-y-2 mb-3">
              {mockTeamMembers.slice(0, 4).map((member, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-medium">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.role}</p>
                  </div>
                  <Badge className={
                    member.status === 'active' ? 'bg-green-100 text-green-700' :
                    member.status === 'sick' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }>
                    {member.status === 'active' ? 'aktiv' : member.status === 'sick' ? 'krank' : 'urlaub'}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-600">Gesamt: {mockTeamMembers.slice(0, 4).length} von {totalCount}</span>
              <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={() => setTeamStatusOpen(true)}>Details →</Button>
            </div>
          </Card>

          {/* Krankheitsverteilung nach Kalenderwoche */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Krankheitsverteilung nach Kalenderwoche</h3>
              <TrendingDown className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-8 gap-1 text-xs text-gray-500">
                <div></div>
                <div className="text-center">Mo</div>
                <div className="text-center">Di</div>
                <div className="text-center">Mi</div>
                <div className="text-center">Do</div>
                <div className="text-center">Fr</div>
                <div className="text-center">Sa</div>
                <div className="text-center">So</div>
              </div>

              {heatmapData.map((week, idx) => (
                <div key={idx} className="grid grid-cols-8 gap-1">
                  <div className="text-xs text-gray-600 flex items-center">{week.week}</div>
                  {week.days.map((value, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`aspect-square rounded ${getHeatmapColor(value)}`}
                      title={`${value} Krankmeldungen`}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-600">Weniger</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded bg-gray-100" />
                <div className="w-3 h-3 rounded bg-blue-200" />
                <div className="w-3 h-3 rounded bg-blue-400" />
                <div className="w-3 h-3 rounded bg-blue-600" />
                <div className="w-3 h-3 rounded bg-blue-800" />
              </div>
              <span className="text-xs text-gray-600">Mehr</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Dialoge */}
      <SickLeaveDetailsDialog 
        open={detailsDialogOpen} 
        onOpenChange={setDetailsDialogOpen} 
        sickLeave={selectedSickLeave} 
        canApprove={true} 
        onApprove={(sl) => { 
          setSelectedSickLeave(sl); 
          setApprovalAction('approve'); 
          setApprovalDialogOpen(true); 
        }} 
        onReject={(sl) => { 
          setSelectedSickLeave(sl); 
          setApprovalAction('reject'); 
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
          setDetailsDialogOpen(false); 
        }} 
      />
      <AdvancedFilterDialog 
        open={advancedFilterOpen}
        onOpenChange={setAdvancedFilterOpen}
      />
      <TeamStatusOverviewDialog 
        open={teamStatusOpen}
        onOpenChange={setTeamStatusOpen}
      />
    </div>
  );
};

export default TeamSickLeaveOverview;
