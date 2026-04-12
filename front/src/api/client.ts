import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

/** 后端统一成功响应 */
export interface ApiSuccess<T> {
  code: 0;
  message: string;
  data: T;
}

/** 后端错误响应（与 errorHandler 对齐） */
export interface ApiErrorBody {
  code: number;
  message: string;
  data?: unknown;
}

/** 业务层可捕获的错误类型 */
export class ApiException extends Error {
  readonly status: number;
  readonly code: number;
  readonly payload?: unknown;

  constructor(message: string, status: number, code: number, payload?: unknown) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

const TOKEN_KEY = 'aph_token';

/** 读取本地 JWT（与 auth store 使用同一键） */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** 写入 JWT（供登录后调用） */
export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** 创建 Axios：baseURL 来自环境变量，开发环境走 Vite 代理 */
function createClient(): AxiosInstance {
  const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';

  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const t = getStoredToken();
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => {
      const body = res.data as ApiSuccess<unknown> | ApiErrorBody;
      if (body && typeof body === 'object' && 'code' in body) {
        if (body.code === 0) {
          return res;
        }
        const errBody = body as ApiErrorBody;
        throw new ApiException(errBody.message || '请求失败', res.status, errBody.code, errBody.data);
      }
      return res;
    },
    (error: AxiosError<ApiErrorBody>) => {
      const status = error.response?.status ?? 0;
      const data = error.response?.data;
      const message = data?.message || error.message || '网络错误';
      const code = data?.code ?? status;
      throw new ApiException(message, status, code, data?.data);
    },
  );

  return instance;
}

export const apiClient = createClient();

/** GET 并解包 data */
export async function getData<T>(url: string, config?: Parameters<AxiosInstance['get']>[1]): Promise<T> {
  const res = await apiClient.get<ApiSuccess<T>>(url, config);
  return res.data.data;
}

/** POST 并解包 data */
export async function postData<T>(url: string, body?: unknown, config?: Parameters<AxiosInstance['post']>[2]): Promise<T> {
  const res = await apiClient.post<ApiSuccess<T>>(url, body, config);
  return res.data.data;
}

/** PUT 并解包 data */
export async function putData<T>(url: string, body?: unknown, config?: Parameters<AxiosInstance['put']>[2]): Promise<T> {
  const res = await apiClient.put<ApiSuccess<T>>(url, body, config);
  return res.data.data;
}

/** PATCH 并解包 data */
export async function patchData<T>(url: string, body?: unknown, config?: Parameters<AxiosInstance['patch']>[2]): Promise<T> {
  const res = await apiClient.patch<ApiSuccess<T>>(url, body, config);
  return res.data.data;
}

/** DELETE 并解包 data */
export async function deleteData<T>(url: string, config?: Parameters<AxiosInstance['delete']>[1]): Promise<T> {
  const res = await apiClient.delete<ApiSuccess<T>>(url, config);
  return res.data.data;
}
