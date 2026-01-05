// ================================================
// SPRINT 1 TYPES: Core HR + Zeit/Abwesenheit + Payroll DE
// ================================================

// Department Types
export interface Department {
  id: string;
  name: string;
  code?: string;
  parent_id?: string;
  manager_id?: string;
  cost_center?: string;
  budget_allocated?: number;
  location?: string;
  description?: string;
  is_active: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

// Position Types
export interface Position {
  id: string;
  title: string;
  department_id?: string;
  reports_to_position_id?: string;
  job_level: number;
  salary_band_min?: number;
  salary_band_max?: number;
  requires_approval: boolean;
  skills_required: string[];
  responsibilities?: string;
  is_active: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

// HR Case Types
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type CaseStatus = 'open' | 'in_progress' | 'pending_info' | 'resolved' | 'closed';
export type CaseCategory = 'employee_relations' | 'policy_violation' | 'grievance' | 'disciplinary' | 'general_inquiry' | 'benefits' | 'payroll';

export interface HrCase {
  id: string;
  case_number?: string;
  title: string;
  description?: string;
  category: CaseCategory;
  priority: CasePriority;
  status: CaseStatus;
  employee_id?: string;
  reporter_id?: string;
  assigned_to?: string;
  due_date?: string;
  resolution?: string;
  attachments: any[];
  timeline: any[];
  is_confidential: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
}

// Deutsche Arbeitszeit Types
export type ArbeitszeitTyp = 'vollzeit' | 'teilzeit' | 'geringfuegig' | 'praktikant' | 'auszubildender' | 'werkstudent';
export type SchichtTyp = 'frueh' | 'spaet' | 'nacht' | 'bereitschaft' | 'rufbereitschaft';

export interface ArbeitszeitRegelung {
  id: string;
  name: string;
  typ: ArbeitszeitTyp;
  wochenstunden: number;
  taeglich_max_stunden?: number;
  taeglich_min_stunden?: number;
  kernzeit_start?: string;
  kernzeit_ende?: string;
  pause_mindestens_minuten: number;
  pause_ab_stunden?: number;
  ruhezeit_stunden: number;
  nachtarbeit_start?: string;
  nachtarbeit_ende?: string;
  nachtarbeit_zuschlag_prozent?: number;
  sonntagsarbeit_erlaubt: boolean;
  sonntagsarbeit_zuschlag_prozent?: number;
  feiertagsarbeit_zuschlag_prozent?: number;
  ueberstunden_ab_stunden?: number;
  ueberstunden_zuschlag_prozent?: number;
  mehrarbeit_genehmigung_ab_stunden?: number;
  jahresurlaub_tage: number;
  urlaub_verfall_datum?: string;
  krankheit_lohnfortzahlung_tage: number;
  krankheit_attest_ab_tag: number;
  compliance_regeln: Record<string, any>;
  betriebsvereinbarung_referenz?: string;
  tarifvertrag_referenz?: string;
  gueltig_ab: string;
  gueltig_bis?: string;
  ist_aktiv: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

// Deutsche Abwesenheits Types
export type Genehmigungsstatus = 'eingereicht' | 'erster_genehmiger' | 'zweiter_genehmiger' | 'hr_geprueft' | 'genehmigt' | 'abgelehnt' | 'zurueckgezogen';

export interface DeAbwesenheitsart {
  id: string;
  name: string;
  code: string;
  kategorie: string;
  ist_urlaubstag: boolean;
  ist_arbeitstag: boolean;
  lohnfortzahlung: boolean;
  lohnfortzahlung_prozent: number;
  sozialversicherung: boolean;
  steuerlich_relevant: boolean;
  nachweis_erforderlich: boolean;
  nachweis_ab_tag?: number;
  genehmigung_erforderlich: boolean;
  vorlaufzeit_tage: number;
  max_tage_pro_jahr?: number;
  max_aufeinander_tage?: number;
  uebertragbar: boolean;
  uebertragung_bis_datum?: string;
  auszahlung_erlaubt: boolean;
  elster_code?: string;
  deue_code?: string;
  farbe: string;
  icon: string;
  meldung_behoerden: any[];
  parameter: Record<string, any>;
  ist_aktiv: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DeAbwesenheitsantrag {
  id: string;
  antrag_nummer?: string;
  mitarbeiter_id: string;
  abwesenheitsart_id?: string;
  start_datum: string;
  ende_datum: string;
  start_zeit?: string;
  ende_zeit?: string;
  halber_tag: boolean;
  tage_gesamt?: number;
  grund?: string;
  vertretung_id?: string;
  status: Genehmigungsstatus;
  erster_genehmiger_id?: string;
  erster_genehmiger_datum?: string;
  erster_genehmiger_kommentar?: string;
  zweiter_genehmiger_id?: string;
  zweiter_genehmiger_datum?: string;
  zweiter_genehmiger_kommentar?: string;
  hr_geprueft_von?: string;
  hr_geprueft_datum?: string;
  hr_kommentar?: string;
  ablehnungsgrund?: string;
  nachweis_dokument_pfad?: string;
  nachweis_hochgeladen: boolean;
  payroll_verarbeitet: boolean;
  payroll_periode?: string;
  stornierung_grund?: string;
  storniert_von?: string;
  storniert_am?: string;
  workflow_daten: Record<string, any>;
  eskaliert_am?: string;
  erinnerung_gesendet?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface DepartmentFormData {
  name: string;
  code?: string;
  parent_id?: string;
  manager_id?: string;
  cost_center?: string;
  budget_allocated?: number;
  location?: string;
  description?: string;
}

export interface PositionFormData {
  title: string;
  department_id?: string;
  reports_to_position_id?: string;
  job_level: number;
  salary_band_min?: number;
  salary_band_max?: number;
  skills_required: string[];
  responsibilities?: string;
}

export interface HrCaseFormData {
  title: string;
  description?: string;
  category: CaseCategory;
  priority: CasePriority;
  employee_id?: string;
  due_date?: string;
  is_confidential: boolean;
}

export interface AbwesenheitsantragFormData {
  abwesenheitsart_id: string;
  start_datum: string;
  ende_datum: string;
  start_zeit?: string;
  ende_zeit?: string;
  halber_tag: boolean;
  grund?: string;
  vertretung_id?: string;
}

// Status Options
export const CASE_PRIORITY_OPTIONS: { value: CasePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Niedrig', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Mittel', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Hoch', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Dringend', color: 'bg-red-100 text-red-800' },
];

export const CASE_STATUS_OPTIONS: { value: CaseStatus; label: string; color: string }[] = [
  { value: 'open', label: 'Offen', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'pending_info', label: 'Warten auf Info', color: 'bg-orange-100 text-orange-800' },
  { value: 'resolved', label: 'Gelöst', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Geschlossen', color: 'bg-gray-100 text-gray-800' },
];

export const CASE_CATEGORY_OPTIONS: { value: CaseCategory; label: string }[] = [
  { value: 'employee_relations', label: 'Mitarbeiterbeziehungen' },
  { value: 'policy_violation', label: 'Richtlinienverletzung' },
  { value: 'grievance', label: 'Beschwerde' },
  { value: 'disciplinary', label: 'Disziplinar' },
  { value: 'general_inquiry', label: 'Allgemeine Anfrage' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'payroll', label: 'Lohnabrechnung' },
];

export const GENEHMIGUNG_STATUS_OPTIONS: { value: Genehmigungsstatus; label: string; color: string }[] = [
  { value: 'eingereicht', label: 'Eingereicht', color: 'bg-blue-100 text-blue-800' },
  { value: 'erster_genehmiger', label: '1. Genehmiger', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'zweiter_genehmiger', label: '2. Genehmiger', color: 'bg-orange-100 text-orange-800' },
  { value: 'hr_geprueft', label: 'HR geprüft', color: 'bg-purple-100 text-purple-800' },
  { value: 'genehmigt', label: 'Genehmigt', color: 'bg-green-100 text-green-800' },
  { value: 'abgelehnt', label: 'Abgelehnt', color: 'bg-red-100 text-red-800' },
  { value: 'zurueckgezogen', label: 'Zurückgezogen', color: 'bg-gray-100 text-gray-800' },
];