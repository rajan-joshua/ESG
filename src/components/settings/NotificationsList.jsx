const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import { Bell, Loader2, AlertTriangle, CheckCircle2, FileText, Award } from "lucide-react";

const ICONS = {
  compliance_issue: { icon: AlertTriangle, color: "text-rose-500" },
  approval_decision: { icon: CheckCircle2, color: "text-emerald-500" },
  policy_reminder: { icon: FileText, color: "text-blue-500" },
  badge_unlock: { icon: Award, color: "text-purple-500" },
  general: { icon: Bell, color: "text-muted-foreground" },
};

export default function NotificationsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setItems(await db.entities.Notification.list("-created_date", 100)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const markAll = async () => {
    const unread = items.filter((i) => !i.read);
    await Promise.all(unread.map((i) => db.entities.Notification.update(i.id, { read: true })));
    await load();
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <Card className="rounded-2xl border-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-display text-lg font-semibold">Notifications</h3>
        {items.some((i) => !i.read) && <Button size="sm" variant="outline" onClick={markAll}>Mark all read</Button>}
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="Alerts about compliance, approvals and badges will appear here." />
      ) : (
        <div className="divide-y divide-border/60">
          {items.map((n) => {
            const meta = ICONS[n.type] || ICONS.general;
            return (
              <div key={n.id} className={`flex items-start gap-3 px-5 py-4 ${!n.read ? "bg-accent/30" : ""}`}>
                <meta.icon className={`w-5 h-5 mt-0.5 ${meta.color}`} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{n.title}</div>
                  {n.message && <div className="text-sm text-muted-foreground">{n.message}</div>}
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}