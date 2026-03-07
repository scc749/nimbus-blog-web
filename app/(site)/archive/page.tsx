"use client";

import type { V1PostSummary } from "@/lib/api/types";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import NextLink from "next/link";

import { listPosts } from "@/lib/api/v1/content";
import { CalendarIcon, ClockIcon, EyeIcon } from "@/components/common/icons";
import { title, subtitle } from "@/components/common/primitives";
import { TruncatedText } from "@/components/common/utility";

const monthNames = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

function formatMD(s?: string | null) {
  if (!s) return "";
  const d = new Date(s);

  if (isNaN(d.getTime())) return "";

  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

interface YearGroup {
  year: string;
  months: { month: string; posts: V1PostSummary[] }[];
}

function groupPosts(posts: V1PostSummary[]): YearGroup[] {
  const map: Record<string, Record<string, V1PostSummary[]>> = {};

  posts.forEach((p) => {
    const d = new Date(p.published_at || p.created_at);

    if (isNaN(d.getTime())) return;
    const y = String(d.getFullYear());
    const m = String(d.getMonth() + 1).padStart(2, "0");

    if (!map[y]) map[y] = {};
    if (!map[y][m]) map[y][m] = [];
    map[y][m].push(p);
  });

  return Object.keys(map)
    .sort((a, b) => +b - +a)
    .map((year) => ({
      year,
      months: Object.keys(map[year])
        .sort((a, b) => +b - +a)
        .map((month) => ({ month, posts: map[year][month] })),
    }));
}

export default function ArchivePage() {
  const [posts, setPosts] = useState<V1PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await listPosts({
          page: 1,
          page_size: 999,
          sort_by: "created_at",
          order: "desc",
        });

        setPosts(res.list);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const groups = useMemo(() => groupPosts(posts), [posts]);
  const years = useMemo(() => groups.map((g) => g.year), [groups]);
  const totalViews = useMemo(
    () => posts.reduce((s, p) => s + (p.views || 0), 0),
    [posts],
  );

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
        <h1 className={title({ size: "md" })}>文章归档</h1>
        <div className={subtitle({ class: "mt-4" })}>
          按时间顺序浏览所有文章，探索知识的时间轨迹
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {posts.length}
            </div>
            <div className="text-sm text-default-600">总文章数</div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-sm text-default-600">总阅读量</div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {years.length}
            </div>
            <div className="text-sm text-default-600">创作年份</div>
          </CardBody>
        </Card>
      </div>

      {/* 年份筛选 */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <Button
          color="primary"
          size="sm"
          variant={selectedYear === null ? "solid" : "bordered"}
          onPress={() => setSelectedYear(null)}
        >
          全部年份
        </Button>
        {years.map((y) => (
          <Button
            key={y}
            color="primary"
            size="sm"
            variant={selectedYear === y ? "solid" : "bordered"}
            onPress={() => setSelectedYear(y)}
          >
            {y}年
          </Button>
        ))}
      </div>

      {/* 归档时间线 */}
      <div className="space-y-12">
        {groups
          .filter((g) => !selectedYear || g.year === selectedYear)
          .map((g, gi, arr) => (
            <div key={g.year} className="relative">
              <div className="flex items-center mb-8">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">{g.year}年</h2>
                  <Chip color="primary" size="sm" variant="flat">
                    {g.months.reduce((s, m) => s + m.posts.length, 0)} 篇文章
                  </Chip>
                </div>
                <Divider className="flex-1 ml-6" />
              </div>

              <div className="space-y-8 ml-4">
                {g.months.map((m, mi) => (
                  <div key={m.month} className="relative">
                    <div className="absolute left-0 top-2 w-3 h-3 bg-primary rounded-full border-4 border-background shadow-lg" />
                    <div className="ml-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        {monthNames[+m.month - 1]}
                        <Chip size="sm" variant="flat">
                          {m.posts.length} 篇
                        </Chip>
                      </h3>
                      <div className="space-y-4">
                        {m.posts.map((p) => (
                          <Card
                            key={p.id}
                            className="hover:shadow-lg transition-shadow"
                          >
                            <CardBody className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="shrink-0 text-sm text-default-400">
                                  {formatMD(p.published_at || p.created_at)}
                                </div>
                                <div className="flex-1">
                                  <Link
                                    as={NextLink}
                                    className="text-lg font-semibold hover:text-primary transition-colors"
                                    color="foreground"
                                    href={`/post/${p.slug}`}
                                  >
                                    {p.title}
                                  </Link>
                                  {p.excerpt && (
                                    <TruncatedText
                                      multiLine
                                      className="text-default-500 mt-2 line-clamp-2"
                                      text={p.excerpt}
                                    />
                                  )}
                                  <div className="flex flex-wrap items-center gap-3 mt-3">
                                    {p.category && (
                                      <Chip
                                        color="secondary"
                                        size="sm"
                                        variant="flat"
                                      >
                                        {p.category.name}
                                      </Chip>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-default-400">
                                      {p.read_time && (
                                        <span className="flex items-center gap-1">
                                          <ClockIcon className="w-4 h-4" />{" "}
                                          {p.read_time}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <EyeIcon className="w-4 h-4" />{" "}
                                        {(p.views || 0).toLocaleString()}
                                      </span>
                                    </div>
                                    {p.tags && p.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {p.tags.slice(0, 3).map((t) => (
                                          <Chip
                                            key={t.id}
                                            size="sm"
                                            variant="bordered"
                                          >
                                            {t.name}
                                          </Chip>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                    {mi < g.months.length - 1 && (
                      <div className="absolute left-1.5 top-5 w-0.5 h-full bg-default-200" />
                    )}
                  </div>
                ))}
              </div>

              {gi < arr.length - 1 && !selectedYear && (
                <div className="mt-12 pt-8 border-t border-default-200" />
              )}
            </div>
          ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-default-500 py-12">暂无文章</p>
      )}
    </section>
  );
}
