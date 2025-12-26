export interface LoginRequest {
  username: string;
  password: string;
  recaptchaToken?: string;
}

export interface JwtResponse {
  message: string;
  token: string;
  createAt: string;
}
