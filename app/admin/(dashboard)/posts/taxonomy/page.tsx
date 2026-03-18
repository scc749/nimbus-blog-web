"use client";

import type { CategoryDetail, TagDetail } from "@/lib/api/types";

import { useEffect, useState, useCallback } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Card, CardBody } from "@heroui/card";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { Pagination } from "@heroui/pagination";

import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listTags,
  createTag,
  updateTag,
  deleteTag,
  generateSlug,
} from "@/lib/api/admin/content";
import { SearchIcon, DeleteIcon, EditIcon } from "@/components/common/icons";

const PAGE_SIZE = 12;

export default function TaxonomyPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "tags">("categories");
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [tags, setTags] = useState<TagDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [catPage, setCatPage] = useState(1);
  const [catTotalPages, setCatTotalPages] = useState(1);
  const [tagPage, setTagPage] = useState(1);
  const [tagTotalPages, setTagTotalPages] = useState(1);

  const {
    isOpen: catOpen,
    onOpen: openCat,
    onClose: closeCat,
  } = useDisclosure();
  const {
    isOpen: tagOpen,
    onOpen: openTag,
    onClose: closeTag,
  } = useDisclosure();
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugLoading, setSlugLoading] = useState(false);

  const {
    isOpen: editOpen,
    onOpen: openEdit,
    onClose: closeEdit,
  } = useDisclosure();
  const [editType, setEditType] = useState<"category" | "tag">("category");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSlugLoading, setEditSlugLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const {
    isOpen: deleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
  } = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState<{
    type: "category" | "tag";
    id: number;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([
        listCategories({
          page: catPage,
          page_size: PAGE_SIZE,
          keyword: activeSearch || undefined,
          sort_by: "created_at",
          order: "desc",
        }),
        listTags({
          page: tagPage,
          page_size: PAGE_SIZE,
          keyword: activeSearch || undefined,
          sort_by: "created_at",
          order: "desc",
        }),
      ]);

      setCategories(c.list);
      setCatTotalPages(c.total_pages);
      setTags(t.list);
      setTagTotalPages(t.total_pages);
    } catch {
      // Ignore 忽略错误。
    } finally {
      setLoading(false);
    }
  }, [catPage, tagPage, activeSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCategory = async () => {
    if (!newName) return;
    try {
      await createCategory({
        name: newName,
        slug: newSlug || newName.toLowerCase(),
      });
      await loadData();
      closeCat();
      setNewName("");
      setNewSlug("");
    } catch {
      // Ignore 忽略错误。
    }
  };

  const handleCreateTag = async () => {
    if (!newName) return;
    try {
      await createTag({
        name: newName,
        slug: newSlug || newName.toLowerCase(),
      });
      await loadData();
      closeTag();
      setNewName("");
      setNewSlug("");
    } catch {
      // Ignore 忽略错误。
    }
  };

  const handleGenerateSlug = async () => {
    if (!newName.trim()) return;
    setSlugLoading(true);
    try {
      const result = await generateSlug(newName.trim());

      setNewSlug(result);
    } catch {
      // Ignore 忽略错误。
    } finally {
      setSlugLoading(false);
    }
  };

  const handleGenerateEditSlug = async () => {
    if (!editName.trim()) return;
    setEditSlugLoading(true);
    try {
      const result = await generateSlug(editName.trim());

      setEditSlug(result);
    } catch {
      // Ignore 忽略错误。
    } finally {
      setEditSlugLoading(false);
    }
  };

  const handleOpenEditCategory = (c: CategoryDetail) => {
    setEditType("category");
    setEditId(c.id);
    setEditName(c.name);
    setEditSlug(c.slug);
    openEdit();
  };

  const handleOpenEditTag = (t: TagDetail) => {
    setEditType("tag");
    setEditId(t.id);
    setEditName(t.name);
    setEditSlug(t.slug);
    openEdit();
  };

  const handleUpdateTaxonomy = async () => {
    if (!editId || !editName.trim() || !editSlug.trim()) return;
    setEditSaving(true);
    try {
      if (editType === "category") {
        await updateCategory(editId, { name: editName.trim(), slug: editSlug });
      } else {
        await updateTag(editId, { name: editName.trim(), slug: editSlug });
      }
      await loadData();
      closeEdit();
      setEditId(null);
      setEditName("");
      setEditSlug("");
    } catch {
      // Ignore 忽略错误。
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const c = categories.find((x) => x.id === id);

    if (!c) return;
    setPendingDelete({ type: "category", id: c.id, name: c.name });
    openDelete();
  };

  const handleDeleteTag = async (id: number) => {
    const t = tags.find((x) => x.id === id);

    if (!t) return;
    setPendingDelete({ type: "tag", id: t.id, name: t.name });
    openDelete();
  };

  const triggerSearch = () => {
    setActiveSearch(search);
    setCatPage(1);
    setTagPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">分类与标签</h1>

      <Input
        isClearable
        className="max-w-sm"
        endContent={<Kbd keys={["enter"]} />}
        placeholder="搜索分类或标签..."
        startContent={<SearchIcon className="text-default-400" />}
        value={search}
        onClear={() => {
          setSearch("");
          setActiveSearch("");
          setCatPage(1);
          setTagPage(1);
        }}
        onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
        onValueChange={setSearch}
      />

      <Tabs
        aria-label="Taxonomy tabs"
        selectedKey={activeTab}
        onSelectionChange={(key) =>
          setActiveTab(key as "categories" | "tags")
        }
      >
        <Tab key="categories" title="分类">
          <div className="space-y-3">
            <Button color="primary" size="sm" onPress={openCat}>
              新建分类
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((c) => (
                <Card key={c.id}>
                  <CardBody className="flex flex-row items-center justify-between">
                    <div>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-default-400 text-sm ml-2">
                        ({c.post_count} 篇)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleOpenEditCategory(c)}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => handleDeleteCategory(c.id)}
                      >
                        <DeleteIcon />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="text-center text-default-500">暂无分类</p>
            )}
            <div className="flex justify-center">
              <Pagination
                showControls
                page={catPage}
                total={Math.max(catTotalPages, 1)}
                onChange={setCatPage}
              />
            </div>
          </div>
        </Tab>
        <Tab key="tags" title="标签">
          <div className="space-y-3">
            <Button color="primary" size="sm" onPress={openTag}>
              新建标签
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tags.map((t) => (
                <Card key={t.id}>
                  <CardBody className="flex flex-row items-center justify-between">
                    <div>
                      <span className="font-medium">{t.name}</span>
                      <span className="text-default-400 text-sm ml-2">
                        ({t.post_count} 篇)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleOpenEditTag(t)}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => handleDeleteTag(t.id)}
                      >
                        <DeleteIcon />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="text-center text-default-500">暂无标签</p>
            )}
            <div className="flex justify-center">
              <Pagination
                showControls
                page={tagPage}
                total={Math.max(tagTotalPages, 1)}
                onChange={setTagPage}
              />
            </div>
          </div>
        </Tab>
      </Tabs>

      <Modal
        isOpen={editOpen}
        onClose={() => {
          closeEdit();
          setEditId(null);
          setEditName("");
          setEditSlug("");
        }}
      >
        <ModalContent>
          <ModalHeader>
            {editType === "category" ? "编辑分类" : "编辑标签"}
          </ModalHeader>
          <ModalBody className="gap-3">
            <Input
              isRequired
              label="名称"
              maxLength={50}
              value={editName}
              onValueChange={setEditName}
            />
            <div className="flex items-center gap-2">
              <Input
                isRequired
                className="flex-1"
                label="Slug"
                maxLength={50}
                value={editSlug}
                onValueChange={setEditSlug}
              />
              <Button
                isDisabled={!editName.trim()}
                isLoading={editSlugLoading}
                size="sm"
                variant="flat"
                onPress={handleGenerateEditSlug}
              >
                生成
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                closeEdit();
                setEditId(null);
                setEditName("");
                setEditSlug("");
              }}
            >
              取消
            </Button>
            <Button
              color="primary"
              isLoading={editSaving}
              onPress={handleUpdateTaxonomy}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={catOpen || tagOpen}
        onClose={() => {
          closeCat();
          closeTag();
        }}
      >
        <ModalContent>
          <ModalHeader>{catOpen ? "新建分类" : "新建标签"}</ModalHeader>
          <ModalBody className="gap-3">
            <Input
              isRequired
              label="名称"
              maxLength={50}
              value={newName}
              onValueChange={setNewName}
            />
            <div className="flex items-center gap-2">
              <Input
                isRequired
                className="flex-1"
                label="Slug"
                maxLength={50}
                value={newSlug}
                onValueChange={setNewSlug}
              />
              <Button
                isDisabled={!newName.trim()}
                isLoading={slugLoading}
                size="sm"
                variant="flat"
                onPress={handleGenerateSlug}
              >
                生成
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                closeCat();
                closeTag();
                setNewName("");
                setNewSlug("");
              }}
            >
              取消
            </Button>
            <Button
              color="primary"
              onPress={catOpen ? handleCreateCategory : handleCreateTag}
            >
              创建
            </Button>
          </ModalFooter>
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
          <ModalHeader>确认删除？</ModalHeader>
          <ModalBody className="gap-3">
            <div className="space-y-1 text-sm">
              <div className="font-medium">
                {pendingDelete?.type === "category" ? "分类" : "标签"}：{" "}
                {pendingDelete?.name}
              </div>
              <div className="text-default-500">ID：{pendingDelete?.id}</div>
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
                  if (pendingDelete.type === "category") {
                    await deleteCategory(pendingDelete.id);
                  } else {
                    await deleteTag(pendingDelete.id);
                  }
                  await loadData();
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
