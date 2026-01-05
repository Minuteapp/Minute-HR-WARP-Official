-- Migration 3: Wissen & Innovation (Knowledge, Helpdesk, Rewards, Innovation)

-- KNOWLEDGE Settings
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('knowledge', 'review_before_publish', 'Review vor Veröffentlichung', 'Artikel müssen vor Veröffentlichung geprüft werden', 'boolean', 'true', 'true', 'review', true, 10),
  ('knowledge', 'periodic_review', 'Periodische Überprüfung', 'Regelmäßige Artikelüberprüfung', 'boolean', 'true', 'true', 'review', true, 20),
  ('knowledge', 'review_interval_months', 'Überprüfungsintervall (Monate)', 'Wie oft Artikel überprüft werden', 'number', '6', '6', 'review', true, 30),
  ('knowledge', 'versioning_enabled', 'Versionierung aktiviert', 'Artikelversionen speichern', 'boolean', 'true', 'true', 'versioning', true, 40),
  ('knowledge', 'max_versions', 'Max. Versionen', 'Maximale Anzahl gespeicherter Versionen', 'number', '10', '10', 'versioning', true, 50),
  ('knowledge', 'comments_enabled', 'Kommentare aktiviert', 'Benutzer können kommentieren', 'boolean', 'true', 'true', 'interaction', true, 60),
  ('knowledge', 'ratings_enabled', 'Bewertungen aktiviert', 'Benutzer können bewerten', 'boolean', 'true', 'true', 'interaction', true, 70),
  ('knowledge', 'search_enabled', 'Volltextsuche', 'Volltextsuche aktivieren', 'boolean', 'true', 'true', 'search', true, 80),
  ('knowledge', 'ai_suggestions', 'KI-Vorschläge', 'KI-gestützte Artikelvorschläge', 'boolean', 'false', 'true', 'ai', true, 90),
  ('knowledge', 'auto_categorize', 'Auto-Kategorisierung', 'Automatische Kategoriezuweisung', 'boolean', 'false', 'true', 'ai', true, 100),
  ('knowledge', 'access_control', 'Zugriffskontrolle', 'Artikel-Zugriffsrechte verwalten', 'boolean', 'true', 'true', 'access', true, 110),
  ('knowledge', 'public_articles', 'Öffentliche Artikel', 'Artikel für alle sichtbar', 'boolean', 'false', 'false', 'access', true, 120)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- HELPDESK Settings
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('helpdesk', 'email_ticket_creation', 'E-Mail-Ticket-Erstellung', 'Tickets aus E-Mails erstellen', 'boolean', 'true', 'true', 'channels', true, 10),
  ('helpdesk', 'self_service_portal', 'Self-Service-Portal', 'Mitarbeiter-Self-Service aktivieren', 'boolean', 'true', 'true', 'channels', true, 20),
  ('helpdesk', 'chat_enabled', 'Chat aktiviert', 'Live-Chat für Support', 'boolean', 'false', 'true', 'channels', true, 30),
  ('helpdesk', 'sla_critical_response_hours', 'SLA Kritisch Antwort (Std)', 'Max. Antwortzeit für kritische Tickets', 'number', '1', '1', 'sla', true, 40),
  ('helpdesk', 'sla_critical_resolution_hours', 'SLA Kritisch Lösung (Std)', 'Max. Lösungszeit für kritische Tickets', 'number', '4', '4', 'sla', true, 50),
  ('helpdesk', 'sla_high_response_hours', 'SLA Hoch Antwort (Std)', 'Max. Antwortzeit für hohe Priorität', 'number', '4', '4', 'sla', true, 60),
  ('helpdesk', 'sla_high_resolution_hours', 'SLA Hoch Lösung (Std)', 'Max. Lösungszeit für hohe Priorität', 'number', '24', '24', 'sla', true, 70),
  ('helpdesk', 'sla_normal_response_hours', 'SLA Normal Antwort (Std)', 'Max. Antwortzeit für normale Tickets', 'number', '24', '24', 'sla', true, 80),
  ('helpdesk', 'sla_normal_resolution_hours', 'SLA Normal Lösung (Std)', 'Max. Lösungszeit für normale Tickets', 'number', '72', '72', 'sla', true, 90),
  ('helpdesk', 'auto_escalation', 'Automatische Eskalation', 'SLA-Überschreitung eskalieren', 'boolean', 'true', 'true', 'escalation', true, 100),
  ('helpdesk', 'escalation_notify_manager', 'Manager bei Eskalation', 'Manager bei Eskalation benachrichtigen', 'boolean', 'true', 'true', 'escalation', true, 110),
  ('helpdesk', 'assignment_method', 'Zuweisungsmethode', 'Wie Tickets zugewiesen werden', 'string', '"round-robin"', '"round-robin"', 'assignment', true, 120),
  ('helpdesk', 'auto_close_days', 'Auto-Schließen (Tage)', 'Inaktive Tickets nach X Tagen schließen', 'number', '7', '7', 'automation', true, 130),
  ('helpdesk', 'satisfaction_survey', 'Zufriedenheitsumfrage', 'Nach Ticketlösung Umfrage senden', 'boolean', 'true', 'true', 'feedback', true, 140),
  ('helpdesk', 'knowledge_suggestions', 'KB-Vorschläge', 'Wissensbasis-Artikel vorschlagen', 'boolean', 'true', 'true', 'ai', true, 150),
  ('helpdesk', 'ai_categorization', 'KI-Kategorisierung', 'Automatische Ticket-Kategorisierung', 'boolean', 'false', 'true', 'ai', true, 160),
  ('helpdesk', 'priority_detection', 'Prioritätserkennung', 'Automatische Prioritätserkennung', 'boolean', 'false', 'true', 'ai', true, 170),
  ('helpdesk', 'first_response_template', 'Erste-Antwort-Vorlage', 'Automatische Erstantwort', 'boolean', 'true', 'true', 'automation', true, 180),
  ('helpdesk', 'business_hours_only', 'Nur Geschäftszeiten', 'SLA nur während Geschäftszeiten', 'boolean', 'true', 'true', 'sla', true, 190)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- REWARDS Settings
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('rewards', 'points_enabled', 'Punktesystem aktiviert', 'Punkte für Mitarbeiter', 'boolean', 'true', 'true', 'points', true, 10),
  ('rewards', 'points_expiry_months', 'Punkte-Ablauf (Monate)', 'Punkte verfallen nach X Monaten', 'number', '12', '12', 'points', true, 20),
  ('rewards', 'self_reward_allowed', 'Selbst belohnen', 'Mitarbeiter können sich selbst belohnen', 'boolean', 'false', 'false', 'points', true, 30),
  ('rewards', 'peer_recognition', 'Peer-Anerkennung', 'Kollegen können sich gegenseitig anerkennen', 'boolean', 'true', 'true', 'recognition', true, 40),
  ('rewards', 'manager_bonus', 'Manager-Bonus', 'Manager können Bonus-Punkte vergeben', 'boolean', 'true', 'true', 'recognition', true, 50),
  ('rewards', 'catalog_enabled', 'Prämien-Katalog', 'Prämien-Katalog aktivieren', 'boolean', 'true', 'true', 'catalog', true, 60),
  ('rewards', 'min_points_to_redeem', 'Min. Punkte zum Einlösen', 'Mindestpunkte für Einlösung', 'number', '50', '50', 'catalog', true, 70),
  ('rewards', 'auto_birthday_points', 'Geburtstags-Punkte', 'Automatische Punkte zum Geburtstag', 'boolean', 'true', 'true', 'automation', true, 80),
  ('rewards', 'birthday_points_amount', 'Geburtstags-Punktezahl', 'Punkte zum Geburtstag', 'number', '100', '100', 'automation', true, 90),
  ('rewards', 'anniversary_points', 'Jubiläums-Punkte', 'Punkte zum Firmenjubiläum', 'boolean', 'true', 'true', 'automation', true, 100),
  ('rewards', 'leaderboard_enabled', 'Rangliste aktiviert', 'Punkte-Rangliste anzeigen', 'boolean', 'true', 'true', 'gamification', true, 110),
  ('rewards', 'badges_enabled', 'Abzeichen aktiviert', 'Abzeichen-System aktivieren', 'boolean', 'true', 'true', 'gamification', true, 120)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- INNOVATION Settings
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('innovation', 'anonymous_submission', 'Anonyme Einreichung', 'Ideen anonym einreichen', 'boolean', 'true', 'true', 'submission', true, 10),
  ('innovation', 'categories_required', 'Kategorien erforderlich', 'Kategorie bei Einreichung erforderlich', 'boolean', 'true', 'true', 'submission', true, 20),
  ('innovation', 'voting_enabled', 'Abstimmung aktiviert', 'Mitarbeiter können abstimmen', 'boolean', 'true', 'true', 'voting', true, 30),
  ('innovation', 'voting_period_days', 'Abstimmungszeitraum (Tage)', 'Dauer der Abstimmungsphase', 'number', '14', '14', 'voting', true, 40),
  ('innovation', 'submission_approval', 'Einreichungs-Genehmigung', 'Ideen müssen genehmigt werden', 'boolean', 'false', 'false', 'moderation', true, 50),
  ('innovation', 'implementation_tracking', 'Umsetzungs-Tracking', 'Umsetzungsfortschritt verfolgen', 'boolean', 'true', 'true', 'tracking', true, 60),
  ('innovation', 'reward_for_ideas', 'Belohnung für Ideen', 'Punkte für eingereichte Ideen', 'boolean', 'true', 'true', 'rewards', true, 70),
  ('innovation', 'idea_points', 'Punkte pro Idee', 'Punkte für eingereichte Idee', 'number', '10', '10', 'rewards', true, 80),
  ('innovation', 'implemented_bonus', 'Umsetzungs-Bonus', 'Bonus bei Ideenumsetzung', 'boolean', 'true', 'true', 'rewards', true, 90),
  ('innovation', 'implemented_bonus_points', 'Bonus-Punkte', 'Punkte bei Ideenumsetzung', 'number', '100', '100', 'rewards', true, 100)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;