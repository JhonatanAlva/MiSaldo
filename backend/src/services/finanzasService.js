const db = require('../config/db');

// ── Agregar ingreso ───────────────────────────────────────────
const agregarIngreso = async (usuarioId, { monto, fuente, fecha }) => {
    await db.query(
        'INSERT INTO ingresos (usuario_id, monto, fuente, fecha) VALUES ($1, $2, $3, $4)',
        [usuarioId, monto, fuente, fecha]
    );
};

// ── Agregar gasto ─────────────────────────────────────────────
const agregarGasto = async (usuarioId, { monto, descripcion, fecha, categoria_id }) => {
    await db.query(
        'INSERT INTO gastos (usuario_id, categoria_id, monto, descripcion, fecha) VALUES ($1, $2, $3, $4, $5)',
        [usuarioId, categoria_id, monto, descripcion, fecha]
    );
};

// ── Obtener ingresos ──────────────────────────────────────────
const getIngresos = async (usuarioId) => {
    const result = await db.query(
        'SELECT * FROM ingresos WHERE usuario_id = $1',
        [usuarioId]
    );
    return result.rows;
};

// ── Obtener gastos ────────────────────────────────────────────
const getGastos = async (usuarioId) => {
    const result = await db.query(
        'SELECT * FROM gastos WHERE usuario_id = $1',
        [usuarioId]
    );
    return result.rows;
};

// ── Resumen financiero ────────────────────────────────────────
// MySQL: DATE_FORMAT, YEARWEEK, QUARTER → PostgreSQL: TO_CHAR, DATE_TRUNC, EXTRACT
const getResumen = async (usuarioId, { tipo, inicio, fin }) => {
    let agrupacion = '';
    let extraWhere = '';
    const params = [usuarioId, usuarioId];

    if (tipo === 'mensual') {
        agrupacion = "TO_CHAR(fecha, 'YYYY-MM')";
    } else if (tipo === 'trimestral') {
        agrupacion = "CONCAT(EXTRACT(YEAR FROM fecha), '-T', EXTRACT(QUARTER FROM fecha))";
    } else if (tipo === 'diario') {
        agrupacion = "TO_CHAR(fecha, 'YYYY-MM-DD')";
    } else if (tipo === 'semanal') {
        agrupacion = "TO_CHAR(DATE_TRUNC('week', fecha), 'IYYY-IW')";
    } else if (tipo === 'personalizado' && inicio && fin) {
        agrupacion = "TO_CHAR(fecha, 'YYYY-MM')";
        extraWhere = 'AND fecha BETWEEN $3 AND $4';
        params.push(inicio, fin);
    } else {
        return { error: 400, mensaje: 'Tipo no válido' };
    }

    const result = await db.query(`
    SELECT
      ${agrupacion} AS periodo,
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS ingresos,
      SUM(CASE WHEN tipo = 'gasto'   THEN monto ELSE 0 END) AS gastos
    FROM (
      SELECT fecha, monto, 'ingreso' AS tipo FROM ingresos WHERE usuario_id = $1 ${extraWhere}
      UNION ALL
      SELECT fecha, monto, 'gasto'   AS tipo FROM gastos   WHERE usuario_id = $2 ${extraWhere}
    ) movimientos
    GROUP BY periodo
    ORDER BY periodo DESC
  `, params);

    return result.rows.map(r => ({
        periodo: r.periodo,
        ingresos: Number(r.ingresos),
        gastos: Number(r.gastos),
        saldo: Number(r.ingresos) - Number(r.gastos),
    }));
};

// ── Movimientos recientes ─────────────────────────────────────
const getMovimientosRecientes = async (usuarioId) => {
    const [ingresos, gastos] = await Promise.all([
        db.query('SELECT * FROM ingresos WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 5', [usuarioId]),
        db.query('SELECT * FROM gastos   WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 5', [usuarioId]),
    ]);
    return { ingresos: ingresos.rows, gastos: gastos.rows };
};

// ── Crear categoría si no existe ──────────────────────────────
const crearCategoriaLocal = async (usuarioId, nombre) => {
    const existe = await db.query(
        'SELECT id FROM categorias WHERE nombre = $1',
        [nombre]
    );
    if (existe.rows.length > 0) return existe.rows[0].id;

    const result = await db.query(
        'INSERT INTO categorias (nombre, creada_por, es_global) VALUES ($1, $2, FALSE) RETURNING id',
        [nombre, usuarioId]
    );
    return result.rows[0].id;
};

// ── Categorías del usuario ────────────────────────────────────
const getCategorias = async (usuarioId) => {
    const result = await db.query(
        `SELECT id, nombre FROM categorias
     WHERE es_global = TRUE OR creada_por = $1
     ORDER BY nombre ASC`,
        [usuarioId]
    );
    return result.rows;
};

// ── Clasificación de gastos por categoría ─────────────────────
const getClasificacionGastos = async (usuarioId) => {
    const result = await db.query(`
    SELECT c.nombre AS categoria, SUM(g.monto) AS total
    FROM gastos g
    JOIN categorias c ON g.categoria_id = c.id
    WHERE g.usuario_id = $1
    GROUP BY c.nombre
    ORDER BY total DESC
  `, [usuarioId]);
    return result.rows;
};

