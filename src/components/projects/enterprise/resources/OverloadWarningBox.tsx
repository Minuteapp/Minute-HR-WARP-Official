import { AlertTriangle, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface OverloadedMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  projectCount: number;
  utilizationPercent: number;
  bookedHours: number;
  maxHours: number;
}

interface OverloadWarningBoxProps {
  members: OverloadedMember[];
}

const OverloadWarningBox = ({ members }: OverloadWarningBoxProps) => {
  if (members.length === 0) return null;

  return (
    <div className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-600">Warnung: Überlastete Ressourcen</h3>
          <p className="text-sm text-red-600 mb-3">
            {members.length} Mitarbeiter {members.length === 1 ? 'ist' : 'sind'} über 90% ausgelastet
          </p>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-white/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-red-100 text-red-700 text-xs">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role} • {member.projectCount} Projekte</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{member.utilizationPercent}%</p>
                  <p className="text-sm text-muted-foreground">{member.bookedHours}h / {member.maxHours}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverloadWarningBox;
