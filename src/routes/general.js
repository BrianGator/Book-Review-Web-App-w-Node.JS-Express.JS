import express from "express";
import axios from "axios";
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

// Task 10: Get all books – Using async callback function (Axios)
publicRouter.get("/server/asyncactions/getallbooks", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3000/");
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all books", error: error.message });
  }
});

// Task 11: Get book details based on ISBN – Using Promises (Axios)
publicRouter.get("/server/asyncactions/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:3000/isbn/${isbn}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(error.response?.status || 500).json({ 
        message: "Error fetching book by ISBN", 
        error: error.response?.data?.message || error.message 
      });
    });
});

// Task 12: Get book details based on Author – Using Axios
publicRouter.get("/server/asyncactions/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:3000/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Task 13: Get book details based on Title – Using Axios
publicRouter.get("/server/asyncactions/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:3000/title/${title}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

// Added to support specific endpoint request: getbookreview
publicRouter.get("/getbookreview/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.status(200).json({
      message: `Reviews for book with ISBN ${isbn} retrieved successfully`,
      reviews: book.reviews
    });
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
  res.status(201).json({ message: "Customer successfully registered. Now you can login" });
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
    res.status(200).json({ message: "Customer successfully logged in" });
  } else {
    res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

export { publicRouter };
