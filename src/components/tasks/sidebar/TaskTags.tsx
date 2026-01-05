
import { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TaskTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  newTag: string;
  onNewTagChange: (value: string) => void;
  onAddTag: () => void;
}

export const TaskTags = ({ 
  tags = [], 
  onTagsChange, 
  newTag, 
  onNewTagChange, 
  onAddTag 
}: TaskTagsProps) => {
  
  const handleRemoveTag = (tag: string) => {
    const updatedTags = tags.filter(t => t !== tag);
    onTagsChange(updatedTags);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      onAddTag();
    }
  };
  
  const getTagColor = (tag: string) => {
    // Einfache Hash-Funktion für konsistente Farben
    const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[hash % colors.length];
  };
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-1">
        <Tag className="h-4 w-4 text-[#9b87f5]" />
        Tags
      </h3>
      
      <div className="flex">
        <Input
          value={newTag}
          onChange={(e) => onNewTagChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Neuen Tag hinzufügen..."
          className="rounded-r-none"
        />
        <Button 
          variant="outline" 
          onClick={onAddTag}
          className="rounded-l-none border-l-0"
          disabled={!newTag.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && (
          <div className="text-sm text-gray-500">Keine Tags hinzugefügt</div>
        )}
        
        {tags.map(tag => (
          <div 
            key={tag}
            className={`flex items-center gap-1 rounded-full pl-2 pr-1 py-1 ${getTagColor(tag)}`}
          >
            <span className="text-xs">{tag}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 hover:bg-transparent hover:text-red-500"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
