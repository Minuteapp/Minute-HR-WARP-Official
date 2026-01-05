
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Eye, Edit, Download } from "lucide-react";
import { useCompliancePolicies } from '@/hooks/useCompliance';
import { CreatePolicyDialog } from './CreatePolicyDialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const getPolicyTypeLabel = (type: string) => {
  const labels = {
    'code_of_conduct': 'Verhaltenskodex',
    'data_protection': 'Datenschutz',
    'it_security': 'IT-Sicherheit',
    'hr_policy': 'HR-Richtlinie'
  };
  return labels[type as keyof typeof labels] || type;
};

export const CompliancePoliciesList = () => {
  const { data: policies, isLoading } = useCompliancePolicies();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredPolicies = policies?.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || policy.policy_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lade Richtlinien...</CardTitle>
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
              <CardTitle>Compliance-Richtlinien</CardTitle>
              <CardDescription>
                Verwaltung aller Unternehmensrichtlinien und -verfahren
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Richtlinie
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter und Suche */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Richtlinien durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="code_of_conduct">Verhaltenskodex</SelectItem>
                <SelectItem value="data_protection">Datenschutz</SelectItem>
                <SelectItem value="it_security">IT-Sicherheit</SelectItem>
                <SelectItem value="hr_policy">HR-Richtlinie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Richtlinien-Liste */}
          <div className="space-y-4">
            {filteredPolicies?.map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{policy.title}</h3>
                        <Badge variant="outline">
                          {getPolicyTypeLabel(policy.policy_type)}
                        </Badge>
                        <Badge variant="secondary">
                          v{policy.version}
                        </Badge>
                        {policy.requires_acknowledgment && (
                          <Badge variant="outline" className="text-xs">
                            Bestätigung erforderlich
                          </Badge>
                        )}
                      </div>
                      
                      {policy.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {policy.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Gültig ab: {format(new Date(policy.effective_date), 'dd.MM.yyyy', { locale: de })}</span>
                        {policy.expiry_date && (
                          <span>Gültig bis: {format(new Date(policy.expiry_date), 'dd.MM.yyyy', { locale: de })}</span>
                        )}
                        <span>Sprache: {policy.language.toUpperCase()}</span>
                        {policy.approved_at && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Genehmigt
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
                      {policy.file_path && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPolicies?.length === 0 && (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Keine Richtlinien gefunden</p>
                <p className="text-sm text-gray-400">
                  Erstellen Sie eine neue Richtlinie oder passen Sie die Filter an
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreatePolicyDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};
