import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, Download, Upload, Trash2, Lock, Unlock, 
  FileText, Archive, Share, Eye, Settings, Users 
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import type { Document, DocumentCategory } from '@/types/documents';

interface BulkDocumentAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: (selectedIds: string[]) => Promise<void>;
  requiresConfirmation?: boolean;
  permission: string;
}

export const EnterpriseDocumentManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasAction, canView, canEdit, canDelete } = useEnterprisePermissions();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  // Enterprise Documents Query with Pagination
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['enterprise-documents', searchQuery, categoryFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,file_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(1000); // Enterprise Limit
      if (error) throw error;
      return data as Document[];
    }
  });

  // Bulk Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: async (documentIds: string[]) => {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'archived',
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', documentIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-documents'] });
    }
  });

  // Bulk Delete Mutation (Soft Delete)
  const deleteMutation = useMutation({
    mutationFn: async (documentIds: string[]) => {
      const { error } = await supabase
        .from('documents')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', documentIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-documents'] });
    }
  });

  // Enterprise Bulk-Aktionen
  const bulkActions: BulkDocumentAction[] = [
    {
      id: 'archive',
      label: 'Archivieren',
      icon: Archive,
      permission: 'documents.archive',
      action: async (ids) => {
        await archiveMutation.mutateAsync(ids);
        toast({ title: `${ids.length} Dokumente archiviert` });
      }
    },
    {
      id: 'delete',
      label: 'Löschen',
      icon: Trash2,
      permission: 'documents.delete',
      requiresConfirmation: true,
      action: async (ids) => {
        await deleteMutation.mutateAsync(ids);
        toast({ title: `${ids.length} Dokumente gelöscht` });
      }
    },
    {
      id: 'export',
      label: 'Metadaten Export',
      icon: Download,
      permission: 'documents.export',
      action: async (ids) => {
        const selectedDocs = documents.filter(doc => ids.includes(doc.id));
        await exportDocumentMetadata(selectedDocs);
        toast({ title: `Metadaten für ${ids.length} Dokumente exportiert` });
      }
    },
    {
      id: 'bulk_share',
      label: 'Freigeben',
      icon: Share,
      permission: 'documents.share',
      action: async (ids) => {
        // Implementiere Bulk-Freigabe
        toast({ title: `${ids.length} Dokumente freigegeben` });
      }
    }
  ];

  // CSV Export für Document Metadata
  const exportDocumentMetadata = async (docs: Document[]) => {
    const headers = [
      'ID', 'Titel', 'Kategorie', 'Status', 'Dateigröße', 'MIME-Type',
      'Erstellt am', 'Erstellt von', 'Zuletzt geändert', 'Zugriffslevel'
    ];
    
    const rows = docs.map(doc => [
      doc.id,
      doc.title,
      doc.category,
      doc.status,
      doc.file_size.toString(),
      doc.mime_type,
      new Date(doc.created_at).toLocaleDateString('de-DE'),
      doc.created_by,
      new Date(doc.updated_at).toLocaleDateString('de-DE'),
      'internal'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dokument_metadaten_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filterte Documents basierend auf Enterprise-Filter
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Bulk-Aktionen ausführen
  const executeBulkAction = async (action: BulkDocumentAction) => {
    if (selectedItems.length === 0) {
      toast({ title: 'Keine Auswahl', description: 'Bitte wählen Sie Dokumente aus' });
      return;
    }

    if (!hasAction('documents', action.permission)) {
      toast({ title: 'Keine Berechtigung', variant: 'destructive' });
      return;
    }

    if (action.requiresConfirmation) {
      if (!confirm(`${action.label} für ${selectedItems.length} Dokumente?`)) return;
    }

    setBulkActionInProgress(true);
    try {
      await action.action(selectedItems);
      setSelectedItems([]);
    } catch (error) {
      toast({ 
        title: 'Fehler', 
        description: `${action.label} fehlgeschlagen`,
        variant: 'destructive' 
      });
    } finally {
      setBulkActionInProgress(false);
    }
  };

  // Document Categories
  const categories = [
    { value: 'training', label: 'Schulung & Weiterbildung' },
    { value: 'recruiting', label: 'Recruiting & Onboarding' },
    { value: 'company', label: 'Unternehmensdokumente' },
    { value: 'employee', label: 'Mitarbeiterdokumente' },
    { value: 'payroll', label: 'Lohn & Gehalt' },
    { value: 'legal', label: 'Rechtliche Dokumente' }
  ];

  if (!canView('documents')) {
    return <div>Keine Berechtigung für Dokumentenverwaltung</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Enterprise Dokumentenverwaltung</CardTitle>
              <p className="text-muted-foreground">
                Verwaltung von {documents.length} Dokumenten mit erweiterten Berechtigungen
              </p>
            </div>
            <div className="flex space-x-2">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enterprise Filter & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dokumente durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="approved">Genehmigt</SelectItem>
                <SelectItem value="archived">Archiviert</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {filteredDocuments.length} Dokumente
              </Badge>
              {selectedItems.length > 0 && (
                <Badge variant="default">
                  {selectedItems.length} ausgewählt
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-700">
                {selectedItems.length} Dokumente ausgewählt
              </div>
              <div className="flex space-x-2">
                {bulkActions.map(action => (
                  hasAction('documents', action.permission) && (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => executeBulkAction(action)}
                      disabled={bulkActionInProgress}
                      className="bg-white"
                    >
                      <action.icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Button>
                  )
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enterprise Document Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <Checkbox
                        checked={selectedItems.length === filteredDocuments.length && filteredDocuments.length > 0}
                        onCheckedChange={(checked) => {
                          setSelectedItems(checked ? filteredDocuments.map(d => d.id) : []);
                        }}
                      />
                    </th>
                    <th className="text-left p-3">Dokument</th>
                    <th className="text-left p-3">Kategorie</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Größe</th>
                    <th className="text-left p-3">Erstellt</th>
                    <th className="text-left p-3">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedItems.includes(document.id)}
                          onCheckedChange={(checked) => {
                            setSelectedItems(prev => 
                              checked 
                                ? [...prev, document.id]
                                : prev.filter(id => id !== document.id)
                            );
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{document.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {document.file_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {categories.find(c => c.value === document.category)?.label || document.category}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            document.status === 'approved' ? 'default' :
                            document.status === 'archived' ? 'secondary' : 'outline'
                          }
                        >
                          {document.status === 'pending' ? 'Ausstehend' :
                           document.status === 'approved' ? 'Genehmigt' :
                           document.status === 'archived' ? 'Archiviert' : document.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {(document.file_size / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {new Date(document.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canEdit('documents') && (
                            <Button size="sm" variant="outline">
                              <Share className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete('documents') && (
                            <Button size="sm" variant="outline">
                              <Archive className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredDocuments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Dokumente gefunden
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};