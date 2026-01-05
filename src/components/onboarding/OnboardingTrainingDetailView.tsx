import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  Calendar,
  Award,
  Download,
  Mail,
  MoreHorizontal,
} from 'lucide-react';

interface Training {
  id: number;
  employee: {
    name: string;
    position: string;
    initials: string;
    department: string;
  };
  course: string;
  duration: string;
  type: 'Pflicht' | 'Rollenspezifisch' | 'Empfohlen';
  status: 'completed' | 'in_progress' | 'overdue';
  progress: number;
  dueDate: string;
  completedDate: string | null;
  hasCertificate: boolean;
}

interface OnboardingTrainingDetailViewProps {
  training: Training;
  onBack: () => void;
}

const getTypeBadgeStyles = (type: string) => {
  switch (type) {
    case 'Pflicht':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Rollenspezifisch':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Empfohlen':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'overdue':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Abgeschlossen';
    case 'in_progress':
      return 'In Bearbeitung';
    case 'overdue':
      return 'Überfällig';
    default:
      return status;
  }
};

export const OnboardingTrainingDetailView: React.FC<OnboardingTrainingDetailViewProps> = ({
  training,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      {/* Zurück Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold">{training.course}</h2>
                <Badge variant="outline" className={getStatusBadgeStyles(training.status)}>
                  {getStatusLabel(training.status)}
                </Badge>
                <Badge variant="outline" className={getTypeBadgeStyles(training.type)}>
                  {training.type}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{training.duration}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fortschritt */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Fortschritt</span>
            <span className="text-sm font-medium">{training.progress}%</span>
          </div>
          <Progress 
            value={training.progress} 
            className="h-3"
            indicatorClassName={training.progress === 100 ? "bg-green-500" : ""}
          />
        </CardContent>
      </Card>

      {/* Mitarbeiter & Abteilung */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Mitarbeiter</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                {training.employee.initials}
              </div>
              <div>
                <p className="font-medium">{training.employee.name}</p>
                <p className="text-sm text-muted-foreground">{training.employee.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Abteilung</p>
            <p className="font-medium">{training.employee.department}</p>
          </CardContent>
        </Card>
      </div>

      {/* Datum-Karten */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Fällig am</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{training.dueDate}</span>
            </div>
          </CardContent>
        </Card>

        <Card className={training.completedDate ? "bg-green-50 border-green-200" : ""}>
          <CardContent className="p-4">
            <p className={`text-sm mb-2 ${training.completedDate ? "text-green-700" : "text-muted-foreground"}`}>
              Abgeschlossen am
            </p>
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${training.completedDate ? "text-green-600" : "text-muted-foreground"}`} />
              <span className={`font-medium ${training.completedDate ? "text-green-700" : ""}`}>
                {training.completedDate || "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zertifikat-Banner */}
      {training.hasCertificate && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-700">Zertifikat ausgestellt</p>
                <p className="text-sm text-green-600">Kann heruntergeladen werden</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-3">
        {training.hasCertificate && (
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Zertifikat herunterladen
          </Button>
        )}
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Erinnerung senden
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Schulung bearbeiten</DropdownMenuItem>
            <DropdownMenuItem>Fortschritt zurücksetzen</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Schulung entfernen</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
