"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import {
  SQUAD_ANNOUNCEMENT_AT,
  SQUAD_PHASE,
  playerSquad,
  squadCounts,
  type SquadPosition,
} from "@/data/japanSquad";

const ANNOUNCEMENT_ARTICLE_SLUG = "japan-squad-final-26-may-15-2026";
// 日本代表GL最終戦（vs スウェーデン）翌日まで表示。それ以降はノックアウト進出可否で別途制御。
const PANEL_END_AT = "2026-06-27T00:00:00+09:00";
const STORAGE_KEY_DISMISS = "wcup2026:squad-panel-dismissed:v1";

const POSITION_LABEL: Record<SquadPosition, string> = {
  GK: "GK",
  DF: "DF",
  MF: "MF",
  FW: "FW",
};

const POSITION_COLOR: Record<SquadPosition, string> = {
  GK: "bg-amber-100 text-amber-900",
  DF: "bg-blue-100 text-blue-900",
  MF: "bg-emerald-100 text-emerald-900",
  FW: "bg-rose-100 text-rose-900",
};

function shouldShow(): boolean {
  if (SQUAD_PHASE !== "official") return false;
  const now = Date.now();
  if (now < new Date(SQUAD_ANNOUNCEMENT_AT).getTime()) return false;
  if (now > new Date(PANEL_END_AT).getTime()) return false;
  return true;
}

export default function SquadFloatingPanel() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(STORAGE_KEY_DISMISS) === "1") {
        setDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!mounted) return null;
  if (!shouldShow()) return null;
  if (dismissed) return null;

  const counts = squadCounts();

  return (
    <>
      {/* フローティングバッジ（右下） */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="日本代表26名を見る"
        className={`fixed bottom-4 right-4 z-40 group flex items-center gap-2 bg-gradient-to-r from-[#bc002d] to-[#0a1e5c] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ paddingRight: "1.25rem" }}
      >
        <span className="relative">
          <Icon name="groups" size={22} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ffd700] rounded-full animate-pulse" />
        </span>
        <span className="hidden sm:inline text-sm font-bold tracking-wide">
          🇯🇵 日本代表 26名
        </span>
        <span className="sm:hidden text-xs font-bold">26名</span>
      </button>

      {/* スライドインパネル */}
      <div
        className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* オーバーレイ */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* パネル本体 */}
        <aside
          className={`absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-label="日本代表26名一覧"
        >
          {/* ヘッダー */}
          <div className="relative bg-gradient-to-r from-[#0a1e5c] to-[#bc002d] text-white p-4 sm:p-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="閉じる"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
            >
              <Icon name="close" size={20} />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 bg-[#ffd700] text-[#1a1a2e] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                <Icon name="check_circle" size={11} />
                発表完了
              </span>
              <span className="text-[11px] text-blue-100">SAMURAI BLUE</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold leading-tight">
              W杯2026 日本代表 <span className="text-[#ffd700]">26名</span>
            </h2>
            <p className="text-[11px] text-blue-100 mt-1">
              GK {counts.GK} ／ DF {counts.DF} ／ MF {counts.MF} ／ FW {counts.FW}
            </p>
          </div>

          {/* 26名リスト */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {(["GK", "DF", "MF", "FW"] as SquadPosition[]).map((pos) => {
              const players = playerSquad.filter((p) => p.position === pos);
              if (players.length === 0) return null;
              return (
                <section key={pos} className="mb-4">
                  <h3 className="text-[11px] font-bold text-gray-500 tracking-wider mb-2 px-1">
                    {POSITION_LABEL[pos]} — {players.length}名
                  </h3>
                  <ul className="space-y-1.5">
                    {players.map((p) => {
                      const href = p.columnSlug
                        ? `/news/${p.columnSlug}`
                        : `/news/${ANNOUNCEMENT_ARTICLE_SLUG}#${encodeURIComponent(p.name)}`;
                      return (
                        <li key={p.name}>
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                          >
                            <span
                              className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${POSITION_COLOR[pos]}`}
                            >
                              {POSITION_LABEL[pos]}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-bold text-gray-900 truncate">
                                {p.name}
                                {p.badge && (
                                  <span className="ml-1.5 text-[10px] font-bold text-[#bc002d]">
                                    ※{p.badge}
                                  </span>
                                )}
                              </span>
                              <span className="block text-[11px] text-gray-500 truncate">
                                {p.club}
                              </span>
                            </span>
                            {p.columnSlug ? (
                              <span className="shrink-0 text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                コラム
                              </span>
                            ) : (
                              <Icon
                                name="chevron_right"
                                size={16}
                                className="shrink-0 text-gray-400"
                              />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          {/* フッターCTA */}
          <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 space-y-2">
            <Link
              href={`/news/${ANNOUNCEMENT_ARTICLE_SLUG}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 bg-[#bc002d] text-white font-bold px-4 py-2.5 rounded-full hover:bg-[#a00026] transition-colors text-sm"
            >
              <Icon name="article" size={16} />
              発表速報記事を読む
            </Link>
            <Link
              href="/japan-squad"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 bg-white text-[#1a1a2e] font-bold px-4 py-2.5 rounded-full border-2 border-[#1a1a2e]/20 hover:bg-gray-100 transition-colors text-sm"
            >
              <Icon name="groups" size={16} />
              26名の一覧ページへ
            </Link>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.setItem(STORAGE_KEY_DISMISS, "1");
                } catch {
                  // ignore
                }
                setDismissed(true);
              }}
              className="block w-full text-center text-[11px] text-gray-500 hover:text-gray-700 underline mt-1"
            >
              このセッションでは表示しない
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
