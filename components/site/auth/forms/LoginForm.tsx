"use client";
import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Link } from "@heroui/link";

import { generateCaptcha } from "@/lib/api/v1/captcha";
import { useUserAuth } from "@/context";
import {
  EyeFilledIcon,
  EyeSlashFilledIcon,
  MailIcon,
} from "@/components/common/icons";

interface Props {
  onSuccess: () => void;
  onForgot: () => void;
  siteEmail?: string;
}

export default function LoginForm({ onSuccess, onForgot, siteEmail }: Props) {
  const { login: ctxLogin } = useUserAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaID, setCaptchaID] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

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
    } else if (password.length > 20) {
      newErrors.password = "密码不能超过20个字符";
    }
    if (!captchaInput) {
      newErrors.captcha = "请输入图形验证码";
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

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await ctxLogin({
        email,
        password,
        captcha_id: captchaID,
        captcha: captchaInput,
      });
      onSuccess();
      setEmail("");
      setPassword("");
      setCaptchaInput("");
    } catch (err: unknown) {
      await loadCaptcha();
      setCaptchaInput("");
      const msg = err instanceof Error ? err.message : "登录失败，请重试";

      setErrors((prev) => ({ ...prev, captcha: msg }));
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
          errorMessage={errors.password}
          isInvalid={!!errors.password}
          label="密码"
          maxLength={20}
          placeholder="输入您的密码"
          type={isVisible ? "text" : "password"}
          value={password}
          variant="bordered"
          onValueChange={(v) => {
            setPassword(v);
            if (errors.password)
              setErrors((prev) => ({ ...prev, password: "" }));
          }}
        />
        <div className="flex items-end gap-3">
          <Input
            className="flex-1"
            errorMessage={errors.captcha}
            isInvalid={!!errors.captcha}
            label="图形验证码"
            maxLength={6}
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
        <div className="flex py-2 px-1 justify-between">
          <Button
            className="w-full"
            color="primary"
            isLoading={isLoading}
            onPress={handleSubmit}
          >
            登录
          </Button>
        </div>
        <div className="flex items-center justify-between px-1">
          <Link color="primary" size="sm" onPress={onForgot}>
            无法登录？
          </Link>
          {siteEmail && (
            <Link color="secondary" href={`mailto:${siteEmail}`} size="sm">
              联系支持
            </Link>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
