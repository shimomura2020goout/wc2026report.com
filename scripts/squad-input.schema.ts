/**
 * 5/15 メンバー発表の入力データ型
 * buildSquadArticle.ts / updateOfficialSquad.ts で共通利用
 */

export type SquadPosition = "GK" | "DF" | "MF" | "FW";

export interface SquadInputPlayer {
  name: string;
  club: string;
  league: string;
  comment: string;
}

export interface SquadInputSurprise {
  name: string;
  club: string;
  reason: string;
}

export interface SquadInputCoachQuote {
  topic: string;
  quote: string;
}

export interface SquadInput {
  announcement: {
    date: string;
    weekday: string;
    time: string;
    venue: string;
    presenter: string;
  };
  squad: {
    GK: SquadInputPlayer[];
    DF: SquadInputPlayer[];
    MF: SquadInputPlayer[];
    FW: SquadInputPlayer[];
  };
  surprises?: {
    selectedIn?: SquadInputSurprise[];
    selectedOut?: SquadInputSurprise[];
  };
  coachQuotes?: SquadInputCoachQuote[];
  eyecatchUrl?: string;
}

export function validateSquadInput(input: SquadInput): string[] {
  const errors: string[] = [];

  const positions: SquadPosition[] = ["GK", "DF", "MF", "FW"];
  let total = 0;
  for (const pos of positions) {
    const list = input.squad?.[pos] ?? [];
    const filled = list.filter((p) => p.name.trim() !== "");
    total += filled.length;
    if (filled.length === 0) {
      errors.push(`${pos}: 0名（最低1名は必要）`);
    }
    for (const [i, p] of list.entries()) {
      if (!p.name.trim()) continue;
      if (!p.club.trim()) errors.push(`${pos}[${i}] ${p.name}: club が未入力`);
      if (!p.league.trim()) errors.push(`${pos}[${i}] ${p.name}: league が未入力`);
    }
  }

  if (total !== 26) {
    errors.push(`合計 ${total}名（期待値 26名）`);
  }

  return errors;
}
