
export type CompanyInformationFormData = {
  name: string;
  street: string;
  postal_code: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  logo_url?: string;
  tax_id: string;
  vat_id: string;
  contact_person: string;
};

export type CompanyInformation = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  logo_url?: string;
  tax_id: string;
  vat_id: string;
  contact_person: string;
  created_at: string;
  updated_at: string;
};

export type SubsidiaryFormData = {
  name: string;
  legal_form: string;
  address: string;
  tax_id: string;
  contact_person: string;
  status: 'active' | 'inactive';
};

export type Subsidiary = {
  id: string;
  name: string;
  legal_form: string;
  address: string;
  tax_id: string;
  contact_person: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  parent_id: string;
};
