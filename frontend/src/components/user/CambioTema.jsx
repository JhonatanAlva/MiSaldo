import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const CambioTema = () => {
  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem("tema") === "oscuro";
  });

  useEffect(() => {
    const nuevoTema = modoOscuro ? "dark" : "light";
    document.body.setAttribute("data-theme", nuevoTema);
    localStorage.setItem("tema", modoOscuro ? "oscuro" : "claro");
  }, [modoOscuro]);

  return (
    <button
      className="btn btn-outline-secondary"
      onClick={() => setModoOscuro(!modoOscuro)}
      title={`Cambiar a modo ${modoOscuro ? "claro" : "oscuro"}`}
    >
      <Icon icon={modoOscuro ? "lucide:sun" : "lucide:moon"} />
    </button>
  );
};

export default CambioTema;