"use client";

import { useState, useEffect } from "react";
import Icon from "./Icon";
import type { PromoFromNotion } from "@/app/api/promos/route";

// gtag.js の型定義（GA4用）
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ========================================
// 背景カラーマッピング
// ========================================
const bgGradients: Record<string, string> = {
  dark: "from-gray-900 via-gray-800 to-gray-900",
  green: "from-green-900 via-emerald-800 to-green-900",
  purple: "from-purple-900 via-purple-800 to-purple-900",
  blue: "from-blue-900 via-blue-800 to-blue-900",
  red: "from-red-900 via-red-800 to-red-900",
  orange: "from-orange-900 via-orange-800 to-orange-900",
};

const labelColors: Record<string, string> = {
  dark: "bg-yellow-500 text-black",
  green: "bg-green-500 text-white",
  purple: "bg-purple-500 text-white",
  blue: "bg-blue-500 text-white",
  red: "bg-red-500 text-white",
  orange: "bg-orange-500 text-white",
};

// ========================================
// GA4 イベント送信ヘルパー
// gtag.js が読み込まれている場合のみ送信
// ========================================
function sendGA4Event(action: string, promoId: string, label: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: "sticky_promo_banner",
      event_label: label,
      promo_id: promoId,
    });
  }
}

// ========================================
// 確率分布での重み付き抽選
// showProbability は「割合（=重み）」として扱う。
// 楽天toto:5割 / ドコモスポーツくじ:3割 / WOWOW:1割 / DAZN for BUSINESS:1割。
// DMM × DAZNホーダイ は当面フッタ非表示なので含めない。
// ========================================
const fallbackPromos: PromoFromNotion[] = [
  {
    id: "toto-rakuten",
    title: "楽天totoでW杯を予想",
    label: "W杯を予想",
    description: "楽天IDでそのまま購入。toto・BIG・WINNERで試合結果を予想しよう",
    ctaText: "楽天totoを見る",
    ctaUrl: "https://hb.afl.rakuten.co.jp/hsc/27bd08bb.b74c49ca.27b9c67d.af1b1692/?link_type=text&ut=eyJwYWdlIjoic2hvcCIsInR5cGUiOiJ0ZXh0IiwiY29sIjoxLCJjYXQiOjEsImJhbiI6Im5hbWUiLCJhbXAiOmZhbHNlfQ%3D%3D",
    trackingPixel: null,
    bgColor: "red",
    showProbability: 0.5,
    cooldownHours: 48,
    sortOrder: 1,
  },
  {
    id: "toto-docomo",
    title: "ドコモスポーツくじ",
    label: "W杯を予想",
    description: "toto・BIG・WINNERで試合結果を予想しよう",
    ctaText: "無料登録する",
    ctaUrl: "https://tr.affiliate-sp.docomo.ne.jp/cl/d0000000359/4739/3",
    trackingPixel: null,
    bgColor: "purple",
    showProbability: 0.3,
    cooldownHours: 48,
    sortOrder: 2,
  },
  {
    id: "wowow",
    title: "WOWOW",
    label: "CL・ラリーガ",
    description: "W杯出場選手のクラブでの活躍もチェック！月額2,530円",
    ctaText: "詳細を見る",
    ctaUrl: "https://h.accesstrade.net/sp/cc?rk=0100pjmj00opav",
    trackingPixel: "https://h.accesstrade.net/sp/rr?rk=0100pjmj00opav",
    bgColor: "blue",
    showProbability: 0.1,
    cooldownHours: 48,
    sortOrder: 3,
  },
  {
    id: "dazn-business",
    title: "DAZN for BUSINESS",
    label: "法人向け",
    description: "お店でW杯全試合を上映！飲食店・スポーツバー向け",
    ctaText: "詳細を見る",
    ctaUrl: "https://h.accesstrade.net/sp/cc?rk=0100ph9q00opav",
    trackingPixel: "https://h.accesstrade.net/sp/rr?rk=0100ph9q00opav",
    bgColor: "dark",
    showProbability: 0.1,
    cooldownHours: 48,
    sortOrder: 4,
  },
];

// ========================================
// localStorage
// ========================================
const STORAGE_PREFIX = "promo_dismissed_";

function isDismissed(promoId: string, cooldownHours: number): boolean {
  if (typeof window === "undefined") return true;
  try {
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${promoId}`);
    if (!dismissed) return false;
    const dismissedAt = parseInt(dismissed, 10);
    return Date.now() - dismissedAt < cooldownHours * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function setDismissed(promoId: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${promoId}`, Date.now().toString());
  } catch { /* localStorage unavailable */ }
}

