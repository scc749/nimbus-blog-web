"use client";

import type { TagDetail, V1PostSummary } from "@/lib/api/types";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Pagination } from "@heroui/pagination";

import { listTags, listPosts } from "@/lib/api/v1/content";
import { title, subtitle } from "@/components/common/primitives";
import { ArticleCard } from "@/components/site/post";

function getTagColor(
  count: number,
  max: number,
): "primary" | "secondary" | "success" | "default" {
  const r = max > 0 ? count / max : 0;

  if (r >= 0.8) return "primary";
  if (r >= 0.6) return "secondary";
  if (r >= 0.4) return "success";

  return "default";
}

function getTagSize(count: number, max: number): "sm" | "md" | "lg" {
  const r = max > 0 ? count / max : 0;

  if (r >= 0.8) return "lg";
  if (r >= 0.6) return "md";

  return "sm";
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagDetail[]>([]);
  const [selected, setSelected] = useState<TagDetail | null>(null);
  const [posts, setPosts] = useState<V1PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 100;

  useEffect(() => {
    listTags()
      .then(setTags)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => (b.post_count || 0) - (a.post_count || 0)),
    [tags],
  );
  const maxCount = useMemo(
    () =>
      sortedTags.length
        ? Math.max(...sortedTags.map((t) => t.post_count || 0))
        : 0,
    [sortedTags],
  );

  const handleSelect = useCallback(async (tag: TagDetail) => {
    setSelected(tag);
    setPage(1);
  }, []);

  useEffect(() => {
    (async () => {
      if (!selected) return;
      setLoadingPosts(true);
      try {
        const res = await listPosts({
          page,
          page_size: PAGE_SIZE,
          tag_id: selected.id,
          sort_by: "created_at",
          order: "desc",
        });

        setPosts(res.list);
        setTotal(res.total_items);
        setTotalPages(res.total_pages);
      } catch {
        setPosts([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoadingPosts(false);
      }
    })();
  }, [selected, page]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto w-full px-4 pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="text-center mb-12">
        <h1 className={title({ size: "md" })}>文章标签</h1>
        <div className={subtitle({ class: "mt-4" })}>
          通过标签快速找到感兴趣的技术文章
        </div>
      </div>

      {!selected ? (
        <>
          {/* 标签云 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">标签云</h2>
            <div className="flex flex-wrap justify-center gap-3 p-8 bg-default-50 rounded-lg">
              {sortedTags.map((t) => (
                <Chip
                  key={t.id}
                  className="cursor-pointer hover:scale-110 transition-transform"
                  color={getTagColor(t.post_count || 0, maxCount)}
                  size={getTagSize(t.post_count || 0, maxCount)}
                  variant="flat"
                  onClick={() => handleSelect(t)}
                >
                  {t.name} ({t.post_count || 0})
                </Chip>
              ))}
            </div>
          </div>

          {/* 标签列表 */}
          <div>
            <h2 className="text-2xl font-bold mb-6">所有标签</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTags.map((t) => (
                <Card
                  key={t.id}
                  isPressable
                  className="hover:shadow-lg transition-all hover:scale-[1.02]"
                  onPress={() => handleSelect(t)}
                >
                  <CardBody className="flex flex-row items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <p className="text-sm text-default-600">
                        {t.post_count || 0} 篇文章
                      </p>
                    </div>
                    <Chip
                      color={getTagColor(t.post_count || 0, maxCount)}
                      size="sm"
                      variant="flat"
                    >
                      {t.post_count || 0}
                    </Chip>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-default-600">
              共有{" "}
              <span className="font-semibold text-primary">{tags.length}</span>{" "}
              个标签，覆盖{" "}
              <span className="font-semibold text-primary">
                {sortedTags.reduce((s, t) => s + (t.post_count || 0), 0)}
              </span>{" "}
              篇文章
            </p>
          </div>

          {tags.length === 0 && (
            <p className="text-center text-default-500 py-12">暂无标签</p>
          )}
        </>
      ) : (
        <>
          <div className="mb-8">
            <Button
              className="mb-4"
              color="primary"
              variant="light"
              onPress={() => {
                setSelected(null);
                setPosts([]);
              }}
            >
              ← 返回标签列表
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">#{selected.name}</h2>
            </div>
            <p className="text-default-600">
              包含标签 &quot;{selected.name}&quot; 的所有文章
            </p>
            <p className="text-default-600 mt-2 text-center">
              共 <span className="font-semibold text-primary">{total}</span>{" "}
              篇文章
            </p>
          </div>

          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {posts.map((post) => (
                <ArticleCard
                  key={post.id}
                  activeTagName={selected.name}
                  post={post}
                />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                showControls
                showShadow
                color="primary"
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          )}
          {posts.length === 0 && !loadingPosts && (
            <p className="text-center text-default-500 py-12">
              该标签下暂无文章
            </p>
          )}
        </>
      )}
    </section>
  );
}
