// UserRequest 用户端请求封装（可选携带 Bearer Token）。
// AdminRequest 管理端请求封装（Session Cookie）。
// Rule Route Handler 禁止复用本模块：这里包含浏览器态逻辑（localStorage）与 credentials。
import { ApiEnvelope, ApiError } from "./envelope";

type FetchInit = Omit<RequestInit, "headers" | "body" | "credentials"> & {
  headers?: Record<string, string>;
  body?: unknown;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ?? "";
const ADMIN_PREFIX = "/api/admin";
const USER_PREFIX = "/api/v1";

// GetApiBase 返回配置的 API Base（移除末尾 /）。
export function getApiBase(): string {
  return API_BASE;
}

async function doFetch<T>(url: string, init?: FetchInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };
  const { body, ...rest } = init ?? {};
  const reqInit: RequestInit = {
    ...rest,
    headers,
    credentials: "include",
  };

  if (body !== undefined) {
    reqInit.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(url, reqInit);
  let json: ApiEnvelope<T> | null = null;

  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError("-1", "响应解析失败", res.status);
  }
  if (!res.ok) {
    throw new ApiError(json.code, json.message, res.status);
  }
  if (json.code !== "0000") {
    throw new ApiError(json.code, json.message, res.status);
  }

  return json.data as T;
}

// AdminRequest 发起 Admin 请求，默认携带 Session Cookie。
export async function adminRequest<T>(
  path: string,
  init?: FetchInit,
): Promise<T> {
  const url = `${API_BASE}${ADMIN_PREFIX}${path}`;

  return doFetch<T>(url, init);
}

let accessToken: string | null = null;

// SetAccessToken 设置内存与 localStorage 中的 access token。
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      try {
        window.localStorage.setItem("access_token", token);
      } catch {}
    } else {
      try {
        window.localStorage.removeItem("access_token");
      } catch {}
    }
  }
}

// GetAccessToken 获取当前 access token（优先内存，其次 localStorage）。
export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    try {
      const t = window.localStorage.getItem("access_token");

      accessToken = t;

      return t;
    } catch {
      return null;
    }
  }

  return null;
}

// UserRequest 发起 V1 请求；withAuth=true 时自动附带 Authorization 头。
export async function userRequest<T>(
  path: string,
  init?: FetchInit,
  withAuth: boolean = false,
): Promise<T> {
  const url = `${API_BASE}${USER_PREFIX}${path}`;
  const headers = { ...(init?.headers ?? {}) };

  if (withAuth) {
    const token = getAccessToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return doFetch<T>(url, { ...init, headers });
}
