
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Plus, Filter, Bell } from "lucide-react";
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const MobileAbsenceDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'team'>('overview');
  const { absenceRequests, statistics } = useAbsenceManagement();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Genehmigt';
      case 'pending': return 'Ausstehend';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Urlaub';
      case 'sick_leave': return 'Krankmeldung';
      case 'parental': return 'Elternzeit';
      case 'business_trip': return 'Dienstreise';
      default: return type;
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm px-3 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">Abwesenheiten</h1>
            <p className="text-[11px] text-gray-500">Übersicht und Verwaltung</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b px-3 overflow-x-hidden">
        <div className="flex">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 h-9 text-[11px]"
            onClick={() => setActiveTab('overview')}
          >
            Übersicht
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'default' : 'ghost'}
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 h-9 text-[11px]"
            onClick={() => setActiveTab('requests')}
          >
            Anträge
          </Button>
          <Button
            variant={activeTab === 'team' ? 'default' : 'ghost'}
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 h-9 text-[11px]"
            onClick={() => setActiveTab('team')}
          >
            Team
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-3 overflow-x-hidden">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-2">
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500">Verfügbare Urlaubstage</p>
                    <p className="text-base font-semibold">25</p>
                  </div>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500">Bereits genommen</p>
                    <p className="text-base font-semibold">8</p>
                  </div>
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* Upcoming Absences */}
            <div>
              <h3 className="text-[11px] font-medium text-gray-900 mb-2">Kommende Abwesenheiten</h3>
              <div className="space-y-2">
                {absenceRequests?.slice(0, 3).map((request) => (
                  <Card key={request.id} className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-medium">{getTypeLabel(request.type)}</span>
                          <Badge variant="secondary" className={`text-white text-[8px] h-4 px-1.5 ${getStatusColor(request.status)}`}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </div>
                        <p className="text-[9px] text-gray-500">
                          {format(new Date(request.start_date), 'dd.MM.yyyy', { locale: de })} - 
                          {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-medium text-gray-900">Meine Anträge</h3>
              <Button size="sm" variant="outline" className="h-7 text-[10px]">
                <Plus className="h-3 w-3 mr-1" />
                Neu
              </Button>
            </div>
            
            <div className="space-y-2">
              {absenceRequests?.map((request) => (
                <Card key={request.id} className="p-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[11px]">{getTypeLabel(request.type)}</span>
                      <Badge variant="secondary" className={`text-white text-[8px] h-4 px-1.5 ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <div className="text-[9px] text-gray-500">
                      <div>{format(new Date(request.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}</div>
                      <div className="mt-0.5">Tage: {calculateDays(request.start_date, request.end_date)}</div>
                    </div>
                    {request.reason && (
                      <p className="text-[9px] text-gray-600 bg-gray-50 p-2 rounded">{request.reason}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-medium text-gray-900">Team-Abwesenheiten</h3>
            
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[9px] font-medium">MK</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium">Max Kellner</p>
                    <p className="text-[9px] text-gray-500">Urlaub</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-500">15.01 - 20.01</p>
                  <Badge variant="success" className="text-[8px] h-4 px-1.5">
                    Genehmigt
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[9px] font-medium">AS</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium">Anna Schmidt</p>
                    <p className="text-[9px] text-gray-500">Krankmeldung</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-500">Heute</p>
                  <Badge variant="warning" className="text-[8px] h-4 px-1.5">
                    Ausstehend
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAbsenceDashboard;
