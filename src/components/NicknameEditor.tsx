"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

interface NicknameEditorProps {
  initialNickname: string | null;
  /** 自動生成されたニックネーム（ゲストxxxxxx）かどうか */
  isAuto?: boolean;
  onSaved?: (nickname: string) => void;
}

export default function NicknameEditor({
  initialNickname,
  isAuto = false,
  onSaved,
}: NicknameEditorProps) {
  const [editing, setEditing] = useState(!initialNickname);
  // 自動生成の場合は空欄からスタート（ユーザがそのまま自分で名前を入れられるように）
  const [value, setValue] = useState(isAuto ? "" : initialNickname ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(initialNickname);
  const [currentIsAuto, setCurrentIsAuto] = useState<boolean>(isAuto);

  useEffect(() => {
    setCurrent(initialNickname);
    setCurrentIsAuto(isAuto);
    setValue(isAuto ? "" : initialNickname ?? "");
    setEditing(!initialNickname);
  }, [initialNickname, isAuto]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "保存に失敗しました");
        return;
      }
      setCurrent(data.nickname);
      setCurrentIsAuto(false);
      setEditing(false);
      if (onSaved) onSaved(data.nickname);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  if (!editing && current) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">ニックネーム:</span>
        <span className="text-sm font-bold text-gray-900">{current}</span>
        {currentIsAuto && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
            自動割当
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setValue(currentIsAuto ? "" : current);
          }}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <Icon name="edit" size={14} />
          {currentIsAuto ? "設定する" : "変更"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-500 font-medium">
        ニックネーム（2〜20文字、英数字/日本語/_/-）
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="例: サムライブルー太郎"
          maxLength={20}
          className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || value.trim().length < 2}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Icon name="save" size={16} />
          保存
        </button>
        {current && (
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setValue(current);
              setError(null);
            }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2"
          >
            キャンセル
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400 leading-relaxed">
        ランキングに表示されます。一度使用されたニックネームは他のユーザが使えません。
      </p>
    </div>
  );
}
