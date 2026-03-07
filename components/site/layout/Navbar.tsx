"use client";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/common/utility";
import { UserAuth } from "@/components/site/auth";
import { NotificationBell } from "@/components/site/notification";
import { GithubIcon, SearchIcon } from "@/components/common/icons";
import { fetchSettingsMap } from "@/lib/api/v1/setting";

// Navbar 顶部导航栏：导航/搜索/主题切换/通知/登录入口。
export function Navbar() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const s = await fetchSettingsMap();

        if (!cancelled) setSettings(s);
      } catch {
        // Ignore 忽略错误。
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
  const siteName = settings["site.name"] || "Nimbus Blog";
  const siteSlogan = settings["site.slogan"] || "";
  const siteEmail = settings["profile.email"] || "";
  const githubURL = settings["profile.github_url"] || "";

  const searchInput = (
    <Input
      aria-label="搜索"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="搜索..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <Link
            as={NextLink}
            className="flex justify-start items-center gap-2"
            href="/"
          >
            <Image
              priority
              alt="Logo"
              className="w-10 h-10"
              height={40}
              src="/logo.png"
              width={40}
            />
            <div className="flex flex-col">
              <p className="font-bold text-inherit text-xl leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {siteName}
              </p>
              {siteSlogan && (
                <span className="text-[10px] text-default-400 leading-tight">
                  {siteSlogan}
                </span>
              )}
            </div>
          </Link>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                as={NextLink}
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          {githubURL && (
            <Link isExternal aria-label="Github" href={githubURL}>
              <GithubIcon className="text-default-500 hover:text-gray-700 dark:hover:text-white transition-colors" />
            </Link>
          )}
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100 hover:bg-default-200 transition-colors"
            href={siteConfig.links.rss}
            size="sm"
            variant="flat"
          >
            RSS订阅
          </Button>
        </NavbarItem>
        <NavbarItem>
          <NotificationBell />
        </NavbarItem>
        <NavbarItem>
          <UserAuth siteEmail={siteEmail} siteName={siteName} />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-auto pl-2" justify="end">
        <NavbarMenuToggle />
        <ThemeSwitch />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <Link as={NextLink} color="foreground" href={item.href} size="lg">
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <div className="flex gap-2 mt-4">
              <Button
                isExternal
                as={Link}
                className="text-sm font-normal text-default-600 bg-default-100 hover:bg-default-200 transition-colors flex-1"
                href={siteConfig.links.rss}
                size="sm"
                variant="flat"
              >
                RSS订阅
              </Button>
            </div>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <UserAuth
              className="w-full"
              siteEmail={siteEmail}
              siteName={siteName}
            />
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
}
