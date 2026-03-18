"use client";

import type { LinkDetail } from "@/lib/api/types";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";
import { Pagination } from "@heroui/pagination";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";

import {
  listLinks,
  createLink,
  deleteLink,
  updateLink,
} from "@/lib/api/admin/link";
import { DeleteIcon, PlusIcon, EditIcon } from "@/components/common/icons";

const PAGE_SIZE = 10;

export default function AdminLinksPage() {
  const [links, setLinks] = useState<LinkDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("sort_order");
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">(
    "ascending",
  );

  // Create form
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editSortOrder, setEditSortOrder] = useState<number | string>(0);
  const [updating, setUpdating] = useState(false);

  const {
    isOpen: deleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
  } = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState<LinkDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listLinks({
        page,
        page_size: PAGE_SIZE,
        sort_by: sortBy,
        order: sortOrder === "ascending" ? "asc" : "desc",
      });

      setLinks(res.list);
      setTotalPages(res.total_pages);
    } catch {
      // Ignore 忽略错误。
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleCreate = async () => {
    if (!name || !url) return;
    setCreating(true);
    try {
      await createLink({
        name,
        url,
        logo: logo || null,
        description: description || null,
        status: "active",
      });
      await loadLinks();
      setName("");
      setUrl("");
      setLogo("");
      setDescription("");
    } catch {
      // Ignore 忽略错误。
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (l: LinkDetail) => {
    setEditId(l.id);
    setEditName(l.name);
    setEditUrl(l.url);
    setEditLogo(l.logo || "");
    setEditDescription(l.description || "");
    setEditStatus(l.status || "active");
    setEditSortOrder(l.sort_order ?? 0);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editId || !editName || !editUrl) return;
    setUpdating(true);
    try {
      await updateLink(editId, {
        name: editName,
        url: editUrl,
        logo: editLogo ? editLogo : null,
        description: editDescription ? editDescription : null,
        sort_order: Number(editSortOrder) || 0,
        status: editStatus,
      });
      setEditOpen(false);
      await loadLinks();
    } catch {
      // Ignore 忽略错误。
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (id: number) => {
    const l = links.find((x) => x.id === id);

    if (!l) return;
    setPendingDelete(l);
    openDelete();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">友链管理</h1>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">添加友链</h2>
        </CardHeader>
        <CardBody className="gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              isRequired
              label="名称"
              maxLength={100}
              value={name}
              onValueChange={setName}
            />
            <Input
              isRequired
              label="URL"
              placeholder="https://"
              value={url}
              onValueChange={setUrl}
            />
            <Input
              label="Logo URL"
              maxLength={1000}
              placeholder="https://"
              value={logo}
              onValueChange={setLogo}
            />
            <Input
              label="描述"
              maxLength={500}
              value={description}
              onValueChange={setDescription}
            />
          </div>
          <Button
            color="primary"
            isLoading={creating}
            startContent={<PlusIcon />}
            onPress={handleCreate}
          >
            添加
          </Button>
        </CardBody>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table
            aria-label="Links table"
            sortDescriptor={{ column: sortBy, direction: sortOrder }}
            onSortChange={(d) => {
              setSortBy(d.column as string);
              setSortOrder(d.direction!);
              setPage(1);
            }}
          >
            <TableHeader>
              <TableColumn>Logo</TableColumn>
              <TableColumn key="name" allowsSorting>
                名称
              </TableColumn>
              <TableColumn>URL</TableColumn>
              <TableColumn>描述</TableColumn>
              <TableColumn>状态</TableColumn>
              <TableColumn key="sort_order" allowsSorting>
                排序
              </TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody emptyContent="暂无友链">
              {links.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    {l.logo ? (
                      <Image
                        alt={l.name}
                        className="w-8 h-8 rounded"
                        src={l.logo}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{l.name}</TableCell>
                  <TableCell>
                    <Link isExternal href={l.url} size="sm">
                      {l.url}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate text-sm text-default-500">
                      {l.description || "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={l.status === "active" ? "success" : "default"}
                      size="sm"
                      variant="flat"
                    >
                      {l.status}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-default-400 text-sm">
                    {l.sort_order}
                  </TableCell>
                  <TableCell>
                    <Button
                      isIconOnly
                      className="mr-1"
                      color="primary"
                      size="sm"
                      variant="light"
                      onPress={() => openEdit(l)}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={() => handleDelete(l.id)}
                    >
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center">
            <Pagination
              showControls
              page={page}
              total={Math.max(totalPages, 1)}
              onChange={setPage}
            />
          </div>
        </>
      )}

      <Modal isOpen={editOpen} onOpenChange={setEditOpen}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>更新友链</ModalHeader>
              <ModalBody className="gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    isRequired
                    label="名称"
                    maxLength={100}
                    value={editName}
                    onValueChange={setEditName}
                  />
                  <Input
                    isRequired
                    label="URL"
                    placeholder="https://"
                    value={editUrl}
                    onValueChange={setEditUrl}
                  />
                  <Input
                    label="Logo URL"
                    maxLength={1000}
                    placeholder="https://"
                    value={editLogo}
                    onValueChange={setEditLogo}
                  />
                  <Input
                    label="排序"
                    type="number"
                    value={String(editSortOrder)}
                    onValueChange={(v) => setEditSortOrder(v)}
                  />
                  <Select
                    label="状态"
                    selectedKeys={[editStatus]}
                    onSelectionChange={(keys) =>
                      setEditStatus(Array.from(keys)[0] as string)
                    }
                  >
                    <SelectItem key="active">active</SelectItem>
                    <SelectItem key="inactive">inactive</SelectItem>
                  </Select>
                </div>
                <Input
                  label="描述"
                  maxLength={500}
                  value={editDescription}
                  onValueChange={setEditDescription}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => setEditOpen(false)}>
                  取消
                </Button>
                <Button
                  color="primary"
                  isLoading={updating}
                  onPress={handleUpdate}
                >
                  保存
                </Button>
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
          <ModalHeader>确认删除该友链？</ModalHeader>
          <ModalBody className="gap-3">
            <div className="space-y-1 text-sm">
              <div className="font-medium">{pendingDelete?.name || "-"}</div>
              <div className="text-default-500">
                {pendingDelete?.url || "-"}
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
                  await deleteLink(pendingDelete.id);
                  await loadLinks();
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
