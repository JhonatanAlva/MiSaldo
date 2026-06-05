import React, { useEffect, useState } from "react";
import api from "../../services/api";

api.defaults.withCredentials = true;

const MONEDAS = [
  { code: "GTQ", label: "Quetzal guatemalteco (Q)" },
  { code: "USD", label: "Dólar estadounidense ($)" },
  { code: "MXN", label: "Peso mexicano ($)" },
  { code: "EUR", label: "Euro (€)" },
];

const TABS = [
  { id: "perfil",         label: "Perfil" },
  { id: "seguridad",      label: "Contraseña" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "preferencias",   label: "Preferencias" },
];

// ── Componente de mensaje ─────────────────────────────────────
const Msg = ({ msg }) => {
  if (!msg) return null;
  const esError = msg.toLowerCase().includes("error");
  return (
    <div className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-medium border
      ${esError
        ? "bg-red-500/10 text-red-500 border-red-200"
        : "bg-green-500/10 text-green-600 border-green-200"
      }`}>
      {msg}
    </div>
  );
};

// ── Switch personalizado ──────────────────────────────────────
const Switch = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between py-3 cursor-pointer group">
    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 shrink-0
        ${checked ? "bg-[#00c57a]" : "bg-gray-200"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200
        ${checked ? "left-[22px]" : "left-0.5"}`} />
    </div>
  </label>
);

