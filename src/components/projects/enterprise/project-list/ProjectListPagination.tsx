import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectListPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const ProjectListPagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: ProjectListPaginationProps) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        Seite {totalPages > 0 ? currentPage : 0} von {totalPages} ({totalItems} Projekte gesamt)
      </span>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
        
        {totalPages > 0 && (
          <Button
            variant={currentPage === 1 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Weiter
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectListPagination;
