"use client";

import { useState, useEffect } from "react";
import Icon from "./Icon";

// ========================================
// プロモーション設定
// 管理者がここでバナーの内容を一元管理
// ========================================
export interface PromoConfig {
  id: string;               // ユニークID（localStorage保存用）
  label: string;             // バッジラベル（例: "おすすめ"）
  title: string;             // タイトル
  description: string;       // 説明
  ctaText: string;           // CTAボタンテキスト
  ctaUrl: string;            // CTAリンク先
  trackingPixel?: string;    // アフィリエイトトラッキングピクセル
  bgGradient: string;        // 背景のTailwindグラデーションクラス
  labelColor: string;        // バッジ色
  showProbability: number;   // 表示確率（0.0〜1.0）
  cooldownHours: number;     // 閉じた後の非表示期間（時間）
  isActive: boolean;         // 有効/無効
}

// ========================================
// プロモーション定義（ここで管理）
// ========================================
export const promoConfigs: PromoConfig[] = [
  {
    id: "dazn-business",
    label: "法人向け",
    title: "DAZN for BUSINESS",
    description: "お店でW杯全試合を上映！飲食店・スポーツバー向け",
    ctaText: "詳細を見る",
    ctaUrl: "https://h.accesstrade.net/sp/cc?rk=0100ph9q00opav",
    trackingPixel: "https://h.accesstrade.net/sp/rr?rk=0100ph9q00opav",
    bgGradient: "from-gray-900 via-gray-800 to-gray-900",
    labelColor: "bg-yellow-500 text-black",
    showProbability: 0.5,
    cooldownHours: 48,
    isActive: true,
  },
  {
    id: "dmm-dazn-hodai",
    label: "個人おすすめ",
    title: "DMM × DAZNホーダイ",
    description: "月額3,480円でW杯全試合＋アニメも見放題",
    ctaText: "お得に申し込む",
    ctaUrl: "/watch#dazn-personal",
    bgGradient: "from-green-900 via-emerald-800 to-green-900",
    labelColor: "bg-green-500 text-white",
    showProbability: 0.5,
    cooldownHours: 48,
    isActive: true,
  },
  {
    id: "toto-docomo",
    label: "W杯を予想",
    title: "ドコモスポーツくじ",
    description: "toto・BIG・WINNERで試合結果を予想しよう",
    ctaText: "無料登録する",
    ctaUrl: "https://tr.affiliate-sp.docomo.ne.jp/cl/d0000000359/4739/3",
    bgGradient: "from-purple-900 via-purple-800 to-purple-900",
    labelColor: "bg-purple-500 text-white",
    showProbability: 0.5,
    cooldownHours: 48,
    isActive: true,
  },
  {
    id: "wowow",
    label: "映画も",
    title: "WOWOW",
    description: "スポーツ・映画・ドラマを高品質で",
    ctaText: "詳細を見る",
    ctaUrl: "https://h.accesstrade.net/sp/cc?rk=0100pjmj00opav",
    trackingPixel: "https://h.accesstrade.net/sp/rr?rk=0100pjmj00opav",
    bgGradient: "from-blue-900 via-blue-800 to-blue-900",
    labelColor: "bg-blue-500 text-white",
    showProbability: 0.3,
    cooldownHours: 48,
    isActive: true,
  },
];

// ========================================
// localStorage キー
// ========================================
const STORAGE_PREFIX = "promo_dismissed_";

function isDismissed(promoId: string, cooldownHours: number): boolean {
  if (typeof window === "undefined") return true;
  try {
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${promoId}`);
    if (!dismissed) return false;
    const dismissedAt = parseInt(dismissed, 10);
    const elapsed = Date.now() - dismissedAt;
    return elapsed < cooldownHours * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function setDismissed(promoId: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${promoId}`, Date.now().toString());
  } catch {
    // localStorage unavailable
  }
}

// ========================================
// メインコンポーネント
// ========================================
export default function StickyPromoBanner() {
  const [promo, setPromo] = useState<PromoConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // アクティブかつ非表示でないプロモを絞り込み
    const candidates = promoConfigs.filter(
      (p) => p.isActive && !isDismissed(p.id, p.cooldownHours)
    );
    if (candidates.length === 0) return;

    // 確率でフィルタ
    const eligible = candidates.filter(
      (p) => Math.random() < p.showProbability
    );
    if (eligible.length === 0) return;

    // ランダムで1つ選択
    const selected = eligible[Math.floor(Math.random() * eligible.length)];
    setPromo(selected);

    // 少し遅延してスライドイン（UX向上）
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (!promo) return;
    setClosing(true);
    setDismissed(promo.id);
    setTimeout(() => {
      setVisible(false);
      setPromo(null);
    }, 300);
  };

  if (!promo || !visible) return null;

  const isExternal = promo.ctaUrl.startsWith("http");

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        closing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className={`bg-gradient-to-r ${promo.bgGradient} border-t border-white/10 shadow-2xl`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
          {/* バッジ＋テキスト */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <span className={`${promo.labelColor} text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
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
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "nofollow sponsored noopener noreferrer" : undefined}
            className="shrink-0 bg-white text-black text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          >
            {promo.ctaText}
            <Icon name={isExternal ? "open_in_new" : "arrow_forward"} size={14} />
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

        {/* アフィリエイト表示（PR表記） */}
        <div className="text-center pb-1">
          <span className="text-[9px] text-gray-600">広告・PR</span>
        </div>
      </div>
    </div>
  );
}
