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
