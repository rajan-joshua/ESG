import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import EntityManager from "@/components/shared/EntityManager";
import ConfigSettings from "@/components/settings/ConfigSettings";
import NotificationsList from "@/components/settings/NotificationsList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Building2, Tags, Gift, Bell, SlidersHorizontal } from "lucide-react";

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" icon={SettingsIcon} subtitle="Configure ESG rules, master data and notifications." />
      <Tabs defaultValue="config">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="config"><SlidersHorizontal className="w-4 h-4 mr-1.5" />Configuration</TabsTrigger>
          <TabsTrigger value="departments"><Building2 className="w-4 h-4 mr-1.5" />Departments</TabsTrigger>
          <TabsTrigger value="categories"><Tags className="w-4 h-4 mr-1.5" />Categories</TabsTrigger>
          <TabsTrigger value="rewards"><Gift className="w-4 h-4 mr-1.5" />Rewards</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1.5" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="config"><ConfigSettings /></TabsContent>

        <TabsContent value="departments">
          <EntityManager
            entityName="Department" title="Department" addLabel="Add Department" emptyIcon={Building2}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "code", label: "Code", type: "text" },
              { name: "head", label: "Head", type: "text" },
              { name: "parent_department", label: "Parent Department", type: "text" },
              { name: "employee_count", label: "Employee Count", type: "number" },
              { name: "status", label: "Status", type: "select", options: ["active", "inactive"] },
            ]}
            columns={[
              { key: "name", label: "Name" },
              { key: "code", label: "Code" },
              { key: "head", label: "Head" },
              { key: "employee_count", label: "Employees" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="categories">
          <EntityManager
            entityName="Category" title="Category" addLabel="Add Category" emptyIcon={Tags}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "type", label: "Type", type: "select", options: [{ value: "CSR Activity", label: "CSR Activity" }, { value: "Challenge", label: "Challenge" }] },
              { name: "status", label: "Status", type: "select", options: ["active", "inactive"] },
            ]}
            columns={[
              { key: "name", label: "Name" },
              { key: "type", label: "Type" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="rewards">
          <EntityManager
            entityName="Reward" title="Reward" addLabel="Add Reward" emptyIcon={Gift}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "description", label: "Description", type: "textarea" },
              { name: "points_required", label: "Points Required", type: "number", required: true },
              { name: "stock", label: "Stock", type: "number" },
              { name: "status", label: "Status", type: "select", options: ["active", "inactive"] },
            ]}
            columns={[
              { key: "name", label: "Reward" },
              { key: "points_required", label: "Points" },
              { key: "stock", label: "Stock" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="notifications"><NotificationsList /></TabsContent>
      </Tabs>
    </div>
  );
}