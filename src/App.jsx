import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#f3f2f2", surface: "#ffffff", card: "#ffffff", border: "#dddbda", borderLight: "#e5e5e5",
  accent: "#0176d3", accentDark: "#014486", accentLight: "#1b96ff", accentBg: "#e8f4fd",
  text: "#181818", textMuted: "#514f4d", textDim: "#706e6b",
  success: "#2e844a", successBg: "#eaf5ea", warning: "#dd7a01", warningBg: "#fef0d0",
  danger: "#ba0517", dangerBg: "#fceeed", gold: "#dd7a01", headerBg: "#032d60",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }
function today() { return new Date().toISOString().slice(0, 10); }
function displayName(e) {
  if (!e) return "—";
  return e.type === "Entreprise" ? (e.company_name || "Sans nom") : `${e.prenom || ""} ${e.nom || ""}`.trim() || "Sans nom";
}
const ROLES = { admin: "Administrateur", editor: "Éditeur", read_only: "Lecture seule" };
const ROLE_COLOR = { admin: "red", editor: "blue", read_only: "gray" };
function canEdit(role) { return role === "admin" || role === "editor"; }
function canDelete(role) { return role === "admin"; }
function canManageUsers(role) { return role === "admin"; }

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false, isDesktop: true });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp({ isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
async function logAction(profile, action, entityType, entityId, entityLabel, details) {
  if (!profile) return;
  await supabase.from("audit_logs").insert({
    user_id: profile.id, user_name: profile.full_name || profile.email,
    action, entity_type: entityType || null, entity_id: entityId || null,
    entity_label: entityLabel || null, details: details || null,
  });
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
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
  return <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>;
}

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div onClick={onClick} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 20px", borderTop: `3px solid ${color || T.accent}`, boxShadow: "0 2px 4px rgba(0,0,0,0.06)", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
          <div style={{ color: T.text, fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ color: T.textDim, fontSize: 11, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 24, opacity: 0.4, flexShrink: 0 }}>{icon}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}{required && <span style={{ color: T.danger }}> *</span>}</label>}
      <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: disabled ? "#f3f2f2" : T.surface, border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 4, padding: "9px 12px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box", boxShadow: focused ? `0 0 0 3px ${T.accentBg}` : "none", transition: "all 0.15s", WebkitAppearance: "none" }} />
    </div>
  );
}

function Select({ label, value, onChange, options, required, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}{required && <span style={{ color: T.danger }}> *</span>}</label>}
      <select value={value ?? ""} onChange={e => onChange(e.target.value)} disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: disabled ? "#f3f2f2" : T.surface, border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 4, padding: "9px 12px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box", boxShadow: focused ? `0 0 0 3px ${T.accentBg}` : "none", WebkitAppearance: "none", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23706e6b' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</label>}
      <textarea value={value ?? ""} onChange={e => onChange(e.target.value)} rows={rows} disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: disabled ? "#f3f2f2" : T.surface, border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 4, padding: "9px 12px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", boxShadow: focused ? `0 0 0 3px ${T.accentBg}` : "none" }} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", small, disabled, icon, fullWidth }) {
  const styles = {
    primary: { background: T.accent, color: "#fff", border: `1px solid ${T.accentDark}` },
    secondary: { background: T.surface, color: T.accent, border: `1px solid ${T.accent}` },
    neutral: { background: T.surface, color: T.text, border: `1px solid ${T.border}` },
    danger: { background: T.danger, color: "#fff", border: `1px solid ${T.danger}` },
    ghost: { background: "transparent", color: T.accent, border: "none" },
    success: { background: T.success, color: "#fff", border: `1px solid ${T.success}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], borderRadius: 4, padding: small ? "6px 12px" : "9px 16px", fontSize: small ? 12 : 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: fullWidth ? "100%" : "auto", boxShadow: variant === "primary" ? "0 1px 2px rgba(0,0,0,0.15)" : "none", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
      {icon && <span>{icon}</span>}{children}
    </button>
  );
}

function Modal({ title, onClose, children, wide }) {
  const { isMobile } = useBreakpoint();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", zIndex: 1000 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.card, borderRadius: isMobile ? "16px 16px 0 0" : 8, width: isMobile ? "100%" : (wide ? 820 : 560), maxWidth: isMobile ? "100%" : "95vw", maxHeight: isMobile ? "92vh" : "92vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}`, background: "#f3f2f2", borderRadius: isMobile ? "16px 16px 0 0" : "8px 8px 0 0", position: "sticky", top: 0, zIndex: 1 }}>
          <h3 style={{ color: T.text, margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textDim, fontSize: 24, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: isMobile ? "16px" : 24 }}>{children}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ color: T.text, fontWeight: 700, fontSize: 13, marginTop: 20, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${T.borderLight}` }}>{children}</div>;
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}`, gap: 8 }}>
      <span style={{ color: T.textMuted, fontSize: 12, fontWeight: 600 }}>{label}</span>
      <span style={{ color: T.text, fontSize: 13, wordBreak: "break-word" }}>{value || "—"}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return <div style={{ textAlign: "center", padding: "32px 16px", color: T.textDim }}><div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div><div style={{ fontSize: 13 }}>{message}</div></div>;
}

function PageHeader({ title, sub, actions }) {
  const { isMobile } = useBreakpoint();
  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: isMobile ? "12px 16px" : "16px 24px", display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 0, marginBottom: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div>
        <h1 style={{ color: T.text, margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 700 }}>{title}</h1>
        {sub && <div style={{ color: T.textMuted, fontSize: 13, marginTop: 3 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}>{actions}</div>}
    </div>
  );
}

function RelatedList({ title, icon, count, onAdd, addLabel, children, empty, readOnly }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f3f2f2", borderBottom: collapsed ? "none" : `1px solid ${T.border}`, cursor: "pointer", WebkitTapHighlightColor: "transparent" }} onClick={() => setCollapsed(c => !c)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{title}</span>
          <span style={{ background: T.accent, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{count}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {onAdd && !collapsed && !readOnly && <Btn small variant="neutral" onClick={e => { e.stopPropagation(); onAdd(); }}>{addLabel || "+ Nouveau"}</Btn>}
          <span style={{ color: T.textDim, fontSize: 14 }}>{collapsed ? "▶" : "▼"}</span>
        </div>
      </div>
      {!collapsed && <div>{count === 0 ? <EmptyState icon="📭" message={empty || "Aucun élément"} /> : children}</div>}
    </div>
  );
}

function ActivityItem({ a, onEdit, onDelete, readOnly }) {
  const [expanded, setExpanded] = useState(false);
  const typeIcon = { Courriel: "📧", Appel: "📞", Rencontre: "🤝", Tâche: "✅", Suivi: "🔔", Autre: "📝" }[a.type] || "📝";
  const sColor = { "Terminé": "green", "Actif": "blue", "Planifiée": "orange", "Annulé": "gray" }[a.statut] || "gray";
  return (
    <div style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, marginTop: 2, flexShrink: 0 }}>{typeIcon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ color: T.text, fontWeight: 600, fontSize: 13 }}>{a.desc_courte}</span>
              <Badge label={a.statut} color={sColor} />
              <Badge label={a.type} color="blue" />
            </div>
            <div style={{ color: T.textMuted, fontSize: 12 }}>
              {a.date}{a.assigne_a ? ` · ${a.assigne_a}` : ""}
              {a.date_suivi ? <span style={{ color: T.warning, marginLeft: 8 }}>⏰ {a.date_suivi}</span> : ""}
            </div>
            {a.description && (
              <div style={{ marginTop: 6 }}>
                <button onClick={() => setExpanded(x => !x)} style={{ background: "none", border: "none", color: T.accent, fontSize: 12, cursor: "pointer", padding: 0, fontWeight: 600 }}>
                  {expanded ? "▲ Masquer" : "▼ Voir la note"}
                </button>
                {expanded && <div style={{ background: "#f8f8f8", border: `1px solid ${T.border}`, borderRadius: 4, padding: "10px 12px", marginTop: 6, fontSize: 13, color: T.text, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{a.description}</div>}
              </div>
            )}
          </div>
        </div>
        {!readOnly && (
          <div style={{ display: "flex", gap: 4, marginLeft: 8, flexShrink: 0 }}>
            <Btn variant="neutral" small onClick={() => onEdit(a)}>✏️</Btn>
            {onDelete && <Btn variant="neutral" small onClick={() => onDelete(a.id)}>🗑️</Btn>}
          </div>
        )}
      </div>
    </div>
  );
}

