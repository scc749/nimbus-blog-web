"use client";

import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { SiteSettingDetail, V1PostDetail } from "@/lib/api/types";

import { useEffect, useState, use, useCallback, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";

import { title, subtitle } from "@/components/common/primitives";
import {
  MDXContent,
  TableOfContents,
  MobileTableOfContents,
  Comments,
} from "@/components/site/post";
import { ScrollToTopButton } from "@/components/common/utility";
import { HeartIcon } from "@/components/common/icons";
import { useUserAuth } from "@/context";
import { getPost, togglePostLike, removePostLike } from "@/lib/api/v1/content";
import { listSettings } from "@/lib/api/v1/setting";
import { resolveImageURL } from "@/lib/api/v1/file";
import { normalizeMdxContent, serializeMdxContent } from "@/lib/mdx/content";

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useUserAuth();

  const [post, setPost] = useState<V1PostDetail | null>(null);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null,
  );
  const [settings, setSettings] = useState<SiteSettingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const getSetting = useCallback(
    (key: string) =>
      settings.find((s) => s.setting_key === key)?.setting_value || "",
    [settings],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [postData, settingsData] = await Promise.all([
          getPost(slug),
          listSettings().catch(() => []),
        ]);

        if (cancelled) return;

        setPost(postData);
        setSettings(settingsData);
        setLikeCount(postData.like?.likes ?? 0);
        setLiked(postData.like?.liked === true);

        try {
          const serialized = await serializeMdxContent(postData.content);

          if (!cancelled) setMdxSource(serialized);
        } catch {
          // fallback to raw content
        }
      } catch {
        // post not found
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const siteName = getSetting("site.name") || getSetting("site.title");
    const pageTitle = siteName ? `${siteName}-${post.title}` : post.title;

    if (pageTitle) document.title = pageTitle;
  }, [getSetting, post]);

  const handleLike = async () => {
    if (!post || !user) return;
    try {
      const res = liked
        ? await removePostLike(post.id)
        : await togglePostLike(post.id);

      setLiked(res.liked === true);
      setLikeCount(res.likes);
    } catch {
      // ignore
    }
  };

  const normalizedContent = useMemo(
    () => normalizeMdxContent(post?.content || ""),
    [post?.content],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return <div className="text-center py-20 text-default-500">文章不存在</div>;
  }

  const profileName = getSetting("profile.name");
  const profileAvatar = getSetting("profile.avatar");

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-3 sm:mb-4 px-1 sm:px-0">
          <Button
            as={Link}
            className="text-xs sm:text-sm"
            color="primary"
            href="/blog"
            size="sm"
            variant="light"
          >
            ← 返回文章列表
          </Button>
        </div>

        <div className="mb-4 sm:mb-6 px-1 sm:px-0">
          <h1
            className={title({
              size: "sm",
              fullWidth: true,
              class:
                "text-xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 md:mb-6 lg:mb-8 leading-tight text-center",
            })}
          >
            {post.title}
          </h1>
          <p
            className={subtitle({
              class:
                "mb-3 sm:mb-4 text-sm sm:text-base md:text-lg leading-relaxed text-center mx-auto",
            })}
          >
            {post.excerpt}
          </p>
          <div className="flex items-center gap-2">
            <Chip
              className="text-xs"
              color="secondary"
              size="sm"
              variant="flat"
            >
              {post.category?.name || "文章"}
            </Chip>
          </div>
        </div>

        <Card className="mb-6 sm:mb-8 mx-1 sm:mx-0">
          <CardBody className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar
                  alt="作者"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                  name={post.author?.nickname || profileName}
                  size="sm"
                  src={resolveImageURL(profileAvatar) || "/author.png"}
                />
                <div>
                  <p className="font-semibold text-xs sm:text-sm">
                    {post.author?.nickname || "作者"}
                  </p>
                  <p className="text-xs text-default-500">
                    {post.author?.specialization || "技术博主"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-default-500 flex-wrap">
                <span>{formatDate(post.published_at)}</span>
                <span className="hidden sm:inline">•</span>
                <span>{post.read_time || ""}</span>
                <span className="hidden sm:inline">•</span>
                <span>{post.views || 0} 次阅读</span>
                <Button
                  className="text-xs"
                  isDisabled={!user}
                  size="sm"
                  startContent={
                    <HeartIcon className={liked ? "text-red-500" : ""} />
                  }
                  variant="light"
                  onPress={handleLike}
                >
                  {likeCount}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 px-1 sm:px-0">
            {post.tags.map((tag) => (
              <Chip
                key={tag.slug}
                className="text-xs"
                color="primary"
                size="sm"
                variant="flat"
              >
                {tag.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="px-1 sm:px-0 mb-4 sm:mb-6">
        <MobileTableOfContents content={normalizedContent} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 min-w-0 lg:max-w-4xl overflow-hidden">
          <Card className="mb-6 sm:mb-8 mx-1 sm:mx-0 overflow-hidden">
            <CardBody className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-hidden">
              <div className="w-full max-w-full overflow-hidden break-words">
                <MDXContent content={normalizedContent} source={mdxSource} />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="hidden lg:block lg:w-64 xl:w-72 lg:flex-shrink-0 lg:sticky lg:top-20 lg:self-start lg:h-fit">
          <TableOfContents content={normalizedContent} />
        </div>
      </div>

      <Divider className="my-8" />

      <div className="mb-8" id="comments">
        <Comments postId={post.id} />
      </div>

      <Divider className="my-8" />

      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <ScrollToTopButton />
        <Button
          as={Link}
          className="w-full sm:w-auto"
          color="primary"
          href="/blog"
          variant="solid"
        >
          浏览更多文章
        </Button>
      </div>
    </div>
  );
}
