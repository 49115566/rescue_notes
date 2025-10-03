export interface User {
  id: string;
  email: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  email_verified: boolean;
  google_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  storage_type: 'local' | 'cloud';
  deleted: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface EmailVerificationCode {
  id: string;
  user_id: string;
  code: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SyncQueueItem {
  id: string;
  user_id: string;
  note_id?: string;
  operation: 'create' | 'update' | 'delete';
  data?: any;
  queued_at: Date;
  processed: boolean;
  processed_at?: Date;
}

// Request/Response types
export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface CreateNoteRequest {
  title: string;
  content?: string;
  storage_type?: 'local' | 'cloud';
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  storage_type?: 'local' | 'cloud';
}

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  email_verified: boolean;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}