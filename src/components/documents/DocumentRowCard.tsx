import { FileText, Download, User, Calendar, HardDrive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { documentService } from '@/services/documentService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DocumentRowCardProps {
  id: string;
  filename: string;
  title?: string;
  author?: string;
  authorAvatar?: string;
  date: Date | string;
  size?: number | string;
  category?: string;
  projectName?: string;
  filePath?: string;
  status?: string;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const formatFileSize = (bytes: number | string | undefined): string => {
  if (!bytes) return '-';
  if (typeof bytes === 'string') return bytes;
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentRowCard = ({
  id,
  filename,
  title,
  author,
  date,
  size,
  category,
  projectName,
  filePath,
  status,
  onClick,
  selectable = false,
  selected = false,
  onSelect,
}: DocumentRowCardProps) => {
  const displayName = title || filename;
  const formattedDate = typeof date === 'string' ? new Date(date) : date;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!filePath) {
      toast.error('Kein Download-Pfad verfügbar');
      return;
    }

    try {
      const result = await documentService.getDownloadUrl(filePath, id);
      
      if (!result?.data?.signedUrl) {
        toast.error('Download fehlgeschlagen');
        return;
      }

      window.open(result.data.signedUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download fehlgeschlagen');
    }
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(id, !selected);
  };

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-shadow border border-border",
        selected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Checkbox + Icon + Document Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectable && (
            <div onClick={handleCheckboxChange}>
              <Checkbox 
                checked={selected}
                className="flex-shrink-0"
              />
            </div>
          )}
          
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{displayName}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
              {author && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {author}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(formattedDate, 'dd.MM.yyyy', { locale: de })}
              </span>
              {size && (
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(size)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Badges + Download */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
          {projectName && (
            <Badge variant="outline" className="text-xs">
              {projectName}
            </Badge>
          )}
          {status && (
            <Badge 
              variant="outline" 
              className={`text-xs ${
                status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                ''
              }`}
            >
              {status === 'approved' ? 'Genehmigt' :
               status === 'pending' ? 'Ausstehend' :
               status === 'rejected' ? 'Abgelehnt' :
               status === 'draft' ? 'Entwurf' :
               status === 'archived' ? 'Archiviert' :
               status}
            </Badge>
          )}
          {filePath && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DocumentRowCard;
