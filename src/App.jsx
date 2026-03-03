import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const THEME = {
  bg: "#0f1a12", surface: "#162019", card: "#1c2b1f", border: "#2a3d2e",
  accent: "#4caf50", accentDark: "#2e7d32", accentLight: "#81c784",
  text: "#e8f5e9", textMuted: "#7a9c7e", textDim: "#4a6e4e",
  danger: "#ef5350", warning: "#ffa726", info: "#42a5f5", gold: "#ffd54f",
};

function uid() { return Math.random().toString(36).slice(2, 10); }
function today() { return new Date().toISOString().slice(0, 10); }
function displayName(e) {
  if (!e) return "—";
  return e.type === "Entreprise" ? (e.company_name || "Sans nom") : `${e.prenom || ""} ${e.nom || ""}`.trim() || "Sans nom";
}

function Badge({ label, color }) {
  const colors = {
    green: { bg: "#1b3a1e", text: "#81c784", border: "#2e7d32" },
    blue: { bg: "#0d2137", text: "#64b5f6", border: "#1565c0" },
    orange: { bg: "#2e1a00", text: "#ffa726", border: "#e65100" },
    gray: { bg: "#1a2020", text: "#90a4ae", border: "#37474f" },
    gold: { bg: "#2a1f00", text: "#ffd54f", border: "#f57f17" },
  };
  const c = colors[color] || colors.gray;
  return <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>;
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "18px 22px", borderLeft: `3px solid ${color || THEME.accent}` }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ color: THEME.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ color: THEME.text, fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ color: THEME.textDim, fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", color: THEME.textMuted, fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}{required && <span style={{ color: THEME.danger }}> *</span>}</label>}
      <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "8px 12px", color: THEME.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", color: THEME.textMuted, fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}{required && <span style={{ color: THEME.danger }}> *</span>}</label>}
      <select value={value ?? ""} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "8px 12px", color: THEME.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3 }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", color: THEME.textMuted, fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
      <textarea value={value ?? ""} onChange={e => onChange(e.target.value)} rows={rows}
        style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "8px 12px", color: THEME.text, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", small, disabled, style: s = {} }) {
  const styles = {
    primary: { background: THEME.accent, color: "#fff", border: "none" },
    secondary: { background: THEME.surface, color: THEME.text, border: `1px solid ${THEME.border}` },
    danger: { background: THEME.danger, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: THEME.accentLight, border: `1px solid ${THEME.accentDark}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], borderRadius: 6, padding: small ? "5px 12px" : "8px 18px", fontSize: small ? 12 : 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, letterSpacing: "0.02em", ...s }}>{children}</button>;
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 14, padding: 28, width: wide ? 780 : 560, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ color: THEME.text, margin: 0, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: THEME.textMuted, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ color: THEME.accentLight, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 18, marginBottom: 8, borderBottom: `1px solid ${THEME.border}`, paddingBottom: 6 }}>{children}</div>;
}

function Spinner() {
  return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
    <div style={{ width: 36, height: 36, border: `3px solid ${THEME.border}`, borderTop: `3px solid ${THEME.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>;
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
    if (!isEnt && !f.consentement) return alert("Consentement requis");
    setSaving(true);
    const row = { ...f, id: initial?.id || uid(), created_at: initial?.created_at || today(), deleted_at: null };
    const { error } = initial
      ? await supabase.from("entities").update(row).eq("id", row.id)
      : await supabase.from("entities").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label="Type *" value={f.type} onChange={set("type")} options={["Entreprise", "Individu"]} required />
        {!isEnt && <><Input label="Prénom *" value={f.prenom} onChange={set("prenom")} required /><Input label="Nom *" value={f.nom} onChange={set("nom")} required /></>}
        <Input label={isEnt ? "Nom d'entreprise *" : "Nom d'entreprise (facultatif)"} value={f.company_name} onChange={set("company_name")} />
        <Input label="No d'entreprise (NEQ)" value={f.company_number} onChange={set("company_number")} />
        {isEnt && <><Input label="No TPS (123456789 RT0001)" value={f.no_tps} onChange={set("no_tps")} /><Input label="No TVQ (1234567890TQ0001)" value={f.no_tvq} onChange={set("no_tvq")} /></>}
        <Select label="Transporteur attitré" value={f.transporteur} onChange={set("transporteur")} options={[{ value: "", label: "— Sélectionner —" }, "EDI", "Autre"]} />
      </div>
      <SectionTitle>Adresse postale</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <Input label="No porte" value={f.adresse_no} onChange={set("adresse_no")} />
        <Input label="Rue" value={f.adresse_rue} onChange={set("adresse_rue")} />
        <Input label="Ville" value={f.adresse_ville} onChange={set("adresse_ville")} />
        <Select label="Province" value={f.adresse_province} onChange={set("adresse_province")} options={["QC","ON","NB","NS","PE","NL","MB","SK","AB","BC"]} />
        <Input label="Code postal" value={f.adresse_code_postal} onChange={set("adresse_code_postal")} placeholder="J1A 2B3" />
      </div>
      <SectionTitle>Coordonnées</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Tél. 1" value={f.telephone1} onChange={set("telephone1")} placeholder="(450) 555-0101" />
        <Input label="Description tél. 1" value={f.telephone1_desc} onChange={set("telephone1_desc")} placeholder="Bureau, Cellulaire..." />
        <Input label="Tél. 2" value={f.telephone2} onChange={set("telephone2")} />
        <Input label="Description tél. 2" value={f.telephone2_desc} onChange={set("telephone2_desc")} />
        <Input label="Courriel" value={f.courriel} onChange={set("courriel")} type="email" />
        <Input label="Site web" value={f.site_web} onChange={set("site_web")} />
      </div>
      {!isEnt && <Select label="Consentement *" value={f.consentement} onChange={set("consentement")} required options={[{ value: "", label: "— Sélectionner —" }, "Non obtenu", "Explicite", "Refus"]} />}
      <Textarea label="Notes" value={f.notes} onChange={set("notes")} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "💾 Enregistrer"}</Btn>
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
    const { error } = initial
      ? await supabase.from("lieux").update(row).eq("id", row.id)
      : await supabase.from("lieux").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <Select label="Type de lieu *" value={f.type_lieu} onChange={set("type_lieu")} options={["Collecte", "Dépôt", "Collecte et dépôt"]} />
      <SectionTitle>Adresse du lieu</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <Input label="No porte" value={f.adresse_no} onChange={set("adresse_no")} />
        <Input label="Rue" value={f.adresse_rue} onChange={set("adresse_rue")} />
        <Input label="Ville" value={f.adresse_ville} onChange={set("adresse_ville")} />
        <Select label="Province" value={f.adresse_province} onChange={set("adresse_province")} options={["QC","ON","NB","NS","PE","NL","MB","SK","AB","BC"]} />
        <Input label="Code postal" value={f.adresse_code_postal} onChange={set("adresse_code_postal")} />
        <Input label="URL Google Maps" value={f.adresse_url} onChange={set("adresse_url")} placeholder="https://maps.app.goo.gl/..." />
        <Input label="Latitude / Longitude" value={f.lat_long} onChange={set("lat_long")} placeholder="45°20'15&quot;N 72°58'42&quot;W" />
      </div>
      <Textarea label="Description du lieu" value={f.description} onChange={set("description")} rows={2} />
      <SectionTitle>Plan de déplacement</SectionTitle>
      <Select label="Plan de déplacement *" value={f.plan_deplacement} onChange={set("plan_deplacement")} options={["Non", "Oui", "À venir"]} />
      {f.plan_deplacement === "Oui" && <Textarea label="Description du plan" value={f.plan_desc} onChange={set("plan_desc")} rows={2} />}
      <SectionTitle>Données agricoles</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Tonnage annuel matière (t)" value={f.tonnage_matiere} onChange={set("tonnage_matiere")} type="number" />
        <Input label="Tonnage annuel digestat (t)" value={f.tonnage_digestat} onChange={set("tonnage_digestat")} type="number" />
        <div>
          <label style={{ display: "block", color: THEME.textMuted, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Type de biomasse</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Porc", "Bœuf", "Volaille", "Autre"].map(v => (
              <label key={v} style={{ display: "flex", alignItems: "center", gap: 5, color: THEME.text, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={(f.type_biomasse || []).includes(v)} onChange={() => toggleBio(v)} /> {v}
              </label>
            ))}
          </div>
          {(f.type_biomasse || []).includes("Autre") && <Input label="Préciser" value={f.type_biomass_autre} onChange={set("type_biomass_autre")} />}
        </div>
        <Select label="Type de déjection" value={f.type_deject_masse} onChange={set("type_deject_masse")} options={["Solide", "Liquide", "Solide + liquide"]} />
        <Input label="Type de litière" value={f.type_litiere} onChange={set("type_litiere")} placeholder="Paille, Rip..." />
        <Input label="Taille du cheptel (têtes)" value={f.taille_cheptel} onChange={set("taille_cheptel")} type="number" />
        <Input label="Fréquence collecte (heures)" value={f.freq_collecte} onChange={set("freq_collecte")} type="number" />
        <Input label="Volume utile pré-fosse (m³)" value={f.volume_pre_fosse} onChange={set("volume_pre_fosse")} type="number" />
        <Input label="Hectares en culture" value={f.hectares} onChange={set("hectares")} type="number" />
        <Input label="Capacité phosphore (kg)" value={f.capacite_phosphore} onChange={set("capacite_phosphore")} type="number" />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "💾 Enregistrer"}</Btn>
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
    const { error } = initial
      ? await supabase.from("activites").update(row).eq("id", row.id)
      : await supabase.from("activites").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Date *" value={f.date} onChange={set("date")} type="date" />
        <Input label="Date de suivi" value={f.date_suivi} onChange={set("date_suivi")} type="date" />
        <Select label="Statut" value={f.statut} onChange={set("statut")} options={["Actif", "Planifiée", "Terminé", "Annulé"]} />
        <Select label="Type" value={f.type} onChange={set("type")} options={["Courriel", "Appel", "Rencontre", "Tâche", "Suivi", "Autre"]} />
        <Input label="Assigné à" value={f.assigne_a} onChange={set("assigne_a")} placeholder="Nom de l'utilisateur" />
        <Input label="Réalisé par" value={f.realise_p} onChange={set("realise_p")} placeholder="Nom de l'utilisateur" />
      </div>
      <Input label="Description courte *" value={f.desc_courte} onChange={set("desc_courte")} />
      <Textarea label="Description détaillée" value={f.description} onChange={set("description")} rows={4} />
      <Input label="URL" value={f.url} onChange={set("url")} type="url" />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "💾 Enregistrer"}</Btn>
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
    const { error } = initial
      ? await supabase.from("relations").update(row).eq("id", row.id)
      : await supabase.from("relations").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  const others = entities.filter(e => e.id !== entityId);
  return (
    <div>
      <Select label="Entité liée *" value={f.entity_b_id} onChange={set("entity_b_id")} options={[{ value: "", label: "— Sélectionner —" }, ...others.map(e => ({ value: e.id, label: displayName(e) }))]} />
      <Select label="Type de relation" value={f.type_relation} onChange={set("type_relation")} options={["Contact urgence", "Signataire autorisé", "Contact contractuel", "Contact quotidien", "Contact alternatif (vacances)", "Firme d'agronome", "Agronome", "Autre"]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Date de début" value={f.date_debut} onChange={set("date_debut")} type="date" />
        <Input label="Date de fin" value={f.date_fin} onChange={set("date_fin")} type="date" />
      </div>
      <Textarea label="Raison de fin" value={f.raison_fin} onChange={set("raison_fin")} rows={2} />
      <Textarea label="Description" value={f.description} onChange={set("description")} rows={3} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "💾 Enregistrer"}</Btn>
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
    const { error } = initial
      ? await supabase.from("documents").update(row).eq("id", row.id)
      : await supabase.from("documents").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <Select label="Type de document" value={f.type_doc} onChange={set("type_doc")} options={["Contrat", "Avenant", "Lettre d'intention", "Plan de déplacement", "Autre"]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Date sauvegarde" value={f.date_sauvegarde} onChange={set("date_sauvegarde")} type="date" />
        <Input label="Échéance" value={f.echeance} onChange={set("echeance")} type="date" />
        <Input label="Nom du fichier" value={f.file_name} onChange={set("file_name")} placeholder="document.pdf" />
        <div style={{ display: "flex", alignItems: "center", paddingTop: 22 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, color: THEME.text, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={f.actif} onChange={e => set("actif")(e.target.checked)} /> Document actif
          </label>
        </div>
      </div>
      <Textarea label="Description" value={f.description} onChange={set("description")} rows={3} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "💾 Enregistrer"}</Btn>
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
    const { error } = initial
      ? await supabase.from("primes").update(row).eq("id", row.id)
      : await supabase.from("primes").insert(row);
    setSaving(false);
    if (error) return alert("Erreur: " + error.message);
    onSave(row);
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Date" value={f.date} onChange={set("date")} type="date" />
        <Input label="Montant ($)" value={f.montant} onChange={set("montant")} type="number" />
      </div>
      <Textarea label="Description" value={f.description} onChange={set("description")} rows={3} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "💾 Enregistrer"}</Btn>
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
  const eActivites = activites.filter(a => a.entity_id === entity.id);
  const eRelations = relations.filter(r => r.entity_a_id === entity.id || r.entity_b_id === entity.id);
  const eDocs = documents.filter(d => d.entity_id === entity.id);
  const ePrimes = primes.filter(p => p.entity_id === entity.id);
  const totMat = eLieux.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
  const totDig = eLieux.reduce((s, l) => s + (Number(l.tonnage_digestat) || 0), 0);
  const totalPrimes = ePrimes.reduce((s, p) => s + (Number(p.montant) || 0), 0);

  const ir = (label, value) => (
    <div style={{ display: "flex", borderBottom: `1px solid ${THEME.border}`, padding: "6px 0" }}>
      <span style={{ color: THEME.textMuted, fontSize: 12, width: 200, flexShrink: 0 }}>{label}</span>
      <span style={{ color: THEME.text, fontSize: 13 }}>{value || "—"}</span>
    </div>
  );

  const handleDelete = async () => {
    if (!confirm("Supprimer cette entité ?")) return;
    await supabase.from("entities").delete().eq("id", entity.id);
    onDeleteEntity(entity.id);
    onClose();
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: THEME.textMuted, fontSize: 22, cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ color: THEME.text, margin: 0, fontSize: 22 }}>{displayName(entity)}</h2>
            <Badge label={entity.type} color={typeColor(entity.type)} />
          </div>
          <div style={{ color: THEME.textMuted, fontSize: 12, marginTop: 4 }}>Créé le {entity.created_at} · {eLieux.length} lieu(x) · {eActivites.length} activité(s)</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" small onClick={() => onEditEntity(entity)}>✏️ Modifier</Btn>
          <Btn variant="danger" small onClick={handleDelete}>🗑️ Supprimer</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard icon="🌿" label="Tonnage matière" value={`${totMat.toLocaleString()} t`} color={THEME.accent} />
        <StatCard icon="♻️" label="Tonnage digestat" value={`${totDig.toLocaleString()} t`} color={THEME.info} />
        <StatCard icon="📍" label="Sites" value={eLieux.length} color={THEME.warning} />
        <StatCard icon="💰" label="Primes totales" value={totalPrimes.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })} color={THEME.gold} />
      </div>

      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 18, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: THEME.accentLight, marginBottom: 10, fontSize: 13 }}>📋 INFORMATIONS GÉNÉRALES</div>
        {entity.type === "Individu" && ir("Prénom / Nom", `${entity.prenom || ""} ${entity.nom || ""}`)}
        {entity.company_name && ir("Nom d'entreprise", entity.company_name)}
        {entity.company_number && ir("No d'entreprise", entity.company_number)}
        {entity.no_tps && ir("No TPS", entity.no_tps)}
        {entity.no_tvq && ir("No TVQ", entity.no_tvq)}
        {entity.transporteur && ir("Transporteur attitré", entity.transporteur)}
        {ir("Adresse", [entity.adresse_no, entity.adresse_rue, entity.adresse_ville, entity.adresse_province, entity.adresse_code_postal].filter(Boolean).join(" "))}
        {entity.telephone1 && ir(`Tél. (${entity.telephone1_desc || "principal"})`, entity.telephone1)}
        {entity.courriel && ir("Courriel", entity.courriel)}
        {entity.site_web && ir("Site web", entity.site_web)}
        {entity.type === "Individu" && ir("Consentement", entity.consentement)}
        {entity.notes && ir("Notes", entity.notes)}
      </div>

      {/* LIEUX */}
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: THEME.accentLight, fontSize: 13 }}>📍 LIEUX DE RETRAIT / DÉPÔT</div>
          <Btn small onClick={() => setModal({ type: "lieu" })}>+ Ajouter</Btn>
        </div>
        {eLieux.length === 0 && <div style={{ color: THEME.textDim, fontSize: 13 }}>Aucun lieu.</div>}
        {eLieux.map(l => (
          <div key={l.id} style={{ border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <Badge label={l.type_lieu} color="green" />
                  <Badge label={`Plan: ${l.plan_deplacement}`} color={l.plan_deplacement === "Oui" ? "green" : l.plan_deplacement === "À venir" ? "orange" : "gray"} />
                </div>
                <div style={{ color: THEME.text, fontSize: 13 }}>{[l.adresse_no, l.adresse_rue, l.adresse_ville, l.adresse_province].filter(Boolean).join(" ")}</div>
                {l.description && <div style={{ color: THEME.textMuted, fontSize: 12, marginTop: 3 }}>{l.description}</div>}
                {l.lat_long && <div style={{ color: THEME.textDim, fontSize: 11, marginTop: 2 }}>📌 {l.lat_long}</div>}
                <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
                  {l.tonnage_matiere && <span style={{ color: THEME.textMuted, fontSize: 12 }}>🌿 Matière: <b style={{ color: THEME.text }}>{l.tonnage_matiere} t</b></span>}
                  {l.tonnage_digestat && <span style={{ color: THEME.textMuted, fontSize: 12 }}>♻️ Digestat: <b style={{ color: THEME.text }}>{l.tonnage_digestat} t</b></span>}
                  {l.type_biomasse?.length > 0 && <span style={{ color: THEME.textMuted, fontSize: 12 }}>🐄 {l.type_biomasse.join(", ")}</span>}
                  {l.taille_cheptel && <span style={{ color: THEME.textMuted, fontSize: 12 }}>🐖 {Number(l.taille_cheptel).toLocaleString()} têtes</span>}
                  {l.hectares && <span style={{ color: THEME.textMuted, fontSize: 12 }}>🌾 {l.hectares} ha</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn variant="ghost" small onClick={() => setModal({ type: "lieu", item: l })}>✏️</Btn>
                <Btn variant="danger" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("lieux").delete().eq("id", l.id); onDeleteLieu(l.id); }}>🗑️</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVITÉS */}
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: THEME.accentLight, fontSize: 13 }}>📅 ACTIVITÉS</div>
          <Btn small onClick={() => setModal({ type: "activite" })}>+ Ajouter</Btn>
        </div>
        {eActivites.length === 0 && <div style={{ color: THEME.textDim, fontSize: 13 }}>Aucune activité.</div>}
        {[...eActivites].sort((a, b) => b.date.localeCompare(a.date)).map(a => (
          <div key={a.id} style={{ border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <Badge label={a.statut} color={statutColor(a.statut)} />
                <Badge label={a.type} color="blue" />
                <span style={{ color: THEME.textMuted, fontSize: 11 }}>{a.date}</span>
              </div>
              <div style={{ color: THEME.text, fontSize: 13 }}>{a.desc_courte}</div>
              {a.assigne_a && <div style={{ color: THEME.textDim, fontSize: 11, marginTop: 3 }}>Assigné: {a.assigne_a}</div>}
              {a.date_suivi && <div style={{ color: THEME.warning, fontSize: 11 }}>⏰ Suivi: {a.date_suivi}</div>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn variant="ghost" small onClick={() => setModal({ type: "activite", item: a })}>✏️</Btn>
              <Btn variant="danger" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("activites").delete().eq("id", a.id); onDeleteActivite(a.id); }}>🗑️</Btn>
            </div>
          </div>
        ))}
      </div>

      {/* RELATIONS */}
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: THEME.accentLight, fontSize: 13 }}>🤝 RELATIONS</div>
          <Btn small onClick={() => setModal({ type: "relation" })}>+ Ajouter</Btn>
        </div>
        {eRelations.length === 0 && <div style={{ color: THEME.textDim, fontSize: 13 }}>Aucune relation.</div>}
        {eRelations.map(r => {
          const otherId = r.entity_a_id === entity.id ? r.entity_b_id : r.entity_a_id;
          const other = entities.find(e => e.id === otherId);
          return (
            <div key={r.id} style={{ border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: THEME.text, fontSize: 13, fontWeight: 700 }}>{displayName(other)}</div>
                <Badge label={r.type_relation} color="gold" />
                {r.description && <div style={{ color: THEME.textMuted, fontSize: 12, marginTop: 4 }}>{r.description}</div>}
                <div style={{ color: THEME.textDim, fontSize: 11, marginTop: 3 }}>Depuis: {r.date_debut}{r.date_fin ? ` → ${r.date_fin}` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn variant="ghost" small onClick={() => setModal({ type: "relation", item: r })}>✏️</Btn>
                <Btn variant="danger" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("relations").delete().eq("id", r.id); onDeleteRelation(r.id); }}>🗑️</Btn>
              </div>
            </div>
          );
        })}
      </div>

      {/* DOCUMENTS */}
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: THEME.accentLight, fontSize: 13 }}>📄 DOCUMENTS</div>
          <Btn small onClick={() => setModal({ type: "document" })}>+ Ajouter</Btn>
        </div>
        {eDocs.length === 0 && <div style={{ color: THEME.textDim, fontSize: 13 }}>Aucun document.</div>}
        {eDocs.map(d => (
          <div key={d.id} style={{ border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <Badge label={d.type_doc} color="blue" />
                {d.actif ? <Badge label="Actif" color="green" /> : <Badge label="Inactif" color="gray" />}
              </div>
              <div style={{ color: THEME.text, fontSize: 13 }}>{d.file_name || "Fichier non défini"}</div>
              {d.echeance && <div style={{ color: THEME.warning, fontSize: 11, marginTop: 3 }}>Échéance: {d.echeance}</div>}
              {d.description && <div style={{ color: THEME.textMuted, fontSize: 12, marginTop: 3 }}>{d.description}</div>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn variant="ghost" small onClick={() => setModal({ type: "document", item: d })}>✏️</Btn>
              <Btn variant="danger" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("documents").delete().eq("id", d.id); onDeleteDocument(d.id); }}>🗑️</Btn>
            </div>
          </div>
        ))}
      </div>

      {/* PRIMES */}
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: THEME.accentLight, fontSize: 13 }}>💰 PRIMES</div>
          <Btn small onClick={() => setModal({ type: "prime" })}>+ Ajouter</Btn>
        </div>
        {ePrimes.length === 0 && <div style={{ color: THEME.textDim, fontSize: 13 }}>Aucune prime.</div>}
        {ePrimes.map(p => (
          <div key={p.id} style={{ border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ color: THEME.gold, fontWeight: 800, fontSize: 16 }}>{Number(p.montant).toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</span>
              <span style={{ color: THEME.textMuted, fontSize: 12, marginLeft: 12 }}>{p.date}</span>
              {p.description && <div style={{ color: THEME.textMuted, fontSize: 12, marginTop: 3 }}>{p.description}</div>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn variant="ghost" small onClick={() => setModal({ type: "prime", item: p })}>✏️</Btn>
              <Btn variant="danger" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("primes").delete().eq("id", p.id); onDeletePrime(p.id); }}>🗑️</Btn>
            </div>
          </div>
        ))}
        {ePrimes.length > 0 && <div style={{ textAlign: "right", color: THEME.gold, fontWeight: 700, fontSize: 14, marginTop: 8 }}>Total: {totalPrimes.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</div>}
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
function Dashboard({ entities, lieux, activites, documents, primes }) {
  const active = entities.filter(e => !e.deleted_at);
  const totalMat = lieux.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
  const totalDig = lieux.reduce((s, l) => s + (Number(l.tonnage_digestat) || 0), 0);
  const totalPrimes = primes.reduce((s, p) => s + (Number(p.montant) || 0), 0);
  const docsEcheant = documents.filter(d => d.echeance && d.echeance <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) && d.actif);
  const bioCount = {};
  lieux.forEach(l => (l.type_biomasse || []).forEach(b => { bioCount[b] = (bioCount[b] || 0) + 1; }));
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: THEME.text, margin: "0 0 4px 0", fontSize: 24, fontWeight: 900 }}>Tableau de bord</h2>
        <div style={{ color: THEME.textMuted, fontSize: 13 }}>Projet GNR Farnham – Energir Développement inc.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard icon="🏢" label="Entités actives" value={active.length} sub={`${active.filter(e => e.type === "Entreprise").length} entreprises · ${active.filter(e => e.type === "Individu").length} individus`} color={THEME.accent} />
        <StatCard icon="📍" label="Sites enregistrés" value={lieux.filter(l => !l.deleted_at).length} color={THEME.warning} />
        <StatCard icon="🌿" label="Tonnage matière (t/an)" value={totalMat.toLocaleString()} color={THEME.accentLight} />
        <StatCard icon="♻️" label="Tonnage digestat (t/an)" value={totalDig.toLocaleString()} color={THEME.info} />
        <StatCard icon="📅" label="Activités planifiées" value={activites.filter(a => a.statut === "Planifiée").length} color={THEME.warning} />
        <StatCard icon="⚡" label="Activités en cours" value={activites.filter(a => a.statut === "Actif").length} color={THEME.info} />
        <StatCard icon="💰" label="Primes totales" value={totalPrimes.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })} color={THEME.gold} />
        <StatCard icon={docsEcheant.length > 0 ? "⚠️" : "📄"} label="Docs échéant (30j)" value={docsEcheant.length} color={docsEcheant.length > 0 ? THEME.danger : THEME.textDim} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 700, color: THEME.accentLight, fontSize: 13, marginBottom: 14 }}>🐄 RÉPARTITION DE LA BIOMASSE</div>
          {Object.entries(bioCount).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: THEME.text, fontSize: 13 }}>{k}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 120, height: 8, background: THEME.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (v / Math.max(...Object.values(bioCount))) * 100)}%`, height: "100%", background: THEME.accent, borderRadius: 4 }} />
                </div>
                <span style={{ color: THEME.textMuted, fontSize: 12 }}>{v} site(s)</span>
              </div>
            </div>
          ))}
          {Object.keys(bioCount).length === 0 && <div style={{ color: THEME.textDim }}>Aucune donnée</div>}
        </div>
        <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 700, color: THEME.accentLight, fontSize: 13, marginBottom: 14 }}>📅 ACTIVITÉS RÉCENTES</div>
          {[...activites].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "6px 0", borderBottom: `1px solid ${THEME.border}` }}>
              <div>
                <div style={{ color: THEME.text, fontSize: 12 }}>{a.desc_courte}</div>
                <div style={{ color: THEME.textDim, fontSize: 11 }}>{a.date} · {a.type}</div>
              </div>
              <Badge label={a.statut} color={statutColor(a.statut)} />
            </div>
          ))}
          {activites.length === 0 && <div style={{ color: THEME.textDim, fontSize: 13 }}>Aucune activité</div>}
        </div>
        {docsEcheant.length > 0 && (
          <div style={{ background: THEME.card, border: `1px solid ${THEME.danger}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontWeight: 700, color: THEME.danger, fontSize: 13, marginBottom: 14 }}>⚠️ DOCUMENTS ÉCHÉANT DANS 30 JOURS</div>
            {docsEcheant.map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, padding: "4px 0", borderBottom: `1px solid ${THEME.border}` }}>
                <span style={{ color: THEME.text, fontSize: 13 }}>{d.file_name || d.type_doc}</span>
                <span style={{ color: THEME.danger, fontSize: 12 }}>Éch.: {d.echeance}</span>
              </div>
            ))}
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

  const NAV = [{ id: "dashboard", icon: "📊", label: "Tableau de bord" }, { id: "entities", icon: "🏢", label: "Entités" }, { id: "activites", icon: "📅", label: "Activités" }, { id: "rapports", icon: "📈", label: "Rapport" }];

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", display: "flex" }}>
      <div style={{ width: 220, background: THEME.surface, borderRight: `1px solid ${THEME.border}`, display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 20px 24px 20px" }}>
          <div style={{ color: THEME.accent, fontWeight: 900, fontSize: 16, letterSpacing: "0.05em" }}>🌿 GNR FARNHAM</div>
          <div style={{ color: THEME.textDim, fontSize: 10, marginTop: 2, letterSpacing: "0.08em" }}>SYSTÈME CRM · Energir</div>
        </div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => { setPage(n.id); setSelectedEntity(null); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", background: page === n.id ? `${THEME.accentDark}33` : "transparent", borderLeft: page === n.id ? `3px solid ${THEME.accent}` : "3px solid transparent", border: "none", borderRadius: 0, color: page === n.id ? THEME.accentLight : THEME.textMuted, fontSize: 13, fontWeight: page === n.id ? 700 : 400, cursor: "pointer", textAlign: "left", width: "100%" }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "16px 20px", color: THEME.textDim, fontSize: 10 }}>
          <div>Energir Développement inc.</div>
          <div>DEM017996 · 2026</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
        {loading && <Spinner />}
        {!loading && page === "dashboard" && <Dashboard entities={entities} lieux={lieux} activites={activites} documents={documents} primes={primes} />}
        {!loading && page === "entities" && !selectedEntity && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: THEME.text, margin: 0, fontSize: 22, fontWeight: 900 }}>Entités</h2>
                <div style={{ color: THEME.textMuted, fontSize: 13 }}>{filteredEntities.length} entité(s)</div>
              </div>
              <Btn onClick={() => { setEditingEntity(null); setShowEntityForm(true); }}>+ Nouvelle entité</Btn>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher par nom, courriel, ville..."
                style={{ flex: 1, background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "8px 14px", color: THEME.text, fontSize: 13, outline: "none" }} />
              {["Tous", "Entreprise", "Individu"].map(t => <Btn key={t} variant={filterType === t ? "primary" : "secondary"} small onClick={() => setFilterType(t)}>{t}</Btn>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {filteredEntities.map(e => {
                const eL = lieux.filter(l => l.entity_id === e.id);
                const eA = activites.filter(a => a.entity_id === e.id);
                const totMat = eL.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
                return (
                  <div key={e.id} onClick={() => setSelectedEntity(e)} style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 18, cursor: "pointer" }}
                    onMouseEnter={ev => ev.currentTarget.style.borderColor = THEME.accent}
                    onMouseLeave={ev => ev.currentTarget.style.borderColor = THEME.border}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ color: THEME.text, fontWeight: 700, fontSize: 15 }}>{displayName(e)}</div>
                        {e.type === "Individu" && e.company_name && <div style={{ color: THEME.textMuted, fontSize: 12 }}>{e.company_name}</div>}
                      </div>
                      <Badge label={e.type} color={typeColor(e.type)} />
                    </div>
                    <div style={{ color: THEME.textMuted, fontSize: 12, marginBottom: 6 }}>📍 {[e.adresse_ville, e.adresse_province].filter(Boolean).join(", ") || "—"}</div>
                    <div style={{ display: "flex", gap: 14 }}>
                      <span style={{ color: THEME.textDim, fontSize: 11 }}>📍 {eL.length} lieu(x)</span>
                      <span style={{ color: THEME.textDim, fontSize: 11 }}>📅 {eA.length} act.</span>
                      {totMat > 0 && <span style={{ color: THEME.accent, fontSize: 11, fontWeight: 700 }}>🌿 {totMat.toLocaleString()} t</span>}
                    </div>
                  </div>
                );
              })}
              {filteredEntities.length === 0 && <div style={{ color: THEME.textDim, fontSize: 14, gridColumn: "1/-1", textAlign: "center", padding: 40 }}>Aucune entité trouvée.</div>}
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
            <h2 style={{ color: THEME.text, margin: "0 0 20px 0", fontSize: 22, fontWeight: 900 }}>Toutes les activités</h2>
            {["Planifiée", "Actif", "Terminé", "Annulé"].map(statut => {
              const group = activites.filter(a => a.statut === statut);
              if (group.length === 0) return null;
              return (
                <div key={statut} style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Badge label={statut} color={statutColor(statut)} />
                    <span style={{ color: THEME.textMuted, fontSize: 12 }}>{group.length} activité(s)</span>
                  </div>
                  {group.map(a => {
                    const ent = entities.find(e => e.id === a.entity_id);
                    return (
                      <div key={a.id} style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 14, marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                              <Badge label={a.type} color="blue" />
                              <span style={{ color: THEME.text, fontWeight: 600, fontSize: 13 }}>{a.desc_courte}</span>
                            </div>
                            <div style={{ color: THEME.textMuted, fontSize: 12 }}>{ent ? displayName(ent) : "—"} · {a.date}{a.assigne_a ? ` · Assigné: ${a.assigne_a}` : ""}</div>
                            {a.date_suivi && <div style={{ color: THEME.warning, fontSize: 11, marginTop: 2 }}>⏰ Suivi: {a.date_suivi}</div>}
                          </div>
                          {ent && <Btn variant="ghost" small onClick={() => { setSelectedEntity(ent); setPage("entities"); }}>Voir entité →</Btn>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {activites.length === 0 && <div style={{ color: THEME.textDim, fontSize: 14, textAlign: "center", padding: 40 }}>Aucune activité.</div>}
          </div>
        )}
        {!loading && page === "rapports" && (
          <div>
            <h2 style={{ color: THEME.text, margin: "0 0 20px 0", fontSize: 22, fontWeight: 900 }}>Rapport de biomasse</h2>
            <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: THEME.surface }}>
                    {["Entité","Type","Ville","Sites","Biomasse","Cheptel","Matière (t)","Digestat (t)","Hectares","Phosphore (kg)","Activités","Docs"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", color: THEME.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", borderBottom: `1px solid ${THEME.border}`, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entities.map((e, i) => {
                    const eL = lieux.filter(l => l.entity_id === e.id);
                    const eA = activites.filter(a => a.entity_id === e.id);
                    const eD = documents.filter(d => d.entity_id === e.id);
                    const tMat = eL.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
                    const tDig = eL.reduce((s, l) => s + (Number(l.tonnage_digestat) || 0), 0);
                    const tCheptel = eL.reduce((s, l) => s + (Number(l.taille_cheptel) || 0), 0);
                    const tHect = eL.reduce((s, l) => s + (Number(l.hectares) || 0), 0);
                    const tPhos = eL.reduce((s, l) => s + (Number(l.capacite_phosphore) || 0), 0);
                    const bio = [...new Set(eL.flatMap(l => l.type_biomasse || []))].join(", ");
                    return (
                      <tr key={e.id} style={{ background: i % 2 === 0 ? THEME.card : THEME.surface, cursor: "pointer" }} onClick={() => { setSelectedEntity(e); setPage("entities"); }}>
                        <td style={{ padding: "9px 12px", color: THEME.text, fontWeight: 600 }}>{displayName(e)}</td>
                        <td style={{ padding: "9px 12px" }}><Badge label={e.type} color={typeColor(e.type)} /></td>
                        <td style={{ padding: "9px 12px", color: THEME.textMuted }}>{e.adresse_ville}</td>
                        <td style={{ padding: "9px 12px", color: THEME.text, textAlign: "center" }}>{eL.length}</td>
                        <td style={{ padding: "9px 12px", color: THEME.textMuted }}>{bio || "—"}</td>
                        <td style={{ padding: "9px 12px", color: THEME.text, textAlign: "right" }}>{tCheptel ? tCheptel.toLocaleString() : "—"}</td>
                        <td style={{ padding: "9px 12px", color: THEME.accent, fontWeight: 700, textAlign: "right" }}>{tMat ? tMat.toLocaleString() : "—"}</td>
                        <td style={{ padding: "9px 12px", color: THEME.info, textAlign: "right" }}>{tDig ? tDig.toLocaleString() : "—"}</td>
                        <td style={{ padding: "9px 12px", color: THEME.textMuted, textAlign: "right" }}>{tHect || "—"}</td>
                        <td style={{ padding: "9px 12px", color: THEME.textMuted, textAlign: "right" }}>{tPhos ? tPhos.toLocaleString() : "—"}</td>
                        <td style={{ padding: "9px 12px", color: THEME.textMuted, textAlign: "center" }}>{eA.length}</td>
                        <td style={{ padding: "9px 12px", color: THEME.textMuted, textAlign: "center" }}>{eD.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: `${THEME.accentDark}33`, borderTop: `2px solid ${THEME.accent}` }}>
                    <td colSpan={6} style={{ padding: "10px 12px", color: THEME.accentLight, fontWeight: 700 }}>TOTAUX</td>
                    <td style={{ padding: "10px 12px", color: THEME.accent, fontWeight: 900, textAlign: "right" }}>{lieux.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0).toLocaleString()} t</td>
                    <td style={{ padding: "10px 12px", color: THEME.info, fontWeight: 900, textAlign: "right" }}>{lieux.reduce((s, l) => s + (Number(l.tonnage_digestat) || 0), 0).toLocaleString()} t</td>
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
