import type { CaptchaDTO } from "../types";

import { userRequest } from "../http";

export async function generateCaptcha(): Promise<CaptchaDTO> {
  return userRequest<CaptchaDTO>("/captcha/generate", { method: "GET" });
}
