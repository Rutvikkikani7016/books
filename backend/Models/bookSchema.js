import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  bookrent: {
    type: Number,
    required: true,
  },
  returnCount: {
    type: Number,
    default: 0, // Default to 0
  },
  totalrent: {
    type: Number,
    default: 0, // Default to 0
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
});

export const Book = mongoose.model('Book', bookSchema);
