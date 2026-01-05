import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, MessageSquare, Calendar, User } from 'lucide-react';

interface IdeaPoolCardProps {
  idea: {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    tags: string[];
    submittedBy: string;
    team: string;
    votes: number;
    comments: number;
    date: string;
    score: number | null;
  };
  onClick: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'Neu', className: 'bg-gray-400 text-white' },
  in_discussion: { label: 'In Diskussion', className: 'bg-blue-500 text-white' },
  evaluation: { label: 'In Bewertung', className: 'bg-red-400 text-white' },
  rejected: { label: 'Abgelehnt', className: 'bg-red-500 text-white' },
  experiment: { label: 'Experiment', className: 'bg-cyan-500 text-white' },
  implementation: { label: 'Umsetzung', className: 'bg-teal-500 text-white' },
  scaled: { label: 'Skaliert', className: 'bg-green-600 text-white' },
};

const categoryConfig: Record<string, { label: string; className: string }> = {
  process: { label: 'Prozess', className: 'bg-gray-600 text-white' },
  product: { label: 'Produkt', className: 'bg-blue-600 text-white' },
  service: { label: 'Service', className: 'bg-purple-500 text-white' },
  technology: { label: 'Technologie', className: 'bg-green-500 text-white' },
  organization: { label: 'Organisation', className: 'bg-red-500 text-white' },
  sustainability: { label: 'Nachhaltigkeit', className: 'bg-purple-600 text-white' },
  cost: { label: 'Kosten / Effizienz', className: 'bg-orange-500 text-white' },
};

const IdeaPoolCard = ({ idea, onClick }: IdeaPoolCardProps) => {
  const status = statusConfig[idea.status] || statusConfig.new;
  const category = categoryConfig[idea.category] || categoryConfig.process;

  return (
    <Card 
      className="bg-white border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Titel */}
        <h3 className="font-semibold text-gray-900 line-clamp-1">{idea.title}</h3>
        
        {/* Beschreibung */}
        <p className="text-sm text-gray-500 line-clamp-2">{idea.description}</p>
        
        {/* Status & Kategorie Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={status.className}>{status.label}</Badge>
          <Badge className={category.className}>{category.label}</Badge>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {idea.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
        
        {/* Score Progress (wenn vorhanden) */}
        {idea.score !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Bewertung</span>
              <span className="font-medium">{idea.score} / 10</span>
            </div>
            <Progress value={idea.score * 10} className="h-2" />
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{idea.submittedBy}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              <span>{idea.votes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{idea.comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{idea.date}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdeaPoolCard;
