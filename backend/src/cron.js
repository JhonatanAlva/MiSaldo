const cron = require('node-cron');

const db = require('./config/db');

const gastosFijosService =
  require('./services/gastosFijosService');

const notificacionesService =
  require('./services/notificacionesService');

// ─────────────────────────────────────────────
// Ejecutar cada minuto
// ─────────────────────────────────────────────
cron.schedule('* * * * *', async () => {

  console.log(
    'Verificando gastos fijos...'
  );

  try {

    const gastos =
      await gastosFijosService.obtenerGastosPorCobrar();

    const hoy = new Date();

    const fechaHoy =
      hoy.toISOString().split('T')[0];

    const diaActual =
      hoy.getDate();

    for (const gasto of gastos) {

      // ─────────────────────────────────────
      // RECORDATORIO 1 DÍA ANTES
      // ─────────────────────────────────────
      const manana =
        gasto.dia_cobro - 1;

      if (manana === diaActual) {

        const mensajeRecordatorio =
          gasto.tiene_cuotas
            ? `⏰ Mañana se abonará automáticamente la cuota de "${gasto.nombre}" por Q${gasto.monto}`
            : `⏰ Mañana se cobrará automáticamente "${gasto.nombre}" por Q${gasto.monto}`;

        // evitar duplicados
        const existeRecordatorio =
          await db.query(
            `
            SELECT id
            FROM notificaciones
            WHERE usuario_id = $1
              AND mensaje LIKE $2
              AND DATE(creado_en) = CURRENT_DATE
            LIMIT 1
            `,
            [
              gasto.usuario_id,
              `%${gasto.nombre}%`,
            ]
          );

        if (
          existeRecordatorio.rows.length === 0
        ) {

          await notificacionesService.crearNotificacion(
            gasto.usuario_id,
            mensajeRecordatorio
          );

          await db.query(
            `
            UPDATE gastos_fijos
            SET ultima_notificacion = CURRENT_DATE
            WHERE id = $1
            `,
            [gasto.id]
          );

          console.log(
            `Recordatorio enviado: ${gasto.nombre}`
          );

        }

      }

      // ─────────────────────────────────────
      // SOLO PROCESAR SI ES EL DÍA DE COBRO
      // ─────────────────────────────────────
      if (
        gasto.dia_cobro !== diaActual
      ) {
        continue;
      }

      // ─────────────────────────────────────
      // EVITAR DUPLICAR COBROS
      // ─────────────────────────────────────
      if (
        gasto.ultimo_cobro &&
        gasto.ultimo_cobro
          .toISOString()
          .split('T')[0] ===
          fechaHoy
      ) {

        continue;

      }

      // ─────────────────────────────────────
      // CREAR GASTO AUTOMÁTICO
      // ─────────────────────────────────────
      await db.query(
        `
        INSERT INTO gastos
        (
          usuario_id,
          categoria_id,
          descripcion,
          monto,
          fecha
        )
        VALUES ($1, $2, $3, $4, NOW())
        `,
        [
          gasto.usuario_id,
          gasto.categoria_id,
          `Pago automático: ${gasto.nombre}`,
          gasto.monto,
        ]
      );

      // ─────────────────────────────────────
      // GUARDAR HISTORIAL
      // ─────────────────────────────────────
      await db.query(
        `
        INSERT INTO historial_gastos_fijos
        (
          gasto_fijo_id,
          usuario_id,
          monto,
          cuota_numero,
          fecha_pago
        )
        VALUES ($1, $2, $3, $4, NOW())
        `,
        [
          gasto.id,
          gasto.usuario_id,
          gasto.monto,

          gasto.tiene_cuotas
            ? gasto.cuotas_pagadas + 1
            : null,
        ]
      );

      // ─────────────────────────────────────
      // ACTUALIZAR CUOTAS
      // ─────────────────────────────────────
      if (
        gasto.tiene_cuotas &&
        gasto.cuotas_pagadas <
          gasto.cuotas_total
      ) {

        const nuevasCuotas =
          gasto.cuotas_pagadas + 1;

        const terminado =
          nuevasCuotas >=
          gasto.cuotas_total;

        await db.query(
          `
          UPDATE gastos_fijos
          SET
            cuotas_pagadas = $1,
            activo = $2
          WHERE id = $3
          `,
          [
            nuevasCuotas,
            !terminado,
            gasto.id,
          ]
        );

      }

      // ─────────────────────────────────────
      // ACTUALIZAR FECHA DE COBRO
      // ─────────────────────────────────────
      await db.query(
        `
        UPDATE gastos_fijos
        SET ultimo_cobro = CURRENT_DATE
        WHERE id = $1
        `,
        [gasto.id]
      );

      // ─────────────────────────────────────
      // MENSAJE FINAL
      // ─────────────────────────────────────
      const mensaje =
        gasto.tiene_cuotas
          ? `💳 Se abonó automáticamente la cuota de "${gasto.nombre}" por Q${gasto.monto}`
          : `📌 Se registró automáticamente el gasto "${gasto.nombre}" por Q${gasto.monto}`;

      // ─────────────────────────────────────
      // EVITAR DUPLICAR NOTIFICACIONES
      // ─────────────────────────────────────
      const existe =
        await db.query(
          `
          SELECT id
          FROM notificaciones
          WHERE usuario_id = $1
            AND mensaje LIKE $2
            AND DATE(creado_en) = CURRENT_DATE
          LIMIT 1
          `,
          [
            gasto.usuario_id,
            `%${gasto.nombre}%`,
          ]
        );

      if (
        existe.rows.length === 0
      ) {

        await notificacionesService.crearNotificacion(
          gasto.usuario_id,
          mensaje
        );

      }

      console.log(
        `Gasto procesado: ${gasto.nombre}`
      );

    }

  } catch (error) {

    console.error(
      'Error en cron:',
      error
    );

  }

});