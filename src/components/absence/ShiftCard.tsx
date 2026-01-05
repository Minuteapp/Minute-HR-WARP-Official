
import { Employee, Shift } from '@/types/shift-planning';
import { Users } from 'lucide-react';

interface ShiftCardProps {
  shift: Shift;
  employees: Employee[];
}

const ShiftCard = ({ shift, employees }: ShiftCardProps) => {
  const getShiftColor = (type: string) => {
    switch (type) {
      case 'early':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'late':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'night':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getShiftTime = (type: string) => {
    switch (type) {
      case 'early':
        return '06:00 - 14:00';
      case 'late':
        return '14:00 - 22:00';
      case 'night':
        return '22:00 - 06:00';
      default:
        return '';
    }
  };

  return (
    <div className={`p-1 rounded border text-xs ${getShiftColor(shift.type)}`}>
      <div className="font-medium">{getShiftTime(shift.type)}</div>
      <div className="flex items-center justify-between mt-1">
        <span>{employees.find(e => e.id === shift.employeeId)?.name || 'Nicht besetzt'}</span>
        <Users className="h-3 w-3" />
      </div>
    </div>
  );
};

export default ShiftCard;
