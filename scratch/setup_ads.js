// Re-enable ALL Adsterra ad types with old zone IDs + new popunder anti-adblock
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.adsterraSettings.findFirst();
  
  const data = {
    publisherId: "Khang_1122",
    directLink: "https://manhoodinvoluntaryplash.com/x2mnqrt9?key=20b0490a8a90cc0b8261976157e575e7",
    bannerZone: "29709713",
    socialBarZone: "29709710",
    nativeZone: "29709709",
    popunderZone: "https://manhoodinvoluntaryplash.com/ff/8f/2b/ff8f2b29918d31b261690d3eb5ef78fb.js",
    enableDirectLink: true,
    enableBanner: true,
    enableSocialBar: true,
    enableNative: true,
    enablePopunder: true,
  };

  if (existing) {
    const updated = await prisma.adsterraSettings.update({
      where: { id: existing.id },
      data,
    });
    console.log("✅ Full ads enabled:", updated);
  } else {
    const created = await prisma.adsterraSettings.create({ data });
    console.log("✅ Full ads created:", created);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
