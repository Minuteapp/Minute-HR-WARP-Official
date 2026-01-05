
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Users, Clock, CheckCircle } from "lucide-react";
import { useDocumentStats } from "@/hooks/useDocuments";
import { DocumentStatsDetail } from "./DocumentStatsDetail";

const DocumentStats = () => {
  const { data: stats, isLoading } = useDocumentStats();
  const [selectedType, setSelectedType] = useState<'activeUsers' | 'recentlyModified' | 'pendingApprovals' | null>(null);

  const StatItem = ({ 
    icon: Icon, 
    value, 
    label, 
    color,
    onClick 
  }: { 
    icon: React.ElementType; 
    value: number; 
    label: string; 
    color: string;
    onClick?: () => void;
  }) => (
    <Card 
      className={`p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatItem 
          icon={FileText} 
          value={stats.totalDocuments} 
          label="Gesamt-Dokumente" 
          color="bg-blue-500" 
        />
        <StatItem 
          icon={Users} 
          value={stats.activeUsers} 
          label="Aktive Benutzer" 
          color="bg-green-500"
          onClick={() => setSelectedType('activeUsers')}
        />
        <StatItem 
          icon={Clock} 
          value={stats.recentlyModified} 
          label="Kürzlich aktualisiert" 
          color="bg-amber-500"
          onClick={() => setSelectedType('recentlyModified')}
        />
        <StatItem 
          icon={CheckCircle} 
          value={stats.pendingApprovals} 
          label="Ausstehende Genehmigungen" 
          color="bg-purple-500"
          onClick={() => setSelectedType('pendingApprovals')}
        />
      </div>

      <DocumentStatsDetail
        open={selectedType !== null}
        onOpenChange={(open) => !open && setSelectedType(null)}
        type={selectedType!}
      />
    </>
  );
};

export default DocumentStats;
