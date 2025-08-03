import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

const COLORS = ["#00b894", "#0984e3", "#fdcb6e", "#d63031", "#6c5ce7"];

const GraficaActividad = ({ usuariosConMasActividad }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={usuariosConMasActividad}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="usuario" />
        <YAxis tickFormatter={(value) => value.toLocaleString()} />
        <Tooltip
          formatter={(value) => [`${value} registros`, "Total"]}
          labelFormatter={(label) => `Usuario: ${label}`}
        />
        <Bar dataKey="acciones">
          <LabelList dataKey="acciones" position="top" fill="#fff" />
          {usuariosConMasActividad.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? "#fdcb6e" : COLORS[index % COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GraficaActividad;
