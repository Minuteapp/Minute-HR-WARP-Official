import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle } from 'lucide-react';

export const WBSLegend = () => {
  return (
    <Card className="border-t">
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4">Legende</h3>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Status */}
          <div>
            <h4 className="text-sm font-medium mb-3">Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300" />
                <span className="text-sm">Nicht gestartet</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span className="text-sm">In Arbeit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm">Abgeschlossen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm">Blockiert</span>
              </div>
            </div>
          </div>

          {/* RACI-Rollen */}
          <div>
            <h4 className="text-sm font-medium mb-3">RACI-Rollen</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">R</Badge>
                <span className="text-sm">Responsible - Verantwortlich für die Durchführung</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500 text-white">A</Badge>
                <span className="text-sm">Accountable - Rechenschaftspflichtig</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">C</Badge>
                <span className="text-sm">Consulted - Zu konsultieren</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-500 text-white">I</Badge>
                <span className="text-sm">Informed - Zu informieren</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
