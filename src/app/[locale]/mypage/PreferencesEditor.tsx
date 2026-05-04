"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { allTeams } from "@/data/teams";
import { localizedTeamName } from "@/data/teamsI18n";
import { useTranslation } from "@/i18n/client";
import { usePreferences } from "@/context/PreferencesContext";

export default function PreferencesEditor() {
  const { locale } = useTranslation();
  const { prefs, toggleFavoriteCountry, resetPreferences } = usePreferences();
  const [open, setOpen] = useState(false);

  const sortedTeams = useMemo(() => {
    return [...allTeams].sort((a, b) => {
      if (a.code === "JPN") return -1;
      if (b.code === "JPN") return 1;
      return a.fifaRanking - b.fifaRanking;
    });
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
      >
        <Icon name="tune" size={16} />
        応援国を編集
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Icon name="favorite" size={20} className="text-red-500" />
                  <h2 className="text-lg font-bold text-gray-900">応援国を編集</h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  タップで選択・解除。変更は自動保存されます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="close" size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {sortedTeams.map((team) => {
                  const isSelected = prefs.favoriteCountries.includes(team.code);
                  return (
                    <button
                      key={team.code}
                      type="button"
                      onClick={() => toggleFavoriteCountry(team.code)}
                      className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-lg border-2 transition-all text-sm ${
                        isSelected
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl leading-none">{team.flag}</span>
                      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                        {localizedTeamName(team, locale)}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1 right-1">
                          <Icon name="check_circle" size={16} className="text-red-500" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm("設定をすべてリセットしますか？")) {
                    resetPreferences();
                    setOpen(false);
                  }
                }}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                設定をリセット
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
