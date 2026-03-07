"use client";

import type { UserDetail } from "@/lib/api/types";

import { useEffect, useState, useCallback } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { User } from "@heroui/user";

import { sendNotification } from "@/lib/api/admin/notification";
import { listUsers } from "@/lib/api/admin/user";
import { SearchIcon, BellIcon } from "@/components/common/icons";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState<UserDetail[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userKeyword, setUserKeyword] = useState("");
  const [activeUserKeyword, setActiveUserKeyword] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await listUsers({
        page: userPage,
        page_size: 10,
        keyword: activeUserKeyword || undefined,
        status: "active",
      });

      setUsers(res.list);
      setUserTotalPages(res.total_pages);
    } catch {
      // Ignore 忽略错误。
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage, activeUserKeyword]);

  const triggerUserSearch = () => {
    setActiveUserKeyword(userKeyword);
    setUserPage(1);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSend = async () => {
    if (!selectedUserId) {
      setError("请选择目标用户");

      return;
    }
    if (!title.trim()) {
      setError("请输入通知标题");

      return;
    }
    if (!content.trim()) {
      setError("请输入通知内容");

      return;
    }

    setSending(true);
    setError("");
    setSuccess(false);
    try {
      await sendNotification({
        user_id: selectedUserId,
        title: title.trim(),
        content: content.trim(),
      });
      setSuccess(true);
      setTitle("");
      setContent("");
      setSelectedUserId(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "发送失败");
    } finally {
      setSending(false);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">通知管理</h1>
        <p className="text-default-500">向用户发送站内通知</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Selection */}
        <Card>
          <CardHeader className="flex justify-between items-center px-4 py-3">
            <span className="font-semibold">选择目标用户</span>
            {selectedUser && (
              <span className="text-sm text-primary">
                已选择: {selectedUser.name || selectedUser.email}
              </span>
            )}
          </CardHeader>
          <Divider />
          <CardBody className="p-4 space-y-3">
            <Input
              isClearable
              endContent={<Kbd className="text-[10px]" keys={["enter"]} />}
              placeholder="搜索用户..."
              size="sm"
              startContent={
                <SearchIcon className="text-default-400" size={16} />
              }
              value={userKeyword}
              onClear={() => {
                setUserKeyword("");
                setActiveUserKeyword("");
                setUserPage(1);
              }}
              onKeyDown={(e) => e.key === "Enter" && triggerUserSearch()}
              onValueChange={setUserKeyword}
            />
            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : (
              <Table
                removeWrapper
                aria-label="Select user"
                selectedKeys={
                  selectedUserId ? new Set([String(selectedUserId)]) : new Set()
                }
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];

                  setSelectedUserId(selected ? Number(selected) : null);
                }}
              >
                <TableHeader>
                  <TableColumn>用户</TableColumn>
                  <TableColumn>邮箱</TableColumn>
                </TableHeader>
                <TableBody emptyContent="暂无用户">
                  {users.map((u) => (
                    <TableRow key={String(u.id)}>
                      <TableCell>
                        <User
                          avatarProps={{
                            src: u.avatar || "/avatar.png",
                            size: "sm",
                            name: u.name?.charAt(0).toUpperCase(),
                          }}
                          name={u.name || "未设置昵称"}
                        />
                      </TableCell>
                      <TableCell className="text-default-500 text-sm">
                        {u.email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {userTotalPages > 1 && (
              <div className="flex justify-center pt-2">
                <Pagination
                  showControls
                  page={userPage}
                  size="sm"
                  total={userTotalPages}
                  onChange={setUserPage}
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Notification Form */}
        <Card>
          <CardHeader className="px-4 py-3">
            <span className="font-semibold">编写通知</span>
          </CardHeader>
          <Divider />
          <CardBody className="p-4 space-y-4">
            {selectedUser ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-default-100">
                <User
                  avatarProps={{
                    src: selectedUser.avatar || "/avatar.png",
                    size: "sm",
                    name: selectedUser.name?.charAt(0).toUpperCase(),
                  }}
                  description={selectedUser.email}
                  name={selectedUser.name || "未设置昵称"}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center p-6 rounded-lg border-2 border-dashed border-default-200 text-default-400">
                <p className="text-sm">请先在左侧选择目标用户</p>
              </div>
            )}

            <Input
              isRequired
              label="通知标题"
              maxLength={200}
              placeholder="输入通知标题..."
              value={title}
              onValueChange={setTitle}
            />

            <Textarea
              isRequired
              label="通知内容"
              maxLength={5000}
              maxRows={8}
              minRows={4}
              placeholder="输入通知内容..."
              value={content}
              onValueChange={setContent}
            />

            {error && <p className="text-danger text-sm">{error}</p>}
            {success && <p className="text-success text-sm">通知已发送成功</p>}

            <Button
              fullWidth
              color="primary"
              isDisabled={!selectedUserId || !title.trim() || !content.trim()}
              isLoading={sending}
              startContent={!sending ? <BellIcon size={18} /> : undefined}
              onPress={handleSend}
            >
              发送通知
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
