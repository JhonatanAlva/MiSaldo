import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiShield, FiUsers, FiBell, FiSave } from "react-icons/fi";
import { getConfiguracion, guardarConfiguracion } from "../../services/adminService";

const DEFAULTS = {
  registro_abierto:    "true",
  intentos_login:      "5",
  expiracion_sesion:   "2h",
  notif_nuevo_usuario: "true",
  notif_errores:       "true",
  modo_mantenimiento:  "false",
};

const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6 mb-5">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl bg-[#00c896]/10 flex items-center justify-center">
        <Icon size={15} className="text-[#00c896]" />
      </div>
      <div>
        <p className="text-white font-semibold text-[14px]">{title}</p>
        {subtitle && <p className="text-gray-500 text-[12px]">{subtitle}</p>}
      </div>
    </div>
    <div className="space-y-5 divide-y divide-white/[0.04]">{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="flex items-center justify-between gap-6 flex-wrap pt-4 first:pt-0">
    <div className="min-w-0">
      <p className="text-gray-200 text-[13px] font-medium">{label}</p>
      {hint && <p className="text-gray-600 text-[11px] mt-0.5">{hint}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className="relative inline-flex items-center w-12 h-6 cursor-pointer transition-all duration-200 focus:outline-none"
    style={{
      background: value ? "#00c896" : "transparent",
      border: `2px solid ${value ? "#00c896" : "rgba(255,255,255,0.2)"}`,
      borderRadius: "999px",
    }}
  >
    <span
      className="absolute rounded-full bg-white transition-all duration-200"
      style={{
        width: "16px",
        height: "16px",
        left: value ? "calc(100% - 19px)" : "3px",
        opacity: value ? 1 : 0.5,
      }}
    />
  </button>
);

const SelectField = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-1.5 rounded-full text-gray-200 text-[13px] focus:outline-none transition-all"
    style={{ backgroundColor: "#0a0c10", border: "1px solid rgba(255,255,255,0.08)", colorScheme: "dark" }}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value} style={{ backgroundColor: "#0a0c10" }}>
        {o.label}
      </option>
    ))}
  </select>
);

export default function VistaConfiguracion() {
  const [config,    setConfig]    = useState(DEFAULTS);
  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getConfiguracion();
        setConfig({ ...DEFAULTS, ...res.data });
      } catch (e) {
        console.error(e);
        toast.error("Error al cargar la configuración");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const set  = (clave, valor) => setConfig((prev) => ({ ...prev, [clave]: String(valor) }));
  const bool = (clave) => config[clave] === "true";

  const guardar = async () => {
    setGuardando(true);
    try {
      await guardarConfiguracion(config);
      toast.success("Configuración guardada");
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar la configuración");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex gap-1">
          {[0, 150, 300].map((d) => (
            <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#00c896] animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white tracking-tight">Configuración</h1>
        <p className="text-gray-500 text-sm mt-0.5">Opciones generales del sistema</p>
      </div>

      <Section icon={FiShield} title="Sistema" subtitle="Comportamiento general de la plataforma">
        <Field label="Registro de nuevos usuarios" hint="Permitir que nuevos usuarios creen cuentas">
          <Toggle value={bool("registro_abierto")} onChange={(v) => set("registro_abierto", v)} />
        </Field>
        <Field label="Modo mantenimiento" hint="Bloquea el acceso a usuarios no administradores">
          <Toggle value={bool("modo_mantenimiento")} onChange={(v) => set("modo_mantenimiento", v)} />
        </Field>
      </Section>

      <Section icon={FiUsers} title="Seguridad" subtitle="Control de acceso y sesiones">
        <Field label="Intentos fallidos de login" hint="Bloquear cuenta tras N intentos fallidos">
          <SelectField
            value={config.intentos_login}
            onChange={(v) => set("intentos_login", v)}
            options={[
              { value: "3",  label: "3 intentos" },
              { value: "5",  label: "5 intentos" },
              { value: "10", label: "10 intentos" },
            ]}
          />
        </Field>
        <Field label="Expiración de sesión" hint="Tiempo antes de cerrar sesión automáticamente">
          <SelectField
            value={config.expiracion_sesion}
            onChange={(v) => set("expiracion_sesion", v)}
            options={[
              { value: "30m", label: "30 minutos" },
              { value: "1h",  label: "1 hora"     },
              { value: "2h",  label: "2 horas"    },
              { value: "8h",  label: "8 horas"    },
            ]}
          />
        </Field>
      </Section>

      <Section icon={FiBell} title="Notificaciones" subtitle="Alertas por correo para administradores">
        <Field label="Nuevo usuario registrado" hint="Recibir email cuando alguien crea una cuenta">
          <Toggle value={bool("notif_nuevo_usuario")} onChange={(v) => set("notif_nuevo_usuario", v)} />
        </Field>
        <Field label="Errores críticos" hint="Recibir email ante errores 500 del servidor">
          <Toggle value={bool("notif_errores")} onChange={(v) => set("notif_errores", v)} />
        </Field>
      </Section>

      <div className="flex justify-end">
        <button
          onClick={guardar}
          disabled={guardando}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#00c896] text-black text-sm font-bold
                     hover:bg-[#00b388] active:scale-[0.98] transition-all disabled:opacity-60"
        >
          <FiSave size={14} />
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
