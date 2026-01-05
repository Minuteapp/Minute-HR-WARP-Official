import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

interface TenantStammdatenTabProps {
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    tariff: string;
    contractStart: string;
    duration: string;
    region: string;
    employees: number;
    admins: number;
    activeModules: number;
  };
}

export const TenantStammdatenTab = ({ tenant }: TenantStammdatenTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Firmendaten */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">Firmendaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Firmenname</p>
                <p className="font-medium">{tenant.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">E-Mail</p>
                <p className="font-medium">{tenant.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Telefon</p>
                <p className="font-medium">{tenant.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Adresse</p>
                <p className="font-medium">{tenant.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vertragsdaten */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">Vertragsdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Tarif</p>
              <Badge variant="outline" className="mt-1 border-primary text-primary">{tenant.tariff}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vertragsbeginn</p>
              <p className="font-medium">{tenant.contractStart}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Laufzeit</p>
              <p className="font-medium">{tenant.duration}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Region</p>
              <p className="font-medium">{tenant.region}</p>
            </div>
          </CardContent>
        </Card>

        {/* Statistiken */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold">{tenant.employees}</p>
                <p className="text-xs text-muted-foreground">Mitarbeiter</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold">{tenant.admins}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold">{tenant.activeModules}</p>
                <p className="text-xs text-muted-foreground">Aktive Module</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
