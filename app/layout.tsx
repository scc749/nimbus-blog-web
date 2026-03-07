import "@/styles/globals.css";
import "@/styles/markdown.css";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = "Nimbus Blog";
  const siteDescription = "现代化个人博客";

  return {
    title: {
      default: siteTitle,
      template: `%s - ${siteTitle}`,
    },
    description: siteDescription,
    icons: {
      icon: "/logo.png",
    },
    alternates: {
      types: {
        "application/rss+xml": siteConfig.links.rss,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="zh-CN">
      <head />
      <body className="min-h-screen">
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
