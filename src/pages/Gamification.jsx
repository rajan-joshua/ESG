const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import PageHeader from "@/components/shared/PageHeader";
import EntityManager from "@/components/shared/EntityManager";
import ChallengeReview from "@/components/gamification/ChallengeReview";
import RewardsCatalog from "@/components/gamification/RewardsCatalog";
import Leaderboard from "@/components/gamification/Leaderboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Swords, ClipboardCheck, Medal, Award, Gift } from "lucide-react";

export default function Gamification() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    db.entities.Category.filter({ type: "Challenge" }).then((c) => setCategories(c.map((x) => x.name)));
  }, []);

  return (
    <div>
      <PageHeader title="Gamification" icon={Trophy} subtitle="Challenges, XP, badges, rewards and leaderboards." />
      <Tabs defaultValue="challenges">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="challenges"><Swords className="w-4 h-4 mr-1.5" />Challenges</TabsTrigger>
          <TabsTrigger value="submissions"><ClipboardCheck className="w-4 h-4 mr-1.5" />Submissions</TabsTrigger>
          <TabsTrigger value="leaderboard"><Medal className="w-4 h-4 mr-1.5" />Leaderboard</TabsTrigger>
          <TabsTrigger value="badges"><Award className="w-4 h-4 mr-1.5" />Badges</TabsTrigger>
          <TabsTrigger value="rewards"><Gift className="w-4 h-4 mr-1.5" />Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges">
          <EntityManager
            entityName="Challenge" title="Challenge" addLabel="New Challenge" emptyIcon={Swords}
            fields={[
              { name: "title", label: "Title", type: "text", required: true },
              { name: "category", label: "Category", type: "select", options: categories.map((c) => ({ value: c, label: c })) },
              { name: "description", label: "Description", type: "textarea" },
              { name: "xp", label: "XP Reward", type: "number" },
              { name: "difficulty", label: "Difficulty", type: "select", options: ["easy", "medium", "hard"] },
              { name: "evidence_required", label: "Evidence Required", type: "switch" },
              { name: "deadline", label: "Deadline", type: "date" },
              { name: "status", label: "Status", type: "select", options: ["draft", "active", "under_review", "completed", "archived"] },
            ]}
            columns={[
              { key: "title", label: "Challenge" },
              { key: "category", label: "Category" },
              { key: "xp", label: "XP" },
              { key: "difficulty", label: "Difficulty", badge: true },
              { key: "deadline", label: "Deadline" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="submissions"><ChallengeReview /></TabsContent>
        <TabsContent value="leaderboard"><Leaderboard /></TabsContent>

        <TabsContent value="badges">
          <EntityManager
            entityName="Badge" title="Badge" addLabel="New Badge" emptyIcon={Award}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "description", label: "Description", type: "textarea" },
              { name: "unlock_type", label: "Unlock Metric", type: "select", options: [{ value: "xp", label: "Total XP" }, { value: "challenges_completed", label: "Challenges Completed" }] },
              { name: "unlock_threshold", label: "Threshold", type: "number" },
              { name: "icon", label: "Icon (lucide name)", type: "text" },
              { name: "status", label: "Status", type: "select", options: ["active", "inactive"] },
            ]}
            columns={[
              { key: "name", label: "Badge" },
              { key: "unlock_type", label: "Metric", render: (i) => i.unlock_type === "challenges_completed" ? "Challenges" : "XP" },
              { key: "unlock_threshold", label: "Threshold" },
              { key: "status", label: "Status", badge: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="rewards"><RewardsCatalog /></TabsContent>
      </Tabs>
    </div>
  );
}