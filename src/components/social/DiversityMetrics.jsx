const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import StatCard from "@/components/shared/StatCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Loader2, Users, GraduationCap, UserRound } from "lucide-react";

const COLORS = { male: "#3182ce", female: "#d53f8c", other: "#805ad5" };

export default function DiversityMetrics() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.Employee.list("", 500).then((e) => { setEmployees(e); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const genderData = ["male", "female", "other"].map((g) => ({ name: g, value: employees.filter((e) => e.gender === g).length })).filter((d) => d.value > 0);
  const femalePct = employees.length ? Math.round((employees.filter((e) => e.gender === "female").length / employees.length) * 100) : 0;
  const avgTraining = employees.length ? Math.round(employees.reduce((s, e) => s + (e.training_completed_pct || 0), 0) / employees.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Employees" value={employees.length} icon={Users} tint="#3182ce" />
        <StatCard label="Female Representation" value={`${femalePct}%`} icon={UserRound} tint="#d53f8c" />
        <StatCard label="Avg Training Completion" value={`${avgTraining}%`} icon={GraduationCap} tint="#805ad5" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border p-5">
          <h3 className="font-display font-semibold mb-2">Gender Diversity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {genderData.map((d) => <Cell key={d.name} fill={COLORS[d.name]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="rounded-2xl border-border p-5">
          <h3 className="font-display font-semibold mb-3">Training Completion by Employee</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {employees.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between text-xs mb-1"><span>{e.name}</span><span>{e.training_completed_pct || 0}%</span></div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${e.training_completed_pct || 0}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}