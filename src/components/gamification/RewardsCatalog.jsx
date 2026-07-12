const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/shared/EmptyState";
import { Gift, Loader2, Coins } from "lucide-react";

export default function RewardsCatalog() {
  const [rewards, setRewards] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = async () => {
    const [r, e] = await Promise.all([
      db.entities.Reward.filter({ status: "active" }),
      db.entities.Employee.list("-points", 500),
    ]);
    setRewards(r); setEmployees(e);
    if (!selectedEmp && e.length) setSelectedEmp(e[0].name);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const emp = employees.find((e) => e.name === selectedEmp);

  const redeem = async (reward) => {
    if (!emp) return;
    if ((emp.points || 0) < reward.points_required) { alert("Not enough points."); return; }
    if ((reward.stock || 0) <= 0) { alert("Out of stock."); return; }
    setBusy(reward.id);
    await db.entities.Employee.update(emp.id, { points: emp.points - reward.points_required });
    await db.entities.Reward.update(reward.id, { stock: reward.stock - 1 });
    await db.entities.RewardRedemption.create({
      reward_name: reward.name, employee: emp.name, points_spent: reward.points_required,
      redeemed_date: new Date().toISOString().slice(0, 10),
    });
    setBusy(""); await load();
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Redeeming as</span>
          <Select value={selectedEmp} onValueChange={setSelectedEmp}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {emp && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary">
            <Coins className="w-4 h-4" /><span className="font-semibold">{emp.points || 0}</span><span className="text-sm">points</span>
          </div>
        )}
      </div>

      {rewards.length === 0 ? (
        <Card className="rounded-2xl border-border"><EmptyState icon={Gift} title="No rewards yet" description="Add rewards in Settings to build your catalog." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((r) => {
            const affordable = emp && (emp.points || 0) >= r.points_required && r.stock > 0;
            return (
              <Card key={r.id} className="rounded-2xl border-border p-5 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3"><Gift className="w-5 h-5 text-purple-600" /></div>
                <h4 className="font-display font-semibold">{r.name}</h4>
                <p className="text-sm text-muted-foreground mt-1 flex-1">{r.description}</p>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="font-semibold text-primary">{r.points_required} pts</span>
                  <span className="text-xs text-muted-foreground">{r.stock} in stock</span>
                </div>
                <Button className="mt-3" disabled={!affordable || busy === r.id} onClick={() => redeem(r)}>
                  {busy === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}