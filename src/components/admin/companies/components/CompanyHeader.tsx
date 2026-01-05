
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Users } from "lucide-react";
import { getSubscriptionBadgeVariant } from "../utils";
import { CompanyDetails as CompanyDetailsType } from "../types";

interface CompanyHeaderProps {
  company: CompanyDetailsType;
  onEditCompany: () => void;
  onDeleteCompany: () => void;
}

export const CompanyHeader = ({ 
  company, 
  onEditCompany, 
  onDeleteCompany 
}: CompanyHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onEditCompany} className="shadow-sm">
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDeleteCompany} 
            className="shadow-sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-primary/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">{company.name}</h2>
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant={getSubscriptionBadgeVariant(company.subscription_status)}>
                {company.subscription_status || 'Free'}
              </Badge>
              <Badge variant={company.is_active ? "default" : "destructive"}>
                {company.is_active ? "Aktiv" : "Inaktiv"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="shadow-sm">
              <Users className="mr-2 h-4 w-4" />
              Mitarbeiter anzeigen ({company.employee_count || 0})
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
