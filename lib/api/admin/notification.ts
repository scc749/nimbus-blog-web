import { adminRequest } from "../http";

export interface SendNotificationBody {
  user_id: number;
  title: string;
  content: string;
}

export async function sendNotification(
  body: SendNotificationBody,
): Promise<void> {
  await adminRequest<void>("/notifications", {
    method: "POST",
    body,
  });
}
