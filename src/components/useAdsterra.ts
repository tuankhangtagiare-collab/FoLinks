import { useEffect, useState } from "react";

export interface AdsterraHookResult {
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
  isLoading: boolean;
}

/**
 * Client React Hook to access reactive Adsterra variables safely
 */
export function useAdsterra(): AdsterraHookResult {
  const [ads, setAds] = useState<AdsterraHookResult>({
    publisherId: "",
    directLink: "",
    bannerZone: "",
    socialBarZone: "",
    nativeZone: "",
    popunderZone: "",
    enableDirectLink: false,
    enableBanner: false,
    enableSocialBar: false,
    enableNative: false,
    enablePopunder: false,
    isLoading: true,
  });

  useEffect(() => {
    let active = true;
    async function fetchConfig() {
      try {
        const res = await fetch("/api/public/adsterra");
        if (res.ok) {
          const data = await res.json();
          if (active && data.settings) {
            setAds({
              publisherId: data.settings.publisherId || "",
              directLink: data.settings.directLink || "",
              bannerZone: data.settings.bannerZone || "",
              socialBarZone: data.settings.socialBarZone || "",
              nativeZone: data.settings.nativeZone || "",
              popunderZone: data.settings.popunderZone || "",
              enableDirectLink: data.settings.enableDirectLink,
              enableBanner: data.settings.enableBanner,
              enableSocialBar: data.settings.enableSocialBar,
              enableNative: data.settings.enableNative,
              enablePopunder: data.settings.enablePopunder,
              isLoading: false,
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load client ad settings:", err);
      }
    }
    fetchConfig();
    return () => {
      active = false;
    };
  }, []);

  return ads;
}
