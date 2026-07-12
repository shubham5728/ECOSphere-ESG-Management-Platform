import { api } from "./client";

export interface Settings {
  id: number;
  autoEmission: boolean;
  evidenceRequired: boolean;
  badgeAutoAward: boolean;
  weightEnv: number;
  weightSocial: number;
  weightGov: number;
  updatedAt: string;
}

export async function getSettings(): Promise<Settings> {
  const { data } = await api.get("/settings");
  return data.data;
}

export async function updateSettings(payload: Partial<Settings>): Promise<Settings> {
  const { data } = await api.patch("/settings", payload);
  return data.data;
}
