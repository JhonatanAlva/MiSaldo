const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  FRONTEND_URL: isProduction
    ? process.env.FRONTEND_URL
    : "http://localhost:5173",

  BACKEND_URL: isProduction
    ? process.env.BACKEND_URL
    : "http://localhost:5000",
};