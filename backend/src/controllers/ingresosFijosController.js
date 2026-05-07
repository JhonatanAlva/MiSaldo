const ingresosFijosService =
    require(
        "../services/ingresosFijosService"
    );

// ─────────────────────────────────────
const getIngresosFijos =
    async (req, res) => {

        try {

            const data =
                await ingresosFijosService.getIngresosFijos(
                    req.usuario.id
                );

            res.json(data);

        } catch (err) {

            console.error(err);

            res.status(500).json({
                mensaje:
                    "Error al obtener ingresos fijos",
            });

        }

    };

// ─────────────────────────────────────
const crearIngresoFijo =
    async (req, res) => {

        try {

            const data =
                await ingresosFijosService.crearIngresoFijo(
                    req.usuario.id,
                    req.body
                );

            res.status(201).json(data);

        } catch (err) {

            console.error(err);

            res.status(500).json({
                mensaje:
                    "Error al crear ingreso fijo",
            });

        }

    };

// ─────────────────────────────────────
const editarIngresoFijo =
    async (req, res) => {

        try {

            const data =
                await ingresosFijosService.editarIngresoFijo(
                    req.params.id,
                    req.usuario.id,
                    req.body
                );

            if (!data) {

                return res.status(404).json({
                    mensaje:
                        "Ingreso fijo no encontrado",
                });

            }

            res.json(data);

        } catch (err) {

            console.error(err);

            res.status(500).json({
                mensaje:
                    "Error al editar ingreso fijo",
            });

        }

    };

// ─────────────────────────────────────
const eliminarIngresoFijo =
    async (req, res) => {

        try {

            const ok =
                await ingresosFijosService.eliminarIngresoFijo(
                    req.params.id,
                    req.usuario.id
                );

            if (!ok) {

                return res.status(404).json({
                    mensaje:
                        "Ingreso fijo no encontrado",
                });

            }

            res.json({
                mensaje:
                    "Ingreso fijo eliminado",
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                mensaje:
                    "Error al eliminar ingreso fijo",
            });

        }

    };

module.exports = {
    getIngresosFijos,
    crearIngresoFijo,
    editarIngresoFijo,
    eliminarIngresoFijo,
};