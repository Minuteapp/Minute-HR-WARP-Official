

import React from 'react';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Calendar, Users, ClipboardCheck, Flag, BarChart, CheckCircle2, Circle } from 'lucide-react';
import { Initiative } from '@/stores/useEnvironmentStore';

interface InitiativeTimelineProps {
  initiatives: Initiative[];
}

export const InitiativeTimeline: React.FC<InitiativeTimelineProps> = ({ initiatives }) => {
  const sortedInitiatives = [...initiatives].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  // Gruppierung der Initiativen nach Jahr und Monat
  const groupedByYearMonth: Record<string, Initiative[]> = {};
  
  sortedInitiatives.forEach((initiative) => {
    const date = new Date(initiative.startDate);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groupedByYearMonth[yearMonth]) {
      groupedByYearMonth[yearMonth] = [];
    }
    
    groupedByYearMonth[yearMonth].push(initiative);
  });

  // Hilfsfunktion zur Bestimmung des Status-Icons
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <BarChart className="h-5 w-5 text-blue-500" />;
      case 'planned':
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case 'archived':
        return <Flag className="h-5 w-5 text-gray-500" />;
      default:
        return <Circle className="h-5 w-5 text-purple-500" />;
    }
  };

  // Hilfsfunktion zum Formatieren des Monatsnamen
  const formatYearMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-10 py-4">
      {Object.keys(groupedByYearMonth)
        .sort()
        .map((yearMonth) => (
          <div key={yearMonth} className="relative">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
              <h3 className="text-lg font-medium mb-2">{formatYearMonth(yearMonth)}</h3>
            </div>
            
            <div className="relative ml-6 space-y-6">
              {/* Vertikale Zeitleinie */}
              <div className="absolute left-0 top-0 bottom-0 ml-[-12px] w-0.5 bg-gray-200" />
              
              {groupedByYearMonth[yearMonth].map((initiative) => (
                <div key={initiative.id} className="relative">
                  {/* Zeitleinien-Punkt */}
                  <div className="absolute left-[-24px] mt-1 w-4 h-4 rounded-full bg-green-100 border-2 border-green-500 z-10" />
                  
                  <Card className="ml-6">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Leaf className="h-4 w-4 text-green-500" />
                            <h4 className="font-semibold">{initiative.title}</h4>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{initiative.description}</p>
                          
                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {new Date(initiative.startDate).toLocaleDateString('de-DE')}
                                {initiative.endDate ? ` - ${new Date(initiative.endDate).toLocaleDateString('de-DE')}` : ' - fortlaufend'}
                              </span>
                            </div>
                            
                            {initiative.responsible && (
                              <div className="flex items-center text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{initiative.responsible}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-gray-500">
                              <ClipboardCheck className="h-4 w-4 mr-1" />
                              <span>{initiative.progress}% abgeschlossen</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
                            {getStatusIcon(initiative.status)}
                            <span className="ml-1">
                              {initiative.status === 'in-progress' ? 'In Bearbeitung' : 
                               initiative.status === 'completed' ? 'Abgeschlossen' :
                               initiative.status === 'planned' ? 'Geplant' :
                               initiative.status === 'archived' ? 'Archiviert' :
                               initiative.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}

      {Object.keys(groupedByYearMonth).length === 0 && (
        <div className="text-center py-10">
          <h4 className="text-lg font-medium text-gray-500">Keine Initiativen gefunden</h4>
          <p className="text-gray-400 mt-2">Füge neue Umweltinitiativen hinzu, um sie in der Zeitleiste zu sehen.</p>
        </div>
      )}
    </div>
  );
};

