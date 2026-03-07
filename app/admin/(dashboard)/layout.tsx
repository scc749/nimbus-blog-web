"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@heroui/spinner";

import { Sidebar, Header } from "@/components/admin/layout";
import { checkSession, getProfile } from "@/lib/api/admin/auth";
import { listSettings } from "@/lib/api/admin/setting";

// AdminDashboardLayout 后台受保护布局：Session 校验 + Sidebar/Header。
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [nickname, setNickname] = useState("");
  const [siteName, setSiteName] = useState("");

  useEffect(() => {
    checkSession().then(async (ok) => {
      if (!ok) {
        router.replace("/admin/login");

        return;
      }
      try {
        const [profile, settings] = await Promise.all([
          getProfile(),
          listSettings().catch(() => []),
        ]);

        setNickname(profile.nickname);
        const map: Record<string, string> = {};

        settings.forEach((s) => {
          map[s.setting_key] = s.setting_value;
        });
        if (map["site.name"]) setSiteName(map["site.name"]);
      } catch {
        // Ignore 忽略错误。
      }
      setReady(true);
    });
  }, [router]);

  useEffect(() => {
    const name = siteName || "Nimbus Blog";
    const p = pathname || "/admin";
    let phrase = "管理员页面";

    if (p === "/admin" || p === "/admin/") {
      phrase = "管理员页面";
    } else if (p.startsWith("/admin/posts/taxonomy")) {
      phrase = "分类标签管理";
    } else if (p.startsWith("/admin/posts/new")) {
      phrase = "新建文章";
    } else if (/^\/admin\/posts\/\d+/.test(p)) {
      phrase = "编辑文章";
    } else if (p.startsWith("/admin/posts")) {
      phrase = "文章管理";
    } else if (p.startsWith("/admin/comments")) {
      phrase = "评论管理";
    } else if (p.startsWith("/admin/users")) {
      phrase = "用户管理";
    } else if (p.startsWith("/admin/links")) {
      phrase = "友链管理";
    } else if (p.startsWith("/admin/feedbacks")) {
      phrase = "反馈处理";
    } else if (p.startsWith("/admin/files")) {
      phrase = "文件管理";
    } else if (p.startsWith("/admin/notifications")) {
      phrase = "通知管理";
    } else if (p.startsWith("/admin/settings")) {
      phrase = "系统设置";
    } else if (p.startsWith("/admin/security")) {
      phrase = "安全设置";
    } else if (p.startsWith("/admin/login")) {
      phrase = "管理员登录";
    }
    document.title = `${name}-${phrase}`;
  }, [siteName, pathname]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar siteName={siteName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header nickname={nickname} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
