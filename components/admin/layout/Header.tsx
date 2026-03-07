"use client";

import { usePathname } from "next/navigation";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Avatar } from "@heroui/avatar";

import { ThemeSwitch } from "@/components/common/utility";

const routeNameMap: Record<string, string> = {
  admin: "仪表盘",
  posts: "文章",
  new: "新建",
  taxonomy: "分类与标签",
  categories: "分类",
  comments: "评论",
  feedbacks: "反馈",
  notifications: "通知",
  links: "友链",
  files: "文件",
  settings: "设置",
  users: "用户",
  security: "安全",
  login: "登录",
};

interface HeaderProps {
  nickname?: string;
}

export function Header({ nickname }: HeaderProps) {
  const pathname = usePathname();
  const paths = pathname?.split("/").filter(Boolean) || [];
  const displayName = nickname || "管理员";

  return (
    <Navbar
      isBordered
      className="bg-background/60 backdrop-blur-md"
      maxWidth="full"
    >
      <NavbarContent justify="start">
        <Breadcrumbs>
          {paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            const name = routeNameMap[path] || path;
            const href = "/" + paths.slice(0, index + 1).join("/");

            return (
              <BreadcrumbItem key={path} href={isLast ? undefined : href}>
                {name}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumbs>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{displayName}</span>
            <Avatar
              isBordered
              color="primary"
              name={displayName.charAt(0).toUpperCase()}
              size="sm"
            />
          </div>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
