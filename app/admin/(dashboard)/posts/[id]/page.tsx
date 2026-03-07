"use client";

import type { AdminPostDetail } from "@/lib/api/types";

import { useEffect, useState, use } from "react";
import { Spinner } from "@heroui/spinner";

import { PostForm } from "@/components/admin/posts";
import { getPost } from "@/lib/api/admin/content";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<AdminPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPost(Number(id))
      .then(setPost)
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "加载失败";

        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-danger">
        {error}
      </div>
    );
  }
  if (!post) {
    return (
      <div className="flex justify-center items-center h-64 text-default-500">
        文章不存在
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">编辑文章</h1>
      <PostForm initialData={post} postId={Number(id)} />
    </div>
  );
}
