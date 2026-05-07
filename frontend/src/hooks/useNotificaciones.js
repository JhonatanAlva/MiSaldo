import { useEffect, useState } from "react";

import api from "../services/api";

const useNotificaciones = () => {

    const [notificaciones, setNotificaciones] =
        useState([]);

    const [cantidadNoLeidas, setCantidadNoLeidas] =
        useState(0);

    const [ultimaCantidad, setUltimaCantidad] =
        useState(0);

    // ─────────────────────────────────────
    // Obtener notificaciones
    // ─────────────────────────────────────
    const obtenerNotificaciones =
        async () => {

            try {

                const [
                    resNoti,
                    resCount,
                ] = await Promise.all([
                    api.get(
                        "/notificaciones/app"
                    ),
                    api.get(
                        "/notificaciones/no-leidas"
                    ),
                ]);

                const nuevasNotificaciones =
                    resNoti.data;

                const nuevaCantidad =
                    resCount.data.count;

                // ─────────────────────────
                // Push notifications
                // ─────────────────────────
                if (
                    "Notification" in window &&
                    Notification.permission ===
                    "granted"
                ) {

                    if (
                        nuevaCantidad >
                        ultimaCantidad
                    ) {

                        const nueva =
                            nuevasNotificaciones.find(
                                (n) => !n.leida
                            );

                        if (nueva) {

                            new Notification(
                                "MiSaldo",
                                {
                                    body:
                                        nueva.mensaje,
                                    icon:
                                        "/favicon.ico",
                                }
                            );

                        }

                    }

                }

                setUltimaCantidad(
                    nuevaCantidad
                );

                setNotificaciones(
                    nuevasNotificaciones
                );

                setCantidadNoLeidas(
                    nuevaCantidad
                );

            } catch (error) {

                console.error(
                    "Error notificaciones:",
                    error
                );

            }

        };

    // ─────────────────────────────────────
    // Marcar leída
    // ─────────────────────────────────────
    const marcarLeida =
        async (id) => {

            try {

                await api.put(
                    `/notificaciones/${id}/leer`
                );

                // ✅ eliminar visualmente
                setNotificaciones((prev) =>
                    prev.map((n) =>
                        n.id === id
                            ? {
                                ...n,
                                leida: true,
                            }
                            : n
                    )
                );

                setCantidadNoLeidas(
                    (prev) =>
                        prev > 0
                            ? prev - 1
                            : 0
                );

            } catch (error) {

                console.error(
                    "Error marcar leída:",
                    error
                );

            }

        };

    // ─────────────────────────────────────
    // Inicial
    // ─────────────────────────────────────
    useEffect(() => {

        obtenerNotificaciones();

        const interval =
            setInterval(() => {

                obtenerNotificaciones();

            }, 5000);

        return () =>
            clearInterval(interval);

    }, []);

    return {
        notificaciones,
        cantidadNoLeidas,
        marcarLeida,
    };

};

export default useNotificaciones;