import React, { useState, useEffect } from 'react';
import { useProjectForm, ProjectFormData } from "@/hooks/projects/useProjectForm";
import { FormTabsNavigation } from "@/components/projects/form/FormTabsNavigation";
import { BasicInfoTab } from "@/components/projects/form/BasicInfoTab";
import { TeamTab } from "@/components/projects/form/TeamTab";
import { TimelineTab } from "@/components/projects/form/TimelineTab";
import { ResourcesTab } from "@/components/projects/form/ResourcesTab";
import { TasksTab } from "@/components/projects/form/TasksTab";
import { GoalsTab } from "@/components/projects/form/GoalsTab";
import { FinancialTab } from "@/components/projects/form/FinancialTab";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/types/project.types";
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  escapeHtml, 
  sanitizeSearchTerm, 
  validateStringLength, 
  isValidNumber,
  isValidEmail,
  generateCSRFToken,
  createRateLimiter
} from '@/utils/security/input-validation';
import { logSecurityEvent } from '@/utils/security/audit-logger';
import { supabase } from '@/integrations/supabase/client';

interface SecureProjectFormProps {
  onSubmit: () => void;
  initialData?: ProjectFormData;
  mode: 'create' | 'edit';
  projectId?: string;
  onLoadingChange?: (loading: boolean) => void;
  existingProject?: Project;
}

// Rate Limiter: Max 10 Projekte pro Stunde
const projectCreationRateLimiter = createRateLimiter(10, 60 * 60 * 1000);

