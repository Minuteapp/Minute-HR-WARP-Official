import { LucideIcon, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExportCardProps {
  title: string;
  description: string;
  format: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  onExport: () => void;
}

const ExportCard = ({
  title,
  description,
  format,
  icon: Icon,
  iconBg,
  iconColor,
  onExport,
}: ExportCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{title}</h4>
              <Badge variant="outline" className="text-xs">
                {format}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={onExport}>
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportCard;
