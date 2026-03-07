"use client";

import type { FeedbackDetail } from "@/lib/api/types";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@heroui/button";
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
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import {
  listFeedbacks,
  getFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} from "@/lib/api/admin/feedback";
import { EyeIcon, DeleteIcon } from "@/components/common/icons";

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackDetail[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<FeedbackDetail | null>(null);
  const { isOpen: detailOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: deleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
  } = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState<FeedbackDetail | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">(
    "descending",
  );
  const pageSize = 10;

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listFeedbacks({
        page,
        page_size: pageSize,
        status: statusFilter || undefined,
        sort_by: sortBy,
        order: sortOrder === "ascending" ? "asc" : "desc",
      });

      setFeedbacks(res.list);
      setTotalPages(res.total_pages);
    } catch {
      // Ignore 忽略错误。
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleView = async (id: number) => {
    try {
      const d = await getFeedback(id);

      setDetail(d);
      onOpen();
    } catch {
      // Ignore 忽略错误。
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateFeedbackStatus(id, { status: newStatus });
      fetchFeedbacks();
      if (detail?.id === id) setDetail({ ...detail, status: newStatus });
    } catch {
      // Ignore 忽略错误。
    }
  };

  const handleDelete = async (id: number) => {
    const f =
      feedbacks.find((x) => x.id === id) || (detail?.id === id ? detail : null);

    if (!f) return;
    setPendingDelete(f);
    openDelete();
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">反馈管理</h1>

      <Select
        className="w-40"
        placeholder="状态筛选"
        selectedKeys={statusFilter ? [statusFilter] : []}
        onSelectionChange={(k) => {
          setStatusFilter((Array.from(k)[0] as string) || "");
          setPage(1);
        }}
      >
        <SelectItem key="pending">待处理</SelectItem>
        <SelectItem key="processing">处理中</SelectItem>
        <SelectItem key="resolved">已解决</SelectItem>
        <SelectItem key="closed">已关闭</SelectItem>
      </Select>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table
          aria-label="Feedbacks table"
          sortDescriptor={{ column: sortBy, direction: sortOrder }}
          onSortChange={(d) => {
            setSortBy(d.column as string);
            setSortOrder(d.direction!);
            setPage(1);
          }}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>姓名</TableColumn>
            <TableColumn>邮箱</TableColumn>
            <TableColumn>类型</TableColumn>
            <TableColumn>主题</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn key="created_at" allowsSorting>
              时间
            </TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody emptyContent="暂无反馈">
            {feedbacks.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.email}</TableCell>
                <TableCell>{f.type}</TableCell>
                <TableCell>
                  <p className="max-w-xs truncate">{f.subject}</p>
                </TableCell>
                <TableCell>
                  <Chip color={statusColor(f.status)} size="sm" variant="flat">
                    {f.status}
                  </Chip>
                </TableCell>
                <TableCell className="text-default-400 text-sm">
                  {new Date(f.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleView(f.id)}
                    >
                      <EyeIcon />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={() => handleDelete(f.id)}
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

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            showControls
            page={page}
            total={totalPages}
            onChange={setPage}
          />
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} size="lg" onClose={onClose}>
        <ModalContent>
          {detail && (
            <>
              <ModalHeader>{detail.subject || "反馈详情"}</ModalHeader>
              <ModalBody className="gap-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-default-500">姓名：</span>
                    {detail.name}
                  </div>
                  <div>
                    <span className="text-default-500">邮箱：</span>
                    {detail.email}
                  </div>
                  <div>
                    <span className="text-default-500">类型：</span>
                    {detail.type}
                  </div>
                  <div>
                    <span className="text-default-500">状态：</span>
                    <Chip
                      color={statusColor(detail.status)}
                      size="sm"
                      variant="flat"
                    >
                      {detail.status}
                    </Chip>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-default-500">内容：</span>
                  <p className="mt-1">{detail.message}</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="flex gap-2">
                  {detail.status !== "processing" && (
                    <Button
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        handleStatusChange(detail.id, "processing")
                      }
                    >
                      处理中
                    </Button>
                  )}
                  {detail.status !== "resolved" && (
                    <Button
                      color="success"
                      size="sm"
                      variant="flat"
                      onPress={() => handleStatusChange(detail.id, "resolved")}
                    >
                      已解决
                    </Button>
                  )}
                  {detail.status !== "closed" && (
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => handleStatusChange(detail.id, "closed")}
                    >
                      关闭
                    </Button>
                  )}
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          closeDelete();
          setPendingDelete(null);
          setDeleting(false);
        }}
      >
        <ModalContent>
          <ModalHeader>确认删除该反馈？</ModalHeader>
          <ModalBody className="gap-3">
            <div className="space-y-1 text-sm">
              <div className="font-medium">{pendingDelete?.subject || "-"}</div>
              <div className="text-default-500">
                {pendingDelete?.name} · {pendingDelete?.email}
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
                  await deleteFeedback(pendingDelete.id);
                  fetchFeedbacks();
                  if (detail?.id === pendingDelete.id) onClose();
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
