"use client";

import type { CategoryDetail, V1PostSummary } from "@/lib/api/types";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";

import { title, subtitle } from "@/components/common/primitives";
import { SearchIcon } from "@/components/common/icons";
import { ArticleCard } from "@/components/site/post";
import { listPosts, listCategories } from "@/lib/api/v1/content";

export default function BlogPage() {
  const [posts, setPosts] = useState<V1PostSummary[]>([]);
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const postsPerPage = 6;

  const categoriesWithAll = useMemo(
    () => [
      { id: -1, name: "全部", slug: "all" } as CategoryDetail,
      ...categories,
    ],
    [categories],
  );

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPosts({
        page,
        page_size: postsPerPage,
        keyword: activeKeyword || undefined,
        category_id: categoryId,
      });

      setPosts(res.list);
      setTotal(res.total_items);
    } catch {
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, activeKeyword, categoryId]);

  const triggerSearch = () => {
    setActiveKeyword(keyword);
    setPage(1);
  };

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleClear = () => {
    setKeyword("");
    setActiveKeyword("");
    setPage(1);
  };

  const handleCategoryChange = (key: string) => {
    setCategoryId(key === "all" ? undefined : Number(key));
    setPage(1);
  };

  const totalPages = Math.ceil(total / postsPerPage);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className={title({ size: "md" })}>技术文章</h1>
        <div className={subtitle({ class: "mt-4" })}>
          分享编程技术、开发经验和实践心得
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-xl mx-auto">
        <div className="flex-1">
          <Input
            isClearable
            classNames={{
              input: "text-sm",
              inputWrapper: "bg-default-100",
            }}
            endContent={<Kbd keys={["enter"]} />}
            placeholder="搜索文章标题、简介或内容..."
            startContent={<SearchIcon className="text-default-400" />}
            value={keyword}
            onClear={handleClear}
            onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
            onValueChange={setKeyword}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            classNames={{
              trigger: "bg-default-100",
            }}
            selectedKeys={categoryId ? [String(categoryId)] : ["all"]}
            onSelectionChange={(keys) => {
              const k = Array.from(keys)[0] as string;

              handleCategoryChange(k);
            }}
          >
            {categoriesWithAll.map((c) => (
              <SelectItem key={c.id === -1 ? "all" : String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="mb-6 text-center">
        <p className="text-default-600">
          共找到 <span className="font-semibold text-primary">{total}</span>{" "}
          篇文章
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-default-500 text-lg mb-4">没有找到匹配的文章</p>
          <Button
            color="primary"
            variant="light"
            onPress={() => {
              setKeyword("");
              setActiveKeyword("");
              setCategoryId(undefined);
              setPage(1);
            }}
          >
            清除筛选条件
          </Button>
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
    </div>
  );
}