function statutColor(s) { return { "Terminé": "green", "Actif": "blue", "Planifiée": "orange", "Annulé": "gray" }[s] || "gray"; }
function typeColor(t) { return { "Entreprise": "blue", "Individu": "gold" }[t] || "gray"; }

// ─── AUDIT LOG PAGE ───────────────────────────────────────────────────────────
function AuditLogPage() {
  const { isMobile } = useBreakpoint();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, []);

  const actionIcon = { LOGIN: "🔐", LOGOUT: "🚪", CREATE: "➕", UPDATE: "✏️", DELETE: "🗑️" };
  const actionColor = { LOGIN: "green", LOGOUT: "gray", CREATE: "blue", UPDATE: "orange", DELETE: "red" };

  const filtered = logs.filter(l => {
    if (filterAction && !l.action.includes(filterAction)) return false;
    if (filterUser && !(l.user_name || "").toLowerCase().includes(filterUser.toLowerCase())) return false;
    return true;
  });

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const uniqueActions = [...new Set(logs.map(l => l.action))].sort();

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Journal d'audit" sub={`${filtered.length} entrée(s)`} />
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(0); }} placeholder="🔍 Filtrer par utilisateur..."
          style={{ flex: 1, minWidth: 160, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none" }} />
        <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(0); }}
          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none", minWidth: 160 }}>
          <option value="">Toutes les actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {isMobile ? (
        <div>
          {paged.map(l => (
            <div key={l.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>{actionIcon[l.action?.split("_")[0]] || "📋"}</span>
                  <Badge label={l.action} color={actionColor[l.action?.split("_")[0]] || "gray"} />
                </div>
                <span style={{ color: T.textDim, fontSize: 11 }}>{new Date(l.created_at).toLocaleString("fr-CA")}</span>
              </div>
              <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{l.user_name || "—"}</div>
              {l.entity_label && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 3 }}>{l.entity_type}: {l.entity_label}</div>}
              {l.details && <div style={{ color: T.textDim, fontSize: 12, marginTop: 3, fontStyle: "italic" }}>{l.details}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f3f2f2" }}>
                  {["Date / Heure", "Utilisateur", "Action", "Type", "Élément", "Détails"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", color: T.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((l, i) => (
                  <tr key={l.id} style={{ background: i % 2 === 0 ? T.surface : "#fafaf9" }}>
                    <td style={{ padding: "10px 14px", color: T.textDim, fontSize: 12, whiteSpace: "nowrap" }}>{new Date(l.created_at).toLocaleString("fr-CA")}</td>
                    <td style={{ padding: "10px 14px", color: T.text, fontWeight: 600 }}>{l.user_name || "—"}</td>
                    <td style={{ padding: "10px 14px" }}><Badge label={l.action} color={actionColor[l.action?.split("_")[0]] || "gray"} /></td>
                    <td style={{ padding: "10px 14px", color: T.textMuted }}>{l.entity_type || "—"}</td>
                    <td style={{ padding: "10px 14px", color: T.text }}>{l.entity_label || "—"}</td>
                    <td style={{ padding: "10px 14px", color: T.textDim, fontStyle: "italic" }}>{l.details || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <EmptyState icon="📋" message="Aucune entrée de journal." />}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <Btn variant="neutral" small disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Précédent</Btn>
          <span style={{ color: T.textMuted, fontSize: 13, padding: "6px 12px" }}>Page {page + 1} / {totalPages}</span>
          <Btn variant="neutral" small disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Suivant →</Btn>
        </div>
      )}
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = async () => {
    if (!email || !password) return setError("Veuillez entrer votre courriel et mot de passe.");
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Courriel ou mot de passe incorrect."); setLoading(false); }
  };
  return (
    <div style={{ minHeight: "100vh", background: T.headerBg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: T.surface, borderRadius: 10, padding: "36px 32px", width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🌿</div>
          <h1 style={{ color: T.text, fontSize: 22, fontWeight: 900, margin: "0 0 4px 0" }}>GNR Farnham CRM</h1>
          <div style={{ color: T.textMuted, fontSize: 13 }}>Energir Développement inc.</div>
        </div>
        {error && <div style={{ background: T.dangerBg, border: `1px solid ${T.danger}`, borderRadius: 4, padding: "10px 14px", color: T.danger, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <Input label="Courriel" value={email} onChange={setEmail} type="email" placeholder="vous@energir.com" required />
        <Input label="Mot de passe" value={password} onChange={v => { setPassword(v); }} type="password" placeholder="••••••••" required />
        <button onClick={login} disabled={loading}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width: "100%", background: T.accent, color: "#fff", border: "none", borderRadius: 4, padding: "12px 0", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <div style={{ color: T.textDim, fontSize: 12, textAlign: "center", marginTop: 20 }}>Accès restreint — contactez votre administrateur.</div>
      </div>
    </div>
  );
}

// ─── MY PROFILE ───────────────────────────────────────────────────────────────
function MyProfilePage({ profile, onUpdate }) {
  const { isMobile } = useBreakpoint();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const saveName = async () => {
    setSaving(true); setMsg("");
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id);
    setSaving(false);
    if (error) setMsg("Erreur: " + error.message);
    else { setMsg("Profil mis à jour."); onUpdate({ ...profile, full_name: fullName }); }
  };
  const changePassword = async () => {
    setPwMsg("");
    if (!pwNew || !pwConfirm) return setPwMsg("Veuillez remplir tous les champs.");
    if (pwNew !== pwConfirm) return setPwMsg("Les mots de passe ne correspondent pas.");
    if (pwNew.length < 6) return setPwMsg("Minimum 6 caractères.");
    const { error } = await supabase.auth.updateUser({ password: pwNew });
    if (error) setPwMsg("Erreur: " + error.message);
    else { setPwMsg("Mot de passe mis à jour."); setPwNew(""); setPwConfirm(""); }
  };
  return (
    <div>
      <PageHeader title="Mon profil" sub="Gérer vos informations personnelles" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, maxWidth: 900 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Informations du compte</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: 14, background: T.accentBg, borderRadius: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20, flexShrink: 0 }}>
              {(profile?.full_name || profile?.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{profile?.full_name || "Nom non défini"}</div>
              <div style={{ color: T.textMuted, fontSize: 13 }}>{profile?.email}</div>
              <div style={{ marginTop: 4 }}><Badge label={ROLES[profile?.role] || profile?.role} color={ROLE_COLOR[profile?.role] || "gray"} /></div>
            </div>
          </div>
          <Input label="Nom complet" value={fullName} onChange={setFullName} placeholder="Prénom Nom" />
          <Input label="Courriel" value={profile?.email || ""} onChange={() => {}} disabled />
          {msg && <div style={{ color: msg.startsWith("Erreur") ? T.danger : T.success, fontSize: 13, marginBottom: 8 }}>{msg}</div>}
          <Btn onClick={saveName} disabled={saving} fullWidth={isMobile}>{saving ? "Enregistrement..." : "Enregistrer"}</Btn>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Changer le mot de passe</div>
          <Input label="Nouveau mot de passe" value={pwNew} onChange={setPwNew} type="password" placeholder="••••••••" />
          <Input label="Confirmer" value={pwConfirm} onChange={setPwConfirm} type="password" placeholder="••••••••" />
          {pwMsg && <div style={{ color: pwMsg.includes("jour") ? T.success : T.danger, fontSize: 13, marginBottom: 8 }}>{pwMsg}</div>}
          <Btn onClick={changePassword} fullWidth={isMobile}>Changer le mot de passe</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ currentProfile }) {
  const { isMobile } = useBreakpoint();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("read_only");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at").then(({ data }) => { setProfiles(data || []); setLoading(false); });
  }, []);

  const updateRole = async (id, role) => {
    await supabase.from("profiles").update({ role }).eq("id", id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role } : p));
  };

  const toggleActive = async (id, active) => {
    await supabase.from("profiles").update({ active }).eq("id", id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, active } : p));
  };

  const inviteUser = async () => {
    if (!inviteEmail || !invitePassword) return setInviteMsg("Courriel et mot de passe requis.");
    if (invitePassword.length < 6) return setInviteMsg("Minimum 6 caractères.");
    setInviting(true); setInviteMsg("");
    const { data, error } = await supabase.auth.admin?.createUser
      ? await supabase.auth.admin.createUser({ email: inviteEmail, password: invitePassword, email_confirm: true, user_metadata: { full_name: inviteName } })
      : { data: null, error: { message: "Créez l'utilisateur directement dans Supabase → Authentication → Users." } };
    if (error) { setInviteMsg("⚠️ " + error.message); }
    else if (data?.user) {
      await supabase.from("profiles").update({ role: inviteRole, full_name: inviteName }).eq("id", data.user.id);
      const { data: np } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      if (np) setProfiles(prev => [...prev, np]);
      setInviteMsg("✅ Utilisateur créé."); setInviteEmail(""); setInviteName(""); setInvitePassword(""); setInviteRole("read_only");
    }
    setInviting(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Paramètres" sub="Gestion des utilisateurs et accès"
        actions={<Btn onClick={() => setShowInvite(true)} icon="＋" fullWidth={isMobile}>Nouvel utilisateur</Btn>} />
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 24 }}>
        <div style={{ padding: "12px 16px", background: "#f3f2f2", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 13 }}>👥 Utilisateurs ({profiles.length})</div>
        {isMobile ? (
          <div>
            {profiles.map(p => (
              <div key={p.id} style={{ padding: "14px 16px", borderBottom: `1px solid ${T.borderLight}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.id === currentProfile?.id ? T.accent : "#637381", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {(p.full_name || p.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.full_name || "—"}{p.id === currentProfile?.id && <span style={{ color: T.textMuted, fontSize: 11, marginLeft: 6 }}>(vous)</span>}</div>
                      <div style={{ color: T.textMuted, fontSize: 12 }}>{p.email}</div>
                    </div>
                  </div>
                  <Badge label={p.active ? "Actif" : "Inactif"} color={p.active ? "green" : "gray"} />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {p.id === currentProfile?.id ? <Badge label={ROLES[p.role] || p.role} color={ROLE_COLOR[p.role] || "gray"} /> : (
                    <select value={p.role} onChange={e => updateRole(p.id, e.target.value)}
                      style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "6px 10px", fontSize: 12, color: T.text }}>
                      <option value="admin">Administrateur</option>
                      <option value="editor">Éditeur</option>
                      <option value="read_only">Lecture seule</option>
                    </select>
                  )}
                  {p.id !== currentProfile?.id && <Btn variant="neutral" small onClick={() => toggleActive(p.id, !p.active)}>{p.active ? "Désactiver" : "Activer"}</Btn>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafaf9" }}>
                  {["Utilisateur", "Courriel", "Rôle", "Statut", "Créé le", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", color: T.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? T.surface : "#fafaf9" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: p.id === currentProfile?.id ? T.accent : "#637381", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {(p.full_name || p.email || "?")[0].toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.full_name || "—"}{p.id === currentProfile?.id && <span style={{ color: T.textMuted, fontSize: 11, marginLeft: 6 }}>(vous)</span>}</div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: T.text, fontSize: 13 }}>{p.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {p.id === currentProfile?.id ? <Badge label={ROLES[p.role] || p.role} color={ROLE_COLOR[p.role] || "gray"} /> : (
                        <select value={p.role} onChange={e => updateRole(p.id, e.target.value)}
                          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "4px 8px", fontSize: 12, color: T.text }}>
                          <option value="admin">Administrateur</option>
                          <option value="editor">Éditeur</option>
                          <option value="read_only">Lecture seule</option>
                        </select>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}><Badge label={p.active ? "Actif" : "Inactif"} color={p.active ? "green" : "gray"} /></td>
                    <td style={{ padding: "12px 16px", color: T.textMuted, fontSize: 12 }}>{p.created_at ? new Date(p.created_at).toLocaleDateString("fr-CA") : "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {p.id !== currentProfile?.id && <Btn variant="neutral" small onClick={() => toggleActive(p.id, !p.active)}>{p.active ? "Désactiver" : "Activer"}</Btn>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>📋 Description des rôles</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 12 }}>
          {[
            { role: "admin", label: "Administrateur", perms: ["Créer, modifier, supprimer", "Gérer les utilisateurs", "Consulter le journal d'audit"] },
            { role: "editor", label: "Éditeur", perms: ["Créer et modifier", "Pas de suppression", "Accès complet en lecture"] },
            { role: "read_only", label: "Lecture seule", perms: ["Consulter uniquement", "Aucune modification", "Aucune suppression"] },
          ].map(r => (
            <div key={r.role} style={{ background: "#fafaf9", border: `1px solid ${T.border}`, borderRadius: 6, padding: 14 }}>
              <div style={{ marginBottom: 8 }}><Badge label={r.label} color={ROLE_COLOR[r.role]} /></div>
              {r.perms.map(p => <div key={p} style={{ color: T.textMuted, fontSize: 12, marginBottom: 4 }}>• {p}</div>)}
            </div>
          ))}
        </div>
      </div>
      {showInvite && (
        <Modal title="Nouvel utilisateur" onClose={() => { setShowInvite(false); setInviteMsg(""); }}>
          <div style={{ background: T.warningBg, border: `1px solid ${T.warning}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: T.warning }}>
            <b>Note :</b> Si la création échoue, créez l'utilisateur dans <b>Supabase → Authentication → Users</b>.
          </div>
          <Input label="Nom complet" value={inviteName} onChange={setInviteName} placeholder="Prénom Nom" />
          <Input label="Courriel *" value={inviteEmail} onChange={setInviteEmail} type="email" required />
          <Input label="Mot de passe initial *" value={invitePassword} onChange={setInvitePassword} type="password" placeholder="Min. 6 caractères" required />
          <Select label="Rôle" value={inviteRole} onChange={setInviteRole} options={[{ value: "read_only", label: "Lecture seule" }, { value: "editor", label: "Éditeur" }, { value: "admin", label: "Administrateur" }]} />
          {inviteMsg && <div style={{ padding: "10px 14px", borderRadius: 4, background: inviteMsg.startsWith("✅") ? T.successBg : T.warningBg, color: inviteMsg.startsWith("✅") ? T.success : T.warning, fontSize: 13, marginBottom: 12 }}>{inviteMsg}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <Btn variant="neutral" onClick={() => { setShowInvite(false); setInviteMsg(""); }}>Annuler</Btn>
            <Btn onClick={inviteUser} disabled={inviting}>{inviting ? "Création..." : "Créer"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ENTITY FORM ──────────────────────────────────────────────────────────────
function EntityForm({ initial, onSave, onClose }) {
  const { isMobile } = useBreakpoint();
  const blank = { type: "Entreprise", prenom: "", nom: "", company_name: "", company_number: "", no_tps: "", no_tvq: "", transporteur: "", adresse_no: "", adresse_rue: "", adresse_ville: "", adresse_province: "QC", adresse_code_postal: "", telephone1: "", telephone1_desc: "", telephone2: "", telephone2_desc: "", courriel: "", site_web: "", consentement: "Non obtenu", notes: "" };
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const isEnt = f.type === "Entreprise";
  const grid = isMobile ? "1fr" : "1fr 1fr";
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
      <div style={{ display: "grid", gridTemplateColumns: grid, gap: 12 }}>
        <Select label="Type *" value={f.type} onChange={set("type")} options={["Entreprise", "Individu"]} required />
        {!isEnt && <><Input label="Prénom *" value={f.prenom} onChange={set("prenom")} required /><Input label="Nom *" value={f.nom} onChange={set("nom")} required /></>}
        <Input label={isEnt ? "Nom d'entreprise *" : "Nom d'entreprise"} value={f.company_name} onChange={set("company_name")} />
        <Input label="No d'entreprise (NEQ)" value={f.company_number} onChange={set("company_number")} />
        {isEnt && <><Input label="No TPS" value={f.no_tps} onChange={set("no_tps")} placeholder="123456789 RT0001" /><Input label="No TVQ" value={f.no_tvq} onChange={set("no_tvq")} placeholder="1234567890TQ0001" /></>}
        <Select label="Transporteur" value={f.transporteur} onChange={set("transporteur")} options={[{ value: "", label: "— Sélectionner —" }, "EDI", "Autre"]} />
      </div>
      <SectionTitle>Adresse postale</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 12 }}>
        <Input label="No porte" value={f.adresse_no} onChange={set("adresse_no")} />
        <Input label="Rue" value={f.adresse_rue} onChange={set("adresse_rue")} />
        <Input label="Ville" value={f.adresse_ville} onChange={set("adresse_ville")} />
        <Select label="Province" value={f.adresse_province} onChange={set("adresse_province")} options={["QC","ON","NB","NS","PE","NL","MB","SK","AB","BC"]} />
        <Input label="Code postal" value={f.adresse_code_postal} onChange={set("adresse_code_postal")} placeholder="J1A 2B3" />
      </div>
      <SectionTitle>Coordonnées</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: grid, gap: 12 }}>
        <Input label="Tél. 1" value={f.telephone1} onChange={set("telephone1")} placeholder="(450) 555-0101" />
        <Input label="Description tél. 1" value={f.telephone1_desc} onChange={set("telephone1_desc")} placeholder="Bureau, Cellulaire..." />
        <Input label="Tél. 2" value={f.telephone2} onChange={set("telephone2")} />
        <Input label="Description tél. 2" value={f.telephone2_desc} onChange={set("telephone2_desc")} />
        <Input label="Courriel" value={f.courriel} onChange={set("courriel")} type="email" />
        <Input label="Site web" value={f.site_web} onChange={set("site_web")} />
      </div>
      {!isEnt && <Select label="Consentement *" value={f.consentement} onChange={set("consentement")} required options={[{ value: "", label: "— Sélectionner —" }, "Non obtenu", "Explicite", "Refus"]} />}
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
  const { isMobile } = useBreakpoint();
  const blank = { entity_id: entityId, type_lieu: "Collecte", adresse_no: "", adresse_rue: "", adresse_ville: "", adresse_province: "QC", adresse_code_postal: "", adresse_url: "", lat_long: "", description: "", plan_deplacement: "Non", plan_desc: "", tonnage_matiere: "", tonnage_digestat: "", type_biomasse: [], type_biomass_autre: "", type_deject_masse: "Liquide", type_litiere: "", taille_cheptel: "", freq_collecte: "", volume_pre_fosse: "", hectares: "", capacite_phosphore: "" };
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const toggleBio = v => setF(p => ({ ...p, type_biomasse: (p.type_biomasse || []).includes(v) ? p.type_biomasse.filter(x => x !== v) : [...(p.type_biomasse || []), v] }));
  const grid = isMobile ? "1fr" : "1fr 1fr";
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
      <div style={{ display: "grid", gridTemplateColumns: grid, gap: 12 }}>
        <Select label="Type de lieu *" value={f.type_lieu} onChange={set("type_lieu")} options={["Collecte", "Dépôt", "Collecte et dépôt"]} />
        <Select label="Plan de déplacement *" value={f.plan_deplacement} onChange={set("plan_deplacement")} options={["Non", "Oui", "À venir"]} />
      </div>
      <SectionTitle>Adresse</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 12 }}>
        <Input label="No porte" value={f.adresse_no} onChange={set("adresse_no")} />
        <Input label="Rue" value={f.adresse_rue} onChange={set("adresse_rue")} />
        <Input label="Ville" value={f.adresse_ville} onChange={set("adresse_ville")} />
        <Select label="Province" value={f.adresse_province} onChange={set("adresse_province")} options={["QC","ON","NB","NS","PE","NL","MB","SK","AB","BC"]} />
        <Input label="Code postal" value={f.adresse_code_postal} onChange={set("adresse_code_postal")} />
        <Input label="URL Google Maps" value={f.adresse_url} onChange={set("adresse_url")} placeholder="https://maps.app.goo.gl/..." />
        <Input label="Lat / Long" value={f.lat_long} onChange={set("lat_long")} placeholder="45°20'15N 72°58'42W" />
      </div>
      <Textarea label="Description" value={f.description} onChange={set("description")} rows={2} />
      {f.plan_deplacement === "Oui" && <Textarea label="Description du plan" value={f.plan_desc} onChange={set("plan_desc")} rows={2} />}
      <SectionTitle>Données agricoles</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: grid, gap: 12 }}>
        <Input label="Tonnage matière (t)" value={f.tonnage_matiere} onChange={set("tonnage_matiere")} type="number" />
        <Input label="Tonnage digestat (t)" value={f.tonnage_digestat} onChange={set("tonnage_digestat")} type="number" />
        <div>
          <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Type de biomasse</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["Porc", "Bœuf", "Volaille", "Autre"].map(v => (
              <label key={v} style={{ display: "flex", alignItems: "center", gap: 5, color: T.text, fontSize: 14, cursor: "pointer", padding: "4px 0" }}>
                <input type="checkbox" checked={(f.type_biomasse || []).includes(v)} onChange={() => toggleBio(v)} style={{ width: 16, height: 16 }} /> {v}
              </label>
            ))}
          </div>
          {(f.type_biomasse || []).includes("Autre") && <div style={{ marginTop: 8 }}><Input label="Préciser" value={f.type_biomass_autre} onChange={set("type_biomass_autre")} /></div>}
        </div>
        <Select label="Type de déjection" value={f.type_deject_masse} onChange={set("type_deject_masse")} options={["Solide", "Liquide", "Solide + liquide"]} />
        <Input label="Type de litière" value={f.type_litiere} onChange={set("type_litiere")} placeholder="Paille, Rip..." />
        <Input label="Taille du cheptel (têtes)" value={f.taille_cheptel} onChange={set("taille_cheptel")} type="number" />
        <Input label="Fréquence collecte (h)" value={f.freq_collecte} onChange={set("freq_collecte")} type="number" />
        <Input label="Volume pré-fosse (m³)" value={f.volume_pre_fosse} onChange={set("volume_pre_fosse")} type="number" />
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
function ActiviteForm({ initial, entityId, onSave, onClose, profiles }) {
  const { isMobile } = useBreakpoint();
  const blank = { entity_id: entityId, date: today(), date_suivi: "", assigne_a: "", realise_p: "", statut: "Actif", type: "Appel", desc_courte: "", description: "", url: "", modif_par: "" };
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const [saving, setSaving] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const grid = isMobile ? "1fr" : "1fr 1fr";
  const userOptions = [{ value: "", label: "— Sélectionner —" }, ...profiles.filter(p => p.active).map(p => ({ value: p.full_name || p.email, label: p.full_name || p.email }))];
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
      <div style={{ display: "grid", gridTemplateColumns: grid, gap: 12 }}>
        <Select label="Type" value={f.type} onChange={set("type")} options={["Courriel", "Appel", "Rencontre", "Tâche", "Suivi", "Autre"]} />
        <Select label="Statut" value={f.statut} onChange={set("statut")} options={["Actif", "Planifiée", "Terminé", "Annulé"]} />
        <Input label="Date *" value={f.date} onChange={set("date")} type="date" />
        <Input label="Date de suivi" value={f.date_suivi} onChange={set("date_suivi")} type="date" />
        <Select label="Assigné à" value={f.assigne_a} onChange={set("assigne_a")} options={userOptions} />
        <Select label="Réalisé par" value={f.realise_p} onChange={set("realise_p")} options={userOptions} />
      </div>
      <Input label="Objet *" value={f.desc_courte} onChange={set("desc_courte")} />
      <Textarea label="Note détaillée" value={f.description} onChange={set("description")} rows={5} />
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
  const { isMobile } = useBreakpoint();
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
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
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
  const { isMobile } = useBreakpoint();
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
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <Input label="Date sauvegarde" value={f.date_sauvegarde} onChange={set("date_sauvegarde")} type="date" />
        <Input label="Échéance" value={f.echeance} onChange={set("echeance")} type="date" />
        <Input label="Nom du fichier" value={f.file_name} onChange={set("file_name")} placeholder="document.pdf" />
        <div style={{ display: "flex", alignItems: "center", paddingTop: 22 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: T.text, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={f.actif} onChange={e => set("actif")(e.target.checked)} style={{ width: 16, height: 16 }} /> Document actif
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
  const { isMobile } = useBreakpoint();
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
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
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
function EntityDetail({ entity, entities, lieux, activites, relations, documents, primes, profiles, role, profile,
  onEditEntity, onDeleteEntity, onSaveLieu, onDeleteLieu, onSaveActivite, onDeleteActivite,
  onSaveRelation, onDeleteRelation, onSaveDocument, onDeleteDocument, onSavePrime, onDeletePrime, onClose }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [modal, setModal] = useState(null);
  const eLieux = lieux.filter(l => l.entity_id === entity.id && !l.deleted_at);
  const eActivites = [...activites.filter(a => a.entity_id === entity.id)].sort((a, b) => b.date.localeCompare(a.date));
  const eRelations = relations.filter(r => r.entity_a_id === entity.id || r.entity_b_id === entity.id);
  const eDocs = documents.filter(d => d.entity_id === entity.id);
  const ePrimes = primes.filter(p => p.entity_id === entity.id);
  const totMat = eLieux.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
  const totDig = eLieux.reduce((s, l) => s + (Number(l.tonnage_digestat) || 0), 0);
  const totalPrimes = ePrimes.reduce((s, p) => s + (Number(p.montant) || 0), 0);
  const ro = !canEdit(role);
  const twoCol = !isMobile && !isTablet;

  const handleSaveLieu = async (row) => {
    const isNew = !lieux.find(l => l.id === row.id);
    await logAction(profile, isNew ? "CREATE_LIEU" : "UPDATE_LIEU", "Lieu", row.id, `${row.adresse_ville || row.type_lieu} (${displayName(entity)})`, isNew ? "Nouveau lieu ajouté" : "Lieu modifié");
    onSaveLieu(row);
  };
  const handleDeleteLieu = async (id) => {
    if (!canDelete(role)) return alert("Accès refusé.");
    if (!confirm("Supprimer ce lieu ?")) return;
    await supabase.from("lieux").delete().eq("id", id);
    await logAction(profile, "DELETE_LIEU", "Lieu", id, displayName(entity), "Lieu supprimé");
    onDeleteLieu(id);
  };
  const handleSaveActivite = async (row) => {
    const isNew = !activites.find(a => a.id === row.id);
    await logAction(profile, isNew ? "CREATE_ACTIVITE" : "UPDATE_ACTIVITE", "Activité", row.id, `${row.desc_courte} (${displayName(entity)})`, isNew ? "Nouvelle activité" : "Activité modifiée");
    onSaveActivite(row);
  };
  const handleDeleteActivite = async (id) => {
    if (!canDelete(role)) return alert("Accès refusé.");
    if (!confirm("Supprimer ?")) return;
    await supabase.from("activites").delete().eq("id", id);
    await logAction(profile, "DELETE_ACTIVITE", "Activité", id, displayName(entity), "Activité supprimée");
    onDeleteActivite(id);
  };
  const handleSaveDocument = async (row) => {
    const isNew = !documents.find(d => d.id === row.id);
    await logAction(profile, isNew ? "CREATE_DOCUMENT" : "UPDATE_DOCUMENT", "Document", row.id, `${row.file_name || row.type_doc} (${displayName(entity)})`, isNew ? "Nouveau document" : "Document modifié");
    onSaveDocument(row);
  };
  const handleDeleteDocument = async (id) => {
    if (!canDelete(role)) return alert("Accès refusé.");
    if (!confirm("Supprimer ?")) return;
    await supabase.from("documents").delete().eq("id", id);
    await logAction(profile, "DELETE_DOCUMENT", "Document", id, displayName(entity), "Document supprimé");
    onDeleteDocument(id);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 13 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>← Entités</button>
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: isMobile ? "14px 16px" : "20px 24px", marginBottom: 16, boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1, minWidth: 0 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: entity.type === "Entreprise" ? T.accentBg : "#fef7e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `2px solid ${entity.type === "Entreprise" ? T.accent : T.gold}`, flexShrink: 0 }}>
              {entity.type === "Entreprise" ? "🏢" : "👤"}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ color: T.text, margin: "0 0 4px 0", fontSize: isMobile ? 18 : 22, fontWeight: 700, wordBreak: "break-word" }}>{displayName(entity)}</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Badge label={entity.type} color={typeColor(entity.type)} />
                {entity.adresse_ville && <span style={{ color: T.textMuted, fontSize: 13 }}>📍 {entity.adresse_ville}, {entity.adresse_province}</span>}
              </div>
            </div>
          </div>
          {!ro && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Btn variant="neutral" small onClick={() => onEditEntity(entity)}>✏️ Modifier</Btn>
              {canDelete(role) && <Btn variant="danger" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("entities").delete().eq("id", entity.id); await logAction(profile, "DELETE_ENTITY", "Entité", entity.id, displayName(entity), "Entité supprimée"); onDeleteEntity(entity.id); onClose(); }}>🗑️</Btn>}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.borderLight}` }}>
          {[{ label: "Matière", value: `${totMat.toLocaleString()} t`, icon: "🌿" }, { label: "Digestat", value: `${totDig.toLocaleString()} t`, icon: "♻️" }, { label: "Sites", value: eLieux.length, icon: "📍" }, { label: "Primes", value: totalPrimes.toLocaleString("fr-CA", { style: "currency", currency: "CAD" }), icon: "💰" }].map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: isMobile ? 14 : 16 }}>{s.value}</div>
              <div style={{ color: T.textMuted, fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: twoCol ? "1fr 2fr" : "1fr", gap: 16, alignItems: "start" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Informations</div>
          {entity.type === "Individu" && <DetailRow label="Prénom / Nom" value={`${entity.prenom || ""} ${entity.nom || ""}`} />}
          {entity.company_name && <DetailRow label="Entreprise" value={entity.company_name} />}
          {entity.company_number && <DetailRow label="No d'entreprise" value={entity.company_number} />}
          {entity.no_tps && <DetailRow label="No TPS" value={entity.no_tps} />}
          {entity.no_tvq && <DetailRow label="No TVQ" value={entity.no_tvq} />}
          {entity.transporteur && <DetailRow label="Transporteur" value={entity.transporteur} />}
          <DetailRow label="Adresse" value={[entity.adresse_no, entity.adresse_rue, entity.adresse_ville, entity.adresse_province, entity.adresse_code_postal].filter(Boolean).join(" ")} />
          {entity.telephone1 && <DetailRow label={`Tél. (${entity.telephone1_desc || "principal"})`} value={entity.telephone1} />}
          {entity.telephone2 && <DetailRow label={`Tél. 2`} value={entity.telephone2} />}
          {entity.courriel && <DetailRow label="Courriel" value={entity.courriel} />}
          {entity.site_web && <DetailRow label="Site web" value={entity.site_web} />}
          {entity.type === "Individu" && <DetailRow label="Consentement" value={entity.consentement} />}
          {entity.notes && <DetailRow label="Notes" value={entity.notes} />}
        </div>
        <div>
          <RelatedList title="Activités" icon="📅" count={eActivites.length} onAdd={!ro ? () => setModal({ type: "activite" }) : null} addLabel="+ Nouvelle" empty="Aucune activité" readOnly={ro}>
            {eActivites.map(a => <ActivityItem key={a.id} a={a} onEdit={a => setModal({ type: "activite", item: a })} onDelete={canDelete(role) ? handleDeleteActivite : null} readOnly={ro} />)}
          </RelatedList>
          <RelatedList title="Lieux de retrait / dépôt" icon="📍" count={eLieux.length} onAdd={!ro ? () => setModal({ type: "lieu" }) : null} addLabel="+ Nouveau" empty="Aucun lieu" readOnly={ro}>
            {eLieux.map(l => (
              <div key={l.id} style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                      <Badge label={l.type_lieu} color="blue" />
                      <Badge label={`Plan: ${l.plan_deplacement}`} color={l.plan_deplacement === "Oui" ? "green" : l.plan_deplacement === "À venir" ? "orange" : "gray"} />
                    </div>
                    <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{[l.adresse_no, l.adresse_rue, l.adresse_ville, l.adresse_province].filter(Boolean).join(" ") || "Adresse non définie"}</div>
                    {l.lat_long && <div style={{ color: T.textDim, fontSize: 12, marginTop: 2 }}>📌 {l.lat_long}</div>}
                    <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                      {l.tonnage_matiere && <span style={{ color: T.textMuted, fontSize: 12 }}>🌿 <b style={{ color: T.text }}>{l.tonnage_matiere} t</b></span>}
                      {l.tonnage_digestat && <span style={{ color: T.textMuted, fontSize: 12 }}>♻️ <b style={{ color: T.text }}>{l.tonnage_digestat} t</b></span>}
                      {l.type_biomasse?.length > 0 && <span style={{ color: T.textMuted, fontSize: 12 }}>🐄 {l.type_biomasse.join(", ")}</span>}
                      {l.taille_cheptel && <span style={{ color: T.textMuted, fontSize: 12 }}>🐖 {Number(l.taille_cheptel).toLocaleString()} têtes</span>}
                    </div>
                  </div>
                  {!ro && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <Btn variant="neutral" small onClick={() => setModal({ type: "lieu", item: l })}>✏️</Btn>
                      {canDelete(role) && <Btn variant="neutral" small onClick={() => handleDeleteLieu(l.id)}>🗑️</Btn>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </RelatedList>
          <RelatedList title="Relations" icon="🤝" count={eRelations.length} onAdd={!ro ? () => setModal({ type: "relation" }) : null} addLabel="+ Nouvelle" empty="Aucune relation" readOnly={ro}>
            {eRelations.map(r => {
              const otherId = r.entity_a_id === entity.id ? r.entity_b_id : r.entity_a_id;
              const other = entities.find(e => e.id === otherId);
              return (
                <div key={r.id} style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ color: T.text, fontWeight: 600, fontSize: 13 }}>{displayName(other)}</div>
                    <div style={{ marginTop: 4 }}><Badge label={r.type_relation} color="gold" /></div>
                    {r.description && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>{r.description}</div>}
                  </div>
                  {!ro && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <Btn variant="neutral" small onClick={() => setModal({ type: "relation", item: r })}>✏️</Btn>
                      {canDelete(role) && <Btn variant="neutral" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("relations").delete().eq("id", r.id); onDeleteRelation(r.id); }}>🗑️</Btn>}
                    </div>
                  )}
                </div>
              );
            })}
          </RelatedList>
          <RelatedList title="Documents" icon="📄" count={eDocs.length} onAdd={!ro ? () => setModal({ type: "document" }) : null} addLabel="+ Nouveau" empty="Aucun document" readOnly={ro}>
            {eDocs.map(d => (
              <div key={d.id} style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}><Badge label={d.type_doc} color="blue" />{d.actif ? <Badge label="Actif" color="green" /> : <Badge label="Inactif" color="gray" />}</div>
                  <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{d.file_name || "—"}</div>
                  {d.echeance && <div style={{ color: T.warning, fontSize: 12, marginTop: 3 }}>⏰ {d.echeance}</div>}
                  {d.description && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 3 }}>{d.description}</div>}
                </div>
                {!ro && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <Btn variant="neutral" small onClick={() => setModal({ type: "document", item: d })}>✏️</Btn>
                    {canDelete(role) && <Btn variant="neutral" small onClick={() => handleDeleteDocument(d.id)}>🗑️</Btn>}
                  </div>
                )}
              </div>
            ))}
          </RelatedList>
          <RelatedList title="Primes" icon="💰" count={ePrimes.length} onAdd={!ro ? () => setModal({ type: "prime" }) : null} addLabel="+ Nouvelle" empty="Aucune prime" readOnly={ro}>
            {ePrimes.map(p => (
              <div key={p.id} style={{ borderBottom: `1px solid ${T.borderLight}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{Number(p.montant).toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</span>
                  <span style={{ color: T.textMuted, fontSize: 12, marginLeft: 10 }}>{p.date}</span>
                  {p.description && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 3 }}>{p.description}</div>}
                </div>
                {!ro && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <Btn variant="neutral" small onClick={() => setModal({ type: "prime", item: p })}>✏️</Btn>
                    {canDelete(role) && <Btn variant="neutral" small onClick={async () => { if (!confirm("Supprimer ?")) return; await supabase.from("primes").delete().eq("id", p.id); onDeletePrime(p.id); }}>🗑️</Btn>}
                  </div>
                )}
              </div>
            ))}
            {ePrimes.length > 0 && <div style={{ padding: "10px 16px", textAlign: "right", fontWeight: 700 }}>Total: {totalPrimes.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</div>}
          </RelatedList>
        </div>
      </div>

      {modal?.type === "lieu" && <Modal title={modal.item ? "Modifier lieu" : "Nouveau lieu"} onClose={() => setModal(null)} wide><LieuForm initial={modal.item} entityId={entity.id} onSave={l => { handleSaveLieu(l); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
      {modal?.type === "activite" && <Modal title={modal.item ? "Modifier activité" : "Nouvelle activité"} onClose={() => setModal(null)} wide><ActiviteForm initial={modal.item} entityId={entity.id} profiles={profiles} onSave={a => { handleSaveActivite(a); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
      {modal?.type === "relation" && <Modal title={modal.item ? "Modifier relation" : "Nouvelle relation"} onClose={() => setModal(null)}><RelationForm initial={modal.item} entityId={entity.id} entities={entities} onSave={r => { onSaveRelation(r); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
      {modal?.type === "document" && <Modal title={modal.item ? "Modifier document" : "Nouveau document"} onClose={() => setModal(null)}><DocumentForm initial={modal.item} entityId={entity.id} onSave={d => { handleSaveDocument(d); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
      {modal?.type === "prime" && <Modal title={modal.item ? "Modifier prime" : "Nouvelle prime"} onClose={() => setModal(null)}><PrimeForm initial={modal.item} entityId={entity.id} onSave={p => { onSavePrime(p); setModal(null); }} onClose={() => setModal(null)} /></Modal>}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ entities, lieux, activites, documents, primes, onNavigate }) {
  const { isMobile } = useBreakpoint();
  const totalMat = lieux.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
  const totalDig = lieux.reduce((s, l) => s + (Number(l.tonnage_digestat) || 0), 0);
  const totalPrimes = primes.reduce((s, p) => s + (Number(p.montant) || 0), 0);
  const docsEcheant = documents.filter(d => d.echeance && d.echeance <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) && d.actif);
  const bioCount = {};
  lieux.forEach(l => (l.type_biomasse || []).forEach(b => { bioCount[b] = (bioCount[b] || 0) + 1; }));
  return (
    <div>
      <PageHeader title="Tableau de bord" sub="Projet GNR Farnham · Energir Développement inc." />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard icon="🏢" label="Entités" value={entities.length} sub={`${entities.filter(e=>e.type==="Entreprise").length} ent. · ${entities.filter(e=>e.type==="Individu").length} ind.`} color={T.accent} onClick={() => onNavigate("entities")} />
        <StatCard icon="📍" label="Sites" value={lieux.length} color={T.warning} />
        <StatCard icon="🌿" label="Matière (t/an)" value={totalMat.toLocaleString()} color="#2e844a" />
        <StatCard icon="♻️" label="Digestat (t/an)" value={totalDig.toLocaleString()} color={T.accent} />
        <StatCard icon="📅" label="Planifiées" value={activites.filter(a=>a.statut==="Planifiée").length} color={T.warning} onClick={() => onNavigate("activites")} />
        <StatCard icon="⚡" label="En cours" value={activites.filter(a=>a.statut==="Actif").length} color={T.accent} />
        <StatCard icon="💰" label="Primes" value={totalPrimes.toLocaleString("fr-CA",{style:"currency",currency:"CAD"})} color={T.gold} />
        <StatCard icon={docsEcheant.length > 0 ? "⚠️" : "📄"} label="Docs échéant" value={docsEcheant.length} color={docsEcheant.length > 0 ? T.danger : T.textDim} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "12px 16px", background: "#f3f2f2", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 13 }}>🐄 Répartition biomasse</div>
          <div style={{ padding: 16 }}>
            {Object.entries(bioCount).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{k}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 100, height: 8, background: T.borderLight, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (v / Math.max(...Object.values(bioCount))) * 100)}%`, height: "100%", background: T.accent, borderRadius: 4 }} />
                  </div>
                  <span style={{ color: T.textMuted, fontSize: 12 }}>{v}</span>
                </div>
              </div>
            ))}
            {Object.keys(bioCount).length === 0 && <EmptyState icon="🌾" message="Aucune donnée" />}
          </div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "12px 16px", background: "#f3f2f2", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 13 }}>📅 Activités récentes</div>
          {[...activites].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${T.borderLight}` }}>
              <div><div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{a.desc_courte}</div><div style={{ color: T.textDim, fontSize: 12 }}>{a.date} · {a.type}</div></div>
              <Badge label={a.statut} color={statutColor(a.statut)} />
            </div>
          ))}
          {activites.length === 0 && <EmptyState icon="📭" message="Aucune activité" />}
        </div>
        {docsEcheant.length > 0 && (
          <div style={{ background: T.card, border: `1px solid ${T.danger}`, borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: T.dangerBg, borderBottom: `1px solid ${T.danger}`, fontWeight: 700, fontSize: 13, color: T.danger }}>⚠️ Documents échéant dans 30 jours</div>
            {docsEcheant.map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${T.borderLight}` }}>
                <span style={{ color: T.text, fontSize: 13 }}>{d.file_name || d.type_doc}</span>
                <span style={{ color: T.danger, fontSize: 12, fontWeight: 600 }}>{d.echeance}</span>
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
  const { isMobile, isTablet } = useBreakpoint();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [entities, setEntities] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [activites, setActivites] = useState([]);
  const [relations, setRelations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [primes, setPrimes] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Tous");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
        if (event === "SIGNED_IN") {
          const { data: p } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
          if (p) logAction(p, "LOGIN", null, null, null, `Connexion depuis ${navigator.userAgent.includes("Mobile") ? "mobile" : "desktop"}`);
        }
      } else {
        setProfile(null); setAuthLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data); setAuthLoading(false);
  };

  useEffect(() => {
    if (!session) return;
    async function loadAll() {
      setDataLoading(true);
      const [e, l, a, r, d, p, pr] = await Promise.all([
        supabase.from("entities").select("*").is("deleted_at", null),
        supabase.from("lieux").select("*").is("deleted_at", null),
        supabase.from("activites").select("*"),
        supabase.from("relations").select("*"),
        supabase.from("documents").select("*"),
        supabase.from("primes").select("*"),
        supabase.from("profiles").select("*").eq("active", true),
      ]);
      setEntities(e.data || []); setLieux(l.data || []); setActivites(a.data || []);
      setRelations(r.data || []); setDocuments(d.data || []); setPrimes(p.data || []);
      setProfiles(pr.data || []); setDataLoading(false);
    }
    loadAll();
  }, [session]);

  const saveEntity = async (row, isNew) => {
    setEntities(prev => prev.some(x => x.id === row.id) ? prev.map(x => x.id === row.id ? row : x) : [...prev, row]);
    await logAction(profile, isNew ? "CREATE_ENTITY" : "UPDATE_ENTITY", "Entité", row.id, displayName(row), isNew ? "Nouvelle entité créée" : "Entité modifiée");
    setShowEntityForm(false); setEditingEntity(null);
  };
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

  const logout = async () => {
    await logAction(profile, "LOGOUT", null, null, null, "Déconnexion");
    await supabase.auth.signOut();
    setPage("dashboard"); setSelectedEntity(null);
  };

  const role = profile?.role || "read_only";
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
    ...(canManageUsers(role) ? [{ id: "audit", icon: "📋", label: "Audit" }, { id: "settings", icon: "⚙️", label: "Paramètres" }] : []),
  ];

  const navigate = (p) => { setPage(p); setSelectedEntity(null); setMobileMenuOpen(false); };

  if (authLoading) return <div style={{ minHeight: "100vh", background: T.headerBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
  if (!session) return <LoginPage />;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI', Arial, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; -webkit-text-size-adjust: 100%; }
        @media (max-width: 639px) { .desktop-only { display: none !important; } }
        @media (min-width: 640px) { .mobile-only { display: none !important; } }
      `}</style>

      {/* TOP NAV */}
      <div style={{ background: T.headerBg, height: 52, display: "flex", alignItems: "center", padding: "0 16px", gap: 0, flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.2)", position: "sticky", top: 0, zIndex: 200 }}>
        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(x => !x)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", marginRight: 10, padding: "4px 6px", lineHeight: 1 }}>☰</button>
        )}
        <div style={{ color: "#fff", fontWeight: 900, fontSize: isMobile ? 14 : 15, display: "flex", alignItems: "center", gap: 6, marginRight: isMobile ? "auto" : 24 }}>
          <span style={{ fontSize: 18 }}>🌿</span>{!isMobile && "GNR Farnham CRM"}
        </div>
        {/* Desktop / tablet nav */}
        {!isMobile && NAV.map(n => (
          <button key={n.id} onClick={() => navigate(n.id)} style={{ background: page === n.id ? "rgba(255,255,255,0.15)" : "transparent", border: "none", borderBottom: page === n.id ? "2px solid #fff" : "2px solid transparent", color: "#fff", padding: isTablet ? "0 10px" : "0 14px", height: 52, fontSize: isTablet ? 12 : 13, fontWeight: page === n.id ? 700 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
            <span>{n.icon}</span>{!isTablet && n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {/* User menu */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowUserMenu(x => !x)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 20, padding: "4px 10px 4px 5px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", color: "#fff", WebkitTapHighlightColor: "transparent" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: T.headerBg, flexShrink: 0 }}>
              {(profile?.full_name || profile?.email || "?")[0].toUpperCase()}
            </div>
            {!isMobile && <span style={{ fontSize: 13, fontWeight: 600 }}>{profile?.full_name || profile?.email}</span>}
            <span style={{ fontSize: 10 }}>▼</span>
          </button>
          {showUserMenu && (
            <div style={{ position: "absolute", right: 0, top: 46, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, width: 220, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 300 }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{profile?.full_name || "—"}</div>
                <div style={{ color: T.textMuted, fontSize: 12 }}>{profile?.email}</div>
                <div style={{ marginTop: 5 }}><Badge label={ROLES[role] || role} color={ROLE_COLOR[role] || "gray"} /></div>
              </div>
              <button onClick={() => { navigate("profile"); setShowUserMenu(false); }} style={{ display: "block", width: "100%", padding: "11px 16px", background: "none", border: "none", textAlign: "left", color: T.text, fontSize: 13, cursor: "pointer" }}>👤 Mon profil</button>
              <button onClick={() => { logout(); setShowUserMenu(false); }} style={{ display: "block", width: "100%", padding: "11px 16px", background: "none", border: "none", textAlign: "left", color: T.danger, fontSize: 13, cursor: "pointer", borderTop: `1px solid ${T.border}` }}>🚪 Déconnexion</button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE SLIDE-DOWN MENU */}
      {isMobile && mobileMenuOpen && (
        <div style={{ background: T.headerBg, borderBottom: `1px solid rgba(255,255,255,0.1)`, position: "sticky", top: 52, zIndex: 190 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => navigate(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 20px", background: page === n.id ? "rgba(255,255,255,0.1)" : "transparent", border: "none", borderLeft: page === n.id ? `3px solid #fff` : "3px solid transparent", color: "#fff", fontSize: 15, fontWeight: page === n.id ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close menus */}
      {(showUserMenu || mobileMenuOpen) && <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => { setShowUserMenu(false); setMobileMenuOpen(false); }} />}

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "16px 12px" : "24px 28px", paddingBottom: isMobile ? 80 : "24px" }}>
        {dataLoading && <Spinner />}
        {!dataLoading && page === "dashboard" && <Dashboard entities={entities} lieux={lieux} activites={activites} documents={documents} primes={primes} onNavigate={navigate} />}
        {!dataLoading && page === "profile" && <MyProfilePage profile={profile} onUpdate={setProfile} />}
        {!dataLoading && page === "audit" && canManageUsers(role) && <AuditLogPage />}
        {!dataLoading && page === "settings" && canManageUsers(role) && <SettingsPage currentProfile={profile} />}

        {!dataLoading && page === "entities" && !selectedEntity && (
          <div>
            <PageHeader title="Entités" sub={`${filteredEntities.length} entité(s)`}
              actions={canEdit(role) ? <Btn onClick={() => { setEditingEntity(null); setShowEntityForm(true); }} icon="＋" fullWidth={isMobile}>Nouvelle entité</Btn> : null} />
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDim }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                  style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "9px 12px 9px 32px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 3, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: 3 }}>
                {["Tous", "Entreprise", "Individu"].map(t => (
                  <button key={t} onClick={() => setFilterType(t)} style={{ background: filterType === t ? T.accent : "transparent", color: filterType === t ? "#fff" : T.textMuted, border: "none", borderRadius: 3, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t}</button>
                ))}
              </div>
            </div>
            {isMobile ? (
              <div>
                {filteredEntities.map(e => {
                  const eL = lieux.filter(l => l.entity_id === e.id);
                  const totMat = eL.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
                  return (
                    <div key={e.id} onClick={() => setSelectedEntity(e)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: T.accent }}>{displayName(e)}</div>
                        <Badge label={e.type} color={typeColor(e.type)} />
                      </div>
                      <div style={{ color: T.textMuted, fontSize: 13 }}>{[e.adresse_ville, e.adresse_province].filter(Boolean).join(", ") || "—"}</div>
                      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                        <span style={{ color: T.textDim, fontSize: 12 }}>📍 {eL.length} site(s)</span>
                        {totMat > 0 && <span style={{ color: T.success, fontSize: 12, fontWeight: 700 }}>🌿 {totMat.toLocaleString()} t</span>}
                      </div>
                    </div>
                  );
                })}
                {filteredEntities.length === 0 && <EmptyState icon="🏢" message="Aucune entité trouvée." />}
              </div>
            ) : (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                    <thead>
                      <tr style={{ background: "#f3f2f2" }}>
                        {["Nom","Type","Ville","Téléphone","Courriel","Sites","Matière",""].map(h => (
                          <th key={h} style={{ padding: "10px 14px", color: T.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntities.map((e, i) => {
                        const eL = lieux.filter(l => l.entity_id === e.id);
                        const totMat = eL.reduce((s, l) => s + (Number(l.tonnage_matiere) || 0), 0);
                        return (
                          <tr key={e.id} style={{ background: i%2===0?T.surface:"#fafaf9", cursor:"pointer" }}
                            onMouseEnter={ev=>ev.currentTarget.style.background=T.accentBg}
                            onMouseLeave={ev=>ev.currentTarget.style.background=i%2===0?T.surface:"#fafaf9"}
                            onClick={() => setSelectedEntity(e)}>
                            <td style={{ padding:"11px 14px" }}><span style={{ color:T.accent, fontWeight:600, fontSize:13 }}>{displayName(e)}</span></td>
                            <td style={{ padding:"11px 14px" }}><Badge label={e.type} color={typeColor(e.type)} /></td>
                            <td style={{ padding:"11px 14px", color:T.text, fontSize:13 }}>{[e.adresse_ville,e.adresse_province].filter(Boolean).join(", ")||"—"}</td>
                            <td style={{ padding:"11px 14px", color:T.text, fontSize:13 }}>{e.telephone1||"—"}</td>
                            <td style={{ padding:"11px 14px", color:T.text, fontSize:13 }}>{e.courriel||"—"}</td>
                            <td style={{ padding:"11px 14px", color:T.text, fontSize:13, textAlign:"center" }}>{eL.length}</td>
                            <td style={{ padding:"11px 14px", color:totMat>0?T.success:T.textDim, fontSize:13, fontWeight:totMat>0?700:400 }}>{totMat>0?`${totMat.toLocaleString()} t`:"—"}</td>
                            <td style={{ padding:"11px 14px" }}>{canEdit(role)&&<Btn variant="ghost" small onClick={ev=>{ev.stopPropagation();setEditingEntity(e);setShowEntityForm(true);}}>✏️</Btn>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredEntities.length === 0 && <EmptyState icon="🏢" message="Aucune entité trouvée." />}
              </div>
            )}
          </div>
        )}

        {!dataLoading && page === "entities" && selectedEntity && (
          <EntityDetail
            entity={entities.find(e => e.id === selectedEntity.id) || selectedEntity}
            entities={entities} lieux={lieux} activites={activites} relations={relations} documents={documents} primes={primes} profiles={profiles} role={role} profile={profile}
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

        {!dataLoading && page === "activites" && (
          <div>
            <PageHeader title="Activités" sub={`${activites.length} au total`} />
            {["Planifiée","Actif","Terminé","Annulé"].map(statut => {
              const group = [...activites.filter(a=>a.statut===statut)].sort((a,b)=>b.date.localeCompare(a.date));
              if (!group.length) return null;
              return (
                <div key={statut} style={{ marginBottom: 18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <Badge label={statut} color={statutColor(statut)} />
                    <span style={{ color:T.textMuted, fontSize:12 }}>{group.length}</span>
                  </div>
                  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                    {group.map(a => {
                      const ent = entities.find(e=>e.id===a.entity_id);
                      return (
                        <div key={a.id} style={{ borderBottom:`1px solid ${T.borderLight}`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                          <div style={{ display:"flex", gap:10, flex:1, minWidth:0 }}>
                            <div style={{ fontSize:20, flexShrink:0 }}>{{Courriel:"📧",Appel:"📞",Rencontre:"🤝",Tâche:"✅",Suivi:"🔔",Autre:"📝"}[a.type]||"📝"}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ color:T.text, fontWeight:600, fontSize:13, marginBottom:2 }}>{a.desc_courte}</div>
                              <div style={{ color:T.textMuted, fontSize:12 }}>
                                {ent?<span style={{color:T.accent,fontWeight:600,cursor:"pointer"}} onClick={()=>{setSelectedEntity(ent);setPage("entities");}}>{displayName(ent)}</span>:"—"}
                                {" · "}{a.date}{a.assigne_a?` · ${a.assigne_a}`:""}
                              </div>
                              {a.description&&<div style={{color:T.textDim,fontSize:12,marginTop:3,fontStyle:"italic"}}>{a.description.slice(0,100)}{a.description.length>100?"...":""}</div>}
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
            {activites.length===0&&<EmptyState icon="📭" message="Aucune activité." />}
          </div>
        )}

        {!dataLoading && page === "rapports" && (
          <div>
            <PageHeader title="Rapport de biomasse" sub="Synthèse par entité" />
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:700 }}>
                  <thead>
                    <tr style={{ background:"#f3f2f2" }}>
                      {["Entité","Type","Ville","Sites","Biomasse","Cheptel","Matière (t)","Digestat (t)","Hectares","Phosphore","Act.","Docs"].map(h=>(
                        <th key={h} style={{padding:"10px 12px",color:T.textMuted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"left",borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entities.map((e,i)=>{
                      const eL=lieux.filter(l=>l.entity_id===e.id);
                      const tMat=eL.reduce((s,l)=>s+(Number(l.tonnage_matiere)||0),0);
                      const tDig=eL.reduce((s,l)=>s+(Number(l.tonnage_digestat)||0),0);
                      const tCheptel=eL.reduce((s,l)=>s+(Number(l.taille_cheptel)||0),0);
                      const tHect=eL.reduce((s,l)=>s+(Number(l.hectares)||0),0);
                      const tPhos=eL.reduce((s,l)=>s+(Number(l.capacite_phosphore)||0),0);
                      const bio=[...new Set(eL.flatMap(l=>l.type_biomasse||[]))].join(", ");
                      return (
                        <tr key={e.id} style={{background:i%2===0?T.surface:"#fafaf9",cursor:"pointer"}}
                          onMouseEnter={ev=>ev.currentTarget.style.background=T.accentBg}
                          onMouseLeave={ev=>ev.currentTarget.style.background=i%2===0?T.surface:"#fafaf9"}
                          onClick={()=>{setSelectedEntity(e);setPage("entities");}}>
                          <td style={{padding:"10px 12px",color:T.accent,fontWeight:600}}>{displayName(e)}</td>
                          <td style={{padding:"10px 12px"}}><Badge label={e.type} color={typeColor(e.type)}/></td>
                          <td style={{padding:"10px 12px",color:T.text}}>{e.adresse_ville||"—"}</td>
                          <td style={{padding:"10px 12px",color:T.text,textAlign:"center"}}>{eL.length}</td>
                          <td style={{padding:"10px 12px",color:T.text}}>{bio||"—"}</td>
                          <td style={{padding:"10px 12px",color:T.text,textAlign:"right"}}>{tCheptel?tCheptel.toLocaleString():"—"}</td>
                          <td style={{padding:"10px 12px",color:T.success,fontWeight:700,textAlign:"right"}}>{tMat?tMat.toLocaleString():"—"}</td>
                          <td style={{padding:"10px 12px",color:T.accent,textAlign:"right"}}>{tDig?tDig.toLocaleString():"—"}</td>
                          <td style={{padding:"10px 12px",color:T.text,textAlign:"right"}}>{tHect||"—"}</td>
                          <td style={{padding:"10px 12px",color:T.text,textAlign:"right"}}>{tPhos?tPhos.toLocaleString():"—"}</td>
                          <td style={{padding:"10px 12px",color:T.text,textAlign:"center"}}>{activites.filter(a=>a.entity_id===e.id).length}</td>
                          <td style={{padding:"10px 12px",color:T.text,textAlign:"center"}}>{documents.filter(d=>d.entity_id===e.id).length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{background:"#eaf5ea",borderTop:`2px solid ${T.success}`}}>
                      <td colSpan={6} style={{padding:"10px 12px",color:T.success,fontWeight:700}}>TOTAUX</td>
                      <td style={{padding:"10px 12px",color:T.success,fontWeight:900,textAlign:"right"}}>{lieux.reduce((s,l)=>s+(Number(l.tonnage_matiere)||0),0).toLocaleString()} t</td>
                      <td style={{padding:"10px 12px",color:T.accent,fontWeight:900,textAlign:"right"}}>{lieux.reduce((s,l)=>s+(Number(l.tonnage_digestat)||0),0).toLocaleString()} t</td>
                      <td colSpan={4}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:T.surface, borderTop:`1px solid ${T.border}`, display:"flex", zIndex:200, boxShadow:"0 -2px 8px rgba(0,0,0,0.1)" }}>
          {NAV.slice(0,5).map(n=>(
            <button key={n.id} onClick={()=>navigate(n.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"8px 0", background:"none", border:"none", color:page===n.id?T.accent:T.textDim, cursor:"pointer", gap:2, WebkitTapHighlightColor:"transparent" }}>
              <span style={{ fontSize:20 }}>{n.icon}</span>
              <span style={{ fontSize:10, fontWeight:page===n.id?700:400 }}>{n.label.slice(0,6)}</span>
            </button>
          ))}
        </div>
      )}

      {/* ENTITY FORM MODAL */}
      {showEntityForm && canEdit(role) && (
        <Modal title={editingEntity?"Modifier l'entité":"Nouvelle entité"} onClose={()=>{setShowEntityForm(false);setEditingEntity(null);}} wide>
          <EntityForm initial={editingEntity} onSave={row=>saveEntity(row,!editingEntity)} onClose={()=>{setShowEntityForm(false);setEditingEntity(null);}} />
        </Modal>
      )}
    </div>
  );
}
