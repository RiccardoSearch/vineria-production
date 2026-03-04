import { useState, useEffect, useRef } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwP0h-3mkt8_L9IAq7bkzFkjIsyFaEVQTP9KPnFKlgVLtYVIwAzn7oNNzIhCJTRp-Ziag/exec";
const PASSWORD = "vineria2024";

const P = {
  bg: "#0f0e0c", surface: "#161412", card: "#1e1b16",
  border: "#2a2620", accent: "#c9a84c", accentDim: "#8a6e2f",
  text: "#f0e8d8", textMuted: "#6a6050", textSub: "#a09478",
  red: "#c94c4c", green: "#4cad6e", blue: "#4c84c9", purple: "#9b6dc9",
  orange: "#c97c4c",
};

const DEFAULT_STATUSES = ["Da girare", "Girato", "In montaggio", "Consegnato"];
const DEFAULT_CATS = ["Virale", "Estetico", "Educational", "Promo"];
const DEFAULT_SESSIONS = ["Serate Evento", "Shooting 16 Marzo", "Da pianificare"];
const STATUS_COLORS = { "Da girare": P.textMuted, "Girato": P.blue, "In montaggio": P.purple, "Consegnato": P.green };
const CAT_ICONS = { "Virale": "🔥", "Estetico": "✨", "Educational": "📚", "Promo": "📣" };
const SESS_ICONS = { "Serate Evento": "🌙", "Shooting 16 Marzo": "📸", "Da pianificare": "⏳" };

const REFS = {
  2: [{ label: "Reference principale", url: "https://www.instagram.com/reel/DU2MwlfjNGy/" }],
  3: [{ label: "Reference How to Pair", url: "https://www.instagram.com/reel/DUdjfcTDG_k/" }],
  8: [{ label: "Reference Challenge colore", url: "https://www.instagram.com/reel/DQRoLU9Dz48/" }, { label: "Reference Challenge 2", url: "https://www.instagram.com/reel/DU_UueFjjtc/" }],
  9: [{ label: "Reference Dialogo Sommelier", url: "https://www.instagram.com/p/DVEomcbjC-C/" }],
  15: [{ label: "Reference Time Progression", url: "https://www.instagram.com/reel/DOwJJdfDusG/" }],
};

// ── API ──────────────────────────────────────────────────────────────
async function fetchAll() {
  const res = await fetch(`${SCRIPT_URL}?action=getAll`);
  const data = await res.json();
  return data.map(c => ({
    ...c,
    id: Number(c.id),
    comparse: c.comparse ? c.comparse.split(", ") : [],
    attrezzatura: c.attrezzatura ? c.attrezzatura.split(", ") : [],
    shotList: c.shotList ? c.shotList.split(" | ") : [],
    tags: c.tags ? c.tags.split(", ") : [],
    mediaLinks: c.mediaLinks ? c.mediaLinks.split(" | ") : [],
    referenze: c.referenze ? c.referenze.split(" | ") : [],
  }));
}

async function apiPost(body) {
  await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(body) });
}

// ── SMALL COMPONENTS ─────────────────────────────────────────────────
const Tag = ({ label, color, icon, onRemove }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: (color || P.textMuted) + "1a", color: color || P.textMuted, border: `1px solid ${(color || P.textMuted)}33` }}>
    {icon && <span style={{ fontSize: 10 }}>{icon}</span>}{label}
    {onRemove && <span onClick={onRemove} style={{ cursor: "pointer", marginLeft: 2, opacity: 0.6, fontSize: 10 }}>✕</span>}
  </span>
);

const Btn = ({ children, onClick, color, small, outline, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: small ? "4px 10px" : "7px 16px", borderRadius: 8, fontSize: small ? 11 : 12,
    fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", border: "none",
    backgroundColor: outline ? "transparent" : (color || P.accent),
    color: outline ? (color || P.textMuted) : (color ? "#fff" : "#000"),
    outline: outline ? `1px solid ${color || P.border}` : "none",
    opacity: disabled ? 0.5 : 1, transition: "all 0.15s",
  }}>{children}</button>
);

