import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    books: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    }],
  });
  
export const User = mongoose.model('User', userSchema);
  