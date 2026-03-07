import type { FileUploadURLDTO, FileDetailDTO, Page } from "../types";

import { adminRequest } from "../http";

export interface ListFilesQuery {
  page?: number;
  page_size?: number;
  usage?: string;
  sort_by?: string;
  order?: string;
}

export async function listFiles(
  query?: ListFilesQuery,
): Promise<Page<FileDetailDTO>> {
  const params = new URLSearchParams();

  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.usage) params.set("filter.usage", query.usage);
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.order) params.set("order", query.order);

  const qs = params.toString();

  return adminRequest<Page<FileDetailDTO>>(`/files${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
}

export interface GenerateUploadURLBody {
  upload_type: string;
  content_type: string;
  file_name: string;
  file_size: number;
  resource_id?: number;
  expiry_seconds?: number;
}

export async function generateUploadURL(
  body: GenerateUploadURLBody,
): Promise<FileUploadURLDTO> {
  return adminRequest<FileUploadURLDTO>("/files/upload-url", {
    method: "POST",
    body,
  });
}

export async function deleteFile(key: string): Promise<void> {
  await adminRequest<void>(`/files/${key}`, {
    method: "DELETE",
  });
}

/**
 * 上传文件到预签名 URL（PUT 直传 MinIO）
 */
export async function uploadFileToPresignedURL(
  uploadURL: string,
  file: File,
): Promise<void> {
  const res = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
}
