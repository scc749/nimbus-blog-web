"use client";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";
import { fetchSettingsMap } from "@/lib/api/v1/setting";
import {
  GithubIcon,
  BilibiliIcon,
  QQIcon,
  HeartFilledIcon,
} from "@/components/common/icons";

// Footer 页脚：版权信息、社交链接、法务与备案信息。
export function Footer() {
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
  const currentYear = new Date().getFullYear();
  const siteName = settings["site.name"] || "Nimbus Blog";
  const siteDescription = settings["site.description"] || "";
  const authorName = settings["profile.name"] || siteName;
  const githubURL = settings["profile.github_url"] || "";
  const bilibiliURL = settings["profile.bilibili_url"] || "";
  const qqGroupURL = settings["profile.qq_group_url"] || "";
  const siteEmail = settings["profile.email"] || "";
  const icpRecord = settings["site.icp_record"] || "";
  const policeRecord = settings["site.police_record"] || "";
  const policeCode = policeRecord.replace(/\D/g, "");

  return (
    <footer className="w-full border-t border-divider bg-background/60 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-foreground">{siteName}</h3>
              <Chip color="primary" size="sm" variant="flat">
                Blog
              </Chip>
            </div>
            {siteDescription && (
              <p className="text-default-600 text-sm mb-4 max-w-md">
                {siteDescription}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-600">关注我们:</span>
              <div className="flex gap-2">
                {githubURL && (
                  <Button
                    isExternal
                    isIconOnly
                    as={Link}
                    href={githubURL}
                    size="sm"
                    variant="light"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </Button>
                )}
                {bilibiliURL && (
                  <Button
                    isExternal
                    isIconOnly
                    as={Link}
                    href={bilibiliURL}
                    size="sm"
                    variant="light"
                  >
                    <BilibiliIcon className="w-4 h-4" />
                  </Button>
                )}
                {qqGroupURL && (
                  <Button
                    isExternal
                    isIconOnly
                    as={Link}
                    href={qqGroupURL}
                    size="sm"
                    variant="light"
                  >
                    <QQIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              快速导航
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              {siteConfig.navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-sm text-default-600 hover:text-foreground transition-colors"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">支持</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-sm text-default-600 hover:text-foreground transition-colors"
                  href={siteConfig.links.rss}
                >
                  RSS 订阅
                </Link>
              </li>
              <li>
                <Link
                  className="text-sm text-default-600 hover:text-foreground transition-colors"
                  href="/help"
                >
                  帮助与反馈
                </Link>
              </li>
              {siteEmail && (
                <li>
                  <Link
                    className="text-sm text-default-600 hover:text-foreground transition-colors"
                    href={`mailto:${siteEmail}`}
                  >
                    联系邮箱
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <Divider className="my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-default-600">
            <span>
              © {currentYear} {siteName}.
            </span>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <HeartFilledIcon className="w-4 h-4 text-red-500" />
              <span>by {authorName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-default-600 w-full md:w-auto justify-center md:justify-end">
            <Link
              className="hover:text-foreground transition-colors"
              href="/privacy"
            >
              隐私政策
            </Link>
            <Link
              className="hover:text-foreground transition-colors"
              href="/terms"
            >
              使用条款
            </Link>
            {icpRecord && (
              <Link
                isExternal
                className="hover:text-foreground transition-colors break-all"
                href="https://beian.miit.gov.cn/"
              >
                {icpRecord}
              </Link>
            )}
            {policeRecord && (
              <Link
                isExternal
                className="hover:text-foreground transition-colors break-all"
                href={`https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${policeCode}`}
              >
                {policeRecord}
              </Link>
            )}
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <Link
                isExternal
                className="text-primary hover:text-primary-600 transition-colors"
                href="https://heroui.com"
              >
                HeroUI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
