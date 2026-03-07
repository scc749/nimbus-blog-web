"use client";

import type { MDXRemoteSerializeResult } from "next-mdx-remote";

import { useState, useEffect } from "react";
import { useRef } from "react";
import { MDXRemote } from "next-mdx-remote";
import { Image } from "@heroui/image";

import { serializeMdxContent } from "@/lib/mdx/content";
import { generateHeadingId } from "@/lib/mdx/toc";
import { useMDXComponents } from "@/components/site/post";

interface MDXContentProps {
  content: string;
  source?: MDXRemoteSerializeResult | null;
}

export function MDXContent({ content, source }: MDXContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    source ?? null,
  );
  const [error, setError] = useState(false);

  const idCountsRef = useRef<Record<string, number>>({});
  const seqRef = useRef(0);
  const uniqueId = (raw: string) => {
    const base = generateHeadingId(raw);

    if (!base) {
      seqRef.current += 1;

      return `section-${seqRef.current}`;
    }
    const n = idCountsRef.current[base] ?? 0;

    idCountsRef.current[base] = n + 1;

    return n === 0 ? base : `${base}-${n}`;
  };

  useEffect(() => {
    idCountsRef.current = {};
    seqRef.current = 0;
  }, [mdxSource]);

  const headingOverrides = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = String(props.children ?? "");

      if (!text.trim()) return null;
      const id = uniqueId(text);

      return (
        <h1 className="break-words" id={id}>
          {props.children}
        </h1>
      );
    },
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = String(props.children ?? "");

      if (!text.trim()) return null;
      const id = uniqueId(text);

      return (
        <h2 className="break-words" id={id}>
          {props.children}
        </h2>
      );
    },
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = String(props.children ?? "");

      if (!text.trim()) return null;
      const id = uniqueId(text);

      return (
        <h3 className="break-words" id={id}>
          {props.children}
        </h3>
      );
    },
    h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = String(props.children ?? "");

      if (!text.trim()) return null;
      const id = uniqueId(text);

      return (
        <h4 className="break-words" id={id}>
          {props.children}
        </h4>
      );
    },
    h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = String(props.children ?? "");

      if (!text.trim()) return null;
      const id = uniqueId(text);

      return (
        <h5 className="break-words" id={id}>
          {props.children}
        </h5>
      );
    },
    h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = String(props.children ?? "");

      if (!text.trim()) return null;
      const id = uniqueId(text);

      return (
        <h6 className="break-words" id={id}>
          {props.children}
        </h6>
      );
    },
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <pre
        className="overflow-x-auto whitespace-pre-wrap break-words max-w-full w-full"
        {...props}
      />
    ),
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="overflow-x-auto max-w-full w-full">
        <table className="min-w-full max-w-full" {...props} />
      </div>
    ),
    img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <Image
        alt={props.alt ?? ""}
        className="max-w-full h-auto"
        src={props.src || ""}
      />
    ),
  };

  const components = useMDXComponents(headingOverrides);

  useEffect(() => {
    if (source) {
      setMdxSource(source);
      setError(false);

      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const serialized = await serializeMdxContent(content);

        if (!cancelled) setMdxSource(serialized);
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [content, source]);

  if (!mdxSource) {
    if (!error) {
      return (
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <div className="markdown-content animate-pulse">
            <div className="h-4 bg-default-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-default-200 rounded w-1/2 mb-4" />
            <div className="h-4 bg-default-200 rounded w-5/6" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full min-w-0 max-w-full overflow-hidden">
        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm">
          {content}
        </pre>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden">
      <div className="markdown-content w-full max-w-full min-w-0 overflow-hidden break-words">
        <MDXRemote {...mdxSource} components={components} />
      </div>
    </div>
  );
}
