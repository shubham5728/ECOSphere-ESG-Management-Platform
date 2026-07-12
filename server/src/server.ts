import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function bootstrap() {
  // Verify DB connectivity before accepting traffic.
  await prisma.$connect();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`🌱 EcoSphere API running at http://localhost:${env.port}`);
    console.log(`   Environment: ${env.nodeEnv}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
