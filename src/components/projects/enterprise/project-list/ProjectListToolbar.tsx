import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid, Download, RefreshCw, ArrowUpDown, Plus } from 'lucide-react';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectListToolbarProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

const ProjectListToolbar = ({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  itemsPerPage,
  onItemsPerPageChange,
}: ProjectListToolbarProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Neues Projekt
          </Button>
          <span className="text-sm text-muted-foreground ml-4">0 von 0 Projekten</span>
        </div>
      
      <div className="flex items-center gap-4">
        {/* Sort Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant={sortBy === 'name' ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => onSortChange('name')}
            className="gap-1"
          >
            Name
            <ArrowUpDown className="h-3 w-3" />
          </Button>
          <Button
            variant={sortBy === 'progress' ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => onSortChange('progress')}
          >
            Fortschritt
          </Button>
          <Button
            variant={sortBy === 'status' ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => onSortChange('status')}
          >
            Status
          </Button>
        </div>
        
        {/* Items per page */}
        <Select 
          value={itemsPerPage.toString()} 
          onValueChange={(v) => onItemsPerPageChange(parseInt(v))}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 pro Seite</SelectItem>
            <SelectItem value="25">25 pro Seite</SelectItem>
            <SelectItem value="50">50 pro Seite</SelectItem>
            <SelectItem value="100">100 pro Seite</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Export */}
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        
        {/* View Toggle */}
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium mr-2">Projektliste</h3>
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <CreateProjectDialog
      open={showCreateDialog}
      onOpenChange={setShowCreateDialog}
    />
  </>
  );
};

export default ProjectListToolbar;
