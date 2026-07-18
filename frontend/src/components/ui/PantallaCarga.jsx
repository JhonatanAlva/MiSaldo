import { useEffect, useState } from "react";

const PASOS = [
  "Verificando tu sesión…",
  "Cargando tus finanzas…",
  "Preparando el panel…",
];

export default function PantallaCarga() {
  const [paso,    setPaso]    = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setPaso((p) => (p + 1) % PASOS.length);
    }, 900);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-8"
      style={{ background: "#080a0e" }}
    >
      {/* Logo / marca */}
      <div className="flex flex-col items-center gap-3">
        <img
          src="/logo.png"
          alt="SaldoGt"
          className="w-20 h-20 object-contain drop-shadow-lg"
        />
        <div className="text-center">
          <p className="text-white font-bold text-lg tracking-tight">SaldoGt</p>
          <p className="text-gray-600 text-xs tracking-widest uppercase">Finanzas Personales</p>
        </div>
      </div>

      {/* Barra de progreso animada */}
      <div className="w-48 flex flex-col items-center gap-3">
        <div className="w-full h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00c896] rounded-full"
            style={{ animation: "barra 1.8s ease-in-out infinite" }}
          />
        </div>
        <p
          className="text-gray-500 text-xs tracking-wide text-center"
          style={{ minHeight: "1rem", transition: "opacity 0.3s" }}
        >
          {PASOS[paso]}
        </p>
      </div>

      {/* Puntos */}
      <div className="flex gap-1.5">
        {[0, 200, 400].map((d) => (
          <span
            key={d}
            className="w-1.5 h-1.5 rounded-full bg-[#00c896]"
            style={{ animation: `bounce 1.2s ${d}ms ease-in-out infinite` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes barra {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 0%;   margin-left: 100%; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0);    opacity: 0.4; }
          50%       { transform: translateY(-6px); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
