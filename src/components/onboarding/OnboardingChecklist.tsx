
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, CheckCircle2, Plus } from 'lucide-react';
import { OnboardingChecklistItem } from "@/types/onboarding.types";
import { useOnboardingProcess } from '@/hooks/useOnboardingProcess';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface OnboardingChecklistProps {
  processId?: string; // Make processId optional
}

const OnboardingChecklist = ({ processId }: OnboardingChecklistProps) => {
  const { checklistItems, loadingChecklist, updateChecklistItem, addChecklistItem } = useOnboardingProcess(processId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [newItem, setNewItem] = useState<Partial<OnboardingChecklistItem>>({
    process_id: processId,
    title: '',
    description: '',
    category: 'company_info',
    status: 'pending'
  });

  if (loadingChecklist) {
    return <div className="flex items-center justify-center p-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // Handle the case when there's no specific process ID (on the main Onboarding page)
  if (!processId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Onboarding Checklisten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">Wählen Sie einen Onboarding-Prozess aus, um die zugehörige Checkliste anzuzeigen.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = ['all', ...new Set((checklistItems || []).map(item => item.category))];
  
  const filteredChecklist = (checklistItems || []).filter(item => 
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  const progress = checklistItems?.length 
    ? (checklistItems.filter(item => item.status === 'completed').length / checklistItems.length) * 100
    : 0;

  const handleCheckItem = async (item: OnboardingChecklistItem) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    await updateChecklistItem(item.id, { status: newStatus });
  };

  const handleAddItem = () => {
    if (!newItem.title || !processId) return;
    
    addChecklistItem(processId, newItem);
    setNewItemDialog(false);
    setNewItem({
      process_id: processId,
      title: '',
      description: '',
      category: 'company_info',
      status: 'pending'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Onboarding Checkliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Gesamtfortschritt</div>
                <div className="text-2xl font-bold">{Math.round(progress)}%</div>
              </div>
              <Progress value={progress} className="w-[60%]" />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category === 'all' ? 'Alle Kategorien' : 
                   category === 'company_info' ? 'Unternehmensinformationen' :
                   category === 'policies' ? 'Richtlinien' :
                   category === 'training' ? 'Schulungen' :
                   category === 'integration' ? 'Integration' : 
                   category}
                </Button>
              ))}
            </div>

            <div className="space-y-2 mt-4">
              {filteredChecklist.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Keine Aufgaben in dieser Kategorie.</p>
                </div>
              ) : (
                filteredChecklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-2 p-3 hover:bg-accent rounded-md"
                  >
                    <Checkbox
                      checked={item.status === 'completed'}
                      onCheckedChange={() => handleCheckItem(item)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label className="flex-1 text-sm font-medium cursor-pointer">
                        {item.title}
                      </label>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                      {item.category === 'company_info' ? 'Unternehmen' :
                       item.category === 'policies' ? 'Richtlinien' :
                       item.category === 'training' ? 'Schulung' :
                       item.category === 'integration' ? 'Integration' : 
                       item.category}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => setNewItemDialog(true)}
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Aufgabe hinzufügen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog für neue Aufgabe */}
      <Dialog open={newItemDialog} onOpenChange={setNewItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Aufgabe hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                placeholder="Titel der Aufgabe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Beschreibung der Aufgabe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select
                value={newItem.category}
                onValueChange={(value) => setNewItem({...newItem, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_info">Unternehmensinformationen</SelectItem>
                  <SelectItem value="policies">Richtlinien</SelectItem>
                  <SelectItem value="training">Schulungen</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialog(false)}>Abbrechen</Button>
            <Button onClick={handleAddItem}>Hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnboardingChecklist;
