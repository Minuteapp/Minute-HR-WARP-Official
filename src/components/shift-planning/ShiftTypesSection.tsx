import React, { forwardRef } from 'react';
import { useDrag } from 'react-dnd';
import { Badge } from '../ui/badge';
import { ShiftType } from '../../hooks/useDragDropShifts';
import { GripVertical } from 'lucide-react';

interface DraggableShiftTypeProps {
  shiftType: ShiftType;
}

const DraggableShiftType = forwardRef<HTMLDivElement, DraggableShiftTypeProps>(
  ({ shiftType }, ref) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'shift-type',
      item: { shiftType },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    // Combine both refs
    const combinedRef = (node: HTMLDivElement) => {
      drag(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div 
        ref={combinedRef}
        className={`p-3 cursor-move hover:shadow-md transition-all duration-200 ${shiftType.color} border-2 border-dashed rounded-lg bg-card text-card-foreground shadow-sm ${
          isDragging ? 'opacity-50 scale-105' : 'opacity-100 scale-100'
        }`}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <h4 className="font-medium text-sm">{shiftType.name}</h4>
            </div>
            <span className="text-xs text-gray-600">{shiftType.workers} Mitarbeiter</span>
          </div>
          <p className="text-xs text-gray-600">{shiftType.time}</p>
          <div className="flex flex-wrap gap-1">
            {shiftType.skills.map((skill, skillIndex) => (
              <Badge key={skillIndex} variant="secondary" className="text-xs px-1 py-0">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

DraggableShiftType.displayName = 'DraggableShiftType';

interface ShiftTypesSectionProps {
  shiftTypes: ShiftType[];
}

export function ShiftTypesSection({ shiftTypes }: ShiftTypesSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">✅ Verfügbare Schichttypen ziehen</h3>
      
      <div className="grid grid-cols-4 gap-4">
        {shiftTypes.map((shiftType) => (
          <DraggableShiftType key={shiftType.id} shiftType={shiftType} />
        ))}
      </div>
    </div>
  );
}