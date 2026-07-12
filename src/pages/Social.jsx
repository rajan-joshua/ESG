const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import PageHeader from "@/components/shared/PageHeader";
import EntityManager from "@/components/shared/EntityManager";
import ParticipationReview from "@/components/social/ParticipationReview";
import DiversityMetrics from "@/components/social/DiversityMetrics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, HeartHandshake, ClipboardCheck, BarChart3, UserCog } from "lucide-react";

export default function Social() {
  const [categories, setCategories] = useState([]);
  const [depts, setDepts] = useState([]);

  useEffect(() => {
    db.entities.Category.filter({ type: "CSR Activity" }).then((c) => setCategories(c.map((x) => x.name)));
    db.entities.Department.list("", 200).then((d) => setDepts(d.map((x) => x.name)));
  }, []);

  return (
    <div>
      <PageHeader title="Social" icon={Users} subtitle="CSR activities, employee participation, diversity and training." />
      <Tabs defaultValue="csr">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="csr"><HeartHandshake className="w-4 h-4 mr-1.5" />CSR Activities</TabsTrigger>
          <TabsTrigger value="participation"><ClipboardCheck className="w-4 h-4 mr-1.5" />Participation</TabsTrigger>
          <TabsTrigger value="people"><UserCog className="w-4 h-4 mr-1.5" />People</TabsTrigger>
          <TabsTrigger value="diversity"><BarChart3 className="w-4 h-4 mr-1.5" />Diversity</TabsTrigger>
        </TabsList>

        <TabsContent value="csr">
          <EntityManager
            entityName="CSRActivity" title="CSR Activity" addLabel="New Activity" emptyIcon={HeartHandshake}
            fields={[
              { name: "title", label: "Title", type: "text", required: true },
              { name: "category", label: "Category", type: "select", options: categories.map((c) => ({ value: c, label: c })) },
              { name: "description", label: "Description", type: "textarea" },
              { name: "location", label: "Location", type: "text" },
              { name: "date", label: "Date", type: "date" },
              { name: "points", label: "Points per participant", type: "number" },
              { name: "status", label: "Status", type: "select", options: ["planned", "active", "completed", "cancelled"] },
            ]}
            columns={[
              { key: "title", label: "Activity" },
              { key: "category", label: "Category" },
              { key: "location", label: "Location" },
              { key: "points", label: "Points" },
              { key: "date", label: "Date" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="participation"><ParticipationReview /></TabsContent>

        <TabsContent value="people">
          <EntityManager
            entityName="Employee" title="Employee" addLabel="Add Employee" emptyIcon={UserCog}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "email", label: "Email", type: "text" },
              { name: "department", label: "Department", type: "select", options: depts.map((d) => ({ value: d, label: d })) },
              { name: "role", label: "Role", type: "text" },
              { name: "gender", label: "Gender", type: "select", options: ["male", "female", "other"] },
              { name: "training_completed_pct", label: "Training Completed %", type: "number" },
            ]}
            columns={[
              { key: "name", label: "Name" },
              { key: "department", label: "Department" },
              { key: "role", label: "Role" },
              { key: "xp", label: "XP" },
              { key: "points", label: "Points" },
              { key: "training_completed_pct", label: "Training %" },
            ]}
          />
        </TabsContent>

        <TabsContent value="diversity"><DiversityMetrics /></TabsContent>
      </Tabs>
    </div>
  );
}