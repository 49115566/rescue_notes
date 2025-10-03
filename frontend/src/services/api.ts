import { 
  User, 
  Note, 
  AuthResponse, 
  ApiError, 
  RegisterRequest, 
  LoginRequest, 
  CreateNoteRequest, 
  UpdateNoteRequest 
} from '../types/api';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(code: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async resendVerification(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me');
  }

  // Notes endpoints
  async getNotes(params?: { storage_type?: 'local' | 'cloud'; since?: string }): Promise<{ notes: Note[] }> {
    const searchParams = new URLSearchParams();
    if (params?.storage_type) {
      searchParams.append('storage_type', params.storage_type);
    }
    if (params?.since) {
      searchParams.append('since', params.since);
    }
    
    const query = searchParams.toString();
    const endpoint = `/api/notes${query ? `?${query}` : ''}`;
    
    return this.request<{ notes: Note[] }>(endpoint);
  }

  async getNote(id: string): Promise<{ note: Note }> {
    return this.request<{ note: Note }>(`/api/notes/${id}`);
  }

  async createNote(data: CreateNoteRequest): Promise<{ note: Note }> {
    return this.request<{ note: Note }>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNote(id: string, data: UpdateNoteRequest): Promise<{ note: Note }> {
    return this.request<{ note: Note }>(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNote(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  }

  async changeNoteStorage(id: string, storage_type: 'local' | 'cloud'): Promise<{ note: Note }> {
    return this.request<{ note: Note }>(`/api/notes/${id}/storage`, {
      method: 'POST',
      body: JSON.stringify({ storage_type }),
    });
  }

  async bulkMoveNotesToCloud(): Promise<{ 
    message: string; 
    results: Array<{ id: string; success: boolean; note?: Note; error?: string }>; 
    summary: { total: number; success: number; failed: number } 
  }> {
    return this.request('/api/notes/bulk/move-to-cloud', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;