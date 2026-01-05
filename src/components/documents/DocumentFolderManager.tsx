
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FolderPlus, Folder, Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { DocumentCategory } from '@/types/documents';

interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  color?: string;
  icon?: string;
  parent_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_system: boolean;
}

export const DocumentFolderManager = () => {
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null);
  const queryClient = useQueryClient();

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ['document-folders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_folders')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as DocumentFolder[];
    }
  });

  const createFolderMutation = useMutation({
    mutationFn: async (folderData: Partial<DocumentFolder>) => {
      const { data, error } = await supabase
        .from('document_folders')
        .insert(folderData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-folders'] });
      setShowNewFolderDialog(false);
      toast.success('Ordner erfolgreich erstellt');
    },
    onError: (error) => {
      console.error('Error creating folder:', error);
      toast.error('Fehler beim Erstellen des Ordners');
    }
  });

  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DocumentFolder> & { id: string }) => {
      const { data, error } = await supabase
        .from('document_folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-folders'] });
      setEditingFolder(null);
      toast.success('Ordner erfolgreich aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating folder:', error);
      toast.error('Fehler beim Aktualisieren des Ordners');
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('document_folders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-folders'] });
      toast.success('Ordner erfolgreich gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting folder:', error);
      toast.error('Fehler beim Löschen des Ordners');
    }
  });

  const FolderForm = ({ folder, onSubmit, onCancel }: {
    folder?: DocumentFolder | null;
    onSubmit: (data: Partial<DocumentFolder>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: folder?.name || '',
      description: folder?.description || '',
      category: folder?.category || 'company' as DocumentCategory,
      color: folder?.color || '#3B82F6',
      icon: folder?.icon || 'folder',
      parent_id: folder?.parent_id || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Ordnername</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ordnername eingeben"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optionale Beschreibung"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="category">Kategorie</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as DocumentCategory })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="training">Schulung & Weiterbildung</SelectItem>
              <SelectItem value="recruiting">Recruiting & Onboarding</SelectItem>
              <SelectItem value="company">Unternehmensdokumente</SelectItem>
              <SelectItem value="employee">Mitarbeiterdokumente</SelectItem>
              <SelectItem value="payroll">Lohn & Gehalt</SelectItem>
              <SelectItem value="legal">Rechtliche Dokumente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="parent">Übergeordneter Ordner</Label>
          <Select value={formData.parent_id} onValueChange={(value) => setFormData({ ...formData, parent_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Kein übergeordneter Ordner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Kein übergeordneter Ordner</SelectItem>
              {folders
                .filter(f => f.id !== folder?.id)
                .map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button type="submit" disabled={createFolderMutation.isPending || updateFolderMutation.isPending}>
            {folder ? 'Aktualisieren' : 'Erstellen'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </form>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ordner verwalten</CardTitle>
        <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              Neuer Ordner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Ordner erstellen</DialogTitle>
            </DialogHeader>
            <FolderForm
              onSubmit={(data) => createFolderMutation.mutate(data)}
              onCancel={() => setShowNewFolderDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Ordner vorhanden</h3>
            <p className="text-muted-foreground">Erstellen Sie Ihren ersten Ordner zur Organisation</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div key={folder.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Folder className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{folder.name}</h3>
                      {folder.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {folder.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 text-xs bg-secondary rounded">
                          {folder.category}
                        </span>
                        {folder.is_system && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            System
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!folder.is_system && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingFolder(folder)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteFolderMutation.mutate(folder.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ordner bearbeiten</DialogTitle>
          </DialogHeader>
          <FolderForm
            folder={editingFolder}
            onSubmit={(data) => updateFolderMutation.mutate({ ...data, id: editingFolder!.id })}
            onCancel={() => setEditingFolder(null)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
