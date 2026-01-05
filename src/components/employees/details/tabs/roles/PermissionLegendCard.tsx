import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Eye, Edit, Check } from 'lucide-react';

export const PermissionLegendCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Berechtigungslegende</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Kein Zugriff</p>
              <p className="text-xs text-muted-foreground">Keine Berechtigung</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Nur Lesen</p>
              <p className="text-xs text-muted-foreground">Ansicht erlaubt</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Edit className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Lesen & Schreiben</p>
              <p className="text-xs text-muted-foreground">Bearbeiten erlaubt</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Voller Zugriff</p>
              <p className="text-xs text-muted-foreground">Alle Rechte</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
