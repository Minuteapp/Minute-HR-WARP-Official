export interface RequestBody {
  companyId: string;
  [key: string]: any;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
  emailHTML?: string;
}