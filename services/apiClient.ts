import { AnalysisListItem, AnalysisResult, StoredAnalysis, UserProfile } from '@/types/wizard';
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
      const errorBody = await response.text();
      console.error(`[API Error] Status: ${response.status}, Body: ${errorBody}`);
      throw new Error(`API error: ${response.statusText} (${response.status})`);
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

  async getTTS(text: string, language?: string): Promise<string> {
    const result = await this.request('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
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

  async transcribeAudio(audioBase64: string, mimeType: string = 'audio/wav', language?: string): Promise<string> {
    const result = await this.request('/api/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioBase64, mimeType, language }),
    });
    return result.text || '';
  }
}

// Hook for components
export function useApiClient() {
  const { getToken } = useAuth();
  return new ApiClient(getToken);
}
