
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Edit, Calendar } from "lucide-react";
import { useComplianceAudits } from '@/hooks/useCompliance';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned': return 'bg-blue-500';
    case 'in_progress': return 'bg-yellow-500';
    case 'completed': return 'bg-green-500';
    case 'cancelled': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

const getRatingColor = (rating: string | undefined) => {
  switch (rating) {
    case 'excellent': return 'bg-green-600';
    case 'good': return 'bg-green-500';
    case 'satisfactory': return 'bg-yellow-500';
    case 'needs_improvement': return 'bg-orange-500';
    case 'unsatisfactory': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

export const ComplianceAuditsList = () => {
  const { data: audits, isLoading } = useComplianceAudits();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAudits = audits?.filter(audit => 
    audit.audit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.auditor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lade Audits...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Compliance-Audits</CardTitle>
              <CardDescription>
                Verwaltung und Überwachung aller Compliance-Audits
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neues Audit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Audits durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredAudits?.map((audit) => (
              <Card key={audit.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{audit.audit_name}</h3>
                        <Badge className={`text-white ${getStatusColor(audit.status)}`}>
                          {audit.status === 'planned' && 'Geplant'}
                          {audit.status === 'in_progress' && 'Laufend'}
                          {audit.status === 'completed' && 'Abgeschlossen'}
                          {audit.status === 'cancelled' && 'Abgebrochen'}
                        </Badge>
                        <Badge variant="outline">
                          {audit.audit_type === 'internal' && 'Intern'}
                          {audit.audit_type === 'external' && 'Extern'}
                          {audit.audit_type === 'regulatory' && 'Regulatorisch'}
                        </Badge>
                        {audit.overall_rating && (
                          <Badge className={`text-white ${getRatingColor(audit.overall_rating)}`}>
                            {audit.overall_rating === 'excellent' && 'Ausgezeichnet'}
                            {audit.overall_rating === 'good' && 'Gut'}
                            {audit.overall_rating === 'satisfactory' && 'Zufriedenstellend'}
                            {audit.overall_rating === 'needs_improvement' && 'Verbesserungsbedarf'}
                            {audit.overall_rating === 'unsatisfactory' && 'Unzureichend'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {audit.auditor_name && (
                          <span>Auditor: {audit.auditor_name}</span>
                        )}
                        {audit.scope && (
                          <span>Bereich: {audit.scope}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {audit.planned_start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Geplant: {format(new Date(audit.planned_start_date), 'dd.MM.yyyy', { locale: de })}
                          </span>
                        )}
                        {audit.findings_count > 0 && (
                          <span>{audit.findings_count} Befunde</span>
                        )}
                        {audit.critical_findings > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {audit.critical_findings} kritisch
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAudits?.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">Keine Audits gefunden</p>
                <p className="text-sm text-gray-400">
                  Erstellen Sie ein neues Audit oder passen Sie die Suchbegriffe an
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
