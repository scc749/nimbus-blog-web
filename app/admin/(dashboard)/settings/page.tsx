"use client";

import type { SiteSettingDetail } from "@/lib/api/types";

import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Avatar } from "@heroui/avatar";

import { listSettings, upsertSetting } from "@/lib/api/admin/setting";
import {
  generateUploadURL,
  uploadFileToPresignedURL,
} from "@/lib/api/admin/file";
import { resolveImageURL } from "@/lib/api/v1/file";
import { DeleteIcon, PlusIcon, FileIcon } from "@/components/common/icons";

/* ─── Field definitions ─────────────────────────────── */

interface FieldDef {
  key: string;
  label: string;
  type: "string" | "json";
  description: string;
  isPublic: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

const siteFields: FieldDef[] = [
  {
    key: "site.name",
    label: "站点名称",
    type: "string",
    description: "站点名称",
    isPublic: true,
  },
  {
    key: "site.title",
    label: "站点标题",
    type: "string",
    description: "站点标题",
    isPublic: true,
  },
  {
    key: "site.description",
    label: "站点描述",
    type: "string",
    description: "站点描述",
    isPublic: true,
    multiline: true,
    rows: 2,
  },
  {
    key: "site.slogan",
    label: "标语 / Slogan",
    type: "string",
    description: "站点标语",
    isPublic: true,
  },
  {
    key: "site.hero",
    label: "首页 Hero 介绍",
    type: "string",
    description: "首页 Hero 介绍",
    isPublic: true,
    multiline: true,
    rows: 3,
  },
  {
    key: "site.icp_record",
    label: "ICP 备案号",
    type: "string",
    description: "ICP 备案号",
    isPublic: true,
  },
  {
    key: "site.police_record",
    label: "公安备案号",
    type: "string",
    description: "公安备案号",
    isPublic: true,
  },
];

const profileFields: FieldDef[] = [
  {
    key: "profile.name",
    label: "博主名称",
    type: "string",
    description: "站点博主显示名称",
    isPublic: true,
    placeholder: "展示在网站前台的博主名称",
  },
  {
    key: "profile.avatar",
    label: "博主头像",
    type: "string",
    description: "站点博主头像",
    isPublic: true,
    placeholder: "本地路径如 /author.png 或 MinIO key",
  },
  {
    key: "profile.bio",
    label: "博主简介",
    type: "string",
    description: "站点博主简介",
    isPublic: true,
    multiline: true,
    rows: 4,
  },
  {
    key: "profile.github_url",
    label: "GitHub",
    type: "string",
    description: "GitHub 链接",
    isPublic: true,
  },
  {
    key: "profile.bilibili_url",
    label: "Bilibili",
    type: "string",
    description: "Bilibili 链接",
    isPublic: true,
  },
  {
    key: "profile.qq_group_url",
    label: "QQ 群链接",
    type: "string",
    description: "QQ 群链接",
    isPublic: true,
  },
  {
    key: "profile.email",
    label: "联系邮箱",
    type: "string",
    description: "联系邮箱",
    isPublic: true,
    placeholder: "如 support@example.com",
  },
];

/* ─── JSON types ─────────────────────────────────────── */

interface WorkExp {
  title: string;
  company: string;
  period: string;
  description: string;
}
interface ProjectExp {
  name: string;
  description: string;
  tech: string[];
}
interface FaqItem {
  title: string;
  content: string;
}

function safeParseArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const v = raw ? JSON.parse(raw) : fallback;

    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

/* ─── Debounce hook ──────────────────────────────────── */

function useDebounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: T) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}

/* ─── Save status badge ──────────────────────────────── */

function SaveBadge({ status }: { status?: "saving" | "saved" | "error" }) {
  if (!status) return null;
  const map = {
    saving: { color: "warning" as const, text: "保存中" },
    saved: { color: "success" as const, text: "已保存" },
    error: { color: "danger" as const, text: "失败" },
  };
  const s = map[status];

  return (
    <Chip color={s.color} size="sm" variant="flat">
      {s.text}
    </Chip>
  );
}

