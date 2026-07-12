export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  points: number;
  xp: number;
  departmentId: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResult {
  user: User;
  token: string;
}
