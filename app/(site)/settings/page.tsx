"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Spinner } from "@heroui/spinner";

import { getMe, updateProfile, changePassword } from "@/lib/api/v1/user";
import { useUserAuth } from "@/context";

export default function SettingsPage() {
  const { isAuthenticated } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [region, setRegion] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [showFull, setShowFull] = useState(false);

  // Password
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);

      return;
    }
    getMe()
      .then((u) => {
        setName(u.name || "");
        setBio(u.bio || "");
        setRegion(u.region || "");
        setBlogUrl(u.blog_url || "");
        setShowFull(u.show_full_profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      await updateProfile({
        name,
        bio,
        region,
        blog_url: blogUrl,
        show_full_profile: showFull,
      });
      setMsg("保存成功");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePwd = async () => {
    if (!oldPwd || !newPwd) {
      setPwdMsg("请填写完整");

      return;
    }
    if (newPwd.length < 8 || newPwd.length > 20) {
      setPwdMsg("密码需要8-20个字符");

      return;
    }
    setPwdSaving(true);
    setPwdMsg("");
    try {
      await changePassword({ old_password: oldPwd, new_password: newPwd });
      setPwdMsg("密码已更新");
      setOldPwd("");
      setNewPwd("");
    } catch (e: unknown) {
      setPwdMsg(e instanceof Error ? e.message : "修改失败");
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">请先登录</h1>
        <p className="text-default-500">登录后即可管理个人设置</p>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">个人设置</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">个人资料</h2>
        </CardHeader>
        <CardBody className="gap-4">
          {msg && (
            <div
              className={`text-sm p-2 rounded ${msg.includes("成功") ? "bg-success-50 text-success" : "bg-danger-50 text-danger"}`}
            >
              {msg}
            </div>
          )}
          <Input
            label="昵称"
            maxLength={50}
            placeholder="2-50个字符"
            value={name}
            onValueChange={setName}
          />
          <Textarea
            label="个人简介"
            maxLength={500}
            minRows={2}
            value={bio}
            onValueChange={setBio}
          />
          <Input
            label="地区"
            maxLength={100}
            value={region}
            onValueChange={setRegion}
          />
          <Input
            label="博客地址"
            maxLength={500}
            placeholder="https://"
            value={blogUrl}
            onValueChange={setBlogUrl}
          />
          <div className="space-y-1">
            <Switch isSelected={showFull} onValueChange={setShowFull}>
              公开完整资料
            </Switch>
            <p className="text-tiny text-default-400 pl-2">
              开启后，你的邮箱和地区将在评论区对其他用户可见
            </p>
          </div>
          <Button color="primary" isLoading={saving} onPress={handleSave}>
            保存
          </Button>
        </CardBody>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">修改密码</h2>
        </CardHeader>
        <CardBody className="gap-4">
          {pwdMsg && (
            <div
              className={`text-sm p-2 rounded ${pwdMsg.includes("更新") ? "bg-success-50 text-success" : "bg-danger-50 text-danger"}`}
            >
              {pwdMsg}
            </div>
          )}
          <Input
            label="当前密码"
            maxLength={20}
            type="password"
            value={oldPwd}
            onValueChange={setOldPwd}
          />
          <Input
            label="新密码"
            maxLength={20}
            placeholder="8-20个字符"
            type="password"
            value={newPwd}
            onValueChange={setNewPwd}
          />
          <Button
            color="warning"
            isLoading={pwdSaving}
            onPress={handleChangePwd}
          >
            修改密码
          </Button>
        </CardBody>
      </Card>
    </section>
  );
}
