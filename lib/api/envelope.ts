// ApiEnvelope 后端统一响应信封。
export interface ApiEnvelope<T = unknown> {
  code: string;
  message: string;
  data?: T;
}

// ApiError API 错误（包含业务 code 与 HTTP status）。
export class ApiError extends Error {
  code: string;
  status?: number;
  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
