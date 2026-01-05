
import { Pencil } from 'lucide-react';

interface ApprovalLevelItemProps {
  level: number;
  role: string;
  amountRange: string;
  onEdit: (level: number) => void;
}

const ApprovalLevelItem = ({ level, role, amountRange, onEdit }: ApprovalLevelItemProps) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm">
          {level}
        </div>
        <div>
          <h4 className="font-medium text-foreground">{role}</h4>
          <p className="text-sm text-muted-foreground">{amountRange}</p>
        </div>
      </div>
      <button 
        onClick={() => onEdit(level)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ApprovalLevelItem;
