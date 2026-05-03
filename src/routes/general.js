import express from "express";
import { books } from "../db/books.js";
import { users } from "../db/users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const publicRouter = express.Router();

// Task 1: Get all books
publicRouter.get("/", (req, res) => {
  res.status(200).json(books);
});

// Task 2: Get book by ISBN
publicRouter.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get books by author
publicRouter.get("/author/:author", (req, res) => {
  const author = req.params.author;
  const filteredBooks = Object.values(books).filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
  res.status(200).json(filteredBooks);
});

// Task 4: Get books by title
publicRouter.get("/title/:title", (req, res) => {
  const title = req.params.title;
  const filteredBooks = Object.values(books).filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
  res.status(200).json(filteredBooks);
});

// Task 5: Get book reviews
publicRouter.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 6: Register user
publicRouter.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(400).json({ message: "Username already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash });
  res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 7: Login user
publicRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    res.status(200).json({ message: "User successfully logged in" });
  } else {
    res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

export { publicRouter };
