import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import api from "../../services/api";

const SUGERENCIAS = [
  "¿Cuánto gasté este mes?",
  "¿En qué categoría gasto más?",
  "¿Cuánto puedo ahorrar al mes?",
  "Dame consejos para reducir gastos",
  "¿Cuánto he ingresado este mes?",
  "¿Cómo mejorar mis finanzas personales?",
];

const AsistenteIA = ({
  nombreUsuario = "Usuario",
}) => {

  const [mensaje, setMensaje] =
    useState("");

  const [respuestas, setRespuestas] =
    useState(() => {

      const data =
        sessionStorage.getItem(
          "asistente_ia_chat"
        );

      if (data) {
        return JSON.parse(data);
      }

      return [
        {
          rol: "asistente",
          texto: `Hola ${nombreUsuario} 👋 ¿En qué puedo ayudarte con tus finanzas hoy?`,
        },
      ];
    });

  const [cargando, setCargando] =
    useState(false);

  const [modoOscuro, setModoOscuro] =
    useState(false);

  const bottomRef = useRef(null);

  // ─────────────────────────────────────
  // Detectar tema
  // ─────────────────────────────────────
  useEffect(() => {

    setModoOscuro(
      document.body.getAttribute(
        "data-theme"
      ) === "dark"
    );

    const observer =
      new MutationObserver(() =>
        setModoOscuro(
          document.body.getAttribute(
            "data-theme"
          ) === "dark"
        )
      );

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();

  }, []);

  // ─────────────────────────────────────
  // Guardar conversación
  // ─────────────────────────────────────
  useEffect(() => {

    sessionStorage.setItem(
      "asistente_ia_chat",
      JSON.stringify(respuestas)
    );

  }, [respuestas]);

  // ─────────────────────────────────────
  // Auto scroll
  // ─────────────────────────────────────
  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [respuestas]);

  // ─────────────────────────────────────
  // Enviar mensaje
  // ─────────────────────────────────────
  const enviarTexto = async (texto) => {
    if (!texto.trim() || cargando) return;
    setRespuestas((prev) => [...prev, { rol: "usuario", texto }]);
    setMensaje("");
    setCargando(true);
    try {
      const res = await api.post("/asistente", { mensaje: texto, nombre: nombreUsuario });
      setRespuestas((prev) => [...prev, { rol: "asistente", texto: res.data.respuesta }]);
    } catch {
      setRespuestas((prev) => [...prev, { rol: "asistente", texto: "❌ Hubo un error al conectarse con el asistente IA." }]);
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    enviarTexto(mensaje.trim());
  };

  const limpiarChat = () => {
    const saludo = [{ rol: "asistente", texto: `Hola ${nombreUsuario} 👋 ¿En qué puedo ayudarte con tus finanzas hoy?` }];
    setRespuestas(saludo);
    sessionStorage.setItem("asistente_ia_chat", JSON.stringify(saludo));
  };

  // ─────────────────────────────────────
  // Análisis IA
  // ─────────────────────────────────────
  const manejarAnalisis = async (
    tipo
  ) => {

    setRespuestas((prev) => [
      ...prev,
      {
        rol: "asistente",
        texto: `Analizando tus ${tipo}... 🔍`,
      },
    ]);

    setCargando(true);

    const urls = {
      gastos:
        "/finanzas/gastos",

      ingresos:
        "/finanzas/ingresos",

      balance:
        "/finanzas/resumen?tipo=mensual",

      gastosfijos:
        "/gastos-fijos",

      ingresosfijos:
        "/ingresos-fijos",
    };

    try {

      const res =
        await api.get(
          urls[tipo]
        );

      let endpoint =
        "/asistente/analisis";

      if (
        tipo === "gastosfijos"
      ) {

        endpoint =
          "/asistente/analisis-gastos-fijos";

      }

      if (
        tipo === "ingresosfijos"
      ) {

        endpoint =
          "/asistente/analisis-ingresos-fijos";

      }

      let payload = {
        tipo,
        datos: res.data,
        nombre: nombreUsuario,
      };

      // ─────────────────────────────
      // IA gastos fijos
      // ─────────────────────────────
      if (
        tipo === "gastosfijos"
      ) {

        const ingresosRes =
          await api.get(
            "/finanzas/ingresos"
          );

        payload = {
          gastosFijos:
            res.data,

          ingresos:
            ingresosRes.data,

          nombre:
            nombreUsuario,
        };

      }

      // ─────────────────────────────
      // IA ingresos fijos
      // ─────────────────────────────
      if (
        tipo === "ingresosfijos"
      ) {

        const gastosRes =
          await api.get(
            "/gastos-fijos"
          );

        payload = {

          ingresosFijos:
            res.data,

          gastosFijos:
            gastosRes.data,

          nombre:
            nombreUsuario,

        };

      }

      const aiRes =
        await api.post(
          endpoint,
          payload
        );

      setRespuestas((prev) => [
        ...prev,
        {
          rol: "asistente",
          texto:
            aiRes.data
              .resumen ||
            "Análisis completado ✅",
        },
      ]);

    } catch (err) {

      console.error(
        "Error al analizar:",
        err
      );

      setRespuestas((prev) => [
        ...prev,
        {
          rol: "asistente",
          texto:
            "❌ No se pudieron analizar tus datos.",
        },
      ]);

    } finally {

      setCargando(false);

    }
  };

  // ─────────────────────────────────────
  // Estilos
  // ─────────────────────────────────────
  const card = `
    rounded-4
    p-3
    p-sm-4
    transition-all
    duration-300
    ${modoOscuro
      ? "bg-dark text-light shadow-lg"
      : "bg-white text-dark shadow-sm"
    }
  `;

  const chatBg = modoOscuro
    ? "bg-black"
    : "bg-light";

  const burbuja = (rol) => {

    if (rol === "usuario") {
      return `
        bg-success
        text-white
        ms-auto
      `;
    }

    return modoOscuro
      ? "bg-secondary text-light"
      : "bg-light text-dark";
  };

  const inputCls = `
    form-control
    rounded-pill
    py-3
    px-4
    ${modoOscuro
      ? "bg-dark text-light border-secondary"
      : ""
    }
  `;

  return (
    <div className="w-100">

      <div className={card}>

        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-4">

          <div
            className="
              rounded-circle
              bg-success
              d-flex
              align-items-center
              justify-content-center
            "
            style={{
              width: "45px",
              height: "45px",
              fontSize: "20px",
            }}
          >
            🤖
          </div>

          <div className="flex-grow-1">
            <h4 className="fw-bold m-0">
              Asistente IA
            </h4>
            <small className={modoOscuro ? "text-light opacity-75" : "text-muted"}>
              Finanzas inteligentes
            </small>
          </div>

          {respuestas.length > 1 && (
            <button
              onClick={limpiarChat}
              title="Limpiar conversación"
              className={`btn btn-sm rounded-pill px-3 ${modoOscuro ? "btn-outline-secondary" : "btn-outline-secondary"}`}
            >
              🗑️ Limpiar
            </button>
          )}

        </div>

        {/* Chat */}
        <div
          className={`
            ${chatBg}
            rounded-4
            p-3
            mb-4
            overflow-auto
          `}
          style={{
            height:
              window.innerWidth <
                640
                ? "350px"
                : "500px",
          }}
        >

          <div className="d-flex flex-column gap-3">

            {respuestas.map(
              (r, i) => (

                <div
                  key={i}
                  className={`p-3 rounded-4 shadow-sm ${burbuja(r.rol)}`}
                  style={{
                    maxWidth: window.innerWidth < 640 ? "95%" : "75%",
                    width: "fit-content",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.5",
                  }}
                >
                  {r.texto}
                </div>

              )
            )}

            {/* Preguntas sugeridas — solo cuando chat está vacío */}
            {respuestas.length === 1 && !cargando && (
              <div className="mt-1 d-flex flex-wrap gap-2 justify-content-center">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    onClick={() => enviarTexto(s)}
                    className={`btn btn-sm rounded-pill px-3 py-2 ${
                      modoOscuro
                        ? "btn-outline-light opacity-75"
                        : "btn-outline-secondary"
                    }`}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {cargando && (
              <div
                className={`p-3 rounded-4 shadow-sm ${modoOscuro ? "bg-secondary text-light" : "bg-light text-muted"}`}
                style={{ width: "fit-content" }}
              >
                <span className="me-1">✍️</span>
                <span>Escribiendo</span>
                <span className="ms-1" style={{ letterSpacing: "2px" }}>...</span>
              </div>
            )}

            <div ref={bottomRef} />

          </div>

        </div>

        {/* Botones IA */}
        <div
          className="
            d-flex
            flex-wrap
            gap-2
            mb-4
          "
        >

          <button
            onClick={() =>
              manejarAnalisis(
                "gastos"
              )
            }
            className="
              btn
              btn-outline-info
              rounded-pill
              flex-grow-1
            "
          >
            🧾 Gastos
          </button>

          <button
            onClick={() =>
              manejarAnalisis(
                "ingresos"
              )
            }
            className="
              btn
              btn-outline-success
              rounded-pill
              flex-grow-1
            "
          >
            💰 Ingresos
          </button>

          <button
            onClick={() =>
              manejarAnalisis(
                "balance"
              )
            }
            className="
              btn
              btn-outline-warning
              rounded-pill
              flex-grow-1
            "
          >
            📊 Balance
          </button>

          <button
            onClick={() =>
              manejarAnalisis(
                "gastosfijos"
              )
            }
            className="
              btn
              btn-outline-danger
              rounded-pill
              flex-grow-1
            "
          >
            🧠 Gastos fijos
          </button>
          <button
            onClick={() =>
              manejarAnalisis(
                "ingresosfijos"
              )
            }
            className="
    btn
    btn-outline-primary
    rounded-pill
    flex-grow-1
  "
          >
            💵 Ingresos fijos
          </button>

        </div>

        {/* Input */}
        <form
          onSubmit={
            manejarEnvio
          }
          className="
            d-flex
            flex-column
            flex-sm-row
            gap-2
          "
        >

          <input
            type="text"
            className={inputCls}
            placeholder="Escribe tu mensaje..."
            value={mensaje}
            onChange={(e) =>
              setMensaje(
                e.target.value
              )
            }
            disabled={cargando}
          />

          <button
            type="submit"
            disabled={
              cargando ||
              !mensaje.trim()
            }
            className="
              btn
              btn-success
              rounded-pill
              px-4
              py-3
              fw-semibold
              w-100
              w-sm-auto
            "
          >
            Enviar
          </button>

        </form>

      </div>

    </div>
  );
};

export default AsistenteIA;