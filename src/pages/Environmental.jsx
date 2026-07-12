const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import PageHeader from "@/components/shared/PageHeader";
import EntityManager from "@/components/shared/EntityManager";
import StatusBadge from "@/components/shared/StatusBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Leaf, Gauge, Cloud, Target, Package } from "lucide-react";

export default function Environmental() {
  const [depts, setDepts] = useState([]);
  const [factors, setFactors] = useState([]);

  const loadRefs = async () => {
    const [d, f] = await Promise.all([
      db.entities.Department.list("", 200),
      db.entities.EmissionFactor.filter({ status: "active" }),
    ]);
    setDepts(d.map((x) => x.name));
    setFactors(f);
  };
  useEffect(() => { loadRefs(); }, []);

  const deptOptions = depts.map((n) => ({ value: n, label: n }));
  const sourceOptions = ["purchase", "manufacturing", "expense", "fleet", "energy", "other"];

  return (
    <div>
      <PageHeader title="Environmental" icon={Leaf} subtitle="Carbon accounting, emission factors and sustainability goals." />
      <Tabs defaultValue="carbon">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="carbon"><Cloud className="w-4 h-4 mr-1.5" />Carbon</TabsTrigger>
          <TabsTrigger value="factors"><Gauge className="w-4 h-4 mr-1.5" />Emission Factors</TabsTrigger>
          <TabsTrigger value="goals"><Target className="w-4 h-4 mr-1.5" />Goals</TabsTrigger>
          <TabsTrigger value="products"><Package className="w-4 h-4 mr-1.5" />Products</TabsTrigger>
        </TabsList>

        <TabsContent value="carbon">
          <EntityManager
            entityName="CarbonTransaction" title="Carbon Transaction" addLabel="Log Emission" emptyIcon={Cloud}
            emptyTitle="No carbon transactions" emptyDescription="Log an activity to calculate its CO₂e footprint."
            fields={[
              { name: "description", label: "Description", type: "text", required: true },
              { name: "department", label: "Department", type: "select", options: deptOptions },
              { name: "source", label: "Source", type: "select", options: sourceOptions },
              { name: "emission_factor", label: "Emission Factor", type: "select", options: factors.map((f) => ({ value: f.name, label: `${f.name} (${f.factor_kg_co2} kg/${f.unit})` })) },
              { name: "activity_amount", label: "Activity Amount", type: "number", required: true },
              { name: "date", label: "Date", type: "date" },
            ]}
            transform={(data) => {
              const f = factors.find((x) => x.name === data.emission_factor);
              const co2 = f ? Number(data.activity_amount || 0) * f.factor_kg_co2 : 0;
              return { ...data, unit: f?.unit || "", co2_kg: Math.round(co2 * 100) / 100 };
            }}
            columns={[
              { key: "description", label: "Description" },
              { key: "department", label: "Department" },
              { key: "source", label: "Source", badge: true },
              { key: "co2_kg", label: "CO₂e (kg)", render: (i) => <span className="font-medium">{(i.co2_kg || 0).toLocaleString()}</span> },
              { key: "date", label: "Date" },
            ]}
          />
        </TabsContent>

        <TabsContent value="factors">
          <EntityManager
            entityName="EmissionFactor" title="Emission Factor" addLabel="Add Factor" emptyIcon={Gauge}
            onAfterChange={loadRefs}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "source", label: "Source", type: "select", options: sourceOptions },
              { name: "unit", label: "Unit (e.g. kWh, liter, km)", type: "text" },
              { name: "factor_kg_co2", label: "kg CO₂e per unit", type: "number", required: true },
              { name: "status", label: "Status", type: "select", options: ["active", "inactive"] },
            ]}
            columns={[
              { key: "name", label: "Name" },
              { key: "source", label: "Source", badge: true },
              { key: "unit", label: "Unit" },
              { key: "factor_kg_co2", label: "Factor" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="goals">
          <EntityManager
            entityName="EnvironmentalGoal" title="Sustainability Goal" addLabel="Add Goal" emptyIcon={Target}
            fields={[
              { name: "title", label: "Title", type: "text", required: true },
              { name: "description", label: "Description", type: "textarea" },
              { name: "metric", label: "Metric", type: "text" },
              { name: "department", label: "Department", type: "select", options: deptOptions },
              { name: "current_value", label: "Current Value", type: "number" },
              { name: "target_value", label: "Target Value", type: "number", required: true },
              { name: "unit", label: "Unit", type: "text" },
              { name: "deadline", label: "Deadline", type: "date" },
              { name: "status", label: "Status", type: "select", options: ["on_track", "at_risk", "achieved", "missed"] },
            ]}
            columns={[
              { key: "title", label: "Goal" },
              { key: "department", label: "Department" },
              { key: "progress", label: "Progress", render: (i) => {
                const pct = Math.min(100, Math.round(((i.current_value || 0) / (i.target_value || 1)) * 100));
                return (
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1"><span>{i.current_value || 0}/{i.target_value} {i.unit}</span><span>{pct}%</span></div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              } },
              { key: "deadline", label: "Deadline" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="products">
          <EntityManager
            entityName="ProductESGProfile" title="Product ESG Profile" addLabel="Add Product" emptyIcon={Package}
            fields={[
              { name: "product_name", label: "Product Name", type: "text", required: true },
              { name: "sku", label: "SKU", type: "text" },
              { name: "carbon_footprint_kg", label: "Carbon Footprint (kg)", type: "number" },
              { name: "recyclable_pct", label: "Recyclable %", type: "number" },
              { name: "sustainability_rating", label: "Rating", type: "select", options: ["A", "B", "C", "D"] },
              { name: "notes", label: "Notes", type: "textarea" },
            ]}
            columns={[
              { key: "product_name", label: "Product" },
              { key: "sku", label: "SKU" },
              { key: "carbon_footprint_kg", label: "Footprint (kg)" },
              { key: "recyclable_pct", label: "Recyclable %" },
              { key: "sustainability_rating", label: "Rating", render: (i) => <span className="font-semibold">{i.sustainability_rating}</span> },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}