// ── Clasificación de ingresos por fuente ──────────────────────
const getClasificacionIngresos = async (usuarioId) => {
    const result = await db.query(`
    SELECT fuente, SUM(monto) AS total
    FROM ingresos
    WHERE usuario_id = $1
    GROUP BY fuente
    ORDER BY total DESC
  `, [usuarioId]);
    return result.rows;
};

// ── Balance agrupado ──────────────────────────────────────────
const getBalance = async (usuarioId, { tipo = 'mensual', inicio, fin }) => {
    let agrupacion = '';

    switch (tipo) {
        case 'diario':
            agrupacion = "TO_CHAR(fecha, 'YYYY-MM-DD')";
            break;
        case 'semanal':
            agrupacion = "TO_CHAR(DATE_TRUNC('week', fecha), 'IYYY-IW')";
            break;
        case 'trimestral':
            agrupacion = "CONCAT(EXTRACT(YEAR FROM fecha), '-T', EXTRACT(QUARTER FROM fecha))";
            break;
        case 'personalizado':
            agrupacion = "TO_CHAR(fecha, 'YYYY-MM-DD')";
            break;
        case 'mensual':
        default:
            agrupacion = "TO_CHAR(fecha, 'YYYY-MM')";
    }

    const esFiltroFecha = tipo === 'personalizado' && inicio && fin;
    const filtroFecha = esFiltroFecha ? 'AND fecha BETWEEN $2 AND $3' : '';
    const paramsBase = esFiltroFecha ? [usuarioId, inicio, fin] : [usuarioId];

    const result = await db.query(`
    SELECT 'Ingreso' AS tipo, ${agrupacion} AS periodo, SUM(monto) AS total
    FROM ingresos WHERE usuario_id = $1 ${filtroFecha}
    GROUP BY periodo
    UNION
    SELECT 'Gasto' AS tipo, ${agrupacion} AS periodo, SUM(monto) AS total
    FROM gastos WHERE usuario_id = $1 ${filtroFecha}
    GROUP BY periodo
    ORDER BY periodo, tipo
  `, paramsBase);

    const agrupados = {};
    result.rows.forEach(fila => {
        if (!agrupados[fila.periodo]) {
            agrupados[fila.periodo] = { mes: fila.periodo, ingresos: 0, gastos: 0 };
        }
        if (fila.tipo === 'Ingreso') agrupados[fila.periodo].ingresos = parseFloat(fila.total);
        else agrupados[fila.periodo].gastos = parseFloat(fila.total);
    });

    return Object.values(agrupados);
};

// ── Historial de movimientos ──────────────────────────────────
const getHistorial = async (usuarioId, { fechaInicio, fechaFin }) => {
    const conFecha = fechaInicio && fechaFin;
    const filtro = conFecha ? 'AND fecha BETWEEN $2 AND $3' : '';
    const params = conFecha
        ? [usuarioId, fechaInicio, fechaFin]
        : [usuarioId];

    const result = await db.query(`
    SELECT id, 'Ingreso' AS tipo, fuente AS descripcion, monto, fecha
    FROM ingresos WHERE usuario_id = $1 ${filtro}
    UNION
    SELECT id, 'Gasto' AS tipo, descripcion, monto, fecha
    FROM gastos WHERE usuario_id = $1 ${filtro}
    ORDER BY fecha DESC
  `, params);

    return result.rows;
};

// ── Eliminar movimiento ───────────────────────────────────────
const eliminarMovimiento = async (tipo, id) => {
    const tabla = tipo === 'ingreso' ? 'ingresos' : tipo === 'gasto' ? 'gastos' : null;
    if (!tabla) return { error: 400, mensaje: 'Tipo inválido' };

    const result = await db.query(`DELETE FROM ${tabla} WHERE id = $1`, [id]);
    if (result.rowCount === 0) return { error: 404, mensaje: 'Movimiento no encontrado o ya eliminado' };
    return { ok: true };
};

// ── Editar movimiento ─────────────────────────────────────────
const editarMovimiento = async (tipo, id, body) => {
    const { monto, fuente, descripcion, fecha, categoria_id } = body;
    const fechaFormateada = new Date(fecha).toISOString().split('T')[0];

    let result;
    if (tipo === 'ingreso') {
        result = await db.query(
            'UPDATE ingresos SET monto = $1, fuente = $2, fecha = $3 WHERE id = $4',
            [monto, fuente, fechaFormateada, id]
        );
    } else if (tipo === 'gasto') {
        result = await db.query(
            'UPDATE gastos SET monto = $1, descripcion = $2, fecha = $3, categoria_id = $4 WHERE id = $5',
            [monto, descripcion, fechaFormateada, categoria_id, id]
        );
    } else {
        return { error: 400, mensaje: 'Tipo inválido' };
    }

    if (result.rowCount === 0) return { error: 404, mensaje: 'Movimiento no encontrado' };
    return { ok: true };
};

module.exports = {
    agregarIngreso,
    agregarGasto,
    getIngresos,
    getGastos,
    getResumen,
    getMovimientosRecientes,
    crearCategoriaLocal,
    getCategorias,
    getClasificacionGastos,
    getClasificacionIngresos,
    getBalance,
    getHistorial,
    eliminarMovimiento,
    editarMovimiento,
};