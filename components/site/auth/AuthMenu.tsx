"use client";
import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";

import { useUserAuth } from "@/context";

export default function AuthMenu() {
  const { user, isAuthenticated, logout, setUser } = useUserAuth();

  if (!user && !isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="default"
          name={user?.name ?? "User"}
          size="sm"
          src={user?.avatar || "/avatar.png"}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">登录身份</p>
          <p className="font-semibold">{user?.email ?? "已登录"}</p>
        </DropdownItem>
        <DropdownItem key="settings" href="/settings">
          个人设置
        </DropdownItem>
        <DropdownItem key="help" href="/help">
          帮助与反馈
        </DropdownItem>
        <DropdownItem key="logout" color="danger" onPress={handleLogout}>
          退出登录
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
