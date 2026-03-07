"use client";

import type { CommentBasic } from "@/lib/api/types";

import { useEffect, useState, useCallback } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Link } from "@heroui/link";

import { HeartIcon, ChatIcon } from "@/components/common/icons";
import { useUserAuth } from "@/context";
import {
  listComments,
  submitComment,
  toggleCommentLike,
  removeCommentLike,
  deleteComment,
} from "@/lib/api/v1/comment";

const PAGE_SIZE = 10;

interface CommentsProps {
  postId: number;
}

interface CommentNode extends CommentBasic {
  replies: CommentNode[];
}

function buildThread(flat: CommentBasic[]): CommentNode[] {
  const nodes: CommentNode[] = flat.map((c) => ({ ...c, replies: [] }));
  const byId = new Map<number, CommentNode>();

  nodes.forEach((n) => byId.set(n.id, n));

  const roots: CommentNode[] = [];

  nodes.forEach((n) => {
    if (n.parent_id && byId.has(n.parent_id)) {
      byId.get(n.parent_id)!.replies.push(n);
    } else {
      roots.push(n);
    }
  });

  return roots;
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "刚刚";
  if (diffHours < 24) return `${diffHours} 小时前`;
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) return `${diffDays} 天前`;

  return date.toLocaleDateString("zh-CN");
}

