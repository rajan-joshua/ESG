const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Loader2, Upload } from "lucide-react";

export default function EntityForm({ fields, initial = {}, onSubmit, onCancel, submitLabel = "Save" }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    const base = {};
    fields.forEach((f) => { base[f.name] = initial[f.name] ?? f.default ?? (f.type === "switch" ? false : ""); });
    setForm(base);
  }, []);

  const set = (name, val) => setForm((p) => ({ ...p, [name]: val }));

  const handleFile = async (name, file) => {
    if (!file) return;
    setUploading(name);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    set(name, file_url);
    setUploading("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const cleaned = { ...form };
    fields.forEach((f) => { if (f.type === "number" && cleaned[f.name] !== "") cleaned[f.name] = Number(cleaned[f.name]); });
    await onSubmit(cleaned);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map((f) => (
        <div key={f.name} className={f.type === "switch" ? "flex items-center justify-between" : "space-y-1.5"}>
          <Label className="text-sm">{f.label}{f.required && <span className="text-rose-500"> *</span>}</Label>
          {f.type === "textarea" ? (
            <Textarea value={form[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} rows={3} />
          ) : f.type === "select" ? (
            <Select value={form[f.name] || ""} onValueChange={(v) => set(f.name, v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {f.options.map((o) => (
                  <SelectItem key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : f.type === "switch" ? (
            <Switch checked={!!form[f.name]} onCheckedChange={(v) => set(f.name, v)} />
          ) : f.type === "file" ? (
            <div className="flex items-center gap-2">
              <input type="file" id={`file-${f.name}`} className="hidden" onChange={(e) => handleFile(f.name, e.target.files[0])} />
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById(`file-${f.name}`).click()}>
                {uploading === f.name ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="ml-2">{form[f.name] ? "Replace file" : "Upload"}</span>
              </Button>
              {form[f.name] && <span className="text-xs text-emerald-600">Attached</span>}
            </div>
          ) : (
            <Input
              type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
              value={form[f.name] ?? ""}
              onChange={(e) => set(f.name, e.target.value)}
              required={f.required}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{submitLabel}
        </Button>
      </div>
    </form>
  );
}