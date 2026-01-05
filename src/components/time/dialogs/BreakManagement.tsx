import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Coffee, Plus, Trash2, Clock } from 'lucide-react';
import TimePickerContent from '@/time-tracking/TimePickerContent';

export interface Break {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
}

interface BreakManagementProps {
  breaks: Break[];
  onBreaksChange: (breaks: Break[]) => void;
}

const BreakManagement = ({ breaks, onBreaksChange }: BreakManagementProps) => {
  const [openStartPicker, setOpenStartPicker] = useState<string | null>(null);
  const [openEndPicker, setOpenEndPicker] = useState<string | null>(null);

  const addBreak = () => {
    const newBreak: Break = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: '12:00',
      endTime: '12:30',
      type: 'lunch'
    };
    onBreaksChange([...breaks, newBreak]);
  };

  const removeBreak = (id: string) => {
    onBreaksChange(breaks.filter(b => b.id !== id));
  };

  const updateBreak = (id: string, field: keyof Break, value: string) => {
    onBreaksChange(breaks.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  return (
    <div className="space-y-3">
      {breaks.length === 0 ? (
        <div className="text-center py-6 text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          Keine Pausen erfasst
        </div>
      ) : (
        <div className="space-y-3">
          {breaks.map((breakItem, index) => (
            <div key={breakItem.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                    <Coffee className="h-3 w-3 text-white" />
                  </div>
                  <h4 className="font-medium text-sm text-gray-800">Pause {index + 1}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => removeBreak(breakItem.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`break-start-${breakItem.id}`} className="text-xs text-gray-600 mb-1 block">Von</Label>
                  <Popover open={openStartPicker === breakItem.id} onOpenChange={(open) => setOpenStartPicker(open ? breakItem.id : null)}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal bg-white border-gray-200"
                      >
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {breakItem.startTime}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 bg-white z-50" align="start">
                      <TimePickerContent 
                        value={breakItem.startTime}
                        onChange={(time) => {
                          updateBreak(breakItem.id, 'startTime', time);
                          setOpenStartPicker(null);
                        }}
                        onClose={() => setOpenStartPicker(null)}
                        hourStep={1}
                        minuteStep={5}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor={`break-end-${breakItem.id}`} className="text-xs text-gray-600 mb-1 block">Bis</Label>
                  <Popover open={openEndPicker === breakItem.id} onOpenChange={(open) => setOpenEndPicker(open ? breakItem.id : null)}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal bg-white border-gray-200"
                      >
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {breakItem.endTime}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 bg-white z-50" align="start">
                      <TimePickerContent 
                        value={breakItem.endTime}
                        onChange={(time) => {
                          updateBreak(breakItem.id, 'endTime', time);
                          setOpenEndPicker(null);
                        }}
                        onClose={() => setOpenEndPicker(null)}
                        hourStep={1}
                        minuteStep={5}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor={`break-type-${breakItem.id}`} className="text-xs text-gray-600 mb-1 block">Art</Label>
                <Select 
                  value={breakItem.type} 
                  onValueChange={(value) => updateBreak(breakItem.id, 'type', value)}
                >
                  <SelectTrigger id={`break-type-${breakItem.id}`} className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunch">Mittagspause</SelectItem>
                    <SelectItem value="short">Kurzpause</SelectItem>
                    <SelectItem value="other">Sonstige</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Button 
        type="button"
        variant="outline" 
        size="sm"
        onClick={addBreak}
        className="w-full text-[#6366F1] border-[#6366F1] hover:bg-[#6366F1]/5"
      >
        <Plus className="h-4 w-4 mr-1" />
        Pause hinzufügen
      </Button>
    </div>
  );
};

export default BreakManagement;
