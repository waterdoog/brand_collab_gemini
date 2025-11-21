export interface CollaborationRequest {
  id: string;
  brandName: string;
  email: string;
  requestDate: string; // YYYY-MM-DD
  summary: string;
  budget?: string;
  status: 'pending' | 'accepted' | 'declined' | 'replied';
  selected?: boolean;
}

export interface ReplyTemplate {
  id: 'yes' | 'no';
  name: string;
  subject: string;
  body: string; // Supports placeholders like {brandName}
}

export interface DateRange {
  start: string;
  end: string;
}

export interface EmailConfig {
  email: string;
  authCode: string; // 163 App Password / Authorization Code
  enabled: boolean;
}