"use client";

import type { AdminPostSummary, CommentDetail } from "@/lib/api/types";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import NextLink from "next/link";

import { listPosts } from "@/lib/api/admin/content";
import { listComments } from "@/lib/api/admin/comment";
import { listUsers } from "@/lib/api/admin/user";
import { listLinks } from "@/lib/api/admin/link";
import { listFeedbacks } from "@/lib/api/admin/feedback";
import {
  DocIcon,
  ChatIcon,
  LinkIcon,
  SettingsIcon,
  PlusIcon,
  UserIcon,
} from "@/components/common/icons";
import { TruncatedText } from "@/components/common/utility";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    posts: { total: number; items: AdminPostSummary[] };
    comments: { total: number; items: CommentDetail[] };
    users: { total: number };
    links: { total: number };
    feedbacks: { total: number };
  }>({
    posts: { total: 0, items: [] },
    comments: { total: 0, items: [] },
    users: { total: 0 },
    links: { total: 0 },
    feedbacks: { total: 0 },
  });

  useEffect(() => {
    (async () => {
      try {
        const [posts, comments, users, links, feedbacks] = await Promise.all([
          listPosts({ page: 1, page_size: 5 }),
          listComments({ page: 1, page_size: 5 }),
          listUsers({ page: 1, page_size: 1 }),
          listLinks({ page: 1, page_size: 1 }),
          listFeedbacks({ page: 1, page_size: 1, status: "pending" }),
        ]);

        setData({
          posts: { total: posts.total_items, items: posts.list },
          comments: { total: comments.total_items, items: comments.list },
          users: { total: users.total_items },
          links: { total: links.total_items },
          feedbacks: { total: feedbacks.total_items },
        });
      } catch (e: unknown) {
        const err = e as { status?: number };

        if (err?.status === 401 || err?.status === 403) {
          router.push("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">仪表盘</h1>
          <p className="text-default-500">欢迎回来，这里是您的博客概况。</p>
        </div>
        <Button
          as={NextLink}
          color="primary"
          href="/admin/posts/new"
          startContent={<PlusIcon size={20} />}
        >
          发布文章
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "总文章",
            value: data.posts.total,
            icon: DocIcon,
            color: "primary",
          },
          {
            label: "总评论",
            value: data.comments.total,
            icon: ChatIcon,
            color: "secondary",
          },
          {
            label: "总用户",
            value: data.users.total,
            icon: UserIcon,
            color: "success",
          },
          {
            label: "友链",
            value: data.links.total,
            icon: LinkIcon,
            color: "warning",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className={`bg-${s.color}-50 dark:bg-${s.color}-900/20`}
          >
            <CardBody className="flex flex-row items-center gap-3 overflow-hidden">
              <div
                className={`p-2 bg-${s.color}/10 rounded-lg text-${s.color}`}
              >
                <s.icon size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-default-500 text-sm">{s.label}</span>
                <span className="text-2xl font-semibold">{s.value}</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center px-4 py-3">
              <span className="font-semibold text-lg">最近文章</span>
              <Link as={NextLink} href="/admin/posts" size="sm">
                查看全部
              </Link>
            </CardHeader>
            <CardBody className="px-2 pb-2">
              <Table removeWrapper aria-label="Recent posts">
                <TableHeader>
                  <TableColumn>标题</TableColumn>
                  <TableColumn>状态</TableColumn>
                  <TableColumn>日期</TableColumn>
                </TableHeader>
                <TableBody emptyContent="暂无文章">
                  {data.posts.items.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Link
                          as={NextLink}
                          className="max-w-xs block"
                          color="foreground"
                          href={`/admin/posts/${post.id}`}
                        >
                          <TruncatedText
                            className="truncate"
                            text={post.title}
                          />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={
                            post.status === "published" ? "success" : "default"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {post.status}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-default-400 text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          {/* Recent Comments */}
          <Card>
            <CardHeader className="flex justify-between items-center px-4 py-3">
              <span className="font-semibold text-lg">最新评论</span>
              <Link as={NextLink} href="/admin/comments" size="sm">
                查看全部
              </Link>
            </CardHeader>
            <CardBody className="px-2 pb-2">
              <Table removeWrapper aria-label="Recent comments">
                <TableHeader>
                  <TableColumn>用户</TableColumn>
                  <TableColumn>内容</TableColumn>
                  <TableColumn>状态</TableColumn>
                </TableHeader>
                <TableBody emptyContent="暂无评论">
                  {data.comments.items.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <User
                          avatarProps={{
                            src: c.user_profile?.avatar || "/avatar.png",
                            size: "sm",
                            name: c.user_profile?.name?.charAt(0).toUpperCase(),
                          }}
                          description={c.user_profile?.email}
                          name={c.user_profile?.name || "匿名"}
                        />
                      </TableCell>
                      <TableCell>
                        <TruncatedText
                          className="truncate max-w-xs text-default-600 text-sm"
                          text={c.content}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={
                            c.status === "approved"
                              ? "success"
                              : c.status === "pending"
                                ? "warning"
                                : "danger"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {c.status}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="font-semibold text-lg px-4 py-3">
              快捷操作
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-3 p-4">
              <Button
                as={NextLink}
                color="primary"
                href="/admin/posts/new"
                startContent={<PlusIcon />}
                variant="flat"
              >
                写文章
              </Button>
              <Button
                as={NextLink}
                color="default"
                href="/admin/settings"
                startContent={<SettingsIcon />}
                variant="flat"
              >
                设置
              </Button>
              <Button
                as={NextLink}
                color="warning"
                href="/admin/links"
                startContent={<LinkIcon />}
                variant="flat"
              >
                友链
              </Button>
              <Button
                as={NextLink}
                color="danger"
                href="/admin/feedbacks"
                startContent={<ChatIcon />}
                variant="flat"
              >
                反馈
              </Button>
            </CardBody>
          </Card>

          <Card className="bg-content1">
            <CardHeader className="font-semibold text-lg px-4 py-3">
              待处理反馈
            </CardHeader>
            <CardBody className="flex flex-col items-center justify-center py-8">
              <span className="text-5xl font-bold text-primary">
                {data.feedbacks.total}
              </span>
              <span className="text-default-500 mt-2">条未处理</span>
              <Button
                as={NextLink}
                className="mt-4"
                color="primary"
                href="/admin/feedbacks"
                size="sm"
                variant="light"
              >
                去处理
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
