
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import ApprovalLevelItem from './ApprovalLevelItem';

interface ApprovalLevel {
  id: string;
  level: number;
  role: string;
  amountRange: string;
}

const ApprovalLevelsSection = () => {
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([]);

  const handleEdit = (level: number) => {
    console.log('Edit approval level:', level);
  };

  const handleAddLevel = () => {
    console.log('Add new approval level');
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Genehmigungsstufen konfigurieren</CardTitle>
        <p className="text-sm text-muted-foreground">
          Definieren Sie mehrstufige Genehmigungsprozesse basierend auf Betrag, Kategorie oder Projekt
        </p>
      </CardHeader>
      <CardContent>
        {approvalLevels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine Genehmigungsstufen vorhanden. Fügen Sie eine neue Stufe hinzu.
          </div>
        ) : (
          <div className="mb-4">
            {approvalLevels.map((level) => (
              <ApprovalLevelItem
                key={level.id}
                level={level.level}
                role={level.role}
                amountRange={level.amountRange}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
        
        <button
          onClick={handleAddLevel}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Weitere Genehmigungsstufe hinzufügen
        </button>
      </CardContent>
    </Card>
  );
};

export default ApprovalLevelsSection;
