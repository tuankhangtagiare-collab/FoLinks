import prisma from "./db";

export interface AdsterraConfig {
  publisherId: string;
  directLink: string;
  bannerZone: string;
  socialBarZone: string;
  nativeZone: string;
  popunderZone: string;
  enableDirectLink: boolean;
  enableBanner: boolean;
  enableSocialBar: boolean;
  enableNative: boolean;
  enablePopunder: boolean;
}

let cachedConfig: AdsterraConfig | null = null;
let cacheExpiry = 0;

/**
   * Reads unified configuration from Database or fallbacks to `.env` parameters.
   */
export async function getAdsterraConfig(): Promise<AdsterraConfig> {
  const now = Date.now();
  if (cachedConfig && now < cacheExpiry) {
    return cachedConfig;
  }

  try {
    const dbConfig = await prisma.adsterraSettings.findFirst();
    
    const config: AdsterraConfig = {
      publisherId: dbConfig?.publisherId || process.env.ADSTERRA_PUBLISHER_ID || "",
      directLink: dbConfig?.directLink || process.env.ADSTERRA_DIRECT_LINK || "",
      bannerZone: dbConfig?.bannerZone || process.env.ADSTERRA_BANNER_ZONE || "",
      socialBarZone: dbConfig?.socialBarZone || process.env.ADSTERRA_SOCIAL_BAR_ZONE || "",
      nativeZone: dbConfig?.nativeZone || process.env.ADSTERRA_NATIVE_ZONE || "",
      popunderZone: dbConfig?.popunderZone || process.env.ADSTERRA_POPUNDER_ZONE || "",
      enableDirectLink: dbConfig ? dbConfig.enableDirectLink : !!process.env.ADSTERRA_DIRECT_LINK,
      enableBanner: dbConfig ? dbConfig.enableBanner : !!process.env.ADSTERRA_BANNER_ZONE,
      enableSocialBar: dbConfig ? dbConfig.enableSocialBar : !!process.env.ADSTERRA_SOCIAL_BAR_ZONE,
      enableNative: dbConfig ? dbConfig.enableNative : !!process.env.ADSTERRA_NATIVE_ZONE,
      enablePopunder: dbConfig ? dbConfig.enablePopunder : !!process.env.ADSTERRA_POPUNDER_ZONE,
    };

    cachedConfig = config;
    cacheExpiry = now + 60000; // Cache config for 60 seconds
    return config;
  } catch (err) {
    console.warn("Adsterra Config read error, using env values:", err);
    return {
      publisherId: process.env.ADSTERRA_PUBLISHER_ID || "",
      directLink: process.env.ADSTERRA_DIRECT_LINK || "",
      bannerZone: process.env.ADSTERRA_BANNER_ZONE || "",
      socialBarZone: process.env.ADSTERRA_SOCIAL_BAR_ZONE || "",
      nativeZone: process.env.ADSTERRA_NATIVE_ZONE || "",
      popunderZone: process.env.ADSTERRA_POPUNDER_ZONE || "",
      enableDirectLink: !!process.env.ADSTERRA_DIRECT_LINK,
      enableBanner: !!process.env.ADSTERRA_BANNER_ZONE,
      enableSocialBar: !!process.env.ADSTERRA_SOCIAL_BAR_ZONE,
      enableNative: !!process.env.ADSTERRA_NATIVE_ZONE,
      enablePopunder: !!process.env.ADSTERRA_POPUNDER_ZONE,
    };
  }
}

export async function isDirectLinkEnabled(): Promise<boolean> {
  const conf = await getAdsterraConfig();
  return conf.enableDirectLink && !!conf.directLink;
}

export async function isBannerEnabled(): Promise<boolean> {
  const conf = await getAdsterraConfig();
  return conf.enableBanner && !!conf.bannerZone;
}

export async function isSocialBarEnabled(): Promise<boolean> {
  const conf = await getAdsterraConfig();
  return conf.enableSocialBar && !!conf.socialBarZone;
}

export async function isNativeEnabled(): Promise<boolean> {
  const conf = await getAdsterraConfig();
  return conf.enableNative && !!conf.nativeZone;
}

export async function isPopunderEnabled(): Promise<boolean> {
  const conf = await getAdsterraConfig();
  return conf.enablePopunder && !!conf.popunderZone;
}
