export const detectarTipoMovimiento = (
  movimiento
) => {

  if (
    movimiento.cuotas &&
    movimiento.cuotas !== ""
  ) {

    return "gasto-fijo";

  }

  return "gasto";
};

export const obtenerDiaActual = () => {
  return new Date().getDate();
};

// ─────────────────────────────────────
// Crear movimiento inicial
// ─────────────────────────────────────
export const construirMovimientoInicial = (
  movimiento
) => {

  const tipo =
    detectarTipoMovimiento(movimiento);

  return {
    descripcion:
      movimiento.descripcion || "",

    monto:
      movimiento.monto || "",

    cuotas:
      movimiento.cuotas || "",

    tipo,

    diaCobro:
      obtenerDiaActual(),

    seleccionado: false,
  };
};