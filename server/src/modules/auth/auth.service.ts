import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../lib/password";
import { signToken } from "../../lib/jwt";
import { AppError } from "../../middleware/errorHandler";
import { LoginInput, SignupInput } from "./auth.schema";

// Fields safe to return to the client (never the password hash).
const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  points: true,
  xp: true,
  departmentId: true,
  createdAt: true,
} as const;

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("Email is already registered", 409);

  const passwordHash = await hashPassword(input.password);
  // New signups default to EMPLOYEE; admins promote via the users module.
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: publicUserSelect,
  });

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return { user, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError("Invalid email or password", 401);

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new AppError("Invalid email or password", 401);

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  const { passwordHash, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
}
