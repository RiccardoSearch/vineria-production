import { useState, useEffect } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx8dPcjOZyTH4i-nljnYimnw8VdkaR5Yq6me0GpD6qVCEVHWt0W69pgbY2aFFrxF7orqg/exec";

const P = {
  bg: "#0f0e0c", surface: "#161412", card: "#1e1b16", cardHover: "#252118",
  border: "#2a2620", accent: "#c9a84c", accentDim: "#8a6e2f",
  text: "#f0e8d8", textMuted: "#6a6050", textSub: "#a09478",
  red: "#c94c4c", green: "#4cad6e", blue: "#4c84c9", purple: "#9b6dc9",
};

const STATUS = {
  "Da girare":   { color: P.textMuted, bg: "#232018", dot: "#6a6050" },
  "Girato":      { color: P.blue,      bg: "#141e30", dot: P.blue },
  "In montaggio":{ color: P.purple,    bg: "#1a1228", dot: P.purple },
  "Consegnato":  { color: P.green,     bg: "#0f2018", dot: P.green },
};

const CAT = {
  "Virale":      { color: P.red,    icon: "🔥" },
  "Estetico":    { color: P.accent, icon: "✨" },
  "Educational": { color: P.blue,   icon: "📚" },
  "Promo":       { color: P.green,  icon: "📣" },
};

const SESS = {
  "Serate Evento":     { color: P.purple, icon: "🌙" },
  "Shooting 16 Marzo": { color: P.accent, icon: "📸" },
  "Da pianificare":    { color: P.textMuted, icon: "⏳" },
};

// Reference Instagram dal documento originale
const REFS = {
  2: [
    { label: "Reference principale", url: "https://www.instagram.com/reel/DU2MwlfjNGy/" },
  ],
  3: [
    { label: "Reference How to Pair", url: "https://www.instagram.com/reel/DUdjfcTDG_k/" },
  ],
  8: [
    { label: "Reference Challenge colore", url: "https://www.instagram.com/reel/DQRoLU9Dz48/" },
    { label: "Reference Challenge 2", url: "https://www.instagram.com/reel/DU_UueFjjtc/" },
  ],
  9: [
    { label: "Reference Dialogo Sommelier", url: "https://www.instagram.com/p/DVEomcbjC-C/" },
  ],
  15: [
    { label: "Reference Time Progression", url: "https://www.instagram.com/reel/DOwJJdfDusG/" },
  ],
};

async function fetchAll() {
  const res = await fetch(`${SCRIPT_URL}?action=getAll`);
  const data = await res.json();
  return data.map(c => ({
    ...c,
    id: Number(c.id),
    comparse: c.comparse ? c.comparse.split(", ") : [],
    attrezzatura: c.attrezzatura ? c.attrezzatura.split(", ") : [],
    shotList: c.shotList ? c.shotList.split(" | ") : [],
  }));
}

async function saveStatus(id, status) {
  await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "updateStatus", id, status }),
  });
}

async function saveField(id, field, value) {
  await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "updateField", id, field, value }),
  });
}

function EditableField({ label, value, field, color, multiline, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(field, draft);
    setSaving(false);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === "Enter") handleSave();
    if (e.key === "Escape") { setDraft(value); setEditing(false); }
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ color: color || P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
        {!editing && (
          <button onClick={() => { setDraft(value); setEditing(true); }} style={{
            background: "none", border: `1px solid ${P.border}`, color: P.textMuted,
            fontSize: 10, padding: "2px 8px", borderRadius: 6, cursor: "pointer",
            fontWeight: 600, letterSpacing: "0.05em",
          }}>✏️ modifica</button>
        )}
      </div>
      {editing ? (
        <div>
          {multiline ? (
            <textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown}
              autoFocus rows={5}
              style={{ width: "100%", padding: "10px 12px", backgroundColor: "#1a1710", border: `1px solid ${P.accent}66`, borderRadius: 8, color: P.text, fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" }}
            />
          ) : (
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown}
              autoFocus
              style={{ width: "100%", padding: "8px 12px", backgroundColor: "#1a1710", border: `1px solid ${P.accent}66`, borderRadius: 8, color: P.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" }}
            />
          )}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: "5px 14px", backgroundColor: P.accent, color: "#000",
              border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700,
            }}>{saving ? "💾 salvataggio..." : "✓ Salva"}</button>
            <button onClick={() => { setDraft(value); setEditing(false); }} style={{
              padding: "5px 14px", backgroundColor: "transparent", color: P.textMuted,
              border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", fontSize: 11,
            }}>Annulla</button>
          </div>
        </div>
      ) : (
        <p style={{ color: P.textSub, fontSize: 13, lineHeight: 1.65, margin: 0, cursor: "text" }}
          onClick={() => { setDraft(value); setEditing(true); }}>
          {value || <span style={{ color: P.textMuted, fontStyle: "italic" }}>— vuoto, clicca per modificare</span>}
        </p>
      )}
    </div>
  );
}

