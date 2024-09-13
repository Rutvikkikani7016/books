import express from "express";
import {
  AddBook,
  getBook,
  updateBook,
  deleteBook,
  searchBook,
  bookDetails,
  bookPriceRange,
} from "../Controllers/Book.js";

const router = express.Router();

router.get("/getbook", getBook); // get all book

router.get("/search/:bookname", searchBook); 
router.get('/books/price-range', bookPriceRange);
router.get("/books", bookDetails); 

router.post("/addbook", AddBook); // add new book
router.put("/updatebook/:id", updateBook); // update book
router.delete("deletebook/:id", deleteBook); // delete book

export default router;
