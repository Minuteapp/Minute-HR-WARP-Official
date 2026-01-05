import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";

export const RisksHintBox = () => {
  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-medium text-orange-900">Risikomanagement</p>
            <p className="text-sm text-orange-700">
              Proaktive Überwachung von Visa-Abläufen, Compliance-Anforderungen und steuerlichen Risiken. 
              Automatische Benachrichtigungen bei kritischen Fristen.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
