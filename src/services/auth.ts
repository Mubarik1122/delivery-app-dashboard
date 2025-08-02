export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'vendor';
}

export class AuthService {
  private static instance: AuthService;
  private user: User | null = null;
  private token: string | null = null;

  private constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public setAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): User | null {
    return this.user;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
  }
}

export const authService = AuthService.getInstance();