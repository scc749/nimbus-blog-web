"use client";

import type { FileDetailDTO } from "@/lib/api/types";

import { useEffect, useState, useCallback } from "react";
import { Select, SelectItem } from "@heroui/select";
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
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import { listFiles, deleteFile } from "@/lib/api/admin/file";
import { TruncatedText } from "@/components/common/utility";
import { DeleteIcon } from "@/components/common/icons";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function usageLabel(usage: string): string {
  switch (usage) {
    case "post_cover":
      return "文章封面";
    case "post_content":
      return "文章内容";
    case "avatar":
      return "头像";
    default:
      return usage;
  }
}

function usageColor(
  usage: string,
): "primary" | "secondary" | "success" | "default" {
  switch (usage) {
    case "post_cover":
      return "primary";
    case "post_content":
      return "secondary";
    case "avatar":
      return "success";
    default:
      return "default";
  }
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileDetailDTO[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usageFilter, setUsageFilter] = useState("");
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
  const [pendingDelete, setPendingDelete] = useState<FileDetailDTO | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const pageSize = 10;

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listFiles({
        page,
        page_size: pageSize,
        usage: usageFilter || undefined,
        sort_by: sortBy,
        order: sortOrder === "ascending" ? "asc" : "desc",
      });

      setFiles(res.list);
      setTotalPages(res.total_pages);
    } catch {
      // Ignore 忽略错误。
    } finally {
      setLoading(false);
    }
  }, [page, usageFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = (objectKey: string) => {
    const f = files.find((x) => x.object_key === objectKey);

    if (!f) return;
    setDeleteError("");
    setPendingDelete(f);
    openDelete();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">文件管理</h1>

      <Select
        className="w-40"
        placeholder="用途筛选"
        selectedKeys={usageFilter ? [usageFilter] : []}
        onSelectionChange={(k) => {
          setUsageFilter((Array.from(k)[0] as string) || "");
          setPage(1);
        }}
      >
        <SelectItem key="post_cover">文章封面</SelectItem>
        <SelectItem key="post_content">文章内容</SelectItem>
        <SelectItem key="avatar">头像</SelectItem>
      </Select>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table
          aria-label="Files table"
          sortDescriptor={{ column: sortBy, direction: sortOrder }}
          onSortChange={(d) => {
            setSortBy(d.column as string);
            setSortOrder(d.direction!);
            setPage(1);
          }}
        >
          <TableHeader>
            <TableColumn>预览</TableColumn>
            <TableColumn>文件名</TableColumn>
            <TableColumn>用途</TableColumn>
            <TableColumn key="file_size" allowsSorting>
              大小
            </TableColumn>
            <TableColumn>资源ID</TableColumn>
            <TableColumn key="created_at" allowsSorting>
              上传时间
            </TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody emptyContent="暂无文件">
            {files.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  {f.url ? (
                    <a href={f.url} rel="noopener noreferrer" target="_blank">
                      {}
                      <img
                        alt={f.file_name}
                        className="max-w-[80px] max-h-12 rounded object-contain"
                        src={f.url}
                      />
                    </a>
                  ) : (
                    <div className="w-12 h-8 rounded bg-default-100 flex items-center justify-center text-default-300 text-xs">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <TruncatedText
                      className="max-w-[200px] truncate text-sm"
                      text={f.file_name}
                    />
                    <span className="text-default-400 text-xs">
                      {f.mime_type}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip color={usageColor(f.usage)} size="sm" variant="flat">
                    {usageLabel(f.usage)}
                  </Chip>
                </TableCell>
                <TableCell className="text-sm">
                  {formatBytes(f.file_size)}
                </TableCell>
                <TableCell className="text-sm">
                  {f.resource_id ? (
                    <Chip size="sm" variant="flat">
                      {f.resource_id}
                    </Chip>
                  ) : (
                    <span className="text-default-300">未绑定</span>
                  )}
                </TableCell>
                <TableCell className="text-default-400 text-sm">
                  {new Date(f.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleDelete(f.object_key)}
                  >
                    <DeleteIcon />
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

      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          closeDelete();
          setPendingDelete(null);
          setDeleting(false);
          setDeleteError("");
        }}
      >
        <ModalContent>
          <ModalHeader>确认删除该文件？</ModalHeader>
          <ModalBody className="gap-3">
            <div className="space-y-1 text-sm">
              <div className="font-medium">
                {pendingDelete?.file_name || "-"}
              </div>
              <div className="text-default-500">
                ObjectKey：{pendingDelete?.object_key || "-"}
              </div>
            </div>
            <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-50/10 dark:text-danger-400">
              将同时删除对象存储与元数据，且不可恢复。
            </div>
            {deleteError && <p className="text-danger text-sm">{deleteError}</p>}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                if (deleting) return;
                closeDelete();
                setPendingDelete(null);
                setDeleteError("");
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
                  setDeleteError("");
                  await deleteFile(pendingDelete.object_key);
                  fetchFiles();
                  closeDelete();
                  setPendingDelete(null);
                } catch (e: unknown) {
                  setDeleteError(e instanceof Error ? e.message : "删除失败");
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
