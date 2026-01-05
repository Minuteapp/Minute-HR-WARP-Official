import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeFormData } from "@/types/employee.types";
import { ReactNode } from "react";
import { Shield, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { 
  escapeHtml, 
  sanitizeSearchTerm, 
  validateStringLength, 
  isValidEmail,
  generateCSRFToken,
  createRateLimiter
} from '@/utils/security/input-validation';
import { logSecurityEvent } from '@/utils/security/audit-logger';
import { supabase } from '@/integrations/supabase/client';

interface SecureEmployeeFormProps {
  formData: EmployeeFormData;
  onFormDataChange: (formData: EmployeeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  children?: ReactNode;
  mode?: 'create' | 'edit';
  employeeId?: string;
}

// Rate Limiter: Max 5 Mitarbeiter pro Stunde erstellen
const employeeCreationRateLimiter = createRateLimiter(5, 60 * 60 * 1000);

export const SecureEmployeeForm = ({
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
  children,
  mode = 'create',
  employeeId
}: SecureEmployeeFormProps) => {
  const [csrfToken, setCsrfToken] = useState('');
  const [securityErrors, setSecurityErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  // CSRF-Token generieren
  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);

  // Real-time Validierung
  useEffect(() => {
    const validateInRealTime = async () => {
      const errors = await validateEmployeeData(formData);
      setSecurityErrors(errors);
      setValidationStatus(errors.length === 0 ? 'valid' : 'invalid');
    };

    if (formData.firstName || formData.lastName || formData.email) {
      setValidationStatus('validating');
      const timeout = setTimeout(validateInRealTime, 500); // Debounce
      return () => clearTimeout(timeout);
    }
  }, [formData]);

  // Umfassende Mitarbeiterdaten-Validierung
  const validateEmployeeData = async (data: EmployeeFormData): Promise<string[]> => {
    const errors: string[] = [];

    try {
      // Basis-Validierung
      if (!validateStringLength(data.firstName, 2, 50)) {
        errors.push('Vorname muss zwischen 2 und 50 Zeichen lang sein');
      }

      if (!validateStringLength(data.lastName, 2, 50)) {
        errors.push('Nachname muss zwischen 2 und 50 Zeichen lang sein');
      }

      // E-Mail-Validierung
      if (!data.email) {
        errors.push('E-Mail-Adresse ist erforderlich');
      } else if (!isValidEmail(data.email)) {
        errors.push('Ungültige E-Mail-Adresse');
      }

      // E-Mail-Duplikat-Prüfung
      if (data.email && mode === 'create') {
        const { data: existingEmployee } = await supabase
          .from('employees')
          .select('id, email')
          .eq('email', data.email.trim().toLowerCase());
        
        if (existingEmployee && existingEmployee.length > 0) {
          errors.push('Ein Mitarbeiter mit dieser E-Mail-Adresse existiert bereits');
        }
      }

      // Mitarbeiternummer-Validierung
      if (!validateStringLength(data.employeeNumber, 3, 20)) {
        errors.push('Mitarbeiternummer muss zwischen 3 und 20 Zeichen lang sein');
      }

      // Mitarbeiternummer-Duplikat-Prüfung
      if (data.employeeNumber && mode === 'create') {
        const { data: existingEmployee } = await supabase
          .from('employees')
          .select('id, employee_number')
          .eq('employee_number', data.employeeNumber.trim());
        
        if (existingEmployee && existingEmployee.length > 0) {
          errors.push('Ein Mitarbeiter mit dieser Mitarbeiternummer existiert bereits');
        }
      }

      // Abteilung und Position validieren
      if (!validateStringLength(data.department, 2, 50)) {
        errors.push('Abteilung muss zwischen 2 und 50 Zeichen lang sein');
      }

      if (!validateStringLength(data.position, 2, 100)) {
        errors.push('Position muss zwischen 2 und 100 Zeichen lang sein');
      }

      // Team-Validierung
      const validTeams = ['development', 'design', 'marketing', 'sales', 'hr', 'finance', 'operations'];
      if (data.team && !validTeams.includes(data.team)) {
        errors.push('Ungültiges Team ausgewählt');
      }

      // Beschäftigungsart-Validierung
      const validEmploymentTypes = ['full_time', 'part_time', 'temporary', 'freelance', 'intern'];
      if (!data.employmentType || !validEmploymentTypes.includes(data.employmentType)) {
        errors.push('Gültige Beschäftigungsart muss ausgewählt werden');
      }

      // Startdatum-Validierung
      if (!data.startDate) {
        errors.push('Startdatum ist erforderlich');
      } else {
        const startDate = new Date(data.startDate);
        const now = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(now.getFullYear() + 1);

        if (isNaN(startDate.getTime())) {
          errors.push('Ungültiges Startdatum');
        } else if (startDate > oneYearFromNow) {
          errors.push('Startdatum darf nicht mehr als ein Jahr in der Zukunft liegen');
        }
      }

      // XSS-Schutz für alle Text-Eingaben
      const textFields = ['firstName', 'lastName', 'department', 'position'];
      for (const field of textFields) {
        const value = data[field as keyof EmployeeFormData] as string;
        if (value && (value.includes('<script') || value.includes('javascript:') || value.includes('onload='))) {
          errors.push(`Ungültige Zeichen im Feld ${field} erkannt`);
        }
      }

      // Rate Limiting prüfen bei neuen Mitarbeitern
      if (mode === 'create') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !employeeCreationRateLimiter(user.id)) {
          errors.push('Zu viele Mitarbeiter erstellt. Bitte warten Sie eine Stunde.');
          await logSecurityEvent({
            action: 'employee_creation_rate_limited',
            resourceType: 'employee',
            success: false,
            details: { userId: user.id }
          });
        }
      }

    } catch (error) {
      errors.push('Validierungsfehler aufgetreten');
      console.error('Employee validation error:', error);
    }

    return errors;
  };

  // Sichere Feld-Änderung
  const handleSecureFieldChange = (field: keyof EmployeeFormData, value: string) => {
    let sanitizedValue = sanitizeSearchTerm(value);

    // Spezielle Behandlung für verschiedene Felder
    switch (field) {
      case 'firstName':
      case 'lastName':
        if (!validateStringLength(sanitizedValue, 0, 50)) return;
        // Nur Buchstaben, Bindestriche und Leerzeichen erlauben
        sanitizedValue = sanitizedValue.replace(/[^a-zA-ZäöüÄÖÜß\s-]/g, '');
        break;
      case 'email':
        sanitizedValue = sanitizedValue.toLowerCase().trim();
        if (!validateStringLength(sanitizedValue, 0, 254)) return;
        break;
      case 'employeeNumber':
        // Nur Zahlen und Buchstaben erlauben
        sanitizedValue = sanitizedValue.replace(/[^a-zA-Z0-9]/g, '');
        if (!validateStringLength(sanitizedValue, 0, 20)) return;
        break;
      case 'department':
      case 'position':
        if (!validateStringLength(sanitizedValue, 0, 100)) return;
        break;
    }

    onFormDataChange({ ...formData, [field]: sanitizedValue });
  };

  // Sicherer Submit-Handler
  const handleSecureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    
    try {
      const validationErrors = await validateEmployeeData(formData);
      
      if (validationErrors.length > 0) {
        setSecurityErrors(validationErrors);
        setIsValidating(false);
        return;
      }

      setSecurityErrors([]);

      // Daten vor dem Submit sanitisieren
      const sanitizedData = {
        ...formData,
        firstName: escapeHtml(formData.firstName),
        lastName: escapeHtml(formData.lastName),
        department: escapeHtml(formData.department),
        position: escapeHtml(formData.position),
        email: formData.email.toLowerCase().trim()
      };

      onFormDataChange(sanitizedData);

      // Audit-Log
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logSecurityEvent({
          action: mode === 'create' ? 'employee_creation_attempt' : 'employee_update_attempt',
          resourceType: 'employee',
          resourceId: employeeId,
          success: true,
          details: { 
            email: formData.email,
            employeeNumber: formData.employeeNumber,
            userId: user.id,
            mode
          }
        });
      }

      // Original Submit aufrufen
      await onSubmit(e);

    } catch (error) {
      console.error('Secure employee submit error:', error);
      setSecurityErrors(['Fehler beim Speichern der Mitarbeiterdaten']);
      
      await logSecurityEvent({
        action: mode === 'create' ? 'employee_creation_failed' : 'employee_update_failed',
        resourceType: 'employee',
        resourceId: employeeId,
        success: false,
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          mode
        }
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sicherheits-Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">🔒 Sichere Mitarbeiter-Verwaltung</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>✅ Real-time Validierung aktiv</div>
                <div>✅ Duplikat-Erkennung für E-Mail & Mitarbeiternummer</div>
                <div>✅ Rate-Limiting: {mode === 'create' ? '5 Mitarbeiter/Stunde' : 'Unbegrenzt'}</div>
                <div>✅ DSGVO-konforme Datenverarbeitung</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validierungsstatus */}
      {validationStatus !== 'idle' && (
        <Card className={
          validationStatus === 'valid' ? 'bg-green-50 border-green-200' :
          validationStatus === 'invalid' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {validationStatus === 'validating' && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <span className="text-sm text-yellow-800">Validierung läuft...</span>
                </>
              )}
              {validationStatus === 'valid' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800">Alle Daten sind gültig</span>
                </>
              )}
              {validationStatus === 'invalid' && (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-800">Validierungsfehler gefunden</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sicherheitsfehler anzeigen */}
      {securityErrors.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-1">Validierungsfehler</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {securityErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSecureSubmit}>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Vorname * (2-50 Zeichen)</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleSecureFieldChange('firstName', e.target.value)}
              placeholder="Max"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Nachname * (2-50 Zeichen)</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleSecureFieldChange('lastName', e.target.value)}
              placeholder="Mustermann"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail * (eindeutig)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleSecureFieldChange('email', e.target.value)}
              placeholder="max.mustermann@firma.de"
              maxLength={254}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeNumber">Mitarbeiternummer * (3-20 Zeichen, eindeutig)</Label>
            <Input
              id="employeeNumber"
              value={formData.employeeNumber}
              onChange={(e) => handleSecureFieldChange('employeeNumber', e.target.value)}
              placeholder="EMP001"
              maxLength={20}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Abteilung * (2-50 Zeichen)</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleSecureFieldChange('department', e.target.value)}
              placeholder="IT-Entwicklung"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position * (2-100 Zeichen)</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleSecureFieldChange('position', e.target.value)}
              placeholder="Senior Software Developer"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select
              value={formData.team}
              onValueChange={(value) => onFormDataChange({ ...formData, team: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Team auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">🖥️ Entwicklung</SelectItem>
                <SelectItem value="design">🎨 Design</SelectItem>
                <SelectItem value="marketing">📈 Marketing</SelectItem>
                <SelectItem value="sales">🤝 Vertrieb</SelectItem>
                <SelectItem value="hr">👥 Personalwesen</SelectItem>
                <SelectItem value="finance">💰 Finanzen</SelectItem>
                <SelectItem value="operations">⚙️ Betrieb</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType">Beschäftigungsart *</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value: any) => onFormDataChange({ ...formData, employmentType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Beschäftigungsart auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">🕘 Vollzeit</SelectItem>
                <SelectItem value="part_time">🕐 Teilzeit</SelectItem>
                <SelectItem value="temporary">📅 Befristet</SelectItem>
                <SelectItem value="freelance">💼 Freiberuflich</SelectItem>
                <SelectItem value="intern">🎓 Praktikant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Startdatum *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => onFormDataChange({ ...formData, startDate: e.target.value })}
              max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        {children}

        {/* CSRF-Token (versteckt) */}
        <input type="hidden" value={csrfToken} name="csrf_token" />

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || isValidating || securityErrors.length > 0}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            {isSubmitting || isValidating ? "🔒 Wird verarbeitet..." : "💾 Speichern"}
          </Button>
        </div>
      </form>
    </div>
  );
};