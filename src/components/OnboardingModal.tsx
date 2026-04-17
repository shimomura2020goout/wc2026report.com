"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import { allTeams } from "@/data/teams";
import { usePreferences } from "@/context/PreferencesContext";

export default function OnboardingModal() {
  const { prefs, hydrated, completeOnboarding } = usePreferences();
  const [selected, setSelected] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (prefs.onboardedAt) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [hydrated, prefs.onboardedAt]);

  const sortedTeams = useMemo(() => {
    return [...allTeams].sort((a, b) => {
      if (a.code === "JPN") return -1;
      if (b.code === "JPN") return 1;
      return a.fifaRanking - b.fifaRanking;
    });
  }, []);

  const toggle = (code: string) => {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const handleSave = () => {
    completeOnboarding(selected);
    setVisible(false);
  };

  const handleSkip = () => {
    completeOnboarding([]);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="favorite" size={22} className="text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">応援する国を選択</h2>
          </div>
          <p className="text-sm text-gray-500">
            選んだ国のニュースや試合をマイページにまとめて表示します。あとから変更できます。
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {sortedTeams.map((team) => {
              const isSelected = selected.includes(team.code);
              return (
                <button
                  key={team.code}
                  type="button"
                  onClick={() => toggle(team.code)}
                  className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-lg border-2 transition-all text-sm ${
                    isSelected
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl leading-none">{team.flag}</span>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                    {team.name}
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
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
          >
            スキップ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selected.length === 0}
            className={`flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              selected.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {selected.length > 0 ? `${selected.length}カ国を応援` : "国を選択"}
            <Icon name="arrow_forward" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
