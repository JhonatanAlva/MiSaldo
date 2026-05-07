import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { Icon } from "@iconify/react";

const fuentesIngreso = [
  "Salario",
  "Freelance",
  "Inversiones",
  "Regalos",
  "Otros",
];

const TransaccionesUsuario = () => {
  const [transactions, setTransactions] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [modalVisible, setModalVisible] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [alerta, setAlerta] = useState(null);

  const [newTransaction, setNewTransaction] = useState({
    type: "gasto",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    obtenerHistorial();
    obtenerCategorias();
    setModoOscuro(document.body.getAttribute("data-theme") === "dark");
    const observer = new MutationObserver(() =>
      setModoOscuro(document.body.getAttribute("data-theme") === "dark"),
    );
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // Bloquear scroll del body cuando modal abierto
  useEffect(() => {
    document.body.style.overflow = modalVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalVisible]);

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 3000);
  };

  const obtenerCategorias = async () => {
    try {
      const res = await api.get("/finanzas/categorias");
      setCategorias(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const obtenerHistorial = async () => {
    try {
      const res = await api.get("/finanzas/historial");
      setTransactions(
        res.data.map((t, i) => ({
          ...t,
          id: t.id || i + 1,
          type: t.tipo.toLowerCase(),
          description:
            t.tipo === "Ingreso"
              ? t.fuente || t.categoria || ""
              : t.categoria || "", // ← para gastos: solo la categoría
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTransaction = async () => {
    const { type, category, description, amount, date } = newTransaction;

    // ─────────────────────────────────────
    // VALIDACIONES
    // ─────────────────────────────────────

    if (!category) {
      mostrarAlerta("Debes seleccionar una categoría", "danger");

      return;
    }

    if (!amount || Number(amount) <= 0) {
      mostrarAlerta("Ingresa un monto válido", "danger");

      return;
    }

    if (!date) {
      mostrarAlerta("Debes seleccionar una fecha", "danger");

      return;
    }

    // Validación descripción en gastos
    if (type === "gasto" && !description.trim()) {
      mostrarAlerta("Debes ingresar una descripción del gasto", "danger");

      return;
    }

    try {
      // ─────────────────────────────────
      // EDITAR
      // ─────────────────────────────────
      if (modoEdicion && transaccionSeleccionada) {
        let payload = {
          monto: parseFloat(amount),
          fecha: date,
        };

        if (type === "ingreso") {
          payload.fuente = category;

          payload.descripcion = description || null;
        } else {
          payload.descripcion = description;

          const catRes = await api.post("/finanzas/categoria", {
            nombre: category,
          });

          payload.categoria_id = catRes.data.id;
        }

        await api.put(
          `/finanzas/movimiento/${type}/${transaccionSeleccionada.id}`,
          payload,
        );

        mostrarAlerta("Movimiento actualizado correctamente");
      }

      // ─────────────────────────────────
      // CREAR
      // ─────────────────────────────────
      else {
        if (type === "ingreso") {
          await api.post("/finanzas/ingresos", {
            monto: parseFloat(amount),

            fuente: category,

            fecha: date,

            descripcion: description || null,
          });
        } else {
          const catRes = await api.post("/finanzas/categoria", {
            nombre: category,
          });

          await api.post("/finanzas/gastos", {
            monto: parseFloat(amount),

            descripcion: description,

            fecha: date,

            categoria_id: catRes.data.id,
          });
        }

        mostrarAlerta("Transacción guardada exitosamente");
      }

      // ─────────────────────────────────
      // REFRESH
      // ─────────────────────────────────
      await obtenerHistorial();

      resetFormulario();
    } catch (err) {
      console.error(err);

      mostrarAlerta("Ocurrió un error al guardar", "danger");
    }
  };

  const eliminarTransaccion = async (tipo, id) => {
    try {
      await api.delete(`/finanzas/movimiento/${tipo}/${id}`);
      mostrarAlerta("Movimiento eliminado correctamente");
      await obtenerHistorial();
      resetFormulario();
    } catch (err) {
      console.error(err);
      mostrarAlerta("Error al eliminar movimiento", "danger");
    }
  };

  const resetFormulario = () => {
    setModalVisible(false);
    setModoEdicion(false);
    setTransaccionSeleccionada(null);
    setNewTransaction({
      type: "gasto",
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const abrirModal = (tipo) => {
    resetFormulario();
    setNewTransaction((prev) => ({ ...prev, type: tipo }));
    setModalVisible(true);
  };

  const handleEditarTransaccion = (t) => {
    setModalVisible(true);
    setModoEdicion(true);
    setTransaccionSeleccionada(t);

    setNewTransaction({
      type: t.type,
      category:
        t.type === "ingreso"
          ? t.fuente || t.categoria || ""
          : t.categoria || "",
      description: t.descripcion || "",
      amount: t.monto || "",
      date: t.fecha
        ? t.fecha.split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
  };

  const filtered = useMemo(() => {
    if (filter === "todos") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [filter, transactions]);

  const formatCurrency = (v) => `Q ${parseFloat(v).toFixed(2)}`;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  /* ── Clases ──────────────────────────────────────────── */
  const card = `rounded-xl p-4 cursor-pointer transition-all duration-200
    hover:scale-[1.02] active:scale-[0.98]
    ${
      modoOscuro
        ? "bg-[#1a1a1a] text-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
        : "bg-white text-[#2e2828] shadow-[0_2px_8px_rgba(0,0,0,0.07)]"
    }`;

  const inputCls = `w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors
    ${
      modoOscuro
        ? "bg-[#262626] text-gray-100 border border-white/15 focus:border-[#00c57a]"
        : "bg-gray-50 text-[#2e2828] border border-gray-200 focus:border-[#00c57a]"
    }`;

  const muted = modoOscuro ? "text-gray-400" : "text-gray-500";

  const modalBg = modoOscuro
    ? "bg-[#1a1a1a] text-gray-100"
    : "bg-white text-[#2e2828]";

  const isIngreso = newTransaction.type === "ingreso";

  return (
    <div className="w-full pb-4">
      {/* ── Alerta ───────────────────────────────────────── */}
      {alerta && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm text-center font-medium
          ${
            alerta.tipo === "success"
              ? "bg-[#00c57a]/10 text-[#00c57a] border border-[#00c57a]/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {alerta.mensaje}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h4 className="font-bold text-xl">Transacciones</h4>
        <div className="flex gap-2">
          <button
            onClick={() => abrirModal("ingreso")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                       bg-[#00c57a] text-white hover:bg-[#00a865] transition-colors
                       shadow-[0_2px_10px_rgba(0,197,122,0.3)]"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Ingreso
          </button>
          <button
            onClick={() => abrirModal("gasto")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                       bg-red-500 text-white hover:bg-red-600 transition-colors
                       shadow-[0_2px_10px_rgba(239,68,68,0.3)]"
          >
            <Icon icon="lucide:minus" className="w-4 h-4" />
            Gasto
          </button>
        </div>
      </div>

      {/* ── Filtros ───────────────────────────────────────── */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          {
            id: "todos",
            label: "Todos",
            color:
              "bg-[#00c57a] text-white shadow-[0_0_10px_rgba(0,197,122,0.3)]",
          },
          {
            id: "ingreso",
            label: "Ingresos",
            color:
              "bg-[#00c57a] text-white shadow-[0_0_10px_rgba(0,197,122,0.3)]",
          },
          {
            id: "gasto",
            label: "Gastos",
            color:
              "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]",
          },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-200 shrink-0
              ${
                filter === f.id
                  ? f.color
                  : modoOscuro
                    ? "text-gray-400 bg-white/5 hover:bg-white/10"
                    : "text-gray-500 bg-black/5 hover:bg-black/10"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Lista ────────────────────────────────────────── */}
      <div className="overflow-y-auto pr-1" style={{ maxHeight: "460px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <div
              key={`${t.type}-${t.id}`}
              className={card}
              onClick={() => handleEditarTransaccion(t)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm truncate pr-2">
                  {t.description}
                </span>
                <span
                  className={`font-bold text-sm shrink-0
    ${t.type === "ingreso" ? "text-[#00c57a]" : "text-red-400"}`}
                >
                  {t.type === "ingreso" ? "+" : "-"}
                  {formatCurrency(t.amount || t.monto)}
                </span>
              </div>

              {/* Descripción solo si existe y es diferente al título */}
              {t.descripcion && t.descripcion !== t.description && (
                <p
                  className={`text-xs mb-1 italic ${modoOscuro ? "text-gray-300" : "text-gray-500"}`}
                >
                  {t.descripcion}
                </p>
              )}

              <p className={`text-xs ${muted}`}>• {formatDate(t.fecha)}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className={`text-sm ${muted}`}>
              No hay transacciones para mostrar.
            </p>
          )}
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────── */}
      {modalVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) resetFormulario();
          }}
        >
          <div
            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl
            transition-all duration-300 ${modalBg}`}
          >
            {/* Header modal */}
            <div className="flex justify-between items-center mb-5">
              <h5 className="font-bold text-lg">
                {modoEdicion ? "Editar" : "Nueva"}{" "}
                <span className={isIngreso ? "text-[#00c57a]" : "text-red-400"}>
                  {isIngreso ? "Ingreso" : "Gasto"}
                </span>
              </h5>
              <button
                onClick={resetFormulario}
                className={`w-8 h-8 rounded-full flex items-center justify-center
                  transition-colors ${modoOscuro ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle tipo */}
            <div
              className={`flex rounded-xl p-1 mb-4
              ${modoOscuro ? "bg-[#111]" : "bg-gray-100"}`}
            >
              <button
                onClick={() =>
                  setNewTransaction({
                    ...newTransaction,
                    type: "ingreso",
                    category: "",
                  })
                }
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    newTransaction.type === "ingreso"
                      ? "bg-[#00c57a] text-white shadow-sm"
                      : modoOscuro
                        ? "text-gray-400"
                        : "text-gray-500"
                  }`}
              >
                Ingreso
              </button>
              <button
                onClick={() =>
                  setNewTransaction({
                    ...newTransaction,
                    type: "gasto",
                    category: "",
                  })
                }
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    newTransaction.type === "gasto"
                      ? "bg-red-500 text-white shadow-sm"
                      : modoOscuro
                        ? "text-gray-400"
                        : "text-gray-500"
                  }`}
              >
                Gasto
              </button>
            </div>

            {/* Campos */}
            <div className="flex flex-col gap-3">
              {/* Categoría */}
              <select
                className={inputCls}
                value={newTransaction.category}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    category: e.target.value,
                  })
                }
              >
                <option value="" disabled>
                  Seleccione categoría
                </option>
                {isIngreso
                  ? fuentesIngreso.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))
                  : categorias.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
              </select>

              {/* Descripción */}
              <input
                type="text"
                className={inputCls}
                placeholder="Descripción (opcional)"
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    description: e.target.value,
                  })
                }
              />

              {/* Monto */}
              <div className="flex">
                <span
                  className={`px-3 py-2.5 rounded-l-lg text-sm border-y border-l font-medium
                  ${
                    modoOscuro
                      ? "bg-[#333] border-white/15 text-gray-300"
                      : "bg-gray-100 border-gray-200 text-gray-500"
                  }`}
                >
                  Q
                </span>
                <input
                  type="number"
                  min="1"
                  className={`flex-1 px-3 py-2.5 rounded-r-lg text-sm outline-none border
                    ${
                      modoOscuro
                        ? "bg-[#262626] text-gray-100 border-white/15 focus:border-[#00c57a]"
                        : "bg-gray-50 text-[#2e2828] border-gray-200 focus:border-[#00c57a]"
                    }`}
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value,
                    })
                  }
                />
              </div>

              {/* Fecha */}
              <input
                type="date"
                className={inputCls}
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
              />
            </div>

            {/* Botones modal */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={resetFormulario}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${
                    modoOscuro
                      ? "bg-white/5 text-gray-300 hover:bg-white/10"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTransaction}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                  transition-colors ${
                    isIngreso
                      ? "bg-[#00c57a] hover:bg-[#00a865]"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {modoEdicion ? "Actualizar" : "Guardar"}
              </button>
              {modoEdicion && (
                <button
                  onClick={() =>
                    eliminarTransaccion(
                      transaccionSeleccionada.type,
                      transaccionSeleccionada.id,
                    )
                  }
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10
                             text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  <Icon icon="lucide:trash-2" className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaccionesUsuario;
