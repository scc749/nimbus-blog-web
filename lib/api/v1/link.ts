import type { LinkDetail } from "../types";

import { userRequest } from "../http";

export async function listLinks(): Promise<LinkDetail[]> {
  return userRequest<LinkDetail[]>("/links", { method: "GET" });
}
