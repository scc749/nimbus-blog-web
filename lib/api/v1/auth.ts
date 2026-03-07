import type { UserRegisterDTO, UserLoginDTO, UserRefreshDTO } from "../types";

import { userRequest, setAccessToken } from "../http";

export interface RegisterBody {
  username: string;
  email: string;
  password: string;
  code: string;
}

export interface LoginBody {
  email: string;
  password: string;
  captcha_id: string;
  captcha: string;
}

export interface ForgotBody {
  email: string;
  code: string;
  new_password: string;
}

export async function register(body: RegisterBody): Promise<UserRegisterDTO> {
  const data = await userRequest<UserRegisterDTO>("/auth/register", {
    method: "POST",
    body,
  });

  setAccessToken(data.access_token);

  return data;
}

export async function login(body: LoginBody): Promise<UserLoginDTO> {
  const data = await userRequest<UserLoginDTO>("/auth/login", {
    method: "POST",
    body,
  });

  setAccessToken(data.access_token);

  return data;
}

export async function refresh(): Promise<UserRefreshDTO> {
  const data = await userRequest<UserRefreshDTO>("/auth/refresh", {
    method: "POST",
  });

  setAccessToken(data.access_token);

  return data;
}

export async function forgot(body: ForgotBody): Promise<void> {
  await userRequest<void>("/auth/forgot", {
    method: "POST",
    body,
  });
}

export async function logout(): Promise<void> {
  await userRequest<void>("/auth/logout", { method: "POST" }, true);
  setAccessToken(null);
}
