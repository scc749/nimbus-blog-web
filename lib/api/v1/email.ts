import { userRequest } from "../http";

export interface SendCodeBody {
  email: string;
  captcha_id: string;
  captcha: string;
}

export async function sendEmailCode(body: SendCodeBody): Promise<void> {
  await userRequest<void>("/email/send-code", {
    method: "POST",
    body,
  });
}
