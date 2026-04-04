"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import Icon from "./Icon";

export default function DonationBanner() {
  const [dismissed, setDismissed] = useState(true); // default hidden until check

  useEffect(() => {
    const stored = localStorage.getItem("donation_banner_dismissed");
    if (stored) {
      const expiry = Number(stored);
      if (Date.now() < expiry) return; // still within cooldown
    }
    setDismissed(false);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    // 7 days cooldown
    localStorage.setItem(
      "donation_banner_dismissed",
      String(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
  };

  if (dismissed) return null;

  return (
    <>
      <Script
        src="https://ofuse.me/assets/platform/widget.js"
        strategy="lazyOnload"
      />
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:py-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5" aria-hidden="true">
              &#9829;
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                このサイトを気に入っていただけましたか？
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                W杯2026の情報を無料でお届けするため、有志の方からの少しのご支援をお願いしております。
                いただいた支援は、サイトの運営・維持費に充てさせていただきます。
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  data-ofuse-widget-button
                  href="https://ofuse.me/o?uid=166707"
                  data-ofuse-id="166707"
                  data-ofuse-color="dark"
                  data-ofuse-text="サイトを支援する（100円から）"
                  data-ofuse-style="rectangle"
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
                >
                  <Icon name="favorite" size={16} />
                  サイトを支援する（100円から）
                </a>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  閉じる（1週間非表示）
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="閉じる"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
