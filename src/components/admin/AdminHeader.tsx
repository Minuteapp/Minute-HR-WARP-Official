import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Layers,
  Activity,
  Headphones,
  Shield, 
  FileText,
  Settings,
  ShieldCheck
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Mandantenverwaltung", path: "/admin/tenants", icon: Building2 },
  { label: "Nutzer & Rollen", path: "/admin/users-roles", icon: Users },
  { label: "Abos & Zahlungen", path: "/admin/subscriptions", icon: CreditCard },
  { label: "Module & Features", path: "/admin/modules", icon: Layers },
  { label: "Systemstatus", path: "/admin/system-status", icon: Activity },
  { label: "Support & Ticketing", path: "/admin/support", icon: Headphones },
  { label: "Sicherheit & Compliance", path: "/admin/security-compliance", icon: Shield },
  { label: "Logs & Audits", path: "/admin/logs-audits", icon: FileText },
  { label: "Superadmin Audit", path: "/admin/superadmin-audit", icon: ShieldCheck },
  { label: "Einstellungen", path: "/admin/admin-settings", icon: Settings },
];

export const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-2">
        <nav className="flex items-center gap-1 overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  active 
                    ? "bg-primary/10 text-primary border-b-2 border-primary rounded-none" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
