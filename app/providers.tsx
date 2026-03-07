"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter, usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { UserAuthProvider, NotificationProvider } from "@/context";
import { fetchSettingsMap } from "@/lib/api/v1/setting";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const skipTitle = pathname?.startsWith("/post/");

    (async () => {
      try {
        const settings = await fetchSettingsMap().catch(
          () => ({}) as Record<string, string>,
        );
        const title = settings["site.title"] || settings["site.name"];

        if (!skipTitle && title) {
          document.title = title;
        }
        const desc = settings["site.description"] || "";

        if (desc) {
          const meta = document.querySelector('meta[name="description"]');

          if (meta) {
            meta.setAttribute("content", desc);
          } else {
            const m = document.createElement("meta");

            m.setAttribute("name", "description");
            m.setAttribute("content", desc);
            document.head.appendChild(m);
          }
        }
      } catch {}
    })();
  }, [pathname]);

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        {pathname?.startsWith("/admin") ? (
          children
        ) : (
          <UserAuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </UserAuthProvider>
        )}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
