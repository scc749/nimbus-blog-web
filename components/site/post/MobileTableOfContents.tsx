"use client";

import type { IconSvgProps } from "@/types";
import type { TocItem } from "@/lib/mdx/toc";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";

import { ChatIcon } from "@/components/common/icons";
import { parseTocItems } from "@/lib/mdx/toc";

const ChevronDownIcon = (props: IconSvgProps) => (
  <svg
    fill="none"
    height="1em"
    stroke="currentColor"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M19 9l-7 7-7-7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const ChevronUpIcon = (props: IconSvgProps) => (
  <svg
    fill="none"
    height="1em"
    stroke="currentColor"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M5 15l7-7 7 7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

interface MobileTableOfContentsProps {
  content: string;
}

export function MobileTableOfContents({ content }: MobileTableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const indentClass = (level: number) => {
    const map = ["pl-2", "pl-4", "pl-6", "pl-8", "pl-10", "pl-12"];
    const idx = Math.min(Math.max(level, 1), 6) - 1;

    return map[idx];
  };

  useEffect(() => {
    setTocItems(parseTocItems(content));
  }, [content]);

  useEffect(() => {
    const elements = tocItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top,
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);

          return;
        }

        const scrollTop = window.scrollY + 120;
        const sorted = tocItems
          .map(({ id }) => {
            const el = document.getElementById(id);

            return { id, top: el?.offsetTop || 0 };
          })
          .filter((h) => h.top > 0)
          .sort((a, b) => a.top - b.top);

        let current = sorted[0]?.id || "";

        for (const h of sorted) {
          if (scrollTop >= h.top) current = h.id;
          else break;
        }
        if (current) setActiveId(current);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: [0, 0.1, 0.5, 1] },
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [tocItems]);

  useEffect(() => {
    if (!isOpen || !activeId) return;
    const escape =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape
        : (v: string) => v.replace(/["\\]/g, "\\$&");
    const activeEl = document.querySelector<HTMLElement>(
      `[data-mobile-toc-item="${escape(activeId)}"]`,
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
  }, [activeId, isOpen]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <div className="lg:hidden mb-4 mx-2">
      <Card>
        <CardHeader className="pb-2 px-4">
          <Button
            className="w-full justify-between p-0 h-auto"
            variant="light"
            onPress={() => setIsOpen(!isOpen)}
          >
            <h3 className="text-base font-semibold">目录</h3>
            {isOpen ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </Button>
        </CardHeader>
        {isOpen && (
          <CardBody className="pt-0 px-4 pb-3">
            <nav className="space-y-0.5 max-h-60 overflow-y-auto">
              {tocItems.map((item, idx) => (
                <Button
                  key={`${item.id}-${idx}`}
                  className={`w-full justify-start text-xs px-2 py-1.5 ${indentClass(item.level)} ${
                    activeId === item.id
                      ? "text-primary font-medium bg-primary/10"
                      : "text-default-600 hover:bg-default-100"
                  }`}
                  data-mobile-toc-item={item.id}
                  variant="light"
                  onPress={() => handleClick(item.id)}
                >
                  <span className="truncate block leading-relaxed">
                    {item.text}
                  </span>
                </Button>
              ))}
            </nav>
          </CardBody>
        )}
      </Card>
      <Button
        className="w-full mt-3"
        color="primary"
        size="sm"
        startContent={<ChatIcon className="w-4 h-4" />}
        variant="light"
        onPress={() => handleClick("comments")}
      >
        到评论区
      </Button>
    </div>
  );
}
