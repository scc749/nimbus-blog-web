"use client";

import type { LinkDetail } from "@/lib/api/types";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";

import { listLinks } from "@/lib/api/v1/link";
import { title, subtitle } from "@/components/common/primitives";
import { resolveImageURL } from "@/lib/api/v1/file";
import { TruncatedText } from "@/components/common/utility";

export default function LinksPage() {
  const [links, setLinks] = useState<LinkDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLinks()
      .then(setLinks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className={title({ size: "md" })}>友情链接</h1>
        <div className={subtitle({ class: "mt-4" })}>
          感谢这些优秀的网站与博客，让我们一起分享知识与灵感
        </div>
      </div>

      {links.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <Card
              key={link.id}
              className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <CardBody className="p-5">
                <Link
                  isExternal
                  className="flex items-center gap-4 text-foreground"
                  href={link.url}
                >
                  <Avatar
                    className="shrink-0"
                    name={link.name}
                    size="lg"
                    src={link.logo ? resolveImageURL(link.logo) : undefined}
                  />
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">
                      <TruncatedText className="truncate" text={link.name} />
                    </h3>
                    {link.description && (
                      <TruncatedText
                        multiLine
                        className="text-sm text-default-500 line-clamp-2 mt-1"
                        text={link.description}
                      />
                    )}
                  </div>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-default-500 text-lg">暂无友情链接</p>
        </div>
      )}
    </section>
  );
}