// ── EDITABLE FIELD ────────────────────────────────────────────────────
function EditField({ label, value, field, color, multiline, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);

  const doSave = async () => {
    setSaving(true);
    await onSave(field, draft);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ color: color || P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
        {!editing && <button onClick={() => { setDraft(value || ""); setEditing(true); }} style={{ background: "none", border: `1px solid ${P.border}`, color: P.textMuted, fontSize: 10, padding: "2px 8px", borderRadius: 6, cursor: "pointer" }}>✏️</button>}
      </div>
      {editing ? (
        <div>
          {multiline
            ? <textarea value={draft} onChange={e => setDraft(e.target.value)} autoFocus rows={4}
                style={{ width: "100%", padding: "9px 12px", backgroundColor: "#1a1710", border: `1px solid ${P.accent}66`, borderRadius: 8, color: P.text, fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
            : <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && doSave()} autoFocus
                style={{ width: "100%", padding: "8px 12px", backgroundColor: "#1a1710", border: `1px solid ${P.accent}66`, borderRadius: 8, color: P.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
          }
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <Btn onClick={doSave} disabled={saving} small>{saving ? "💾..." : "✓ Salva"}</Btn>
            <Btn onClick={() => setEditing(false)} small outline>Annulla</Btn>
          </div>
        </div>
      ) : (
        <p onClick={() => { setDraft(value || ""); setEditing(true); }}
          style={{ color: value ? P.textSub : P.textMuted, fontSize: 13, lineHeight: 1.65, margin: 0, cursor: "text", fontStyle: value ? "normal" : "italic" }}>
          {value || "— clicca per aggiungere"}
        </p>
      )}
    </div>
  );
}

// ── EDITABLE LIST (comparse, attrezzatura, shot list, tags, media, ref) ──
function EditList({ label, items, field, color, icon, placeholder, onSave }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const list = Array.isArray(items) ? items : (items ? [items] : []);

  const doAdd = async () => {
    if (!draft.trim()) return;
    const newList = [...list, draft.trim()];
    setSaving(true);
    await onSave(field, newList.join(field === "shotList" ? " | " : ", "));
    setSaving(false);
    setDraft("");
    setAdding(false);
  };

  const doRemove = async (i) => {
    const newList = list.filter((_, idx) => idx !== i);
    await onSave(field, newList.join(field === "shotList" ? " | " : ", "));
  };

  const isLink = field === "mediaLinks" || field === "referenze";

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ color: color || P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
        <button onClick={() => setAdding(!adding)} style={{ background: "none", border: `1px solid ${P.border}`, color: P.textMuted, fontSize: 10, padding: "2px 8px", borderRadius: 6, cursor: "pointer" }}>+ aggiungi</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: field === "shotList" ? 0 : 6 }}>
        {list.map((item, i) => (
          field === "shotList" ? (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid ${P.border}` }}>
              <span style={{ minWidth: 22, height: 22, borderRadius: "50%", backgroundColor: P.accent + "1a", color: P.accent, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
              <span style={{ color: P.textSub, fontSize: 13, lineHeight: 1.5, flex: 1 }}>{item}</span>
              <span onClick={() => doRemove(i)} style={{ color: P.textMuted, cursor: "pointer", fontSize: 11, flexShrink: 0 }}>✕</span>
            </div>
          ) : isLink ? (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", backgroundColor: P.card, borderRadius: 8, border: `1px solid ${P.border}` }}>
              <span style={{ fontSize: 12 }}>{field === "mediaLinks" ? "🎬" : "📸"}</span>
              <a href={item.startsWith("http") ? item : "#"} target="_blank" rel="noopener noreferrer"
                style={{ color: P.accent, fontSize: 12, textDecoration: "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item}</a>
              <span onClick={() => doRemove(i)} style={{ color: P.textMuted, cursor: "pointer", fontSize: 11 }}>✕</span>
            </div>
          ) : (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
              {icon && <span style={{ fontSize: 10 }}>{icon}</span>}
              <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: color || P.accent, flexShrink: 0 }} />
              <span style={{ color: P.textSub, fontSize: 13, flex: 1 }}>{item}</span>
              <span onClick={() => doRemove(i)} style={{ color: P.textMuted, cursor: "pointer", fontSize: 11 }}>✕</span>
            </div>
          )
        ))}
      </div>

      {adding && (
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          <input value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doAdd()}
            placeholder={placeholder || "Aggiungi..."}
            autoFocus
            style={{ flex: 1, padding: "7px 10px", backgroundColor: "#1a1710", border: `1px solid ${P.accent}66`, borderRadius: 8, color: P.text, fontSize: 12, outline: "none", fontFamily: "Georgia, serif" }} />
          <Btn onClick={doAdd} disabled={saving} small>{saving ? "..." : "✓"}</Btn>
          <Btn onClick={() => { setAdding(false); setDraft(""); }} small outline>✕</Btn>
        </div>
      )}
    </div>
  );
}

// ── PASSWORD SCREEN ───────────────────────────────────────────────────
function PasswordScreen({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const check = () => {
    if (pw === PASSWORD) onUnlock();
    else { setError(true); setTimeout(() => setError(false), 1500); }
  };

  return (
    <div style={{ backgroundColor: P.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center", maxWidth: 320, padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🍷</div>
        <div style={{ color: P.accent, fontSize: 11, letterSpacing: "0.2em", fontWeight: 800, marginBottom: 4 }}>VINERIA</div>
        <div style={{ color: P.textMuted, fontSize: 12, marginBottom: 28 }}>Production Dashboard</div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Password..."
          style={{ width: "100%", padding: "10px 14px", backgroundColor: P.card, border: `1px solid ${error ? P.red : P.border}`, borderRadius: 10, color: P.text, fontSize: 14, outline: "none", boxSizing: "border-box", textAlign: "center", fontFamily: "Georgia, serif", marginBottom: 12, transition: "border 0.2s" }} />
        <Btn onClick={check} color={P.accent}>Entra</Btn>
        {error && <div style={{ color: P.red, fontSize: 12, marginTop: 10 }}>Password errata</div>}
      </div>
    </div>
  );
}

// ── NEW CONTENT MODAL ─────────────────────────────────────────────────
function NewContentModal({ onClose, onSave, categories, sessions }) {
  const [form, setForm] = useState({
    titolo: "", categoria: categories[0] || "Virale",
    sessione: sessions[0] || "Shooting 16 Marzo",
    format: "Singolo", responsabile: "Mish",
    hook: "", script: "", cta: "", noteMontaggio: "",
    comparse: "", attrezzatura: "", shotList: "", tags: "",
  });
  const [saving, setSaving] = useState(false);

  const field = (k) => ({
    value: form[k],
    onChange: e => setForm(p => ({ ...p, [k]: e.target.value })),
    style: { width: "100%", padding: "8px 10px", backgroundColor: "#1a1710", border: `1px solid ${P.border}`, borderRadius: 8, color: P.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif", marginBottom: 10 }
  });

  const select = (k, opts) => (
    <select {...field(k)} style={{ ...field(k).style, cursor: "pointer" }}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const doSave = async () => {
    if (!form.titolo.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ backgroundColor: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ color: P.accent, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>NUOVO CONTENUTO</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: P.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        <div style={{ color: P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 4 }}>TITOLO *</div>
        <input {...field("titolo")} placeholder="Es: BLIND TASTING CHALLENGE" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ color: P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 4 }}>CATEGORIA</div>
            {select("categoria", categories)}
          </div>
          <div>
            <div style={{ color: P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 4 }}>SESSIONE</div>
            {select("sessione", sessions)}
          </div>
          <div>
            <div style={{ color: P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 4 }}>FORMAT</div>
            {select("format", ["Singolo", "Serializzabile"])}
          </div>
          <div>
            <div style={{ color: P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 4 }}>RESPONSABILE</div>
            <input {...field("responsabile")} placeholder="Es: Mish" />
          </div>
        </div>

        {[["HOOK", "hook", false], ["SCRIPT", "script", true], ["CTA", "cta", false], ["COMPARSE (separate da virgola)", "comparse", false], ["ATTREZZATURA (separata da virgola)", "attrezzatura", false], ["SHOT LIST (separata da |)", "shotList", false], ["TAG (separati da virgola)", "tags", false], ["NOTE MONTAGGIO", "noteMontaggio", true]].map(([lbl, key, multi]) => (
          <div key={key}>
            <div style={{ color: P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 4 }}>{lbl}</div>
            {multi
              ? <textarea {...field(key)} rows={3} style={{ ...field(key).style, resize: "vertical" }} />
              : <input {...field(key)} />}
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Btn onClick={doSave} disabled={saving || !form.titolo.trim()}>{saving ? "💾 Salvataggio..." : "✓ Crea contenuto"}</Btn>
          <Btn onClick={onClose} outline>Annulla</Btn>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS MODAL ────────────────────────────────────────────────────
function SettingsModal({ categories, sessions, operators, onClose, onUpdate }) {
  const [cats, setCats] = useState([...categories]);
  const [sess, setSess] = useState([...sessions]);
  const [ops, setOps] = useState([...operators]);
  const [newCat, setNewCat] = useState("");
  const [newSess, setNewSess] = useState("");
  const [newOp, setNewOp] = useState("");

  const save = () => { onUpdate({ categories: cats, sessions: sess, operators: ops }); onClose(); };

  const ListEditor = ({ title, items, setItems, newVal, setNewVal, color }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ color: color || P.accent, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {items.map((item, i) => (
          <Tag key={i} label={item} color={color}
            onRemove={DEFAULT_CATS.includes(item) || DEFAULT_SESSIONS.includes(item) ? null : () => setItems(items.filter((_, idx) => idx !== i))} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={newVal} onChange={e => setNewVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && newVal.trim()) { setItems([...items, newVal.trim()]); setNewVal(""); } }}
          placeholder="Aggiungi nuovo..."
          style={{ flex: 1, padding: "7px 10px", backgroundColor: P.card, border: `1px solid ${P.border}`, borderRadius: 8, color: P.text, fontSize: 12, outline: "none", fontFamily: "Georgia, serif" }} />
        <Btn small onClick={() => { if (newVal.trim()) { setItems([...items, newVal.trim()]); setNewVal(""); } }}>+ Aggiungi</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ backgroundColor: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ color: P.accent, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>⚙️ IMPOSTAZIONI</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: P.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <ListEditor title="CATEGORIE" items={cats} setItems={setCats} newVal={newCat} setNewVal={setNewCat} color={P.red} />
        <ListEditor title="SESSIONI DI SHOOTING" items={sess} setItems={setSess} newVal={newSess} setNewVal={setNewSess} color={P.accent} />
        <ListEditor title="OPERATORI / TEAM" items={ops} setItems={setOps} newVal={newOp} setNewVal={setNewOp} color={P.blue} />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={save}>✓ Salva impostazioni</Btn>
          <Btn onClick={onClose} outline>Annulla</Btn>
        </div>
      </div>
    </div>
  );
}

// ── DETAIL PANEL ──────────────────────────────────────────────────────
function Detail({ c, onClose, onStatus, onField, onDelete, saving, isMobile, categories, sessions, operators }) {
  const [tab, setTab] = useState("brief");
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { setTab("brief"); setConfirmDelete(false); }, [c?.id]);
  if (!c) return null;

  const catColor = c.categoria === "Virale" ? P.red : c.categoria === "Estetico" ? P.accent : c.categoria === "Educational" ? P.blue : P.green;
  const sessColor = c.sessione === "Serate Evento" ? P.purple : c.sessione === "Shooting 16 Marzo" ? P.accent : P.textMuted;
  const stCfg = { color: STATUS_COLORS[c.status] || P.textMuted, bg: "#1a1714" };

  const panelStyle = isMobile
    ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: P.surface, overflowY: "auto", zIndex: 200, padding: "20px 16px" }
    : { flex: 1, overflowY: "auto", backgroundColor: P.surface, borderLeft: `1px solid ${P.border}`, padding: "24px 20px" };

  const save = (field, val) => onField(c.id, field, val);

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: P.accentDim, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em" }}>#{String(c.id).padStart(2, "0")}</span>
        <div style={{ display: "flex", gap: 8 }}>
          {confirmDelete
            ? <>
                <Btn small color={P.red} onClick={() => { onDelete(c.id); onClose(); }}>Conferma elimina</Btn>
                <Btn small outline onClick={() => setConfirmDelete(false)}>Annulla</Btn>
              </>
            : <button onClick={() => setConfirmDelete(true)} style={{ background: "none", border: `1px solid ${P.border}`, color: P.textMuted, fontSize: 10, padding: "3px 10px", borderRadius: 6, cursor: "pointer" }}>🗑️ elimina</button>
          }
          <button onClick={onClose} style={{ background: P.card, border: `1px solid ${P.border}`, color: P.textSub, cursor: "pointer", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✕</button>
        </div>
      </div>

      {/* Titolo editabile */}
      <EditField label="Titolo" value={c.titolo} field="titolo" color={P.accent} multiline={false} onSave={save} />

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
        <Tag label={c.categoria} color={catColor} icon={CAT_ICONS[c.categoria] || "📌"} />
        <Tag label={c.sessione} color={sessColor} icon={SESS_ICONS[c.sessione] || "📅"} />
        <Tag label={c.format} color={P.textMuted} />
        <Tag label={"👤 " + c.responsabile} color={P.textMuted} />
      </div>

      {/* Categoria / Sessione / Responsabile selezionabili */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[["Categoria", "categoria", categories], ["Sessione", "sessione", sessions], ["Responsabile", "responsabile", operators]].map(([lbl, field, opts]) => (
          <div key={field}>
            <div style={{ color: P.textMuted, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 4 }}>{lbl.toUpperCase()}</div>
            <select value={c[field] || ""} onChange={e => save(field, e.target.value)}
              style={{ width: "100%", padding: "5px 8px", backgroundColor: P.card, border: `1px solid ${P.border}`, borderRadius: 8, color: P.text, fontSize: 12, outline: "none", cursor: "pointer" }}>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Status */}
      <div style={{ backgroundColor: P.card, border: `1px solid ${P.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
        <div style={{ color: P.textMuted, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          STATUS {saving === c.id && <span style={{ color: P.accent, fontSize: 10 }}>💾 salvataggio...</span>}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DEFAULT_STATUSES.map(s => {
            const active = c.status === s;
            const col = STATUS_COLORS[s] || P.textMuted;
            return (
              <button key={s} onClick={() => onStatus(c.id, s)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", backgroundColor: active ? col + "22" : "transparent", color: active ? col : P.textMuted, border: `1px solid ${active ? col + "66" : P.border}`, display: "inline-flex", alignItems: "center", gap: 5 }}>
                {active && <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: col }} />}{s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${P.border}`, marginBottom: 18 }}>
        {["brief", "shot list", "media", "montaggio"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 12px", background: "none", border: "none", cursor: "pointer", color: tab === t ? P.accent : P.textMuted, borderBottom: `2px solid ${tab === t ? P.accent : "transparent"}`, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t}</button>
        ))}
      </div>

      {tab === "brief" && <>
        <EditField label="🎣 Hook" value={c.hook} field="hook" color={P.red} multiline={false} onSave={save} />
        <EditField label="📝 Script" value={c.script} field="script" multiline={true} onSave={save} />
        <EditList label="👥 Comparse" items={c.comparse} field="comparse" color={P.blue} placeholder="Es: Christian" onSave={save} />
        <EditList label="🔧 Attrezzatura" items={c.attrezzatura} field="attrezzatura" color={P.accent} placeholder="Es: Camera macro" onSave={save} />
        <EditList label="🏷️ Tag" items={c.tags} field="tags" color={P.purple} placeholder="Es: #winetok" onSave={save} />
        <EditField label="📣 CTA" value={c.cta} field="cta" color={P.green} multiline={false} onSave={save} />
        {/* Reference Instagram originali */}
        {REFS[c.id] && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ color: P.accent, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>🔗 REFERENCE INSTAGRAM</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {REFS[c.id].map((ref, i) => (
                <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, backgroundColor: "#1a1510", border: `1px solid ${P.accent}44`, color: P.accent, textDecoration: "none" }}>
                  <span>📸</span><span>{ref.label}</span><span style={{ marginLeft: "auto", fontSize: 10 }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        )}
        <EditList label="🔗 Referenze aggiuntive (URL)" items={c.referenze} field="referenze" color={P.accent} placeholder="https://instagram.com/reel/..." onSave={save} />
      </>}

      {tab === "shot list" && (
        <EditList label="📋 Shot List" items={c.shotList} field="shotList" color={P.accent} placeholder="Es: Close-up bottiglia" onSave={save} />
      )}

      {tab === "media" && <>
        <div style={{ color: P.textMuted, fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
          Aggiungi link a foto/video su Google Drive, Dropbox o qualsiasi altro servizio cloud.
        </div>
        <EditList label="🎬 Link Media (foto / video)" items={c.mediaLinks} field="mediaLinks" color={P.blue} placeholder="https://drive.google.com/..." onSave={save} />
      </>}

      {tab === "montaggio" && (
        <div style={{ backgroundColor: P.card, border: `1px solid ${P.purple}33`, borderRadius: 10, padding: "14px 16px" }}>
          <EditField label="🎞 Note per Mish" value={c.noteMontaggio} field="noteMontaggio" color={P.purple} multiline={true} onSave={save} />
        </div>
      )}
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────
function Card({ c, onClick, selected }) {
  const catColor = c.categoria === "Virale" ? P.red : c.categoria === "Estetico" ? P.accent : c.categoria === "Educational" ? P.blue : P.green;
  const sessColor = c.sessione === "Serate Evento" ? P.purple : c.sessione === "Shooting 16 Marzo" ? P.accent : P.textMuted;
  const stColor = STATUS_COLORS[c.status] || P.textMuted;
  return (
    <div onClick={() => onClick(c)} style={{ backgroundColor: selected ? "#231f18" : P.card, border: `1px solid ${selected ? P.accent : P.border}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", transition: "all 0.12s", marginBottom: 6, boxShadow: selected ? `0 0 0 1px ${P.accent}44` : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ color: P.accentDim, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>#{String(c.id).padStart(2, "0")}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, backgroundColor: stColor + "1a", color: stColor, border: `1px solid ${stColor}33` }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: stColor }} />{c.status}
        </span>
      </div>
      <div style={{ color: P.text, fontWeight: 700, fontSize: 13, marginBottom: 8, lineHeight: 1.35 }}>{c.titolo}</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        <Tag label={c.categoria} color={catColor} icon={CAT_ICONS[c.categoria] || "📌"} />
        <Tag label={(SESS_ICONS[c.sessione] || "📅") + " " + c.sessione} color={sessColor} />
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(false);
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
  const [showNew, setShowNew] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATS);
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS);
  const [operators, setOperators] = useState(["Mish", "Riccardo", "Christian", "Andrea", "Alessio"]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!auth) return;
    fetchAll()
      .then(data => { setContenuti(data); setLoading(false); })
      .catch(() => { setError("Errore nel caricare i dati."); setLoading(false); });
  }, [auth]);

  const handleStatus = async (id, status) => {
    setContenuti(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    setSaving(id);
    try { await apiPost({ action: "updateStatus", id, status }); } catch (e) { console.error(e); }
    setSaving(null);
  };

  const handleField = async (id, field, value) => {
    setContenuti(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    setSelected(prev => prev?.id === id ? { ...prev, [field]: value } : prev);
    try { await apiPost({ action: "updateField", id, field, value }); } catch (e) { console.error(e); }
  };

  const handleNew = async (form) => {
    const newId = Math.max(...contenuti.map(c => c.id), 0) + 1;
    const newC = {
      ...form, id: newId, status: "Da girare",
      comparse: form.comparse ? form.comparse.split(", ") : [],
      attrezzatura: form.attrezzatura ? form.attrezzatura.split(", ") : [],
      shotList: form.shotList ? form.shotList.split(" | ") : [],
      tags: form.tags ? form.tags.split(", ") : [],
      mediaLinks: [], referenze: [],
    };
    setContenuti(prev => [...prev, newC]);
    try { await apiPost({ action: "addContent", content: { ...form, id: newId, status: "Da girare" } }); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    setContenuti(prev => prev.filter(c => c.id !== id));
    try { await apiPost({ action: "deleteContent", id }); } catch (e) { console.error(e); }
  };

  const handleSettings = ({ categories: cats, sessions: sess, operators: ops }) => {
    setCategories(cats); setSessions(sess); setOperators(ops);
  };

  const filtered = contenuti.filter(c => {
    if (filterCat !== "Tutti" && c.categoria !== filterCat) return false;
    if (filterSess !== "Tutti" && c.sessione !== filterSess) return false;
    if (filterStatus !== "Tutti" && c.status !== filterStatus) return false;
    if (search && !c.titolo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const consegnati = contenuti.filter(c => c.status === "Consegnato").length;

  if (!auth) return <PasswordScreen onUnlock={() => setAuth(true)} />;

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
      <Btn onClick={() => { setLoading(true); setError(null); fetchAll().then(d => { setContenuti(d); setLoading(false); }).catch(() => { setError("Errore. Riprova."); setLoading(false); }); }}>Riprova</Btn>
    </div>
  );

  const showDetail = selected && !isMobile;
  const showMobileDetail = selected && isMobile;

  return (
    <div style={{ backgroundColor: P.bg, height: "100vh", display: "flex", flexDirection: "column", fontFamily: "Georgia, serif", color: P.text, overflow: "hidden" }}>

      {/* HEADER */}
      <div style={{ padding: isMobile ? "12px 14px 10px" : "14px 22px 10px", borderBottom: `1px solid ${P.border}`, background: "linear-gradient(180deg,#181510 0%,#0f0e0c 100%)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ color: P.accentDim, fontSize: 9, letterSpacing: "0.2em", fontWeight: 800, marginBottom: 2 }}>PRODUZIONE CONTENUTI</div>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, letterSpacing: "-0.02em" }}>VINERIA 🍷</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: isMobile ? 10 : 16 }}>
              {sessions.map(sess => (
                <div key={sess} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: sess === "Serate Evento" ? P.purple : sess === "Shooting 16 Marzo" ? P.accent : P.textMuted, lineHeight: 1 }}>{contenuti.filter(c => c.sessione === sess).length}</div>
                  <div style={{ fontSize: 8, color: P.textMuted, letterSpacing: "0.04em", marginTop: 2 }}>{sess.replace("Shooting ", "").replace(" Evento", "").replace("Da pianificare", "TBD").toUpperCase().substring(0, 6)}</div>
                </div>
              ))}
              <div style={{ textAlign: "center", paddingLeft: 10, borderLeft: `1px solid ${P.border}` }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: P.green, lineHeight: 1 }}>{consegnati}/{contenuti.length}</div>
                <div style={{ fontSize: 8, color: P.textMuted, letterSpacing: "0.04em", marginTop: 2 }}>DONE</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
              <Btn small onClick={() => setShowNew(true)} color={P.accent}>+ Nuovo</Btn>
              <button onClick={() => setShowSettings(true)} style={{ background: P.card, border: `1px solid ${P.border}`, color: P.textMuted, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 13 }}>⚙️</button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {categories.map(cat => {
            const color = cat === "Virale" ? P.red : cat === "Estetico" ? P.accent : cat === "Educational" ? P.blue : cat === "Promo" ? P.green : P.orange;
            return (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, fontSize: 10, backgroundColor: color + "14", border: `1px solid ${color}28` }}>
                <span>{CAT_ICONS[cat] || "📌"}</span>
                <span style={{ color, fontWeight: 700 }}>{contenuti.filter(c => c.categoria === cat).length}</span>
                {!isMobile && <span style={{ color: P.textMuted }}>{cat}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ padding: isMobile ? "8px 14px" : "8px 22px", borderBottom: `1px solid ${P.border}`, backgroundColor: P.surface, flexShrink: 0 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cerca contenuto..."
          style={{ width: "100%", padding: "7px 12px", backgroundColor: P.card, border: `1px solid ${P.border}`, borderRadius: 8, color: P.text, fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 7 }} />
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
          {["Tutti", ...categories].map(f => {
            const color = f === "Virale" ? P.red : f === "Estetico" ? P.accent : f === "Educational" ? P.blue : f === "Promo" ? P.green : P.orange;
            const active = filterCat === f;
            return <button key={f} onClick={() => setFilterCat(f)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", backgroundColor: active ? (color || P.accent) : P.card, color: active ? (f === "Tutti" ? "#000" : "#fff") : P.textSub, border: "none", outline: active ? `1px solid ${color || P.accent}` : "none" }}>{f === "Tutti" ? "Tutte" : ((CAT_ICONS[f] || "") + " " + f)}</button>;
          })}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["Tutti", ...sessions].map(f => {
            const color = f === "Serate Evento" ? P.purple : f === "Shooting 16 Marzo" ? P.accent : P.textMuted;
            const active = filterSess === f;
            return <button key={f} onClick={() => setFilterSess(f)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", backgroundColor: active ? "#2a2620" : P.card, color: active ? (color) : P.textSub, border: "none", outline: active ? `1px solid ${color}66` : "none" }}>{f === "Tutti" ? "Tutte sessioni" : ((SESS_ICONS[f] || "📅") + " " + f)}</button>;
          })}
          {DEFAULT_STATUSES.map(f => {
            const color = STATUS_COLORS[f] || P.textMuted;
            const active = filterStatus === f;
            return <button key={f} onClick={() => setFilterStatus(active ? "Tutti" : f)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", backgroundColor: active ? color + "22" : P.card, color: active ? color : P.textSub, border: "none", outline: active ? `1px solid ${color}44` : "none" }}>{f}</button>;
          })}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: showDetail ? (isMobile ? "100%" : "360px") : "100%", flexShrink: 0, overflowY: "auto", padding: isMobile ? "10px" : "14px", display: showMobileDetail ? "none" : "block" }}>
          <div style={{ color: P.textMuted, fontSize: 11, marginBottom: 8, paddingLeft: 2 }}>{filtered.length} contenuti</div>
          {filtered.map(c => <Card key={c.id} c={c} onClick={setSelected} selected={selected?.id === c.id} />)}
        </div>

        {showDetail && <Detail c={selected} onClose={() => setSelected(null)} onStatus={handleStatus} onField={handleField} onDelete={handleDelete} saving={saving} isMobile={false} categories={categories} sessions={sessions} operators={operators} />}
        {showMobileDetail && <Detail c={selected} onClose={() => setSelected(null)} onStatus={handleStatus} onField={handleField} onDelete={handleDelete} saving={saving} isMobile={true} categories={categories} sessions={sessions} operators={operators} />}
      </div>

      {showNew && <NewContentModal onClose={() => setShowNew(false)} onSave={handleNew} categories={categories} sessions={sessions} />}
      {showSettings && <SettingsModal categories={categories} sessions={sessions} operators={operators} onClose={() => setShowSettings(false)} onUpdate={handleSettings} />}
    </div>
  );
}
