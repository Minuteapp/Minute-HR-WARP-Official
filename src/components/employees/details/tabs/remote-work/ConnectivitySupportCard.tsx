import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Check, Phone, Clock } from "lucide-react";
import type { ConnectivitySupport } from "@/integrations/supabase/hooks/useEmployeeRemoteWork";

interface ConnectivitySupportCardProps {
  connectivity?: ConnectivitySupport;
}

export const ConnectivitySupportCard = ({ connectivity }: ConnectivitySupportCardProps) => {
  if (!connectivity) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 text-white rounded-lg">
            <Wifi className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Internet & Connectivity Support</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Finanzielle Unterstützung</h4>
            
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Internet-Zuschuss</div>
                <div className="text-lg font-bold text-blue-600">
                  {connectivity.internet_allowance_amount?.toFixed(2)} {connectivity.internet_allowance_currency}
                </div>
                <div className="text-xs text-muted-foreground">
                  / {connectivity.internet_allowance_frequency === 'monthly' ? 'Monat' : connectivity.internet_allowance_frequency}
                  <span className="ml-1">(Homeoffice-Pauschale)</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-blue-200">
                <div className="text-xs text-muted-foreground mb-1">Mobile Daten</div>
                <div className="text-sm font-medium">{connectivity.mobile_data_plan}</div>
                <div className="text-xs text-muted-foreground">{connectivity.mobile_data_type}</div>
              </div>
              
              <div className="pt-3 border-t border-blue-200">
                <div className="text-xs text-muted-foreground mb-1">VPN-Zugang</div>
                <div className="flex items-center gap-2">
                  {connectivity.vpn_access ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{connectivity.vpn_status}</span>
                      <Badge className="bg-green-500 text-white ml-auto">Aktiv</Badge>
                    </>
                  ) : (
                    <span className="text-sm">Nicht verfügbar</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Collaboration Tools</h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {connectivity.collaboration_tools && connectivity.collaboration_tools.length > 0 ? (
                connectivity.collaboration_tools.map((tool: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 py-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{tool.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Keine Tools konfiguriert</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">IT-Support für Homeoffice</h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {connectivity.it_support_hotline && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Hotline</div>
                    <div className="text-sm font-medium">{connectivity.it_support_hotline}</div>
                    {connectivity.it_support_hours && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {connectivity.it_support_hours}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Remote-Support</span>
                  {connectivity.remote_support_available ? (
                    <Badge className="bg-green-500 text-white">Verfügbar</Badge>
                  ) : (
                    <Badge variant="secondary">Nicht verfügbar</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ticket-System</span>
                  {connectivity.ticket_system_available ? (
                    <Badge className="bg-green-500 text-white">24/7</Badge>
                  ) : (
                    <Badge variant="secondary">Nicht verfügbar</Badge>
                  )}
                </div>
                
                {connectivity.avg_response_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Durchschn. Response</span>
                    <span className="text-sm font-medium">{connectivity.avg_response_time}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
