import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from 'lucide-react';
import { Employee } from "@/types/employee.types";
import { EmployeeEditData } from "@/types/employee-profile.types";
import { PersonalDataSection } from "../../profile/sections/PersonalDataSection";
import { ContactInfoSection } from "../../profile/sections/ContactInfoSection";
import { TaxSection } from "../../profile/sections/TaxSection";
import { BankSection } from "../../profile/sections/BankSection";
import { ContractSection } from "../../profile/sections/ContractSection";
import { DigitalBadgeSection } from "../../profile/sections/DigitalBadgeSection";
import { CorporateCardsSection } from "../../profile/sections/CorporateCardsSection";
import { LanguageSkillsSection } from "../../profile/sections/LanguageSkillsSection";
import { BenefitsSection } from "../../profile/sections/BenefitsSection";
import { DriversLicenseSection } from "../../profile/sections/DriversLicenseSection";
import { ComplianceFooter } from "../../profile/sections/ComplianceFooter";
import { useUserRole } from "@/hooks/useUserRole";

interface ProfileTabContentProps {
  isEditing: boolean;
  isUpdating: boolean;
  editData: EmployeeEditData | null;
  employee: Employee | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFieldChange: (section: keyof EmployeeEditData, field: string, value: string) => void;
  onAddressChange: (field: string, value: string) => void;
  hideLocalButtons?: boolean; // NEU: Lokale Buttons verstecken wenn globaler Modus aktiv
}

export const ProfileTabContent = ({
  isEditing,
  isUpdating,
  editData,
  employee,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  onAddressChange,
  hideLocalButtons = false
}: ProfileTabContentProps) => {
  const { isHRAdmin } = useUserRole();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Profil</h2>
        {/* Lokale Buttons nur anzeigen wenn nicht versteckt */}
        {!hideLocalButtons && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex items-center gap-2"
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4" />
                  Abbrechen
                </Button>
                <Button
                  onClick={onSave}
                  className="flex items-center gap-2"
                  disabled={isUpdating}
                >
                  <Save className="w-4 h-4" />
                  Speichern
                </Button>
              </>
            ) : (
              <Button
                onClick={onEdit}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Bearbeiten
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 2-Column Grid Layout - All sections directly visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PersonalDataSection 
            employee={employee} 
            isEditing={isEditing}
            editData={editData}
            onFieldChange={onFieldChange}
          />
          <TaxSection 
            employee={employee} 
            isEditing={isEditing && isHRAdmin}
            editData={editData}
            onFieldChange={onFieldChange}
          />
          <ContractSection 
            employee={employee} 
            isEditing={isEditing && isHRAdmin}
            editData={editData}
            onFieldChange={onFieldChange}
          />
          <CorporateCardsSection employee={employee} isEditing={isEditing} />
          <LanguageSkillsSection employee={employee} isEditing={isEditing} />
          <BenefitsSection employee={employee} isEditing={isEditing} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ContactInfoSection 
            employee={employee} 
            isEditing={isEditing}
            editData={editData}
            onFieldChange={onFieldChange}
          />
          <BankSection 
            employee={employee} 
            isEditing={isEditing && isHRAdmin}
            editData={editData}
            onFieldChange={onFieldChange}
          />
          <DigitalBadgeSection employee={employee} isEditing={isEditing} />
          <DriversLicenseSection employee={employee} isEditing={isEditing} />
        </div>
      </div>

      {/* Compliance Footer */}
      <ComplianceFooter activeRole={isHRAdmin ? "HR-Manager" : "Mitarbeiter"} />
    </div>
  );
};
