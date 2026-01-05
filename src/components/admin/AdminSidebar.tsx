import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Building, Users, BarChart3, CreditCard, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  className?: string;
}

const adminMenuItems = [
  {
    title: "Firmen",
    url: "/admin",
    icon: Building,
    description: "Firmenverwaltung"
  },
  {
    title: "Mitarbeiter", 
    url: "/admin/employees",
    icon: Users,
    description: "Mitarbeiterverwaltung"
  },
  {
    title: "Statistiken",
    url: "/admin/statistics", 
    icon: BarChart3,
    description: "Systemstatistiken"
  },
  {
    title: "Abrechnung",
    url: "/admin/billing",
    icon: CreditCard,
    description: "Abrechnungsübersicht"
  }
];

export const AdminSidebar = ({ className }: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname.startsWith("/admin/companies");
    }
    return location.pathname.startsWith(path);
  };

  return null;
};