import { userRequest } from "../http";

export interface SubmitFeedbackBody {
  name: string;
  email: string;
  type?: string;
  subject?: string;
  message: string;
}

export async function submitFeedback(body: SubmitFeedbackBody): Promise<void> {
  await userRequest<void>("/feedbacks", {
    method: "POST",
    body,
  });
}
