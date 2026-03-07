"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Divider } from "@heroui/divider";
import Image from "next/image";

import {
  HomeIcon,
  DocIcon,
  PlusIcon,
  TagIcon,
  UserIcon,
  ChatIcon,
  FeedbackIcon,
  LinkIcon,
  FileIcon,
  SettingsIcon,
  ShieldIcon,
  LogoutIcon,
  BellIcon,
} from "@/components/common/icons";
import { logout } from "@/lib/api/admin/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.FC<{ className?: string; size?: number }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "概览",
    items: [{ label: "仪表盘", href: "/admin", icon: HomeIcon }],
  },
  {
    title: "内容管理",
    items: [
      { label: "文章列表", href: "/admin/posts", icon: DocIcon },
      { label: "发布文章", href: "/admin/posts/new", icon: PlusIcon },
      { label: "分类与标签", href: "/admin/posts/taxonomy", icon: TagIcon },
    ],
  },
  {
    title: "互动管理",
    items: [
      { label: "评论管理", href: "/admin/comments", icon: ChatIcon },
      { label: "反馈管理", href: "/admin/feedbacks", icon: FeedbackIcon },
      { label: "通知管理", href: "/admin/notifications", icon: BellIcon },
    ],
  },
  {
    title: "系统",
    items: [
      { label: "用户管理", href: "/admin/users", icon: UserIcon },
      { label: "文件管理", href: "/admin/files", icon: FileIcon },
      { label: "友链管理", href: "/admin/links", icon: LinkIcon },
      { label: "站点设置", href: "/admin/settings", icon: SettingsIcon },
      { label: "安全设置", href: "/admin/security", icon: ShieldIcon },
    ],
  },
];

const STORAGE_KEY = "admin-sidebar-collapsed";

function isItemActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/posts") {
    return (
      pathname === "/admin/posts" ||
      (pathname.startsWith("/admin/posts/") &&
        pathname !== "/admin/posts/new" &&
        pathname !== "/admin/posts/taxonomy")
    );
  }

  return pathname === href || pathname.startsWith(href + "/");
}

interface SidebarProps {
  siteName?: string;
}

export function Sidebar({ siteName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem(STORAGE_KEY, String(!prev));

      return !prev;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    router.push("/admin/login");
  };

  return (
    <aside
      className={`h-full border-r border-divider bg-content1 flex flex-col shrink-0 transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-divider overflow-hidden">
        <Image
          priority
          alt="Logo"
          className="w-9 h-9 shrink-0"
          height={36}
          src="/logo.png"
          width={36}
        />
        {!collapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent select-none truncate">
            {siteName || "Nimbus Blog"}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section, sIdx) => (
          <div key={section.title}>
            {sIdx > 0 && <Divider className="my-1.5" />}
            {!collapsed && (
              <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-default-400 select-none">
                {section.title}
              </p>
            )}
            <div
              className={`flex flex-col gap-0.5 ${collapsed ? "items-center px-1" : "px-2"}`}
            >
              {section.items.map((item) => {
                const active = isItemActive(item.href, pathname);

                return (
                  <Tooltip
                    key={item.href}
                    closeDelay={0}
                    content={item.label}
                    delay={collapsed ? 0 : 600}
                    placement="right"
                  >
                    {collapsed ? (
                      <Button
                        isIconOnly
                        as={NextLink}
                        className="w-10 h-10"
                        color={active ? "primary" : "default"}
                        href={item.href}
                        size="sm"
                        variant={active ? "flat" : "light"}
                      >
                        <item.icon className="w-[18px] h-[18px]" />
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        as={NextLink}
                        className={`justify-start gap-2.5 h-9 font-normal ${active ? "font-medium" : ""}`}
                        color={active ? "primary" : "default"}
                        href={item.href}
                        size="sm"
                        startContent={
                          <item.icon className="w-[18px] h-[18px] shrink-0" />
                        }
                        variant={active ? "flat" : "light"}
                      >
                        {item.label}
                      </Button>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: Toggle + Logout */}
      <div
        className={`border-t border-divider py-2 flex flex-col gap-1 ${collapsed ? "items-center px-1" : "px-2"}`}
      >
        <Tooltip
          closeDelay={0}
          content={collapsed ? "展开菜单" : "收起菜单"}
          placement="right"
        >
          <Button
            className={
              collapsed
                ? "w-10 h-9"
                : "justify-start gap-2.5 h-9 font-normal w-full"
            }
            isIconOnly={collapsed}
            size="sm"
            variant="light"
            onPress={toggle}
          >
            <svg
              className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M11 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M18 5v14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span>收起菜单</span>}
          </Button>
        </Tooltip>
        <Tooltip
          closeDelay={0}
          content="退出登录"
          isDisabled={!collapsed}
          placement="right"
        >
          <Button
            className={
              collapsed
                ? "w-10 h-9"
                : "justify-start gap-2.5 h-9 font-normal w-full"
            }
            color="danger"
            isIconOnly={collapsed}
            size="sm"
            variant="light"
            onPress={handleLogout}
          >
            <LogoutIcon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>退出登录</span>}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
}
