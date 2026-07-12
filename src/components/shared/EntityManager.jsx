const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import EntityForm from "./EntityForm";
import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

// columns: [{ key, label, badge?, render? }]
export default function EntityManager({
  entityName, title, fields, columns, sort = "-created_date",
  emptyIcon, emptyTitle = "Nothing here yet", emptyDescription, addLabel = "Add",
  onAfterChange, transform,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setItems(await db.entities[entityName].list(sort, 200));
    setLoading(false);
  };
  useEffect(() => { load(); }, [entityName]);

  const save = async (rawData) => {
    const data = transform ? await transform(rawData, editing) : rawData;
    if (editing) await db.entities[entityName].update(editing.id, data);
    else await db.entities[entityName].create(data);
    setDialog(false); setEditing(null);
    await load();
    onAfterChange && onAfterChange();
  };

  const remove = async (item) => {
    if (!confirm("Delete this item?")) return;
    await db.entities[entityName].delete(item.id);
    await load();
    onAfterChange && onAfterChange();
  };

  return (
    <Card className="border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <Button size="sm" onClick={() => { setEditing(null); setDialog(true); }}>
          <Plus className="w-4 h-4 mr-1.5" />{addLabel}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} actionLabel={addLabel} onAction={() => { setEditing(null); setDialog(true); }} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                {columns.map((c) => <th key={c.key} className="font-medium px-5 py-3 whitespace-nowrap">{c.label}</th>)}
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 hover:bg-accent/40">
                  {columns.map((c) => (
                    <td key={c.key} className="px-5 py-3 align-middle">
                      {c.render ? c.render(item) : c.badge ? <StatusBadge value={item[c.key]} /> : (item[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(item)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialog} onOpenChange={(o) => { setDialog(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? `Edit ${title}` : `New ${title}`}</DialogTitle></DialogHeader>
          <EntityForm fields={fields} initial={editing || {}} onSubmit={save} onCancel={() => { setDialog(false); setEditing(null); }} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}