const tag = (label, color, icon) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    backgroundColor: color + "1a", color, border: `1px solid ${color}33`,
    whiteSpace: "nowrap",
  }}>
    {icon && <span style={{ fontSize: 10 }}>{icon}</span>}{label}
  </span>
);

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS["Da girare"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}33`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function FilterBtn({ label, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      cursor: "pointer", border: "none", transition: "all 0.15s",
      backgroundColor: active ? (color || P.accent) : P.card,
      color: active ? (color ? "#fff" : "#000") : P.textSub,
      outline: active ? `1px solid ${color || P.accent}` : "none",
    }}>{label}</button>
  );
}

function Card({ c, onClick, selected }) {
  const cat = CAT[c.categoria] || { color: P.textMuted, icon: "" };
  const sess = SESS[c.sessione] || { color: P.textMuted, icon: "" };
  return (
    <div onClick={() => onClick(c)} style={{
      backgroundColor: selected ? "#231f18" : P.card,
      border: `1px solid ${selected ? P.accent : P.border}`,
      borderRadius: 10, padding: "12px 14px", cursor: "pointer",
      transition: "all 0.12s", marginBottom: 6,
      boxShadow: selected ? `0 0 0 1px ${P.accent}44` : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
        <span style={{ color: P.accentDim, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", paddingTop: 1 }}>
          #{String(c.id).padStart(2, "0")}
        </span>
        <StatusBadge status={c.status} />
      </div>
      <div style={{ color: P.text, fontWeight: 700, fontSize: 13, marginBottom: 8, lineHeight: 1.35 }}>{c.titolo}</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {tag(c.categoria, cat.color, cat.icon)}
        {tag(sess.icon + " " + c.sessione, sess.color)}
      </div>
    </div>
  );
}

function Sec({ title, content, color }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ color: color || P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{title}</div>
      {typeof content === "string"
        ? <p style={{ color: P.textSub, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{content}</p>
        : content}
    </div>
  );
}

function Detail({ c, onClose, onStatus, onField, saving, isMobile }) {
  const [tab, setTab] = useState("brief");

  useEffect(() => { setTab("brief"); }, [c?.id]);

  if (!c) return null;

  const cat = CAT[c.categoria] || { color: P.textMuted, icon: "" };
  const sess = SESS[c.sessione] || { color: P.textMuted, icon: "" };

  const panelStyle = isMobile ? {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: P.surface, overflowY: "auto", zIndex: 200, padding: "20px 16px",
  } : {
    flex: 1, overflowY: "auto", backgroundColor: P.surface,
    borderLeft: `1px solid ${P.border}`, padding: "24px 20px",
  };

  return (
    <div style={panelStyle}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ color: P.accentDim, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em" }}>
          CONTENUTO #{String(c.id).padStart(2, "0")}
        </span>
        <button onClick={onClose} style={{
          background: P.card, border: `1px solid ${P.border}`, color: P.textSub,
          cursor: "pointer", borderRadius: 8, width: 30, height: 30,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
        }}>✕</button>
      </div>

      <h2 style={{ color: P.text, fontSize: 16, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.3 }}>{c.titolo}</h2>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 20 }}>
        {tag(c.categoria, cat.color, cat.icon)}
        {tag(sess.icon + " " + c.sessione, sess.color)}
        {tag(c.format, P.textMuted)}
        {tag("👤 " + c.responsabile, P.textMuted)}
      </div>

      {/* Status */}
      <div style={{ backgroundColor: P.card, border: `1px solid ${P.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
        <div style={{ color: P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          STATUS
          {saving === c.id && <span style={{ color: P.accent, fontSize: 10, fontWeight: 600 }}>💾 salvataggio su Sheet...</span>}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.keys(STATUS).map(s => {
            const cfg = STATUS[s];
            const active = c.status === s;
            return (
              <button key={s} onClick={() => onStatus(c.id, s)} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                backgroundColor: active ? cfg.bg : "transparent",
                color: active ? cfg.color : P.textMuted,
                border: `1px solid ${active ? cfg.dot + "66" : P.border}`,
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                {active && <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: cfg.dot }} />}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${P.border}`, marginBottom: 18 }}>
        {["brief", "shot list", "montaggio"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 14px", background: "none", border: "none", cursor: "pointer",
            color: tab === t ? P.accent : P.textMuted,
            borderBottom: `2px solid ${tab === t ? P.accent : "transparent"}`,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
          }}>{t}</button>
        ))}
      </div>

      {tab === "brief" && <>
        <EditableField label="🎣 Hook" value={c.hook} field="hook" color={P.red} multiline={false} onSave={(f, v) => onField(c.id, f, v)} />
        <EditableField label="📝 Script" value={c.script} field="script" multiline={true} onSave={(f, v) => onField(c.id, f, v)} />
        <Sec title="👥 Comparse" content={(Array.isArray(c.comparse) ? c.comparse : [c.comparse]).join(", ")} />
        <Sec title="🔧 Attrezzatura" content={
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {(Array.isArray(c.attrezzatura) ? c.attrezzatura : [c.attrezzatura]).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: P.accent, flexShrink: 0 }} />
                <span style={{ color: P.textSub, fontSize: 13 }}>{a}</span>
              </div>
            ))}
          </div>
        } />
        <EditableField label="📣 CTA" value={c.cta} field="cta" color={P.green} multiline={false} onSave={(f, v) => onField(c.id, f, v)} />
        {REFS[c.id] && (
          <Sec title="🔗 Reference Instagram" content={
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {REFS[c.id].map((ref, i) => (
                <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  backgroundColor: "#1a1510", border: `1px solid ${P.accent}44`,
                  color: P.accent, textDecoration: "none",
                }}>
                  <span>📸</span><span>{ref.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: P.accentDim }}>↗</span>
                </a>
              ))}
            </div>
          } color={P.accent} />
        )}
      </>}

      {tab === "shot list" && (
        <div>
          {(Array.isArray(c.shotList) ? c.shotList : [c.shotList]).map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${P.border}` }}>
              <span style={{
                minWidth: 26, height: 26, borderRadius: "50%",
                backgroundColor: P.accent + "1a", color: P.accent,
                fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0, border: `1px solid ${P.accent}33`,
              }}>{i + 1}</span>
              <span style={{ color: P.textSub, fontSize: 13, lineHeight: 1.55, paddingTop: 4 }}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "montaggio" && (
        <div style={{ backgroundColor: P.card, border: `1px solid ${P.purple}33`, borderRadius: 10, padding: "14px 16px" }}>
          <EditableField label="🎞 Note per Mish" value={c.noteMontaggio} field="noteMontaggio" color={P.purple} multiline={true} onSave={(f, v) => onField(c.id, f, v)} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [contenuti, setContenuti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filterCat, setFilterCat] = useState("Tutti");
  const [filterSess, setFilterSess] = useState("Tutti");
  const [filterStatus, setFilterStatus] = useState("Tutti");
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    fetchAll()
      .then(data => { setContenuti(data); setLoading(false); })
      .catch(() => { setError("Errore nel caricare i dati."); setLoading(false); });
  }, []);

  const handleStatus = async (id, status) => {
    setContenuti(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    setSaving(id);
    try { await saveStatus(id, status); } catch (e) { console.error(e); }
    setSaving(null);
  };

  const handleField = async (id, field, value) => {
    setContenuti(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    setSelected(prev => prev?.id === id ? { ...prev, [field]: value } : prev);
    try { await saveField(id, field, value); } catch (e) { console.error(e); }
  };

  const filtered = contenuti.filter(c => {
    if (filterCat !== "Tutti" && c.categoria !== filterCat) return false;
    if (filterSess !== "Tutti" && c.sessione !== filterSess) return false;
    if (filterStatus !== "Tutti" && c.status !== filterStatus) return false;
    if (search && !c.titolo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const consegnati = contenuti.filter(c => c.status === "Consegnato").length;

  if (loading) return (
    <div style={{ backgroundColor: P.bg, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", gap: 12 }}>
      <div style={{ fontSize: 36 }}>🍷</div>
      <div style={{ color: P.accent, fontSize: 12, letterSpacing: "0.14em", fontWeight: 600 }}>CARICAMENTO...</div>
      <div style={{ color: P.textMuted, fontSize: 11 }}>Connessione a Google Sheets</div>
    </div>
  );

  if (error) return (
    <div style={{ backgroundColor: P.bg, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", gap: 16 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ color: P.red, fontSize: 13 }}>{error}</div>
      <button onClick={() => { setLoading(true); setError(null); fetchAll().then(d => { setContenuti(d); setLoading(false); }).catch(() => { setError("Errore. Riprova."); setLoading(false); }); }}
        style={{ padding: "8px 20px", backgroundColor: P.accent, color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
        Riprova
      </button>
    </div>
  );

  const showDetail = selected && !isMobile;
  const showMobileDetail = selected && isMobile;

  return (
    <div style={{ backgroundColor: P.bg, height: "100vh", display: "flex", flexDirection: "column", fontFamily: "Georgia, serif", color: P.text, overflow: "hidden" }}>

      {/* HEADER */}
      <div style={{ padding: isMobile ? "14px 16px 10px" : "16px 24px 12px", borderBottom: `1px solid ${P.border}`, background: `linear-gradient(180deg, #181510 0%, ${P.bg} 100%)`, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ color: P.accentDim, fontSize: 9, letterSpacing: "0.2em", fontWeight: 800, marginBottom: 2 }}>PRODUZIONE CONTENUTI</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 800, letterSpacing: "-0.02em" }}>VINERIA 🍷</div>
          </div>
          <div style={{ display: "flex", gap: isMobile ? 12 : 20, alignItems: "center" }}>
            {Object.entries(SESS).map(([sess, cfg]) => (
              <div key={sess} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{contenuti.filter(c => c.sessione === sess).length}</div>
                <div style={{ fontSize: 8, color: P.textMuted, letterSpacing: "0.05em", marginTop: 2 }}>
                  {sess === "Shooting 16 Marzo" ? "16 MAR" : sess === "Serate Evento" ? "SERATE" : "TBD"}
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", paddingLeft: isMobile ? 8 : 14, borderLeft: `1px solid ${P.border}` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: P.green, lineHeight: 1 }}>{consegnati}/{contenuti.length}</div>
              <div style={{ fontSize: 8, color: P.textMuted, letterSpacing: "0.05em", marginTop: 2 }}>DONE</div>
            </div>
          </div>
        </div>

        {/* Categoria pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(CAT).map(([cat, cfg]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, fontSize: 10, backgroundColor: cfg.color + "14", border: `1px solid ${cfg.color}28` }}>
              <span>{cfg.icon}</span>
              <span style={{ color: cfg.color, fontWeight: 700 }}>{contenuti.filter(c => c.categoria === cat).length}</span>
              {!isMobile && <span style={{ color: P.textMuted }}>{cat}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ padding: isMobile ? "10px 16px" : "10px 24px", borderBottom: `1px solid ${P.border}`, backgroundColor: P.surface, flexShrink: 0, overflowX: "auto" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cerca..."
          style={{ width: "100%", padding: "7px 12px", backgroundColor: P.card, border: `1px solid ${P.border}`, borderRadius: 8, color: P.text, fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
          {["Tutti", ...Object.keys(CAT)].map(f => (
            <FilterBtn key={f} label={f === "Tutti" ? "Tutte categorie" : (CAT[f]?.icon + " " + f)} active={filterCat === f} color={CAT[f]?.color} onClick={() => setFilterCat(f)} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["Tutti", ...Object.keys(SESS)].map(f => (
            <FilterBtn key={f} label={f === "Tutti" ? "Tutte sessioni" : (SESS[f].icon + " " + f)} active={filterSess === f} color={SESS[f]?.color} onClick={() => setFilterSess(f)} />
          ))}
          {Object.keys(STATUS).map(f => (
            <FilterBtn key={f} label={f} active={filterStatus === f} color={STATUS[f].dot} onClick={() => setFilterStatus(filterStatus === f ? "Tutti" : f)} />
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Lista */}
        <div style={{
          width: showDetail ? (isMobile ? "100%" : "360px") : "100%",
          flexShrink: 0, overflowY: "auto", padding: isMobile ? "12px" : "16px",
          display: showMobileDetail ? "none" : "block",
        }}>
          <div style={{ color: P.textMuted, fontSize: 11, marginBottom: 10, paddingLeft: 2 }}>
            {filtered.length} contenuti
          </div>
          {filtered.map(c => <Card key={c.id} c={c} onClick={setSelected} selected={selected?.id === c.id} />)}
        </div>

        {showDetail && (
          <Detail c={selected} onClose={() => setSelected(null)} onStatus={handleStatus} onField={handleField} saving={saving} isMobile={false} />
        )}

        {showMobileDetail && (
          <Detail c={selected} onClose={() => setSelected(null)} onStatus={handleStatus} onField={handleField} saving={saving} isMobile={true} />
        )}
      </div>
    </div>
  );
}
