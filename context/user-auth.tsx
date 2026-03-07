"use client";

import type { UserProfile } from "@/lib/api/types";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  login as apiLogin,
  register as apiRegister,
  refresh as apiRefresh,
  forgot as apiForgot,
  logout as apiLogout,
  type LoginBody,
  type RegisterBody,
  type ForgotBody,
} from "@/lib/api/v1/auth";
import { getMe } from "@/lib/api/v1/user";
import { getAccessToken, setAccessToken } from "@/lib/api/http";

interface UserAuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (body: LoginBody) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  forgot: (body: ForgotBody) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: UserProfile | null) => void;
}

const Ctx = createContext<UserAuthContextValue | null>(null);

// UserAuthProvider 用户认证状态：token 管理 + me 拉取 + refresh 回退。
export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const existing = getAccessToken();

    if (!existing) {
      try {
        await apiRefresh();
      } catch {
        setUser(null);
        setLoading(false);

        return;
      }
    }

    try {
      const u = await getMe();

      setUser(u);
    } catch {
      try {
        await apiRefresh();
        const u2 = await getMe();

        setUser(u2);
      } catch {
        setUser(null);
        setAccessToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (body: LoginBody) => {
    const dto = await apiLogin(body);

    setAccessToken(dto.access_token);
    try {
      const u = await getMe();

      setUser(u);
    } catch {
      // Ignore 忽略错误：token 已设置，me 拉取失败不影响登录态。
    }
  };

  const register = async (body: RegisterBody) => {
    const dto = await apiRegister(body);

    setAccessToken(dto.access_token);
    if (dto.user) {
      setUser(dto.user);
    } else {
      try {
        const u = await getMe();

        setUser(u);
      } catch {
        // Ignore 忽略错误。
      }
    }
  };

  const forgot = async (body: ForgotBody) => {
    await apiForgot(body);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore 忽略错误。
    }
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo<UserAuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      forgot,
      logout,
      refresh,
      setUser,
    }),
    [user, loading, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// UseUserAuth 获取用户认证上下文。
export function useUserAuth() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }

  return ctx;
}
