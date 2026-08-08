import "dotenv/config";

const config = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "saacare-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL est requis (voir backend/.env.example).");
}

export default config;
