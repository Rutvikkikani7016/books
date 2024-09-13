import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  totalRent: {
    type: Number,
    default: 0, // Default to 0
  },
  rent: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["Issued", "Returned"],
    default: "Issued",
  }, // Tracks if the book is still issued or returned
});

export const Transaction = mongoose.model("Transaction", transactionSchema);


