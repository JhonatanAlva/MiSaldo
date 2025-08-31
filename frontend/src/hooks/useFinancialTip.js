import { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function useFinancialTip() {
  const [tip, setTip] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/notificaciones/tip`);
        if (data.enabled && data.tip) {
          setTip(data.tip);
          setShow(true);
        }
      } catch (e) {
        console.error("Error obteniendo tip financiero:", e);
      }
    })();
  }, []);

  return { tip, show, setShow };
}
