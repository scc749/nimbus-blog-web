import { getApiBase } from "../http";

/**
 * 将 MinIO object key 转为公开可访问的文件 URL。
 * 后端 GET /api/v1/files/* 会 307 重定向到 MinIO 预签名 URL。
 */
export function getFileURL(key: string): string {
  if (!key) return "";

  return `${getApiBase()}/api/v1/files/${key}`;
}

/**
 * 解析图片路径：
 * - 以 / 或 http 开头 → 直接使用（本地静态文件或外部 URL）
 * - 否则视为 MinIO object key → 走 getFileURL
 */
export function resolveImageURL(value: string): string {
  if (!value) return "";
  if (value.startsWith("/") || value.startsWith("http")) return value;

  return getFileURL(value);
}
