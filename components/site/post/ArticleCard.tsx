"use client";

import type { V1PostSummary } from "@/lib/api/types";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

import { HeartIcon } from "@/components/common/icons";
import { TruncatedText } from "@/components/common/utility";
import { useUserAuth } from "@/context";
import { togglePostLike, removePostLike } from "@/lib/api/v1/content";
import { resolveImageURL } from "@/lib/api/v1/file";

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ArticleCardProps {
  post: V1PostSummary;
  activeTagName?: string;
  activeCategoryId?: number;
}

export function ArticleCard({
  post,
  activeTagName,
  activeCategoryId,
}: ArticleCardProps) {
  const { user } = useUserAuth();
  const [likes, setLikes] = useState(post.like.likes);
  const [likedByMe, setLikedByMe] = useState(post.like.liked === true);

  useEffect(() => {
    setLikes(post.like.likes);
    setLikedByMe(post.like.liked === true);
  }, [post.like]);

  const handleLike = () => {
    (async () => {
      try {
        const res = likedByMe
          ? await removePostLike(post.id)
          : await togglePostLike(post.id);

        setLikedByMe(!!res.liked);
        setLikes(res.likes ?? 0);
      } catch {
        // ignore
      }
    })();
  };

  const coverImage = post.featured_image
    ? resolveImageURL(post.featured_image)
    : "/no_cover_yet.png";

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 w-full">
          <div className="relative w-full aspect-video mb-3 rounded-lg overflow-hidden">
            <img
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
              decoding="async"
              loading="lazy"
              src={coverImage}
            />
          </div>

          <div className="flex items-start justify-between">
            {post.category && (
              <Chip
                color={
                  activeCategoryId === post.category.id
                    ? "primary"
                    : "secondary"
                }
                size="sm"
                variant={
                  activeCategoryId === post.category.id ? "solid" : "flat"
                }
              >
                {post.category.name}
              </Chip>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-default-500">
                {post.views || 0} 次阅读
              </span>
              <Button
                className="text-xs"
                isDisabled={!user}
                size="sm"
                startContent={
                  <HeartIcon className={likedByMe ? "text-red-500" : ""} />
                }
                variant="light"
                onPress={handleLike}
              >
                {likes}
              </Button>
            </div>
          </div>

          <Link
            className="block text-xl font-bold leading-7 text-foreground hover:text-primary transition-colors line-clamp-2 min-h-14"
            href={`/post/${post.slug}`}
          >
            {post.title}
          </Link>

          <div className="flex items-center gap-3 text-sm text-default-500">
            {post.author?.nickname && (
              <>
                <span>{post.author.nickname}</span>
                <span>•</span>
              </>
            )}
            <span>{formatDate(post.published_at)}</span>
            {post.read_time && (
              <>
                <span>•</span>
                <span>{post.read_time}</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-0 flex flex-col">
        <TruncatedText
          multiLine
          className="text-default-600 leading-6 line-clamp-2 min-h-12 mb-4"
          text={post.excerpt}
        />

        <div className="flex flex-wrap content-start gap-2 min-h-[3.5rem] max-h-[3.5rem] overflow-hidden mb-4">
          {post.tags?.map((tag) => {
            const isActive = activeTagName === tag.name;

            return (
              <Chip
                key={tag.slug}
                color={
                  isActive ? "primary" : activeTagName ? "default" : "primary"
                }
                size="sm"
                variant={
                  isActive ? "solid" : activeTagName ? "bordered" : "flat"
                }
              >
                {tag.name}
              </Chip>
            );
          })}
        </div>

        <div className="mt-auto flex justify-between items-center">
          <Link
            className="text-primary hover:text-primary-600 text-sm font-medium"
            href={`/post/${post.slug}`}
          >
            阅读全文 →
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
