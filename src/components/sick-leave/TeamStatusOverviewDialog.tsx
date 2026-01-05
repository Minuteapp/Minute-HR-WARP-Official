import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TeamStatusOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockTeamMembers: { name: string; role: string; department?: string; status: string; avatar: string; returnDate?: string; daysRemaining?: number }[] = [];

export const TeamStatusOverviewDialog = ({ open, onOpenChange }: TeamStatusOverviewDialogProps) => {
  const activeCount = mockTeamMembers.filter(m => m.status === 'active').length;
  const sickCount = mockTeamMembers.filter(m => m.status === 'sick').length;
  const vacationCount = mockTeamMembers.filter(m => m.status === 'vacation').length;
  const totalCount = mockTeamMembers.length;
  const activePercentage = Math.round((activeCount / totalCount) * 100);

  const sickMembers = mockTeamMembers.filter(m => m.status === 'sick');
  const vacationMembers = mockTeamMembers.filter(m => m.status === 'vacation');
  const activeMembers = mockTeamMembers.filter(m => m.status === 'active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Team Status Übersicht
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-xs text-gray-600">Teammitglieder</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{activeCount}</div>
              <div className="text-xs text-green-600">Anwesend</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{sickCount}</div>
              <div className="text-xs text-red-600">Krank</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{vacationCount}</div>
              <div className="text-xs text-blue-600">Urlaub</div>
            </div>
          </div>

          {/* Anwesenheitsrate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Anwesenheitsrate</span>
              </div>
              <span className="text-sm font-bold">{activePercentage}%</span>
            </div>
            <Progress value={activePercentage} className="h-2" />
          </div>

          {/* Kranke Mitarbeiter */}
          {sickCount > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <h3 className="text-sm font-semibold text-gray-900">Kranke Mitarbeiter ({sickCount})</h3>
              </div>
              <div className="space-y-2">
                {sickMembers.map((member, idx) => (
                  <div key={idx} className="bg-red-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-red-100 text-red-700 font-medium">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.role} • {member.department}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>Rückkehr: {member.returnDate}</span>
                        </div>
                        <p className="text-xs text-gray-500">noch {member.daysRemaining} Tage</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Im Urlaub */}
          {vacationCount > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">Im Urlaub ({vacationCount})</h3>
              </div>
              <div className="space-y-2">
                {vacationMembers.map((member, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.role} • {member.department}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>Rückkehr: {member.returnDate}</span>
                        </div>
                        <p className="text-xs text-gray-500">noch {member.daysRemaining} Tage</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anwesende Mitarbeiter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <h3 className="text-sm font-semibold text-gray-900">Anwesende Mitarbeiter ({activeCount})</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {activeMembers.map((member, idx) => (
                <div key={idx} className="bg-green-50 rounded-lg p-3 flex flex-col items-center text-center">
                  <Avatar className="h-10 w-10 mb-2">
                    <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
