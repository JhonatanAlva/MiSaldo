import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, LabelList,
} from "recharts";

const COLORS = { Ingreso: "#00c896", Gasto: "#ef4444", Ahorro: "#3b82f6" };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { tipo, cantidad } = payload[0].payload;
  return (
    <div className="bg-[#0a0c10] border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{tipo}</p>
      <p className="text-white font-bold">{cantidad} <span className="text-gray-500 font-normal text-xs">operaciones</span></p>
    </div>
  );
};

export default function GraficaOperaciones({ data }) {
  if (!data?.length) return (
    <div className="h-48 flex items-center justify-center text-gray-600 text-sm">Sin datos disponibles</div>
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }} barSize={56}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="tipo" tick={{ fill: "#666", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
          <LabelList dataKey="cantidad" position="top" style={{ fill: "#888", fontSize: 11 }} />
          {data.map((entry, i) => (
            <Cell key={i} fill={COLORS[entry.tipo] || "#888"} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}