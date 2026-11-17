export interface ApiErrorDetail {
  field: string;
  messages: string[];
}

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}
