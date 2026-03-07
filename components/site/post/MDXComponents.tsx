import type { MDXComponents } from "mdx/types";

import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mb-6 mt-8 text-foreground border-b-2 border-primary pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mb-4 mt-6 text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mb-3 mt-5 text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mb-2 mt-4 text-foreground">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-7 text-foreground-600">{children}</p>
    ),
    a: ({ href, children }) => (
      <Link className="underline" color="primary" href={href}>
        {children}
      </Link>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
    ),
    li: ({ children }) => <li className="text-foreground-600">{children}</li>,
    pre: ({ children }) => (
      <div className="mb-6 mt-4">
        <div className="bg-default-100 border border-default-200 rounded-lg p-4 overflow-x-auto">
          <code className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
            {children}
          </code>
        </div>
      </div>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary bg-default-50 p-4 my-6 italic">
        <div className="text-foreground-600">{children}</div>
      </blockquote>
    ),
    hr: () => <Divider className="my-8" />,
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground-600">{children}</em>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse border border-default-200">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-default-200 bg-default-100 px-4 py-2 text-left font-semibold text-foreground">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-default-200 px-4 py-2 text-foreground-600">
        {children}
      </td>
    ),
    img: ({ src, alt }) => (
      <div className="my-6">
        <Image
          alt={alt || ""}
          className="max-w-full h-auto rounded-lg shadow-md mx-auto"
          src={src || ""}
        />
        {alt && (
          <p className="text-center text-sm text-default-500 mt-2">{alt}</p>
        )}
      </div>
    ),
    ...components,
  };
}
