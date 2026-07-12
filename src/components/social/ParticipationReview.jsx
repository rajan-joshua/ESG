const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { getConfig, evaluateBadges, notify } from "@/lib/esg";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EntityForm from "@/components/shared/EntityForm";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import { Plus, Check, X, Loader2, FileCheck, Users } from "lucide-react";

export default function ParticipationReview() {
  const [items, setItems] = useState([]);
  const [activities, setActivities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);

  const load = async () => {
    setLoading(true);
    const [p, a, e, cfg] = await Promise.all([
      db.entities.EmployeeParticipation.list("-created_date", 300),
      db.entities.CSRActivity.list("", 200),
      db.entities.Employee.list("", 500),
      getConfig(),
    ]);
    setItems(p); setActivities(a); setEmployees(e); setConfig(cfg);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async (data) => {
    const emp = employees.find((e) => e.name === data.employee);
    await db.entities.EmployeeParticipation.create({ ...data, department: emp?.department || "", approval_status: "pending" });
    setDialog(false); await load();
  };

  const decide = async (item, status) => {
    if (status === "approved" && config?.evidence_required && !item.proof_url) {
      alert("Evidence is required. Please attach a proof file before approving.");
      return;
    }
    const activity = activities.find((a) => a.title === item.activity);
    const points = status === "approved" ? (activity?.points || 10) : 0;
    await db.entities.EmployeeParticipation.update(item.id, {
      approval_status: status, points_earned: points,
      completion_date: status === "approved" ? new Date().toISOString().slice(0, 10) : null,
    });
    const emp = employees.find((e) => e.name === item.employee);
    if (status === "approved" && emp) {
      const updated = await db.entities.Employee.update(emp.id, { points: (emp.points || 0) + points });
      const badges = await db.entities.Badge.list("", 100);
      await evaluateBadges(updated, badges, config);
    }
    await notify(config, { type: "approval_decision", title: `CSR participation ${status}`, message: `${item.employee}'s participation in "${item.activity}" was ${status}.` });
    await load();
  };

  const proofField = [{ name: "proof_url", label: "Proof (file)", type: "file" }];

  return (
    <Card className="rounded-2xl border-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="font-display text-lg font-semibold">Employee Participation</h3>
          {config?.evidence_required && <p className="text-xs text-amber-600 mt-0.5">Evidence required to approve</p>}
        </div>
        <Button size="sm" onClick={() => setDialog(true)}><Plus className="w-4 h-4 mr-1.5" />Record</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No participation records" description="Record an employee's involvement in a CSR activity." actionLabel="Record" onAction={() => setDialog(true)} />
      ) : (
        <div className="divide-y divide-border/60">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="font-medium text-sm">{item.employee}</div>
                <div className="text-xs text-muted-foreground truncate">{item.activity} · {item.department || "—"}</div>
              </div>
              <div className="flex items-center gap-3">
                {item.proof_url && <a href={item.proof_url} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" />Proof</a>}
                {item.points_earned > 0 && <span className="text-xs font-medium text-emerald-600">+{item.points_earned} pts</span>}
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
          <DialogHeader><DialogTitle>Record Participation</DialogTitle></DialogHeader>
          <EntityForm
            fields={[
              { name: "employee", label: "Employee", type: "select", options: employees.map((e) => ({ value: e.name, label: e.name })), required: true },
              { name: "activity", label: "CSR Activity", type: "select", options: activities.map((a) => ({ value: a.title, label: a.title })), required: true },
              ...proofField,
            ]}
            onSubmit={create} onCancel={() => setDialog(false)} submitLabel="Record"
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}