const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:5000";

const FRONTEND_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

module.exports = {
  BACKEND_URL,
  FRONTEND_URL,
};