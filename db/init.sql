-- ============================================================
-- MISALDO - Schema convertido de MySQL/MariaDB a PostgreSQL
-- Generado: 2026-04-22
-- ============================================================

-- Crear la base de datos (ejecuta esto por separado si es necesario)
-- CREATE DATABASE proyectofinanzas;

-- Conectarse a la DB antes de correr el resto:
-- \c proyectofinanzas

-- ============================================================
-- IMPORTANTE: El orden importa por las FK.
-- Tablas sin dependencias van primero.
-- ============================================================

-- ------------------------------------------------------------
-- 1. roles
-- ------------------------------------------------------------
DROP TABLE IF EXISTS roles CASCADE;
CREATE TABLE roles (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(50) NOT NULL,
  UNIQUE (nombre)
);

INSERT INTO roles (id, nombre) VALUES
  (1, 'Administrador'),
  (2, 'Usuario');

-- Sincronizar el serial para que el próximo INSERT use id=3
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));


-- ------------------------------------------------------------
-- 2. usuarios
-- ------------------------------------------------------------
DROP TABLE IF EXISTS usuarios CASCADE;
CREATE TABLE usuarios (
  id                   SERIAL PRIMARY KEY,
  nombres              VARCHAR(100) NOT NULL,
  apellidos            VARCHAR(100) NOT NULL,
  correo               VARCHAR(100) NOT NULL,
  celular              VARCHAR(20)  DEFAULT NULL,
  contrasena           VARCHAR(255) DEFAULT NULL,
  rol_id               INTEGER      DEFAULT NULL,
  confirmado           BOOLEAN      NOT NULL DEFAULT FALSE,
  token_confirmacion   VARCHAR(255) DEFAULT NULL,
  activo               BOOLEAN      NOT NULL DEFAULT TRUE,
  UNIQUE (correo),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
);

INSERT INTO usuarios (id, nombres, apellidos, correo, celular, contrasena, rol_id, confirmado, token_confirmacion, activo) VALUES
  (1,  'Jhonatan', 'Alvarado', 'alexisalvaradolool@gmail.com',      '55328760',  '$2b$10$N5ls9mMA9H4szqwhu2rf6.xwJXFzJmcaN.e3FvNo2xqOwnI9xaJCm', 1, TRUE,  NULL, TRUE),
  (2,  'Alexis',   'Alvarado', 'jloola@miumg.edu.gt',               '55328760',  '$2b$10$3NSBDB33XOXioR34rqpiDOZ2lxQmV3QeV3AIlJ/imeeUpBsZO.H0O',  2, TRUE,  NULL, TRUE),
  (17, 'Prueba',   'Anteproyecto', 'pruebaanteproyecto@gmail.com',  '55328760',  '$2b$10$nZfEx6sm0By0rutO1HTgL.JUemtsp23gI4O2yYAY2WRPEaG3Ac5Je',  2, TRUE,  NULL, TRUE);

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));


-- ------------------------------------------------------------
-- 3. categorias
-- ------------------------------------------------------------
DROP TABLE IF EXISTS categorias CASCADE;
CREATE TABLE categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  descripcion TEXT         DEFAULT NULL,
  creada_por  INTEGER      DEFAULT NULL,
  es_global   BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_categorias_usuario FOREIGN KEY (creada_por) REFERENCES usuarios (id) ON DELETE CASCADE
);




-- ------------------------------------------------------------
-- 4. configuraciones_usuario
-- ------------------------------------------------------------
DROP TABLE IF EXISTS configuraciones_usuario CASCADE;
CREATE TABLE configuraciones_usuario (
  id                  SERIAL PRIMARY KEY,
  usuario_id          INTEGER        NOT NULL,
  notif_email         BOOLEAN        NOT NULL DEFAULT TRUE,
  notif_push          BOOLEAN        NOT NULL DEFAULT TRUE,
  notif_weekly        BOOLEAN        NOT NULL DEFAULT TRUE,
  notif_monthly       BOOLEAN        NOT NULL DEFAULT TRUE,
  notif_tips          BOOLEAN        NOT NULL DEFAULT FALSE,
  formato             VARCHAR(10)    NOT NULL DEFAULT 'pdf',
  presupuesto_mensual NUMERIC(12,2)  DEFAULT NULL,
  umbral_alerta       INTEGER        NOT NULL DEFAULT 90,
  UNIQUE (usuario_id),
  CONSTRAINT fk_cfg_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);




-- ------------------------------------------------------------
-- 5. gastos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS gastos CASCADE;
CREATE TABLE gastos (
  id           SERIAL PRIMARY KEY,
  usuario_id   INTEGER        NOT NULL,
  categoria_id INTEGER        DEFAULT NULL,
  monto        NUMERIC(10,2)  NOT NULL,
  descripcion  TEXT           DEFAULT NULL,
  fecha        DATE           NOT NULL,
  creado_en    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gastos_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios   (id),
  CONSTRAINT fk_gastos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE
);




-- ------------------------------------------------------------
-- 6. ingresos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS ingresos CASCADE;
CREATE TABLE ingresos (
  id         SERIAL PRIMARY KEY,
  usuario_id INTEGER        NOT NULL,
  monto      NUMERIC(10,2)  NOT NULL,
  fuente     VARCHAR(100)   DEFAULT NULL,
  fecha      DATE           NOT NULL,
  creado_en  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ingresos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);




-- ------------------------------------------------------------
-- 7. plan_ahorro
-- NOTA: el ENUM de MySQL se convierte a VARCHAR con CHECK constraint
-- ------------------------------------------------------------
DROP TABLE IF EXISTS plan_ahorro CASCADE;
CREATE TABLE plan_ahorro (
  id           SERIAL PRIMARY KEY,
  usuario_id   INTEGER        DEFAULT NULL,
  descripcion  VARCHAR(255)   DEFAULT NULL,
  meta         NUMERIC(10,2)  DEFAULT NULL,
  fecha_inicio DATE           DEFAULT NULL,
  frecuencia   VARCHAR(20)    DEFAULT NULL
                 CHECK (frecuencia IN ('diario','semanal','quincenal','mensual')),
  creado_en    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_fin    DATE           DEFAULT NULL,
  monto_diario NUMERIC(10,2)  DEFAULT NULL,
  CONSTRAINT fk_plan_ahorro_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);




-- ------------------------------------------------------------
-- 8. abonos_ahorro
-- ------------------------------------------------------------
DROP TABLE IF EXISTS abonos_ahorro CASCADE;
CREATE TABLE abonos_ahorro (
  id         SERIAL PRIMARY KEY,
  usuario_id INTEGER        NOT NULL,
  plan_id    INTEGER        NOT NULL,
  monto      NUMERIC(10,2)  NOT NULL,
  fecha      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_abonos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios    (id),
  CONSTRAINT fk_abonos_plan    FOREIGN KEY (plan_id)    REFERENCES plan_ahorro (id)
);




-- ------------------------------------------------------------
-- 9. bitacora
-- ------------------------------------------------------------
DROP TABLE IF EXISTS bitacora CASCADE;
CREATE TABLE bitacora (
  id         SERIAL PRIMARY KEY,
  usuario_id INTEGER   DEFAULT NULL,
  accion     TEXT      NOT NULL,
  fecha      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bitacora_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

-- Los datos de bitacora son solo logs, se omiten para brevedad.
-- Si los necesitas, puedes copiar el INSERT original y cambiar las comillas.
-- Para insertar desde el dump original, reemplaza las comillas invertidas por nada.

SELECT setval('bitacora_id_seq', 365);


-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================