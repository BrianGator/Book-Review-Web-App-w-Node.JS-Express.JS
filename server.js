import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import jwt from "jsonwebtoken";
import { books } from "./src/db/books.js";
import { publicRouter } from "./src/routes/general.js";
import { authRouter } from "./src/routes/auth.js";

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
  app.use("/customer/auth/*", (req, res, next) => {
    if (req.session.authorization) {
      const token = req.session.authorization['accessToken'];
      jwt.verify(token, "access", (err, user) => {
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
  app.use("/customer", publicRouter);
  app.use("/customer/auth", authRouter);

  // Task 8 Support: Specific endpoint 'review' for add/modify (as requested)
  app.put("/review/:isbn", (req, res, next) => {
    if (req.session.authorization) {
      const token = req.session.authorization['accessToken'];
      jwt.verify(token, "access", (err, user) => {
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
  }, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user.data;
    if (!review) {
      return res.status(400).json({ message: "Review text is required" });
    }
    const book = books[isbn];
    if (book) {
      book.reviews[username] = review;
      res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated.`, reviews: book.reviews });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });

  // Task 9 Support: Specific endpoint 'review' for delete (as requested)
  app.delete("/review/:isbn", (req, res, next) => {
    if (req.session.authorization) {
      const token = req.session.authorization['accessToken'];
      jwt.verify(token, "access", (err, user) => {
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
  }, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.data;
    const book = books[isbn];
    if (book) {
      if (book.reviews[username]) {
        delete book.reviews[username];
        res.status(200).json({ message: `Review for the ISBN ${isbn} posted by the user ${username} deleted.` });
      } else {
        res.status(404).json({ message: "Review not found for this user" });
      }
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });

  // Also mount publicRouter at root to support root-level endpoints if requested
  app.use("/", publicRouter);

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
