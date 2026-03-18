"use client";

import type { UserDetail } from "@/lib/api/types";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { User } from "@heroui/user";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import { listUsers, updateUserStatus } from "@/lib/api/admin/user";
import { SearchIcon } from "@/components/common/icons";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">(
    "descending",
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [pendingDisableUser, setPendingDisableUser] =
    useState<UserDetail | null>(null);
  const [confirmingDisable, setConfirmingDisable] = useState(false);
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers({
        page,
        page_size: pageSize,
        keyword: activeKeyword || undefined,
        status: status || undefined,
        sort_by: sortBy,
        order: sortOrder === "ascending" ? "asc" : "desc",
      });

      setUsers(res.list);
      setTotalPages(res.total_pages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, activeKeyword, status, sortBy, sortOrder]);

  const triggerSearch = () => {
    setActiveKeyword(keyword);
    setPage(1);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!isOpen) {
      setPendingDisableUser(null);
      setConfirmingDisable(false);
    }
  }, [isOpen]);

  const handleSetStatus = async (
    userId: number,
    newStatus: "active" | "disabled",
  ) => {
    try {
      await updateUserStatus(userId, { status: newStatus });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const requestDisable = (u: UserDetail) => {
    setPendingDisableUser(u);
    onOpen();
  };

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">用户管理</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            isClearable
            className="sm:max-w-xs"
            endContent={<Kbd keys={["enter"]} />}
            placeholder="搜索用户..."
            startContent={<SearchIcon className="text-default-400" />}
            value={keyword}
            onClear={() => {
              setKeyword("");
              setActiveKeyword("");
              setPage(1);
            }}
            onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
            onValueChange={setKeyword}
          />
          <Select
            className="sm:w-36"
            placeholder="状态"
            selectedKeys={status ? [status] : []}
            onSelectionChange={(k) => {
              setStatus((Array.from(k)[0] as string) || "");
              setPage(1);
            }}
          >
            <SelectItem key="active">正常</SelectItem>
            <SelectItem key="disabled">禁用</SelectItem>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table
            aria-label="Users table"
            sortDescriptor={{ column: sortBy, direction: sortOrder }}
            onSortChange={(d) => {
              setSortBy(d.column as string);
              setSortOrder(d.direction!);
              setPage(1);
            }}
          >
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>用户</TableColumn>
              <TableColumn>邮箱</TableColumn>
              <TableColumn>状态</TableColumn>
              <TableColumn>邮箱验证</TableColumn>
              <TableColumn key="created_at" allowsSorting>
                注册时间
              </TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody emptyContent="暂无用户">
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>
                    <User
                      avatarProps={{
                        src: u.avatar || "/avatar.png",
                        size: "sm",
                        name: u.name?.charAt(0).toUpperCase(),
                      }}
                      name={u.name}
                    />
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      color={u.status === "active" ? "success" : "danger"}
                      size="sm"
                      variant="flat"
                    >
                      {u.status === "active" ? "正常" : "禁用"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={u.email_verified ? "success" : "warning"}
                      size="sm"
                      variant="flat"
                    >
                      {u.email_verified ? "已验证" : "未验证"}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-default-400 text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      color={u.status === "active" ? "danger" : "success"}
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        if (u.status === "active") requestDisable(u);
                        else handleSetStatus(u.id, "active");
                      }}
                    >
                      {u.status === "active" ? "禁用" : "启用"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex justify-center">
          <Pagination
            showControls
            page={page}
            total={Math.max(totalPages, 1)}
            onChange={setPage}
          />
        </div>
      </div>

      <Modal isOpen={isOpen} size="md" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                确认禁用该用户？
              </ModalHeader>
              <ModalBody>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium text-foreground">
                      {pendingDisableUser?.name || "未设置昵称"}
                    </div>
                    <div className="text-default-500">
                      {pendingDisableUser?.email}
                    </div>
                  </div>
                  <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-50/10 dark:text-danger-400">
                    禁用后该用户将无法登录/刷新会话，并会在鉴权时被拒绝访问需要登录的接口。
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    if (confirmingDisable) return;
                    onClose();
                  }}
                >
                  取消
                </Button>
                <Button
                  color="danger"
                  isLoading={confirmingDisable}
                  onPress={async () => {
                    if (!pendingDisableUser) return;
                    setConfirmingDisable(true);
                    try {
                      await handleSetStatus(pendingDisableUser.id, "disabled");
                      onClose();
                    } finally {
                      setConfirmingDisable(false);
                    }
                  }}
                >
                  确认禁用
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
