
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Eye, Edit } from "lucide-react";
import { useComplianceCases } from '@/hooks/useCompliance';
import { CreateComplianceCaseDialog } from './CreateComplianceCaseDialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-blue-500';
    case 'in_progress': return 'bg-yellow-500';
    case 'escalated': return 'bg-red-500';
    case 'closed': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getCaseTypeLabel = (type: string) => {
  const labels = {
    'gdpr_request': 'DSGVO-Anfrage',
    'policy_violation': 'Richtlinienverletzung',
    'audit': 'Audit',
    'incident': 'Vorfall',
    'risk_assessment': 'Risikobeurteilung'
  };
  return labels[type as keyof typeof labels] || type;
};

export const ComplianceCasesList = () => {
  const { data: cases, isLoading } = useComplianceCases();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredCases = cases?.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.case_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lade Compliance-Fälle...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
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
              <CardTitle>Compliance-Fälle</CardTitle>
              <CardDescription>
                Verwaltung aller Compliance-Fälle und -Prozesse
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Fall
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter und Suche */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Fälle durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="escalated">Eskaliert</SelectItem>
                <SelectItem value="closed">Geschlossen</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priorität" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Prioritäten</SelectItem>
                <SelectItem value="critical">Kritisch</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fälle-Liste */}
          <div className="space-y-4">
            {filteredCases?.map((case_) => (
              <Card key={case_.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{case_.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {case_.case_number}
                        </Badge>
                        <Badge className={`text-white ${getStatusColor(case_.status)}`}>
                          {case_.status === 'open' && 'Offen'}
                          {case_.status === 'in_progress' && 'In Bearbeitung'}
                          {case_.status === 'escalated' && 'Eskaliert'}
                          {case_.status === 'closed' && 'Geschlossen'}
                        </Badge>
                        <Badge className={`text-white ${getPriorityColor(case_.priority)}`}>
                          {case_.priority === 'critical' && 'Kritisch'}
                          {case_.priority === 'high' && 'Hoch'}
                          {case_.priority === 'medium' && 'Mittel'}
                          {case_.priority === 'low' && 'Niedrig'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {case_.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Typ: {getCaseTypeLabel(case_.case_type)}</span>
                        {case_.department && <span>Abteilung: {case_.department}</span>}
                        {case_.due_date && (
                          <span>Fällig: {format(new Date(case_.due_date), 'dd.MM.yyyy', { locale: de })}</span>
                        )}
                        <span>Erstellt: {format(new Date(case_.created_at), 'dd.MM.yyyy', { locale: de })}</span>
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

            {filteredCases?.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">Keine Compliance-Fälle gefunden</p>
                <p className="text-sm text-gray-400">
                  Erstellen Sie einen neuen Fall oder passen Sie die Filter an
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateComplianceCaseDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};
