
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected?: boolean;
  onClick: () => void;
}

const ReportTypeCard = ({ icon: Icon, title, description, isSelected, onClick }: ReportTypeCardProps) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200",
        isSelected 
          ? "border-2 border-primary bg-primary/5" 
          : "border-border bg-card hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isSelected ? "bg-primary/10" : "bg-muted"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              isSelected ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportTypeCard;
