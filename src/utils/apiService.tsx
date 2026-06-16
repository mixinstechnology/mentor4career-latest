import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { getGlobalLoader } from '../utils/globalLoader';

interface RequestOptions {
  params?: Record<string, any>;
  data?: any;
  token?: boolean;
  headers?: Record<string, string>;
  baseURL?: string;
  timeout?: number;
}

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class HttpService {
  private getToken(): string | null {
    return Cookies.get('token') || null;
  }



  private buildConfig(reqOptions: RequestOptions = {}): AxiosRequestConfig {
    let token;
    if (reqOptions.token === false) {
        token = import.meta.env.VITE_DEFAULT_TOKEN  || ''; // fallback to env token
    }else{
        token = this.getToken()|| import.meta.env.VITE_DEFAULT_TOKEN  || ''; // fallback to env token
    }
  

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
      ...reqOptions.headers,
    };

    return {
      baseURL: reqOptions.baseURL || DEFAULT_BASE_URL,
      params: reqOptions.params || {},
      headers,
      timeout: reqOptions.timeout ?? 15000,
    };
  }

  private async withLoader<T>(fn: () => Promise<T>): Promise<T> {
    const loader = getGlobalLoader();
    try {
      loader.show();
      const result = await fn();
      return result;
    } finally {
      loader.hide();
    }
  }

  
  private handleError(error: any): never {
    let message = 'Something went wrong';

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        message = 'Request timed out. Please check your connection and try again.';
      } else if (!error.response) {
        message = 'Network error. Please check your internet connection.';
      } else {
        message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          `Request failed with status ${error.response?.status}`;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    toast.error(message);
    throw error;
  }

  public get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig(options);
        const response: AxiosResponse<T> = await axios.get<T>(url, config);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    });
  }

  public post<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig(options);
        const response: AxiosResponse<T> = await axios.post<T>(url, options?.data, config);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    });
  }

  public put<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig(options);
        const response: AxiosResponse<T> = await axios.put<T>(url, options?.data, config);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    });
  }

  public delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig(options);
        const response: AxiosResponse<T> = await axios.delete<T>(url, config);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    });
  }

  public postFormData<T = any>(
    url: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig({
          ...options,
          headers: {
            ...(options?.headers || {}),
            'Content-Type': 'multipart/form-data',
          },
        });

        const response: AxiosResponse<T> = await axios.post<T>(url, formData, config);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    });
  }
}

const httpService = new HttpService();
export default httpService;
