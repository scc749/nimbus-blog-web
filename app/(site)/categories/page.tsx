"use client";

import type { CategoryDetail, V1PostSummary } from "@/lib/api/types";

import { useEffect, useState, useCallback } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Pagination } from "@heroui/pagination";

import { listCategories, listPosts } from "@/lib/api/v1/content";
import { title, subtitle } from "@/components/common/primitives";
import { ArticleCard } from "@/components/site/post";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [selected, setSelected] = useState<CategoryDetail | null>(null);
  const [posts, setPosts] = useState<V1PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 100;

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = useCallback(async (cat: CategoryDetail) => {
    setSelected(cat);
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
          category_id: selected.id,
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
        <h1 className={title({ size: "md" })}>文章分类</h1>
        <div className={subtitle({ class: "mt-4" })}>
          按分类浏览所有技术文章
        </div>
      </div>

      {!selected ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {categories.map((c) => (
              <Card
                key={c.id}
                isPressable
                className="hover:shadow-lg transition-all hover:scale-[1.02]"
                onPress={() => handleSelect(c)}
              >
                <CardBody className="text-center p-6">
                  <h3 className="text-xl font-bold mb-2">{c.name}</h3>
                  <p className="text-default-600 mb-4">
                    共{" "}
                    <span className="font-semibold text-primary">
                      {c.post_count}
                    </span>{" "}
                    篇文章
                  </p>
                  <Chip color="primary" variant="flat">
                    查看文章
                  </Chip>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <p className="text-default-600">
              共有{" "}
              <span className="font-semibold text-primary">
                {categories.length}
              </span>{" "}
              个分类
            </p>
          </div>
          {categories.length === 0 && (
            <p className="text-center text-default-500 py-12">暂无分类</p>
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
              ← 返回分类列表
            </Button>
            <h2 className="text-2xl font-bold text-center">{selected.name}</h2>
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
                  activeCategoryId={selected.id}
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
              该分类下暂无文章
            </p>
          )}
        </>
      )}
    </section>
  );
}
