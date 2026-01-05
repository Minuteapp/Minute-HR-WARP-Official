import { Button } from '@/components/ui/button';
import { 
  Archive, Trash2, FolderInput, Tag, Download, X, 
  CheckSquare 
} from 'lucide-react';
import { toast } from 'sonner';
import { documentService } from '@/services/documentService';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onMoveToFolder?: (folderId: string) => void;
  categories?: string[];
}

export const BulkActionsBar = ({ 
  selectedIds, 
  onClearSelection,
  categories = ['legal', 'payroll', 'training', 'recruiting', 'personal', 'other']
}: BulkActionsBarProps) => {
  const queryClient = useQueryClient();

  const handleArchiveSelected = async () => {
    try {
      for (const id of selectedIds) {
        await documentService.archiveDocument(id);
      }
      toast.success(`${selectedIds.length} Dokument(e) archiviert`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      onClearSelection();
    } catch (error) {
      console.error('Archive error:', error);
      toast.error('Fehler beim Archivieren');
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Möchten Sie ${selectedIds.length} Dokument(e) wirklich löschen?`)) {
      return;
    }
    
    try {
      for (const id of selectedIds) {
        await documentService.deleteDocument(id);
      }
      toast.success(`${selectedIds.length} Dokument(e) gelöscht`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      onClearSelection();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const handleChangeCategorySelected = async (category: string) => {
    try {
      for (const id of selectedIds) {
        await documentService.updateDocument(id, { category: category as any });
      }
      toast.success(`Kategorie für ${selectedIds.length} Dokument(e) geändert`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      onClearSelection();
    } catch (error) {
      console.error('Category change error:', error);
      toast.error('Fehler beim Ändern der Kategorie');
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span>{selectedIds.length} ausgewählt</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchiveSelected}
            className="gap-2"
          >
            <Archive className="h-4 w-4" />
            Archivieren
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Tag className="h-4 w-4" />
                Kategorie
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map(cat => (
                <DropdownMenuItem 
                  key={cat}
                  onClick={() => handleChangeCategorySelected(cat)}
                >
                  {cat === 'legal' ? 'Verträge' :
                   cat === 'payroll' ? 'Lohnabrechnungen' :
                   cat === 'training' ? 'Weiterbildung' :
                   cat === 'recruiting' ? 'Recruiting' :
                   cat === 'personal' ? 'Persönlich' :
                   'Sonstiges'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteSelected}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Löschen
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
