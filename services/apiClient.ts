import { AnalysisResult, UserProfile, AnalysisListItem, StoredAnalysis } from '@/types/wizard';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export class ApiClient {
  constructor(private getToken: () => Promise<string | null>) { }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getToken();

    console.log(`[API Request] Calling: ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeSkin(profile: UserProfile, imageBase64: string): Promise<AnalysisResult> {
    const result = await this.request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ profile, imageBase64 }),
    });
    return result.data;
  }

  async getTTS(text: string): Promise<string> {
    const result = await this.request('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return result.audioBase64;
  }

  async getAnalyses(): Promise<AnalysisListItem[]> {
    const result = await this.request('/api/analyses', {
      method: 'GET',
    });
    return result.data;
  }

  async getAnalysisById(id: string): Promise<StoredAnalysis> {
    const result = await this.request(`/api/analyses/${id}`, {
      method: 'GET',
    });
    return result.data;
  }

  async deleteAnalysis(id: string): Promise<void> {
    await this.request(`/api/analyses/${id}`, {
      method: 'DELETE',
    });
  }
}

// Hook for components
export function useApiClient() {
  const { getToken } = useAuth();
  return new ApiClient(getToken);
}
