// src/hooks/useBudgetAlert.js
import { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function useBudgetAlert() {
  const [alerta, setAlerta] = useState(null); // {estado, gastado, presupuesto}
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/notificaciones/estado-presupuesto`, {
          withCredentials: true,
        });

        console.log("💡 Datos de presupuesto recibidos:", res.data);

        const data = res.data;

        if (!data.pushOn) return;

        // Mostrar siempre que haya un estado definido
        if (["EXCEDIDO", "CERCA", "OK", "SIN_PRESUPUESTO"].includes(data.estado)) {
          setAlerta(data);
          setVisible(true);
        }
      } catch (e) {
        console.error("Error al obtener estado del presupuesto", e);
      }
    };

    fetchData();
  }, []);

  return { alerta, visible, setVisible };
}