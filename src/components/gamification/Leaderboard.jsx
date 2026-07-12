const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import EmptyState from "@/components/shared/EmptyState";
import { Loader2, Trophy, Medal, Award } from "lucide-react";

const RANK_STYLES = ["text-amber-500", "text-slate-400", "text-orange-600"];

export default function Leaderboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.Employee.list("-xp", 100).then((e) => { setEmployees(e); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (employees.length === 0) return <Card className="rounded-2xl border-border"><EmptyState icon={Trophy} title="No participants yet" /></Card>;

  return (
    <Card className="rounded-2xl border-border overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Trophy className="w-4 h-4 text-primary" /><h3 className="font-display text-lg font-semibold">Leaderboard</h3>
      </div>
      <div className="divide-y divide-border/60">
        {employees.map((e, i) => (
          <div key={e.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center">
                {i < 3 ? <Medal className={`w-5 h-5 ${RANK_STYLES[i]}`} /> : <span className="text-sm text-muted-foreground font-medium">{i + 1}</span>}
              </div>
              <div>
                <div className="font-medium text-sm">{e.name}</div>
                <div className="text-xs text-muted-foreground">{e.department || "—"} · {e.challenges_completed || 0} challenges</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {(e.badges || []).length > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground"><Award className="w-3.5 h-3.5" />{e.badges.length}</span>
              )}
              <div className="text-right">
                <div className="font-display text-lg font-semibold">{e.xp || 0}</div>
                <div className="text-[11px] text-muted-foreground">XP</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}