"use client";

import type { MDXEditorMethods } from "@mdxeditor/editor";
import type {
  AdminPostDetail,
  CategoryDetail,
  TagDetail,
} from "@/lib/api/types";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Switch } from "@heroui/switch";
import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Image } from "@heroui/image";

import { ForwardRefEditor } from "@/components/admin/editor";
import { SearchIcon } from "@/components/common/icons";
import {
  createPost,
  updatePost,
  listCategories,
  listTags,
  createCategory,
  createTag,
  generateSlug,
} from "@/lib/api/admin/content";
import {
  generateUploadURL,
  uploadFileToPresignedURL,
} from "@/lib/api/admin/file";
import { getFileURL } from "@/lib/api/v1/file";

const PICKER_PAGE_SIZE = 20;

interface Props {
  initialData?: AdminPostDetail;
  postId?: number;
}

export function PostForm({ initialData, postId }: Props) {
  const router = useRouter();
  const editorRef = useRef<MDXEditorMethods>(null);

  // FormFields 表单字段。
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featured_image || "",
  );
  const [categoryId, setCategoryId] = useState<number | undefined>(
    initialData?.category?.id,
  );
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    new Set(initialData?.tags?.map((t) => String(t.id)) || []),
  );
  const [isFeatured, setIsFeatured] = useState(
    initialData?.is_featured || false,
  );
  const [loading, setLoading] = useState(false);
  const [slugLoading, setSlugLoading] = useState(false);
  const [error, setError] = useState("");
  const currentStatus = initialData?.status || "draft";
  const statusLabel = currentStatus === "published" ? "已发布" : "草稿";
  const statusColor = currentStatus === "published" ? "success" : "default";

  const handleEditorChange = useCallback((md: string) => {
    setContent(md);
  }, []);

  // LookupCaches 名称缓存（用 ref 避免无意义重渲染）。
  const categoryNameMap = useRef(new Map<number, string>());
  const tagNameMap = useRef(new Map<number, string>());

  if (initialData?.category) {
    categoryNameMap.current.set(
      initialData.category.id,
      initialData.category.name,
    );
  }
  initialData?.tags?.forEach((t) => tagNameMap.current.set(t.id, t.name));

  const selectedCategoryName = categoryId
    ? categoryNameMap.current.get(categoryId)
    : undefined;

  const getTagName = (id: string) => tagNameMap.current.get(Number(id));

  // CategoryPicker 分类选择弹窗状态。
  const {
    isOpen: catPickerOpen,
    onOpen: openCatPicker,
    onClose: closeCatPicker,
  } = useDisclosure();
  const [catItems, setCatItems] = useState<CategoryDetail[]>([]);
  const [catTotalItems, setCatTotalItems] = useState(0);
  const [catTotalPages, setCatTotalPages] = useState(0);
  const [catPage, setCatPage] = useState(1);
  const [catLoading, setCatLoading] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const catSearchTimer = useRef<ReturnType<typeof setTimeout>>();

  // TagPicker 标签选择弹窗状态。
  const {
    isOpen: tagPickerOpen,
    onOpen: openTagPicker,
    onClose: closeTagPicker,
  } = useDisclosure();
  const [tagItems, setTagItems] = useState<TagDetail[]>([]);
  const [tagTotalItems, setTagTotalItems] = useState(0);
  const [tagTotalPages, setTagTotalPages] = useState(0);
  const [tagPage, setTagPage] = useState(1);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const tagSearchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [pendingTagIds, setPendingTagIds] = useState<Set<string>>(new Set());

  // CreateModals 新建分类/标签弹窗状态。
  const {
    isOpen: catCreateOpen,
    onOpen: openCatCreate,
    onClose: closeCatCreate,
  } = useDisclosure();
  const {
    isOpen: tagCreateOpen,
    onOpen: openTagCreate,
    onClose: closeTagCreate,
  } = useDisclosure();
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [catSlugLoading, setCatSlugLoading] = useState(false);
  const [tagSlugLoading, setTagSlugLoading] = useState(false);

  // CoverUpload 封面上传状态。
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Derived 派生状态。
  const catHasMore = catPage < catTotalPages;
  const tagHasMore = tagPage < tagTotalPages;

  // CleanupTimers 卸载时清理定时器。
  useEffect(() => {
    return () => {
      if (catSearchTimer.current) clearTimeout(catSearchTimer.current);
      if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
    };
  }, []);

  // PickerFetchers 拉取分类/标签列表。
  const fetchCatItems = useCallback(
    async (page: number, keyword: string, append: boolean) => {
      setCatLoading(true);
      try {
        const res = await listCategories({
          page,
          page_size: PICKER_PAGE_SIZE,
          keyword: keyword || undefined,
        });

        res.list.forEach((c) => categoryNameMap.current.set(c.id, c.name));
        setCatItems((prev) => (append ? [...prev, ...res.list] : res.list));
        setCatTotalItems(res.total_items);
        setCatTotalPages(res.total_pages);
        setCatPage(page);
      } catch {
        // Ignore 忽略错误。
      } finally {
        setCatLoading(false);
      }
    },
    [],
  );

  const fetchTagItems = useCallback(
    async (page: number, keyword: string, append: boolean) => {
      setTagLoading(true);
      try {
        const res = await listTags({
          page,
          page_size: PICKER_PAGE_SIZE,
          keyword: keyword || undefined,
        });

        res.list.forEach((t) => tagNameMap.current.set(t.id, t.name));
        setTagItems((prev) => (append ? [...prev, ...res.list] : res.list));
        setTagTotalItems(res.total_items);
        setTagTotalPages(res.total_pages);
        setTagPage(page);
      } catch {
        // Ignore 忽略错误。
      } finally {
        setTagLoading(false);
      }
    },
    [],
  );

  // DebouncedSearch 搜索输入防抖。
  const handleCatSearchChange = (value: string) => {
    setCatSearch(value);
    if (catSearchTimer.current) clearTimeout(catSearchTimer.current);
    catSearchTimer.current = setTimeout(
      () => fetchCatItems(1, value, false),
      300,
    );
  };

  const handleTagSearchChange = (value: string) => {
    setTagSearch(value);
    if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
    tagSearchTimer.current = setTimeout(
      () => fetchTagItems(1, value, false),
      300,
    );
  };

  // PickerOpenHandlers 打开弹窗时初始化数据。
  const handleOpenCatPicker = () => {
    setCatSearch("");
    fetchCatItems(1, "", false);
    openCatPicker();
  };

  const handleOpenTagPicker = () => {
    setPendingTagIds(new Set(selectedTagIds));
    setTagSearch("");
    fetchTagItems(1, "", false);
    openTagPicker();
  };

  const handleConfirmTags = () => {
    setSelectedTagIds(new Set(pendingTagIds));
    closeTagPicker();
  };

  // SlugGenerators Slug 自动生成。
  const handleGenerateSlug = async () => {
    if (!title.trim()) return;
    setSlugLoading(true);
    try {
      setSlug(await generateSlug(title.trim()));
    } catch {
      setError("Slug 生成失败");
    } finally {
      setSlugLoading(false);
    }
  };

  const handleGenerateCatSlug = async () => {
    if (!newCatName.trim()) return;
    setCatSlugLoading(true);
    try {
      setNewCatSlug(await generateSlug(newCatName.trim()));
    } catch {
      // Ignore 忽略错误。
    } finally {
      setCatSlugLoading(false);
    }
  };

  const handleGenerateTagSlug = async () => {
    if (!newTagName.trim()) return;
    setTagSlugLoading(true);
    try {
      setNewTagSlug(await generateSlug(newTagName.trim()));
    } catch {
      // Ignore 忽略错误。
    } finally {
      setTagSlugLoading(false);
    }
  };

  // CoverUploadHandlers 封面上传与移除。
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      setError("仅支持 JPG、PNG、WebP 格式的图片");

      return;
    }
    setCoverUploading(true);
    setError("");
    try {
      const res = await generateUploadURL({
        upload_type: "post_cover",
        content_type: file.type as "image/jpeg" | "image/png" | "image/webp",
        file_name: file.name,
        file_size: file.size,
      });

      await uploadFileToPresignedURL(res.upload_url, file);
      setFeaturedImage(res.object_key);
    } catch {
      setError("封面图片上传失败");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // SaveHandler 保存文章。
  const handleSave = async (saveStatus: string) => {
    const md = editorRef.current?.getMarkdown() ?? content;

    if (!title || !slug.trim() || !md.trim() || !categoryId) {
      setError("标题、Slug、内容和分类为必填项");

      return;
    }
    setLoading(true);
    setError("");
    try {
      const tagIds = Array.from(selectedTagIds).map(Number);

      if (postId) {
        await updatePost(postId, {
          title,
          slug,
          excerpt: excerpt || null,
          content: md,
          featured_image: featuredImage || null,
          category_id: categoryId,
          tag_ids: tagIds,
          status: saveStatus,
          is_featured: isFeatured,
        });
      } else {
        await createPost({
          title,
          slug,
          excerpt: excerpt || null,
          content: md,
          featured_image: featuredImage || null,
          author_id: 1,
          category_id: categoryId!,
          tag_ids: tagIds,
          status: saveStatus,
          is_featured: isFeatured,
        });
      }
      router.push("/admin/posts");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "保存失败";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // CreateHandlers 新建分类/标签。
  const handleCreateCategory = async () => {
    if (!newCatName) return;
    try {
      const result = await createCategory({
        name: newCatName,
        slug: newCatSlug || newCatName.toLowerCase(),
      });

      categoryNameMap.current.set(result.id, newCatName);
      setCategoryId(result.id);
      closeCatCreate();
      setNewCatName("");
      setNewCatSlug("");
    } catch {
      // Ignore 忽略错误。
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName) return;
    try {
      const result = await createTag({
        name: newTagName,
        slug: newTagSlug || newTagName.toLowerCase(),
      });

      tagNameMap.current.set(result.id, newTagName);
      setSelectedTagIds(
        (prev) => new Set([...Array.from(prev), String(result.id)]),
      );
      closeTagCreate();
      setNewTagName("");
      setNewTagSlug("");
    } catch {
      // Ignore 忽略错误。
    }
  };

  // JSX 渲染。
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-danger-50 text-danger p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Editor */}
        <div className="min-w-0">
          <div className="border border-default-200 rounded-lg h-[calc(100vh-160px)] overflow-y-auto [&_.mdxeditor]:min-h-full [&_.mdxeditor-root-contenteditable]:min-h-full">
            <ForwardRefEditor
              ref={editorRef}
              contentEditableClassName="prose max-w-none min-h-full h-full px-4 py-3"
              markdown={content}
              placeholder="开始撰写文章内容..."
              onChange={handleEditorChange}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="h-[calc(100vh-160px)] overflow-y-auto">
          <Card className="border border-default-200">
            <CardBody className="gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-default-500">当前状态</span>
                <Chip color={statusColor} size="sm" variant="flat">
                  {statusLabel}
                </Chip>
              </div>
              <Divider />
              <Input
                isRequired
                label="标题"
                maxLength={200}
                value={title}
                onValueChange={setTitle}
              />
              <div className="flex items-center gap-2">
                <Input
                  isRequired
                  className="flex-1"
                  label="Slug"
                  maxLength={200}
                  value={slug}
                  onValueChange={setSlug}
                />
                <Button
                  isDisabled={!title.trim()}
                  isLoading={slugLoading}
                  size="sm"
                  variant="flat"
                  onPress={handleGenerateSlug}
                >
                  生成
                </Button>
              </div>
              <Textarea
                label="摘要"
                maxLength={500}
                minRows={3}
                value={excerpt}
                onValueChange={setExcerpt}
              />
              <Divider />
              <div className="space-y-1.5">
                <div className="text-sm font-medium text-foreground">
                  分类 <span className="text-danger">*</span>
                </div>
                <Button
                  fullWidth
                  className="justify-start h-10 font-normal"
                  variant="flat"
                  onPress={handleOpenCatPicker}
                >
                  {selectedCategoryName || "点击选择分类"}
                </Button>
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium text-foreground">标签</div>
                <Button
                  fullWidth
                  className="justify-start h-10 font-normal"
                  variant="flat"
                  onPress={handleOpenTagPicker}
                >
                  {selectedTagIds.size > 0
                    ? `已选择 ${selectedTagIds.size} 个标签`
                    : "点击选择标签"}
                </Button>
                {selectedTagIds.size > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {Array.from(selectedTagIds).map((id) => {
                      const name = getTagName(id);

                      return name ? (
                        <Chip
                          key={id}
                          size="sm"
                          variant="flat"
                          onClose={() =>
                            setSelectedTagIds((prev) => {
                              const next = new Set(prev);

                              next.delete(id);

                              return next;
                            })
                          }
                        >
                          {name}
                        </Chip>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  封面图片
                </div>
                {featuredImage && (
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      removeWrapper
                      alt="封面预览"
                      className="pointer-events-none select-none w-full h-32 object-cover"
                      src={getFileURL(featuredImage)}
                    />
                    <Button
                      className="absolute top-1 right-1 z-10 min-w-0 h-6 px-2"
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() => setFeaturedImage("")}
                    >
                      移除
                    </Button>
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  type="file"
                  onChange={handleCoverUpload}
                />
                <Button
                  fullWidth
                  isLoading={coverUploading}
                  size="sm"
                  variant="flat"
                  onPress={() => coverInputRef.current?.click()}
                >
                  {featuredImage ? "更换图片" : "上传图片"}
                </Button>
              </div>
              <Switch isSelected={isFeatured} onValueChange={setIsFeatured}>
                置顶
              </Switch>
              <Divider />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  color="primary"
                  isLoading={loading}
                  onPress={() => handleSave("published")}
                >
                  发布
                </Button>
                <Button
                  className="flex-1"
                  isLoading={loading}
                  variant="flat"
                  onPress={() => handleSave("draft")}
                >
                  存草稿
                </Button>
              </div>
              <Button
                fullWidth
                variant="bordered"
                onPress={() => router.back()}
              >
                取消
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ── Category Picker Modal ─────────────────────────── */}
      <Modal isOpen={catPickerOpen} size="md" onClose={closeCatPicker}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span>选择分类</span>
            {catTotalItems > 0 && (
              <span className="text-xs font-normal text-default-400">
                共 {catTotalItems} 个分类
              </span>
            )}
          </ModalHeader>
          <ModalBody className="gap-0 px-4">
            <Input
              isClearable
              className="mb-3"
              placeholder="搜索分类..."
              size="sm"
              startContent={<SearchIcon className="text-default-400" />}
              value={catSearch}
              variant="bordered"
              onValueChange={handleCatSearchChange}
            />
            <ScrollShadow className="max-h-72">
              {catLoading && catItems.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : catItems.length === 0 ? (
                <p className="text-center text-sm text-default-400 py-6">
                  {catSearch ? "没有匹配的分类" : "暂无分类"}
                </p>
              ) : (
                <div className="flex flex-col">
                  {catItems.map((cat) => (
                    <button
                      key={cat.id}
                      className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                        categoryId === cat.id
                          ? "bg-primary-50 text-primary dark:bg-primary-50/10"
                          : "hover:bg-default-100"
                      }`}
                      type="button"
                      onClick={() => {
                        setCategoryId(cat.id);
                        closeCatPicker();
                      }}
                    >
                      <span className="text-sm">{cat.name}</span>
                      {categoryId === cat.id && (
                        <svg
                          className="w-4 h-4 text-primary shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                  {catHasMore && (
                    <Button
                      className="mt-1"
                      isLoading={catLoading}
                      size="sm"
                      variant="light"
                      onPress={() =>
                        fetchCatItems(catPage + 1, catSearch, true)
                      }
                    >
                      加载更多
                    </Button>
                  )}
                </div>
              )}
            </ScrollShadow>
          </ModalBody>
          <ModalFooter className="justify-between">
            <Button
              size="sm"
              variant="flat"
              onPress={() => {
                closeCatPicker();
                openCatCreate();
              }}
            >
              + 新建分类
            </Button>
            <Button variant="light" onPress={closeCatPicker}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Tag Picker Modal ──────────────────────────────── */}
      <Modal isOpen={tagPickerOpen} size="md" onClose={closeTagPicker}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span>选择标签</span>
            {tagTotalItems > 0 && (
              <span className="text-xs font-normal text-default-400">
                共 {tagTotalItems} 个标签
              </span>
            )}
          </ModalHeader>
          <ModalBody className="gap-0 px-4">
            <Input
              isClearable
              className="mb-3"
              placeholder="搜索标签..."
              size="sm"
              startContent={<SearchIcon className="text-default-400" />}
              value={tagSearch}
              variant="bordered"
              onValueChange={handleTagSearchChange}
            />
            <ScrollShadow className="max-h-72">
              {tagLoading && tagItems.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : tagItems.length === 0 ? (
                <p className="text-center text-sm text-default-400 py-6">
                  {tagSearch ? "没有匹配的标签" : "暂无标签"}
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {tagItems.map((tag) => {
                    const id = String(tag.id);
                    const checked = pendingTagIds.has(id);

                    return (
                      <label
                        key={tag.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                          checked
                            ? "bg-primary-50 dark:bg-primary-50/10"
                            : "hover:bg-default-100"
                        }`}
                      >
                        <Checkbox
                          isSelected={checked}
                          size="sm"
                          onValueChange={(v) => {
                            setPendingTagIds((prev) => {
                              const next = new Set(prev);

                              if (v) next.add(id);
                              else next.delete(id);

                              return next;
                            });
                          }}
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    );
                  })}
                  {tagHasMore && (
                    <Button
                      className="mt-1"
                      isLoading={tagLoading}
                      size="sm"
                      variant="light"
                      onPress={() =>
                        fetchTagItems(tagPage + 1, tagSearch, true)
                      }
                    >
                      加载更多
                    </Button>
                  )}
                </div>
              )}
            </ScrollShadow>
            {pendingTagIds.size > 0 && (
              <>
                <Divider className="my-3" />
                <div className="flex flex-wrap gap-1">
                  {Array.from(pendingTagIds).map((id) => {
                    const name = tagNameMap.current.get(Number(id));

                    return name ? (
                      <Chip
                        key={id}
                        size="sm"
                        variant="flat"
                        onClose={() =>
                          setPendingTagIds((prev) => {
                            const next = new Set(prev);

                            next.delete(id);

                            return next;
                          })
                        }
                      >
                        {name}
                      </Chip>
                    ) : null;
                  })}
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter className="justify-between">
            <Button
              size="sm"
              variant="flat"
              onPress={() => {
                closeTagPicker();
                openTagCreate();
              }}
            >
              + 新建标签
            </Button>
            <Button color="primary" onPress={handleConfirmTags}>
              确认 ({pendingTagIds.size})
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Create Category Modal ─────────────────────────── */}
      <Modal isOpen={catCreateOpen} onClose={closeCatCreate}>
        <ModalContent>
          <ModalHeader>新建分类</ModalHeader>
          <ModalBody className="gap-3">
            <Input
              isRequired
              label="分类名"
              maxLength={50}
              value={newCatName}
              onValueChange={setNewCatName}
            />
            <div className="flex items-center gap-2">
              <Input
                isRequired
                className="flex-1"
                label="Slug"
                maxLength={50}
                value={newCatSlug}
                onValueChange={setNewCatSlug}
              />
              <Button
                isDisabled={!newCatName.trim()}
                isLoading={catSlugLoading}
                size="sm"
                variant="flat"
                onPress={handleGenerateCatSlug}
              >
                生成
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeCatCreate}>
              取消
            </Button>
            <Button color="primary" onPress={handleCreateCategory}>
              创建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Create Tag Modal ──────────────────────────────── */}
      <Modal isOpen={tagCreateOpen} onClose={closeTagCreate}>
        <ModalContent>
          <ModalHeader>新建标签</ModalHeader>
          <ModalBody className="gap-3">
            <Input
              isRequired
              label="标签名"
              maxLength={50}
              value={newTagName}
              onValueChange={setNewTagName}
            />
            <div className="flex items-center gap-2">
              <Input
                isRequired
                className="flex-1"
                label="Slug"
                maxLength={50}
                value={newTagSlug}
                onValueChange={setNewTagSlug}
              />
              <Button
                isDisabled={!newTagName.trim()}
                isLoading={tagSlugLoading}
                size="sm"
                variant="flat"
                onPress={handleGenerateTagSlug}
              >
                生成
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeTagCreate}>
              取消
            </Button>
            <Button color="primary" onPress={handleCreateTag}>
              创建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
