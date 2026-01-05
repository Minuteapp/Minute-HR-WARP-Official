
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Settings, Plus } from 'lucide-react';
import { useWorkTimeModels, WorkTimeModel } from '@/hooks/time-tracking/useWorkTimeModels';

const WorkTimeModelSelector = () => {
  const { workTimeModels, selectedModel, setSelectedModel, createCustomModel } = useWorkTimeModels();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newModelData, setNewModelData] = useState<Partial<WorkTimeModel>>({
    name: '',
    type: 'flex_time',
    dailyHours: 8,
    weeklyHours: 40,
    maxDailyHours: 10,
    maxWeeklyHours: 48
  });

  const handleCreateModel = () => {
    createCustomModel(newModelData);
    setShowCreateDialog(false);
    setNewModelData({
      name: '',
      type: 'flex_time',
      dailyHours: 8,
      weeklyHours: 40,
      maxDailyHours: 10,
      maxWeeklyHours: 48
    });
  };

  const getModelTypeLabel = (type: string) => {
    const labels = {
      'flex_time': 'Gleitzeit',
      'fixed_time': 'Feste Zeit',
      'trust_time': 'Vertrauenszeit',
      'shift_work': 'Schichtarbeit',
      'part_time': 'Teilzeit',
      'on_call': 'Rufbereitschaft',
      'industry_specific': 'Branchenspezifisch'
    };
    return labels[type] || type;
  };

  const getIndustryLabel = (industry?: string) => {
    const labels = {
      'healthcare': 'Gesundheitswesen',
      'construction': 'Bau',
      'hospitality': 'Gastronomie',
      'administration': 'Verwaltung',
      'it': 'IT',
      'general': 'Allgemein'
    };
    return industry ? labels[industry] || industry : '';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Arbeitszeitmodell
        </CardTitle>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neues Modell
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Arbeitszeitmodell erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="model-name">Name</Label>
                <Input
                  id="model-name"
                  value={newModelData.name}
                  onChange={(e) => setNewModelData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Gleitzeit IT-Abteilung"
                />
              </div>
              <div>
                <Label htmlFor="model-type">Typ</Label>
                <Select
                  value={newModelData.type}
                  onValueChange={(value) => setNewModelData(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex_time">Gleitzeit</SelectItem>
                    <SelectItem value="fixed_time">Feste Arbeitszeiten</SelectItem>
                    <SelectItem value="trust_time">Vertrauensarbeitszeit</SelectItem>
                    <SelectItem value="shift_work">Schichtarbeit</SelectItem>
                    <SelectItem value="part_time">Teilzeit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="daily-hours">Stunden/Tag</Label>
                  <Input
                    id="daily-hours"
                    type="number"
                    step="0.5"
                    value={newModelData.dailyHours}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, dailyHours: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="weekly-hours">Stunden/Woche</Label>
                  <Input
                    id="weekly-hours"
                    type="number"
                    step="0.5"
                    value={newModelData.weeklyHours}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, weeklyHours: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              <Button onClick={handleCreateModel} className="w-full">
                Modell erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedModel?.id}
          onValueChange={(modelId) => {
            const model = workTimeModels.find(m => m.id === modelId);
            setSelectedModel(model || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Arbeitszeitmodell auswählen" />
          </SelectTrigger>
          <SelectContent>
            {workTimeModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name} ({model.dailyHours}h/Tag)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedModel && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedModel.name}</span>
              <Badge variant="outline">{getModelTypeLabel(selectedModel.type)}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Sollarbeitszeit:</span>
                <div>{selectedModel.dailyHours}h/Tag, {selectedModel.weeklyHours}h/Woche</div>
              </div>
              <div>
                <span className="text-gray-600">Max. Arbeitszeit:</span>
                <div>{selectedModel.maxDailyHours}h/Tag, {selectedModel.maxWeeklyHours}h/Woche</div>
              </div>
            </div>

            {selectedModel.coreTimeStart && selectedModel.coreTimeEnd && (
              <div className="text-sm">
                <span className="text-gray-600">Kernarbeitszeit:</span>
                <div>{selectedModel.coreTimeStart} - {selectedModel.coreTimeEnd} Uhr</div>
              </div>
            )}

            {selectedModel.industry && (
              <div className="text-sm">
                <span className="text-gray-600">Branche:</span>
                <div>{getIndustryLabel(selectedModel.industry)}</div>
              </div>
            )}

            <div className="text-sm">
              <span className="text-gray-600">Pausenregeln:</span>
              <div>
                Ab 6h: {selectedModel.breakRules.minBreakAfter6h} Min | 
                Ab 9h: {selectedModel.breakRules.minBreakAfter9h} Min
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkTimeModelSelector;