/* ─── Main page ──────────────────────────────────────── */

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, SiteSettingDetail>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    Record<string, "saving" | "saved" | "error">
  >({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    listSettings()
      .then((res) => {
        const map: Record<string, SiteSettingDetail> = {};

        res.forEach((s) => {
          map[s.setting_key] = s;
        });
        setSettings(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const doSave = useCallback(
    async (
      key: string,
      value: string,
      type: string,
      desc: string,
      isPublic: boolean,
    ) => {
      setSaveStatus((p) => ({ ...p, [key]: "saving" }));
      try {
        await upsertSetting(key, {
          setting_key: key,
          setting_value: value,
          setting_type: type,
          description: desc,
          is_public: isPublic,
        });
        setSaveStatus((p) => ({ ...p, [key]: "saved" }));
        setTimeout(
          () =>
            setSaveStatus((p) => {
              const n = { ...p };

              delete n[key];

              return n;
            }),
          2000,
        );
      } catch {
        setSaveStatus((p) => ({ ...p, [key]: "error" }));
      }
    },
    [],
  );

  const debouncedSave = useDebounce(
    (
      key: string,
      value: string,
      type: string,
      desc: string,
      isPublic: boolean,
    ) => {
      doSave(key, value, type, desc, isPublic);
    },
    800,
  );

  const handleUploadAvatar = async (file: File, field: FieldDef) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const dto = await generateUploadURL({
        upload_type: "avatar",
        content_type: file.type,
        file_name: file.name,
        file_size: file.size,
      });

      await uploadFileToPresignedURL(dto.upload_url, file);
      updateFieldDef(field, dto.object_key);
    } catch {
      setSaveStatus((p) => ({ ...p, [field.key]: "error" }));
    } finally {
      setUploadingAvatar(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = "";
    }
  };

  const updateSetting = (
    key: string,
    value: string,
    type: string,
    desc: string,
    isPublic: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {
          id: 0,
          setting_key: key,
          setting_value: "",
          setting_type: type,
          description: desc,
          is_public: isPublic,
          created_at: "",
          updated_at: "",
        }),
        setting_value: value,
      },
    }));
    debouncedSave(key, value, type, desc, isPublic);
  };

  const updateFieldDef = (field: FieldDef, value: string) => {
    updateSetting(
      field.key,
      value,
      field.type,
      field.description,
      field.isPublic,
    );
  };

  const getValue = (key: string) => settings[key]?.setting_value ?? "";

  const renderField = (field: FieldDef) => {
    const status = saveStatus[field.key];
    const badge = <SaveBadge status={status} />;

    if (field.key === "profile.avatar") {
      const current = getValue(field.key);
      const previewSrc =
        resolveImageURL(current || "/author.png") || "/author.png";

      return (
        <div key={field.key} className="space-y-3">
          <Input
            endContent={badge}
            label={field.label}
            placeholder={field.placeholder}
            value={current}
            onValueChange={(v) => updateFieldDef(field, v)}
          />
          <div className="flex items-center gap-3">
            <Avatar
              name={getValue("profile.name") || "作者"}
              size="md"
              src={previewSrc}
            />
            <input
              ref={avatarFileInputRef}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];

                if (f) handleUploadAvatar(f, field);
              }}
            />
            <Button
              color="primary"
              isLoading={uploadingAvatar}
              size="sm"
              startContent={<FileIcon className="w-4 h-4" />}
              variant="flat"
              onPress={() => avatarFileInputRef.current?.click()}
            >
              上传头像
            </Button>
            <Button
              color="default"
              size="sm"
              startContent={<DeleteIcon className="w-4 h-4" />}
              variant="light"
              onPress={() => updateFieldDef(field, "/author.png")}
            >
              恢复默认
            </Button>
          </div>
        </div>
      );
    }

    if (field.multiline) {
      return (
        <div key={field.key} className="relative">
          <Textarea
            label={field.label}
            minRows={field.rows || 3}
            placeholder={field.placeholder}
            value={getValue(field.key)}
            onValueChange={(v) => updateFieldDef(field, v)}
          />
          {badge && <div className="absolute top-2 right-2">{badge}</div>}
        </div>
      );
    }

    return (
      <Input
        key={field.key}
        endContent={badge}
        label={field.label}
        placeholder={field.placeholder}
        value={getValue(field.key)}
        onValueChange={(v) => updateFieldDef(field, v)}
      />
    );
  };

  /* ─── JSON save helpers ──────────────────────────── */

  const saveJson = (key: string, data: unknown, desc: string) => {
    updateSetting(key, JSON.stringify(data), "json", desc, true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">站点设置</h1>

      <Tabs aria-label="Settings tabs">
        {/* ─── 站点信息 ─── */}
        <Tab key="site" title="站点信息">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">基本信息</h2>
            </CardHeader>
            <CardBody className="gap-4">{siteFields.map(renderField)}</CardBody>
          </Card>
        </Tab>

        {/* ─── 个人信息 ─── */}
        <Tab key="profile" title="博主信息">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">博主信息与社交链接</h2>
            </CardHeader>
            <CardBody className="gap-4">
              {profileFields.map(renderField)}
            </CardBody>
          </Card>
        </Tab>

        {/* ─── 内容数据 ─── */}
        <Tab key="content" title="内容数据">
          <div className="space-y-6">
            {/* 技术栈 */}
            <TechStackEditor
              status={saveStatus["profile.tech_stack"]}
              value={getValue("profile.tech_stack")}
              onChange={(arr) => saveJson("profile.tech_stack", arr, "技术栈")}
            />

            {/* 工作经历 */}
            <WorkExpEditor
              status={saveStatus["profile.work_experiences"]}
              value={getValue("profile.work_experiences")}
              onChange={(arr) =>
                saveJson("profile.work_experiences", arr, "工作经历")
              }
            />

            {/* 项目经历 */}
            <ProjectExpEditor
              status={saveStatus["profile.project_experiences"]}
              value={getValue("profile.project_experiences")}
              onChange={(arr) =>
                saveJson("profile.project_experiences", arr, "项目经历")
              }
            />

            {/* FAQ */}
            <FaqEditor
              status={saveStatus["site.faq"]}
              value={getValue("site.faq")}
              onChange={(arr) => saveJson("site.faq", arr, "常见问题")}
            />
          </div>
        </Tab>
      </Tabs>

      <p className="text-sm text-default-400 text-center">
        修改后自动保存（约 0.8 秒延迟）
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Structured Editors
   ═══════════════════════════════════════════════════════ */

/* ─── Tech Stack (string[]) ──────────────────────────── */

function TechStackEditor({
  value,
  status,
  onChange,
}: {
  value: string;
  status?: "saving" | "saved" | "error";
  onChange: (v: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>(() =>
    safeParseArray<string>(value, []),
  );
  const [input, setInput] = useState("");

  useEffect(() => {
    setItems(safeParseArray<string>(value, []));
  }, [value]);

  const commit = (next: string[]) => {
    setItems(next);
    onChange(next);
  };

  const addItem = () => {
    const v = input.trim();

    if (!v || items.includes(v)) return;
    commit([...items, v]);
    setInput("");
  };

  const removeItem = (i: number) => {
    commit(items.filter((_, idx) => idx !== i));
  };

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <h2 className="text-lg font-semibold">技术栈</h2>
        <SaveBadge status={status} />
      </CardHeader>
      <CardBody className="gap-4">
        <div className="flex flex-wrap gap-2">
          {items.map((t, i) => (
            <Chip
              key={`${t}-${i}`}
              color="primary"
              variant="flat"
              onClose={() => removeItem(i)}
            >
              {t}
            </Chip>
          ))}
          {items.length === 0 && (
            <span className="text-default-400 text-sm">暂未添加</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="输入技术名称后回车添加"
            size="sm"
            value={input}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addItem())
            }
            onValueChange={setInput}
          />
          <Button
            isIconOnly
            color="primary"
            size="sm"
            variant="flat"
            onPress={addItem}
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Work Experiences ───────────────────────────────── */

function WorkExpEditor({
  value,
  status,
  onChange,
}: {
  value: string;
  status?: "saving" | "saved" | "error";
  onChange: (v: WorkExp[]) => void;
}) {
  const [items, setItems] = useState<WorkExp[]>(() =>
    safeParseArray<WorkExp>(value, []),
  );

  useEffect(() => {
    setItems(safeParseArray<WorkExp>(value, []));
  }, [value]);

  const commit = (next: WorkExp[]) => {
    setItems(next);
    onChange(next);
  };

  const update = (i: number, field: keyof WorkExp, v: string) => {
    const next = [...items];

    next[i] = { ...next[i], [field]: v };
    commit(next);
  };

  const add = () =>
    commit([...items, { title: "", company: "", period: "", description: "" }]);
  const remove = (i: number) => commit(items.filter((_, idx) => idx !== i));

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <h2 className="text-lg font-semibold">工作经历</h2>
        <div className="flex items-center gap-2">
          <SaveBadge status={status} />
          <Button
            color="primary"
            size="sm"
            startContent={<PlusIcon className="w-4 h-4" />}
            variant="flat"
            onPress={add}
          >
            添加
          </Button>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        {items.length === 0 && (
          <p className="text-default-400 text-sm text-center py-4">
            暂无工作经历
          </p>
        )}
        {items.map((exp, i) => (
          <div
            key={i}
            className="border border-default-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-default-500">
                #{i + 1}
              </span>
              <Button
                isIconOnly
                color="danger"
                size="sm"
                variant="light"
                onPress={() => remove(i)}
              >
                <DeleteIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="职位"
                size="sm"
                value={exp.title}
                onValueChange={(v) => update(i, "title", v)}
              />
              <Input
                label="公司"
                size="sm"
                value={exp.company}
                onValueChange={(v) => update(i, "company", v)}
              />
              <Input
                label="时间段"
                placeholder="如 2020 - 2022"
                size="sm"
                value={exp.period}
                onValueChange={(v) => update(i, "period", v)}
              />
              <Textarea
                className="md:col-span-2"
                label="描述"
                minRows={5}
                placeholder="请输入工作内容、负责事项、产出与成果等"
                size="sm"
                value={exp.description}
                onValueChange={(v) => update(i, "description", v)}
              />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

/* ─── Project Experiences ────────────────────────────── */

function ProjectExpEditor({
  value,
  status,
  onChange,
}: {
  value: string;
  status?: "saving" | "saved" | "error";
  onChange: (v: ProjectExp[]) => void;
}) {
  const [items, setItems] = useState<ProjectExp[]>(() =>
    safeParseArray<ProjectExp>(value, []),
  );
  const [techInputs, setTechInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    setItems(safeParseArray<ProjectExp>(value, []));
  }, [value]);

  const commit = (next: ProjectExp[]) => {
    setItems(next);
    onChange(next);
  };

  const update = (i: number, field: "name" | "description", v: string) => {
    const next = [...items];

    next[i] = { ...next[i], [field]: v };
    commit(next);
  };

  const addTech = (i: number) => {
    const v = (techInputs[i] || "").trim();

    if (!v) return;
    const next = [...items];

    if (!next[i].tech.includes(v)) {
      next[i] = { ...next[i], tech: [...next[i].tech, v] };
      commit(next);
    }
    setTechInputs((p) => ({ ...p, [i]: "" }));
  };

  const removeTech = (i: number, ti: number) => {
    const next = [...items];

    next[i] = { ...next[i], tech: next[i].tech.filter((_, idx) => idx !== ti) };
    commit(next);
  };

  const add = () => commit([...items, { name: "", description: "", tech: [] }]);
  const remove = (i: number) => commit(items.filter((_, idx) => idx !== i));

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <h2 className="text-lg font-semibold">项目经历</h2>
        <div className="flex items-center gap-2">
          <SaveBadge status={status} />
          <Button
            color="primary"
            size="sm"
            startContent={<PlusIcon className="w-4 h-4" />}
            variant="flat"
            onPress={add}
          >
            添加
          </Button>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        {items.length === 0 && (
          <p className="text-default-400 text-sm text-center py-4">
            暂无项目经历
          </p>
        )}
        {items.map((proj, i) => (
          <div
            key={i}
            className="border border-default-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-default-500">
                #{i + 1}
              </span>
              <Button
                isIconOnly
                color="danger"
                size="sm"
                variant="light"
                onPress={() => remove(i)}
              >
                <DeleteIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="项目名称"
                size="sm"
                value={proj.name}
                onValueChange={(v) => update(i, "name", v)}
              />
              <Input
                label="项目描述"
                size="sm"
                value={proj.description}
                onValueChange={(v) => update(i, "description", v)}
              />
            </div>
            <div>
              <p className="text-sm text-default-500 mb-2">技术栈</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {proj.tech.map((t, ti) => (
                  <Chip
                    key={`${t}-${ti}`}
                    size="sm"
                    variant="flat"
                    onClose={() => removeTech(i, ti)}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="添加技术标签"
                  size="sm"
                  value={techInputs[i] || ""}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTech(i))
                  }
                  onValueChange={(v) =>
                    setTechInputs((p) => ({ ...p, [i]: v }))
                  }
                />
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => addTech(i)}
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

/* ─── FAQ ────────────────────────────────────────────── */

function FaqEditor({
  value,
  status,
  onChange,
}: {
  value: string;
  status?: "saving" | "saved" | "error";
  onChange: (v: FaqItem[]) => void;
}) {
  const [items, setItems] = useState<FaqItem[]>(() =>
    safeParseArray<FaqItem>(value, []),
  );

  useEffect(() => {
    setItems(safeParseArray<FaqItem>(value, []));
  }, [value]);

  const commit = (next: FaqItem[]) => {
    setItems(next);
    onChange(next);
  };

  const update = (i: number, field: keyof FaqItem, v: string) => {
    const next = [...items];

    next[i] = { ...next[i], [field]: v };
    commit(next);
  };

  const add = () => commit([...items, { title: "", content: "" }]);
  const remove = (i: number) => commit(items.filter((_, idx) => idx !== i));

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <h2 className="text-lg font-semibold">常见问题 (FAQ)</h2>
        <div className="flex items-center gap-2">
          <SaveBadge status={status} />
          <Button
            color="primary"
            size="sm"
            startContent={<PlusIcon className="w-4 h-4" />}
            variant="flat"
            onPress={add}
          >
            添加
          </Button>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        {items.length === 0 && (
          <p className="text-default-400 text-sm text-center py-4">暂无 FAQ</p>
        )}
        {items.map((faq, i) => (
          <div
            key={i}
            className="border border-default-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-default-500">
                #{i + 1}
              </span>
              <Button
                isIconOnly
                color="danger"
                size="sm"
                variant="light"
                onPress={() => remove(i)}
              >
                <DeleteIcon className="w-4 h-4" />
              </Button>
            </div>
            <Input
              label="问题"
              size="sm"
              value={faq.title}
              onValueChange={(v) => update(i, "title", v)}
            />
            <Textarea
              label="回答"
              minRows={2}
              size="sm"
              value={faq.content}
              onValueChange={(v) => update(i, "content", v)}
            />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
