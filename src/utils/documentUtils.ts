
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊';
  return '📁';
};

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export const isPdfFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop() || '';
};

export const DOCUMENT_CATEGORIES = {
  training: 'Schulung & Weiterbildung',
  recruiting: 'Recruiting & Onboarding',
  company: 'Unternehmensdokumente',
  employee: 'Mitarbeiterdokumente', 
  payroll: 'Lohn & Gehalt',
  legal: 'Rechtliche Dokumente'
};

export const getDocumentCategoryLabel = (category: string) => 
  DOCUMENT_CATEGORIES[category as keyof typeof DOCUMENT_CATEGORIES] || 'Unbekannt';
