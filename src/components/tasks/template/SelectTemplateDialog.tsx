
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, AlertCircle, User, Check, Tags } from 'lucide-react';
import { useTaskTemplatesStore } from '@/stores/useTaskTemplatesStore';
import { TaskTemplate } from '@/types/taskTemplate';
import { Badge } from '@/components/ui/badge';

interface SelectTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: TaskTemplate) => void;
}

export function SelectTemplateDialog({ 
  open, 
  onOpenChange,
  onSelectTemplate
}: SelectTemplateDialogProps) {
  const { templates, fetchTemplates, isLoading } = useTaskTemplatesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<TaskTemplate[]>([]);

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
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSelectTemplate = (template: TaskTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Vorlage auswählen</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              className="pl-10"
              placeholder="Vorlagen durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">Keine Vorlagen gefunden</div>
              <p className="text-sm text-gray-400">
                {searchQuery ? 'Versuchen Sie eine andere Suche' : 'Erstellen Sie eine neue Vorlage'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {filteredTemplates.map((template) => (
                <div 
                  key={template.id}
                  className="border rounded-lg p-4 hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{template.title}</h3>
                    <Badge className={getPriorityColor(template.priority)}>
                      {template.priority === 'high' ? 'Hoch' : 
                       template.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{template.defaultDurationDays} Tage</span>
                    </div>
                    
                    {template.subtasks && template.subtasks.length > 0 && (
                      <div className="flex items-center">
                        <Check size={14} className="mr-1" />
                        <span>{template.subtasks.length} Unteraufgaben</span>
                      </div>
                    )}
                    
                    {template.isTeamTemplate && (
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        <span>Team-Vorlage</span>
                      </div>
                    )}
                    
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex items-center">
                        <Tags size={14} className="mr-1" />
                        <span>
                          {template.tags[0]}
                          {template.tags.length > 1 && ` +${template.tags.length - 1}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
