import React from 'react';
import { useDrag } from 'react-dnd';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Clock } from 'lucide-react';
import { ShiftType } from '../../hooks/useDragDropShifts';

interface ShiftTypeCardProps {
  shiftType: ShiftType;
}

export function ShiftTypeCard({ shiftType }: ShiftTypeCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'shift-type',
    item: { shiftType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Card
      ref={drag}
      className={`p-4 cursor-grab border-2 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } ${shiftType.color}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{shiftType.name}</h3>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="text-xs">{shiftType.workers}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{shiftType.time}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {shiftType.skills.slice(0, 2).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs px-1 py-0">
              {skill}
            </Badge>
          ))}
          {shiftType.skills.length > 2 && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              +{shiftType.skills.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}