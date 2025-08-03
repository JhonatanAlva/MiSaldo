import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = {
  Ingreso: "#00b894",
  Gasto: "#d63031",
  Ahorro: "#0984e3",
};

const GraficaEvolucion = ({ data }) => {
  const tipos = ["Ingreso", "Gasto", "Ahorro"];
  const dataAgrupada = {};

  data.forEach(({ mes, tipo, cantidad }) => {
    if (!dataAgrupada[mes]) dataAgrupada[mes] = {};
    dataAgrupada[mes][tipo] = cantidad;
  });

  const dataFinal = Object.entries(dataAgrupada).map(([mes, tipos]) => ({
    mes,
    Ingreso: tipos["Ingreso"] || 0,
    Gasto: tipos["Gasto"] || 0,
    Ahorro: tipos["Ahorro"] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={dataFinal}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Legend />
        {tipos.map((tipo) => (
          <Line
            key={tipo}
            type="monotone"
            dataKey={tipo}
            stroke={COLORS[tipo]}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GraficaEvolucion;