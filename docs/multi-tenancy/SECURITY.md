# Multi-Tenancy Security Guide

## Sicherheitsarchitektur

### Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Web App   │  │ Mobile App  │  │   API       │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Supabase Auth                          │   │
│  │  • JWT Token Validation                                   │   │
│  │  • Session Management                                     │   │
│  │  • MFA Support                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    user_roles Table                       │   │
│  │  • Tenant-Zuordnung (company_id)                         │   │
│  │  • Rollen: employee, manager, admin, superadmin          │   │
│  │  • Berechtigungen pro Modul                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ISOLATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Row-Level Security (RLS)                  │   │
│  │  • Automatische company_id Filterung                     │   │
│  │  • Policy-basierte Zugriffskontrolle                     │   │
│  │  • Keine direkten SQL-Injections möglich                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │  Tenant A  │  │  Tenant B  │  │  Tenant C  │                 │
│  │   Data     │  │   Data     │  │   Data     │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Bedrohungsmodell

### 1. Cross-Tenant Data Access

**Bedrohung**: Benutzer von Tenant A greift auf Daten von Tenant B zu.

**Mitigationen**:
- RLS-Policies auf allen Tabellen
- `company_id`-basierte Filterung
- Keine direkten Tabellenzugriffe ohne Policy

**Prüfung**:
```sql
-- Alle Tabellen ohne RLS identifizieren
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT DISTINCT tablename FROM pg_policies WHERE schemaname = 'public'
);
```

### 2. Privilege Escalation

**Bedrohung**: Benutzer erhöht eigene Berechtigungen.

**Mitigationen**:
- `user_roles` Tabelle hat strenge RLS-Policies
- Nur Admins können Rollen ändern
- Keine Self-Service Role-Changes

**Prüfung**:
```sql
-- user_roles Policies prüfen
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_roles';
```

### 3. SQL Injection

**Bedrohung**: Manipulation von Abfragen durch Benutzereingaben.

**Mitigationen**:
- Supabase Client verwendet Prepared Statements
- RLS-Policies als zusätzliche Schutzschicht
- Keine dynamischen SQL-Queries im Frontend

### 4. Session Hijacking

**Bedrohung**: Übernahme einer aktiven Benutzersession.

**Mitigationen**:
- JWT-Token mit kurzer Lebensdauer
- Refresh-Token-Rotation
- Supabase Auth Security Features

### 5. Tenant Impersonation

**Bedrohung**: Admin gibt sich als anderer Tenant aus.

**Mitigationen**:
- `active_tenant_sessions` Tabelle protokolliert Impersonation
- Zeitlich begrenzte Sessions
- Audit-Trail für alle Aktionen

---

## RLS-Policy-Referenz

### Standard-Policy-Muster

```sql
-- SELECT: Nur eigene Tenant-Daten
CREATE POLICY "tenant_select" ON table_name
FOR SELECT USING (
  company_id = public.current_tenant_id()
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = table_name.company_id
  )
);

-- INSERT: Nur in eigenen Tenant
CREATE POLICY "tenant_insert" ON table_name
FOR INSERT WITH CHECK (
  company_id = public.current_tenant_id()
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = table_name.company_id
    AND role IN ('admin', 'superadmin')
  )
);

-- UPDATE: Nur eigene Tenant-Daten
CREATE POLICY "tenant_update" ON table_name
FOR UPDATE USING (
  company_id = public.current_tenant_id()
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = table_name.company_id
    AND role IN ('admin', 'superadmin', 'manager')
  )
);

-- DELETE: Nur Admins
CREATE POLICY "tenant_delete" ON table_name
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = table_name.company_id
    AND role IN ('admin', 'superadmin')
  )
);
```

### Rollen-basierte Policies

```sql
-- Employee: Nur eigene Daten
CREATE POLICY "employee_own_data" ON table_name
FOR ALL USING (
  user_id = auth.uid()
  AND company_id = public.current_tenant_id()
);

-- Manager: Team-Daten
CREATE POLICY "manager_team_data" ON table_name
FOR ALL USING (
  company_id = public.current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = table_name.company_id
    AND role IN ('manager', 'admin', 'superadmin')
  )
);

-- Admin: Alle Tenant-Daten
CREATE POLICY "admin_all_data" ON table_name
FOR ALL USING (
  company_id = public.current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = table_name.company_id
    AND role IN ('admin', 'superadmin')
  )
);
```

---

## Audit & Compliance

### Audit-Trail

Alle sicherheitsrelevanten Aktionen werden protokolliert:

```sql
-- Audit-Tabelle Struktur
CREATE TABLE security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_id UUID,
  company_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT
);
```

### Compliance-Checks

```sql
-- DSGVO: Alle Daten eines Benutzers finden
SELECT 
  'employees' as table_name,
  id,
  created_at
FROM employees WHERE user_id = 'user-uuid'
UNION ALL
SELECT 
  'absence_requests' as table_name,
  id,
  created_at
FROM absence_requests WHERE user_id = 'user-uuid'
UNION ALL
SELECT 
  'time_entries' as table_name,
  id,
  created_at
FROM time_entries WHERE user_id = 'user-uuid';

-- DSGVO: Benutzer anonymisieren
UPDATE employees 
SET 
  first_name = 'DELETED',
  last_name = 'USER',
  email = 'deleted-' || id || '@example.com',
  phone = NULL
WHERE user_id = 'user-uuid';
```

---

## Security Checklist

### Vor Deployment

- [ ] Alle Tabellen haben RLS aktiviert
- [ ] Alle Tabellen haben `company_id` Spalte (wo relevant)
- [ ] Alle `company_id` Spalten haben Foreign Key zu `companies`
- [ ] Alle `company_id` Spalten haben Index
- [ ] Keine `SECURITY DEFINER` Views ohne Notwendigkeit
- [ ] Alle Edge Functions validieren Authentifizierung
- [ ] Keine Secrets im Code

### Nach Deployment

- [ ] RLS-Policies funktionieren (Test mit verschiedenen Usern)
- [ ] Cross-Tenant-Access nicht möglich (Penetration Test)
- [ ] Audit-Trail funktioniert
- [ ] Monitoring-Alerts konfiguriert

### Regelmäßig

- [ ] RLS-Policies auditieren (monatlich)
- [ ] Quarantine-Daten prüfen (wöchentlich)
- [ ] Security-Logs analysieren (täglich)
- [ ] Abhängigkeiten aktualisieren (monatlich)

---

## Incident Response

### Bei Sicherheitsvorfall

1. **Isolation**: Betroffenen Tenant deaktivieren
   ```sql
   UPDATE companies SET is_active = false WHERE id = 'company-uuid';
   ```

2. **Analyse**: Audit-Logs prüfen
   ```sql
   SELECT * FROM security_audit_log 
   WHERE company_id = 'company-uuid'
   AND timestamp > NOW() - INTERVAL '24 hours'
   ORDER BY timestamp DESC;
   ```

3. **Eindämmung**: Betroffene Sessions beenden
   ```sql
   DELETE FROM auth.sessions WHERE user_id IN (
     SELECT user_id FROM user_roles WHERE company_id = 'company-uuid'
   );
   ```

4. **Wiederherstellung**: Nach Behebung Tenant reaktivieren
   ```sql
   UPDATE companies SET is_active = true WHERE id = 'company-uuid';
   ```

5. **Dokumentation**: Vorfall dokumentieren und Maßnahmen festhalten

---

## Kontakte

- **Security Team**: security@example.com
- **Supabase Support**: https://supabase.com/support
- **Notfall-Hotline**: +49 XXX XXXXXXX