export default function ConfiguracionUsuario() {
  const [tab, setTab] = useState("perfil");

  // Tema
  const [modoOscuro, setModoOscuro] = useState(false);
  useEffect(() => {
    setModoOscuro(document.body.getAttribute("data-theme") === "dark");
    const obs = new MutationObserver(() =>
      setModoOscuro(document.body.getAttribute("data-theme") === "dark")
    );
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Perfil
  const [perfil, setPerfil] = useState({ nombres: "", apellidos: "", correo: "", celular: "" });

  // Contraseña
  const [pass, setPass] = useState({ actual: "", nueva: "", confirmar: "" });
  const [showPass, setShowPass] = useState({ actual: false, nueva: false, confirmar: false });

  // Notificaciones
  const [notificaciones, setNotificaciones] = useState({ push: true, tips: false });

  // Preferencias
  const [moneda, setMoneda] = useState("GTQ");
  const [formato, setFormato] = useState("pdf");

  const [cargando, setCargando]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg]             = useState("");

  const mostrarMsg = (texto) => {
    setMsg(texto);
    setTimeout(() => setMsg(""), 4000);
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const [u, c] = await Promise.all([
          api.get("/auth/usuario"),
          api.get("/configuraciones"),
        ]);
        setPerfil({
          nombres:   u.data.nombres   || "",
          apellidos: u.data.apellidos || "",
          correo:    u.data.correo    || "",
          celular:   u.data.celular   || "",
        });
        if (c.data?.notificaciones) {
          setNotificaciones({
            push: !!c.data.notificaciones.push,
            tips: !!c.data.notificaciones.tips,
          });
        }
        if (c.data?.formato) setFormato(c.data.formato);
      } catch(e) {
        console.error(e);
        mostrarMsg("Error al cargar configuraciones.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // ── Guardar perfil ────────────────────────────────────────
  const guardarPerfil = async () => {
    setGuardando(true);
    try {
      const { data } = await api.put("/configuraciones/usuario", {
        nombres:   perfil.nombres,
        apellidos: perfil.apellidos,
        celular:   perfil.celular ?? "",
      });
      if (data?.usuario) setPerfil(p => ({ ...p, ...data.usuario }));
      mostrarMsg("Perfil actualizado correctamente.");
    } catch(e) {
      mostrarMsg("Error al actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Cambiar contraseña ────────────────────────────────────
  const cambiarPassword = async () => {
    if (!pass.actual || !pass.nueva || !pass.confirmar) {
      mostrarMsg("Error: Completa todos los campos.");
      return;
    }
    if (pass.nueva !== pass.confirmar) {
      mostrarMsg("Error: Las contraseñas nuevas no coinciden.");
      return;
    }
    if (pass.nueva.length < 6) {
      mostrarMsg("Error: La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setGuardando(true);
    try {
      await api.put("/configuraciones/password", {
        actual: pass.actual,
        nueva:  pass.nueva,
      });
      setPass({ actual: "", nueva: "", confirmar: "" });
      mostrarMsg("Contraseña actualizada correctamente.");
    } catch(e) {
      const m = e.response?.data?.mensaje || "Error al cambiar la contraseña.";
      mostrarMsg(`Error: ${m}`);
    } finally {
      setGuardando(false);
    }
  };

  // ── Guardar notificaciones ────────────────────────────────
  const guardarNotificaciones = async () => {
    setGuardando(true);
    try {
      await api.put("/configuraciones", { notificaciones, formato });
      mostrarMsg("Notificaciones guardadas.");
    } catch(e) {
      mostrarMsg("Error al guardar notificaciones.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Guardar preferencias ──────────────────────────────────
  const guardarPreferencias = async () => {
    setGuardando(true);
    try {
      await api.put("/configuraciones", { notificaciones, formato });
      localStorage.setItem("moneda", moneda);
      mostrarMsg("Preferencias guardadas.");
    } catch(e) {
      mostrarMsg("Error al guardar preferencias.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Estilos ───────────────────────────────────────────────
  const bg    = modoOscuro ? "bg-[#111] text-gray-100" : "bg-white text-gray-800";
  const card  = modoOscuro ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-100";
  const input = modoOscuro
    ? "bg-[#262626] border-white/15 text-gray-100 placeholder-gray-500 focus:border-[#00c57a]"
    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#00c57a]";
  const label = modoOscuro ? "text-gray-400" : "text-gray-500";
  const divider = modoOscuro ? "border-white/10" : "border-gray-100";

  if (cargando) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 border-[#00c57a] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className={`text-sm mt-0.5 ${label}`}>Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-2xl mb-5 ${modoOscuro ? "bg-[#1a1a1a]" : "bg-gray-100"}`}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setMsg(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === t.id
                ? "bg-[#00c57a] text-white shadow-sm"
                : modoOscuro ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PERFIL ──────────────────────────────────────────── */}
      {tab === "perfil" && (
        <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
          {/* Avatar inicial */}
          <div className="flex items-center gap-4 mb-6 pb-5" style={{ borderBottom: `1px solid ${modoOscuro ? "rgba(255,255,255,0.08)" : "#f0f0f0"}` }}>
            <div className="w-14 h-14 rounded-full bg-[#00c57a]/20 flex items-center justify-center text-[#00c57a] font-bold text-xl">
              {perfil.nombres?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold">{perfil.nombres} {perfil.apellidos}</p>
              <p className={`text-sm ${label}`}>{perfil.correo}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "nombres",   lab: "Nombres",   placeholder: "Tu nombre" },
              { key: "apellidos", lab: "Apellidos",  placeholder: "Tu apellido" },
              { key: "celular",   lab: "Teléfono",   placeholder: "+502 5555-1234" },
            ].map(({ key, lab, placeholder }) => (
              <div key={key}>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${label}`}>{lab}</label>
                <input
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${input}`}
                  value={perfil[key] || ""}
                  onChange={e => setPerfil(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${label}`}>Correo</label>
              <input
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none opacity-60 cursor-not-allowed ${input}`}
                value={perfil.correo}
                disabled
              />
              <p className={`text-xs mt-1 ${label}`}>El correo no se puede cambiar.</p>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button onClick={guardarPerfil} disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-[#00c57a] text-white text-sm font-semibold
                         hover:bg-[#00a865] transition-colors disabled:opacity-50">
              {guardando ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
          <Msg msg={msg} />
        </div>
      )}

      {/* ── CONTRASEÑA ──────────────────────────────────────── */}
      {tab === "seguridad" && (
        <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
          <h5 className="font-semibold mb-1">Cambiar contraseña</h5>
          <p className={`text-sm mb-5 ${label}`}>Usa una contraseña segura de al menos 6 caracteres.</p>

          <div className="flex flex-col gap-4">
            {[
              { key: "actual",    lab: "Contraseña actual",    placeholder: "••••••••" },
              { key: "nueva",     lab: "Nueva contraseña",      placeholder: "••••••••" },
              { key: "confirmar", lab: "Confirmar contraseña",  placeholder: "••••••••" },
            ].map(({ key, lab, placeholder }) => (
              <div key={key}>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${label}`}>{lab}</label>
                <div className="relative">
                  <input
                    type={showPass[key] ? "text" : "password"}
                    className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm outline-none transition-colors ${input}`}
                    placeholder={placeholder}
                    value={pass[key]}
                    onChange={e => setPass(p => ({ ...p, [key]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => ({ ...p, [key]: !p[key] }))}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${label}`}
                  >
                    {showPass[key] ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>
            ))}

            {/* Indicador de fortaleza */}
            {pass.nueva && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => {
                    const len = pass.nueva.length;
                    const color = len < 6 ? "bg-red-400" : len < 8 ? "bg-yellow-400" : len < 12 ? "bg-blue-400" : "bg-[#00c57a]";
                    const activo = (len < 6 && i === 1) || (len >= 6 && len < 8 && i <= 2) || (len >= 8 && len < 12 && i <= 3) || (len >= 12 && i <= 4);
                    return <div key={i} className={`h-1 flex-1 rounded-full transition-all ${activo ? color : modoOscuro ? "bg-white/10" : "bg-gray-200"}`} />;
                  })}
                </div>
                <p className={`text-xs ${label}`}>
                  {pass.nueva.length < 6 ? "Muy corta" : pass.nueva.length < 8 ? "Débil" : pass.nueva.length < 12 ? "Buena" : "Fuerte"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-5">
            <button onClick={cambiarPassword} disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-[#00c57a] text-white text-sm font-semibold
                         hover:bg-[#00a865] transition-colors disabled:opacity-50">
              {guardando ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </div>
          <Msg msg={msg} />
        </div>
      )}

      {/* ── NOTIFICACIONES ──────────────────────────────────── */}
      {tab === "notificaciones" && (
        <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
          <h5 className="font-semibold mb-1">Notificaciones</h5>
          <p className={`text-sm mb-5 ${label}`}>Controla qué alertas quieres recibir.</p>

          <div className={`divide-y ${modoOscuro ? "divide-white/10" : "divide-gray-100"}`}>
            <Switch
              checked={notificaciones.push}
              onChange={v => setNotificaciones(p => ({ ...p, push: v }))}
              label="Alertas de presupuesto"
            />
            <Switch
              checked={notificaciones.tips}
              onChange={v => setNotificaciones(p => ({ ...p, tips: v }))}
              label="Consejos financieros"
            />
          </div>

          <div className="flex justify-end mt-5">
            <button onClick={guardarNotificaciones} disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-[#00c57a] text-white text-sm font-semibold
                         hover:bg-[#00a865] transition-colors disabled:opacity-50">
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
          <Msg msg={msg} />
        </div>
      )}

      {/* ── PREFERENCIAS ────────────────────────────────────── */}
      {tab === "preferencias" && (
        <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
          <h5 className="font-semibold mb-1">Preferencias</h5>
          <p className={`text-sm mb-5 ${label}`}>Personaliza cómo se muestran tus datos.</p>

          <div className="flex flex-col gap-5">
            {/* Moneda */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${label}`}>Moneda</label>
              <div className="grid grid-cols-2 gap-2">
                {MONEDAS.map(m => (
                  <button key={m.code} onClick={() => setMoneda(m.code)}
                    className={`px-4 py-3 rounded-xl text-sm text-left border transition-all
                      ${moneda === m.code
                        ? "border-[#00c57a] bg-[#00c57a]/10 text-[#00c57a] font-semibold"
                        : modoOscuro
                          ? "border-white/10 text-gray-400 hover:border-white/20"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formato de exportación */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${label}`}>Formato de exportación</label>
              <div className="flex gap-2">
                {["pdf","excel","html"].map(f => (
                  <button key={f} onClick={() => setFormato(f)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all uppercase
                      ${formato === f
                        ? "border-[#00c57a] bg-[#00c57a]/10 text-[#00c57a]"
                        : modoOscuro
                          ? "border-white/10 text-gray-400 hover:border-white/20"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button onClick={guardarPreferencias} disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-[#00c57a] text-white text-sm font-semibold
                         hover:bg-[#00a865] transition-colors disabled:opacity-50">
              {guardando ? "Guardando..." : "Guardar preferencias"}
            </button>
          </div>
          <Msg msg={msg} />
        </div>
      )}
    </div>
  );
}