import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmployeeEditData } from "@/types/employee-profile.types";
import { validateIBAN, validateBIC, formatIBAN, maskIBAN as maskIBANUtil } from "@/utils/validation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { renderFieldIfExists, renderEmptyState } from "@/utils/fieldRenderer";

interface BankSectionProps {
  employee: Employee | null;
  isEditing: boolean;
  editData?: EmployeeEditData | null;
  onFieldChange?: (section: keyof EmployeeEditData, field: string, value: string) => void;
}

export const BankSection = ({ employee, isEditing, editData, onFieldChange }: BankSectionProps) => {
  const [ibanValidation, setIbanValidation] = useState<{ valid: boolean; error?: string } | null>(null);
  const [bicValidation, setBicValidation] = useState<{ valid: boolean; error?: string } | null>(null);

  // Real-time IBAN validation
  useEffect(() => {
    if (isEditing && editData?.employmentInfo.iban) {
      const result = validateIBAN(editData.employmentInfo.iban);
      setIbanValidation(result);
    } else {
      setIbanValidation(null);
    }
  }, [isEditing, editData?.employmentInfo.iban]);

  // Real-time BIC validation
  useEffect(() => {
    if (isEditing && editData?.employmentInfo.bic) {
      const result = validateBIC(editData.employmentInfo.bic);
      setBicValidation(result);
    } else {
      setBicValidation(null);
    }
  }, [isEditing, editData?.employmentInfo.bic]);


  const renderValidatedInput = (
    label: string,
    field: string,
    value: string,
    placeholder: string,
    validation: { valid: boolean; error?: string } | null
  ) => {
    const showValidation = value.length > 0;
    
    return (
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => {
              const newValue = e.target.value.toUpperCase().replace(/\s/g, '');
              onFieldChange?.('employmentInfo', field, newValue);
            }}
            placeholder={placeholder}
            className={cn(
              "h-9 pr-10",
              showValidation && validation && !validation.valid && "border-destructive focus-visible:ring-destructive",
              showValidation && validation && validation.valid && "border-green-500 focus-visible:ring-green-500"
            )}
          />
          {showValidation && validation && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validation.valid ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
          )}
        </div>
        {showValidation && validation && !validation.valid && (
          <div className="flex items-start gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{validation.error}</span>
          </div>
        )}
        {showValidation && validation && validation.valid && (
          <div className="flex items-start gap-1 text-xs text-green-600">
            <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>Gültige {label}</span>
          </div>
        )}
      </div>
    );
  };

  const renderEditableField = (label: string, field: string, value: string, placeholder?: string) => (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onFieldChange?.('employmentInfo', field, e.target.value)}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  );

  if (isEditing && editData) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Bankverbindung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderValidatedInput(
            'IBAN',
            'iban',
            editData.employmentInfo.iban || '',
            'DE89370400440532013000',
            ibanValidation
          )}
          {renderValidatedInput(
            'BIC',
            'bic',
            editData.employmentInfo.bic || '',
            'COBADEFFXXX',
            bicValidation
          )}
          {renderEditableField('Kreditinstitut', 'bankName', editData.employmentInfo.bankName || '', 'Commerzbank AG')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Bankverbindung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {(employee as any)?.iban && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-muted-foreground">IBAN</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{maskIBANUtil((employee as any).iban)}</span>
              <Badge variant="outline" className="text-xs">Maskiert</Badge>
            </div>
          </div>
        )}
        {renderFieldIfExists('BIC', (employee as any)?.bic)}
        {renderFieldIfExists('Kontoinhaber', employee?.name)}
        {renderFieldIfExists('Kreditinstitut', (employee as any)?.bank_name)}
        
        {!(employee as any)?.iban && !(employee as any)?.bic && !employee?.name && !(employee as any)?.bank_name && (
          renderEmptyState("Keine Bankverbindungsdaten vorhanden.")
        )}
      </CardContent>
    </Card>
  );
};
