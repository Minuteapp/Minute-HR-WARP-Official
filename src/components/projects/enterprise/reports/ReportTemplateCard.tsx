import { LucideIcon, Eye, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReportTemplateCardProps {
  title: string;
  description: string;
  frequency: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  onPreview: () => void;
  onGenerate: () => void;
}

const ReportTemplateCard = ({
  title,
  description,
  frequency,
  icon: Icon,
  iconBg,
  iconColor,
  onPreview,
  onGenerate,
}: ReportTemplateCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{title}</h4>
              <Badge variant="secondary" className="text-xs">
                {frequency}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={onPreview}>
                <Eye className="h-3 w-3" />
                Vorschau
              </Button>
              <Button size="sm" className="gap-1" onClick={onGenerate}>
                <Play className="h-3 w-3" />
                Generieren
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportTemplateCard;
