"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

interface NicknameEditorProps {
  initialNickname: string | null;
  onSaved?: (nickname: string) => void;
}

export default function NicknameEditor({ initialNickname, onSaved }: NicknameEditorProps) {
  const [editing, setEditing] = useState(!initialNickname);
  const [value, setValue] = useState(initialNickname ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(initialNickname);

  useEffect(() => {
    setCurrent(initialNickname);
    setValue(initialNickname ?? "");
    setEditing(!initialNickname);
  }, [initialNickname]);

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
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <Icon name="edit" size={14} />
          変更
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
