const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { getConfig, recomputeScores, overallScore, scoreBand, MODULE_META } from "@/lib/esg";
import PageHeader from "@/components/shared/PageHeader";
import ScoreRing from "@/components/shared/ScoreRing";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Users, Shield, Cloud, Trophy, Building2, RefreshCw, Loader2, ChevronDown, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } } };

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [config, setConfig] = useState(null);
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState({ carbon: 0, csr: 0, challenges: 0, issues: 0, employees: 0 });
  const [expandedDept, setExpandedDept] = useState(null);

  const load = async () => {
    const cfg = await getConfig();
    setConfig(cfg);
    const [deptScores, carbon, csr, challenges, issues, employees] = await Promise.all([
      db.entities.DepartmentScore.list("-total_score", 100),
      db.entities.CarbonTransaction.list("", 500),
      db.entities.CSRActivity.list("", 200),
      db.entities.Challenge.filter({ status: "active" }),
      db.entities.ComplianceIssue.filter({ status: "open" }),
      db.entities.Employee.list("", 500),
    ]);
    setScores(deptScores);
    setStats({
      carbon: Math.round(carbon.reduce((s, c) => s + (c.co2_kg || 0), 0)),
      csr: csr.length,
      challenges: challenges.length,
      issues: issues.length,
      employees: employees.length,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await recomputeScores(config);
    await load();
    setRefreshing(false);
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>;

  const overall = overallScore(scores);
  const avg = (key) => scores.length ? Math.round(scores.reduce((s, d) => s + (d[key] || 0), 0) / scores.length) : 0;
  const modules = [
    { key: "environmental_score", meta: MODULE_META.environmental, icon: Leaf, weight: config?.env_weight, link: "/environmental" },
    { key: "social_score", meta: MODULE_META.social, icon: Users, weight: config?.social_weight, link: "/social" },
    { key: "governance_score", meta: MODULE_META.governance, icon: Shield, weight: config?.governance_weight, link: "/governance" },
  ];
  const pillars = [
    { key: "environmental_score", label: "Environmental", color: MODULE_META.environmental.color },
    { key: "social_score", label: "Social", color: MODULE_META.social.color },
    { key: "governance_score", label: "Governance", color: MODULE_META.governance.color },
  ];
  const radarData = [
    { pillar: "Environmental", value: avg("environmental_score") },
    { pillar: "Social", value: avg("social_score") },
    { pillar: "Governance", value: avg("governance_score") },
  ];
  const statCards = [
    { label: "Total CO₂e", value: stats.carbon, suffix: "kg", icon: Cloud, tint: "#2f855a" },
    { label: "CSR Activities", value: stats.csr, icon: Users, tint: "#3182ce" },
    { label: "Active Challenges", value: stats.challenges, icon: Trophy, tint: "#805ad5" },
    { label: "Open Issues", value: stats.issues, icon: Shield, tint: "#e53e3e" },
    { label: "Employees", value: stats.employees, icon: Building2, tint: "#d69e2e" },
  ];

  return (
    <div>
      <PageHeader
        title="ESG Dashboard"
        subtitle="A unified view of your organization's Environmental, Social and Governance performance."
        action={<Button variant="outline" onClick={refresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}Recalculate
        </Button>}
      />

      {/* Hero: overall score + pillar radar + module links */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid lg:grid-cols-3 gap-4 mb-4">
        <motion.div variants={item} whileHover={{ y: -3 }} className="h-full">
          <Card className="rounded-2xl border-border flex flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/5 to-transparent h-full">
            <ScoreRing score={overall} label="Overall ESG" />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-muted-foreground mt-4 text-center">
              Weighted avg · E {config?.env_weight}% / S {config?.social_weight}% / G {config?.governance_weight}%
            </motion.p>
          </Card>
        </motion.div>

        <motion.div variants={item} className="h-full">
          <Card className="rounded-2xl border-border h-full">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-display text-base font-semibold">Pillar Balance</h3>
              <p className="text-xs text-muted-foreground">Organization average across ESG pillars</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={218}>
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="#2f855a" fill="#2f855a" fillOpacity={0.25} animationDuration={900} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="h-full">
          <Card className="rounded-2xl border-border p-5 h-full">
            <h3 className="font-display text-base font-semibold mb-4">ESG Pillars</h3>
            <div className="space-y-4">
              {modules.map((m) => {
                const val = avg(m.key);
                return (
                  <Link key={m.key} to={m.link} className="block group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.meta.light }}>
                          <m.icon className="w-3.5 h-3.5" style={{ color: m.meta.color }} />
                        </div>
                        <span className="text-sm font-medium">{m.meta.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-semibold"><AnimatedNumber value={val} /></span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: m.meta.color }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => (
          <motion.div key={s.label} variants={item} whileHover={{ y: -3 }} className="h-full">
            <Card className="rounded-2xl border-border p-5 flex flex-col gap-3 h-full transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.tint}1a` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.tint }} />
                </div>
              </div>
              <div className="font-display text-3xl font-semibold text-foreground leading-none">
                <AnimatedNumber value={s.value} format={s.suffix ? (n) => n.toLocaleString() : undefined} />{s.suffix ? ` ${s.suffix}` : ""}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Department ranking */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="rounded-2xl border-border">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Trophy className="w-4 h-4 text-primary" />
            <h3 className="font-display text-lg font-semibold">Department ESG Rankings</h3>
          </div>
          {scores.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No scores yet — add departments and data, then press Recalculate.</p>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6 p-5">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={scores} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="department" width={90} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} formatter={(v) => [`${v}`, "Total Score"]} />
                  <Bar dataKey="total_score" radius={[0, 6, 6, 0]} barSize={22} animationDuration={900}>
                    {scores.map((s, i) => <Cell key={i} fill={scoreBand(s.total_score).color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {scores.map((s, i) => (
                  <div key={s.id} className="rounded-xl bg-accent/40 overflow-hidden">
                    <button onClick={() => setExpandedDept(expandedDept === s.id ? null : s.id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                        <span className="font-medium text-sm">{s.department}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="text-emerald-600">{s.environmental_score}</span>
                          <span className="text-blue-600">{s.social_score}</span>
                          <span className="text-purple-600">{s.governance_score}</span>
                        </div>
                        <span className="font-display text-base font-semibold text-foreground">{s.total_score}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedDept === s.id ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    <motion.div initial={false} animate={{ height: expandedDept === s.id ? "auto" : 0, opacity: expandedDept === s.id ? 1 : 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 space-y-3">
                        {pillars.map((p) => (
                          <div key={p.key}>
                            <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{p.label}</span><span className="font-medium">{s[p.key]}</span></div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${s[p.key]}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: p.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}