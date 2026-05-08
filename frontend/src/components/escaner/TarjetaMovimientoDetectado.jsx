import React from "react";

const TarjetaMovimientoDetectado = ({
  movimiento,
  onEditar,
}) => {

  const esFijo =
    movimiento.tipo === "gasto-fijo";

  return (

    <div className="scanner-card-modern">

      {/* MONTO */}

      <div className="scanner-card-top">

        <div className="scanner-card-price">
          Q{movimiento.monto}
        </div>

        <button
          onClick={onEditar}
          className="scanner-card-edit"
        >
          ✏️ Editar
        </button>

      </div>

      {/* TITULO */}

      <h3 className="scanner-card-name">
        {movimiento.descripcion}
      </h3>

      {/* SUBTEXTO */}

      <p className="scanner-card-subtitle">
        Movimiento detectado automáticamente por IA
      </p>

      {/* TAGS */}

      <div className="scanner-card-tags">

        <div
          className={`
            scanner-card-tag
            ${
              esFijo
                ? "scanner-card-tag-fixed"
                : "scanner-card-tag-normal"
            }
          `}
        >
          {esFijo
            ? "💳 Gasto fijo"
            : "🧾 Gasto normal"}
        </div>

        {esFijo &&
          movimiento.cuotas && (

            <div className="scanner-card-cuotas">
              📆 {movimiento.cuotas}
            </div>

          )}

      </div>

    </div>
  );
};

export default TarjetaMovimientoDetectado;