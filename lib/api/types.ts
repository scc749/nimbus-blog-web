// Pagination 分页。

export interface Page<T> {
  list: T[];
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

// AuthAdmin 管理端认证。

export interface AdminLoginDTO {
  requires_reset: boolean;
  otp_required: boolean;
}

export interface AdminTwoFASetupStartDTO {
  setup_id: string;
  secret: string;
  qrcode_image_base64: string;
}

export interface AdminTwoFAVerifyDTO {
  enabled: boolean;
  relogin_required: boolean;
  recovery_codes: string[];
}

export interface AdminProfileDTO {
  nickname: string;
  specialization: string;
  twofa_enabled: boolean;
}

export interface AdminResetRecoveryCodesDTO {
  recovery_codes: string[];
}

// AuthUser 用户认证。

export interface UserLoginDTO {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserRefreshDTO {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserRegisterDTO {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

// Captcha 验证码。

export interface CaptchaDTO {
  captcha_id: string;
  pic_path: string;
}

// File 文件。

export interface FileUploadURLDTO {
  object_key: string;
  upload_url: string;
  expires: number;
  file_id: number;
}

export interface FileDetailDTO {
  id: number;
  object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  usage: string;
  resource_id: number | null;
  uploader_id: number;
  url: string;
  created_at: string;
}

// User 用户。

export interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  avatar: string;
  bio: string;
  status: string;
  email_verified: boolean;
  region: string | null;
  blog_url: string | null;
  show_full_profile: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserDetail extends UserProfile {
  auth_provider: string | null;
  auth_openid: string | null;
}

// Content 内容。

export interface AuthorInfo {
  id: number;
  nickname: string;
  specialization: string;
}

export interface BaseCategory {
  id: number;
  name: string;
  slug: string;
}

export interface BaseTag {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface TagDetail {
  id: number;
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface V1PostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  author_id: number;
  author: AuthorInfo;
  status: string;
  read_time: string;
  views: number;
  like: LikeInfoDTO;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: BaseCategory;
  tags: BaseTag[];
}

export interface V1PostDetail extends V1PostSummary {
  content: string;
  meta_title: string;
  meta_description: string;
}

export interface AdminPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  author_id: number;
  author: AuthorInfo;
  status: string;
  read_time: string;
  views: number;
  likes: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: BaseCategory;
  tags: BaseTag[];
}

export interface AdminPostDetail extends AdminPostSummary {
  content: string;
  meta_title: string;
  meta_description: string;
}

export interface LikeInfoDTO {
  liked: boolean | null;
  likes: number;
}

export interface CreateResultDTO {
  id: number;
}

// Comment 评论。

export interface CommentDetail {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_id: number;
  content: string;
  likes: number;
  replies_count: number;
  status: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
  user_profile: CommentUserProfile | null;
}

export interface CommentBasic {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_id: number;
  content: string;
  like: LikeInfoDTO;
  replies_count: number;
  user_profile: CommentUserProfile | null;
  created_at: string;
}

export interface CommentUserProfile {
  name: string;
  avatar: string;
  bio: string;
  status: string;
  blog_url: string | null;
  email: string | null;
  region: string | null;
}

// Feedback 反馈。

export interface FeedbackDetail {
  id: number;
  name: string;
  email: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

// Link 友链。

export interface LinkDetail {
  id: number;
  name: string;
  url: string;
  description: string | null;
  logo: string | null;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Notification 通知。

export interface NotificationDetail {
  id: number;
  type: string;
  title: string;
  content: string;
  meta: Record<string, unknown>;
  post_slug?: string | null;
  comment_id?: number | null;
  target_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCountDTO {
  count: number;
}

// Setting 设置。

export interface SiteSettingDetail {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
