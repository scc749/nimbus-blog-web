import type { UserProfile } from "../types";

import { userRequest } from "../http";

export interface UpdateProfileBody {
  name?: string;
  bio?: string;
  region?: string;
  blog_url?: string;
  show_full_profile?: boolean;
}

export interface ChangePasswordBody {
  old_password: string;
  new_password: string;
}

export async function getMe(): Promise<UserProfile> {
  return userRequest<UserProfile>("/user/me", { method: "GET" }, true);
}

export async function updateProfile(body: UpdateProfileBody): Promise<void> {
  await userRequest<void>(
    "/user/profile",
    {
      method: "PUT",
      body,
    },
    true,
  );
}

export async function changePassword(body: ChangePasswordBody): Promise<void> {
  await userRequest<void>(
    "/user/password",
    {
      method: "PUT",
      body,
    },
    true,
  );
}
