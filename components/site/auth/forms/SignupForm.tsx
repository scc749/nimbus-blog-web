"use client";
import type { IconSvgProps } from "@/types";

import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";

import { generateCaptcha } from "@/lib/api/v1/captcha";
import { sendEmailCode } from "@/lib/api/v1/email";
import { useUserAuth } from "@/context";
import {
  EyeFilledIcon,
  EyeSlashFilledIcon,
  MailIcon,
  LockIcon,
} from "@/components/common/icons";

const FormUserIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.4 5H10.6C9.68 5 8.76 5.06 7.83 5.17L10.5 2.5L9 1L3 7V9H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V9H21ZM7 20V9H17V20H7Z"
      fill="currentColor"
    />
  </svg>
);

interface Props {
  onSuccess: () => void;
}

export default function SignupForm({ onSuccess }: Props) {
  const { register: ctxRegister } = useUserAuth();
  const [name, setName] = useState("");
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

    if (!name) {
      newErrors.name = "请输入用户名";
    } else if (name.length < 2) {
      newErrors.name = "用户名至少需要2个字符";
    } else if (name.length > 32) {
      newErrors.name = "用户名不能超过32个字符";
    }
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
      await ctxRegister({
        username: name,
        email,
        password,
        code: emailCode,
      });
      onSuccess();
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCaptchaInput("");
      setEmailCode("");
      setCodeSentHint("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "注册失败，请重试";

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
            <FormUserIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
          }
          errorMessage={errors.name}
          isInvalid={!!errors.name}
          label="用户名"
          maxLength={32}
          placeholder="输入您的用户名（2-32个字符）"
          value={name}
          variant="bordered"
          onValueChange={(v) => {
            setName(v);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
        />
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
          label="密码"
          maxLength={20}
          placeholder="输入您的密码（8-20个字符）"
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
          label="确认密码"
          maxLength={20}
          placeholder="再次输入您的密码"
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
            注册
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
