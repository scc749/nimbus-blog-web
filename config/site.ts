export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  navItems: [
    { label: "首页", href: "/" },
    { label: "文章", href: "/blog" },
    { label: "分类", href: "/categories" },
    { label: "标签", href: "/tags" },
    { label: "归档", href: "/archive" },
    { label: "友链", href: "/links" },
    { label: "关于", href: "/about" },
  ],
  navMenuItems: [
    { label: "首页", href: "/" },
    { label: "文章", href: "/blog" },
    { label: "分类", href: "/categories" },
    { label: "标签", href: "/tags" },
    { label: "归档", href: "/archive" },
    { label: "友链", href: "/links" },
    { label: "关于", href: "/about" },
    { label: "帮助", href: "/help" },
    { label: "设置", href: "/settings" },
  ],
  links: {
    rss: "/rss.xml",
  },
};
