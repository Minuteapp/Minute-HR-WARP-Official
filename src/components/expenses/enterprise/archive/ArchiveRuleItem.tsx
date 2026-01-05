
import { LucideIcon } from 'lucide-react';

interface ArchiveRuleItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const ArchiveRuleItem = ({ icon: Icon, title, description }: ArchiveRuleItemProps) => {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="p-2 bg-muted rounded-lg flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

export default ArchiveRuleItem;
