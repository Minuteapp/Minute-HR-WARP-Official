-- =====================================================
-- OPTION 3: ALLE RLS Policies löschen
-- Kompletter Neustart - keine Policies mehr
-- =====================================================

-- employees: Alle Policies löschen
DROP POLICY IF EXISTS "Superadmins view all employees" ON employees;
DROP POLICY IF EXISTS "Employees can view their own profile" ON employees;
DROP POLICY IF EXISTS "HR managers view employees in their company" ON employees;
DROP POLICY IF EXISTS "Managers can view team members" ON employees;
DROP POLICY IF EXISTS "Employees can update their own profile" ON employees;
DROP POLICY IF EXISTS "HR managers can manage employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON employees;
DROP POLICY IF EXISTS "Multi-Tenant: Employees isoliert nach Firma" ON employees;
DROP POLICY IF EXISTS "Multi-Tenant: Employees Insert mit Firmenbindung" ON employees;
DROP POLICY IF EXISTS "Multi-Tenant: Employees Update mit Firmenbindung" ON employees;
DROP POLICY IF EXISTS "Multi-Tenant: Employees Delete mit Firmenbindung" ON employees;

-- projects: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view projects in their company" ON projects;
DROP POLICY IF EXISTS "Project managers can manage projects" ON projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
DROP POLICY IF EXISTS "Multi-Tenant: Projects isoliert nach Firma" ON projects;
DROP POLICY IF EXISTS "Multi-Tenant: Projects Insert mit Firmenbindung" ON projects;
DROP POLICY IF EXISTS "Multi-Tenant: Projects Update mit Firmenbindung" ON projects;
DROP POLICY IF EXISTS "Multi-Tenant: Projects Delete mit Firmenbindung" ON projects;

-- tasks: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view tasks in their company" ON tasks;
DROP POLICY IF EXISTS "Users can manage their assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Project managers can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Multi-Tenant: Tasks isoliert nach Firma" ON tasks;
DROP POLICY IF EXISTS "Multi-Tenant: Tasks Insert mit Firmenbindung" ON tasks;
DROP POLICY IF EXISTS "Multi-Tenant: Tasks Update mit Firmenbindung" ON tasks;
DROP POLICY IF EXISTS "Multi-Tenant: Tasks Delete mit Firmenbindung" ON tasks;

-- calendar_events: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view events in their company" ON calendar_events;
DROP POLICY IF EXISTS "Users can manage their own events" ON calendar_events;
DROP POLICY IF EXISTS "Admins can manage all events" ON calendar_events;
DROP POLICY IF EXISTS "Multi-Tenant: Calendar Events isoliert nach Firma" ON calendar_events;
DROP POLICY IF EXISTS "Multi-Tenant: Calendar Events Insert mit Firmenbindung" ON calendar_events;
DROP POLICY IF EXISTS "Multi-Tenant: Calendar Events Update mit Firmenbindung" ON calendar_events;
DROP POLICY IF EXISTS "Multi-Tenant: Calendar Events Delete mit Firmenbindung" ON calendar_events;

-- business_trips: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view business trips in their company" ON business_trips;
DROP POLICY IF EXISTS "Users can manage their own trips" ON business_trips;
DROP POLICY IF EXISTS "Managers can approve trips" ON business_trips;
DROP POLICY IF EXISTS "Multi-Tenant: Business Trips isoliert nach Firma" ON business_trips;
DROP POLICY IF EXISTS "Multi-Tenant: Business Trips Insert mit Firmenbindung" ON business_trips;
DROP POLICY IF EXISTS "Multi-Tenant: Business Trips Update mit Firmenbindung" ON business_trips;
DROP POLICY IF EXISTS "Multi-Tenant: Business Trips Delete mit Firmenbindung" ON business_trips;

