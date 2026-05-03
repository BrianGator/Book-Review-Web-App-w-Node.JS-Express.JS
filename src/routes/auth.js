import express from "express";
import { books } from "../db/books.js";

const authRouter = express.Router();

// Task 8: Add or Modify a book review
authRouter.put("/review/:isbn", (req, res) => {
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

// Task 9: Delete a book review
authRouter.delete("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data;

  const book = books[isbn];
  if (book) {
    if (book.reviews[username]) {
      delete book.reviews[username];
      res.status(200).json({ message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.` });
    } else {
      res.status(404).json({ message: "Review not found for this user" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

export { authRouter };
