import { Book } from "../Models/bookSchema.js";
import { User } from "../Models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

// create new book function
export const AddBook = catchAsyncErrors(async (req, res, next) => {
  const { bookName, category, bookrent } = req.body;
  if (!bookName || !category || !bookrent) {
    return next(new ErrorHandler("Please fill add data!", 400));
  }
  const data = await Book.create({ bookName, category, bookrent });
  res.status(201).json({
    success: true,
    message: "New Book Added..",
    data,
  });
});
// get all book funciton
export const getBook = catchAsyncErrors(async (req, res, next) => {
  const books = await Book.find();
  res.status(200).json({
    success: true,
    books,
  });
});
export const updateBook = catchAsyncErrors(async (req, res, next) => {
  const { bookName, category, bookrent } = req.body;
  const bookId = req.params.id;

  // Check if the book exists
  let book = await Book.findById(bookId);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  // Update the fields if they are provided
  book.bookName = bookName || book.bookName;
  book.category = category || book.category;
  book.bookrent = bookrent || book.bookrent;

  // Save the updated book
  await book.save();

  res.status(200).json({
    success: true,
    message: "Book updated successfully",
    data: book,
  });
});
export const deleteBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  await book.deleteOne();
  res.status(201).json({
    success: true,
    message: "Book deleted successfully",
  });
});


//done
export const searchBook = catchAsyncErrors(async (req, res, next) => {
  try {
    const { bookname } = req.params; // Use req.query to access query parameters

    if (!bookname) {
      return res.status(400).json({ message: "Book name is required" });
    }
    console.log(bookname);
    // Implement logic for search the book in the database here
    // Example:
    const book = await Book.find({ bookName: bookname });
    if (!book || book.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// done
export const bookPriceRange = catchAsyncErrors(async (req, res, next) => {
  try {
    const { minPrice, maxPrice } = req.query;

    // Check if either minPrice or maxPrice is provided
    if (!minPrice || !maxPrice) {
      return res.status(400).json({ message: "Both minPrice and maxPrice are required" });
    }

    // Convert minPrice and maxPrice to numbers
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    // Validate the range
    if (isNaN(min) || isNaN(max) || min > max) {
      return res.status(400).json({ message: "Invalid price range" });
    }

    // Find books within the specified price range
    const books = await Book.find({
      bookrent: { $gte: min, $lte: max }
    });

    if (!books || books.length === 0) {
      return next(new ErrorHandler("No books found in the specified price range", 404));
    }

    res.status(200).json({
      success: true,
      books,
    });
  } catch (error) {
    console.error(error); // Logging the error
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

//done
export const bookDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const { category, startRent, endRent } = req.query;

    // Build a query object based on the provided query parameters
    let query = {};

    if (category) {
      query.category = category;
    }
    if (startRent && endRent) {
      query.bookrent = { $gte: startRent, $lte: endRent }; // Book rent range between startRent and endRent
    }

    // If no query parameters are provided, return an error
    if (Object.keys(query).length === 0) {
      return next(new ErrorHandler("Query parameters are required", 400));
    }

    // Find the books that match the query and exclude specific fields
    const books = await Book.find(query).select('-users -returnCount -totalrent');

    // If no books are found, return a 404 error
    if (!books || books.length === 0) {
      return next(new ErrorHandler("No books found", 404));
    }

    // Respond with the list of books that match the query
    res.status(200).json({
      success: true,
      books,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

