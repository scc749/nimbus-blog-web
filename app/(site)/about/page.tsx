"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";

import { listSettings } from "@/lib/api/v1/setting";
import { resolveImageURL } from "@/lib/api/v1/file";
import { GithubIcon, BilibiliIcon, QQIcon } from "@/components/common/icons";
import { title, subtitle } from "@/components/common/primitives";

interface WorkExp {
  title: string;
  company: string;
  company_intro?: string;
  period: string;
  description: string;
}

interface ProjectExp {
  name: string;
  open_source_url?: string;
  description: string;
  tech: string[];
}

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    const v = raw ? JSON.parse(raw) : fallback;

    return Array.isArray(fallback) && !Array.isArray(v) ? fallback : v;
  } catch {
    return fallback;
  }
}

function formatProjectSourceText(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export default function AboutPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSettings()
      .then((res) => {
        const map: Record<string, string> = {};

        res.forEach((s) => {
          map[s.setting_key] = s.setting_value;
        });
        setSettings(map);
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

  const profileName = settings["profile.name"] || "博主";
  const profileAvatar = settings["profile.avatar"] || "";
  const profileBio = settings["profile.bio"] || "";
  const githubURL = settings["profile.github_url"] || "";
  const bilibiliURL = settings["profile.bilibili_url"] || "";
  const qqGroupURL = settings["profile.qq_group_url"] || "";
  const techStack = parseJSON<string[]>(settings["profile.tech_stack"], []);
  const workExperiences = parseJSON<WorkExp[]>(
    settings["profile.work_experiences"],
    [],
  );
  const projectExperiences = parseJSON<ProjectExp[]>(
    settings["profile.project_experiences"],
    [],
  );

  return (
    <section className="max-w-5xl mx-auto w-full px-4 pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="text-center mb-12">
        <h1 className={title({ size: "md" })}>关于我</h1>
        <div className={subtitle({ class: "mt-4" })}>
          热爱技术，专注于现代全栈开发
        </div>
      </div>

      {/* 个人简介 */}
      <Card className="mb-8">
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar
              className="w-32 h-32"
              name={profileName}
              src={
                resolveImageURL(profileAvatar || "/author.png") || "/author.png"
              }
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-4">
                你好，我是{profileName}
              </h2>
              {profileBio && (
                <p className="text-default-600 leading-relaxed mb-6 whitespace-pre-line">
                  {profileBio}
                </p>
              )}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {githubURL && (
                  <Button
                    isExternal
                    as={Link}
                    href={githubURL}
                    startContent={<GithubIcon className="w-4 h-4" />}
                    variant="flat"
                  >
                    GitHub
                  </Button>
                )}
                {bilibiliURL && (
                  <Button
                    isExternal
                    as={Link}
                    href={bilibiliURL}
                    startContent={<BilibiliIcon className="w-4 h-4" />}
                    variant="flat"
                  >
                    Bilibili
                  </Button>
                )}
                {qqGroupURL && (
                  <Button
                    isExternal
                    as={Link}
                    href={qqGroupURL}
                    startContent={<QQIcon className="w-4 h-4" />}
                    variant="flat"
                  >
                    QQ 群
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 技术栈 */}
      {techStack.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-xl font-bold">技术栈</h3>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {techStack.map((skill) => (
                <Chip key={skill} color="primary" variant="flat">
                  {skill}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* 工作经历 */}
      {workExperiences.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-xl font-bold">工作经历</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {workExperiences.map((exp, i) => (
                <div key={i}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h4 className="font-semibold text-lg">{exp.title}</h4>
                    <Chip
                      className="text-default-500 border-default-200/50 bg-default-50/50"
                      color="default"
                      radius="sm"
                      size="sm"
                      variant="bordered"
                    >
                      {exp.period}
                    </Chip>
                  </div>
                  <p className="mb-2">
                    <span className="text-primary font-medium">
                      {exp.company}
                    </span>
                    {exp.company_intro && (
                      <span className="text-default-500">
                        {" "}
                        - {exp.company_intro}
                      </span>
                    )}
                  </p>
                  <p className="text-default-600">{exp.description}</p>
                  {i < workExperiences.length - 1 && (
                    <Divider className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* 项目经历 */}
      {projectExperiences.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-xl font-bold">项目经历</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectExperiences.map((proj, i) => (
                <div
                  key={i}
                  className="p-4 border border-default-200 rounded-lg"
                >
                  <h4 className="font-semibold mb-2 flex flex-wrap items-center gap-2">
                    <span>{proj.name}</span>
                    {proj.open_source_url && (
                      <Link
                        isExternal
                        className="text-xs text-default-500 hover:text-primary underline-offset-4 hover:underline"
                        href={proj.open_source_url}
                      >
                        {formatProjectSourceText(proj.open_source_url)}
                      </Link>
                    )}
                  </h4>
                  <p className="text-default-600 text-sm mb-3">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {proj.tech.map((t) => (
                      <Chip
                        key={t}
                        className="bg-default-100/60 text-default-600"
                        radius="sm"
                        size="sm"
                        variant="flat"
                      >
                        {t}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* 联系方式 */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-bold">联系方式</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center">
            <p className="text-default-600 mb-6">
              如果你对我的文章感兴趣，或者想要交流技术问题，欢迎通过以下方式联系我：
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {githubURL && (
                <Button isExternal as={Link} href={githubURL} variant="flat">
                  GitHub
                </Button>
              )}
              {bilibiliURL && (
                <Button isExternal as={Link} href={bilibiliURL} variant="flat">
                  Bilibili
                </Button>
              )}
              {qqGroupURL && (
                <Button isExternal as={Link} href={qqGroupURL} variant="flat">
                  QQ 群
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
