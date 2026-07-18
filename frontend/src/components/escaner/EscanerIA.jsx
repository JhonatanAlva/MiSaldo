import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Swal from "sweetalert2";
import { toast } from "sonner";
import api from "../../services/api";
import TarjetaMovimientoDetectado from "./TarjetaMovimientoDetectado";
import ModalMovimientoEscaneado from "./ModalMovimientoEscaneado";
import { construirMovimientoInicial } from "./utils";

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EscanerIA = () => {

  const [preview, setPreview] = useState(null);
  const [imagen, setImagen] = useState(null);

  const [resultado, setResultado] = useState(() => {
    const data = sessionStorage.getItem("scanner_resultado");
    return data ? JSON.parse(data) : [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [movimientoActual, setMovimientoActual] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("scanner_resultado", JSON.stringify(resultado));
  }, [resultado]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setImagen(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const analizarImagen = async () => {
    if (!imagen) {
      toast.error("Selecciona una imagen primero");
      return;
    }

    try {
      setCargando(true);

      const formData = new FormData();
      formData.append("imagen", imagen);

      const res = await api.post("/escaner-ia", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const movimientos = (res.data.movimientos || []).map(construirMovimientoInicial);
      setResultado(movimientos);

    } catch (error) {
      console.error(error);
      toast.error("No se pudo analizar la imagen");
    } finally {
      setCargando(false);
    }
  };

  // ─────────────────────────────────────────────
  // Eliminar imagen
  // ─────────────────────────────────────────────
  const eliminarImagen = () => {
    setImagen(null);
    setPreview(null);
    setResultado([]);

    sessionStorage.removeItem("scanner_resultado");
  };

  // ─────────────────────────────────────────────
  // Limpiar todo
  // ─────────────────────────────────────────────
  const limpiarTodo = async () => {

    const result = await Swal.fire({
      title: "¿Limpiar todo?",
      text: "Se eliminarán la imagen y todos los movimientos detectados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, limpiar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#1e1e1e",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    eliminarImagen();
  };

  // ─────────────────────────────────────────────
  // Modal
  // ─────────────────────────────────────────────
  const abrirModal = (movimiento) => {
    setMovimientoActual({
      ...movimiento,
      descripcionOriginal: movimiento.descripcion,
    });

    setModalOpen(true);
  };

  const actualizarMovimiento = (campo, valor) => {
    setMovimientoActual((prev) => {

      const actualizado = {
        ...prev,
        [campo]: valor,
      };

      if (campo === "tipo" && valor === "gasto") {
        actualizado.cuotas = "";
        actualizado.diaCobro = "";
      }

      return actualizado;
    });
  };

  // ─────────────────────────────────────────────
  // Guardar movimiento
  // ─────────────────────────────────────────────
  const guardarMovimiento = async () => {

    try {

      const mov = movimientoActual;

      // Actualizar lista local
      const nuevos = resultado.map((item) =>
        item.descripcion === mov.descripcionOriginal ? mov : item
      );

      setResultado(nuevos);

      // ─────────────────────────
      // GASTO FIJO
      // ─────────────────────────
      if (mov.tipo === "gasto-fijo") {

        let cuotasTotal = null;
        let cuotasPagadas = 0;

        const cuotasStr = String(mov.cuotas || "");

        if (cuotasStr.includes("/")) {

          const [p, t] = cuotasStr.split("/").map(Number);

          cuotasPagadas = isNaN(p) ? 0 : p;
          cuotasTotal = isNaN(t) || t === 0 ? null : t;

        } else if (cuotasStr !== "") {

          cuotasTotal = Number(cuotasStr) || null;
          cuotasPagadas = 0;
        }

        const tieneCuotas =
          cuotasTotal !== null && cuotasTotal > 0;

        await api.post("/gastos-fijos", {
          nombre: mov.descripcion,
          monto: Number(mov.monto),
          dia_cobro:
            Number(mov.diaCobro) || new Date().getDate(),
          categoria_id: mov.categoria_id
            ? Number(mov.categoria_id)
            : null,
          tiene_cuotas: tieneCuotas,
          cuotas_total: tieneCuotas
            ? cuotasTotal
            : null,
          cuotas_pagadas: tieneCuotas
            ? cuotasPagadas
            : null,
          activo: true,
        });

      } else {

        // ─────────────────────────
        // GASTO NORMAL
        // ─────────────────────────

        let categoriaId = mov.categoria_id
          ? Number(mov.categoria_id)
          : null;

        if (!categoriaId && mov.categoriaNombre) {

          const catRes = await api.post(
            "/finanzas/categoria",
            {
              nombre: mov.categoriaNombre,
            }
          );

          categoriaId = catRes.data.id;
        }

        await api.post("/finanzas/gastos", {
          monto: Number(mov.monto),
          descripcion: mov.descripcion,
          fecha: localToday(),
          categoria_id: categoriaId,
        });
      }

      toast.success("Movimiento guardado");
      setModalOpen(false);

    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el movimiento");
    }
  };

  return (

    <div className="scanner-container">

      {/* ───────────────────────────── */}
      {/* HEADER */}
      {/* ───────────────────────────── */}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

        <div>
          <h1 className="scanner-title">
            📷 Escáner IA
          </h1>

          <p className="scanner-subtitle">
            Escanea facturas, recibos o movimientos automáticamente usando IA
          </p>
        </div>

        {(preview || resultado.length > 0) && (
          <button
            onClick={limpiarTodo}
            className="
              d-flex align-items-center gap-2
              px-4 py-2
              rounded-4
              border border-danger
              text-danger
              bg-transparent
            "
          >
            🗑 Limpiar todo
          </button>
        )}

      </div>

      {/* ───────────────────────────── */}
      {/* DROPZONE */}
      {/* ───────────────────────────── */}

      <div
        {...getRootProps()}
        className={`scanner-dropzone ${
          isDragActive
            ? "scanner-dropzone-active"
            : ""
        }`}
      >

        <input {...getInputProps()} />

        <div className="scanner-upload-icon">
          📤
        </div>

        <h3 className="scanner-upload-title">
          Arrastra una imagen aquí
        </h3>

        <p className="scanner-upload-text">
          o toca para seleccionar una imagen desde tu dispositivo
        </p>

      </div>

      {/* ───────────────────────────── */}
      {/* PREVIEW */}
      {/* ───────────────────────────── */}

      {preview && (

        <div className="scanner-preview-card">

          <img
            src={preview}
            alt="preview"
            className="scanner-preview-image"
          />

          <div className="d-flex flex-wrap gap-3">

            <button
              onClick={analizarImagen}
              disabled={cargando}
              className="
                btn btn-success
                px-4 py-3
                rounded-4
                fw-bold
              "
            >
              {cargando
                ? "⏳ Analizando..."
                : "🔍 Analizar imagen"}
            </button>

            <button
              onClick={eliminarImagen}
              className="
                btn btn-outline-danger
                px-4 py-3
                rounded-4
                fw-bold
              "
            >
              🗑 Eliminar imagen
            </button>

          </div>

        </div>
      )}

      {/* ───────────────────────────── */}
      {/* RESULTADOS */}
      {/* ───────────────────────────── */}

      {resultado.length > 0 && (

        <div className="row g-4">

          {resultado.map((mov, index) => (

            <div
              className="col-12 col-md-6 col-xl-4"
              key={index}
            >

              <TarjetaMovimientoDetectado
                movimiento={mov}
                seleccionado={mov.seleccionado}
                onSeleccionar={() => {

                  const copia = [...resultado];

                  copia[index].seleccionado =
                    !copia[index].seleccionado;

                  setResultado(copia);
                }}
                onEditar={() => abrirModal(mov)}
              />

            </div>
          ))}

        </div>
      )}

      {/* ───────────────────────────── */}
      {/* MODAL */}
      {/* ───────────────────────────── */}

      <ModalMovimientoEscaneado
        abierto={modalOpen}
        movimiento={movimientoActual}
        onClose={() => setModalOpen(false)}
        onChange={actualizarMovimiento}
        onGuardar={guardarMovimiento}
      />

    </div>
  );
};

export default EscanerIA;