import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, LabelList,
} from "recharts";

const COLORS = ["#00c896", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0c10] border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-bold">{payload[0].value} <span className="text-gray-500 font-normal text-xs">registros</span></p>
    </div>
  );
};

export default function GraficaActividad({ usuariosConMasActividad }) {
  if (!usuariosConMasActividad?.length) return (
    <div className="h-48 flex items-center justify-center text-gray-600 text-sm">Sin datos disponibles</div>
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={usuariosConMasActividad} margin={{ top: 20, right: 20, left: 0, bottom: 5 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="usuario" tick={{ fill: "#666", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => v.toLocaleString()} tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="acciones" radius={[6, 6, 0, 0]}>
          <LabelList dataKey="acciones" position="top" style={{ fill: "#888", fontSize: 11 }} />
          {usuariosConMasActividad.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}