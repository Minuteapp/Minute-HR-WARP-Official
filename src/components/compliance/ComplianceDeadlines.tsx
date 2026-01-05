
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { useComplianceDeadlines } from '@/hooks/useCompliance';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface ComplianceDeadlinesProps {
  limit?: number;
}

export const ComplianceDeadlines = ({ limit }: ComplianceDeadlinesProps) => {
  const { data: deadlines, isLoading } = useComplianceDeadlines();

  const filteredDeadlines = deadlines?.slice(0, limit);

  const getDeadlineStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);

    if (isBefore(due, today)) {
      return { status: 'overdue', color: 'bg-red-500', label: 'Überfällig' };
    } else if (isBefore(due, threeDaysFromNow)) {
      return { status: 'due_soon', color: 'bg-orange-500', label: 'Bald fällig' };
    } else {
      return { status: 'upcoming', color: 'bg-blue-500', label: 'Geplant' };
    }
  };

  const getDeadlineTypeLabel = (type: string) => {
    const labels = {
      'policy_review': 'Richtlinienüberprüfung',
      'audit_due': 'Audit fällig',
      'certification_renewal': 'Zertifikatserneuerung',
      'report_submission': 'Berichtsabgabe'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: limit || 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredDeadlines?.map((deadline) => {
        const deadlineInfo = getDeadlineStatus(deadline.due_date);
        
        return (
          <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${deadlineInfo.color} bg-opacity-20`}>
                {deadlineInfo.status === 'overdue' ? (
                  <AlertTriangle className={`h-4 w-4 text-red-600`} />
                ) : (
                  <Calendar className={`h-4 w-4 ${deadlineInfo.status === 'due_soon' ? 'text-orange-600' : 'text-blue-600'}`} />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{deadline.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{getDeadlineTypeLabel(deadline.deadline_type)}</span>
                  {deadline.department && (
                    <>
                      <span>•</span>
                      <span>{deadline.department}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {format(new Date(deadline.due_date), 'dd.MM.yyyy', { locale: de })}
                </p>
                <Badge className={`text-white ${deadlineInfo.color} text-xs`}>
                  {deadlineInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
      
      {filteredDeadlines?.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Keine anstehenden Deadlines</p>
        </div>
      )}
    </div>
  );
};
