const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Leaf, Users, Shield, Trophy, FileBarChart, Settings,
  Menu, X, LogOut, Bell,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/environmental", label: "Environmental", icon: Leaf },
  { to: "/social", label: "Social", icon: Users },
  { to: "/governance", label: "Governance", icon: Shield },
  { to: "/gamification", label: "Gamification", icon: Trophy },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const NavList = () => (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const Brand = () => (
    <div className="flex items-center gap-2.5 px-5 h-16">
      <img src="https://media.db.com/images/public/6a535e6d843f8add0f35489c/15b8ba089_Screenshot2026-07-12at31950PM.png" alt="EcoBuddy" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
      <div className="leading-tight">
        <div className="font-display font-semibold text-foreground">EcoBuddy</div>
        <div className="text-[11px] text-muted-foreground">ESG Management</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-card">
        <Brand />
        <div className="flex-1 py-4 overflow-y-auto"><NavList /></div>
        <button
          onClick={() => db.auth.logout()}
          className="flex items-center gap-3 px-6 py-4 text-sm text-muted-foreground hover:text-foreground border-t border-border"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <img src="https://media.db.com/images/public/6a535e6d843f8add0f35489c/15b8ba089_Screenshot2026-07-12at31950PM.png" alt="EcoBuddy" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
          <span className="font-display font-semibold">EcoBuddy</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2"><Menu className="w-5 h-5" /></button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-card flex flex-col">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} className="p-4"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 py-4 overflow-y-auto"><NavList /></div>
            <button
              onClick={() => db.auth.logout()}
              className="flex items-center gap-3 px-6 py-4 text-sm text-muted-foreground border-t border-border"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}