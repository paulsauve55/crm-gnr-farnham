import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const T = {
  // Layout
  bg: "#f3f2f2",
  surface: "#ffffff",
  card: "#ffffff",
  border: "#dddbda",
  borderLight: "#e5e5e5",
  // Nav
  navBg: "#0176d3",
  navDark: "#014486",
  navText: "#ffffff",
  navHover: "#0176d3",
  // Brand
  accent: "#0176d3",
  accentDark: "#014486",
  accentLight: "#1b96ff",
  accentBg: "#e8f4fd",
  // Text
  text: "#181818",
  textMuted: "#514f4d",
  textDim: "#706e6b",
  // Status
  success: "#2e844a",
  successBg: "#eaf5ea",
  warning: "#dd7a01",
  warningBg: "#fef0d0",
  danger: "#ba0517",
  dangerBg: "#fceeed",
  info: "#0176d3",
  infoBg: "#e8f4fd",
  gold: "#dd7a01",
  // Header
  headerBg: "#032d60",
};

function uid() { return Math.random().toString(36).slice(2, 10); }
function today() { return new Date().toISOString().slice(0, 10); }
function displayName(e) {
  if (!e) return "—";
  return e.type === "Entreprise" ? (e.company_name || "Sans nom") : `${e.prenom || ""} ${e.nom || ""}`.trim() || "Sans nom";
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  const map = {
    blue: { bg: T.accentBg, text: T.accent, border: "#9ec5e8" },
    green: { bg: T.successBg, text: T.success, border: "#a9d9b1" },
    orange: { bg: T.warningBg, text: T.warning, border: "#f5c97e" },
    red: { bg: T.dangerBg, text: T.danger, border: "#f5a8a8" },
    gray: { bg: "#f3f2f2", text: T.textDim, border: T.border },
    gold: { bg: "#fef7e6", text: T.gold, border: "#f5c97e" },
  };
  const c = map[color] || map.gray;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 4, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div onClick={onClick} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 24px", borderTop: `3px solid ${color || T.accent}`, boxShadow: "0 2px 4px rgba(0,0,0,0.06)", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: T.textMuted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
          <div style={{ color: T.text, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ color: T.textDim, fontSize: 12, marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 28, opacity: 0.5 }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, type = "text", required, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}{required && <span style={{ color: T.danger }}> *</span>}</label>}
      <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: T.surface, border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 4, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", boxShadow: focused ? `0 0 0 3px ${T.accentBg}` : "none", transition: "border-color 0.15s, box-shadow 0.15s" }} />
    </div>
  );
}

// ─── SELECT ───────────────────────────────────────────────────────────────────
function Select({ label, value, onChange, options, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}{required && <span style={{ color: T.danger }}> *</span>}</label>}
      <select value={value ?? ""} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: T.surface, border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 4, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", boxShadow: focused ? `0 0 0 3px ${T.accentBg}` : "none", transition: "border-color 0.15s" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
function Textarea({ label, value, onChange, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</label>}
      <textarea value={value ?? ""} onChange={e => onChange(e.target.value)} rows={rows}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: T.surface, border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 4, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", boxShadow: focused ? `0 0 0 3px ${T.accentBg}` : "none", transition: "border-color 0.15s" }} />
    </div>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", small, disabled, icon }) {
  const styles = {
    primary: { background: T.accent, color: "#fff", border: `1px solid ${T.accentDark}` },
    secondary: { background: T.surface, color: T.accent, border: `1px solid ${T.accent}` },
    neutral: { background: T.surface, color: T.text, border: `1px solid ${T.border}` },
    danger: { background: T.danger, color: "#fff", border: `1px solid ${T.danger}` },
    ghost: { background: "transparent", color: T.accent, border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], borderRadius: 4, padding: small ? "4px 12px" : "8px 16px",
      fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 6,
      boxShadow: variant === "primary" ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
      transition: "background 0.1s",
    }}>{icon && <span>{icon}</span>}{children}</button>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.card, borderRadius: 8, width: wide ? 820 : 560, maxWidth: "95vw", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${T.border}`, background: "#f3f2f2", borderRadius: "8px 8px 0 0" }}>
          <h3 style={{ color: T.text, margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── SECTION TITLE ────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <div style={{ color: T.text, fontWeight: 700, fontSize: 13, marginTop: 20, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${T.borderLight}` }}>{children}</div>;
}

// ─── DETAIL ROW ───────────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
      <span style={{ color: T.textMuted, fontSize: 12, fontWeight: 600 }}>{label}</span>
      <span style={{ color: T.text, fontSize: 13 }}>{value || "—"}</span>
    </div>
  );
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 16px", color: T.textDim }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  );
}

