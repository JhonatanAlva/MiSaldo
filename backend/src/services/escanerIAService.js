const { analizarImagenOpenAI } = require("../utils/openaiVision");
const logger = require("../utils/logger");

// ─────────────────────────────────────
// Limpiar JSON IA
// ─────────────────────────────────────
const limpiarJSON = (
    texto = ""
) => {

    // Si no es string
    if (
        typeof texto !== "string"
    ) {

        return "[]";

    }

    return texto
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

};

// ─────────────────────────────────────
// Analizar imagen
// ─────────────────────────────────────
const analizarImagen =
    async (rutaImagen) => {

        // ─────────────────────────────────
        // OpenAI Vision
        // ─────────────────────────────────
        const respuesta =
            await analizarImagenOpenAI(
                rutaImagen
            );

        try {

            // ─────────────────────────────────
            // Si ya viene como array
            // ─────────────────────────────────
            if (
                Array.isArray(
                    respuesta
                )
            ) {

                return {
                    movimientos:
                        respuesta,
                };

            }

            // ─────────────────────────────────
            // Si viene string JSON
            // ─────────────────────────────────
            if (
                typeof respuesta ===
                "string"
            ) {

                const limpio =
                    limpiarJSON(
                        respuesta
                    );

                const datos =
                    JSON.parse(
                        limpio
                    );

                return {
                    movimientos:
                        datos,
                };

            }

            // ─────────────────────────────────
            // Si viene objeto
            // ─────────────────────────────────
            if (
                typeof respuesta ===
                "object"
            ) {

                // compatibilidad:
                // { movimientos: [] }
                if (
                    respuesta.movimientos &&
                    Array.isArray(
                        respuesta.movimientos
                    )
                ) {

                    return {
                        movimientos:
                            respuesta.movimientos,
                    };

                }

                return {
                    movimientos:
                        respuesta,
                };

            }

            return {
                movimientos: [],
            };

        } catch (error) {

            logger.error({ err: error, raw: respuesta }, "Error parseando JSON de IA");

            return {
                movimientos: [],
                raw: respuesta,
            };

        }

    };

module.exports = {
    analizarImagen,
};