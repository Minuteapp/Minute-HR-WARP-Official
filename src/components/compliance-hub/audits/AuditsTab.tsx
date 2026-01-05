import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClipboardCheck, Plus, Search } from 'lucide-react';
import { AuditKPICards, AuditKPIData } from './AuditKPICards';
import { AuditEventCard, AuditEvent } from './AuditEventCard';
import { DocumentationCard, DocumentationItem } from './DocumentationCard';
import { AuditPackageCard } from './AuditPackageCard';

interface AuditsTabProps {
  kpiData?: AuditKPIData;
  audits?: AuditEvent[];
  documentation?: DocumentationItem[];
  onCreateAudit?: () => void;
  onViewAuditDetails?: (auditId: string) => void;
  onExportPDF?: (itemId: string) => void;
  onExportExcel?: (itemId: string) => void;
  onGeneratePackage?: () => void;
}

export const AuditsTab: React.FC<AuditsTabProps> = ({
  kpiData,
  audits,
  documentation,
  onCreateAudit,
  onViewAuditDetails,
  onExportPDF,
  onExportExcel,
  onGeneratePackage
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAudits = audits?.filter(audit =>
    audit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audit.auditor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Audits & Nachweise</h2>
        <p className="text-sm text-muted-foreground">Interne und externe Compliance-Audits</p>
      </div>

      {/* KPI Cards */}
      <AuditKPICards data={kpiData} />

      {/* Audit Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Audit-Events</h3>
          <Button onClick={onCreateAudit} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Neues Audit anlegen
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Audits durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredAudits && filteredAudits.length > 0 ? (
          <div className="space-y-4">
            {filteredAudits.map(audit => (
              <AuditEventCard 
                key={audit.id} 
                audit={audit}
                onViewDetails={onViewAuditDetails}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-card">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-950/30 rounded-full flex items-center justify-center mb-4">
                  <ClipboardCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Keine Audits vorhanden</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Audits und Prüfungsergebnisse werden hier angezeigt, sobald entsprechende Daten vorliegen.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Documentation Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Nachweise & Dokumentation</h3>
        
        {documentation && documentation.length > 0 ? (
          <div className="space-y-4">
            {documentation.map(item => (
              <DocumentationCard 
                key={item.id} 
                item={item}
                onExportPDF={onExportPDF}
                onExportExcel={onExportExcel}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-card">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Keine Dokumentation verfügbar.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Audit Package Generator */}
      <AuditPackageCard onGeneratePackage={onGeneratePackage} />
    </div>
  );
};