export const SecureProjectForm = ({ 
  onSubmit, 
  initialData, 
  mode, 
  projectId, 
  onLoadingChange,
  existingProject
}: SecureProjectFormProps) => {
  const [csrfToken, setCsrfToken] = useState('');
  const [securityErrors, setSecurityErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  const {
    formData,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    isFormValid,
    activeTab,
    setActiveTab
  } = useProjectForm({ 
    onSubmit: handleSecureSubmit, 
    initialData, 
    mode, 
    projectId 
  });

  // CSRF-Token generieren
  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);

  // Real-time Validierung
  useEffect(() => {
    const validateInRealTime = async () => {
      const errors = await validateProjectData(formData);
      setSecurityErrors(errors);
      setValidationStatus(errors.length === 0 ? 'valid' : 'invalid');
    };

    if (formData.name || formData.description) {
      setValidationStatus('validating');
      const timeout = setTimeout(validateInRealTime, 500); // Debounce
      return () => clearTimeout(timeout);
    }
  }, [formData]);

  // Update loading state when isSubmitting changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isSubmitting);
    }
  }, [isSubmitting, onLoadingChange]);

  // Umfassende Projektdaten-Validierung
  const validateProjectData = async (data: ProjectFormData): Promise<string[]> => {
    const errors: string[] = [];

    try {
      // Basis-Informationen validieren
      if (!validateStringLength(data.name, 3, 100)) {
        errors.push('Projektname muss zwischen 3 und 100 Zeichen lang sein');
      }

      if (!validateStringLength(data.description, 10, 2000)) {
        errors.push('Projektbeschreibung muss zwischen 10 und 2000 Zeichen lang sein');
      }

      // XSS-Schutz für Text-Eingaben
      if (data.name && (data.name.includes('<script') || data.name.includes('javascript:'))) {
        errors.push('Ungültige Zeichen im Projektname erkannt');
      }

      // Finanzielle Validierung
      if (data.budget && !isValidNumber(data.budget, 0, 10000000)) {
        errors.push('Budget muss zwischen 0 und 10.000.000 liegen');
      }

      // Datum-Validierung
      if (data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        
        if (startDate >= endDate) {
          errors.push('Startdatum muss vor Enddatum liegen');
        }

        // Projekt darf nicht mehr als 5 Jahre dauern
        const maxDuration = 5 * 365 * 24 * 60 * 60 * 1000;
        if (endDate.getTime() - startDate.getTime() > maxDuration) {
          errors.push('Projektdauer darf 5 Jahre nicht überschreiten');
        }
      }

      // Team-Mitglieder validieren
      if (data.team && data.team.length > 50) {
        errors.push('Maximale Anzahl von 50 Team-Mitgliedern überschritten');
      }

      // E-Mail-Validierung für Team-Mitglieder
      if (data.team) {
        for (const member of data.team) {
          if (member.email && !isValidEmail(member.email)) {
            errors.push(`Ungültige E-Mail-Adresse: ${member.email}`);
          }
        }
      }

      // Rate Limiting prüfen bei neuen Projekten
      if (mode === 'create') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !projectCreationRateLimiter(user.id)) {
          errors.push('Zu viele Projekte erstellt. Bitte warten Sie eine Stunde.');
          await logSecurityEvent({
            action: 'project_creation_rate_limited',
            resourceType: 'project',
            success: false,
            details: { userId: user.id }
          });
        }
      }

      // Projektname-Duplikat-Prüfung
      if (data.name && mode === 'create') {
        const { data: existingProjects } = await supabase
          .from('projects')
          .select('id, name')
          .ilike('name', data.name.trim());
        
        if (existingProjects && existingProjects.length > 0) {
          errors.push('Ein Projekt mit diesem Namen existiert bereits');
        }
      }

    } catch (error) {
      errors.push('Validierungsfehler aufgetreten');
      console.error('Project validation error:', error);
    }

    return errors;
  };

  // Sichere Feld-Änderung
  const handleSecureFieldChange = (field: keyof ProjectFormData, value: any) => {
    let sanitizedValue = value;

    // String-Werte sanitisieren
    if (typeof value === 'string') {
      sanitizedValue = sanitizeSearchTerm(value);
      
      // Spezielle Behandlung für verschiedene Felder
      switch (field) {
        case 'name':
          if (!validateStringLength(sanitizedValue, 0, 100)) return;
          break;
        case 'description':
          if (!validateStringLength(sanitizedValue, 0, 2000)) return;
          break;
        case 'responsiblePerson':
          if (sanitizedValue && !isValidEmail(sanitizedValue)) return;
          break;
      }
    }

    // Numerische Werte validieren
    if (typeof value === 'number' && field === 'budget') {
      if (!isValidNumber(value, 0, 10000000)) return;
    }

    handleFieldChange(field, sanitizedValue);
  };

  // Sicherer Submit-Handler
  async function handleSecureSubmit() {
    setIsValidating(true);
    
    try {
      const validationErrors = await validateProjectData(formData);
      
      if (validationErrors.length > 0) {
        setSecurityErrors(validationErrors);
        setIsValidating(false);
        return;
      }

      setSecurityErrors([]);

      // Daten vor dem Submit sanitisieren
      const sanitizedData = {
        ...formData,
        name: escapeHtml(formData.name),
        description: escapeHtml(formData.description),
        csrf_token: csrfToken
      };

      // Audit-Log
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logSecurityEvent({
          action: mode === 'create' ? 'project_creation_attempt' : 'project_update_attempt',
          resourceType: 'project',
          resourceId: projectId,
          success: true,
          details: { 
            name: formData.name,
            userId: user.id,
            mode
          }
        });
      }

      // Original Submit aufrufen
      await onSubmit();

    } catch (error) {
      console.error('Secure project submit error:', error);
      setSecurityErrors(['Fehler beim Speichern des Projekts']);
      
      await logSecurityEvent({
        action: mode === 'create' ? 'project_creation_failed' : 'project_update_failed',
        resourceType: 'project',
        resourceId: projectId,
        success: false,
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          mode
        }
      });
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto w-full"> 
      
      {/* Sicherheits-Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">🔒 Sichere Projekt-Verwaltung</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>✅ Real-time Validierung aktiv</div>
                <div>✅ Rate-Limiting: {mode === 'create' ? '10 Projekte/Stunde' : 'Unbegrenzt'}</div>
                <div>✅ Input-Sanitisierung aktiv</div>
                <div>✅ Duplikat-Erkennung aktiv</div>
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

      <div className="space-y-4">
        <FormTabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <Tabs value={activeTab} className="mt-4">
          <BasicInfoTab
            formData={formData}
            onChange={handleSecureFieldChange}
            onNext={() => setActiveTab("team")}
            active={activeTab === "basic-info"}
            forceMount={true}
            mode={mode}
          />
          
          <TeamTab
            formData={formData}
            onChange={handleSecureFieldChange}
            onBack={() => setActiveTab("basic-info")}
            onNext={() => setActiveTab("timeline")}
            active={activeTab === "team"}
            forceMount={true}
            mode={mode}
          />
          
          <TimelineTab
            formData={formData}
            onChange={handleSecureFieldChange}
            onBack={() => setActiveTab("team")}
            onNext={() => setActiveTab("tasks")}
            active={activeTab === "timeline"}
            forceMount={true}
            mode={mode}
          />
          
          <TasksTab
            formData={formData}
            onChange={handleSecureFieldChange}
            onBack={() => setActiveTab("timeline")}
            onNext={() => setActiveTab("goals")}
            active={activeTab === "tasks"}
            forceMount={true}
            mode={mode}
          />

          <GoalsTab
            formData={formData}
            onChange={handleSecureFieldChange}
            onBack={() => setActiveTab("tasks")}
            onNext={() => setActiveTab("financial")}
            active={activeTab === "goals"}
            forceMount={true}
            mode={mode}
          />

          <FinancialTab
            formData={formData}
            onChange={handleSecureFieldChange}
            onBack={() => setActiveTab("goals")}
            onNext={() => setActiveTab("resources")}
            active={activeTab === "financial"}
            forceMount={true}
            mode={mode}
          />
          
          <ResourcesTab
            formData={formData}
            onChange={handleSecureFieldChange}
            onBack={() => setActiveTab("financial")}
            isSubmitting={isSubmitting || isValidating}
            isFormValid={isFormValid() && securityErrors.length === 0}
            mode={mode}
            active={activeTab === "resources"}
            forceMount={true}
          />
        </Tabs>
      </div>

      {/* CSRF-Token (versteckt) */}
      <input type="hidden" value={csrfToken} name="csrf_token" />
    </form>
  );
};