-- goals: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view goals in their company" ON goals;
DROP POLICY IF EXISTS "Users can manage their own goals" ON goals;
DROP POLICY IF EXISTS "Managers can manage team goals" ON goals;
DROP POLICY IF EXISTS "Multi-Tenant: Goals isoliert nach Firma" ON goals;
DROP POLICY IF EXISTS "Multi-Tenant: Goals Insert mit Firmenbindung" ON goals;
DROP POLICY IF EXISTS "Multi-Tenant: Goals Update mit Firmenbindung" ON goals;
DROP POLICY IF EXISTS "Multi-Tenant: Goals Delete mit Firmenbindung" ON goals;

-- objectives: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view objectives in their company" ON objectives;
DROP POLICY IF EXISTS "Users can manage objectives" ON objectives;
DROP POLICY IF EXISTS "Multi-Tenant: Objectives isoliert nach Firma" ON objectives;
DROP POLICY IF EXISTS "Multi-Tenant: Objectives Insert mit Firmenbindung" ON objectives;
DROP POLICY IF EXISTS "Multi-Tenant: Objectives Update mit Firmenbindung" ON objectives;
DROP POLICY IF EXISTS "Multi-Tenant: Objectives Delete mit Firmenbindung" ON objectives;

-- documents: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view documents in their company" ON documents;
DROP POLICY IF EXISTS "Users can upload documents" ON documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
DROP POLICY IF EXISTS "Multi-Tenant: Documents isoliert nach Firma" ON documents;
DROP POLICY IF EXISTS "Multi-Tenant: Documents Insert mit Firmenbindung" ON documents;
DROP POLICY IF EXISTS "Multi-Tenant: Documents Update mit Firmenbindung" ON documents;
DROP POLICY IF EXISTS "Multi-Tenant: Documents Delete mit Firmenbindung" ON documents;

-- absence_requests: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view absence requests in their company" ON absence_requests;
DROP POLICY IF EXISTS "Users can manage their own requests" ON absence_requests;
DROP POLICY IF EXISTS "Managers can approve requests" ON absence_requests;
DROP POLICY IF EXISTS "Multi-Tenant: Absence Requests isoliert nach Firma" ON absence_requests;
DROP POLICY IF EXISTS "Multi-Tenant: Absence Requests Insert mit Firmenbindung" ON absence_requests;
DROP POLICY IF EXISTS "Multi-Tenant: Absence Requests Update mit Firmenbindung" ON absence_requests;
DROP POLICY IF EXISTS "Multi-Tenant: Absence Requests Delete mit Firmenbindung" ON absence_requests;

-- time_entries: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view time entries in their company" ON time_entries;
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Managers can view team time entries" ON time_entries;
DROP POLICY IF EXISTS "Multi-Tenant: Time Entries isoliert nach Firma" ON time_entries;
DROP POLICY IF EXISTS "Multi-Tenant: Time Entries Insert mit Firmenbindung" ON time_entries;
DROP POLICY IF EXISTS "Multi-Tenant: Time Entries Update mit Firmenbindung" ON time_entries;
DROP POLICY IF EXISTS "Multi-Tenant: Time Entries Delete mit Firmenbindung" ON time_entries;

-- shifts: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view shifts in their company" ON shifts;
DROP POLICY IF EXISTS "Users can manage their own shifts" ON shifts;
DROP POLICY IF EXISTS "Managers can manage team shifts" ON shifts;
DROP POLICY IF EXISTS "Multi-Tenant: Shifts isoliert nach Firma" ON shifts;
DROP POLICY IF EXISTS "Multi-Tenant: Shifts Insert mit Firmenbindung" ON shifts;
DROP POLICY IF EXISTS "Multi-Tenant: Shifts Update mit Firmenbindung" ON shifts;
DROP POLICY IF EXISTS "Multi-Tenant: Shifts Delete mit Firmenbindung" ON shifts;

-- =====================================================
-- Ergebnis: Alle Tabellen haben RLS aktiviert aber KEINE Policies
-- Das bedeutet: Authentifizierte Benutzer können NICHTS sehen/ändern
-- bis neue Policies erstellt werden
-- =====================================================