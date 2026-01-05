import { Calendar, Clock, User, CheckCircle, FileText, Copy, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ArchivedProjectCardProps {
  id: string;
  name: string;
  category: string;
  status: 'completed' | 'cancelled';
  projectId: string;
  archivedDate: string;
  duration: string;
  owner: string;
  finalBudget: number;
  budgetVariance: number;
  achievements: string[];
  lessonsLearned: string;
  onViewDetails: () => void;
  onViewDocumentation: () => void;
  onUseAsTemplate: () => void;
}

const ArchivedProjectCard = ({
  name,
  category,
  status,
  projectId,
  archivedDate,
  duration,
  owner,
  finalBudget,
  budgetVariance,
  achievements,
  lessonsLearned,
  onViewDetails,
  onViewDocumentation,
  onUseAsTemplate,
}: ArchivedProjectCardProps) => {
  const categoryColors: Record<string, string> = {
    HR: 'bg-blue-100 text-blue-800',
    IT: 'bg-green-100 text-green-800',
    ESG: 'bg-emerald-100 text-emerald-800',
    Compliance: 'bg-yellow-100 text-yellow-800',
    Innovation: 'bg-purple-100 text-purple-800',
    Business: 'bg-pink-100 text-pink-800',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{name}</h3>
              <Badge className={categoryColors[category] || 'bg-gray-100 text-gray-800'}>
                {category}
              </Badge>
              <Badge 
                className={status === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
                }
              >
                {status === 'completed' ? 'Abgeschlossen' : 'Abgebrochen'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Meta-Infos */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">ID:</span> {projectId}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(archivedDate), 'dd. MMM yyyy', { locale: de })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {owner}
          </div>
        </div>

        {/* Budget Info Box */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Finales Budget</p>
            <p className="font-semibold">{formatCurrency(finalBudget)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Budget-Abweichung</p>
            <p className={`font-semibold ${budgetVariance < 0 ? 'text-green-600' : budgetVariance > 0 ? 'text-red-600' : ''}`}>
              {budgetVariance > 0 ? '+' : ''}{budgetVariance}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Projektdauer</p>
            <p className="font-semibold">{duration}</p>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Erfolge</p>
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lessons Learned */}
        {lessonsLearned && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Lessons Learned</p>
                <p className="text-sm text-yellow-700">{lessonsLearned}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            Details
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={onViewDocumentation}>
            <FileText className="h-3 w-3" />
            Dokumentation
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={onUseAsTemplate}>
            <Copy className="h-3 w-3" />
            Als Template verwenden
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchivedProjectCard;
