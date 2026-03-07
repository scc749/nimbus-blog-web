"use client";

import { PostForm } from "@/components/admin/posts";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-2xl font-bold">新建文章</h1>
      <PostForm />
    </div>
  );
}
