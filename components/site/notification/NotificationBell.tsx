"use client";

import type { NotificationDetail } from "@/lib/api/types";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Tooltip } from "@heroui/tooltip";

import {
  BellIcon,
  CheckDoubleIcon,
  DeleteIcon,
} from "@/components/common/icons";
import { useNotification } from "@/context";
import { useUserAuth } from "@/context";
import {
  listNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from "@/lib/api/v1/notification";
import { TruncatedText } from "@/components/common/utility";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} 天前`;

  return new Date(dateStr).toLocaleDateString();
}

function getMetaString(meta: Record<string, unknown> | undefined, key: string) {
  if (!meta) return null;
  const v = meta[key];

  return typeof v === "string" && v ? v : null;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  comment_reply: { label: "评论回复", color: "text-primary" },
  comment_approved: { label: "评论通过", color: "text-success" },
  admin_message: { label: "系统消息", color: "text-warning" },
};

// NotificationBell 通知入口：未读徽标 + 通知列表弹层。
export function NotificationBell() {
  const router = useRouter();
  const { isAuthenticated } = useUserAuth();
  const { unreadCount, refreshUnreadCount, setUnreadCount } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listNotifications({
        page: 1,
        page_size: 20,
        sort_by: "created_at",
        order: "desc",
      });

      setNotifications(res.list);
      setTotal(res.total_items);
    } catch {
      // Ignore 忽略错误。
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void refreshUnreadCount();
      fetchNotifications();
    }
  }, [isOpen, unreadCount, fetchNotifications, refreshUnreadCount]);

  const handleMarkRead = useCallback(
    async (id: number) => {
      try {
        await markRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
        refreshUnreadCount();
      } catch {
        // Ignore 忽略错误。
      }
    },
    [refreshUnreadCount],
  );

  const handleNotificationClick = useCallback(
    (n: NotificationDetail) => {
      if (!n.is_read) {
        void handleMarkRead(n.id);
      }

      const metaTargetURL = getMetaString(n.meta, "target_url");
      const metaPostSlug = getMetaString(n.meta, "post_slug");
      const url =
        n.target_url ||
        metaTargetURL ||
        (n.post_slug || metaPostSlug
          ? `/post/${encodeURIComponent(n.post_slug || metaPostSlug!)}#comments`
          : null);

      if (url) {
        setIsOpen(false);
        router.push(url);
      }
    },
    [handleMarkRead, router],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore 忽略错误。
    }
  }, [setUnreadCount]);

  const handleDelete = useCallback(
    async (id: number, wasUnread: boolean) => {
      try {
        await deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setTotal((prev) => prev - 1);
        if (wasUnread) {
          refreshUnreadCount();
        }
      } catch {
        // Ignore 忽略错误。
      }
    },
    [refreshUnreadCount],
  );

  if (!isAuthenticated) return null;

  return (
    <Popover
      isOpen={isOpen}
      offset={12}
      placement="bottom-end"
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger>
        <button className="relative p-1.5 rounded-lg hover:bg-default-100 transition-colors focus:outline-none">
          <Badge
            color="danger"
            content={unreadCount > 99 ? "99+" : unreadCount}
            isInvisible={unreadCount === 0}
            shape="circle"
            size="sm"
          >
            <BellIcon className="text-default-500" size={22} />
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] max-w-[92vw] p-0 overflow-hidden">
        <div className="flex w-full items-center justify-between px-2.5 py-3">
          <h3 className="text-base font-semibold">通知</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Tooltip closeDelay={0} content="全部已读" delay={400}>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleMarkAllRead}
                >
                  <CheckDoubleIcon size={18} />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
        <Divider />
        <ScrollShadow className="max-h-[400px] w-full">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-default-400">
              <BellIcon className="mb-2 opacity-40" size={40} />
              <p className="text-sm">暂无通知</p>
            </div>
          ) : (
            <div className="flex w-full flex-col">
              {notifications.map((n) => {
                const typeInfo = typeLabels[n.type] || {
                  label: n.type,
                  color: "text-default-500",
                };

                return (
                  <div
                    key={n.id}
                    className={`group relative flex w-full items-start gap-2 px-2.5 py-3 hover:bg-default-50 transition-colors cursor-pointer ${
                      !n.is_read
                        ? "bg-primary-50/50 dark:bg-primary-900/10"
                        : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      handleNotificationClick(n);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleNotificationClick(n);
                      }
                    }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${!n.is_read ? "bg-primary" : "bg-transparent"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-7">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[11px] font-medium ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                        <span className="text-[11px] text-default-400">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        <TruncatedText
                          className="block w-full truncate"
                          text={n.title}
                        />
                      </p>
                      {n.content && (
                        <TruncatedText
                          multiLine
                          className="block w-full text-xs text-default-500 mt-0.5 line-clamp-2"
                          text={n.content}
                        />
                      )}
                    </div>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                      <Tooltip closeDelay={0} content="删除" delay={400}>
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onClick={(e) => e.stopPropagation()}
                          onPress={() => handleDelete(n.id, !n.is_read)}
                        >
                          <DeleteIcon size={16} />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollShadow>
        {total > 20 && (
          <>
            <Divider />
            <div className="px-2.5 py-2 text-center">
              <span className="text-xs text-default-400">
                显示最近 20 条，共 {total} 条通知
              </span>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
