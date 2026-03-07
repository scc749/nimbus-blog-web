import type { SiteSettingDetail } from "../types";

import { userRequest } from "../http";

export async function listSettings(): Promise<SiteSettingDetail[]> {
  return userRequest<SiteSettingDetail[]>("/settings", {
    method: "GET",
    cache: "no-store",
  });
}

export type SettingsMap = Record<string, string>;

export async function fetchSettingsMap(): Promise<SettingsMap> {
  const list = await listSettings();

  return Object.fromEntries(list.map((s) => [s.setting_key, s.setting_value]));
}
