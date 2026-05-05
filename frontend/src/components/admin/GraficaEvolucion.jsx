import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer, CartesianGrid, Dot,
} from "recharts";

const COLORS = { Ingreso: "#00c896", Gasto: "#ef4444", Ahorro: "#3b82f6" };
const TIPOS = ["Ingreso", "Gasto", "Ahorro"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0c10] border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl min-w-36">
      <p className="text-gray-500 text-[11px] mb-2 uppercase tracking-wider">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-400 text-[12px]">{p.dataKey}</span>
          </div>
          <span className="text-white font-semibold text-[12px]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex gap-5 justify-center mt-2">
    {payload?.map(p => (
      <div key={p.value} className="flex items-center gap-1.5">
        <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
        <span className="text-[12px] text-gray-500">{p.value}</span>
      </div>
    ))}
  </div>
);

export default function GraficaEvolucion({ data }) {
  if (!data?.length) return (
    <div className="h-48 flex items-center justify-center text-gray-600 text-sm">Sin datos disponibles</div>
  );

  // Agrupar por mes
  const agrupada = {};
  data.forEach(({ mes, tipo, cantidad }) => {
    if (!agrupada[mes]) agrupada[mes] = { mes };
    agrupada[mes][tipo] = Number(cantidad);
  });
  const dataFinal = Object.values(agrupada);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dataFinal} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="mes" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        {TIPOS.map(tipo => (
          <Line
            key={tipo}
            type="monotone"
            dataKey={tipo}
            stroke={COLORS[tipo]}
            strokeWidth={2}
            dot={{ fill: COLORS[tipo], r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}