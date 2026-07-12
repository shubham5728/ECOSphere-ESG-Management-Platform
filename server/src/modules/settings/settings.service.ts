import { prisma } from "../../lib/prisma";
import { UpdateSettingsInput } from "./settings.schema";

const SETTINGS_ID = 1;

/** Read the singleton settings row, creating it with defaults if missing. */
export async function getSettings() {
  return prisma.setting.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

/** Patch the singleton settings row. */
export async function updateSettings(input: UpdateSettingsInput) {
  await getSettings(); // ensure the row exists
  return prisma.setting.update({
    where: { id: SETTINGS_ID },
    data: input,
  });
}
