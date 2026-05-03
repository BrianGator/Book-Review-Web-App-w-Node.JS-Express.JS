import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import jwt from "jsonwebtoken";
import { publicRouter } from "./src/routes/general";
import { authRouter } from "./src/routes/auth";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  }));

  // Authentication Middleware
  app.use("/api/auth/*", (req: any, res, next) => {
    if (req.session.authorization) {
      const token = req.session.authorization['accessToken'];
      jwt.verify(token, "access", (err: any, user: any) => {
        if (!err) {
          req.user = user;
          next();
        } else {
          return res.status(403).json({ message: "User not authenticated" });
        }
      });
    } else {
      return res.status(403).json({ message: "User not logged in" });
    }
  });

  // API Routes
  app.use("/api", publicRouter);
  app.use("/api/auth", authRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
