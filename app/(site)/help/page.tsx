"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";

import { listSettings } from "@/lib/api/v1/setting";
import { submitFeedback } from "@/lib/api/v1/feedback";
import { GithubIcon } from "@/components/common/icons";
import { title, subtitle } from "@/components/common/primitives";

const feedbackTypes = [
  { key: "general", label: "一般反馈" },
  { key: "bug", label: "Bug 报告" },
  { key: "feature", label: "功能建议" },
  { key: "ui", label: "UI/UX 改进" },
];

export default function HelpPage() {
  const [faq, setFaq] = useState<{ title: string; content: string }[]>([]);
  const [loadingFaq, setLoadingFaq] = useState(true);
  const [githubURL, setGithubURL] = useState("");
  const [siteEmail, setSiteEmail] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "general",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    listSettings()
      .then((res) => {
        const map: Record<string, string> = {};

        res.forEach((s) => {
          map[s.setting_key] = s.setting_value;
        });
        setGithubURL(map["profile.github_url"] || "");
        setSiteEmail(map["profile.email"] || "");
        try {
          const arr = map["site.faq"] ? JSON.parse(map["site.faq"]) : [];

          setFaq(
            Array.isArray(arr)
              ? arr
                  .filter(
                    (x: { title?: string; content?: string }) =>
                      x?.title || x?.content,
                  )
                  .map((x: { title?: string; content?: string }) => ({
                    title: x?.title ?? "",
                    content: x?.content ?? "",
                  }))
              : [],
          );
        } catch {
          setFaq([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingFaq(false));
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.name.trim()) e.name = "姓名不能为空";
    else if (form.name.length > 50) e.name = "姓名不能超过50个字符";
    if (!form.email.trim()) e.email = "邮箱不能为空";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "请输入有效的邮箱地址";
    if (!form.subject.trim()) e.subject = "主题不能为空";
    else if (form.subject.length > 200) e.subject = "主题不能超过200个字符";
    if (!form.message.trim()) e.message = "反馈内容不能为空";
    else if (form.message.length > 5000)
      e.message = "反馈内容不能超过5000个字符";
    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        name: form.name,
        email: form.email,
        type: form.type,
        subject: form.subject,
        message: form.message,
      });
      setSubmitted(true);
      setForm({
        name: "",
        email: "",
        type: "general",
        subject: "",
        message: "",
      });
    } catch {
      setErrors({ _global: "提交失败，请重试" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
      {/* 页面标题 */}
      <div className="text-center mb-4">
        <h1 className={title({ size: "md" })}>帮助与反馈</h1>
        <div className={subtitle({ class: "mt-4" })}>
          遇到问题？需要帮助？我们随时为您提供支持
        </div>
      </div>

      {/* 快速链接 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardBody className="text-center p-6">
            <div className="text-2xl mb-2">❓</div>
            <h3 className="font-semibold">常见问题</h3>
            <p className="text-sm text-default-600 mt-1">查看常见问题解答</p>
          </CardBody>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardBody className="text-center p-6">
            <div className="text-2xl mb-2">🐛</div>
            <h3 className="font-semibold">报告问题</h3>
            <p className="text-sm text-default-600 mt-1">发现 Bug？告诉我们</p>
          </CardBody>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardBody className="text-center p-6">
            <div className="text-2xl mb-2">✉️</div>
            <h3 className="font-semibold">联系我们</h3>
            <p className="text-sm text-default-600 mt-1">直接与我们取得联系</p>
          </CardBody>
        </Card>
      </div>

      {/* 常见问题 */}
      {loadingFaq ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : faq.length > 0 ? (
        <Card>
          <CardHeader className="pb-4">
            <h2 className="text-2xl font-semibold">常见问题</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {faq.map((item, i) => (
                <Card
                  key={i}
                  className="border border-default-200"
                  shadow="none"
                >
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-medium">{item.title}</h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <p className="text-default-700">{item.content}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* 技术支持 */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-2xl font-semibold">技术支持</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <GithubIcon className="w-5 h-5" /> GitHub Issues
              </h3>
              <p className="text-default-600 text-sm mb-3">
                发现技术问题或想要新功能？在 GitHub 上提交 Issue。
              </p>
              {githubURL && (
                <Button
                  isExternal
                  as={Link}
                  color="primary"
                  href={githubURL}
                  size="sm"
                  variant="flat"
                >
                  前往 GitHub
                </Button>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-lg">✉️</span> 邮件支持
              </h3>
              <p className="text-default-600 text-sm mb-3">
                发送邮件获得技术支持，我们会在 24 小时内回复。
              </p>
              <Button
                as={Link}
                color="primary"
                href={siteEmail ? `mailto:${siteEmail}` : "#"}
                size="sm"
                variant="flat"
              >
                发送邮件
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 反馈表单 */}
      <Card>
        <CardHeader className="pb-4 flex-col items-start">
          <h2 className="text-2xl font-semibold">意见反馈</h2>
          <p className="text-default-600 text-sm">
            您的反馈对我们很重要，帮助我们改进产品
          </p>
        </CardHeader>
        <CardBody className="space-y-6">
          {submitted && (
            <div className="bg-success-50 text-success p-3 rounded-lg text-sm">
              反馈已提交，感谢您的意见！
            </div>
          )}
          {errors._global && (
            <div className="bg-danger-50 text-danger p-3 rounded-lg text-sm">
              {errors._global}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              isRequired
              errorMessage={errors.name}
              isInvalid={!!errors.name}
              label="姓名"
              maxLength={50}
              placeholder="请输入您的姓名"
              value={form.name}
              onValueChange={(v) => handleChange("name", v)}
            />
            <Input
              isRequired
              errorMessage={errors.email}
              isInvalid={!!errors.email}
              label="邮箱地址"
              placeholder="请输入您的邮箱"
              type="email"
              value={form.email}
              onValueChange={(v) => handleChange("email", v)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">反馈类型</p>
            <div className="flex flex-wrap gap-2">
              {feedbackTypes.map((t) => (
                <Chip
                  key={t.key}
                  className="cursor-pointer"
                  color={form.type === t.key ? "primary" : "default"}
                  variant={form.type === t.key ? "solid" : "flat"}
                  onClick={() => handleChange("type", t.key)}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>

          <Input
            isRequired
            errorMessage={errors.subject}
            isInvalid={!!errors.subject}
            label="主题"
            maxLength={200}
            placeholder="请简要描述您的反馈主题"
            value={form.subject}
            onValueChange={(v) => handleChange("subject", v)}
          />

          <Textarea
            isRequired
            errorMessage={errors.message}
            isInvalid={!!errors.message}
            label="详细描述"
            maxLength={5000}
            maxRows={8}
            minRows={4}
            placeholder="请详细描述您的问题、建议或反馈..."
            value={form.message}
            onValueChange={(v) => handleChange("message", v)}
          />

          <div className="flex justify-end">
            <Button
              className="px-8"
              color="primary"
              isLoading={submitting}
              onPress={handleSubmit}
            >
              {submitting ? "提交中..." : "提交反馈"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 联系信息 */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-2xl font-semibold">联系我们</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">✉️</div>
              <h3 className="font-semibold">邮箱</h3>
              <p className="text-sm text-default-600">{siteEmail || "-"}</p>
            </div>
            <div>
              <GithubIcon className="w-5 h-5 mx-auto mb-2" />
              <h3 className="font-semibold">GitHub</h3>
              {githubURL ? (
                <Link
                  isExternal
                  className="text-sm text-default-600"
                  href={githubURL}
                >
                  {githubURL.replace("https://", "")}
                </Link>
              ) : (
                <p className="text-sm text-default-600">-</p>
              )}
            </div>
            <div>
              <div className="text-2xl mb-2">⏱️</div>
              <h3 className="font-semibold">响应时间</h3>
              <p className="text-sm text-default-600">24 小时内回复</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
