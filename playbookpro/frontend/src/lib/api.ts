const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Playbook methods
  async getPlaybooks(params?: { coach_id?: string; public_only?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.coach_id) searchParams.set('coach_id', params.coach_id);
    if (params?.public_only) searchParams.set('public_only', 'true');
    
    const query = searchParams.toString();
    return this.request(`/api/playbooks${query ? `?${query}` : ''}`);
  }

  async getPlaybook(id: string) {
    return this.request(`/api/playbooks/${id}`);
  }

  async createPlaybook(data: any, coachId?: string) {
    const params = coachId ? `?coach_id=${coachId}` : '';
    return this.request(`/api/playbooks${params}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlaybook(id: string, data: any) {
    return this.request(`/api/playbooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlaybook(id: string) {
    return this.request(`/api/playbooks/${id}`, {
      method: 'DELETE',
    });
  }

  // User methods
  async createUser(data: {
    firebase_uid: string;
    email: string;
    display_name: string;
    role: string;
  }) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUser(firebaseUid: string) {
    return this.request(`/api/users/${firebaseUid}`);
  }

  // Game session methods
  async createGameSession(data: {
    player_id?: string;
    playbook_id?: string;
    play_step?: number;
  }) {
    return this.request('/api/game-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGameSession(id: string) {
    return this.request(`/api/game-sessions/${id}`);
  }

  async addActionToSession(sessionId: string, action: any) {
    return this.request(`/api/game-sessions/${sessionId}/actions`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async endGameSession(sessionId: string) {
    return this.request(`/api/game-sessions/${sessionId}/end`, {
      method: 'POST',
    });
  }

  // AI feedback
  async generateAIFeedback(data: { session_id: string; actions: any[] }) {
    return this.request('/api/ai/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // File upload
  async uploadFile(file: File, coachId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (coachId) formData.append('coach_id', coachId);

    return this.request('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it with boundary
    });
  }

  // Sample data
  async createSampleData() {
    return this.request('/api/sample-data', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;