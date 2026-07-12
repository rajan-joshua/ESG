const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { toCSV, toExcel, toPDF } from "@/lib/exporters";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileBarChart, Leaf, Users, Shield, Sparkles, Download, FileText, Loader2, Filter } from "lucide-react";

const SOURCES = {
  environmental: {
    label: "Environmental (Carbon)", entity: "CarbonTransaction", icon: Leaf,
    columns: [{ key: "description", label: "Description" }, { key: "department", label: "Department" }, { key: "source", label: "Source" }, { key: "co2_kg", label: "CO2e (kg)" }, { key: "date", label: "Date" }],
    dateKey: "date",
  },
  social: {
    label: "Social (Participation)", entity: "EmployeeParticipation", icon: Users,
    columns: [{ key: "employee", label: "Employee" }, { key: "department", label: "Department" }, { key: "activity", label: "Activity" }, { key: "approval_status", label: "Status" }, { key: "points_earned", label: "Points" }, { key: "completion_date", label: "Completed" }],
    dateKey: "completion_date",
  },
  governance: {
    label: "Governance (Compliance)", entity: "ComplianceIssue", icon: Shield,
    columns: [{ key: "description", label: "Issue" }, { key: "severity", label: "Severity" }, { key: "owner", label: "Owner" }, { key: "department", label: "Department" }, { key: "due_date", label: "Due" }, { key: "status", label: "Status" }],
    dateKey: "due_date",
  },
  challenges: {
    label: "Challenges", entity: "ChallengeParticipation", icon: Sparkles,
    columns: [{ key: "challenge", label: "Challenge" }, { key: "employee", label: "Employee" }, { key: "department", label: "Department" }, { key: "approval_status", label: "Status" }, { key: "xp_awarded", label: "XP" }],
    dateKey: "created_date",
  },
  summary: {
    label: "ESG Summary (Dept Scores)", entity: "DepartmentScore", icon: FileBarChart,
    columns: [{ key: "department", label: "Department" }, { key: "environmental_score", label: "Environmental" }, { key: "social_score", label: "Social" }, { key: "governance_score", label: "Governance" }, { key: "total_score", label: "Total" }],
    dateKey: null,
  },
};

const PRESETS = [
  { key: "environmental", label: "Environmental Report", desc: "Carbon emissions by department & source", icon: Leaf, color: "#2f855a" },
  { key: "social", label: "Social Report", desc: "CSR participation and engagement", icon: Users, color: "#3182ce" },
  { key: "governance", label: "Governance Report", desc: "Compliance issues and audits", icon: Shield, color: "#805ad5" },
  { key: "summary", label: "ESG Summary Report", desc: "Overall department scorecards", icon: FileBarChart, color: "#d69e2e" },
];

export default function Reports() {
  const [source, setSource] = useState("environmental");
  const [depts, setDepts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [filters, setFilters] = useState({ department: "all", employee: "all", challenge: "all", from: "", to: "" });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    db.entities.Department.list("", 200).then((d) => setDepts(d.map((x) => x.name)));
    db.entities.Employee.list("", 500).then((e) => setEmployees(e.map((x) => x.name)));
    db.entities.Challenge.list("", 200).then((c) => setChallenges(c.map((x) => x.title)));
  }, []);

  const cfg = SOURCES[source];

  const generate = async () => {
    setLoading(true);
    let data = await db.entities[cfg.entity].list("-created_date", 1000);
    data = data.filter((r) => {
      if (filters.department !== "all" && r.department !== filters.department) return false;
      if (filters.employee !== "all" && r.employee !== filters.employee) return false;
      if (filters.challenge !== "all" && r.challenge !== filters.challenge) return false;
      if (cfg.dateKey && (filters.from || filters.to)) {
        const d = r[cfg.dateKey];
        if (!d) return false;
        if (filters.from && d < filters.from) return false;
        if (filters.to && d > filters.to) return false;
      }
      return true;
    });
    setRows(data); setGenerated(true); setLoading(false);
  };

  const runPreset = (key) => { setSource(key); setGenerated(false); setRows([]); window.scrollTo({ top: 999, behavior: "smooth" }); };
  const fname = (ext) => `${cfg.label.replace(/[^a-z]/gi, "_")}_${new Date().toISOString().slice(0, 10)}.${ext}`;

  return (
    <div>
      <PageHeader title="Reports" icon={FileBarChart} subtitle="Generate module reports or build a custom export." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {PRESETS.map((p) => (
          <Card key={p.key} className="rounded-2xl border-border p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => runPreset(p.key)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${p.color}1a` }}>
              <p.icon className="w-5 h-5" style={{ color: p.color }} />
            </div>
            <h4 className="font-display font-semibold">{p.label}</h4>
            <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border p-6">
        <div className="flex items-center gap-2 mb-5"><Filter className="w-4 h-4 text-primary" /><h3 className="font-display text-lg font-semibold">Custom Report Builder</h3></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Data Source / Module</Label>
            <Select value={source} onValueChange={(v) => { setSource(v); setGenerated(false); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(SOURCES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={filters.department} onValueChange={(v) => setFilters((f) => ({ ...f, department: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All departments</SelectItem>{depts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Employee</Label>
            <Select value={filters.employee} onValueChange={(v) => setFilters((f) => ({ ...f, employee: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All employees</SelectItem>{employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Challenge</Label>
            <Select value={filters.challenge} onValueChange={(v) => setFilters((f) => ({ ...f, challenge: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All challenges</SelectItem>{challenges.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>From Date</Label><Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>To Date</Label><Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} /></div>
        </div>
        <div className="mt-5"><Button onClick={generate} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}Generate Report</Button></div>
      </Card>

      {generated && (
        <Card className="rounded-2xl border-border mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border">
            <h3 className="font-display text-lg font-semibold">{cfg.label} · {rows.length} rows</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={!rows.length} onClick={() => toCSV(rows, cfg.columns, fname("csv"))}><Download className="w-4 h-4 mr-1.5" />CSV</Button>
              <Button size="sm" variant="outline" disabled={!rows.length} onClick={() => toExcel(rows, cfg.columns, fname("xls"))}><Download className="w-4 h-4 mr-1.5" />Excel</Button>
              <Button size="sm" variant="outline" disabled={!rows.length} onClick={() => toPDF(cfg.label, rows, cfg.columns, fname("pdf"))}><Download className="w-4 h-4 mr-1.5" />PDF</Button>
            </div>
          </div>
          {rows.length === 0 ? (
            <EmptyState icon={FileBarChart} title="No matching data" description="Try adjusting your filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted-foreground border-b border-border">{cfg.columns.map((c) => <th key={c.key} className="font-medium px-5 py-3 whitespace-nowrap">{c.label}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r) => <tr key={r.id} className="border-b border-border/60">{cfg.columns.map((c) => <td key={c.key} className="px-5 py-3 whitespace-nowrap">{r[c.key] ?? "—"}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}