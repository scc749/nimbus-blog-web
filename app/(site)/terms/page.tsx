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

export default function TermsPage() {
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
      title: "1. 服务说明",
      content: (
        <p>
          {siteName} 是一个基于开源技术构建的博客平台，提供文章阅读、评论互动、
          内容订阅（RSS）等服务。本站的服务按“现状”提供，我们会尽力保障服务的稳定运行，
          但不对服务的不间断性或无错误性作任何保证。
        </p>
      ),
    },
    {
      title: "2. 用户账户",
      content: (
        <div className="space-y-3">
          <p>注册和使用本站账户时，您同意遵守以下规则：</p>
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>提供真实、准确的注册信息（用户名、邮箱地址）。</li>
            <li>妥善保管账户密码，不与他人共享登录凭证。</li>
            <li>对通过您的账户发生的所有操作负责。</li>
            <li>如发现账户被未授权使用，请及时联系我们。</li>
          </ul>
          <p>
            管理员有权在发现违规行为时对账户采取限制措施，包括暂停或禁用账户。
          </p>
        </div>
      ),
    },
    {
      title: "3. 用户行为规范",
      content: (
        <div className="space-y-3">
          <p>使用本站服务时，您不得进行以下行为：</p>
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>发布违反法律法规、侵害他人合法权益的内容。</li>
            <li>发布侮辱、诽谤、骚扰或歧视性内容。</li>
            <li>发布垃圾信息、广告或恶意推广内容。</li>
            <li>冒充他人身份或虚假陈述与任何个人或组织的关系。</li>
            <li>尝试非法访问本站系统、数据库或其他用户的账户。</li>
            <li>使用自动化工具大量抓取内容或干扰网站正常运行。</li>
            <li>上传包含恶意代码的文件。</li>
          </ul>
          <p>
            违反上述规定可能导致您的内容被删除、评论权限被限制或账户被禁用。
          </p>
        </div>
      ),
    },
    {
      title: "4. 评论与内容审核",
      content: (
        <div className="space-y-3">
          <p>
            本站对用户评论实行审核制度。您提交的评论需经管理员审核通过后才会公开显示。
            审核通过后，如果有其他用户回复了您的评论，您将收到站内通知。
          </p>
          <p>我们在使用评论功能时建议您：</p>
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>保持友善、建设性的讨论态度。</li>
            <li>尊重文章作者和其他评论者的观点。</li>
            <li>不在评论中泄露他人的个人隐私信息。</li>
          </ul>
          <p>
            管理员有权删除不符合规范的评论内容。您也可以删除自己发布的评论。
          </p>
        </div>
      ),
    },
    {
      title: "5. 知识产权",
      content: (
        <div className="space-y-3">
          <p>
            <strong>站点内容：</strong>
            本站发布的原创文章及相关素材受著作权保护。
            如需转载，请注明出处并链接到原文页面。
          </p>
          <p>
            <strong>用户内容：</strong>您保留在本站发布的评论等内容的所有权。
            通过发布内容，您授予本站在站内展示这些内容的权利。
          </p>
          <p>
            <strong>开源代码：</strong>
            {siteName} 作为开源项目，其源代码遵循对应的开源许可协议。
            部署和使用本站源代码请遵守相关许可条款。
          </p>
        </div>
      ),
    },
    {
      title: "6. 隐私保护",
      content: (
        <p>
          我们重视用户隐私。有关个人信息的收集、使用和保护方式， 请参阅我们的{" "}
          <Link href="/privacy" underline="hover">
            隐私政策
          </Link>
          。
        </p>
      ),
    },
    {
      title: "7. 免责声明",
      content: (
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>
              本站内容仅供参考和学习交流，不构成专业建议。
              我们尽力确保文章信息的准确性，但不对其完整性、时效性作任何保证。
            </li>
            <li>对于因参考本站内容而导致的任何损失，我们不承担责任。</li>
            <li>
              本站包含的第三方链接（包括友情链接和文章中的引用）仅为便利提供，
              我们对其内容和服务不承担任何责任。
            </li>
            <li>
              因不可抗力、网络故障、系统维护等原因导致的服务中断，我们将尽力恢复，
              但不承担由此产生的损失。
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "8. 条款变更",
      content: (
        <p>
          我们可能会根据服务发展和法律要求更新本使用条款，更新后的内容将在本页面发布。
          继续使用本站即表示您接受修改后的条款。如有重大变更，我们会在站内通知中告知。
        </p>
      ),
    },
    {
      title: "9. 联系方式",
      content: (
        <p>
          如果您对本使用条款有任何疑问或建议，欢迎通过{" "}
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
        <h1 className={title({ size: "md" })}>使用条款</h1>
        <div className={subtitle({ class: "mt-4" })}>
          使用 {siteName} 的服务即表示您同意以下条款
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
