import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Mail, Phone, Globe, Calendar, CreditCard } from "lucide-react";

interface TenantQuickViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: {
    id: string;
    name: string;
    status: string;
    country: string;
    employees: number;
    admins: number;
    tariff: string;
    modules: number;
    lastActivity: string;
    email?: string;
    phone?: string;
    website?: string;
  } | null;
}

export const TenantQuickViewDialog = ({ open, onOpenChange, tenant }: TenantQuickViewDialogProps) => {
  if (!tenant) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Aktiv</Badge>;
      case "test":
        return <Badge className="bg-yellow-100 text-yellow-700">Test</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-700">Gesperrt</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-700">Archiviert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {tenant.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getStatusBadge(tenant.status)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Mitarbeiter
              </div>
              <p className="font-medium">{tenant.employees}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Admins
              </div>
              <p className="font-medium">{tenant.admins}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Tarif
              </div>
              <p className="font-medium text-primary">{tenant.tariff}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                Module
              </div>
              <p className="font-medium">{tenant.modules} aktiv</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Land:</span>
              <span>{tenant.country}</span>
            </div>

            {tenant.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">E-Mail:</span>
                <span>{tenant.email}</span>
              </div>
            )}

            {tenant.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Telefon:</span>
                <span>{tenant.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Letzte Aktivität:</span>
              <span>{tenant.lastActivity ? new Date(tenant.lastActivity).toLocaleDateString('de-DE') : '-'}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            ID: {tenant.id}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
