import { supabase } from "@/integrations/supabase/client";

export const GERMAN_ABSENCE_TYPES = [
  { name: 'Urlaub', color: '#22c55e', icon: 'palm-tree' },
  { name: 'Krankheit', color: '#ef4444', icon: 'thermometer' },
  { name: 'Elternzeit', color: '#8b5cf6', icon: 'baby' },
  { name: 'Sonderurlaub', color: '#f59e0b', icon: 'star' },
  { name: 'Homeoffice', color: '#3b82f6', icon: 'home' },
  { name: 'Fortbildung', color: '#06b6d4', icon: 'graduation-cap' },
  { name: 'Unbezahlter Urlaub', color: '#6b7280', icon: 'calendar-x' },
  { name: 'Mutterschutz', color: '#ec4899', icon: 'heart' },
  { name: 'Überstundenabbau', color: '#14b8a6', icon: 'clock' },
];

export const GERMAN_DEPARTMENTS = [
  { name: 'Geschäftsführung', description: 'Unternehmensleitung' },
  { name: 'Personal / HR', description: 'Personalwesen und Human Resources' },
  { name: 'IT / Entwicklung', description: 'Informationstechnologie und Softwareentwicklung' },
  { name: 'Vertrieb', description: 'Verkauf und Kundenbetreuung' },
  { name: 'Marketing', description: 'Marketing und Kommunikation' },
  { name: 'Finanzen / Buchhaltung', description: 'Finanzbuchhaltung und Controlling' },
  { name: 'Produktion', description: 'Fertigung und Herstellung' },
  { name: 'Einkauf', description: 'Beschaffung und Lieferantenmanagement' },
  { name: 'Qualitätsmanagement', description: 'Qualitätssicherung und -kontrolle' },
];

export async function createDefaultAbsenceTypes(companyId: string): Promise<void> {
  console.log('Creating default German absence types for company:', companyId);
  
  const absenceTypesToCreate = GERMAN_ABSENCE_TYPES.map(type => ({
    company_id: companyId,
    name: type.name,
    color: type.color,
    icon: type.icon,
  }));

  const { error } = await supabase
    .from('absence_types')
    .insert(absenceTypesToCreate);

  if (error) {
    console.error('Error creating default absence types:', error);
    throw new Error(`Fehler beim Erstellen der Standard-Abwesenheitstypen: ${error.message}`);
  }

  console.log('Default absence types created successfully');
}

export async function createDefaultDepartments(companyId: string): Promise<void> {
  console.log('Creating default German departments for company:', companyId);
  
  const departmentsToCreate = GERMAN_DEPARTMENTS.map(dept => ({
    company_id: companyId,
    name: dept.name,
    description: dept.description,
    is_active: true,
  }));

  const { error } = await supabase
    .from('departments')
    .insert(departmentsToCreate);

  if (error) {
    console.error('Error creating default departments:', error);
    throw new Error(`Fehler beim Erstellen der Standard-Abteilungen: ${error.message}`);
  }

  console.log('Default departments created successfully');
}

export async function createDefaultMasterData(companyId: string, options: {
  absenceTypes?: boolean;
  departments?: boolean;
} = { absenceTypes: true, departments: false }): Promise<void> {
  const promises: Promise<void>[] = [];
  
  if (options.absenceTypes) {
    promises.push(createDefaultAbsenceTypes(companyId));
  }
  
  if (options.departments) {
    promises.push(createDefaultDepartments(companyId));
  }
  
  await Promise.all(promises);
}
