"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";

import { listSettings } from "@/lib/api/v1/setting";
import { title, subtitle } from "@/components/common/primitives";

interface Section {
  title: string;
  content: React.ReactNode;
}

export default function PrivacyPage() {
  const [siteName, setSiteName] = useState("Nimbus Blog");
  const [siteEmail, setSiteEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSettings()
      .then((res) => {
        const map: Record<string, string> = {};

        res.forEach((s) => {
          map[s.setting_key] = s.setting_value;
        });
        setSiteName(map["site.name"] || "Nimbus Blog");
        setSiteEmail(map["profile.email"] || "");
      })
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

  const sections: Section[] = [
    {
      title: "1. 信息收集",
      content: (
        <div className="space-y-3">
          <p>在您使用 {siteName} 的过程中，我们可能会收集以下类型的信息：</p>
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>
              <strong>注册信息：</strong>
              当您注册账户时，我们会收集您提供的用户名、邮箱地址和密码。
              密码经过加密处理后存储，我们无法获取您的明文密码。
            </li>
            <li>
              <strong>个人资料：</strong>
              您可以选择性地完善个人资料，包括昵称、个人简介、
              所在地区和个人博客链接等信息。
            </li>
            <li>
              <strong>浏览数据：</strong>
              当您访问文章时，我们会记录文章的浏览次数用于统计展示。
            </li>
            <li>
              <strong>用户生成内容：</strong>
              包括您发布的文章评论和通过反馈表单提交的意见。
              评论内容需经过审核后才会公开显示。
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "2. 信息使用",
      content: (
        <div className="space-y-3">
          <p>我们收集的信息仅用于以下目的：</p>
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>
              提供和维护本站的核心服务，包括账户管理、文章展示和评论互动。
            </li>
            <li>通过站内通知系统向您推送评论回复等与您相关的消息。</li>
            <li>统计文章阅读量和互动数据，用于内容展示。</li>
            <li>处理您提交的反馈意见，改善网站体验。</li>
            <li>保障网站安全，防范恶意行为。</li>
          </ul>
        </div>
      ),
    },
    {
      title: "3. 信息存储与安全",
      content: (
        <div className="space-y-3">
          <p>我们采取以下措施保护您的信息安全：</p>
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>用户密码经过哈希加密后存储，无法被逆向还原。</li>
            <li>
              用户认证采用 JWT（JSON Web Token）机制，令牌有过期时间限制。
            </li>
            <li>网站通过 HTTPS 加密传输数据，防止中间人攻击。</li>
            <li>
              用户上传的文件存储在独立的对象存储服务中，通过临时签名链接访问。
            </li>
          </ul>
          <p>
            尽管我们尽力采取合理的安全措施，但无法保证互联网数据传输和存储的绝对安全。
          </p>
        </div>
      ),
    },
    {
      title: "4. 本地存储与 Cookie",
      content: (
        <div className="space-y-3">
          <p>本站使用以下客户端存储技术：</p>
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>
              <strong>localStorage：</strong>用于存储登录凭证（JWT
              令牌）和主题偏好（亮色/暗色模式），
              以便在您下次访问时保持登录状态和显示偏好。
            </li>
            <li>
              <strong>Cookie：</strong>管理后台使用 Session Cookie
              进行身份验证。
            </li>
          </ul>
          <p>
            您可以通过浏览器设置清除本地存储或
            Cookie，但这将导致您需要重新登录， 且主题偏好等设置会被重置。
          </p>
        </div>
      ),
    },
    {
      title: "5. 信息共享",
      content: (
        <p>
          我们不会出售、交易或以其他方式向第三方转让您的个人信息。
          仅在法律法规要求或保护本站及其用户权益的必要情况下，我们可能会按规定披露相关信息。
        </p>
      ),
    },
    {
      title: "6. 用户权利",
      content: (
        <div className="space-y-3">
          <p>您对自己的个人信息享有以下权利：</p>
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>
              <strong>查看与修改：</strong>您可以在{" "}
              <Link href="/settings" underline="hover">
                个人设置
              </Link>{" "}
              中查看和修改您的用户名、昵称、密码等账户信息。
            </li>
            <li>
              <strong>删除内容：</strong>您可以删除自己发布的评论。
            </li>
            <li>
              <strong>通知管理：</strong>
              您可以在站内通知中心查看、标记已读或删除通知消息。
            </li>
            <li>
              <strong>账户注销：</strong>如需注销账户和删除相关数据，请通过{" "}
              <Link href="/help" underline="hover">
                帮助与反馈
              </Link>{" "}
              页面联系我们。
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "7. 第三方链接",
      content: (
        <p>
          本站可能包含指向第三方网站的链接（如友情链接、文章中的外部引用等）。
          我们对这些外部网站的内容和隐私政策不承担任何责任，建议您在访问时自行查阅其隐私条款。
        </p>
      ),
    },
    {
      title: "8. 隐私政策更新",
      content: (
        <p>
          我们可能会不定期更新本隐私政策，更新后的内容将在本页面发布。
          建议您定期查阅本页面以了解最新的隐私保护措施。继续使用本站即表示您同意更新后的政策。
        </p>
      ),
    },
    {
      title: "9. 联系我们",
      content: (
        <p>
          如果您对本隐私政策有任何疑问，或希望行使上述权利，欢迎通过{" "}
          <Link href="/help" underline="hover">
            帮助与反馈
          </Link>{" "}
          页面联系我们
          {siteEmail && (
            <>
              ，或发送邮件至{" "}
              <Link href={`mailto:${siteEmail}`} underline="hover">
                {siteEmail}
              </Link>
            </>
          )}
          。
        </p>
      ),
    },
  ];

  return (
    <section className="max-w-4xl mx-auto w-full px-4 py-8">
      <div className="text-center mb-12">
        <h1 className={title({ size: "md" })}>隐私政策</h1>
        <div className={subtitle({ class: "mt-4" })}>
          了解 {siteName} 如何收集、使用和保护您的个人信息
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </CardHeader>
            <CardBody className="text-default-700 leading-relaxed">
              {section.content}
            </CardBody>
          </Card>
        ))}
      </div>

      <Divider className="my-8" />

      <div className="text-center text-sm text-default-500">
        <p>
          如有任何疑问，请通过{" "}
          <Link href="/help" size="sm" underline="hover">
            帮助与反馈
          </Link>{" "}
          页面联系我们
        </p>
      </div>
    </section>
  );
}
