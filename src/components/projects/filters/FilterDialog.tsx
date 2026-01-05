
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Plus, Tag } from "lucide-react";
import { TagBadge, Tag as TagType } from "@/components/projects/TagBadge";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

// Beispiel-Tags (in der Produktion würde man diese von der API abrufen)
const mockTags: TagType[] = [];

export const FilterDialog = ({ open, onOpenChange, selectedTags, onTagsChange }: FilterDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>(selectedTags);

  const handleTagToggle = (tagId: string) => {
    setLocalSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleApply = () => {
    onTagsChange(localSelectedTags);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSelectedTags(selectedTags);
    onOpenChange(false);
  };

  const filteredTags = mockTags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter anpassen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <h3 className="text-sm font-medium">Tags</h3>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Tags durchsuchen..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`tag-${tag.id}`} 
                    checked={localSelectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <Label htmlFor={`tag-${tag.id}`} className="flex items-center cursor-pointer">
                    <TagBadge tag={tag} />
                  </Label>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Keine Tags gefunden</p>
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="w-full flex items-center justify-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Neuen Tag erstellen
          </Button>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Abbrechen
          </Button>
          <Button onClick={handleApply}>
            Filter anwenden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
