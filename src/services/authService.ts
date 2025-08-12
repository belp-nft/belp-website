import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URI || 'https://belpy-core.blockifyy.com';

// JWT Token management
const TOKEN_KEY = 'belp_jwt_token';

export class AuthService {
  /**
   * Lưu JWT token vào localStorage
   */
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  /**
   * Lấy JWT token từ localStorage
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  /**
   * Xóa JWT token khỏi localStorage
   */
  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  /**
   * Kiểm tra xem có JWT token hay không
   */
  static hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Lấy headers với Authorization nếu có token
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Tạo axios instance với auth headers
   */
  static createAuthorizedClient() {
    return axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Handle response để kiểm tra token expiry
   */
  static handleUnauthorized(error: any) {
    if (error.response?.status === 401) {
      console.warn('Token expired or invalid, removing token');
      this.removeToken();
      // Có thể redirect về trang login hoặc show modal connect wallet
    }
    throw error;
  }
}

export default AuthService;
