import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contact.js";
import applicationsRoutes from "./routes/applications.js";
import providersRoutes from "./routes/providers.js";
import requestsRoutes from "./routes/requests.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "saacare-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/providers", providersRoutes);
app.use("/api", requestsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
