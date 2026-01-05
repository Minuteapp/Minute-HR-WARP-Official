import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, UserPlus, Users, Award, FileEdit, Trophy, Gift, Activity, Wifi, ClipboardList, StickyNote, MoreHorizontal, BarChart3 } from "lucide-react";

interface TabContentProps {
  employeeId: string;
}

export const CareerTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Karriere
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Karriereentwicklung und Entwicklungspläne für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Karriere-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const OnboardingTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Onboarding
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Onboarding-Prozess und Checklisten für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Onboarding-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const Feedback360TabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          360° Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          360-Grad-Feedback und Bewertungen für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige 360° Feedback-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const CertificatesTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Zertifikate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Zertifikate und Qualifikationen für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Zertifikate-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const HRNotesTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          HR-Notizen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Interne HR-Notizen für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige HR-Notizen-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const AwardsTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Auszeichnungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Auszeichnungen und Anerkennungen für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Auszeichnungen-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const BenefitsTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Benefits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Mitarbeiter-Benefits und Zusatzleistungen für {employeeId}
        </p>
        {/* Platzhalter für zukünftige Benefits-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const HealthTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Gesundheit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Gesundheitsdaten und Wellness-Programme für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Gesundheits-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const RemoteWorkTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Remote Work
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Remote-Arbeit und Homeoffice-Regelungen für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Remote Work-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const SurveysTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Umfragen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Umfragen und Feedback-Ergebnisse für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Umfragen-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const NotesTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Notizen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Persönliche Notizen für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Notizen-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const MiscellaneousTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MoreHorizontal className="h-5 w-5" />
          Verschiedenes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Verschiedene zusätzliche Informationen für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Verschiedenes-Funktionen */}
      </CardContent>
    </Card>
  );
};

export const PerformanceTabContent = ({ employeeId }: TabContentProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Performance-Bewertungen und KPIs für Mitarbeiter {employeeId}
        </p>
        {/* Platzhalter für zukünftige Performance-Funktionen */}
      </CardContent>
    </Card>
  );
};
