
export interface CalendarDocumentReference {
  id: string;
  event_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  document_type: string;
  uploaded_at: string;
  contains_personal_data: boolean;
}
