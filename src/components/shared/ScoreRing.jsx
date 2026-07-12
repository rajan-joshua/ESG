import React from "react";
import { scoreBand } from "@/lib/esg";

export default function ScoreRing({ score = 0, size = 160, stroke = 12, label = "ESG Score" }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const band = scoreBand(score);
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={band.color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold text-foreground">{score}</span>
        <span className="text-xs font-medium" style={{ color: band.color }}>{band.label}</span>
        <span className="text-[11px] text-muted-foreground mt-0.5">{label}</span>
      </div>
    </div>
  );
}