"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { Shield, Sparkles, RefreshCw, Lock, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import { useAdsterra } from "@/components/useAdsterra";

// Safe Dynamic Script Injector for Adsterra Banner (300x250 format)
function AdsterraBanner({ zoneId }: { zoneId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoneId || !containerRef.current) return;

    // Clear previous banner instance
    containerRef.current.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.id = `container-${zoneId}`;
    containerRef.current.appendChild(wrapper);

    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.innerHTML = `
      atOptions = {
        'key' : '${zoneId}',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    containerRef.current.appendChild(configScript);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;
    containerRef.current.appendChild(script);
  }, [zoneId]);

  return <div ref={containerRef} className="w-full flex justify-center py-2 min-h-[250px] bg-slate-950/20 border border-slate-800 rounded-xl" />;
}

// Safe Dynamic Script Injector for Adsterra Native Ads
function AdsterraNative({ zoneId }: { zoneId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoneId || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.id = `container-native-${zoneId}`;
    containerRef.current.appendChild(wrapper);

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;
    containerRef.current.appendChild(script);
  }, [zoneId]);

  return <div ref={containerRef} className="w-full py-2 min-h-[100px]" />;
}

export default function LinkBypassPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const ads = useAdsterra(); // Hook to fetch publisher ad codes dynamically

  // States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [linkData, setLinkData] = useState<any>(null);
  
  // Password protection
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);

  // Visit session parameters
  const [visitToken, setVisitToken] = useState("");
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1); // Steps: 1 (Banner), 2 (Social Bar), 3 (Captcha), 4 (Get Link), 5 (Redirecting)
  const [countdown, setCountdown] = useState(15);
  const [countdownActive, setCountdownActive] = useState(false);

  // Refs for Turnstile
  const turnstileRef = useRef<HTMLDivElement>(null);

  // Load public link info
  useEffect(() => {
    fetchLinkInfo();
  }, [slug]);

  // Social Bar script injection (runs dynamically once configuration is fetched)
  useEffect(() => {
    if (ads.enableSocialBar && ads.socialBarZone) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `//www.highperformanceformat.com/${ads.socialBarZone}/invoke.js`;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [ads.enableSocialBar, ads.socialBarZone]);

  // Popunder script injection (runs dynamically once configuration is fetched)
  useEffect(() => {
    if (ads.enablePopunder && ads.popunderZone) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `//www.highperformanceformat.com/51/ae/79/51ae797372cf93b08e2f6943bf7e4361.js`; // Standard popunder execution code using Zone ID mapping
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [ads.enablePopunder, ads.popunderZone]);

  const fetchLinkInfo = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/link/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải liên kết.");

      setLinkData(data);
      if (data.hasPassword) {
        setPasswordRequired(true);
      } else {
        startVisitSession("");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFingerprintAndBotFlags = async () => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as any;
    let renderer = "";
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "";
    }

    const fingerprintRaw = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      renderer,
    };

    const msgUint8 = new TextEncoder().encode(JSON.stringify(fingerprintRaw));
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fingerprintHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const webdriver = navigator.webdriver || false;
    const headless = /HeadlessChrome/.test(navigator.userAgent) || window.outerHeight === 0 || window.outerWidth === 0;

    return {
      fingerprint: fingerprintHash,
      webdriver,
      headless,
    };
  };

  const startVisitSession = async (passVal: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const clientFlags = await getFingerprintAndBotFlags();

      const res = await fetch("/api/visit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          password: passVal,
          ...clientFlags,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khởi tạo lượt truy cập.");

      setVisitToken(data.token);
      setSiteSettings(data.settings);
      setPasswordRequired(false);

      // Start countdown step 1
      setCountdown(data.settings.countdownSeconds);
      setCountdownActive(true);
      setCurrentStep(1);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (countdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && countdownActive) {
      setCountdownActive(false);
    }
    return () => clearInterval(timer);
  }, [countdown, countdownActive]);

  const handleNextStep = async () => {
    // Open Direct Link in a new tab when clicking next step as extra monetization (if enabled)
    if (ads.enableDirectLink && ads.directLink) {
      window.open(ads.directLink, "_blank", "noopener,noreferrer");
    }

    if (currentStep === 1) {
      setLoading(true);
      try {
        const res = await fetch("/api/visit/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: visitToken, targetStep: 2 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setVisitToken(data.token);
        setCurrentStep(2);
        setCountdown(siteSettings.countdownSeconds);
        setCountdownActive(true);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 2) {
      setLoading(true);
      try {
        const res = await fetch("/api/visit/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: visitToken, targetStep: 3 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setVisitToken(data.token);
        setCurrentStep(3);

        if (siteSettings.captchaEnabled) {
          setTimeout(() => renderTurnstile(), 500);
        } else {
          verifyCaptcha("development-mock-token");
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderTurnstile = () => {
    if ((window as any).turnstile) {
      (window as any).turnstile.render(turnstileRef.current, {
        sitekey: "1x00000000000000000000AA",
        callback: (token: string) => {
          verifyCaptcha(token);
        },
      });
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => renderTurnstile();
    }
  };

  const verifyCaptcha = async (captchaToken: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: visitToken, captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVisitToken(data.token);
      setCurrentStep(4);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLink = async () => {
    // Open Direct Link on final click as well
    if (ads.enableDirectLink && ads.directLink) {
      window.open(ads.directLink, "_blank", "noopener,noreferrer");
    }

    setLoading(true);
    try {
      const rewardRes = await fetch("/api/visit/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: visitToken }),
      });
      const rewardData = await rewardRes.json();
      if (!rewardRes.ok) throw new Error(rewardData.error);

      const nextTok = rewardData.token;
      setCurrentStep(5);

      const redirectRes = await fetch("/api/visit/redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: nextTok }),
      });
      const redirectData = await redirectRes.json();
      if (!redirectRes.ok) throw new Error(redirectData.error);

      window.location.replace(redirectData.originalUrl);

    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6">
      {/* Top Navbar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
          Folink
        </span>
        <span className="text-xs text-slate-500 flex items-center">
          <Shield className="h-3.5 w-3.5 mr-1" />
          Bypass Secure Sandbox
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full flex-1 flex flex-col items-center justify-center my-8">
        {loading ? (
          <div className="text-center space-y-4">
            <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Vui lòng đợi trong giây lát...</p>
          </div>
        ) : errorMsg ? (
          <div className="border border-red-500/20 bg-red-950/15 p-6 rounded-2xl text-center space-y-4 max-w-sm">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-400">Đã xảy ra sự cố</h3>
            <p className="text-xs text-red-300">{errorMsg}</p>
            <button
              onClick={fetchLinkInfo}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-all"
            >
              Thử lại
            </button>
          </div>
        ) : passwordRequired ? (
          <div className="w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-indigo-400">
              <Lock className="h-6 w-6" />
              <h3 className="font-bold">Liên kết bảo vệ mật khẩu</h3>
            </div>
            <p className="text-xs text-slate-400">Vui lòng điền chính xác mật khẩu của liên kết này để tiếp tục.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                startVisitSession(password);
              }}
              className="space-y-4"
            >
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>Xác nhận</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-semibold px-2">
              <span>Tiến trình</span>
              <span>Bước {currentStep} / 4</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-center space-y-6 shadow-xl relative overflow-hidden">
              {currentStep === 1 && (
                <>
                  <Sparkles className="h-8 w-8 text-indigo-400 mx-auto animate-pulse" />
                  <div>
                    <h3 className="font-bold text-lg">Bước 1: Tải Banner Tài Trợ</h3>
                    <p className="text-xs text-slate-500 mt-1">Đang tải tài nguyên quảng cáo...</p>
                  </div>

                  {/* Render Adsterra Banner Dynamically */}
                  {ads.enableBanner && ads.bannerZone ? (
                    <AdsterraBanner zoneId={ads.bannerZone} />
                  ) : (
                    <div className="h-28 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                      <span>Đang cấu hình nhà tài trợ quảng cáo...</span>
                    </div>
                  )}

                  {countdownActive ? (
                    <div className="text-sm font-bold text-indigo-400">Vui lòng đợi: {countdown}s</div>
                  ) : (
                    <button
                      onClick={handleNextStep}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-lg transition-all"
                    >
                      Tiếp tục bước 2
                    </button>
                  )}
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Sparkles className="h-8 w-8 text-indigo-400 mx-auto animate-pulse" />
                  <div>
                    <h3 className="font-bold text-lg">Bước 2: Xác nhận phiên quảng cáo</h3>
                    <p className="text-xs text-slate-500 mt-1">Countdown xác nhận đang đếm ngược...</p>
                  </div>

                  {/* Render Native Banner Ad if configured */}
                  {ads.enableNative && ads.nativeZone ? (
                    <AdsterraNative zoneId={ads.nativeZone} />
                  ) : (
                    <div className="h-20 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                      <span>Đang tải thông điệp quảng cáo tài trợ...</span>
                    </div>
                  )}

                  {countdownActive ? (
                    <div className="text-sm font-bold text-indigo-400">Vui lòng đợi: {countdown}s</div>
                  ) : (
                    <button
                      onClick={handleNextStep}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-lg transition-all"
                    >
                      Tiếp tục bước 3
                    </button>
                  )}
                </>
              )}

              {currentStep === 3 && (
                <>
                  <Shield className="h-8 w-8 text-indigo-400 mx-auto" />
                  <div>
                    <h3 className="font-bold text-lg">Bước 3: Xác minh bạn là con người</h3>
                    <p className="text-xs text-slate-500 mt-1">Nhấp chọn hộp CAPTCHA bên dưới để tiếp tục bảo mật.</p>
                  </div>

                  <div className="flex justify-center p-2">
                    <div ref={turnstileRef} id="cf-turnstile"></div>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                  <div>
                    <h3 className="font-bold text-lg">Xác minh hoàn tất!</h3>
                    <p className="text-xs text-slate-400 mt-1">Đường dẫn đích đã được giải mã và sẵn sàng chuyển hướng.</p>
                  </div>

                  {/* Render Adsterra Banner as additional banner inside Step 4 */}
                  {ads.enableBanner && ads.bannerZone && (
                    <div className="my-2">
                      <AdsterraBanner zoneId={ads.bannerZone} />
                    </div>
                  )}

                  <button
                    onClick={handleGetLink}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-sm font-black rounded-lg shadow-lg hover:shadow-emerald-900/40 hover:scale-[1.02] transform transition-all duration-200 uppercase"
                  >
                    Lấy liên kết ngay
                  </button>
                </>
              )}

              {currentStep === 5 && (
                <div className="text-center space-y-4">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-sm text-indigo-400 font-bold">Đang chuyển hướng bạn đến URL gốc...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer disclaimer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 border-t border-slate-800 text-[10px] text-slate-600">
        Bằng cách nhấp lấy liên kết, bạn đồng ý với các Điều khoản dịch vụ và Chính sách bảo mật của Folink.
      </footer>
    </div>
  );
}
