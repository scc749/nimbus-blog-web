"use client";
import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";

import { generateCaptcha } from "@/lib/api/v1/captcha";
import { sendEmailCode } from "@/lib/api/v1/email";
import {
  EyeFilledIcon,
  EyeSlashFilledIcon,
  MailIcon,
  LockIcon,
} from "@/components/common/icons";

interface Props {
  onSuccess: () => void;
}

export default function ForgotForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaID, setCaptchaID] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [codeSentHint, setCodeSentHint] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "请输入邮箱地址";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }
    if (!password) {
      newErrors.password = "请输入密码";
    } else if (password.length < 8) {
      newErrors.password = "密码需要8-20个字符";
    } else if (password.length > 20) {
      newErrors.password = "密码需要8-20个字符";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "请确认密码";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }
    if (!emailCode) {
      newErrors.code = "请输入邮箱验证码";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    setErrors((prev) => ({ ...prev, captcha: "" }));
    setCaptchaInput("");
    try {
      const { captcha_id, pic_path } = await generateCaptcha();

      setCaptchaID(captcha_id);
      setCaptchaImg(pic_path);
    } catch {
      // ignore
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSendCode = async () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "请输入邮箱地址";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }
    if (!captchaInput) {
      newErrors.captcha = "请输入图形验证码";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));

      return;
    }
    setSendCodeLoading(true);
    try {
      await sendEmailCode({
        email,
        captcha_id: captchaID,
        captcha: captchaInput,
      });
      setCodeSentHint("验证码已发送，请查看邮箱");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "发送失败，请重试";

      setErrors((prev) => ({ ...prev, captcha: msg }));
      setCodeSentHint("");
      await loadCaptcha();
      setCaptchaInput("");
    } finally {
      setSendCodeLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { forgot: apiForgot } = await import("@/lib/api/v1/auth");

      await apiForgot({
        email,
        new_password: password,
        code: emailCode,
      });
      onSuccess();
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCaptchaInput("");
      setEmailCode("");
      setCodeSentHint("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "重置失败，请重试";

      setErrors((prev) => ({ ...prev, code: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardBody className="space-y-4">
        <Input
          endContent={
            <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
          }
          errorMessage={errors.email}
          isInvalid={!!errors.email}
          label="邮箱"
          placeholder="输入您的邮箱"
          value={email}
          variant="bordered"
          onValueChange={(v) => {
            setEmail(v);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
        />
        <div className="flex items-end gap-3">
          <Input
            className="flex-1"
            errorMessage={errors.captcha}
            isInvalid={!!errors.captcha}
            label="图形验证码"
            placeholder="输入右侧验证码"
            value={captchaInput}
            variant="bordered"
            onValueChange={(v) => {
              setCaptchaInput(v);
              if (errors.captcha)
                setErrors((prev) => ({ ...prev, captcha: "" }));
            }}
          />
          <button
            aria-label="刷新验证码"
            className="border rounded-md p-1 bg-default-100"
            type="button"
            onClick={loadCaptcha}
          >
            {captchaLoading || !captchaImg ? (
              <div className="w-[120px] h-[40px] flex items-center justify-center text-default-400">
                加载中…
              </div>
            ) : (
              <Image
                removeWrapper
                alt="图形验证码"
                className="w-[120px] h-[40px] object-contain dark:invert dark:contrast-125"
                src={
                  captchaImg.startsWith("data:image/")
                    ? captchaImg
                    : `data:image/png;base64,${captchaImg}`
                }
              />
            )}
          </button>
        </div>
        <div className="flex items-end gap-3">
          <Input
            className="flex-1"
            errorMessage={errors.code}
            isInvalid={!!errors.code}
            label="邮箱验证码"
            maxLength={6}
            placeholder="输入您收到的邮箱验证码"
            value={emailCode}
            variant="bordered"
            onValueChange={(v) => {
              setEmailCode(v);
              if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
            }}
          />
          <Button
            isDisabled={!email || !captchaInput}
            isLoading={sendCodeLoading}
            size="sm"
            variant="flat"
            onPress={handleSendCode}
          >
            发送邮箱验证码
          </Button>
        </div>
        {!!codeSentHint && (
          <p className="text-tiny text-success">{codeSentHint}</p>
        )}
        <Input
          endContent={
            <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
          }
          errorMessage={errors.password}
          isInvalid={!!errors.password}
          label="新密码"
          maxLength={20}
          placeholder="输入新的密码（8-20个字符）"
          type={isVisible ? "text" : "password"}
          value={password}
          variant="bordered"
          onValueChange={(v) => {
            setPassword(v);
            if (errors.password || errors.confirmPassword) {
              setErrors((prev) => ({
                ...prev,
                password: "",
                confirmPassword: "",
              }));
            }
          }}
        />
        <Input
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          errorMessage={errors.confirmPassword}
          isInvalid={!!errors.confirmPassword}
          label="确认新密码"
          maxLength={20}
          placeholder="再次输入新的密码"
          type={isVisible ? "text" : "password"}
          value={confirmPassword}
          variant="bordered"
          onValueChange={(v) => {
            setConfirmPassword(v);
            if (errors.confirmPassword)
              setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
        />
        <div className="flex py-2 px-1 justify-between">
          <Button
            className="w-full"
            color="primary"
            isLoading={isLoading}
            onPress={handleSubmit}
          >
            重置密码
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
