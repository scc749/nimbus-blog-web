"use client";

import type { CommentDetail } from "@/lib/api/types";

import { useEffect, useState, useCallback } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
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

import {
  listComments,
  updateCommentStatus,
  deleteComment,
} from "@/lib/api/admin/comment";
import { DeleteIcon } from "@/components/common/icons";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentDetail[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">(
    "descending",
  );
  const {
    isOpen: deleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
  } = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState<CommentDetail | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const pageSize = 10;

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listComments({
        page,
        page_size: pageSize,
        status: statusFilter || undefined,
        sort_by: sortBy,
        order: sortOrder === "ascending" ? "asc" : "desc",
      });

      setComments(res.list);
      setTotalPages(res.total_pages);
    } catch {
      // Ignore 忽略错误。
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleApprove = async (id: number) => {
    try {
      await updateCommentStatus(id, { status: "approved" });
      fetchComments();
    } catch {
      // Ignore 忽略错误。
    }
  };

  const handleReject = async (id: number) => {
    try {
      await updateCommentStatus(id, { status: "rejected" });
      fetchComments();
    } catch {
      // Ignore 忽略错误。
    }
  };

  const handleDelete = (id: number) => {
    const c = comments.find((x) => x.id === id);

    if (!c) return;
    setPendingDelete(c);
    openDelete();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">评论管理</h1>

      <Tabs
        selectedKey={statusFilter}
        onSelectionChange={(k) => {
          setStatusFilter(k as string);
          setPage(1);
        }}
      >
        <Tab key="pending" title="待审核" />
        <Tab key="" title="全部" />
        <Tab key="approved" title="已通过" />
        <Tab key="rejected" title="已拒绝" />
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table
          aria-label="Comments table"
          sortDescriptor={{ column: sortBy, direction: sortOrder }}
          onSortChange={(d) => {
            setSortBy(d.column as string);
            setSortOrder(d.direction!);
            setPage(1);
          }}
        >
          <TableHeader>
            <TableColumn>用户</TableColumn>
            <TableColumn>内容</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn key="created_at" allowsSorting>
              时间
            </TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody emptyContent="暂无评论">
            {comments.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <User
                    avatarProps={{
                      src: c.user_profile?.avatar || undefined,
                      size: "sm",
                      name: c.user_profile?.name?.charAt(0).toUpperCase(),
                    }}
                    description={c.user_profile?.email}
                    name={c.user_profile?.name || "匿名"}
                  />
                </TableCell>
                <TableCell>
                  <p className="max-w-md truncate text-sm">{c.content}</p>
                </TableCell>
                <TableCell>
                  <Chip
                    color={
                      c.status === "approved"
                        ? "success"
                        : c.status === "pending"
                          ? "warning"
                          : "danger"
                    }
                    size="sm"
                    variant="flat"
                  >
                    {c.status}
                  </Chip>
                </TableCell>
                <TableCell className="text-default-400 text-sm">
                  {new Date(c.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {c.status !== "approved" && (
                      <Button
                        color="success"
                        size="sm"
                        variant="flat"
                        onPress={() => handleApprove(c.id)}
                      >
                        通过
                      </Button>
                    )}
                    {c.status === "pending" && (
                      <Button
                        color="warning"
                        size="sm"
                        variant="flat"
                        onPress={() => handleReject(c.id)}
                      >
                        拒绝
                      </Button>
                    )}
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={() => handleDelete(c.id)}
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
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

      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          closeDelete();
          setPendingDelete(null);
          setDeleting(false);
        }}
      >
        <ModalContent>
          <ModalHeader>确认删除该评论？</ModalHeader>
          <ModalBody className="gap-3">
            <div className="space-y-1 text-sm">
              <div className="font-medium">
                {pendingDelete?.user_profile?.name || "匿名"} ·{" "}
                {pendingDelete?.user_profile?.email || "-"}
              </div>
              <div className="text-default-500">
                {pendingDelete?.content || "-"}
              </div>
            </div>
            <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-50/10 dark:text-danger-400">
              删除后不可恢复。
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                if (deleting) return;
                closeDelete();
                setPendingDelete(null);
              }}
            >
              取消
            </Button>
            <Button
              color="danger"
              isLoading={deleting}
              onPress={async () => {
                if (!pendingDelete) return;
                setDeleting(true);
                try {
                  await deleteComment(pendingDelete.id);
                  fetchComments();
                  closeDelete();
                  setPendingDelete(null);
                } catch {
                  // Ignore 忽略错误。
                } finally {
                  setDeleting(false);
                }
              }}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
