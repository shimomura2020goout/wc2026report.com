"use client";

import { useState, useEffect, useCallback } from "react";
import Icon from "./Icon";

type Platform = "ios" | "android" | "pc" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "pc";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

const DISMISS_KEY = "wc2026_install_dismissed";
const DISMISS_DAYS = 7;

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // すでにインストール済み（スタンドアロン）なら表示しない
    if (isStandalone()) return;

    // 閉じた記録があれば表示しない
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    setPlatform(detectPlatform());

    // 初回訪問は少し待ってから表示（3秒後）
    const timer = setTimeout(() => setShow(true), 3000);

    // PWAインストール可能なら beforeinstallprompt をキャッチ
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // SW登録
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const dismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  const handleInstallPWA = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!show) return null;

  return (
    <>
      {/* オーバーレイ（モバイルのみ） */}
      <div className="fixed inset-0 bg-black/40 z-[60] sm:hidden" onClick={dismiss} />

      <div className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 z-[61] animate-slide-up">
        <div className="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-[#1a1a2e] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Icon name="sports_soccer" size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">W杯2026 x toto</p>
                <p className="text-[11px] text-gray-400">ホーム画面に追加しませんか？</p>
              </div>
            </div>
            <button onClick={dismiss} className="text-gray-400 hover:text-white p-1">
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="px-5 py-4">
            {/* PWAインストール可能な場合 */}
            {deferredPrompt ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  ワンタップでホーム画面に追加。試合日程・視聴ガイドにすぐアクセスできます。
                </p>
                <button
                  onClick={handleInstallPWA}
                  className="w-full bg-[#1a1a2e] text-white font-bold py-3 rounded-xl hover:bg-[#16213e] transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="add_to_home_screen" size={20} />
                  ホーム画面に追加
                </button>
              </>
            ) : platform === "ios" ? (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  アプリのように使えます！以下の手順でホーム画面に追加してください。
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="ios_share" size={18} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-700"><strong>Step 1:</strong> 画面下の<strong>共有ボタン</strong>をタップ</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="add_box" size={18} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-700"><strong>Step 2:</strong> 「<strong>ホーム画面に追加</strong>」を選択</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="check_circle" size={18} className="text-green-600" />
                    </div>
                    <p className="text-xs text-gray-700"><strong>Step 3:</strong> 右上の「<strong>追加</strong>」をタップで完了！</p>
                  </div>
                </div>
              </>
            ) : platform === "android" ? (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  アプリのように使えます！以下の手順でホーム画面に追加してください。
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="more_vert" size={18} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-700"><strong>Step 1:</strong> 右上の <strong>⋮ メニュー</strong>をタップ</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="add_to_home_screen" size={18} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-700"><strong>Step 2:</strong> 「<strong>ホーム画面に追加</strong>」を選択</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="check_circle" size={18} className="text-green-600" />
                    </div>
                    <p className="text-xs text-gray-700"><strong>Step 3:</strong> 「<strong>追加</strong>」で完了！</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  ブックマークに追加して、いつでもすぐにアクセスできるようにしましょう。
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="star" size={18} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-700">
                      <strong>Ctrl + D</strong>（Mac: <strong>Cmd + D</strong>）でブックマークに追加
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="bookmark" size={18} className="text-amber-600" />
                    </div>
                    <p className="text-xs text-gray-700">
                      ブックマークバーに追加すれば、ワンクリックでアクセスできます
                    </p>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={dismiss}
              className="w-full text-center text-xs text-gray-400 mt-3 py-2 hover:text-gray-600"
            >
              あとで
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
