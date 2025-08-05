export interface User {
  sub: string;
  email: string;
  name: string;
  picture: string;
  updated_at: string;
  email_verified: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }

  async login(): Promise<void> {
    window.location.href = `${this.apiUrl}/login`;
  }

  async logout(): Promise<void> {
    window.location.href = `${this.apiUrl}/logout`;
  }

  async getUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/profile`, {
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        return user;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null;
  }

  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    const user = await this.getUser();
    return {
      isAuthenticated: user !== null,
      user
    };
  }
}

export const authService = new AuthService();
