"use client";

import { useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Code } from "@heroui/code";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import {
  changePassword,
  getProfile,
  updateProfile,
  twoFASetup,
  twoFAVerify,
  twoFADisable,
  twoFARecoveryReset,
} from "@/lib/api/admin/auth";

export default function AdminSecurityPage() {
  // Profile
  const [nickname, setNickname] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetching, setProfileFetching] = useState(true);
  const [twofaEnabled, setTwofaEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();

        setNickname(data.nickname);
        setSpecialization(data.specialization);
        setTwofaEnabled(!!data.twofa_enabled);
      } catch (e: unknown) {
        setProfileMsg(e instanceof Error ? e.message : "获取个人信息失败");
      } finally {
        setProfileFetching(false);
      }
    })();
  }, []);

  // Password
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // 2FA
  const [twoFAStep, setTwoFAStep] = useState<"idle" | "setup" | "enabled">(
    "idle",
  );
  const [setupId, setSetupId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryCodesMode, setRecoveryCodesMode] = useState<
    "enable" | "reset" | null
  >(null);
  const [otpCode, setOtpCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [twoFAMsg, setTwoFAMsg] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const {
    isOpen: confirmOpen,
    onOpen: openConfirm,
    onClose: closeConfirm,
  } = useDisclosure();
  const [pendingAction, setPendingAction] = useState<
    "disable_2fa" | "reset_recovery" | null
  >(null);

  const handleUpdateProfile = async () => {
    if (!nickname.trim() || !specialization.trim()) {
      setProfileMsg("请填写完整");

      return;
    }
    setProfileLoading(true);
    setProfileMsg("");
    try {
      await updateProfile({
        nickname: nickname.trim(),
        specialization: specialization.trim(),
      });
      setProfileMsg("个人信息已更新");
    } catch (e: unknown) {
      setProfileMsg(e instanceof Error ? e.message : "修改失败");
    } finally {
      setProfileLoading(false);
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
    if (oldPwd === newPwd) {
      setPwdMsg("新密码不能与旧密码相同");

      return;
    }
    setPwdLoading(true);
    setPwdMsg("");
    try {
      await changePassword({ old_password: oldPwd, new_password: newPwd });
      setPwdMsg("密码已更新");
      setOldPwd("");
      setNewPwd("");
    } catch (e: unknown) {
      setPwdMsg(e instanceof Error ? e.message : "修改失败");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    setTwoFAMsg("");
    try {
      const res = await twoFASetup();

      setSetupId(res.setup_id);
      setQrUrl(res.qrcode_image_base64);
      setSecret(res.secret);
      setRecoveryCodes([]);
      setRecoveryCodesMode(null);
      setOtpCode("");
      setTwoFAStep("setup");
    } catch (e: unknown) {
      setTwoFAMsg(e instanceof Error ? e.message : "设置失败");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!setupId || !otpCode) return;
    setTwoFALoading(true);
    setTwoFAMsg("");
    try {
      const res = await twoFAVerify({ setup_id: setupId, code: otpCode });

      setRecoveryCodes(res.recovery_codes || []);
      setRecoveryCodesMode("enable");
      setTwoFAStep("enabled");
      setTwoFAMsg("两步验证已启用，请保存恢复码并重新登录");
      setDisableCode("");
    } catch (e: unknown) {
      setTwoFAMsg(e instanceof Error ? e.message : "验证失败");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleCopyRecoveryCodes = async () => {
    if (recoveryCodes.length === 0) return;
    try {
      await navigator.clipboard.writeText(recoveryCodes.join("\n"));
      setTwoFAMsg("恢复码已复制到剪贴板，请保存后重新登录");
    } catch {
      setTwoFAMsg("复制失败，请手动复制");
    }
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportRecoveryCodesTxt = () => {
    if (recoveryCodes.length === 0) return;
    const content = [
      "Nimbus Blog - 2FA Recovery Codes",
      "请妥善保存这些恢复码；每个恢复码仅可使用一次。",
      "",
      ...recoveryCodes,
      "",
    ].join("\n");
    const date = new Date().toISOString().slice(0, 10);

    downloadTextFile(content, `nimbus-2fa-recovery-codes-${date}.txt`);
  };

  const handleExportRecoveryCodesCsv = () => {
    if (recoveryCodes.length === 0) return;
    const content = ["recovery_code", ...recoveryCodes].join("\n");
    const date = new Date().toISOString().slice(0, 10);

    downloadTextFile(content, `nimbus-2fa-recovery-codes-${date}.csv`);
  };

  const handleRelogin = () => {
    window.location.href = "/admin/login";
  };

  const handleDisable2FA = async () => {
    if (!disableCode) return;
    setTwoFALoading(true);
    setTwoFAMsg("");
    try {
      await twoFADisable({ code: disableCode });
      setTwoFAStep("idle");
      setTwoFAMsg("两步验证已关闭");
      setQrUrl("");
      setSecret("");
      setRecoveryCodes([]);
      setRecoveryCodesMode(null);
      setTwofaEnabled(false);
    } catch (e: unknown) {
      setTwoFAMsg(e instanceof Error ? e.message : "关闭失败");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleResetRecovery = async () => {
    setTwoFALoading(true);
    try {
      const res = await twoFARecoveryReset({ code: disableCode });

      setRecoveryCodes(res.recovery_codes);
      setRecoveryCodesMode("reset");
      setTwoFAStep("enabled");
      setTwoFAMsg("恢复码已重置");
    } catch (e: unknown) {
      setTwoFAMsg(e instanceof Error ? e.message : "重置失败");
    } finally {
      setTwoFALoading(false);
    }
  };

  const requestDisable2FA = () => {
    if (!disableCode) return;
    setPendingAction("disable_2fa");
    openConfirm();
  };

  const requestResetRecovery = () => {
    if (!disableCode) return;
    setPendingAction("reset_recovery");
    openConfirm();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">安全设置</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">个人信息</h2>
        </CardHeader>
        <CardBody className="gap-3">
          {profileMsg && (
            <div
              className={`text-sm p-2 rounded ${profileMsg.includes("已更新") ? "bg-success-50 text-success" : "bg-danger-50 text-danger"}`}
            >
              {profileMsg}
            </div>
          )}
          {profileFetching ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <>
              <Input
                label="昵称"
                maxLength={100}
                placeholder="管理员显示昵称"
                value={nickname}
                onValueChange={setNickname}
              />
              <Input
                label="专业方向"
                maxLength={200}
                placeholder="例如：全栈工程师、AI 工程师"
                value={specialization}
                onValueChange={setSpecialization}
              />
              <Button
                color="primary"
                isLoading={profileLoading}
                onPress={handleUpdateProfile}
              >
                保存
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      <Divider />

      {/* Password */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">修改密码</h2>
        </CardHeader>
        <CardBody className="gap-3">
          {pwdMsg && (
            <div
              className={`text-sm p-2 rounded ${pwdMsg.includes("已更新") ? "bg-success-50 text-success" : "bg-danger-50 text-danger"}`}
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
            color="primary"
            isLoading={pwdLoading}
            onPress={handleChangePwd}
          >
            修改密码
          </Button>
        </CardBody>
      </Card>

      <Divider />

      {/* 2FA */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">两步验证 (2FA)</h2>
        </CardHeader>
        <CardBody className="gap-3">
          {twoFAMsg && (
            <div
              className={`text-sm p-2 rounded ${twoFAMsg.includes("已启用") || twoFAMsg.includes("已重置") ? "bg-success-50 text-success" : twoFAMsg.includes("已关闭") ? "bg-warning-50 text-warning" : "bg-danger-50 text-danger"}`}
            >
              {twoFAMsg}
            </div>
          )}

          {twoFAStep === "idle" && (
            <>
              <Button
                color="primary"
                isLoading={twoFALoading}
                onPress={handleSetup2FA}
              >
                生成/刷新 2FA 配置
              </Button>

              <Divider />

              {twofaEnabled && (
                <>
                  <p className="text-sm text-default-500">
                    已启用 2FA 的情况下，可使用验证码或恢复码进行关闭/重置：
                  </p>
                  <Input
                    label="验证码/恢复码"
                    placeholder="输入验证码或恢复码"
                    value={disableCode}
                    onValueChange={setDisableCode}
                  />
                  <div className="flex gap-2">
                    <Button
                      color="danger"
                      isLoading={twoFALoading}
                      onPress={requestDisable2FA}
                    >
                      关闭2FA
                    </Button>
                    <Button
                      isLoading={twoFALoading}
                      variant="flat"
                      onPress={requestResetRecovery}
                    >
                      重置恢复码
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {twoFAStep === "setup" && (
            <>
              <p className="text-sm text-default-500">
                请用 Authenticator 应用扫描下方二维码：
              </p>
              {qrUrl && (
                <Image
                  alt="2FA QR"
                  className="w-48 h-48"
                  src={
                    qrUrl.startsWith("data:")
                      ? qrUrl
                      : `data:image/png;base64,${qrUrl}`
                  }
                />
              )}
              {secret && (
                <div className="text-sm">
                  <span className="text-default-500">密钥：</span>
                  <Code className="ml-1">{secret}</Code>
                </div>
              )}
              <Input
                label="验证码"
                maxLength={6}
                placeholder="输入6位数字验证码"
                value={otpCode}
                onValueChange={setOtpCode}
              />
              <Button
                color="primary"
                isLoading={twoFALoading}
                onPress={handleVerify2FA}
              >
                验证并启用
              </Button>
            </>
          )}

          {twoFAStep === "enabled" && (
            <>
              <Button
                color="primary"
                isLoading={twoFALoading}
                onPress={handleSetup2FA}
              >
                生成/刷新 2FA 配置
              </Button>
              <Divider />
              {twofaEnabled && (
                <>
                  <p className="text-sm text-default-500">
                    已启用 2FA 的情况下，可使用验证码或恢复码进行关闭/重置：
                  </p>
                  <Input
                    label="验证码/恢复码"
                    placeholder="输入验证码或恢复码"
                    value={disableCode}
                    onValueChange={setDisableCode}
                  />
                  <div className="flex gap-2">
                    <Button
                      color="danger"
                      isLoading={twoFALoading}
                      onPress={requestDisable2FA}
                    >
                      关闭2FA
                    </Button>
                    <Button
                      isLoading={twoFALoading}
                      variant="flat"
                      onPress={requestResetRecovery}
                    >
                      重置恢复码
                    </Button>
                  </div>
                  <Divider />
                </>
              )}
              <p className="text-sm text-success">
                {recoveryCodesMode === "enable"
                  ? "两步验证已启用，请先保存恢复码，然后重新登录"
                  : "恢复码已生成，请立即保存"}
              </p>
              <Divider />
              {recoveryCodes.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-warning mb-1">
                    恢复码（请立即保存）：
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {recoveryCodes.map((c) => (
                      <Code key={c} className="text-xs">
                        {c}
                      </Code>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button variant="flat" onPress={handleCopyRecoveryCodes}>
                      复制恢复码
                    </Button>
                    <Button
                      variant="flat"
                      onPress={handleExportRecoveryCodesTxt}
                    >
                      导出 TXT
                    </Button>
                    <Button
                      variant="flat"
                      onPress={handleExportRecoveryCodesCsv}
                    >
                      导出 CSV
                    </Button>
                    {recoveryCodesMode === "enable" && (
                      <Button color="primary" onPress={handleRelogin}>
                        确定并重新登录
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          closeConfirm();
          setPendingAction(null);
        }}
      >
        <ModalContent>
          <ModalHeader>
            {pendingAction === "disable_2fa"
              ? "确认关闭 2FA？"
              : "确认重置恢复码？"}
          </ModalHeader>
          <ModalBody className="gap-3">
            <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-50/10 dark:text-danger-400">
              {pendingAction === "disable_2fa"
                ? "关闭两步验证会降低账号安全性。"
                : "重置后旧恢复码将立即失效，请重新保存新的恢复码。"}
            </div>
            <div className="text-sm text-default-500">
              将使用你输入的验证码/恢复码执行该操作。
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                if (twoFALoading) return;
                closeConfirm();
                setPendingAction(null);
              }}
            >
              取消
            </Button>
            <Button
              color="danger"
              isLoading={twoFALoading}
              onPress={async () => {
                if (pendingAction === "disable_2fa") {
                  await handleDisable2FA();
                } else if (pendingAction === "reset_recovery") {
                  await handleResetRecovery();
                } else {
                  return;
                }
                closeConfirm();
                setPendingAction(null);
              }}
            >
              {pendingAction === "disable_2fa" ? "确认关闭" : "确认重置"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
