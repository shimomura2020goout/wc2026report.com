"use client";

import { useEffect, useState } from "react";
import { SQUAD_ANNOUNCEMENT_AT, SQUAD_PHASE } from "@/data/japanSquad";

const CELEBRATION_WINDOW_MS = 48 * 60 * 60 * 1000;
const STORAGE_KEY = "wcup2026:squad-celebration-shown:v1";
const COLORS = ["#bc002d", "#ffd700", "#ffffff", "#3b9bff"];
const PIECE_COUNT = 90;

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotateEnd: number;
  size: number;
  drift: number;
  shape: "rect" | "circle";
}

function generatePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 3.5 + Math.random() * 2.2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotateEnd: 360 + Math.random() * 720,
    size: 6 + Math.random() * 8,
    drift: (Math.random() - 0.5) * 200,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));
}

export default function SquadCelebration() {
  const [pieces, setPieces] = useState<Piece[] | null>(null);

  useEffect(() => {
    if (SQUAD_PHASE !== "official") return;

    const announcementMs = new Date(SQUAD_ANNOUNCEMENT_AT).getTime();
    const now = Date.now();
    if (now < announcementMs) return;
    if (now > announcementMs + CELEBRATION_WINDOW_MS) return;

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch {
      // localStorage 利用不可な環境では毎回表示でOK
    }

    setPieces(generatePieces());

    const timeout = setTimeout(() => setPieces(null), 7000);
    return () => clearTimeout(timeout);
  }, []);

  if (!pieces) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "-10vh",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "1px",
            opacity: 0.95,
            ["--drift" as string]: `${p.drift}px`,
            ["--rotate-end" as string]: `${p.rotateEnd}deg`,
            animation: `wcup-celebration-fall ${p.duration}s ${p.delay}s linear forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes wcup-celebration-fall {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 0.95;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translate3d(var(--drift), 110vh, 0) rotate(var(--rotate-end));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
