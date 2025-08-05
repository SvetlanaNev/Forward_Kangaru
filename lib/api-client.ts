import { auth } from './firebase';

export class ApiClient {
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async get(url: string): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(url, {
      method: 'GET',
      headers,
    });
  }

  static async post(url: string, data: any): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  static async put(url: string, data: any): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }

  static async delete(url: string): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(url, {
      method: 'DELETE',
      headers,
    });
  }
} 