// ========================================
// 確率に応じた重み付き選択
// 各 promo の showProbability を重みとして扱い、合計で正規化して抽選する
// ========================================
function pickWeighted(promos: PromoFromNotion[]): PromoFromNotion | null {
  if (promos.length === 0) return null;
  const totalWeight = promos.reduce((s, p) => s + Math.max(0, p.showProbability), 0);
  if (totalWeight <= 0) {
    // 全て0なら順序通り最初の一つを返す
    return promos[0];
  }
  const r = Math.random() * totalWeight;
  let acc = 0;
  for (const p of promos) {
    acc += Math.max(0, p.showProbability);
    if (r < acc) return p;
  }
  return promos[promos.length - 1];
}

// ========================================
// メインコンポーネント
// ========================================
// 遷移直後にバナーが下部に張り付いて表示されるのを避けるため、
// 一定スクロール（=ユーザーがページを読み始めた合図）後に初めて出す
const SCROLL_THRESHOLD_PX = 600;

export default function StickyPromoBanner() {
  const [promo, setPromo] = useState<PromoFromNotion | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAndSelect() {
      // Notion API経由でプロモ設定を取得
      let promos: PromoFromNotion[] = fallbackPromos;
      try {
        const res = await fetch("/api/promos", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.promos && data.promos.length > 0) {
            promos = data.promos;
          }
        }
      } catch {
        // API失敗時はフォールバック
      }

      if (cancelled) return;

      // 非表示期間チェック
      const candidates = promos.filter(
        (p) => !isDismissed(p.id, p.cooldownHours)
      );
      if (candidates.length === 0) return;

      // showProbability を重みとした確率分布で選出
      const selected = pickWeighted(candidates);
      if (!selected) return;
      setPromo(selected);

      // ページビュー数も従来通り保持（A/Bや他機能で利用可）
      try {
        const vc = parseInt(localStorage.getItem("promo_view_count") || "0", 10);
        localStorage.setItem("promo_view_count", (vc + 1).toString());
      } catch { /* localStorage unavailable */ }

      // GA4: バナー表示イベント
      sendGA4Event("promo_view", selected.id, selected.title);
    }

    loadAndSelect();
    return () => { cancelled = true; };
  }, []);

  // スクロールで一定量読み進めたら初めてスライドインさせる
  useEffect(() => {
    if (!promo || visible) return;
    const checkScroll = () => {
      if (window.scrollY >= SCROLL_THRESHOLD_PX) {
        setVisible(true);
      }
    };
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, [promo, visible]);

  const handleClick = () => {
    if (!promo) return;
    // GA4: CTAクリックイベント
    sendGA4Event("promo_click", promo.id, promo.title);
  };

  const handleClose = () => {
    if (!promo) return;
    // GA4: 閉じるイベント
    sendGA4Event("promo_close", promo.id, promo.title);
    setClosing(true);
    setDismissed(promo.id);
    setTimeout(() => {
      setVisible(false);
      setPromo(null);
    }, 300);
  };

  if (!promo || !visible) return null;

  const isExternal = promo.ctaUrl.startsWith("http");
  const gradient = bgGradients[promo.bgColor] || bgGradients.dark;
  const labelColor = labelColors[promo.bgColor] || labelColors.dark;
  const isLine = promo.id === "line-friend";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        closing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className={`bg-gradient-to-r ${gradient} border-t border-white/10 shadow-2xl`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
          {/* バッジ＋テキスト */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <span className={`${labelColor} text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
              {promo.label}
            </span>
            <div className="min-w-0">
              <p className="text-white text-sm sm:text-base font-bold truncate">
                {promo.title}
              </p>
              <p className="text-gray-400 text-[10px] sm:text-xs truncate hidden sm:block">
                {promo.description}
              </p>
            </div>
          </div>

          {/* CTA ボタン */}
          <a
            href={promo.ctaUrl}
            target="_blank"
            rel={isLine ? "noopener noreferrer" : "nofollow sponsored noopener noreferrer"}
            onClick={handleClick}
            data-promo-id={promo.id}
            data-promo-name={promo.title}
            className="shrink-0 bg-white text-black text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          >
            {promo.ctaText}
            <Icon name={isLine ? "arrow_forward" : "open_in_new"} size={14} />
          </a>

          {/* トラッキングピクセル */}
          {promo.trackingPixel && (
            <img src={promo.trackingPixel} width="1" height="1" alt="" className="hidden" />
          )}

          {/* 閉じるボタン */}
          <button
            onClick={handleClose}
            className="shrink-0 text-gray-500 hover:text-white transition-colors p-1"
            aria-label="閉じる"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* PR表記（LINE以外） */}
        {!isLine && (
          <div className="text-center pb-1">
            <span className="text-[9px] text-gray-600">広告・PR</span>
          </div>
        )}
      </div>
    </div>
  );
}
