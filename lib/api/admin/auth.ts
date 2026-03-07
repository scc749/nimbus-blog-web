import type {
  AdminLoginDTO,
  AdminProfileDTO,
  AdminTwoFASetupStartDTO,
  AdminTwoFAVerifyDTO,
  AdminResetRecoveryCodesDTO,
} from "../types";

import { adminRequest } from "../http";

export interface LoginBody {
  username: string;
  password: string;
  otp_code?: string;
  recovery_code?: string;
}

export interface ResetPasswordBody {
  username: string;
  old_password: string;
  new_password: string;
}

export interface ChangePasswordBody {
  old_password: string;
  new_password: string;
}

export interface TwoFAAuthBody {
  code?: string;
  recovery_code?: string;
}

export interface UpdateProfileBody {
  nickname: string;
  specialization: string;
}

export interface TwoFAVerifyBody {
  setup_id: string;
  code: string;
}

export async function login(body: LoginBody): Promise<AdminLoginDTO> {
  return adminRequest<AdminLoginDTO>("/auth/login", {
    method: "POST",
    body,
  });
}

export async function resetPassword(body: ResetPasswordBody): Promise<void> {
  await adminRequest<void>("/auth/reset", {
    method: "POST",
    body,
  });
}

export async function changePassword(body: ChangePasswordBody): Promise<void> {
  await adminRequest<void>("/auth/password", {
    method: "PUT",
    body,
  });
}

export async function logout(): Promise<void> {
  await adminRequest<void>("/auth/logout", {
    method: "POST",
  });
}

export async function getProfile(): Promise<AdminProfileDTO> {
  return adminRequest<AdminProfileDTO>("/auth/profile", {
    method: "GET",
  });
}

export async function updateProfile(body: UpdateProfileBody): Promise<void> {
  await adminRequest<void>("/auth/profile", {
    method: "PUT",
    body,
  });
}

export async function twoFASetup(
  body?: TwoFAAuthBody,
): Promise<AdminTwoFASetupStartDTO> {
  return adminRequest<AdminTwoFASetupStartDTO>("/auth/2fa/setup", {
    method: "POST",
    body: body ?? {},
  });
}

export async function twoFAVerify(
  body: TwoFAVerifyBody,
): Promise<AdminTwoFAVerifyDTO> {
  return adminRequest<AdminTwoFAVerifyDTO>("/auth/2fa/verify", {
    method: "POST",
    body,
  });
}

export async function twoFADisable(body: TwoFAAuthBody): Promise<void> {
  await adminRequest<void>("/auth/2fa/disable", {
    method: "POST",
    body,
  });
}

export async function twoFARecoveryReset(
  body: TwoFAAuthBody,
): Promise<AdminResetRecoveryCodesDTO> {
  return adminRequest<AdminResetRecoveryCodesDTO>("/auth/2fa/recovery/reset", {
    method: "POST",
    body,
  });
}

export async function checkSession(): Promise<boolean> {
  try {
    // 使用受保护的 settings 端点做轻量级 session 检查
    await adminRequest<unknown>("/settings", { method: "GET" });

    return true;
  } catch {
    return false;
  }
}