function CommentForm({
  onSubmit,
  parentId,
  onCancel,
}: {
  onSubmit: (content: string, parentId?: number) => Promise<void>;
  parentId?: number;
  onCancel?: () => void;
}) {
  const { user } = useUserAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(content, parentId);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-4 border border-default-200/70 shadow-none">
      <CardHeader className="pb-1">
        <h4 className="text-base font-semibold">
          {parentId ? "回复评论" : "发表评论"}
        </h4>
      </CardHeader>
      <CardBody className="pt-2">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <Avatar
              alt={user?.name || "用户"}
              name={user?.name || "用户"}
              size="sm"
              src={user?.avatar || "/avatar.png"}
            />
            <span className="text-sm text-default-600">{user?.name || ""}</span>
          </div>
          <Textarea
            isRequired
            classNames={{
              input: "text-sm leading-6",
            }}
            label="评论内容"
            maxLength={5000}
            minRows={4}
            placeholder="请输入您的评论..."
            value={content}
            onValueChange={setContent}
          />
          <div className="flex gap-2 justify-end">
            {parentId && (
              <Button variant="light" onPress={onCancel}>
                取消
              </Button>
            )}
            <Button
              color="primary"
              isDisabled={!content.trim()}
              isLoading={submitting}
              type="submit"
            >
              {parentId ? "回复" : "发表评论"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function UserProfilePopover({
  profile,
  fallbackName,
}: {
  profile: CommentNode["user_profile"];
  fallbackName: string;
}) {
  const name = profile?.name || fallbackName;
  const avatar = profile?.avatar || "/avatar.png";
  const bio =
    profile?.bio?.trim() && profile.bio.trim() !== "该用户尚未填写个人简介。"
      ? profile.bio.trim()
      : "该用户尚未填写个人简介。";
  const region = profile?.region?.trim();
  const status = profile?.status || "unknown";

  return (
    <Popover showArrow placement="right-start">
      <PopoverTrigger>
        <button className="flex items-center gap-2 rounded-lg px-1 py-1 -ml-1 hover:bg-default-100 transition-colors">
          <Avatar alt={name} name={name} size="sm" src={avatar} />
          <div className="min-w-0 text-left">
            <div className="text-sm font-semibold truncate">{name}</div>
            <div className="text-xs text-default-500 truncate">{bio}</div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Card className="w-full border-none shadow-none">
          <CardBody className="gap-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar alt={name} name={name} size="md" src={avatar} />
              <div className="min-w-0">
                <div className="font-semibold">{name}</div>
                <div className="text-xs text-default-500">
                  {status === "active" ? "活跃用户" : "非活跃用户"}
                </div>
              </div>
            </div>
            <p className="text-sm text-default-700 leading-6 whitespace-pre-wrap break-words">
              {bio}
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip
                color={status === "active" ? "success" : "default"}
                size="sm"
                variant="flat"
              >
                {status}
              </Chip>
              {region && (
                <Chip size="sm" variant="flat">
                  {region}
                </Chip>
              )}
            </div>
            {(profile?.blog_url || profile?.email) && (
              <div className="space-y-1 text-xs">
                {profile.blog_url && (
                  <Link
                    isExternal
                    className="truncate max-w-full block"
                    href={profile.blog_url}
                    size="sm"
                  >
                    {profile.blog_url}
                  </Link>
                )}
                {profile.email && (
                  <div className="text-default-500 truncate">
                    {profile.email}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

function CommentItem({
  comment,
  onReply,
  onLike,
  onDelete,
}: {
  comment: CommentNode;
  onReply: (content: string, parentId?: number) => Promise<void>;
  onLike: (commentId: number, currentlyLiked: boolean | null) => void;
  onDelete: (commentId: number) => void;
}) {
  const { user } = useUserAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [repliesCollapsed, setRepliesCollapsed] = useState(false);

  const handleReply = async (content: string) => {
    await onReply(content, comment.id);
    setShowReplyForm(false);
  };

  return (
    <div className="space-y-3" id={`comment-${comment.id}`}>
      <Card className="border border-default-200/70 shadow-none">
        <CardBody className="p-4 md:p-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <UserProfilePopover
                fallbackName="匿名"
                profile={comment.user_profile}
              />
              <div className="text-xs text-default-500 whitespace-nowrap pt-1">
                {formatRelativeTime(comment.created_at)}
              </div>
            </div>
            <p className="text-sm leading-7 text-default-800 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {comment.replies_count > 0 && (
                <Chip size="sm" variant="flat">
                  {comment.replies_count} 条回复
                </Chip>
              )}
              <div className="ml-auto flex flex-wrap items-center gap-1">
                <Button
                  className="text-xs"
                  isDisabled={!user}
                  size="sm"
                  startContent={
                    <HeartIcon
                      className={comment.like.liked ? "text-danger" : ""}
                      size={16}
                    />
                  }
                  variant="light"
                  onPress={() => onLike(comment.id, comment.like.liked)}
                >
                  {comment.like.likes}
                </Button>
                <Button
                  className="text-xs"
                  isDisabled={!user}
                  size="sm"
                  startContent={<ChatIcon size={15} />}
                  variant="light"
                  onPress={() => setShowReplyForm(!showReplyForm)}
                >
                  {user ? "回复" : "登录后才能回复"}
                </Button>
                {comment.replies.length > 0 && (
                  <Button
                    className="text-xs"
                    size="sm"
                    variant="light"
                    onPress={() => setRepliesCollapsed(!repliesCollapsed)}
                  >
                    {repliesCollapsed
                      ? `展开子评论 (${comment.replies.length})`
                      : "收起子评论"}
                  </Button>
                )}
                {user?.id && comment.user_id === user.id && (
                  <Button
                    className="text-xs"
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => onDelete(comment.id)}
                  >
                    删除
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {showReplyForm && (
        <div className="ml-4 border-l-2 border-primary-100 pl-4 md:ml-6 md:pl-5">
          <CommentForm
            parentId={comment.id}
            onCancel={() => setShowReplyForm(false)}
            onSubmit={handleReply}
          />
        </div>
      )}

      {comment.replies.length > 0 && !repliesCollapsed && (
        <div className="ml-4 border-l-2 border-default-200 pl-4 md:ml-6 md:pl-5 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onDelete={onDelete}
              onLike={onLike}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Comments({ postId }: CommentsProps) {
  const { user } = useUserAuth();
  const [allRoots, setAllRoots] = useState<CommentNode[]>([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [pendingNotice, setPendingNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const flat = await listComments(postId);
      const roots = buildThread(flat);

      setAllRoots(roots);
      setTotalCount(flat.length);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const totalPages = Math.max(1, Math.ceil(allRoots.length / PAGE_SIZE));
  const pagedRoots = allRoots.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (content: string, parentId?: number) => {
    if (!user?.id) return;
    await submitComment(postId, {
      content,
      parent_id: parentId ?? null,
    });
    setPendingNotice(true);
    if (!parentId) setShowCommentForm(true);
  };

  const handleLike = (commentId: number, currentlyLiked: boolean | null) => {
    (async () => {
      try {
        if (currentlyLiked) {
          await removeCommentLike(commentId);
        } else {
          await toggleCommentLike(commentId);
        }
        await fetchComments();
      } catch {
        // ignore
      }
    })();
  };

  const handleDelete = (commentId: number) => {
    (async () => {
      try {
        await deleteComment(commentId);
        await fetchComments();
      } catch {
        // ignore
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold">评论</h3>
          <Chip color="primary" size="sm" variant="flat">
            {totalCount} 条评论
          </Chip>
        </div>
        <Button
          color="primary"
          isDisabled={!user}
          variant={showCommentForm ? "light" : "solid"}
          onPress={() => setShowCommentForm(!showCommentForm)}
        >
          {showCommentForm ? "取消" : user ? "写评论" : "登录后才能评论"}
        </Button>
      </div>

      {pendingNotice && (
        <Card className="border-warning-200 dark:border-warning-500/30 border">
          <CardBody className="py-3 text-sm text-warning-700 dark:text-warning-400">
            您的评论已提交成功，待管理员审核通过后将公开显示。
          </CardBody>
        </Card>
      )}

      {showCommentForm && (
        <CommentForm
          onCancel={() => setShowCommentForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      <Divider />

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-default-500">加载中...</p>
          </div>
        ) : pagedRoots.length > 0 ? (
          pagedRoots.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              onLike={handleLike}
              onReply={handleSubmit}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-default-500">暂无评论，快来发表第一条评论吧！</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            showControls
            page={page}
            total={totalPages}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
