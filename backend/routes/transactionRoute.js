import express from "express";
import {
  bookIssuanceDetails,
  booksIssuedInDateRange,
  getTotalRent,
  issueBook,
  returnBook,
  userbookissu,
} from "../Controllers/Transection.js";

const router = express.Router();

router.post("/issue/:bookname/:name/:issudate", issueBook); // 4 
router.post("/return/:bookname/:username/:returndate", returnBook); // 5
router.get("/book/issuance/:bookName", bookIssuanceDetails); // 6
router.get("/totalrent/:bookname", getTotalRent); // 7
router.get("/booksissued/:name", userbookissu); // 8
router.get("/books/issued", booksIssuedInDateRange); // 9

export default router;
