import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentFolder {
  id: string;
  name: string;
  parent_id: string | null;
  color: string | null;
  icon: string | null;
  document_count?: number;
}

interface FolderTreeProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

interface FolderNodeProps {
  folder: DocumentFolder;
  folders: DocumentFolder[];
  level: number;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  expandedFolders: Set<string>;
  toggleExpand: (folderId: string) => void;
}

const FolderNode = ({ 
  folder, 
  folders, 
  level, 
  selectedFolderId, 
  onSelectFolder,
  expandedFolders,
  toggleExpand
}: FolderNodeProps) => {
  const children = folders.filter(f => f.parent_id === folder.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
          isSelected 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-muted"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectFolder(folder.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(folder.id);
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        
        {isExpanded ? (
          <FolderOpen 
            className="h-4 w-4 flex-shrink-0" 
            style={{ color: folder.color || undefined }}
          />
        ) : (
          <Folder 
            className="h-4 w-4 flex-shrink-0" 
            style={{ color: folder.color || undefined }}
          />
        )}
        
        <span className="text-sm truncate flex-1">{folder.name}</span>
        
        {folder.document_count !== undefined && folder.document_count > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {folder.document_count}
          </span>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {children.map(child => (
            <FolderNode
              key={child.id}
              folder={child}
              folders={folders}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              expandedFolders={expandedFolders}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree = ({ selectedFolderId, onSelectFolder }: FolderTreeProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ['document-folders-tree'],
    queryFn: async () => {
      // Ordner laden
      const { data: foldersData, error: foldersError } = await supabase
        .from('document_folders')
        .select('id, name, parent_id, color, icon')
        .order('name');

      if (foldersError) throw foldersError;

      // Dokumentenanzahl pro Ordner laden
      const { data: linksData, error: linksError } = await supabase
        .from('document_folder_links')
        .select('folder_id');

      if (linksError) throw linksError;

      // Zählen
      const counts: Record<string, number> = {};
      linksData?.forEach(link => {
        counts[link.folder_id] = (counts[link.folder_id] || 0) + 1;
      });

      return (foldersData || []).map(folder => ({
        ...folder,
        document_count: counts[folder.id] || 0
      })) as DocumentFolder[];
    }
  });

  const toggleExpand = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Root-Ordner (ohne parent_id)
  const rootFolders = folders.filter(f => !f.parent_id);

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Lade Ordner...
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        Keine Ordner vorhanden
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Alle Dokumente Option */}
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
          selectedFolderId === null 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-muted"
        )}
        onClick={() => onSelectFolder(null)}
      >
        <span className="w-4" />
        <Folder className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">Alle Dokumente</span>
      </div>

      {/* Ordner-Baum */}
      {rootFolders.map(folder => (
        <FolderNode
          key={folder.id}
          folder={folder}
          folders={folders}
          level={0}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          expandedFolders={expandedFolders}
          toggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
};

export default FolderTree;
