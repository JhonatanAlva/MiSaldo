import { useEffect, useState } from "react";
import { FiTool, FiClock } from "react-icons/fi";

const SEGUNDOS = 10;

export default function MantenimientoOverlay({ onTerminar }) {
  const [cuenta, setCuenta] = useState(SEGUNDOS);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setCuenta((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          onTerminar();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [onTerminar]);

  const progreso = ((SEGUNDOS - cuenta) / SEGUNDOS) * 100;
  const radio    = 36;
  const circun   = 2 * Math.PI * radio;
  const offset   = circun - (progreso / 100) * circun;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
         style={{ background: "rgba(8, 10, 14, 0.97)", backdropFilter: "blur(12px)" }}>

      <div className="flex flex-col items-center gap-6 text-center px-6 max-w-sm w-full">

        {/* Ícono animado */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
             style={{ background: "linear-gradient(135deg, rgba(0,200,150,0.15), rgba(0,200,150,0.05))", border: "1px solid rgba(0,200,150,0.2)" }}>
          <FiTool size={36} className="text-[#00c896]" style={{ animation: "spin 3s linear infinite" }} />
        </div>

        {/* Texto */}
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight mb-2">
            Sistema en mantenimiento
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Estamos trabajando para mejorar tu experiencia.<br />
            Vuelve en unos momentos.
          </p>
        </div>

        {/* Cuenta regresiva circular */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
            {/* Track */}
            <circle cx="48" cy="48" r={radio} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            {/* Progreso */}
            <circle
              cx="48" cy="48" r={radio}
              fill="none"
              stroke="#00c896"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circun}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.9s linear" }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-white text-3xl font-bold leading-none">{cuenta}</span>
            <span className="text-gray-600 text-[10px] mt-0.5 uppercase tracking-widest">seg</span>
          </div>
        </div>

        {/* Subtexto */}
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <FiClock size={12} />
          <span>Cerrando sesión en {cuenta} segundo{cuenta !== 1 ? "s" : ""}…</span>
        </div>

        {/* Barra decorativa inferior */}
        <div className="w-full h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,200,150,0.3), transparent)" }} />
        <p className="text-gray-700 text-[11px]">MiSaldo · Finanzas Personales</p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
