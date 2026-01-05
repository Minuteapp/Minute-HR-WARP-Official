import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { DataProtectionKPICards, DataProtectionKPIData } from './DataProtectionKPICards';
import { DataProtectionAICard } from './DataProtectionAICard';
import { DataInventoryCard, DataCategory } from './DataInventoryCard';
import { DSARCard, DSARRequest } from './DSARCard';
import { DeletionQueueCard, DeletionQueueItem } from './DeletionQueueCard';

interface DataProtectionTabProps {
  kpiData?: DataProtectionKPIData;
  aiAnalysisText?: string;
  aiWarningText?: string;
  dataCategories?: DataCategory[];
  dsarRequests?: DSARRequest[];
  deletionQueue?: DeletionQueueItem[];
  onEditDSAR?: (id: string) => void;
  onExecuteDeletion?: (id: string) => void;
  onViewDeletionDetails?: (id: string) => void;
}

type SubTab = 'inventory' | 'dsar' | 'deletion';

export const DataProtectionTab: React.FC<DataProtectionTabProps> = ({
  kpiData,
  aiAnalysisText,
  aiWarningText,
  dataCategories = [],
  dsarRequests = [],
  deletionQueue = [],
  onEditDSAR,
  onExecuteDeletion,
  onViewDeletionDetails,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('inventory');

  const subTabs: { key: SubTab; label: string }[] = [
    { key: 'inventory', label: 'Data Inventory' },
    { key: 'dsar', label: 'DS-Anfragen (DSAR)' },
    { key: 'deletion', label: 'Lösch-Warteschlange' },
  ];

  const renderEmptyState = (title: string, description: string) => (
    <Card className="bg-card">
      <CardContent className="pt-12 pb-12">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-950/30 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'inventory':
        if (dataCategories.length === 0) {
          return renderEmptyState(
            'Keine Datenkategorien',
            'Datenkategorien werden hier angezeigt, sobald sie im System erfasst wurden.'
          );
        }
        return (
          <div className="space-y-4">
            {dataCategories.map((category) => (
              <DataInventoryCard key={category.id} category={category} />
            ))}
          </div>
        );

      case 'dsar':
        if (dsarRequests.length === 0) {
          return renderEmptyState(
            'Keine DS-Anfragen',
            'Datenschutz-Anfragen (DSAR) werden hier angezeigt, sobald sie eingehen.'
          );
        }
        return (
          <div className="space-y-4">
            {dsarRequests.map((request) => (
              <DSARCard key={request.id} request={request} onEdit={onEditDSAR} />
            ))}
          </div>
        );

      case 'deletion':
        if (deletionQueue.length === 0) {
          return renderEmptyState(
            'Keine geplanten Löschungen',
            'Geplante Datenlöschungen werden hier angezeigt, sobald sie im System vorhanden sind.'
          );
        }
        return (
          <div className="space-y-4">
            {deletionQueue.map((item) => (
              <DeletionQueueCard 
                key={item.id} 
                item={item} 
                onExecute={onExecuteDeletion}
                onViewDetails={onViewDeletionDetails}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Datenschutz & DSGVO</h2>
        <p className="text-sm text-muted-foreground">
          Zentrale Steuerung von Datenaufbewahrung, Löschfristen & DS-Anfragen
        </p>
      </div>

      {/* KPI Cards */}
      <DataProtectionKPICards data={kpiData} />

      {/* AI Card */}
      <DataProtectionAICard 
        analysisText={aiAnalysisText} 
        warningText={aiWarningText} 
      />

      {/* Sub-Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeSubTab === tab.key
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-Tab Content */}
      {renderSubTabContent()}
    </div>
  );
};
