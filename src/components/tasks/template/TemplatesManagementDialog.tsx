
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Plus, Filter } from 'lucide-react';
import { useTaskTemplatesStore } from '@/stores/useTaskTemplatesStore';
import { SaveTemplateDialog } from './SaveTemplateDialog';
import { Badge } from '@/components/ui/badge';

interface TemplatesManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatesManagementDialog({ 
  open, 
  onOpenChange
}: TemplatesManagementDialogProps) {
  const { templates, fetchTemplates, deleteTemplate, isLoading } = useTaskTemplatesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);
  
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, fetchTemplates]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTemplates(templates);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTemplates(
        templates.filter(
          (template) => 
            template.title.toLowerCase().includes(query) ||
            template.description.toLowerCase().includes(query) ||
            template.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, templates]);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return priority;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'Zu erledigen';
      case 'in-progress': return 'In Bearbeitung';
      case 'review': return 'Überprüfung';
      case 'blocked': return 'Blockiert';
      case 'done': return 'Erledigt';
      default: return status;
    }
  };
  
  const handleConfirmDelete = (id: string) => {
    if (window.confirm('Möchten Sie diese Vorlage wirklich löschen?')) {
      deleteTemplate(id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aufgaben-Vorlagen verwalten</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  className="pl-10"
                  placeholder="Vorlagen durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Filter size={18} />
                </Button>
                <Button onClick={() => setShowSaveDialog(true)}>
                  <Plus size={18} className="mr-2" />
                  Neue Vorlage
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-8"></div>
                        <div className="h-8 bg-gray-200 rounded w-8"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-2">Keine Vorlagen gefunden</div>
                <p className="text-sm text-gray-400 mb-4">
                  {searchQuery ? 'Versuchen Sie eine andere Suche' : 'Erstellen Sie Ihre erste Vorlage'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowSaveDialog(true)}>
                    <Plus size={18} className="mr-2" />
                    Vorlage erstellen
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {filteredTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className="border rounded-lg p-4 hover:border-blue-100 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{template.title}</h3>
                      <Badge className={getPriorityColor(template.priority)}>
                        {getPriorityLabel(template.priority)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="outline">
                          {getStatusLabel(template.status)}
                        </Badge>
                        
                        <span className="text-xs text-gray-500">
                          {template.defaultDurationDays} Tage
                        </span>
                        
                        {template.isTeamTemplate && (
                          <Badge variant="secondary">Team-Vorlage</Badge>
                        )}
                        
                        {template.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit size={18} className="text-gray-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleConfirmDelete(template.id)}
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <SaveTemplateDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
      />
    </>
  );
}
