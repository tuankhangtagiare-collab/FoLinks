import { PrismaClient, Role, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Create Default Admin User
  const adminEmail = "admin@folink.com";
  const adminUsername = "admin";
  const defaultPassword = "AdminSecurePassword123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        passwordHash,
        displayName: "Folink Admin",
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        referralCode: "FOLINKADMIN",
        language: "vi",
        timezone: "Asia/Ho_Chi_Minh",
        emailVerified: new Date(),
      },
    });
    console.log(`Created admin account: ${adminEmail} / ${defaultPassword}`);

    // Create Wallet for Admin
    await prisma.wallet.create({
      data: {
        userId: admin.id,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdraw: 0,
        currency: "USD",
      },
    });
    console.log("Created admin wallet.");
  } else {
    console.log("Admin account already exists.");
  }

  // 2. Create Default SiteSettings
  const settingsCount = await prisma.siteSettings.count();
  if (settingsCount === 0) {
    await prisma.siteSettings.create({
      data: {
        websiteName: "Folink - Smart Link Monetization Platform",
        logo: "/logo.png",
        favicon: "/favicon.ico",
        description: "Rút gọn liên kết kiếm tiền với CPM cao và bảo mật vượt trội.",
        supportEmail: "support@folink.com",
        maintenance: false,
        maintenanceMessage: "Hệ thống đang được bảo trì định kỳ. Vui lòng quay lại sau.",
        minimumWithdraw: 5.00,
        maximumWithdraw: 1000.00,
        referralPercent: 10.00,
        defaultCpm: 3.00,
        captchaEnabled: true,
        countdownSeconds: 15,
        cloudinaryKey: process.env.CLOUDINARY_KEY || "",
        cloudinarySecret: process.env.CLOUDINARY_SECRET || "",
        cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        adsterraPublisherId: "",
      },
    });
    console.log("Created default site settings.");
  } else {
    console.log("Site settings already exist.");
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
