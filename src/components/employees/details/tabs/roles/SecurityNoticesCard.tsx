import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock, FileText, Shield, ClipboardCheck } from 'lucide-react';

export const SecurityNoticesCard = () => {
  const notices = [
    {
      icon: <Lock className="h-5 w-5" />,
      title: 'Zugriffsrechte',
      description:
        'Berechtigungen werden automatisch aus Ihrer Rolle und Organisationsstruktur abgeleitet',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Audit-Trail',
      description:
        'Alle Zugriffe werden protokolliert und sind für Compliance-Zwecke nachvollziehbar',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Datenschutz',
      description:
        'Personenbezogene Daten dürfen nur im Rahmen Ihrer Befugnisse eingesehen werden',
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      icon: <ClipboardCheck className="h-5 w-5" />,
      title: 'Änderungen',
      description:
        'Änderungen an Rollen und Rechten müssen vom Administrator freigegeben werden',
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Wichtige Sicherheitshinweise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notices.map((notice, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className={`p-2 ${notice.bg} rounded-lg mt-0.5`}>
                <div className={notice.color}>{notice.icon}</div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{notice.title}</h4>
                <p className="text-sm text-muted-foreground">{notice.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
