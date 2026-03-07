"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { useUserAuth } from "./user-auth";

import { getAccessToken, getApiBase } from "@/lib/api/http";
import { getUnreadCount as fetchUnreadCount } from "@/lib/api/v1/notification";

interface NotificationContextValue {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
}

const Ctx = createContext<NotificationContextValue | null>(null);

// NotificationProvider 站内通知状态：未读数 + SSE 推送（带重连）。
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useUserAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryAttemptRef = useRef(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);

      return;
    }
    try {
      const dto = await fetchUnreadCount();

      setUnreadCount(dto.count);
    } catch {
      // Ignore 忽略错误。
    }
  }, [isAuthenticated]);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current != null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const closeEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const token = getAccessToken();

    if (!token) return false;

    closeEventSource();

    const url = `${getApiBase()}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    eventSourceRef.current = es;

    es.onopen = () => {
      retryAttemptRef.current = 0;
      void refreshUnreadCount();
    };

    es.addEventListener("unread_count", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as { count: number };

        setUnreadCount(data.count);
      } catch {
        // Ignore 忽略错误。
      }
    });

    es.addEventListener("notification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    es.onerror = () => {
      es.close();
      if (eventSourceRef.current === es) {
        eventSourceRef.current = null;
      }

      if (!getAccessToken()) return;

      clearRetryTimer();

      retryAttemptRef.current += 1;
      const attempt = Math.min(retryAttemptRef.current, 6);
      const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
      const jitter = Math.floor(Math.random() * 500);

      retryTimerRef.current = window.setTimeout(() => {
        if (!getAccessToken()) return;
        connect();
      }, baseDelay + jitter);
    };

    return true;
  }, [clearRetryTimer, closeEventSource, refreshUnreadCount]);

  useEffect(() => {
    clearRetryTimer();

    if (loading) return;

    if (!isAuthenticated) {
      setUnreadCount(0);
      closeEventSource();
      retryAttemptRef.current = 0;

      return;
    }

    void refreshUnreadCount();

    const ok = connect();

    if (!ok) {
      retryTimerRef.current = window.setTimeout(function retryConnect() {
        const connected = connect();

        if (!connected) {
          retryTimerRef.current = window.setTimeout(retryConnect, 1000);
        }
      }, 300);
    }

    return () => {
      clearRetryTimer();
      closeEventSource();
    };
  }, [
    clearRetryTimer,
    closeEventSource,
    connect,
    isAuthenticated,
    loading,
    refreshUnreadCount,
  ]);

  const value = useMemo<NotificationContextValue>(
    () => ({ unreadCount, refreshUnreadCount, setUnreadCount }),
    [unreadCount, refreshUnreadCount],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// UseNotification 获取通知上下文。
export function useNotification() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  return ctx;
}
