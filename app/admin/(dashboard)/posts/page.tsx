"use client";

import type { AdminPostSummary, CategoryDetail } from "@/lib/api/types";

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
import { Link } from "@heroui/link";
import { Tooltip } from "@heroui/tooltip";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import NextLink from "next/link";

import { listPosts, deletePost, listCategories } from "@/lib/api/admin/content";
import {
  SearchIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  PlusIcon,
} from "@/components/common/icons";
import { TruncatedText } from "@/components/common/utility";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPostSummary[]>([]);
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
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
  const [pendingDelete, setPendingDelete] = useState<AdminPostSummary | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const pageSize = 10;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPosts({
        page,
        page_size: pageSize,
        keyword: activeKeyword || undefined,
        status: status || undefined,
        category_id: categoryId,
        sort_by: sortBy,
        order: sortOrder === "ascending" ? "asc" : "desc",
      });

      setPosts(res.list);
      setTotalPages(res.total_pages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, activeKeyword, status, categoryId, sortBy, sortOrder]);

  const triggerSearch = () => {
    setActiveKeyword(keyword);
    setPage(1);
  };

  useEffect(() => {
    listCategories({ page_size: 100 })
      .then((r) => setCategories(r.list))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = (id: number) => {
    const p = posts.find((x) => x.id === id);

    if (!p) return;
    setDeleteError("");
    setPendingDelete(p);
    openDelete();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Button
          as={NextLink}
          color="primary"
          href="/admin/posts/new"
          startContent={<PlusIcon />}
        >
          发布文章
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          isClearable
          className="sm:max-w-xs"
          endContent={<Kbd keys={["enter"]} />}
          placeholder="搜索文章..."
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
          <SelectItem key="draft">草稿</SelectItem>
          <SelectItem key="published">已发布</SelectItem>
        </Select>
        <Select
          className="sm:w-36"
          placeholder="分类"
          selectedKeys={categoryId ? [String(categoryId)] : []}
          onSelectionChange={(k) => {
            const v = Array.from(k)[0];

            setCategoryId(v ? Number(v) : undefined);
            setPage(1);
          }}
        >
          {categories.map((c) => (
            <SelectItem key={String(c.id)}>{c.name}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table
          aria-label="Posts table"
          sortDescriptor={{ column: sortBy, direction: sortOrder }}
          onSortChange={(d) => {
            setSortBy(d.column as string);
            setSortOrder(d.direction!);
            setPage(1);
          }}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>标题</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn>分类</TableColumn>
            <TableColumn key="views" allowsSorting>
              浏览
            </TableColumn>
            <TableColumn key="likes" allowsSorting>
              点赞
            </TableColumn>
            <TableColumn key="created_at" allowsSorting>
              发布时间
            </TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody emptyContent="暂无文章">
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.id}</TableCell>
                <TableCell>
                  <Link
                    as={NextLink}
                    className="max-w-xs block"
                    color="foreground"
                    href={`/admin/posts/${post.id}`}
                  >
                    <TruncatedText className="truncate" text={post.title} />
                  </Link>
                </TableCell>
                <TableCell>
                  <Chip
                    color={post.status === "published" ? "success" : "default"}
                    size="sm"
                    variant="flat"
                  >
                    {post.status}
                  </Chip>
                </TableCell>
                <TableCell>{post.category?.name || "-"}</TableCell>
                <TableCell>{post.views}</TableCell>
                <TableCell>{post.likes}</TableCell>
                <TableCell className="text-default-400 text-sm">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Tooltip content="查看">
                      <Button
                        isIconOnly
                        as={NextLink}
                        href={`/post/${post.slug}`}
                        size="sm"
                        variant="light"
                      >
                        <EyeIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip content="编辑">
                      <Button
                        isIconOnly
                        as={NextLink}
                        href={`/admin/posts/${post.id}`}
                        size="sm"
                        variant="light"
                      >
                        <EditIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip color="danger" content="删除">
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => handleDelete(post.id)}
                      >
                        <DeleteIcon />
                      </Button>
                    </Tooltip>
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
          setDeleteError("");
        }}
      >
        <ModalContent>
          <ModalHeader>确认删除该文章？</ModalHeader>
          <ModalBody className="gap-3">
            <div className="space-y-1 text-sm">
              <div className="font-medium">{pendingDelete?.title || "-"}</div>
              <div className="text-default-500">
                ID：{pendingDelete?.id} · Slug：{pendingDelete?.slug}
              </div>
            </div>
            <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-50/10 dark:text-danger-400">
              删除后不可恢复。
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
                  await deletePost(pendingDelete.id);
                  fetchPosts();
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
