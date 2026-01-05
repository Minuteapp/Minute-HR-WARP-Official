
import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Clock, User, Check, X, MoreHorizontal, MessageSquare, AlertTriangle } from 'lucide-react';
import { ShiftType, Employee } from '@/types/shift-planning';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ShiftDetailDialog from './ShiftDetailDialog';

interface ShiftCardProps {
  shift: any;
  employees: Employee[];
}

const getShiftTypeColor = (type: string): string => {
  switch (type) {
    case 'early':
      return 'bg-blue-500';
    case 'late':
      return 'bg-purple-500';
    case 'night':
      return 'bg-indigo-600';
    default:
      return 'bg-gray-500';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'conflict':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const ShiftCard = ({ shift, employees }: ShiftCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Finde den zugewiesenen Mitarbeiter
  const employee = employees.find(e => e.id === shift.employee_id);
  
  // Bestimme die Schichtfarbe basierend auf dem Typ
  const shiftColor = getShiftTypeColor(shift.type);
  
  // Bestimme die Statusfarbe
  const statusColor = getStatusColor(shift.status);
  
  // Formatiere die Start- und Endzeit
  const startTime = format(new Date(shift.start_time), 'HH:mm');
  const endTime = format(new Date(shift.end_time), 'HH:mm');
  
  return (
    <>
      <div className="bg-white border rounded-md shadow-sm mb-2 overflow-hidden">
        <div className={`${shiftColor} h-1.5 w-full`}></div>
        <div className="p-2 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium">
                {shift.type === 'early' ? 'Frühschicht' : 
                 shift.type === 'late' ? 'Spätschicht' : 
                 shift.type === 'night' ? 'Nachtschicht' : 'Schicht'}
              </h4>
              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                <Clock className="h-3 w-3 mr-1" />
                {startTime} - {endTime}
              </div>
            </div>
            <Badge variant="outline" className={`text-xs ${statusColor}`}>
              {shift.status === 'confirmed' ? 'Bestätigt' : 
               shift.status === 'scheduled' ? 'Geplant' : 
               shift.status === 'conflict' ? 'Konflikt' : shift.status}
            </Badge>
          </div>
          
          {employee ? (
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}`} />
                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{employee.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100 text-gray-400">
              <User className="h-4 w-4" />
              <span className="text-xs">Nicht zugewiesen</span>
            </div>
          )}
          
          {shift.requirements && shift.requirements.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {shift.requirements.map((req: string, index: number) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        {req}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Erforderliche Qualifikation: {req}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
          
          <div className="flex justify-between pt-1">
            {shift.status === 'conflict' ? (
              <Button size="sm" variant="destructive" className="h-6 text-xs px-2 w-full">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Konflikt lösen
              </Button>
            ) : (
              <div className="flex gap-1 w-full">
                <Button size="sm" variant="ghost" className="h-6 text-xs px-2 flex-1" onClick={() => setIsDetailOpen(true)}>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Details
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 px-1">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Check className="h-4 w-4 mr-2" />
                      <span>Bestätigen</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <X className="h-4 w-4 mr-2" />
                      <span>Ablehnen</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ShiftDetailDialog 
        isOpen={isDetailOpen} 
        onOpenChange={setIsDetailOpen}
        shift={shift}
        employee={employee}
      />
    </>
  );
};

export default ShiftCard;
