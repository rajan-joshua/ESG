const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { getConfig, notify } from "@/lib/esg";
import PageHeader from "@/components/shared/PageHeader";
import EntityManager from "@/components/shared/EntityManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shield, FileText, CheckSquare, Search, AlertTriangle } from "lucide-react";

export default function Governance() {
  const [depts, setDepts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [audits, setAudits] = useState([]);
  const [employees, setEmployees] = useState([]);

  const loadRefs = async () => {
    const [d, p, a, e] = await Promise.all([
      db.entities.Department.list("", 200),
      db.entities.ESGPolicy.list("", 200),
      db.entities.Audit.list("", 200),
      db.entities.Employee.list("", 500),
    ]);
    setDepts(d.map((x) => x.name)); setPolicies(p); setAudits(a); setEmployees(e);
  };
  useEffect(() => { loadRefs(); }, []);

  const deptOptions = depts.map((n) => ({ value: n, label: n }));
  const overdue = (i) => i.status !== "resolved" && i.due_date && new Date(i.due_date) < new Date();

  return (
    <div>
      <PageHeader title="Governance" icon={Shield} subtitle="Policies, acknowledgements, audits and compliance tracking." />
      <Tabs defaultValue="policies">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="policies"><FileText className="w-4 h-4 mr-1.5" />Policies</TabsTrigger>
          <TabsTrigger value="acks"><CheckSquare className="w-4 h-4 mr-1.5" />Acknowledgements</TabsTrigger>
          <TabsTrigger value="audits"><Search className="w-4 h-4 mr-1.5" />Audits</TabsTrigger>
          <TabsTrigger value="issues"><AlertTriangle className="w-4 h-4 mr-1.5" />Compliance Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <EntityManager
            entityName="ESGPolicy" title="ESG Policy" addLabel="New Policy" emptyIcon={FileText} onAfterChange={loadRefs}
            fields={[
              { name: "title", label: "Title", type: "text", required: true },
              { name: "category", label: "Category", type: "select", options: ["Environmental", "Social", "Governance"] },
              { name: "description", label: "Description", type: "textarea" },
              { name: "version", label: "Version", type: "text" },
              { name: "effective_date", label: "Effective Date", type: "date" },
              { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
            ]}
            columns={[
              { key: "title", label: "Policy" },
              { key: "category", label: "Category" },
              { key: "version", label: "Version" },
              { key: "effective_date", label: "Effective" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="acks">
          <EntityManager
            entityName="PolicyAcknowledgement" title="Acknowledgement" addLabel="Record" emptyIcon={CheckSquare}
            fields={[
              { name: "policy_title", label: "Policy", type: "select", options: policies.map((p) => ({ value: p.title, label: p.title })), required: true },
              { name: "employee", label: "Employee", type: "select", options: employees.map((e) => ({ value: e.name, label: e.name })), required: true },
              { name: "department", label: "Department", type: "select", options: deptOptions },
              { name: "acknowledged", label: "Acknowledged", type: "switch" },
              { name: "acknowledged_date", label: "Date", type: "date" },
            ]}
            columns={[
              { key: "policy_title", label: "Policy" },
              { key: "employee", label: "Employee" },
              { key: "department", label: "Department" },
              { key: "acknowledged", label: "Status", render: (i) => i.acknowledged
                ? <span className="text-xs font-medium text-emerald-600">Acknowledged</span>
                : <span className="text-xs font-medium text-amber-600">Pending</span> },
              { key: "acknowledged_date", label: "Date" },
            ]}
          />
        </TabsContent>

        <TabsContent value="audits">
          <EntityManager
            entityName="Audit" title="Audit" addLabel="New Audit" emptyIcon={Search} onAfterChange={loadRefs}
            fields={[
              { name: "title", label: "Title", type: "text", required: true },
              { name: "type", label: "Type", type: "select", options: ["internal", "external", "regulatory"] },
              { name: "department", label: "Department", type: "select", options: deptOptions },
              { name: "auditor", label: "Auditor", type: "text" },
              { name: "audit_date", label: "Audit Date", type: "date" },
              { name: "findings", label: "Findings", type: "textarea" },
              { name: "status", label: "Status", type: "select", options: ["scheduled", "in_progress", "completed"] },
            ]}
            columns={[
              { key: "title", label: "Audit" },
              { key: "type", label: "Type", badge: true },
              { key: "department", label: "Department" },
              { key: "auditor", label: "Auditor" },
              { key: "audit_date", label: "Date" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="issues">
          <EntityManager
            entityName="ComplianceIssue" title="Compliance Issue" addLabel="Raise Issue" emptyIcon={AlertTriangle}
            transform={async (data, editing) => {
              if (!editing) {
                const cfg = await getConfig();
                await notify(cfg, { type: "compliance_issue", title: "New compliance issue", message: `${data.severity} severity issue assigned to ${data.owner}.` });
              }
              return data;
            }}
            fields={[
              { name: "description", label: "Description", type: "textarea", required: true },
              { name: "audit", label: "Related Audit", type: "select", options: audits.map((a) => ({ value: a.title, label: a.title })) },
              { name: "severity", label: "Severity", type: "select", options: ["low", "medium", "high", "critical"] },
              { name: "owner", label: "Owner", type: "text", required: true },
              { name: "department", label: "Department", type: "select", options: deptOptions },
              { name: "due_date", label: "Due Date", type: "date", required: true },
              { name: "status", label: "Status", type: "select", options: ["open", "in_progress", "resolved"] },
            ]}
            columns={[
              { key: "description", label: "Issue", render: (i) => (
                <div className="flex items-center gap-2 max-w-xs">
                  {overdue(i) && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
                  <span className="truncate">{i.description}</span>
                </div>
              ) },
              { key: "severity", label: "Severity", badge: true },
              { key: "owner", label: "Owner" },
              { key: "due_date", label: "Due", render: (i) => (
                <span className={overdue(i) ? "text-rose-600 font-medium" : ""}>{i.due_date || "—"}{overdue(i) && " (overdue)"}</span>
              ) },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}