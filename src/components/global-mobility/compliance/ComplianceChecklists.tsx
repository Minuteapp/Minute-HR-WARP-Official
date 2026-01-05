
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, CreditCard, Building, Shield } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Checklist {
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const defaultChecklists: Checklist[] = [
  {
    title: 'Visum & Arbeitserlaubnis',
    icon: <FileText className="h-4 w-4" />,
    items: [
      { id: '1', label: 'Visumantrag eingereicht', checked: false },
      { id: '2', label: 'Arbeitserlaubnis beantragt', checked: false },
      { id: '3', label: 'Aufenthaltstitel erhalten', checked: false },
    ],
  },
  {
    title: 'Steuerliche Anforderungen',
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      { id: '4', label: 'Steuerliche Ansässigkeit geklärt', checked: false },
      { id: '5', label: 'Doppelbesteuerungsabkommen geprüft', checked: false },
      { id: '6', label: 'Steuererklärung vorbereitet', checked: false },
    ],
  },
  {
    title: 'Sozialversicherung',
    icon: <Building className="h-4 w-4" />,
    items: [
      { id: '7', label: 'A1-Bescheinigung beantragt', checked: false },
      { id: '8', label: 'Krankenversicherung geklärt', checked: false },
      { id: '9', label: 'Rentenversicherung geregelt', checked: false },
    ],
  },
  {
    title: 'Compliance Prüfungen',
    icon: <Shield className="h-4 w-4" />,
    items: [
      { id: '10', label: 'Immigration Compliance Check', checked: false },
      { id: '11', label: 'Tax Compliance Check', checked: false },
      { id: '12', label: 'Employment Law Check', checked: false },
    ],
  },
];

export function ComplianceChecklists() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {defaultChecklists.map((checklist) => (
        <Card key={checklist.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {checklist.icon}
              {checklist.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklist.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox id={item.id} checked={item.checked} />
                  <label htmlFor={item.id} className="text-sm text-muted-foreground cursor-pointer">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
