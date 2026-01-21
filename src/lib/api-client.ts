/**
 * ArduIDE API Client
 * Replaces Supabase with custom Node.js/MariaDB backend
 */

// Get API URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
const TOKEN_KEY = 'arduide_token';
const USER_KEY = 'arduide_user';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  blockly_xml: string;
  generated_code: string;
  board: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  blockly_xml: string;
  generated_code: string;
  created_at: string;
}

export interface CompileResult {
  success: boolean;
  hex?: string;
  output?: string;
  error?: string;
  size?: {
    flash: number | null;
    ram: number | null;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================
// Token Management
// ============================================

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// ============================================
// API Request Helper
// ============================================

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  requireAuth?: boolean;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, requireAuth = false } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

// ============================================
// Authentication API
// ============================================

export const authApi = {
  async signup(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    const result = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: { email, password, displayName }
    });
    
    setToken(result.token);
    setStoredUser(result.user);
    
    return result;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    
    setToken(result.token);
    setStoredUser(result.user);
    
    return result;
  },

  async logout(): Promise<void> {
    clearToken();
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;

    try {
      const result = await apiRequest<{ user: User }>('/auth/me', { requireAuth: true });
      setStoredUser(result.user);
      return result.user;
    } catch {
      clearToken();
      return null;
    }
  },

  async updateProfile(displayName: string): Promise<User> {
    const result = await apiRequest<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: { displayName },
      requireAuth: true
    });
    
    setStoredUser(result.user);
    return result.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiRequest('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
      requireAuth: true
    });
  },

  isAuthenticated(): boolean {
    return !!getToken();
  }
};

// ============================================
// Projects API
// ============================================

export const projectsApi = {
  async getAll(): Promise<Project[]> {
    const result = await apiRequest<{ projects: Project[] }>('/projects', {
      requireAuth: true
    });
    return result.projects;
  },

  async getById(id: string): Promise<Project> {
    const result = await apiRequest<{ project: Project }>(`/projects/${id}`, {
      requireAuth: true
    });
    return result.project;
  },

  async create(data: {
    name: string;
    blocklyXml?: string;
    generatedCode?: string;
    board?: string;
  }): Promise<Project> {
    const result = await apiRequest<{ project: Project }>('/projects', {
      method: 'POST',
      body: data,
      requireAuth: true
    });
    return result.project;
  },

  async update(id: string, data: {
    name?: string;
    blocklyXml?: string;
    generatedCode?: string;
    board?: string;
  }): Promise<Project> {
    const result = await apiRequest<{ project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: data,
      requireAuth: true
    });
    return result.project;
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/projects/${id}`, {
      method: 'DELETE',
      requireAuth: true
    });
  },

  async getVersions(projectId: string): Promise<ProjectVersion[]> {
    const result = await apiRequest<{ versions: ProjectVersion[] }>(`/projects/${projectId}/versions`, {
      requireAuth: true
    });
    return result.versions;
  },

  async getVersion(projectId: string, versionId: string): Promise<ProjectVersion> {
    const result = await apiRequest<{ version: ProjectVersion }>(`/projects/${projectId}/versions/${versionId}`, {
      requireAuth: true
    });
    return result.version;
  }
};

// ============================================
// Compile API
// ============================================

export const compileApi = {
  async getBoards(): Promise<{ fqbn: string; name: string }[]> {
    const result = await apiRequest<{ boards: { fqbn: string; name: string }[] }>('/compile/boards');
    return result.boards;
  },

  async compile(code: string, board: string): Promise<CompileResult> {
    const result = await apiRequest<CompileResult>('/compile', {
      method: 'POST',
      body: { code, board }
    });
    return result;
  },

  async validate(code: string): Promise<{ valid: boolean; errors: string[] }> {
    const result = await apiRequest<{ valid: boolean; errors: string[] }>('/compile/validate', {
      method: 'POST',
      body: { code }
    });
    return result;
  }
};

// ============================================
// Health Check
// ============================================

export const healthCheck = async (): Promise<boolean> => {
  try {
    await apiRequest('/health');
    return true;
  } catch {
    return false;
  }
};
