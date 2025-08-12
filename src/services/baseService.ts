import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthService } from './authService';
import { API_CONFIG } from '../config/env.config';
import type { ApiResponse, ApiError } from './types';

/**
 * Custom Error Class for API errors
 */
export class ApiErrorException extends Error {
  public statusCode: number;
  public originalError?: any;

  constructor(message: string, statusCode: number, originalError?: any) {
    super(message);
    this.name = 'ApiErrorException';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Base Service Class - Handles HTTP client creation, error handling và common functionality
 */
export class BaseService {
  private static authorizedClient: AxiosInstance | null = null;
  private static publicClient: AxiosInstance | null = null;

  /**
   * Tạo và config axios instance với auth headers
   */
  private static createAuthorizedClient(): AxiosInstance {
    if (!this.authorizedClient) {
      this.authorizedClient = axios.create({
        baseURL: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
      });

      // Request interceptor để thêm auth headers
      this.authorizedClient.interceptors.request.use(
        (config) => {
          const headers = AuthService.getAuthHeaders();
          Object.assign(config.headers, headers);
          return config;
        },
        (error) => {
          console.error('Request interceptor error:', error);
          return Promise.reject(error);
        }
      );

      // Response interceptor để handle errors
      this.authorizedClient.interceptors.response.use(
        (response) => response,
        (error) => {
          this.handleApiError(error);
          return Promise.reject(error);
        }
      );
    }
    return this.authorizedClient;
  }

  /**
   * Tạo axios instance cho public API (không cần auth)
   */
  private static createPublicClient(): AxiosInstance {
    if (!this.publicClient) {
      this.publicClient = axios.create({
        baseURL: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Response interceptor để handle errors
      this.publicClient.interceptors.response.use(
        (response) => response,
        (error) => {
          this.handleApiError(error);
          return Promise.reject(error);
        }
      );
    }
    return this.publicClient;
  }

  /**
   * Handle API errors với logging và token management
   */
  private static handleApiError(error: any): void {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Unknown error occurred';
    
    console.error('API Error:', {
      status,
      message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    // Handle 401 - Token expired
    if (status === 401) {
      console.warn('🔒 Token expired or invalid, removing token');
      AuthService.removeToken();
      // Có thể dispatch event để notify UI về việc cần reconnect wallet
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }

    // Handle 403 - Forbidden
    if (status === 403) {
      console.warn('🚫 Access forbidden');
    }

    // Handle 429 - Rate limiting
    if (status === 429) {
      console.warn('⏰ Rate limit exceeded, please try again later');
    }

    // Handle 500+ - Server errors
    if (status >= 500) {
      console.error('🔥 Server error occurred');
    }
  }

  /**
   * Generic GET request
   */
  protected static async get<T>(
    endpoint: string,
    params?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const client = requireAuth ? this.createAuthorizedClient() : this.createPublicClient();
      const response: AxiosResponse<ApiResponse<T>> = await client.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new ApiErrorException(
        error.response?.data?.message || 'GET request failed',
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Generic POST request
   */
  protected static async post<T>(
    endpoint: string,
    data?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const client = requireAuth ? this.createAuthorizedClient() : this.createPublicClient();
      const response: AxiosResponse<ApiResponse<T>> = await client.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new ApiErrorException(
        error.response?.data?.message || 'POST request failed',
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Generic PUT request
   */
  protected static async put<T>(
    endpoint: string,
    data?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const client = requireAuth ? this.createAuthorizedClient() : this.createPublicClient();
      const response: AxiosResponse<ApiResponse<T>> = await client.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new ApiErrorException(
        error.response?.data?.message || 'PUT request failed',
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Generic DELETE request
   */
  protected static async delete<T>(
    endpoint: string,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const client = requireAuth ? this.createAuthorizedClient() : this.createPublicClient();
      const response: AxiosResponse<ApiResponse<T>> = await client.delete(endpoint);
      return response.data;
    } catch (error: any) {
      throw new ApiErrorException(
        error.response?.data?.message || 'DELETE request failed',
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Request với fetch API cho các trường hợp đặc biệt
   */
  protected static async fetchRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (requireAuth) {
        const authHeaders = AuthService.getAuthHeaders();
        Object.assign(headers, authHeaders);
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiErrorException(
          data.message || `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return data;
    } catch (error: any) {
      if (error instanceof ApiErrorException) {
        throw error;
      }
      throw new ApiErrorException(
        error.message || 'Fetch request failed',
        500,
        error
      );
    }
  }

  /**
   * Reset clients (useful for testing hoặc khi config thay đổi)
   */
  static resetClients(): void {
    this.authorizedClient = null;
    this.publicClient = null;
  }

  /**
   * Get API configuration
   */
  static getConfig() {
    return {
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    };
  }
}

export default BaseService;
