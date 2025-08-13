import { APP_CONFIG } from "../config/env.config";

const TOKEN_KEY = APP_CONFIG.STORAGE_KEYS.JWT_TOKEN;

export class AuthService {
  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  static hasToken(): boolean {
    return !!this.getToken();
  }

  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
      }

      return true;
    } catch (error) {
      console.warn("Invalid token format:", error);
      return false;
    }
  }

  static validateAndCleanToken(): boolean {
    if (!this.isTokenValid()) {
      console.warn("Token is invalid or expired, removing...");
      this.removeToken();
      return false;
    }
    return true;
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  static handleUnauthorized(error: any) {
    if (error.response?.status === 401) {
      console.warn("Token expired or invalid, removing token");
      this.removeToken();
    }
    throw error;
  }
}
