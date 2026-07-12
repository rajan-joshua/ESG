import React from "react";

const MAP = {
  active: "bg-emerald-100 text-emerald-700",
  approved: "bg-emerald-100 text-emerald-700",
  achieved: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  resolved: "bg-emerald-100 text-emerald-700",
  published: "bg-emerald-100 text-emerald-700",
  on_track: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  planned: "bg-amber-100 text-amber-700",
  draft: "bg-slate-100 text-slate-600",
  scheduled: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  under_review: "bg-blue-100 text-blue-700",
  at_risk: "bg-amber-100 text-amber-700",
  open: "bg-rose-100 text-rose-700",
  rejected: "bg-rose-100 text-rose-700",
  missed: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-600",
  archived: "bg-slate-100 text-slate-600",
  inactive: "bg-slate-100 text-slate-600",
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
  easy: "bg-emerald-100 text-emerald-700",
  hard: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ value }) {
  if (!value) return null;
  const cls = MAP[value] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {String(value).replace(/_/g, " ")}
    </span>
  );
}