// ─── PAGE HEADER ─────────────────────────────────────────────────────────────
function PageHeader({ title, sub, actions }) {
  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div>
        <h1 style={{ color: T.text, margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h1>
        {sub && <div style={{ color: T.textMuted, fontSize: 13, marginTop: 3 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

// ─── RELATED LIST ─────────────────────────────────────────────────────────────
function RelatedList({ title, icon, count, onAdd, addLabel, children, empty }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f3f2f2", borderBottom: collapsed ? "none" : `1px solid ${T.border}`, cursor: "pointer" }} onClick={() => setCollapsed(c => !c)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{title}</span>
          <span style={{ background: T.accent, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{count}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {onAdd && !collapsed && <Btn small variant="neutral" onClick={e => { e.stopPropagation(); onAdd(); }}>{addLabel || "+ Nouveau"}</Btn>}
          <span style={{ color: T.textDim, fontSize: 14 }}>{collapsed ? "▶" : "▼"}</span>
        </div>
      </div>
      {!collapsed && <div style={{ padding: count === 0 ? 0 : "0 0 4px 0" }}>{count === 0 ? <EmptyState icon="📭" message={empty || "Aucun élément"} /> : children}</div>}
    </div>
  );
}

// ─── ACTIVITY ITEM ────────────────────────────────────────────────────────────
function ActivityItem({ a, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const typeIcon = { Courriel: "📧", Appel: "📞", Rencontre: "🤝", Tâche: "✅", Suivi: "🔔", Autre: "📝" }[a.type] || "📝";
  return (
    <div style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, flex: 1 }}>
          <div style={{ fontSize: 22, marginTop: 2 }}>{typeIcon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ color: T.text, fontWeight: 600, fontSize: 13 }}>{a.desc_courte}</span>
              <Badge label={a.statut} color={statutColor(a.statut)} />
              <Badge label={a.type} color="blue" />
            </div>
            <div style={{ color: T.textMuted, fontSize: 12 }}>
              {a.date}{a.assigne_a ? ` · Assigné à: ${a.assigne_a}` : ""}
              {a.date_suivi ? <span style={{ color: T.warning, marginLeft: 8 }}>⏰ Suivi: {a.date_suivi}</span> : ""}
            </div>
            {a.description && (
              <div style={{ marginTop: 6 }}>
                <button onClick={() => setExpanded(x => !x)} style={{ background: "none", border: "none", color: T.accent, fontSize: 12, cursor: "pointer", padding: 0, fontWeight: 600 }}>
                  {expanded ? "▲ Masquer la note" : "▼ Voir la note"}
                </button>
                {expanded && <div style={{ background: "#f8f8f8", border: `1px solid ${T.border}`, borderRadius: 4, padding: "10px 12px", marginTop: 6, fontSize: 13, color: T.text, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{a.description}</div>}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginLeft: 12 }}>
          <Btn variant="neutral" small onClick={() => onEdit(a)}>✏️</Btn>
          <Btn variant="neutral" small onClick={() => onDelete(a.id)}>🗑️</Btn>
        </div>
      </div>
    </div>
  );
}

function statutColor(s) { return { "Terminé": "green", "Actif": "blue", "Planifiée": "orange", "Annulé": "gray" }[s] || "gray"; }
function typeColor(t) { return { "Entreprise": "blue", "Individu": "gold" }[t] || "gray"; }

// ─── ENTITY FORM ──────────────────────────────────────────────────────────────
function EntityForm({ initial, onSave, onClose }) {
  const blank = { type: "Entreprise", prenom: "", nom: "", company_name: "", company_number: "", no_tps: "", no_tvq: "", transporteur: "", adresse_no: "", adresse_rue: "", adresse_ville: "", adresse_province: "QC", adresse_code_postal: "", telephone1: "", telephone1_desc: "", telephone2: "", telephone2_desc: "", courriel: "", site_web: "", consentement: "Non obtenu", notes: "" };
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const isEnt = f.type === "Entreprise";
  const save = async () => {
    if (isEnt && !f.company_name) return alert("Nom d'entreprise requis");
    if (!isEnt && (!f.prenom || !f.nom)) return alert("Prénom et nom requis");
    setSaving(true);
    const row = { ...f, id: initial?.id || uid(), created_at: initial?.created_at || today(), deleted_at: null };
    const { error } = initial ? await supabase.from("entities").update(row).eq("id", row.id) : await supabase.from("entities").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Select label="Type *" value={f.type} onChange={set("type")} options={["Entreprise", "Individu"]} required />
        {!isEnt && <><Input label="Prénom *" value={f.prenom} onChange={set("prenom")} required /><Input label="Nom *" value={f.nom} onChange={set("nom")} required /></>}
        <Input label={isEnt ? "Nom d'entreprise *" : "Nom d'entreprise"} value={f.company_name} onChange={set("company_name")} />
        <Input label="No d'entreprise (NEQ)" value={f.company_number} onChange={set("company_number")} />
        {isEnt && <><Input label="No TPS" value={f.no_tps} onChange={set("no_tps")} placeholder="123456789 RT0001" /><Input label="No TVQ" value={f.no_tvq} onChange={set("no_tvq")} placeholder="1234567890TQ0001" /></>}
        <Select label="Transporteur attitré" value={f.transporteur} onChange={set("transporteur")} options={[{ value: "", label: "— Sélectionner —" }, "EDI", "Autre"]} />
      </div>
      <SectionTitle>Adresse postale</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <Input label="No porte" value={f.adresse_no} onChange={set("adresse_no")} />
        <Input label="Rue" value={f.adresse_rue} onChange={set("adresse_rue")} />
        <Input label="Ville" value={f.adresse_ville} onChange={set("adresse_ville")} />
        <Select label="Province" value={f.adresse_province} onChange={set("adresse_province")} options={["QC","ON","NB","NS","PE","NL","MB","SK","AB","BC"]} />
        <Input label="Code postal" value={f.adresse_code_postal} onChange={set("adresse_code_postal")} placeholder="J1A 2B3" />
      </div>
      <SectionTitle>Coordonnées</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input label="Tél. 1" value={f.telephone1} onChange={set("telephone1")} placeholder="(450) 555-0101" />
        <Input label="Description tél. 1" value={f.telephone1_desc} onChange={set("telephone1_desc")} placeholder="Bureau, Cellulaire..." />
        <Input label="Tél. 2" value={f.telephone2} onChange={set("telephone2")} />
        <Input label="Description tél. 2" value={f.telephone2_desc} onChange={set("telephone2_desc")} />
        <Input label="Courriel" value={f.courriel} onChange={set("courriel")} type="email" />
        <Input label="Site web" value={f.site_web} onChange={set("site_web")} />
      </div>
      {!isEnt && <Select label="Consentement aux communications *" value={f.consentement} onChange={set("consentement")} required options={[{ value: "", label: "— Sélectionner —" }, "Non obtenu", "Explicite", "Refus"]} />}
      <Textarea label="Notes" value={f.notes} onChange={set("notes")} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <Btn variant="neutral" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
      </div>
    </div>
  );
}

// ─── LIEU FORM ────────────────────────────────────────────────────────────────
function LieuForm({ initial, entityId, onSave, onClose }) {
  const blank = { entity_id: entityId, type_lieu: "Collecte", adresse_no: "", adresse_rue: "", adresse_ville: "", adresse_province: "QC", adresse_code_postal: "", adresse_url: "", lat_long: "", description: "", plan_deplacement: "Non", plan_desc: "", tonnage_matiere: "", tonnage_digestat: "", type_biomasse: [], type_biomass_autre: "", type_deject_masse: "Liquide", type_litiere: "", taille_cheptel: "", freq_collecte: "", volume_pre_fosse: "", hectares: "", capacite_phosphore: "" };
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const toggleBio = v => setF(p => ({ ...p, type_biomasse: (p.type_biomasse || []).includes(v) ? p.type_biomasse.filter(x => x !== v) : [...(p.type_biomasse || []), v] }));
  const save = async () => {
    if (!f.type_lieu) return alert("Type de lieu requis");
    setSaving(true);
    const row = { ...f, id: initial?.id || uid(), created_at: initial?.created_at || today(), deleted_at: null, tonnage_matiere: f.tonnage_matiere || null, tonnage_digestat: f.tonnage_digestat || null, taille_cheptel: f.taille_cheptel || null, freq_collecte: f.freq_collecte || null, volume_pre_fosse: f.volume_pre_fosse || null, hectares: f.hectares || null, capacite_phosphore: f.capacite_phosphore || null };
    const { error } = initial ? await supabase.from("lieux").update(row).eq("id", row.id) : await supabase.from("lieux").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Select label="Type de lieu *" value={f.type_lieu} onChange={set("type_lieu")} options={["Collecte", "Dépôt", "Collecte et dépôt"]} />
        <Select label="Plan de déplacement *" value={f.plan_deplacement} onChange={set("plan_deplacement")} options={["Non", "Oui", "À venir"]} />
      </div>
      <SectionTitle>Adresse du lieu</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <Input label="No porte" value={f.adresse_no} onChange={set("adresse_no")} />
        <Input label="Rue" value={f.adresse_rue} onChange={set("adresse_rue")} />
        <Input label="Ville" value={f.adresse_ville} onChange={set("adresse_ville")} />
        <Select label="Province" value={f.adresse_province} onChange={set("adresse_province")} options={["QC","ON","NB","NS","PE","NL","MB","SK","AB","BC"]} />
        <Input label="Code postal" value={f.adresse_code_postal} onChange={set("adresse_code_postal")} />
        <Input label="URL Google Maps" value={f.adresse_url} onChange={set("adresse_url")} placeholder="https://maps.app.goo.gl/..." />
        <Input label="Latitude / Longitude" value={f.lat_long} onChange={set("lat_long")} placeholder="45°20'15N 72°58'42W" />
      </div>
      <Textarea label="Description" value={f.description} onChange={set("description")} rows={2} />
      {f.plan_deplacement === "Oui" && <Textarea label="Description du plan de déplacement" value={f.plan_desc} onChange={set("plan_desc")} rows={2} />}
      <SectionTitle>Données agricoles</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input label="Tonnage annuel matière (t)" value={f.tonnage_matiere} onChange={set("tonnage_matiere")} type="number" />
        <Input label="Tonnage annuel digestat (t)" value={f.tonnage_digestat} onChange={set("tonnage_digestat")} type="number" />
        <div>
          <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Type de biomasse</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["Porc", "Bœuf", "Volaille", "Autre"].map(v => (
              <label key={v} style={{ display: "flex", alignItems: "center", gap: 5, color: T.text, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={(f.type_biomasse || []).includes(v)} onChange={() => toggleBio(v)} /> {v}
              </label>
            ))}
          </div>
          {(f.type_biomasse || []).includes("Autre") && <div style={{ marginTop: 8 }}><Input label="Préciser" value={f.type_biomass_autre} onChange={set("type_biomass_autre")} /></div>}
        </div>
        <Select label="Type de déjection" value={f.type_deject_masse} onChange={set("type_deject_masse")} options={["Solide", "Liquide", "Solide + liquide"]} />
        <Input label="Type de litière" value={f.type_litiere} onChange={set("type_litiere")} placeholder="Paille, Rip..." />
        <Input label="Taille du cheptel (têtes)" value={f.taille_cheptel} onChange={set("taille_cheptel")} type="number" />
        <Input label="Fréquence collecte (heures)" value={f.freq_collecte} onChange={set("freq_collecte")} type="number" />
        <Input label="Volume utile pré-fosse (m³)" value={f.volume_pre_fosse} onChange={set("volume_pre_fosse")} type="number" />
        <Input label="Hectares en culture" value={f.hectares} onChange={set("hectares")} type="number" />
        <Input label="Capacité phosphore (kg)" value={f.capacite_phosphore} onChange={set("capacite_phosphore")} type="number" />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <Btn variant="neutral" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
      </div>
    </div>
  );
}

// ─── ACTIVITE FORM ────────────────────────────────────────────────────────────
function ActiviteForm({ initial, entityId, onSave, onClose }) {
  const blank = { entity_id: entityId, date: today(), date_suivi: "", assigne_a: "", realise_p: "", statut: "Actif", type: "Appel", desc_courte: "", description: "", url: "", modif_par: "" };
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!f.desc_courte) return alert("Description courte requise");
    setSaving(true);
    const row = { ...f, id: initial?.id || uid() };
    const { error } = initial ? await supabase.from("activites").update(row).eq("id", row.id) : await supabase.from("activites").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Select label="Type d'activité" value={f.type} onChange={set("type")} options={["Courriel", "Appel", "Rencontre", "Tâche", "Suivi", "Autre"]} />
        <Select label="Statut" value={f.statut} onChange={set("statut")} options={["Actif", "Planifiée", "Terminé", "Annulé"]} />
        <Input label="Date *" value={f.date} onChange={set("date")} type="date" />
        <Input label="Date de suivi" value={f.date_suivi} onChange={set("date_suivi")} type="date" />
        <Input label="Assigné à" value={f.assigne_a} onChange={set("assigne_a")} placeholder="Nom de l'utilisateur" />
        <Input label="Réalisé par" value={f.realise_p} onChange={set("realise_p")} placeholder="Nom de l'utilisateur" />
      </div>
      <Input label="Objet / Description courte *" value={f.desc_courte} onChange={set("desc_courte")} />
      <Textarea label="Note / Description détaillée" value={f.description} onChange={set("description")} rows={5} />
      <Input label="URL" value={f.url} onChange={set("url")} type="url" />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <Btn variant="neutral" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
      </div>
    </div>
  );
}

// ─── RELATION FORM ────────────────────────────────────────────────────────────
function RelationForm({ initial, entityId, entities, onSave, onClose }) {
  const blank = { entity_a_id: entityId, entity_b_id: "", type_relation: "Contact quotidien", date_debut: today(), date_fin: "", raison_fin: "", description: "" };
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!f.entity_b_id) return alert("Entité liée requise");
    setSaving(true);
    const row = { ...f, id: initial?.id || uid() };
    const { error } = initial ? await supabase.from("relations").update(row).eq("id", row.id) : await supabase.from("relations").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <Select label="Entité liée *" value={f.entity_b_id} onChange={set("entity_b_id")} options={[{ value: "", label: "— Sélectionner —" }, ...entities.filter(e => e.id !== entityId).map(e => ({ value: e.id, label: displayName(e) }))]} />
      <Select label="Type de relation" value={f.type_relation} onChange={set("type_relation")} options={["Contact urgence", "Signataire autorisé", "Contact contractuel", "Contact quotidien", "Contact alternatif (vacances)", "Firme d'agronome", "Agronome", "Autre"]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input label="Date de début" value={f.date_debut} onChange={set("date_debut")} type="date" />
        <Input label="Date de fin" value={f.date_fin} onChange={set("date_fin")} type="date" />
      </div>
      <Textarea label="Raison de fin" value={f.raison_fin} onChange={set("raison_fin")} rows={2} />
      <Textarea label="Description" value={f.description} onChange={set("description")} rows={3} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <Btn variant="neutral" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
      </div>
    </div>
  );
}

// ─── DOCUMENT FORM ────────────────────────────────────────────────────────────
function DocumentForm({ initial, entityId, onSave, onClose }) {
  const blank = { entity_id: entityId, date_sauvegarde: today(), type_doc: "Contrat", actif: true, echeance: "", description: "", file_name: "" };
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const save = async () => {
    setSaving(true);
    const row = { ...f, id: initial?.id || uid() };
    const { error } = initial ? await supabase.from("documents").update(row).eq("id", row.id) : await supabase.from("documents").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <Select label="Type de document" value={f.type_doc} onChange={set("type_doc")} options={["Contrat", "Avenant", "Lettre d'intention", "Plan de déplacement", "Autre"]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input label="Date sauvegarde" value={f.date_sauvegarde} onChange={set("date_sauvegarde")} type="date" />
        <Input label="Échéance" value={f.echeance} onChange={set("echeance")} type="date" />
        <Input label="Nom du fichier" value={f.file_name} onChange={set("file_name")} placeholder="document.pdf" />
        <div style={{ display: "flex", alignItems: "center", paddingTop: 22 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: T.text, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={f.actif} onChange={e => set("actif")(e.target.checked)} /> Document actif
          </label>
        </div>
      </div>
      <Textarea label="Description" value={f.description} onChange={set("description")} rows={3} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <Btn variant="neutral" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
      </div>
    </div>
  );
}

// ─── PRIME FORM ───────────────────────────────────────────────────────────────
function PrimeForm({ initial, entityId, onSave, onClose }) {
  const blank = { entity_id: entityId, date: today(), montant: "", description: "" };
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!f.montant) return alert("Montant requis");
    setSaving(true);
    const row = { ...f, id: initial?.id || uid(), montant: Number(f.montant) };
    const { error } = initial ? await supabase.from("primes").update(row).eq("id", row.id) : await supabase.from("primes").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input label="Date" value={f.date} onChange={set("date")} type="date" />
        <Input label="Montant ($)" value={f.montant} onChange={set("montant")} type="number" />
      </div>
      <Textarea label="Description" value={f.description} onChange={set("description")} rows={3} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <Btn variant="neutral" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
      </div>
    </div>
  );
}

// ─── ENTITY DETAIL ────────────────────────────────────────────────────────────
function EntityDetail({ entity, entities, lieux, activites, relations, documents, primes,
  onEditEntity, onDeleteEntity, onSaveLieu, onDeleteLieu, onSaveActivite, onDeleteActivite,
  onSaveRelation, onDeleteRelation, onSaveDocument, onDeleteDocument, onSavePrime, onDeletePrime, onClose }) {
  const [modal, setModal] = useState(null);
  const eLieux = lieux.filter(l => l.entity_id === entity.id && !l.deleted_at);
  const eActivites = [...activites.filter(a => a.entity_id === entity.id)].sort((a, b) => b.date.localeCompare(a.date));
  const eRelations = relations.filter(r => r.entity_a_id === entity.id || r.entity_b_id === entity.id);
  const eDocs = documents.filter(d => d.entity_id === entity.id);
  const ePrimes = primes.filter(p => p.entity_id === entity.id);
  const totMat = eLieux.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
  const totDig = eLieux.reduce((s, l) => s + (Number(l.tonnage_digestat) || 0), 0);
  const totalPrimes = ePrimes.reduce((s, p) => s + (Number(p.montant) || 0), 0);

  const handleDeleteActivite = async id => {
    if (!confirm("Supprimer cette activité ?")) return;
    await supabase.from("activites").delete().eq("id", id);
    onDeleteActivite(id);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 13, color: T.textMuted }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0 }}>Entités</button>
        <span>›</span>
        <span style={{ color: T.text }}>{displayName(entity)}</span>
      </div>

      {/* Record header */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: entity.type === "Entreprise" ? T.accentBg : "#fef7e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `2px solid ${entity.type === "Entreprise" ? T.accent : T.gold}` }}>
              {entity.type === "Entreprise" ? "🏢" : "👤"}
            </div>
            <div>
              <h2 style={{ color: T.text, margin: "0 0 4px 0", fontSize: 22, fontWeight: 700 }}>{displayName(entity)}</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge label={entity.type} color={typeColor(entity.type)} />
                {entity.adresse_ville && <span style={{ color: T.textMuted, fontSize: 13 }}>📍 {entity.adresse_ville}, {entity.adresse_province}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="neutral" onClick={() => onEditEntity(entity)}>✏️ Modifier</Btn>
            <Btn variant="danger" onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("entities").delete().eq("id", entity.id); onDeleteEntity(entity.id); onClose(); }}>🗑️</Btn>
          </div>
        </div>
        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.borderLight}` }}>
          {[
            { label: "Tonnage matière", value: `${totMat.toLocaleString()} t`, icon: "🌿" },
            { label: "Tonnage digestat", value: `${totDig.toLocaleString()} t`, icon: "♻️" },
            { label: "Sites", value: eLieux.length, icon: "📍" },
            { label: "Primes", value: totalPrimes.toLocaleString("fr-CA", { style: "currency", currency: "CAD" }), icon: "💰" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 16 }}>{s.value}</div>
              <div style={{ color: T.textMuted, fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, alignItems: "start" }}>
        {/* Left: details */}
        <div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 12 }}>Informations</div>
            {entity.type === "Individu" && <DetailRow label="Prénom / Nom" value={`${entity.prenom || ""} ${entity.nom || ""}`} />}
            {entity.company_name && <DetailRow label="Entreprise" value={entity.company_name} />}
            {entity.company_number && <DetailRow label="No d'entreprise" value={entity.company_number} />}
            {entity.no_tps && <DetailRow label="No TPS" value={entity.no_tps} />}
            {entity.no_tvq && <DetailRow label="No TVQ" value={entity.no_tvq} />}
            {entity.transporteur && <DetailRow label="Transporteur" value={entity.transporteur} />}
            <DetailRow label="Adresse" value={[entity.adresse_no, entity.adresse_rue, entity.adresse_ville, entity.adresse_province, entity.adresse_code_postal].filter(Boolean).join(" ")} />
            {entity.telephone1 && <DetailRow label={`Tél. (${entity.telephone1_desc || "principal"})`} value={entity.telephone1} />}
            {entity.telephone2 && <DetailRow label={`Tél. (${entity.telephone2_desc || "secondaire"})`} value={entity.telephone2} />}
            {entity.courriel && <DetailRow label="Courriel" value={entity.courriel} />}
            {entity.site_web && <DetailRow label="Site web" value={entity.site_web} />}
            {entity.type === "Individu" && <DetailRow label="Consentement" value={entity.consentement} />}
            {entity.notes && <DetailRow label="Notes" value={entity.notes} />}
          </div>
        </div>

        {/* Right: related lists */}
        <div>
          {/* ACTIVITÉS */}
          <RelatedList title="Activités" icon="📅" count={eActivites.length} onAdd={() => setModal({ type: "activite" })} addLabel="+ Nouvelle activité" empty="Aucune activité enregistrée">
            {eActivites.map(a => (
              <ActivityItem key={a.id} a={a}
                onEdit={a => setModal({ type: "activite", item: a })}
                onDelete={handleDeleteActivite} />
            ))}
          </RelatedList>

          {/* LIEUX */}
          <RelatedList title="Lieux de retrait / dépôt" icon="📍" count={eLieux.length} onAdd={() => setModal({ type: "lieu" })} addLabel="+ Nouveau lieu" empty="Aucun lieu enregistré">
            {eLieux.map(l => (
              <div key={l.id} style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <Badge label={l.type_lieu} color="blue" />
                      <Badge label={`Plan: ${l.plan_deplacement}`} color={l.plan_deplacement === "Oui" ? "green" : l.plan_deplacement === "À venir" ? "orange" : "gray"} />
                    </div>
                    <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{[l.adresse_no, l.adresse_rue, l.adresse_ville, l.adresse_province].filter(Boolean).join(" ") || "Adresse non définie"}</div>
                    {l.description && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 3 }}>{l.description}</div>}
                    {l.lat_long && <div style={{ color: T.textDim, fontSize: 12, marginTop: 2 }}>📌 {l.lat_long}</div>}
                    <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                      {l.tonnage_matiere && <span style={{ color: T.textMuted, fontSize: 12 }}>🌿 <b style={{ color: T.text }}>{l.tonnage_matiere} t</b></span>}
                      {l.tonnage_digestat && <span style={{ color: T.textMuted, fontSize: 12 }}>♻️ <b style={{ color: T.text }}>{l.tonnage_digestat} t</b></span>}
                      {l.type_biomasse?.length > 0 && <span style={{ color: T.textMuted, fontSize: 12 }}>🐄 {l.type_biomasse.join(", ")}</span>}
                      {l.taille_cheptel && <span style={{ color: T.textMuted, fontSize: 12 }}>🐖 {Number(l.taille_cheptel).toLocaleString()} têtes</span>}
                      {l.hectares && <span style={{ color: T.textMuted, fontSize: 12 }}>🌾 {l.hectares} ha</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Btn variant="neutral" small onClick={() => setModal({ type: "lieu", item: l })}>✏️</Btn>
                    <Btn variant="neutral" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("lieux").delete().eq("id", l.id); onDeleteLieu(l.id); }}>🗑️</Btn>
                  </div>
                </div>
              </div>
            ))}
          </RelatedList>

          {/* RELATIONS */}
          <RelatedList title="Relations" icon="🤝" count={eRelations.length} onAdd={() => setModal({ type: "relation" })} addLabel="+ Nouvelle relation" empty="Aucune relation enregistrée">
            {eRelations.map(r => {
              const otherId = r.entity_a_id === entity.id ? r.entity_b_id : r.entity_a_id;
              const other = entities.find(e => e.id === otherId);
              return (
                <div key={r.id} style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: T.text, fontWeight: 600, fontSize: 13 }}>{displayName(other)}</div>
                    <div style={{ marginTop: 4 }}><Badge label={r.type_relation} color="gold" /></div>
                    {r.description && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>{r.description}</div>}
                    <div style={{ color: T.textDim, fontSize: 12, marginTop: 3 }}>Depuis: {r.date_debut}{r.date_fin ? ` → ${r.date_fin}` : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Btn variant="neutral" small onClick={() => setModal({ type: "relation", item: r })}>✏️</Btn>
                    <Btn variant="neutral" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("relations").delete().eq("id", r.id); onDeleteRelation(r.id); }}>🗑️</Btn>
                  </div>
                </div>
              );
            })}
          </RelatedList>

          {/* DOCUMENTS */}
          <RelatedList title="Documents" icon="📄" count={eDocs.length} onAdd={() => setModal({ type: "document" })} addLabel="+ Nouveau document" empty="Aucun document enregistré">
            {eDocs.map(d => (
              <div key={d.id} style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    <Badge label={d.type_doc} color="blue" />
                    {d.actif ? <Badge label="Actif" color="green" /> : <Badge label="Inactif" color="gray" />}
                  </div>
                  <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{d.file_name || "Fichier non défini"}</div>
                  {d.echeance && <div style={{ color: T.warning, fontSize: 12, marginTop: 3 }}>⏰ Échéance: {d.echeance}</div>}
                  {d.description && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 3 }}>{d.description}</div>}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn variant="neutral" small onClick={() => setModal({ type: "document", item: d })}>✏️</Btn>
                  <Btn variant="neutral" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("documents").delete().eq("id", d.id); onDeleteDocument(d.id); }}>🗑️</Btn>
                </div>
              </div>
            ))}
          </RelatedList>

          {/* PRIMES */}
          <RelatedList title="Primes" icon="💰" count={ePrimes.length} onAdd={() => setModal({ type: "prime" })} addLabel="+ Nouvelle prime" empty="Aucune prime enregistrée">
            {ePrimes.map(p => (
              <div key={p.id} style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: 16 }}>{Number(p.montant).toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</span>
                  <span style={{ color: T.textMuted, fontSize: 12, marginLeft: 12 }}>{p.date}</span>
                  {p.description && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 3 }}>{p.description}</div>}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn variant="neutral" small onClick={() => setModal({ type: "prime", item: p })}>✏️</Btn>
                  <Btn variant="neutral" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("primes").delete().eq("id", p.id); onDeletePrime(p.id); }}>🗑️</Btn>
                </div>
              </div>
            ))}
            {ePrimes.length > 0 && <div style={{ padding: "10px 16px", textAlign: "right", color: T.text, fontWeight: 700 }}>Total: {totalPrimes.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</div>}
          </RelatedList>
        </div>
      </div>

      {modal?.type === "lieu" && <Modal title={modal.item ? "Modifier lieu" : "Nouveau lieu"} onClose={() => setModal(null)} wide><LieuForm initial={modal.item} entityId={entity.id} onSave={l => { onSaveLieu(l); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
      {modal?.type === "activite" && <Modal title={modal.item ? "Modifier activité" : "Nouvelle activité"} onClose={() => setModal(null)} wide><ActiviteForm initial={modal.item} entityId={entity.id} onSave={a => { onSaveActivite(a); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
      {modal?.type === "relation" && <Modal title={modal.item ? "Modifier relation" : "Nouvelle relation"} onClose={() => setModal(null)}><RelationForm initial={modal.item} entityId={entity.id} entities={entities} onSave={r => { onSaveRelation(r); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
      {modal?.type === "document" && <Modal title={modal.item ? "Modifier document" : "Nouveau document"} onClose={() => setModal(null)}><DocumentForm initial={modal.item} entityId={entity.id} onSave={d => { onSaveDocument(d); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
      {modal?.type === "prime" && <Modal title={modal.item ? "Modifier prime" : "Nouvelle prime"} onClose={() => setModal(null)}><PrimeForm initial={modal.item} entityId={entity.id} onSave={p => { onSavePrime(p); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ entities, lieux, activites, documents, primes, onNavigate }) {
  const totalMat = lieux.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
  const totalDig = lieux.reduce((s, l) => s + (Number(l.tonnage_digestat) || 0), 0);
  const totalPrimes = primes.reduce((s, p) => s + (Number(p.montant) || 0), 0);
  const docsEcheant = documents.filter(d => d.echeance && d.echeance <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) && d.actif);
  const bioCount = {};
  lieux.forEach(l => (l.type_biomasse || []).forEach(b => { bioCount[b] = (bioCount[b] || 0) + 1; }));
  const recActs = [...activites].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  return (
    <div>
      <PageHeader title="Tableau de bord" sub="Projet GNR Farnham · Energir Développement inc." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="🏢" label="Entités actives" value={entities.length} sub={`${entities.filter(e=>e.type==="Entreprise").length} entreprises · ${entities.filter(e=>e.type==="Individu").length} individus`} color={T.accent} onClick={() => onNavigate("entities")} />
        <StatCard icon="📍" label="Sites enregistrés" value={lieux.length} color={T.warning} />
        <StatCard icon="🌿" label="Tonnage matière (t/an)" value={totalMat.toLocaleString()} color="#2e844a" />
        <StatCard icon="♻️" label="Tonnage digestat (t/an)" value={totalDig.toLocaleString()} color="#0176d3" />
        <StatCard icon="📅" label="Activités planifiées" value={activites.filter(a=>a.statut==="Planifiée").length} color={T.warning} onClick={() => onNavigate("activites")} />
        <StatCard icon="⚡" label="En cours" value={activites.filter(a=>a.statut==="Actif").length} color={T.accent} />
        <StatCard icon="💰" label="Primes totales" value={totalPrimes.toLocaleString("fr-CA",{style:"currency",currency:"CAD"})} color={T.gold} />
        <StatCard icon={docsEcheant.length > 0 ? "⚠️" : "📄"} label="Docs échéant (30j)" value={docsEcheant.length} color={docsEcheant.length > 0 ? T.danger : T.textDim} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "#f3f2f2", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 13, color: T.text }}>🐄 Répartition de la biomasse</div>
          <div style={{ padding: 16 }}>
            {Object.entries(bioCount).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{k}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 140, height: 8, background: T.borderLight, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (v / Math.max(...Object.values(bioCount))) * 100)}%`, height: "100%", background: T.accent, borderRadius: 4 }} />
                  </div>
                  <span style={{ color: T.textMuted, fontSize: 12, minWidth: 50 }}>{v} site(s)</span>
                </div>
              </div>
            ))}
            {Object.keys(bioCount).length === 0 && <EmptyState icon="🌾" message="Aucune donnée de biomasse" />}
          </div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "#f3f2f2", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 13, color: T.text }}>📅 Activités récentes</div>
          <div>
            {recActs.map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${T.borderLight}` }}>
                <div>
                  <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{a.desc_courte}</div>
                  <div style={{ color: T.textDim, fontSize: 12 }}>{a.date} · {a.type}</div>
                </div>
                <Badge label={a.statut} color={statutColor(a.statut)} />
              </div>
            ))}
            {activites.length === 0 && <EmptyState icon="📭" message="Aucune activité" />}
          </div>
        </div>
        {docsEcheant.length > 0 && (
          <div style={{ background: T.card, border: `1px solid ${T.danger}`, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: T.dangerBg, borderBottom: `1px solid ${T.danger}`, fontWeight: 700, fontSize: 13, color: T.danger }}>⚠️ Documents échéant dans 30 jours</div>
            <div>
              {docsEcheant.map(d => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${T.borderLight}` }}>
                  <span style={{ color: T.text, fontSize: 13 }}>{d.file_name || d.type_doc}</span>
                  <span style={{ color: T.danger, fontSize: 12, fontWeight: 600 }}>Éch.: {d.echeance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [entities, setEntities] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [activites, setActivites] = useState([]);
  const [relations, setRelations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [primes, setPrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Tous");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [e, l, a, r, d, p] = await Promise.all([
        supabase.from("entities").select("*").is("deleted_at", null),
        supabase.from("lieux").select("*").is("deleted_at", null),
        supabase.from("activites").select("*"),
        supabase.from("relations").select("*"),
        supabase.from("documents").select("*"),
        supabase.from("primes").select("*"),
      ]);
      setEntities(e.data || []);
      setLieux(l.data || []);
      setActivites(a.data || []);
      setRelations(r.data || []);
      setDocuments(d.data || []);
      setPrimes(p.data || []);
      setLoading(false);
    }
    loadAll();
  }, []);

  const saveEntity = row => { setEntities(prev => prev.some(x => x.id === row.id) ? prev.map(x => x.id === row.id ? row : x) : [...prev, row]); setShowEntityForm(false); setEditingEntity(null); };
  const deleteEntity = id => setEntities(prev => prev.filter(x => x.id !== id));
  const saveLieu = row => setLieux(prev => prev.some(x => x.id === row.id) ? prev.map(x => x.id === row.id ? row : x) : [...prev, row]);
  const deleteLieu = id => setLieux(prev => prev.filter(x => x.id !== id));
  const saveActivite = row => setActivites(prev => prev.some(x => x.id === row.id) ? prev.map(x => x.id === row.id ? row : x) : [...prev, row]);
  const deleteActivite = id => setActivites(prev => prev.filter(x => x.id !== id));
  const saveRelation = row => setRelations(prev => prev.some(x => x.id === row.id) ? prev.map(x => x.id === row.id ? row : x) : [...prev, row]);
  const deleteRelation = id => setRelations(prev => prev.filter(x => x.id !== id));
  const saveDocument = row => setDocuments(prev => prev.some(x => x.id === row.id) ? prev.map(x => x.id === row.id ? row : x) : [...prev, row]);
  const deleteDocument = id => setDocuments(prev => prev.filter(x => x.id !== id));
  const savePrime = row => setPrimes(prev => prev.some(x => x.id === row.id) ? prev.map(x => x.id === row.id ? row : x) : [...prev, row]);
  const deletePrime = id => setPrimes(prev => prev.filter(x => x.id !== id));

  const filteredEntities = entities.filter(e => {
    if (filterType !== "Tous" && e.type !== filterType) return false;
    const q = search.toLowerCase();
    return !q || displayName(e).toLowerCase().includes(q) || (e.courriel || "").toLowerCase().includes(q) || (e.adresse_ville || "").toLowerCase().includes(q);
  });

  const NAV = [
    { id: "dashboard", icon: "⊞", label: "Accueil" },
    { id: "entities", icon: "🏢", label: "Entités" },
    { id: "activites", icon: "📅", label: "Activités" },
    { id: "rapports", icon: "📊", label: "Rapport" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Salesforce Sans', 'Segoe UI', Arial, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Top nav bar */}
      <div style={{ background: T.headerBg, height: 52, display: "flex", alignItems: "center", padding: "0 20px", gap: 0, flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
        <div style={{ color: "#fff", fontWeight: 900, fontSize: 15, letterSpacing: "0.02em", marginRight: 32, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌿</span> GNR Farnham CRM
        </div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => { setPage(n.id); setSelectedEntity(null); }} style={{ background: page === n.id ? "rgba(255,255,255,0.15)" : "transparent", border: "none", borderBottom: page === n.id ? "2px solid #fff" : "2px solid transparent", color: "#fff", padding: "0 16px", height: 52, fontSize: 13, fontWeight: page === n.id ? 700 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.1s" }}>
            <span>{n.icon}</span> {n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Energir Développement inc. · DEM017996</div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
        {loading && <Spinner />}

        {!loading && page === "dashboard" && <Dashboard entities={entities} lieux={lieux} activites={activites} documents={documents} primes={primes} onNavigate={p => setPage(p)} />}

        {!loading && page === "entities" && !selectedEntity && (
          <div>
            <PageHeader
              title="Entités"
              sub={`${filteredEntities.length} entité(s) · entreprises et individus`}
              actions={<Btn onClick={() => { setEditingEntity(null); setShowEntityForm(true); }} icon="＋">Nouvelle entité</Btn>}
            />
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textDim, fontSize: 14 }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, courriel, ville..."
                  style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "8px 12px 8px 34px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 4, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: 3 }}>
                {["Tous", "Entreprise", "Individu"].map(t => (
                  <button key={t} onClick={() => setFilterType(t)} style={{ background: filterType === t ? T.accent : "transparent", color: filterType === t ? "#fff" : T.textMuted, border: "none", borderRadius: 3, padding: "4px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t}</button>
                ))}
              </div>
            </div>
            {/* Table view */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f3f2f2" }}>
                    {["Nom", "Type", "Ville", "Téléphone", "Courriel", "Sites", "Tonnage matière", ""].map(h => (
                      <th key={h} style={{ padding: "10px 14px", color: T.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEntities.map((e, i) => {
                    const eL = lieux.filter(l => l.entity_id === e.id);
                    const totMat = eL.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
                    return (
                      <tr key={e.id} style={{ background: i % 2 === 0 ? T.surface : "#fafaf9", cursor: "pointer" }}
                        onMouseEnter={ev => ev.currentTarget.style.background = T.accentBg}
                        onMouseLeave={ev => ev.currentTarget.style.background = i % 2 === 0 ? T.surface : "#fafaf9"}
                        onClick={() => setSelectedEntity(e)}>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ color: T.accent, fontWeight: 600, fontSize: 13 }}>{displayName(e)}</span>
                          {e.type === "Individu" && e.company_name && <div style={{ color: T.textMuted, fontSize: 11 }}>{e.company_name}</div>}
                        </td>
                        <td style={{ padding: "11px 14px" }}><Badge label={e.type} color={typeColor(e.type)} /></td>
                        <td style={{ padding: "11px 14px", color: T.text, fontSize: 13 }}>{[e.adresse_ville, e.adresse_province].filter(Boolean).join(", ") || "—"}</td>
                        <td style={{ padding: "11px 14px", color: T.text, fontSize: 13 }}>{e.telephone1 || "—"}</td>
                        <td style={{ padding: "11px 14px", color: T.text, fontSize: 13 }}>{e.courriel || "—"}</td>
                        <td style={{ padding: "11px 14px", color: T.text, fontSize: 13, textAlign: "center" }}>{eL.length}</td>
                        <td style={{ padding: "11px 14px", color: totMat > 0 ? T.success : T.textDim, fontSize: 13, fontWeight: totMat > 0 ? 700 : 400 }}>{totMat > 0 ? `${totMat.toLocaleString()} t` : "—"}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <Btn variant="ghost" small onClick={ev => { ev.stopPropagation(); setEditingEntity(e); setShowEntityForm(true); }}>✏️</Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredEntities.length === 0 && <EmptyState icon="🏢" message="Aucune entité trouvée." />}
            </div>
          </div>
        )}

        {!loading && page === "entities" && selectedEntity && (
          <EntityDetail
            entity={entities.find(e => e.id === selectedEntity.id) || selectedEntity}
            entities={entities} lieux={lieux} activites={activites} relations={relations} documents={documents} primes={primes}
            onEditEntity={e => { setEditingEntity(e); setShowEntityForm(true); }}
            onDeleteEntity={id => { deleteEntity(id); setSelectedEntity(null); }}
            onSaveLieu={saveLieu} onDeleteLieu={deleteLieu}
            onSaveActivite={saveActivite} onDeleteActivite={deleteActivite}
            onSaveRelation={saveRelation} onDeleteRelation={deleteRelation}
            onSaveDocument={saveDocument} onDeleteDocument={deleteDocument}
            onSavePrime={savePrime} onDeletePrime={deletePrime}
            onClose={() => setSelectedEntity(null)}
          />
        )}

        {!loading && page === "activites" && (
          <div>
            <PageHeader title="Toutes les activités" sub={`${activites.length} activité(s) au total`} />
            {["Planifiée", "Actif", "Terminé", "Annulé"].map(statut => {
              const group = [...activites.filter(a => a.statut === statut)].sort((a, b) => b.date.localeCompare(a.date));
              if (group.length === 0) return null;
              return (
                <div key={statut} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Badge label={statut} color={statutColor(statut)} />
                    <span style={{ color: T.textMuted, fontSize: 12 }}>{group.length} activité(s)</span>
                  </div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    {group.map(a => {
                      const ent = entities.find(e => e.id === a.entity_id);
                      return (
                        <div key={a.id} style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", gap: 12 }}>
                            <div style={{ fontSize: 22 }}>{{ Courriel: "📧", Appel: "📞", Rencontre: "🤝", Tâche: "✅", Suivi: "🔔", Autre: "📝" }[a.type] || "📝"}</div>
                            <div>
                              <div style={{ color: T.text, fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{a.desc_courte}</div>
                              <div style={{ color: T.textMuted, fontSize: 12 }}>
                                {ent ? <span style={{ color: T.accent, fontWeight: 600, cursor: "pointer" }} onClick={() => { setSelectedEntity(ent); setPage("entities"); }}>{displayName(ent)}</span> : "—"}
                                {" · "}{a.date}{a.assigne_a ? ` · ${a.assigne_a}` : ""}
                              </div>
                              {a.description && <div style={{ color: T.textDim, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{a.description.slice(0, 120)}{a.description.length > 120 ? "..." : ""}</div>}
                            </div>
                          </div>
                          <Badge label={a.type} color="blue" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {activites.length === 0 && <EmptyState icon="📭" message="Aucune activité." />}
          </div>
        )}

        {!loading && page === "rapports" && (
          <div>
            <PageHeader title="Rapport de biomasse" sub="Synthèse par entité" />
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f3f2f2" }}>
                    {["Entité","Type","Ville","Sites","Biomasse","Cheptel","Matière (t)","Digestat (t)","Hectares","Phosphore (kg)","Activités","Docs"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", color: T.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entities.map((e, i) => {
                    const eL = lieux.filter(l => l.entity_id === e.id);
                    const tMat = eL.reduce((s, l) => s + (Number(l.tonnage_matiere)||0), 0);
                    const tDig = eL.reduce((s, l) => s + (Number(l.tonnage_digestat)||0), 0);
                    const tCheptel = eL.reduce((s, l) => s + (Number(l.taille_cheptel)||0), 0);
                    const tHect = eL.reduce((s, l) => s + (Number(l.hectares)||0), 0);
                    const tPhos = eL.reduce((s, l) => s + (Number(l.capacite_phosphore)||0), 0);
                    const bio = [...new Set(eL.flatMap(l => l.type_biomasse || []))].join(", ");
                    return (
                      <tr key={e.id} style={{ background: i%2===0 ? T.surface : "#fafaf9", cursor: "pointer" }}
                        onMouseEnter={ev => ev.currentTarget.style.background = T.accentBg}
                        onMouseLeave={ev => ev.currentTarget.style.background = i%2===0 ? T.surface : "#fafaf9"}
                        onClick={() => { setSelectedEntity(e); setPage("entities"); }}>
                        <td style={{ padding: "10px 14px", color: T.accent, fontWeight: 600 }}>{displayName(e)}</td>
                        <td style={{ padding: "10px 14px" }}><Badge label={e.type} color={typeColor(e.type)} /></td>
                        <td style={{ padding: "10px 14px", color: T.text }}>{e.adresse_ville || "—"}</td>
                        <td style={{ padding: "10px 14px", color: T.text, textAlign: "center" }}>{eL.length}</td>
                        <td style={{ padding: "10px 14px", color: T.text }}>{bio || "—"}</td>
                        <td style={{ padding: "10px 14px", color: T.text, textAlign: "right" }}>{tCheptel ? tCheptel.toLocaleString() : "—"}</td>
                        <td style={{ padding: "10px 14px", color: T.success, fontWeight: 700, textAlign: "right" }}>{tMat ? tMat.toLocaleString() : "—"}</td>
                        <td style={{ padding: "10px 14px", color: T.accent, textAlign: "right" }}>{tDig ? tDig.toLocaleString() : "—"}</td>
                        <td style={{ padding: "10px 14px", color: T.text, textAlign: "right" }}>{tHect || "—"}</td>
                        <td style={{ padding: "10px 14px", color: T.text, textAlign: "right" }}>{tPhos ? tPhos.toLocaleString() : "—"}</td>
                        <td style={{ padding: "10px 14px", color: T.text, textAlign: "center" }}>{activites.filter(a=>a.entity_id===e.id).length}</td>
                        <td style={{ padding: "10px 14px", color: T.text, textAlign: "center" }}>{documents.filter(d=>d.entity_id===e.id).length}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#eaf5ea", borderTop: `2px solid ${T.success}` }}>
                    <td colSpan={6} style={{ padding: "10px 14px", color: T.success, fontWeight: 700, fontSize: 13 }}>TOTAUX</td>
                    <td style={{ padding: "10px 14px", color: T.success, fontWeight: 900, fontSize: 14, textAlign: "right" }}>{lieux.reduce((s,l)=>s+(Number(l.tonnage_matiere)||0),0).toLocaleString()} t</td>
                    <td style={{ padding: "10px 14px", color: T.accent, fontWeight: 900, fontSize: 14, textAlign: "right" }}>{lieux.reduce((s,l)=>s+(Number(l.tonnage_digestat)||0),0).toLocaleString()} t</td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {showEntityForm && (
        <Modal title={editingEntity ? "Modifier l'entité" : "Nouvelle entité"} onClose={() => { setShowEntityForm(false); setEditingEntity(null); }} wide>
          <EntityForm initial={editingEntity} onSave={saveEntity} onClose={() => { setShowEntityForm(false); setEditingEntity(null); }} />
        </Modal>
      )}
    </div>
  );
}
