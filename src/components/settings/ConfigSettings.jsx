const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { getConfig } from "@/lib/esg";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check } from "lucide-react";

const TOGGLES = [
  { key: "auto_emission_calc", label: "Auto Emission Calculation", desc: "Calculate carbon transactions automatically from linked records." },
  { key: "evidence_required", label: "Evidence Requirement", desc: "Require an attached proof file before approving CSR participation." },
  { key: "badge_auto_award", label: "Badge Auto-Award", desc: "Award badges automatically when an employee meets a badge's unlock rule." },
  { key: "notify_in_app", label: "In-App Notifications", desc: "Send in-app notifications for key ESG events." },
  { key: "notify_email", label: "Email Notifications", desc: "Also send notifications by email (where available)." },
];

export default function ConfigSettings() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { getConfig().then(setConfig); }, []);

  if (!config) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const set = (k, v) => setConfig((p) => ({ ...p, [k]: v }));
  const totalWeight = (config.env_weight || 0) + (config.social_weight || 0) + (config.governance_weight || 0);

  const save = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by_id, ...payload } = config;
    await db.entities.ESGConfig.update(config.id, payload);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border p-6">
        <h3 className="font-display text-lg font-semibold">ESG Score Weighting</h3>
        <p className="text-sm text-muted-foreground mb-4">Overall ESG score is a weighted average of department totals.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[["env_weight", "Environmental"], ["social_weight", "Social"], ["governance_weight", "Governance"]].map(([k, l]) => (
            <div key={k} className="space-y-1.5">
              <Label>{l} (%)</Label>
              <Input type="number" value={config[k] ?? 0} onChange={(e) => set(k, Number(e.target.value))} />
            </div>
          ))}
        </div>
        <p className={`text-xs mt-3 ${totalWeight === 100 ? "text-muted-foreground" : "text-amber-600"}`}>
          Total: {totalWeight}% {totalWeight !== 100 && "(recommended to sum to 100%)"}
        </p>
      </Card>

      <Card className="rounded-2xl border-border p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Business Rules</h3>
        <div className="space-y-4">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.desc}</div>
              </div>
              <Switch checked={!!config[t.key]} onCheckedChange={(v) => set(t.key, v)} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saved ? <Check className="w-4 h-4 mr-2" /> : null}
          {saved ? "Saved" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}