"use client";

import type { SiteSettingDetail, V1PostSummary } from "@/lib/api/types";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import NextLink from "next/link";

import { listPosts } from "@/lib/api/v1/content";
import { listSettings } from "@/lib/api/v1/setting";
import { getFileURL, resolveImageURL } from "@/lib/api/v1/file";
import { GithubIcon, BilibiliIcon } from "@/components/common/icons";
import { TruncatedText } from "@/components/common/utility";

export default function Home() {
  const [posts, setPosts] = useState<V1PostSummary[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [postRes, settingRes] = await Promise.all([
          listPosts({
            page: 1,
            page_size: 3,
            sort_by: "created_at",
            order: "desc",
          }),
          listSettings().catch(() => [] as SiteSettingDetail[]),
        ]);

        setPosts(postRes.list);
        const map: Record<string, string> = {};

        settingRes.forEach((s) => {
          map[s.setting_key] = s.setting_value;
        });
        setSettings(map);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const profileName = settings["profile.name"] || "博主";
  const profileAvatar = settings["profile.avatar"] || "/author.png";
  const siteHero = settings["site.hero"] || "";
  const githubURL = settings["profile.github_url"] || "";
  const bilibiliURL = settings["profile.bilibili_url"] || "";

  let techStack: string[] = [];

  try {
    const raw = settings["profile.tech_stack"];

    techStack = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(techStack)) techStack = [];
  } catch {
    techStack = [];
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pt-16 pb-12 md:pt-24 md:pb-16 max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              你好，我是&nbsp;
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {profileName}
              </span>
            </h1>
            {siteHero && (
              <p className="mt-4 text-lg text-default-600 whitespace-pre-line">
                {siteHero}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
            <Button
              as={NextLink}
              className="font-medium"
              color="primary"
              href="/blog"
              size="lg"
              variant="shadow"
            >
              阅读文章
            </Button>
            <Button
              as={NextLink}
              className="font-medium"
              href="/about"
              size="lg"
              variant="bordered"
            >
              了解更多
            </Button>
          </div>

          <div className="flex gap-4 justify-center lg:justify-start">
            {githubURL && (
              <Link
                isExternal
                className="text-default-500 hover:text-default-700 transition-colors"
                href={githubURL}
              >
                <GithubIcon size={24} />
              </Link>
            )}
            {bilibiliURL && (
              <Link
                isExternal
                className="text-default-500 hover:text-[#00a1d6] transition-colors"
                href={bilibiliURL}
              >
                <BilibiliIcon size={24} />
              </Link>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <Avatar
            className="w-48 h-48 lg:w-64 lg:h-64 shadow-xl"
            name={profileName}
            src={resolveImageURL(profileAvatar) || "/author.png"}
          />
        </div>
      </section>

      <Divider className="my-4" />

      {/* Recent Posts Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">最新文章</h2>
          <Button
            as={NextLink}
            className="font-medium"
            color="primary"
            href="/blog"
            variant="light"
          >
            查看全部 →
          </Button>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              return (
                <Card
                  key={post.id}
                  isPressable
                  as={NextLink}
                  className="h-full"
                  href={`/post/${post.slug}`}
                >
                  <div className="relative w-full aspect-video overflow-hidden">
                    <img
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      decoding="async"
                      loading="lazy"
                      src={
                        post.featured_image
                          ? getFileURL(post.featured_image)
                          : "/no_cover_yet.png"
                      }
                    />
                  </div>
                  <CardBody className="gap-2 flex flex-col">
                    {post.category && (
                      <Chip color="primary" size="sm" variant="flat">
                        {post.category.name}
                      </Chip>
                    )}
                    <h3 className="text-lg font-semibold leading-7 line-clamp-2 min-h-14">
                      {post.title}
                    </h3>
                    <TruncatedText
                      multiLine
                      className="text-sm text-default-500 leading-6 line-clamp-2 min-h-12"
                      text={post.excerpt}
                    />
                    <div className="flex flex-wrap content-start gap-1 mt-1 min-h-12 max-h-12 overflow-hidden">
                      {post.tags?.map((tag) => (
                        <Chip key={tag.id} size="sm" variant="flat">
                          {tag.name}
                        </Chip>
                      ))}
                    </div>
                  </CardBody>
                  <CardFooter className="text-sm text-default-400 justify-between">
                    <span>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : ""}
                    </span>
                    <span>
                      {post.views} 阅读 · {post.like?.likes ?? 0} 点赞
                    </span>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-default-500 py-12">暂无文章</p>
        )}
      </section>

      {/* Tech Stack Section */}
      {techStack.length > 0 && (
        <>
          <Divider className="my-4" />
          <section>
            <h2 className="text-3xl font-bold">技术栈</h2>
            <p className="mt-2 mb-6 text-default-600">
              我熟悉并经常使用的技术和工具
            </p>
            <div className="flex flex-wrap gap-3">
              {techStack.map((skill) => (
                <Chip key={skill} color="secondary" size="lg" variant="flat">
                  {skill}
                </Chip>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
