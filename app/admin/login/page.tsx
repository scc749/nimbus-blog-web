"use client";

import { useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import Image from "next/image";

import {
  login,
  resetPassword,
  checkSession,
  type LoginBody,
} from "@/lib/api/admin/auth";
import { fetchSettingsMap } from "@/lib/api/v1/setting";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [otpRequired, setOtpRequired] = useState(false);
  const [requiresReset, setRequiresReset] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const settings = await fetchSettingsMap().catch(
          () => ({}) as Record<string, string>,
        );
        const siteName =
          settings["site.name"] || settings["site.title"] || "Nimbus Blog";

        document.title = `${siteName}-管理员登录`;
      } catch {}
    })();
  }, []);

  useEffect(() => {
    checkSession().then((ok) => {
      if (ok) router.replace("/admin");
      else setPageLoading(false);
    });
  }, [router]);

  const doLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const body: LoginBody = { username, password };

      if (otpRequired) {
        if (recoveryCode) body.recovery_code = recoveryCode;
        else if (otpCode) body.otp_code = otpCode;
      }
      const res = await login(body);

      if (res?.requires_reset) {
        setRequiresReset(true);
        setOtpRequired(false);

        return;
      }
      if (res?.otp_required && !body.otp_code && !body.recovery_code) {
        setOtpRequired(true);

        return;
      }
      router.push("/admin");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const doReset = async () => {
    if (newPassword !== confirmNewPassword) {
      setError("两次密码不一致");

      return;
    }
    if (newPassword.length < 8) {
      setError("新密码至少需要8个字符");

      return;
    }
    setLoading(true);
    try {
      await resetPassword({
        username,
        old_password: password,
        new_password: newPassword,
      });
      setRequiresReset(false);
      setPassword("");
      setError("密码已重置，请重新登录");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "重置失败");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-default-100">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-default-100">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-2 items-center pb-0 pt-6">
          <Image
            priority
            alt="Logo"
            className="w-16 h-16"
            height={64}
            src="/logo.png"
            width={64}
          />
          <h1 className="text-2xl font-bold">管理员登录</h1>
        </CardHeader>
        <CardBody className="gap-4 p-6">
          {error && (
            <div className="bg-danger-50 text-danger p-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          {!requiresReset ? (
            <>
              <Input
                isDisabled={loading || otpRequired}
                label="用户名"
                maxLength={32}
                value={username}
                onValueChange={setUsername}
              />
              <Input
                isDisabled={loading || otpRequired}
                label="密码"
                maxLength={20}
                type="password"
                value={password}
                onValueChange={setPassword}
              />

              {otpRequired && (
                <>
                  <div className="text-xs text-default-500 font-bold mt-2">
                    两步验证
                  </div>
                  <Input
                    isDisabled={loading}
                    label="OTP 验证码"
                    maxLength={6}
                    placeholder="输入6位数字验证码"
                    value={otpCode}
                    onValueChange={(v) => {
                      setOtpCode(v);
                      if (v) setRecoveryCode("");
                    }}
                  />
                  <div className="text-center text-xs text-default-400">
                    - 或者 -
                  </div>
                  <Input
                    isDisabled={loading}
                    label="恢复码"
                    maxLength={64}
                    placeholder="输入恢复码"
                    value={recoveryCode}
                    onValueChange={(v) => {
                      setRecoveryCode(v);
                      if (v) setOtpCode("");
                    }}
                  />
                </>
              )}

              <Button
                fullWidth
                color="primary"
                isLoading={loading}
                onPress={doLogin}
              >
                {otpRequired ? "验证并登录" : "登录"}
              </Button>

              {otpRequired && (
                <Button
                  fullWidth
                  isDisabled={loading}
                  variant="light"
                  onPress={() => {
                    setOtpRequired(false);
                    setOtpCode("");
                    setRecoveryCode("");
                  }}
                >
                  返回
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="text-sm text-warning mb-2">需要重置密码</div>
              <Input
                isDisabled={loading}
                label="新密码"
                maxLength={20}
                placeholder="8-20个字符"
                type="password"
                value={newPassword}
                onValueChange={setNewPassword}
              />
              <Input
                isDisabled={loading}
                label="确认新密码"
                maxLength={20}
                type="password"
                value={confirmNewPassword}
                onValueChange={setConfirmNewPassword}
              />
              <Button
                fullWidth
                color="primary"
                isLoading={loading}
                onPress={doReset}
              >
                重置密码
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
