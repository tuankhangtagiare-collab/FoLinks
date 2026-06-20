import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "byteforge_1";
  
  // Update role to SUPER_ADMIN and status to ACTIVE
  const updatedUser = await prisma.user.update({
    where: { username },
    data: {
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`=== USER PROMOTED SUCCESSFULLY ===`);
  console.log(`ID: ${updatedUser.id}`);
  console.log(`Username: ${updatedUser.username}`);
  console.log(`Role: ${updatedUser.role}`);
  console.log(`Status: ${updatedUser.status}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
