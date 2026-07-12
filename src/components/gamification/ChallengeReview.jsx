const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { getConfig, evaluateBadges, notify } from "@/lib/esg";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EntityForm from "@/components/shared/EntityForm";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import { Plus, Check, X, Loader2, FileCheck, Swords } from "lucide-react";

export default function ChallengeReview() {
  const [items, setItems] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);

  const load = async () => {
    setLoading(true);
    const [p, c, e, cfg] = await Promise.all([
      db.entities.ChallengeParticipation.list("-created_date", 300),
      db.entities.Challenge.list("", 200),
      db.entities.Employee.list("", 500),
      getConfig(),
    ]);
    setItems(p); setChallenges(c); setEmployees(e); setConfig(cfg);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async (data) => {
    const emp = employees.find((e) => e.name === data.employee);
    await db.entities.ChallengeParticipation.create({ ...data, department: emp?.department || "", approval_status: "pending" });
    setDialog(false); await load();
  };

  const decide = async (item, status) => {
    const challenge = challenges.find((c) => c.title === item.challenge);
    if (status === "approved" && challenge?.evidence_required && !item.proof_url) {
      alert("This challenge requires evidence. Attach a proof file before approving.");
      return;
    }
    const xp = status === "approved" ? (challenge?.xp || 0) : 0;
    await db.entities.ChallengeParticipation.update(item.id, {
      approval_status: status, xp_awarded: xp, progress: status === "approved" ? 100 : item.progress,
    });
    const emp = employees.find((e) => e.name === item.employee);
    if (status === "approved" && emp) {
      const updated = await db.entities.Employee.update(emp.id, {
        xp: (emp.xp || 0) + xp,
        points: (emp.points || 0) + xp,
        challenges_completed: (emp.challenges_completed || 0) + 1,
      });
      const badges = await db.entities.Badge.list("", 100);
      await evaluateBadges(updated, badges, config);
    }
    await notify(config, { type: "approval_decision", title: `Challenge ${status}`, message: `${item.employee}'s "${item.challenge}" submission was ${status}.` });
    await load();
  };

  return (
    <Card className="rounded-2xl border-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-display text-lg font-semibold">Challenge Submissions</h3>
        <Button size="sm" onClick={() => setDialog(true)}><Plus className="w-4 h-4 mr-1.5" />Submit</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={Swords} title="No submissions yet" description="Employees can submit progress on active challenges." actionLabel="Submit" onAction={() => setDialog(true)} />
      ) : (
        <div className="divide-y divide-border/60">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="font-medium text-sm">{item.employee}</div>
                <div className="text-xs text-muted-foreground truncate">{item.challenge} · {item.progress || 0}%</div>
              </div>
              <div className="flex items-center gap-3">
                {item.proof_url && <a href={item.proof_url} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" />Proof</a>}
                {item.xp_awarded > 0 && <span className="text-xs font-medium text-purple-600">+{item.xp_awarded} XP</span>}
                <StatusBadge value={item.approval_status} />
                {item.approval_status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => decide(item, "approved")}><Check className="w-4 h-4 text-emerald-600" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => decide(item, "rejected")}><X className="w-4 h-4 text-rose-500" /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit Challenge Progress</DialogTitle></DialogHeader>
          <EntityForm
            fields={[
              { name: "challenge", label: "Challenge", type: "select", options: challenges.filter((c) => c.status === "active" || c.status === "under_review").map((c) => ({ value: c.title, label: c.title })), required: true },
              { name: "employee", label: "Employee", type: "select", options: employees.map((e) => ({ value: e.name, label: e.name })), required: true },
              { name: "progress", label: "Progress %", type: "number" },
              { name: "proof_url", label: "Proof (file)", type: "file" },
            ]}
            onSubmit={create} onCancel={() => setDialog(false)} submitLabel="Submit"
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}