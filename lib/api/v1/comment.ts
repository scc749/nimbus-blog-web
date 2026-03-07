import type { CommentBasic, LikeInfoDTO, CreateResultDTO } from "../types";

import { userRequest } from "../http";

export interface SubmitCommentBody {
  parent_id?: number | null;
  content: string;
}

export async function listComments(postId: number): Promise<CommentBasic[]> {
  return userRequest<CommentBasic[]>(
    `/content/posts/${postId}/comments`,
    { method: "GET" },
    true,
  );
}

export async function submitComment(
  postId: number,
  body: SubmitCommentBody,
): Promise<CreateResultDTO> {
  return userRequest<CreateResultDTO>(
    `/content/posts/${postId}/comments`,
    { method: "POST", body },
    true,
  );
}

export async function toggleCommentLike(id: number): Promise<LikeInfoDTO> {
  return userRequest<LikeInfoDTO>(
    `/comments/${id}/likes`,
    { method: "POST" },
    true,
  );
}

export async function removeCommentLike(id: number): Promise<LikeInfoDTO> {
  return userRequest<LikeInfoDTO>(
    `/comments/${id}/likes`,
    { method: "DELETE" },
    true,
  );
}

export async function deleteComment(id: number): Promise<void> {
  await userRequest<void>(`/comments/${id}`, { method: "DELETE" }, true);
}
