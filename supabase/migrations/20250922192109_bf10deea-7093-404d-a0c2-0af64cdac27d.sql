-- Erstelle eine saubere Testfirma für Tests
-- Diese wird über create_clean_company erstellt um sicherzustellen, dass keine Mock-Daten übernommen werden

SELECT create_clean_company(
  'Testfirma Clean GmbH',                    -- p_name
  'Teststraße 1, 12345 Teststadt',          -- p_address  
  'admin@testfirma-clean.de',               -- p_billing_email
  '+49 123 456789',                         -- p_phone
  'www.testfirma-clean.de',                 -- p_website
  'trial',                                  -- p_subscription_status
  'DE123456789',                            -- p_tax_id
  'DE987654321',                            -- p_vat_id
  'Max Testmann'                            -- p_contact_person
) as new_company_id;