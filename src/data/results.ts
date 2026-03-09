export interface MatchResult {
  id: string;
  date: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null; // nullなら未実施
  awayScore: number | null;
  venue: string;
  group: string;
  matchday: number;
  status: "scheduled" | "live" | "finished";
  events?: MatchEvent[];
}

export interface MatchEvent {
  minute: number;
  type: "goal" | "yellow" | "red" | "substitution" | "own_goal" | "penalty_goal";
  player: string;
  team: string;
  detail?: string;
}

export interface GroupStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ("W" | "D" | "L" | "-")[];
}

export interface PlayerDiscipline {
  player: string;
  team: string;
  yellowCards: number;
  redCards: number;
  isSuspendedNextMatch: boolean;
  suspensionNote?: string;
}

export interface GroupScenario {
  condition: string;
  outcome: string;
  probability: "high" | "medium" | "low";
}

// グループステージの初期順位表（大会開始前は全て0）
export function getInitialStandings(teams: string[]): GroupStanding[] {
  return teams.map((team) => ({
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ["-", "-", "-"],
  }));
}

// グループFの試合日程（日本所属グループ）
export const groupFMatches: MatchResult[] = [
  // 第1節
  {
    id: "gf-1",
    date: "2026-06-14",
    kickoff: "05:00",
    homeTeam: "オランダ",
    awayTeam: "日本",
    homeScore: null,
    awayScore: null,
    venue: "AT&Tスタジアム（ダラス）",
    group: "F",
    matchday: 1,
    status: "scheduled",
  },
  {
    id: "gf-2",
    date: "2026-06-14",
    kickoff: "08:00",
    homeTeam: "チュニジア",
    awayTeam: "UEFA PO B勝者",
    homeScore: null,
    awayScore: null,
    venue: "エスタディオBBVA（モンテレイ）",
    group: "F",
    matchday: 1,
    status: "scheduled",
  },
  // 第2節
  {
    id: "gf-3",
    date: "2026-06-21",
    kickoff: "13:00",
    homeTeam: "チュニジア",
    awayTeam: "日本",
    homeScore: null,
    awayScore: null,
    venue: "エスタディオBBVA（モンテレイ）",
    group: "F",
    matchday: 2,
    status: "scheduled",
  },
  {
    id: "gf-4",
    date: "2026-06-21",
    kickoff: "05:00",
    homeTeam: "オランダ",
    awayTeam: "UEFA PO B勝者",
    homeScore: null,
    awayScore: null,
    venue: "AT&Tスタジアム（ダラス）",
    group: "F",
    matchday: 2,
    status: "scheduled",
  },
  // 第3節
  {
    id: "gf-5",
    date: "2026-06-26",
    kickoff: "08:00",
    homeTeam: "日本",
    awayTeam: "UEFA PO B勝者",
    homeScore: null,
    awayScore: null,
    venue: "AT&Tスタジアム（ダラス）",
    group: "F",
    matchday: 3,
    status: "scheduled",
  },
  {
    id: "gf-6",
    date: "2026-06-26",
    kickoff: "08:00",
    homeTeam: "チュニジア",
    awayTeam: "オランダ",
    homeScore: null,
    awayScore: null,
    venue: "エスタディオBBVA（モンテレイ）",
    group: "F",
    matchday: 3,
    status: "scheduled",
  },
];

// 現時点でのグループ突破シナリオ（大会開始後に更新）
export const groupFScenarios: GroupScenario[] = [
  {
    condition: "日本が初戦のオランダ戦に勝利した場合",
    outcome: "第2節チュニジア戦で引き分け以上なら、最終節を待たずにグループ突破が濃厚。",
    probability: "medium",
  },
  {
    condition: "日本がオランダに引き分け、チュニジアに勝利した場合",
    outcome: "勝ち点4。最終節のPOB勝者戦で引き分け以上なら1位通過の可能性も。",
    probability: "medium",
  },
  {
    condition: "日本が2連敗した場合",
    outcome: "最終節で大量得点差の勝利が必要。グループ3位の成績上位8チームに入る条件次第。",
    probability: "low",
  },
];
