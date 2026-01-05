import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, Calendar } from 'lucide-react';

interface IdeaPoolListItemProps {
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

const IdeaPoolListItem = ({ idea, onClick }: IdeaPoolListItemProps) => {
  const status = statusConfig[idea.status] || statusConfig.new;
  const category = categoryConfig[idea.category] || categoryConfig.process;

  return (
    <div 
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Linke Spalte: Titel & Beschreibung */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{idea.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-1 mt-1">{idea.description}</p>
        </div>
        
        {/* Mitte: Badges */}
        <div className="flex flex-col gap-1 shrink-0">
          <Badge className={`${category.className} px-3`}>{category.label}</Badge>
          <Badge className={`${status.className} px-3`}>{status.label}</Badge>
        </div>
        
        {/* Rechts: Metadaten */}
        <div className="text-right shrink-0 min-w-[150px]">
          <div className="text-xs text-gray-500">Eingereicht von</div>
          <div className="text-sm font-medium">{idea.submittedBy}</div>
          <div className="text-xs text-gray-400">{idea.team}</div>
        </div>
        
        {/* Ganz rechts: Stats */}
        <div className="flex items-center gap-4 shrink-0 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{idea.votes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{idea.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{idea.date}</span>
          </div>
          {idea.score !== null && (
            <div className="font-semibold text-primary">
              {idea.score}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaPoolListItem;
