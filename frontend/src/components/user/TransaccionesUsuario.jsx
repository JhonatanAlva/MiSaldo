import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import EstadoVacio from "../ui/EstadoVacio";

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

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
  const [guardando, setGuardando] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 15;

  const [newTransaction, setNewTransaction] = useState({
    type: "gasto",
    category: "",
    description: "",
    amount: "",
    date: localToday(),
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
      toast.error("Debes seleccionar una categoría");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    if (!date) {
      toast.error("Debes seleccionar una fecha");
      return;
    }

    if (type === "gasto" && !description.trim()) {
      toast.error("Debes ingresar una descripción del gasto");
      return;
    }

    setGuardando(true);
    const ikey = { headers: { "X-Idempotency-Key": idempotencyKey } };
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
          const catRes = await api.post("/finanzas/categoria", { nombre: category });
          payload.categoria_id = catRes.data.id;
        }

        await api.put(
          `/finanzas/movimiento/${type}/${transaccionSeleccionada.id}`,
          payload,
        );

        toast.success("Movimiento actualizado");
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
          }, ikey);
        } else {
          const catRes = await api.post("/finanzas/categoria", { nombre: category });
          await api.post("/finanzas/gastos", {
            monto: parseFloat(amount),
            descripcion: description,
            fecha: date,
            categoria_id: catRes.data.id,
          }, ikey);
        }

        toast.success("Transacción guardada");
      }

      await obtenerHistorial();
      resetFormulario();
    } catch (err) {
    } finally {
      setGuardando(false);
    }
  };

  const eliminarTransaccion = async (tipo, id) => {
    const result = await Swal.fire({
      title: "¿Eliminar movimiento?",

      text: "Esta acción no se puede deshacer.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Sí, eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#ef4444",

      cancelButtonColor: "#6b7280",

      background: modoOscuro ? "#1a1a1a" : "#ffffff",

      color: modoOscuro ? "#ffffff" : "#111827",

      borderRadius: "20px",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/finanzas/movimiento/${tipo}/${id}`);
      await obtenerHistorial();
      resetFormulario();
      toast.success("Movimiento eliminado");
    } catch (err) {
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
      date: localToday(),
    });
  };

  const abrirModal = (tipo) => {
    resetFormulario();
    setNewTransaction((prev) => ({ ...prev, type: tipo }));
    setIdempotencyKey(crypto.randomUUID());
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
        : localToday(),
    });
  };

  const filtered = useMemo(() => {
    let list = filter === "todos" ? transactions : transactions.filter((t) => t.type === filter);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(
        (t) =>
          (t.description || "").toLowerCase().includes(q) ||
          (t.descripcion || "").toLowerCase().includes(q) ||
          (t.categoria || "").toLowerCase().includes(q),
      );
    }
    if (fechaDesde) {
      list = list.filter((t) => (t.fecha || "").split("T")[0] >= fechaDesde);
    }
    if (fechaHasta) {
      list = list.filter((t) => (t.fecha || "").split("T")[0] <= fechaHasta);
    }
    return list;
  }, [filter, busqueda, fechaDesde, fechaHasta, transactions]);

  // Reset página cuando cambian los filtros
  useEffect(() => { setPagina(1); }, [filter, busqueda, fechaDesde, fechaHasta]);

  const totalPaginas = Math.max(1, Math.ceil(filtered.length / POR_PAGINA));
  const paginado = filtered.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const totals = useMemo(() => {
    const ingresos = filtered
      .filter((t) => t.type === "ingreso")
      .reduce((acc, t) => acc + parseFloat(t.amount || t.monto || 0), 0);
    const gastos = filtered
      .filter((t) => t.type === "gasto")
      .reduce((acc, t) => acc + parseFloat(t.amount || t.monto || 0), 0);
    return { ingresos, gastos };
  }, [filtered]);

  const formatCurrency = (v) => `Q ${parseFloat(v).toFixed(2)}`;
  const formatDate = (d) => {
    if (!d) return "";
    // Tomar solo la parte de fecha del string (antes de T)
    const soloFecha = d.includes("T") ? d.split("T")[0] : d;
    const [anio, mes, dia] = soloFecha.split("-");
    return new Date(anio, mes - 1, dia).toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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

      {/* ── Búsqueda ─────────────────────────────────────── */}
      <div className="relative mb-3">
        <Icon
          icon="lucide:search"
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`}
        />
        <input
          type="text"
          placeholder="Buscar por descripción o categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-colors
            ${modoOscuro
              ? "bg-[#1a1a1a] text-gray-100 border border-white/10 focus:border-[#00c57a]"
              : "bg-gray-50 text-[#2e2828] border border-gray-200 focus:border-[#00c57a]"
            }`}
        />
      </div>

      {/* ── Filtro de fecha ──────────────────────────────── */}
      <div className="flex gap-2 mb-3 items-end">
        <div className="flex-1">
          <label className={`text-xs block mb-1 ${muted}`}>Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors
              ${modoOscuro
                ? "bg-[#1a1a1a] text-gray-100 border border-white/10 focus:border-[#00c57a]"
                : "bg-gray-50 text-[#2e2828] border border-gray-200 focus:border-[#00c57a]"
              }`}
          />
        </div>
        <div className="flex-1">
          <label className={`text-xs block mb-1 ${muted}`}>Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors
              ${modoOscuro
                ? "bg-[#1a1a1a] text-gray-100 border border-white/10 focus:border-[#00c57a]"
                : "bg-gray-50 text-[#2e2828] border border-gray-200 focus:border-[#00c57a]"
              }`}
          />
        </div>
        {(fechaDesde || fechaHasta) && (
          <button
            onClick={() => { setFechaDesde(""); setFechaHasta(""); }}
            title="Limpiar fechas"
            className={`p-2 rounded-xl transition-colors mb-0.5
              ${modoOscuro ? "text-gray-400 hover:text-red-400 hover:bg-white/5" : "text-gray-400 hover:text-red-400 hover:bg-gray-100"}`}
          >
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Resumen del filtro ────────────────────────────── */}
      <div className={`flex justify-between items-center text-xs mb-2 px-1 ${muted}`}>
        <span>{filtered.length} transacción{filtered.length !== 1 ? "es" : ""}</span>
        <div className="flex gap-3">
          <span className="text-[#00c57a] font-medium">+{formatCurrency(totals.ingresos)}</span>
          <span className="text-red-400 font-medium">-{formatCurrency(totals.gastos)}</span>
        </div>
      </div>

      {/* ── Lista ────────────────────────────────────────── */}
      <div
        className={`rounded-xl divide-y
          ${modoOscuro ? "divide-white/5 bg-[#111]" : "divide-gray-100 bg-white shadow-sm"}`}
      >
        {paginado.map((t) => (
          <div
            key={`${t.type}-${t.id}`}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
              ${modoOscuro ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
            onClick={() => handleEditarTransaccion(t)}
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0
                ${t.type === "ingreso" ? "bg-[#00c57a]" : "bg-red-400"}`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{t.description}</p>
              {t.descripcion && t.descripcion !== t.description && (
                <p className={`text-xs truncate ${muted}`}>{t.descripcion}</p>
              )}
              <p className={`text-xs ${muted}`}>{formatDate(t.fecha)}</p>
            </div>
            <span
              className={`font-bold text-sm shrink-0
                ${t.type === "ingreso" ? "text-[#00c57a]" : "text-red-400"}`}
            >
              {t.type === "ingreso" ? "+" : "-"}{formatCurrency(t.amount || t.monto)}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <EstadoVacio
            icono="🔍"
            titulo="Sin resultados"
            descripcion="No hay transacciones que coincidan con los filtros aplicados."
          />
        )}
      </div>

      {/* ── Paginación ───────────────────────────────────── */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30
              ${modoOscuro ? "text-gray-300 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Icon icon="lucide:chevron-left" className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1)
            .reduce((acc, n, idx, arr) => {
              if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
              acc.push(n);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? (
                <span key={`dots-${idx}`} className={`px-1 text-sm ${muted}`}>…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPagina(item)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                    ${pagina === item
                      ? "bg-[#00c57a] text-white shadow-sm"
                      : modoOscuro
                        ? "text-gray-400 hover:bg-white/10"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                  {item}
                </button>
              )
            )}

          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30
              ${modoOscuro ? "text-gray-300 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Icon icon="lucide:chevron-right" className="w-4 h-4" />
          </button>
        </div>
      )}

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
                disabled={guardando}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                  transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    isIngreso
                      ? "bg-[#00c57a] hover:bg-[#00a865]"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {guardando ? "Guardando..." : (modoEdicion ? "Actualizar" : "Guardar")}
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
