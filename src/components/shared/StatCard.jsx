import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ label, value, sub, icon: Icon, tint = "#2f855a" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tint}1a` }}>
            <Icon className="w-4 h-4" style={{ color: tint }} />
          </div>
        )}
      </div>
      <div className="font-display text-3xl font-semibold text-foreground leading-none">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </motion.div>
  );
}