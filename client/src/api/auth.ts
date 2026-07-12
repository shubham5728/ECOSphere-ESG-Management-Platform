import { api } from "./client";
import type { ApiResponse, AuthResult, User } from "../types";

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthResult>>("/auth/login", {
    email,
    password,
  });
  return data.data;
}

export async function signupRequest(name: string, email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthResult>>("/auth/signup", {
    name,
    email,
    password,
  });
  return data.data;
}

export async function meRequest() {
  const { data } = await api.get<ApiResponse<User>>("/auth/me");
  return data.data;
}
