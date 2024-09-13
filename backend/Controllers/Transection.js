import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Transaction } from "../Models/transectionSchema.js";
import { User } from "../Models/userSchema.js";
import { Book } from "../Models/bookSchema.js";
import moment from "moment"; // Import moment for date validation

export const bookIssuanceDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const { bookName } = req.params; // Get the book name from params

    if (!bookName) {
      return res.status(400).json({ message: "Book name is required" });
    }

    // Find the book by its name
    const book = await Book.findOne({ bookName });
    if (!book) {
      return next(new ErrorHandler("Book not found", 404));
    }

    // Find all past issuances and populate user details
    const pastTransactions = await Transaction.find({
      bookId: book._id,
    }).populate("userId");

    // Find the current holder of the book (if the book is issued currently)
    const currentTransaction = await Transaction.findOne({
      bookId: book._id,
      status: "Issued",
    }).populate("userId");

    // Prepare response data with past issuers' names and current holder
    const pastIssuers = pastTransactions.map((transaction) => ({
      userId: transaction.userId._id,
      name: transaction.userId.name, // Get the user's name
    }));

    const currentHolder = currentTransaction
      ? {
          userId: currentTransaction.userId._id,
          name: currentTransaction.userId.name, // Get current user's name
        }
      : null;

    // Send response
    res.status(200).json({
      success: true,
      bookName: book.bookName,
      pastIssuers: {
        totalCount: pastIssuers.length,
        users: pastIssuers, // Include user name and ID
      },
      currentHolder: currentHolder
        ? {
            userId: currentHolder.userId,
            name: currentHolder.name,
          }
        : "Not issued at the moment",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export const issueBook = catchAsyncErrors(async (req, res, next) => {
  const { bookname, name, issudate } = req.params;

  // Validate date format
  if (!moment(issudate, "YYYY-MM-DD", true).isValid()) {
    return res
      .status(400)
      .json({ message: "Invalid date format. Please use YYYY-MM-DD." });
  }

  // Find the user by name
  const user = await User.findOne({ name });
  if (!user) {
    return next(new ErrorHandler("Invalid user", 400));
  }

  // Find the book by name
  const book = await Book.findOne({ bookName: bookname });
  console.log(book);
  if (!book) {
    return next(new ErrorHandler("Invalid book", 400));
  }

  // Create a new transaction with the provided date as the issue date
  const newTransaction = new Transaction({
    bookId: book._id,
    userId: user._id,
    issueDate: new Date(issudate), // Use the provided date
    rent: book.bookrent, // Set the book rent in the transaction
  });

  // Save the new transaction
  await newTransaction.save();

  // Add bookId to the user's 'books' array
  user.books.push(book._id);
  await user.save();

  // Add userId to the book's 'users' array
  book.users.push(user._id);
  await book.save();

  res.status(201).json({
    message: "Book issued successfully",
    transaction: newTransaction,
  });
});

export const returnBook = catchAsyncErrors(async (req, res, next) => {
  const { bookname, username, returndate } = req.params;

  // Validate return date format
  if (!moment(returndate, "YYYY-MM-DD", true).isValid()) {
    return res
      .status(400)
      .json({ message: "Invalid date format. Please use YYYY-MM-DD." });
  }

  // Find the user by name
  const user = await User.findOne({ name: username });
  if (!user) {
    return next(new ErrorHandler("Invalid user", 400));
  }

  // Find the book by name
  const book = await Book.findOne({ bookName: bookname });
  if (!book) {
    return next(new ErrorHandler("Invalid book", 400));
  }

  // Find the corresponding issued transaction
  const transaction = await Transaction.findOne({
    bookId: book._id,
    userId: user._id,
    status: "Issued",
  });
  if (!transaction) {
    return res
      .status(404)
      .json({ message: "Transaction not found or book already returned" });
  }

  // Calculate return date (use provided or current date)
  const returnDateObj = returndate ? new Date(returndate) : new Date();

  // Calculate the number of days the book was rented
  const issueDate = transaction.issueDate;
  const daysRented = Math.ceil(
    (returnDateObj - issueDate) / (1000 * 60 * 60 * 24)
  );

  // Calculate the rent for the current period based on the book's rent per day
  const currentPeriodRent = daysRented * book.bookrent;

  // Update the transaction with the return date, current period rent, and status
  transaction.returnDate = returnDateObj;
  transaction.totalRent = currentPeriodRent; // Set the rent for this transaction
  transaction.status = "Returned";

  await transaction.save();

  // Update the book's total rent (Ensure it's correctly updated)
  book.totalrent += currentPeriodRent; // Increment the totalrent with the rent from this transaction

  // Save the updated book details
  await book.save();

  res.status(200).json({
    message: "Book returned successfully",
    transaction,
    book,
  });
});


// function for get total of the all book rent
export const getTotalRent = catchAsyncErrors(async (req, res, next) => {
  try {
    const { bookname } = req.params;
    // Calculate the total rent for all transactions
    const books = await Book.find({ bookName: bookname });
    const totalRent = books.reduce((sum, Book) => sum + Book.totalrent, 0);

    res.status(200).json({
      success: true,
      totalRent,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

//user book's details
export const userbookissu = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name } = req.params; // Get the user name from params

    // Find all users matching the name and populate their books
    const users = await User.find({ name }).populate("books"); // Use find instead of findOne

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract and merge all the books from the users' data
    const allBooks = users
      .map((user) => {
        return user.books.map((book) => {
          // Exclude 'users' field from book object
          const { users, ...bookDetails } = book._doc;
          return bookDetails;
        });
      })
      .flat(); // Flatten the array of books

    // Respond with all the issued books for the user(s)
    res.status(200).json({
      message: `Books issued by ${name}`,
      books: allBooks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

export const booksIssuedInDateRange1 = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.params;

      // Convert startDate and endDate to actual Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Find all transactions where the issueDate is within the specified date range
      const transactions = await Transaction.find({
        issueDate: { $gte: start, $lte: end },
      }).populate("bookId userId"); // Populate book and user details

      if (transactions.length === 0) {
        return res
          .status(404)
          .json({ message: "No books issued in the specified date range" });
      }

      // Map through transactions to create the response
      const booksIssued = transactions.map((transaction) => ({
        bookName: transaction.bookId.bookName,
        category: transaction.bookId.category,
        issuedTo: transaction.userId.name,
        issueDate: transaction.issueDate,
      }));

      // Respond with the list of books issued in the date range
      res.status(200).json({
        message: `Books issued between ${startDate} and ${endDate}`,
        booksIssued,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// not done
export const booksIssuedInDateRange = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;

      // Validate the presence of startDate and endDate
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ message: "Both startDate and endDate are required" });
      }

      // Convert dates to JavaScript Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate the date range
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return res.status(400).json({ message: "Invalid date range" });
      }

      // Find transactions within the date range
      const transactions = await Transaction.find({
        issueDate: { $gte: start, $lte: end },
        status: "Issued", // Ensure the book is still issued
      })
        .populate("bookId") // Populate book details
        .populate("userId"); // Populate user details

      // If no transactions are found, return an error
      if (!transactions || transactions.length === 0) {
        return next(
          new ErrorHandler("No books issued in the specified date range", 404)
        );
      }

      // Extract and format the result
      const result = transactions.map((transaction) => ({
        book: {
          bookName: transaction.bookId.bookName,
          category: transaction.bookId.category,
          bookrent: transaction.bookId.bookrent,
        },
        issuedTo: {
          userId: transaction.userId._id,
          userName: transaction.userId.name,
        },
        issueDate: transaction.issueDate,
      }));

      res.status(200).json({
        success: true,
        issuedBooks: result,
      });
    } catch (error) {
      console.error(error); // Logging the error
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
);
