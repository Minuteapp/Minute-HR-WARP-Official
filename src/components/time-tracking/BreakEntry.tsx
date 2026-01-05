import { useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TimePicker from "./TimePicker";

export interface Break {
  id: string;
  from: string;
  to: string;
  type: string;
}

interface BreakEntryProps {
  breakItem: Break;
  index: number;
  onUpdate: (id: string, field: 'from' | 'to' | 'type', value: string) => void;
  onDelete: (id: string) => void;
}

const BreakEntry = ({ breakItem, index, onUpdate, onDelete }: BreakEntryProps) => {
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const breakTypes = [
    { value: 'lunch', label: 'Mittagspause' },
    { value: 'short', label: 'Kurzpause' },
    { value: 'smoke', label: 'Raucherpause' },
    { value: 'other', label: 'Sonstige' }
  ];

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-gray-900">Pause {index + 1}</span>
        </div>
        <button
          type="button"
          onClick={() => onDelete(breakItem.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Von</label>
            <button
              type="button"
              onClick={() => setShowFromPicker(true)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{breakItem.from}</span>
            </button>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Bis</label>
            <button
              type="button"
              onClick={() => setShowToPicker(true)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{breakItem.to}</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Art</label>
          <Select value={breakItem.type} onValueChange={(value) => onUpdate(breakItem.id, 'type', value)}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {breakTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TimePicker
        open={showFromPicker}
        onOpenChange={setShowFromPicker}
        selectedTime={breakItem.from}
        onTimeSelect={(time) => onUpdate(breakItem.id, 'from', time)}
        title="Pause Start"
      />

      <TimePicker
        open={showToPicker}
        onOpenChange={setShowToPicker}
        selectedTime={breakItem.to}
        onTimeSelect={(time) => onUpdate(breakItem.id, 'to', time)}
        title="Pause Ende"
      />
    </div>
  );
};

export default BreakEntry;
