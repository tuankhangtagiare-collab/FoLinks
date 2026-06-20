import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.adsterraSettings.findFirst();
  console.log("=== ADSTERRA CONFIG IN DATABASE ===");
  console.log(JSON.stringify(settings, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
