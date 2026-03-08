"use client";

import type { TocItem } from "@/lib/mdx/toc";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { ScrollShadow } from "@heroui/scroll-shadow";

import { ChatIcon } from "@/components/common/icons";
import { parseTocItems } from "@/lib/mdx/toc";

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const indentClass = (level: number) => {
    const map = ["pl-3", "pl-5", "pl-7", "pl-9", "pl-11", "pl-13"];
    const idx = Math.min(Math.max(level, 1), 6) - 1;

    return map[idx];
  };

  useEffect(() => {
    setTocItems(parseTocItems(content));
  }, [content]);

  useEffect(() => {
    if (tocItems.length > 0) return;
    const container = document.querySelector(".markdown-content");

    if (!container) return;
    const nodes = Array.from(
      container.querySelectorAll("h1,h2,h3,h4,h5,h6"),
    ) as HTMLHeadingElement[];

    if (nodes.length === 0) return;
    const domItems = nodes
      .map((h) => ({
        id: h.id,
        text: h.textContent || "",
        level: Number(h.tagName[1] || 1),
      }))
      .filter((i) => i.id);

    if (domItems.length > 0) setTocItems(domItems);
  }, [tocItems]);

  useEffect(() => {
    const TOP_OFFSET = 80;
    let ticking = false;
    const getPositions = () =>
      tocItems
        .map(({ id }) => {
          const el = document.getElementById(id);
          const top = el ? el.getBoundingClientRect().top + window.scrollY : 0;

          return { id, top };
        })
        .filter((h) => h.top > 0)
        .sort((a, b) => a.top - b.top);
    let positions = getPositions();
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY + TOP_OFFSET + 1;
        let current = positions[0]?.id || "";

        for (const h of positions) {
          if (y >= h.top) current = h.id;
          else break;
        }
        if (current) setActiveId(current);
        ticking = false;
      });
    };
    const onResize = () => {
      positions = getPositions();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [tocItems]);

  useEffect(() => {
    if (!activeId) return;
    const escape =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape
        : (v: string) => v.replace(/["\\]/g, "\\$&");
    const activeEl = document.querySelector<HTMLElement>(
      `[data-desktop-toc-item="${escape(activeId)}"]`,
    );

    if (!activeEl) return;
    let scrollParent: HTMLElement | null = null;
    let parent = activeEl.parentElement;

    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY;
      const canScroll =
        (overflowY === "auto" || overflowY === "scroll") &&
        parent.scrollHeight > parent.clientHeight + 1;

      if (canScroll) {
        scrollParent = parent;
        break;
      }
      parent = parent.parentElement;
    }

    if (!scrollParent) return;
    const parentRect = scrollParent.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    const padding = 12;
    const topLimit = parentRect.top + padding;
    const bottomLimit = parentRect.bottom - padding;

    if (elRect.top < topLimit) {
      scrollParent.scrollTop -= topLimit - elRect.top;
    } else if (elRect.bottom > bottomLimit) {
      scrollParent.scrollTop += elRect.bottom - bottomLimit;
    }
  }, [activeId]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      const TOP_OFFSET = 80;
      const top =
        element.getBoundingClientRect().top + window.scrollY - TOP_OFFSET;

      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3 px-6">
        <h3 className="text-lg font-semibold">目录</h3>
      </CardHeader>
      <CardBody className="pt-0 px-6 pb-4">
        <ScrollShadow className="max-h-[56vh] xl:max-h-[calc(100vh-16rem)]">
          <nav className="space-y-1">
            {tocItems.map((item, idx) => (
              <Button
                key={`${item.id}-${idx}`}
                className={`w-full justify-start text-xs px-2 py-1 ${indentClass(item.level)} ${
                  activeId === item.id
                    ? "text-primary font-medium bg-primary/10"
                    : "text-default-600 hover:bg-default-100"
                }`}
                data-desktop-toc-item={item.id}
                variant="light"
                onPress={() => handleClick(item.id)}
              >
                <span className="truncate block leading-relaxed">
                  {item.text}
                </span>
              </Button>
            ))}
          </nav>
        </ScrollShadow>
        <Divider className="my-3" />
        <Button
          className="w-full"
          color="primary"
          size="sm"
          startContent={<ChatIcon className="w-4 h-4" />}
          variant="light"
          onPress={() => handleClick("comments")}
        >
          到评论区
        </Button>
      </CardBody>
    </Card>
  );
}
