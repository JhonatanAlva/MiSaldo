import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "sonner";
import SpinnerCentrado from "../ui/SpinnerCentrado";

api.defaults.withCredentials = true;

const TABS = [
  { id: "perfil",         label: "Perfil" },
  { id: "seguridad",      label: "Contraseña" },
  { id: "notificaciones", label: "Notificaciones" },
];

// ── Switch ────────────────────────────────────────────────────
const Switch = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-3.5">
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ml-4
        ${checked ? "bg-[#00c57a]" : "bg-gray-200"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300
        ${checked ? "left-[26px]" : "left-0.5"}`} />
    </button>
  </div>
);

export default function ConfiguracionUsuario() {
  const [tab,      setTab]      = useState("perfil");
  const [modoOscuro, setModoOscuro] = useState(false);

  // Perfil
  const [perfil,   setPerfil]   = useState({ nombres:"", apellidos:"", correo:"", celular:"" });

  // Contraseña
  const [pass,     setPass]     = useState({ actual:"", nueva:"", confirmar:"" });
  const [showPass, setShowPass] = useState({ actual:false, nueva:false, confirmar:false });

  // Notificaciones
  const [notif,    setNotif]    = useState({ push:true, tips:false });

  // Preferencias
  const [moneda,   setMoneda]   = useState(() => localStorage.getItem("moneda") || "GTQ");
  const [formato,  setFormato]  = useState("pdf");

  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Detectar tema
  useEffect(() => {
    const check = () => setModoOscuro(document.body.getAttribute("data-theme") === "dark");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes:true, attributeFilter:["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Cargar datos
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
          setNotif({
            push: !!c.data.notificaciones.push,
            tips: !!c.data.notificaciones.tips,
          });
        }
        if (c.data?.formato) setFormato(c.data.formato);
      } catch(e) {
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Guardar perfil
  const guardarPerfil = async () => {
    setGuardando(true);
    try {
      const { data } = await api.put("/configuraciones/usuario", {
        nombres: perfil.nombres, apellidos: perfil.apellidos, celular: perfil.celular ?? "",
      });
      if (data?.usuario) setPerfil(p => ({ ...p, ...data.usuario }));
      toast.success("Perfil actualizado");
    } catch(e) {
    } finally { setGuardando(false); }
  };

  // Cambiar contraseña
  const cambiarPassword = async () => {
    if (!pass.actual || !pass.nueva || !pass.confirmar) {
      toast.error("Completa todos los campos."); return;
    }
    if (pass.nueva !== pass.confirmar) {
      toast.error("Las contraseñas nuevas no coinciden."); return;
    }
    if (pass.nueva.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres."); return;
    }
    setGuardando(true);
    try {
      await api.put("/configuraciones/password", { actual: pass.actual, nueva: pass.nueva });
      setPass({ actual:"", nueva:"", confirmar:"" });
      toast.success("Contraseña actualizada");
    } catch(e) {
    } finally { setGuardando(false); }
  };

  // Guardar notificaciones
  const guardarNotificaciones = async () => {
    setGuardando(true);
    try {
      await api.put("/configuraciones", {
        notificaciones: { ...notif, email:true, weekly:true, monthly:true },
        formato,
      });
      toast.success("Notificaciones guardadas");
    } catch(e) {
    } finally { setGuardando(false); }
  };

  // ── Estilos dinámicos ─────────────────────────────────────
  const card = `rounded-3xl border p-6 shadow-sm w-full ${modoOscuro ? "bg-[#1a1a1a] border-white/10 text-gray-100" : "bg-white border-gray-100 text-gray-800"}`;
  const inputCls = `w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all
    ${modoOscuro
      ? "bg-[#262626] border-white/15 text-gray-100 placeholder-gray-500 focus:border-[#00c57a]"
      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#00c57a] focus:bg-white"}`;
  const labelCls = `block text-[10px] font-bold mb-1.5 uppercase tracking-wider ${modoOscuro ? "text-gray-500" : "text-gray-400"}`;
  const divider  = modoOscuro ? "divide-white/10" : "divide-gray-100";
  const tabBg    = modoOscuro ? "bg-[#111]" : "bg-gray-100";
  const btnBase  = `px-6 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50
    bg-[#00c57a] text-white hover:bg-[#00a865] active:scale-[0.98]`;

  if (cargando) return <SpinnerCentrado />;

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className={`text-sm mt-0.5 ${modoOscuro ? "text-gray-500" : "text-gray-400"}`}>
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Tabs — scroll horizontal en móvil */}
      <div className={`flex gap-1 p-1 rounded-2xl mb-5 overflow-x-auto scrollbar-none max-w-md ${tabBg}`}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap
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
        <div className={card}>
          {/* Avatar */}
          <div className={`flex items-center gap-4 mb-6 pb-5 border-b ${modoOscuro ? "border-white/10" : "border-gray-100"}`}>
            <div className="w-14 h-14 rounded-full bg-[#00c57a]/15 flex items-center justify-center text-[#00c57a] font-bold text-2xl shrink-0">
              {perfil.nombres?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{perfil.nombres} {perfil.apellidos}</p>
              <p className={`text-sm truncate ${modoOscuro ? "text-gray-500" : "text-gray-400"}`}>{perfil.correo}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key:"nombres",   lab:"Nombres",   ph:"Tu nombre" },
              { key:"apellidos", lab:"Apellidos",  ph:"Tu apellido" },
              { key:"celular",   lab:"Teléfono",   ph:"+502 5555-1234" },
            ].map(({ key, lab, ph }) => (
              <div key={key}>
                <label className={labelCls}>{lab}</label>
                <input className={inputCls} value={perfil[key] || ""} placeholder={ph}
                  onChange={e => setPerfil(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className={labelCls}>Correo electrónico</label>
              <input className={`${inputCls} opacity-50 cursor-not-allowed`} value={perfil.correo} disabled />
              <p className={`text-xs mt-1 ${modoOscuro ? "text-gray-600" : "text-gray-400"}`}>El correo no se puede cambiar.</p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={guardarPerfil} disabled={guardando} className={btnBase}>
              {guardando ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>        </div>
      )}

      {/* ── CONTRASEÑA ──────────────────────────────────────── */}
      {tab === "seguridad" && (
        <div className={card}>
          <h5 className="font-semibold mb-1">Cambiar contraseña</h5>
          <p className={`text-sm mb-5 ${modoOscuro ? "text-gray-500" : "text-gray-400"}`}>
            Mínimo 6 caracteres. Usa una combinación segura.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key:"actual",    lab:"Contraseña actual" },
              { key:"nueva",     lab:"Nueva contraseña" },
              { key:"confirmar", lab:"Confirmar contraseña" },
            ].map(({ key, lab }) => (
              <div key={key}>
                <label className={labelCls}>{lab}</label>
                <div className="relative">
                  <input
                    type={showPass[key] ? "text" : "password"}
                    className={`${inputCls} pr-16`}
                    placeholder="••••••••"
                    value={pass[key]}
                    autoComplete="new-password"
                    onChange={e => setPass(p => ({ ...p, [key]: e.target.value }))}
                  />
                  <button type="button"
                    onClick={() => setShowPass(p => ({ ...p, [key]: !p[key] }))}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium
                      ${modoOscuro ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                    {showPass[key] ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>
            ))}

            {/* Indicador fortaleza */}
            {pass.nueva && (
              <div>
                <div className="flex gap-1.5 mb-1">
                  {[1,2,3,4].map(i => {
                    const len = pass.nueva.length;
                    const fill = (len<6&&i===1)||(len>=6&&len<8&&i<=2)||(len>=8&&len<12&&i<=3)||(len>=12&&i<=4);
                    const color = len<6?"bg-red-400":len<8?"bg-yellow-400":len<12?"bg-blue-400":"bg-[#00c57a]";
                    return <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${fill?color:modoOscuro?"bg-white/10":"bg-gray-200"}`} />;
                  })}
                </div>
                <p className={`text-xs ${modoOscuro?"text-gray-500":"text-gray-400"}`}>
                  {pass.nueva.length<6?"Muy corta":pass.nueva.length<8?"Débil":pass.nueva.length<12?"Buena":"Fuerte"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={cambiarPassword} disabled={guardando} className={btnBase}>
              {guardando ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </div>        </div>
      )}

      {/* ── NOTIFICACIONES ──────────────────────────────────── */}
      {tab === "notificaciones" && (
        <div className={card}>
          <h5 className="font-semibold mb-1">Notificaciones</h5>
          <p className={`text-sm mb-5 ${modoOscuro ? "text-gray-500" : "text-gray-400"}`}>
            Controla qué alertas quieres recibir.
          </p>
          <div className={`divide-y ${divider}`}>
            <Switch checked={notif.push} onChange={v => setNotif(p=>({...p,push:v}))}
              label="Alertas de presupuesto"
              desc="Aviso cuando te acercas al límite del mes" />
            <Switch checked={notif.tips} onChange={v => setNotif(p=>({...p,tips:v}))}
              label="Consejos financieros"
              desc="Tips semanales para mejorar tus finanzas" />
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={guardarNotificaciones} disabled={guardando} className={btnBase}>
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>        </div>
      )}
    </div>
  );
}