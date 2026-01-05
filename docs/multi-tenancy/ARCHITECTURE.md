# Multi-Tenancy Architektur

## Übersicht

Diese Dokumentation beschreibt die Multi-Tenancy-Architektur der Anwendung, die eine vollständige Datenisolierung zwischen verschiedenen Mandanten (Companies) gewährleistet.

## Architektur-Prinzipien

### 1. Tenant-Identifikation

Jeder Mandant wird durch eine eindeutige `company_id` (UUID) identifiziert. Diese ID ist der primäre Schlüssel für die Datenisolierung.

```sql
-- Aktuelle Tenant-ID abrufen
SELECT public.current_tenant_id();

-- Tenant-Kontext setzen (für Session)
SELECT set_config('app.current_tenant_id', 'company-uuid-here', false);
```

### 2. Row-Level Security (RLS)

Alle Tabellen mit Mandantendaten haben RLS aktiviert. Die Policies basieren auf:

- `company_id`-Spalte in jeder Tabelle
- `current_tenant_id()` Funktion für dynamische Filterung
- Benutzerrollen aus `user_roles` Tabelle

#### Policy-Muster

```sql
-- Standard SELECT Policy
CREATE POLICY "tenant_isolation_select" ON table_name
FOR SELECT USING (
  company_id = public.current_tenant_id()
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = table_name.company_id
  )
);

-- Standard INSERT Policy
CREATE POLICY "tenant_isolation_insert" ON table_name
FOR INSERT WITH CHECK (
  company_id = public.current_tenant_id()
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = table_name.company_id
    AND role IN ('admin', 'superadmin')
  )
);
```

### 3. Datenmodell

```
┌─────────────────┐
│   companies     │ ◄── Mandanten-Stammdaten
└────────┬────────┘
         │
         │ company_id (FK)
         ▼
┌─────────────────┐     ┌─────────────────┐
│   user_roles    │────►│    employees    │
└─────────────────┘     └─────────────────┘
         │                      │
         │ company_id           │ company_id
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│ absence_requests│     │  time_entries   │
└─────────────────┘     └─────────────────┘
         │
         │ company_id
         ▼
┌─────────────────┐
│ absence_documents│
└─────────────────┘
```

## Komponenten

### 1. Tenant-Kontext-Funktionen

| Funktion | Beschreibung |
|----------|-------------|
| `current_tenant_id()` | Gibt die aktuelle Tenant-ID aus Session oder User-Rolle zurück |
| `get_user_company_id()` | Ermittelt die Company-ID eines Benutzers |
| `set_tenant_context(uuid)` | Setzt den Tenant-Kontext für die aktuelle Session |

### 2. Audit-Trail

Alle Änderungen werden in der `quarantine`-Schema protokolliert:

- `quarantine.orphaned_user_roles` - Verwaiste Benutzerrollen
- `quarantine.orphaned_employees` - Verwaiste Mitarbeiter
- `quarantine.orphaned_absence_requests` - Verwaiste Abwesenheitsanträge
- `quarantine.storage_objects` - Nicht zuordenbare Storage-Objekte

### 3. Storage-Integration

Storage-Objekte werden über die `storage_object_tenant_mapping` Tabelle Mandanten zugeordnet:

```sql
CREATE TABLE public.storage_object_tenant_mapping (
  id UUID PRIMARY KEY,
  bucket_id TEXT NOT NULL,
  object_path TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id),
  owner_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Sicherheitsebenen

### Ebene 1: Authentifizierung
- Supabase Auth für Benutzerauthentifizierung
- JWT-Token mit Benutzer-ID

### Ebene 2: Autorisierung
- `user_roles` Tabelle definiert Benutzer-Mandant-Zuordnung
- Rollen: `employee`, `manager`, `admin`, `superadmin`

### Ebene 3: Datenisolierung
- RLS-Policies auf allen Tabellen
- `company_id`-basierte Filterung
- Keine Cross-Tenant-Abfragen möglich

### Ebene 4: Audit
- Trigger für Änderungsprotokolle
- Quarantine-Schema für verwaiste Daten

## Performance-Optimierungen

### Indizes

Alle `company_id`-Spalten haben Indizes:

```sql
CREATE INDEX idx_table_company_id ON table_name(company_id);
```

### Query-Optimierung

- RLS-Policies nutzen EXISTS-Subqueries für effiziente Filterung
- Materialized Views für häufige Aggregationen

## Entwickler-Richtlinien

### 1. Neue Tabellen erstellen

```sql
-- 1. Tabelle mit company_id erstellen
CREATE TABLE public.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  -- weitere Spalten
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS aktivieren
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- 3. Standard-Policies erstellen
CREATE POLICY "tenant_isolation" ON public.new_table
FOR ALL USING (
  company_id = public.current_tenant_id()
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = new_table.company_id
  )
);

-- 4. Index erstellen
CREATE INDEX idx_new_table_company_id ON public.new_table(company_id);
```

### 2. Queries schreiben

```typescript
// RICHTIG: Supabase filtert automatisch via RLS
const { data } = await supabase
  .from('absence_requests')
  .select('*');

// FALSCH: Manuelle company_id-Filter sind redundant
const { data } = await supabase
  .from('absence_requests')
  .select('*')
  .eq('company_id', companyId); // Nicht nötig!
```

### 3. Edge Functions

```typescript
// Tenant-Kontext in Edge Functions setzen
const { data: { user } } = await supabase.auth.getUser();

// RLS filtert automatisch basierend auf auth.uid()
const { data } = await supabase
  .from('employees')
  .select('*');
```

## Fehlerbehebung

### Problem: "new row violates row-level security policy"

**Ursache**: Benutzer hat keine Rolle für den Mandanten.

**Lösung**:
```sql
-- Benutzerrolle prüfen
SELECT * FROM user_roles WHERE user_id = 'user-uuid';

-- Rolle hinzufügen falls fehlend
INSERT INTO user_roles (user_id, company_id, role)
VALUES ('user-uuid', 'company-uuid', 'employee');
```

### Problem: Keine Daten sichtbar

**Ursache**: Tenant-Kontext nicht gesetzt oder falsch.

**Lösung**:
```sql
-- Aktuellen Kontext prüfen
SELECT public.current_tenant_id();

-- Benutzer-Company prüfen
SELECT public.get_user_company_id();
```

### Problem: Cross-Tenant-Datenleck

**Ursache**: RLS-Policy fehlt oder ist fehlerhaft.

**Lösung**:
1. RLS-Status prüfen: `SELECT relrowsecurity FROM pg_class WHERE relname = 'table_name';`
2. Policies prüfen: `SELECT * FROM pg_policies WHERE tablename = 'table_name';`
3. Fehlende Policy erstellen

## Migrations-Historie

| Phase | Beschreibung | Status |
|-------|-------------|--------|
| 0 | Quarantine-Schema | ✅ Abgeschlossen |
| 1 | company_id Backfill | ✅ Abgeschlossen |
| 2 | Foreign Keys | ✅ Abgeschlossen |
| 3 | RLS Policies | ✅ Abgeschlossen |
| 4 | Indizes | ✅ Abgeschlossen |
| 5 | Trigger | ✅ Abgeschlossen |
| 6 | Views | ✅ Abgeschlossen |
| 7 | Storage | ✅ Abgeschlossen |
| 8 | Regression Tests | ✅ Abgeschlossen |
| 9 | Dokumentation | ✅ Abgeschlossen |
