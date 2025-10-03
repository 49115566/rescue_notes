export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  email_verified: boolean;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  storage_type: 'local' | 'cloud';
  deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  details?: any;
}

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